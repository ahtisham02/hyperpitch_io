import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import axios from "axios";
import * as LucideIcons from "lucide-react";
import { useCredits } from "../../../utils/creditHelper";
import { PagePreviewRenderer } from "../../ui-components/AdminPage/Campaign/Header";
import sectionApiService from "../../../utils/sectionApiService";
import { generateHtmlHead, generateHtmlFooter } from "../../../utils/htmlGenerator";
import DataTable from "../../ui-components/Table/DataTable";
import FilterDrawer from "../../ui-components/Table/FilterDrawer";

const mockGenerateId = (prefix = "tpl-id") =>
  `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .substring(2, 7)}`;

const SearchAndSelectView = ({ onCancel, onUsersSelected }) => {
  const [filters, setFilters] = useState({
    personName: "",
    jobTitles: [],
    locations: [],
    companies: [],
    employees: [],
    seniorities: [],
    departments: [],
    tags: [],
    technologies: [],
    emailStatus: [],
    buyingIntent: [],
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, per_page: 25, total_entries: 0, total_pages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isConfirmImportModalOpen, setIsConfirmImportModalOpen] = useState(false);
  const token = useSelector((state) => state.auth.userToken);

  const numSelected = Object.keys(rowSelection).length;

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAPICall = useCallback(async (page = 1) => {
    setIsLoading(true);
    if (page === 1) {
      setRowSelection({});
    }

    const employeeRangesMap = { 
      "0-10": "0,10", "11-20": "11,20", "21-50": "21,50", "51-100": "51,100", 
      "101-200": "101,200", "201-500": "201,500", "501-1000": "501,1000", 
      "1001-2000": "1001,2000", "2001-5000": "2001,5000", "5001-10000": "5001,10000", 
      "10001+": "10001,1000000" 
    };

    const params = {
      q_person_name: filters.personName, 
      person_titles: filters.jobTitles.join(","), 
      person_locations: filters.locations.join(","),
      organization_ids: filters.companies.map((company) => company.id).join(","), 
      contact_email_status_v2: filters.emailStatus.map((s) => s.split(" ")[0].toLowerCase()).join(","),
      organization_num_employees_ranges: filters.employees.map((e) => employeeRangesMap[e]).join(","),
      person_seniorities: filters.seniorities.map((s) => s.toLowerCase()).join(","), 
      person_department_or_subdepartments: filters.departments.join(","),
      q_organization_keyword_tags: filters.tags.join(","),
      intent_strengths: filters.buyingIntent.map((s) => s.toLowerCase()).join(","), 
      currently_using_any_of_technology_uids: filters.technologies.join(","), 
      page: page,
    };
    
    Object.keys(params).forEach((key) => (!params[key] || (Array.isArray(params[key]) && params[key].length === 0)) && delete params[key]);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const finalUrlForHistory = `${API_BASE_URL}/search-people?${new URLSearchParams(params).toString()}`;

    try {
      const response = await fetch(finalUrlForHistory, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data?.people || []);
      const newPagination = result.data?.pagination || result.pagination || { page: 1, per_page: 25, total_entries: 0, total_pages: 1 };
      setPagination(newPagination);
      
      if (page === 1) {
        toast.success('Search completed successfully!');
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed. Please try again.");
      setData([]);
      setPagination({ page: 1, per_page: 25, total_entries: 0, total_pages: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [filters, token]);

  const handlePageChange = useCallback((newPage) => {
    handleAPICall(newPage);
  }, [handleAPICall]);

  const handleTriggerSearch = () => {
    handleAPICall(1);
  };

  const handleApplyDrawerFilters = (drawerFilters) => {
    setFilters(drawerFilters);
    handleTriggerSearch();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
      handleTriggerSearch();
    }
  };

  const handleImportSelected = () => {
    const selectedPeople = Object.keys(rowSelection).map((index) => data[parseInt(index, 10)]).filter(Boolean);
    
    if (selectedPeople.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    if (selectedPeople.length > 1) {
      toast.error('Please select only one user for AI generation');
      return;
    }

    const selectedUser = selectedPeople[0];
    onUsersSelected(selectedUser);
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name'
    },
    {
      accessorKey: 'title',
      header: 'Title'
    },
    {
      accessorKey: 'organization.name',
      header: 'Company'
    },
    {
      accessorKey: 'city',
      header: 'Location'
    }
  ];

  const table = {
    getRowModel: () => ({ rows: data.map((row, index) => ({ id: index, original: row, getIsSelected: () => rowSelection[index] || false, getCanSelect: () => true, getIsSomeSelected: () => false, getToggleSelectedHandler: () => () => setRowSelection(prev => ({ ...prev, [index]: !prev[index] })) })) }), 
    getHeaderGroups: () => [{ id: 'header', headers: columns.map((col, index) => ({ id: col.id || col.accessorKey || index, column: { getCanSort: () => false } })) }],
    getIsAllRowsSelected: () => data.length > 0 && Object.keys(rowSelection).length === data.length,
    getIsSomeRowsSelected: () => Object.keys(rowSelection).length > 0 && Object.keys(rowSelection).length < data.length,
    getToggleAllRowsSelectedHandler: () => () => {
      if (Object.keys(rowSelection).length === data.length) {
        setRowSelection({});
      } else {
        const newSelection = {};
        data.forEach((_, index) => { newSelection[index] = true; });
        setRowSelection(newSelection);
      }
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 animate-fadeIn p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              Search & Select Users
            </h2>
            <p className="text-base text-slate-500 mt-2">
              Search for users online and select them to import to your contacts
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Search Command Center</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={filters.personName}
                  onChange={(e) => handleFilterChange('personName', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type name..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={filters.jobTitles.join(',')}
                  onChange={(e) => handleFilterChange('jobTitles', e.target.value.split(',').filter(Boolean))}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., 'Software Engineer'"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={filters.locations.join(',')}
                  onChange={(e) => handleFilterChange('locations', e.target.value.split(',').filter(Boolean))}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., 'San Francisco'"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <LucideIcons.Filter className="w-4 h-4" />
                All Filters
              </button>
              
              <button
                onClick={handleTriggerSearch}
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LucideIcons.Search className="w-4 h-4" />
                )}
                Search
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-700">Search Results</h3>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Filter current results..."
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <span className="text-sm text-slate-600">
                  Selected: {numSelected} of {data.length}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <button
                onClick={handleImportSelected}
                disabled={numSelected === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <LucideIcons.Download className="w-4 h-4" />
                Import Selected
              </button>
            </div>

            <DataTable
              data={data}
              pagination={pagination}
              onPageChange={handlePageChange}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              setSorting={setSorting}
              globalFilter={globalFilter}
              columns={columns}
            />
          </div>
        </div>
      </div>

      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onApplyFilters={handleApplyDrawerFilters}
        currentFilters={filters}
      />
    </>
  );
};

const TopStepperNav = ({ currentStep, steps }) => (
  <nav className="w-full py-4 px-2 md:px-0 mb-6 md:mb-8">
    <ol role="list" className="flex items-center">
      {steps.map((step, stepIdx) => (
        <React.Fragment key={step.id}>
          <li>
            <div className="group flex flex-col items-center text-center p-2 rounded-md transition-colors duration-200">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold border-2 transition-all duration-200 ${
                  currentStep > step.id
                    ? "bg-[#2e8b57] border-green-500 text-white"
                    : ""
                } ${
                  currentStep === step.id
                    ? "bg-[#2e8b57] border-green-600 text-white scale-110 shadow-lg"
                    : ""
                } ${
                  currentStep < step.id
                    ? "bg-slate-200 border-slate-300 text-slate-500"
                    : ""
                }`}
              >
                {currentStep > step.id ? (
                  <LucideIcons.Check size={20} strokeWidth={3} />
                ) : (
                  step.id
                )}
              </span>
              <span
                className={`mt-2 text-xs font-semibold max-w-[60px] sm:max-w-[80px] md:max-w-xs truncate transition-colors duration-200 ${
                  currentStep === step.id ? "text-green-700" : ""
                } ${currentStep > step.id ? "text-slate-700" : ""} ${
                  currentStep < step.id ? "text-slate-500" : ""
                }`}
              >
                {step.name}
              </span>
            </div>
          </li>
          {stepIdx < steps.length - 1 && (
            <div
              className={`flex-auto border-t-2 transition-colors duration-300 ${
                currentStep > step.id ? "border-green-500" : "border-slate-300"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </ol>
  </nav>
);

const StyledButton = ({
  onClick,
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  iconLeft,
  iconRight,
}) => {
  const baseStyle =
    "px-5 !z-0 py-2 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out inline-flex items-center justify-center group transform hover:-translate-y-px active:translate-y-0";
  const greenButton =
    "bg-[#2e8b57] !z-0 hover:bg-green-700 text-white shadow-md hover:shadow-lg focus:ring-green-500 focus:ring-offset-white active:bg-green-800";
  const variantStyles = {
    primary: greenButton,
    secondary:
      "bg-slate-100 !z-0 hover:bg-slate-200 text-slate-700 focus:ring-slate-400 border border-slate-300 hover:border-slate-400 shadow-sm hover:shadow-md active:bg-slate-300 focus:ring-offset-white",
    launch: `${greenButton} text-base px-6 py-2.5`,
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variantStyles[variant]} ${
        disabled ? "opacity-60 cursor-not-allowed saturate-50" : ""
      } ${className}`}
    >
      {iconLeft &&
        React.cloneElement(iconLeft, {
          className:
            "w-4 h-4 mr-1.5 -ml-1 group-hover:scale-105 transition-transform",
        })}
      {children}
      {iconRight &&
        React.cloneElement(iconRight, {
          className:
            "w-4 h-4 ml-1.5 -mr-1 group-hover:translate-x-0.5 transition-transform",
        })}
    </button>
  );
};

const PublishSuccessModal = ({ isOpen, onAddDomain, onClose, onHostPage, isHosting, hostingResult }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyUrl = async () => {
    if (hostingResult?.url) {
      try {
        await navigator.clipboard.writeText(hostingResult.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-800/40 backdrop-blur-sm flex items-center justify-center z-[300] p-4 animate-fadeInModal">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg text-center transform animate-scaleUpModal border border-slate-200">
        <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-100 mb-5 sm:mb-6 ring-4 ring-green-200/70">
          <svg
            className="checkmark h-8 w-8 sm:h-10 sm:w-10 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
          >
            <circle
              className="checkmark__circle"
              cx="26"
              cy="26"
              r="25"
              fill="none"
            />
            <path
              className="checkmark__check"
              fill="none"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          Campaign Saved!
        </h3>
        <p className="text-slate-500 mb-8">
          Your AI-generated campaign has been successfully saved.
        </p>
        
        {hostingResult ? (
          <div className="border-t border-slate-200 pt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center mb-2">
                <LucideIcons.CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                <h4 className="font-semibold text-green-800">Live URL Generated!</h4>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Your campaign is now live and accessible at:
              </p>
              <div className="flex items-center justify-center bg-white border border-green-300 rounded-lg p-3 mb-3">
                <span className="text-sm text-gray-700 font-mono flex-1 text-left truncate mr-2">
                  {hostingResult.url}
                </span>
                <button
                  onClick={handleCopyUrl}
                  className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-md transition-colors"
                  title={copied ? "Copied!" : "Copy URL"}
                >
                  {copied ? (
                    <LucideIcons.Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <LucideIcons.Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <StyledButton onClick={onClose} variant="secondary">
                Close
              </StyledButton>
              <StyledButton onClick={onAddDomain} variant="primary">
                Add Domain
              </StyledButton>
            </div>
          </div>
        ) : (
          <div className="border-t border-slate-200 pt-6">
            <h4 className="font-semibold text-slate-700 mb-1">
              Deploy now?
            </h4>
            <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">
              Get a live URL for your campaign instantly.
            </p>
            <div className="flex justify-center gap-3">
              <StyledButton onClick={onClose} variant="secondary">
                Skip for Now
              </StyledButton>
              <StyledButton 
                onClick={onHostPage} 
                variant="primary"
                disabled={isHosting}
              >
                {isHosting ? (
                  <>
                    <LucideIcons.Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <LucideIcons.Globe className="w-4 h-4 mr-2" />
                    Deploy Live
                  </>
                )}
              </StyledButton>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes fadeInModal {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-fadeInModal {
          animation: fadeInModal 0.15s ease-out forwards;
        }
        @keyframes scaleUpModal {
          0% {
            transform: scale(0.95) translateY(10px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .animate-scaleUpModal {
          animation: scaleUpModal 0.2s cubic-bezier(0.22, 1, 0.36, 1) 0.05s
            forwards;
        }
        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 3;
          stroke-miterlimit: 10;
          stroke: #4ade80;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.3s forwards;
        }
        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          stroke-width: 4;
          stroke: #16a34a;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.7s forwards;
        }
        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default function AIGenerationPage() {
  const navigate = useNavigate();
  const { credits, deductCredits, CAMPAIGN_COST } = useCredits();
  const token = useSelector((state) => state.auth.userToken);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [generatedTemplateData, setGeneratedTemplateData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isHosting, setIsHosting] = useState(false);
  const [hostingResult, setHostingResult] = useState(null);

  const steps = [
    { id: 1, name: "Search & Select User" },
    { id: 2, name: "Preview & Save" },
  ];

  const handleUserSelected = async (userData) => {
    setSelectedUser(userData);
    setIsGenerating(true);
    
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL_AI;
      
      const contactInfo = {
        full_name: userData.name || userData.full_name || "John Doe",
        company: userData.organization?.name || userData.company || "TechCorp",
        email: userData.email || userData.primary_email || "john.doe@techcorp.com"
      };

      const payload = {
        profile_data: {
          full_name: contactInfo.full_name,
          company: contactInfo.company,
          email: contactInfo.email,
          weaknesses: [
            "Limited experience in corporate environments",
            "Need for technical skill diversification", 
            "Limited public portfolio"
          ],
          strengths: [
            "Strong technical foundation",
            "Proven startup leadership",
            "Experience mentoring others"
          ]
        },
        product_name: "Amazon Web Services",
        product_benefits: "Cloud computing, scalable infrastructure, and enterprise-grade solutions",
        campaign_url: "https://aws.amazon.com",
        credly_link: `https://credly.com/users/${contactInfo.full_name.toLowerCase().replace(/\s+/g, '-')}`
      };

      const response = await axios.post(
        `${BASE_URL}/profile/generate-landing-page`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success && response.data.html_content) {
        const pageId = mockGenerateId("page");
        const templateData = {
          pages: {
            [pageId]: {
              id: pageId,
              name: "AI Generated Landing Page",
              layout: [],
              originalHtml: response.data.html_content
            }
          },
          activePageId: pageId,
          globalNavbar: null,
          globalFooter: null,
          pageTitle: "AI Generated Landing Page"
        };

        setGeneratedTemplateData(templateData);
        setCurrentStep(2);
        toast.success("Landing page generated successfully!");
      } else {
        toast.error("Failed to generate landing page. Please try again.");
      }
    } catch (error) {
      console.error("Error generating landing page:", error);
      toast.error(
        error.response?.data?.message || 
        "Failed to generate landing page. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCampaign = async () => {
    if (!selectedUser || !generatedTemplateData) {
      toast.warn("No user selected or template generated.");
      return;
    }

    if (credits < CAMPAIGN_COST) {
      toast.error(
        `Not enough credits. Required: ${CAMPAIGN_COST}, Balance: ${credits}.`
      );
      return;
    }

    setIsSubmitting(true);
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const formData = new FormData();
    formData.append("campaignName", `AI Generated Campaign - ${selectedUser.name || 'User'}`);
    formData.append("startTime", new Date().toISOString());
    formData.append("endTime", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
    formData.append("script", JSON.stringify(generatedTemplateData));

    const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await axios.post(`${BASE_URL}/campaigns`, formData, axiosConfig);
      deductCredits(CAMPAIGN_COST);
      toast.success("AI-generated campaign created successfully!");
      setShowPublishModal(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while saving the campaign."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHostPage = async () => {
    if (!generatedTemplateData) {
      toast.error("No template data available for hosting");
      return;
    }

    setIsHosting(true);
    try {
      const pageKeys = Object.keys(generatedTemplateData.pages || {});
      if (pageKeys.length > 0) {
        const firstPage = generatedTemplateData.pages[pageKeys[0]];
        
        if (firstPage.originalHtml) {
          const htmlContent = firstPage.originalHtml;
          const htmlFile = new File([htmlContent], 'index.html', { type: 'text/html' });
          
          const result = await sectionApiService.hostPage([htmlFile], `AI Generated Campaign - ${selectedUser?.name || 'User'}`, false, 'campaign');
          
          if (result.success) {
            setHostingResult(result);
            toast.success("Campaign deployed successfully!");
          } else {
            toast.error(result.error || "Failed to deploy campaign");
          }
        }
      }
    } catch (error) {
      console.error("Hosting error:", error);
      toast.error(error.response?.data?.error || "Failed to deploy campaign");
    } finally {
      setIsHosting(false);
    }
  };

  const handleCloseModalAndReset = () => {
    setShowPublishModal(false);
    setHostingResult(null);
    navigate("/campaigns");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Search & Select User
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Search for users online and select them to generate a personalized landing page
            </p>
            <SearchAndSelectView
              onCancel={() => navigate("/campaigns")}
              onUsersSelected={handleUserSelected}
            />
          </div>
        );
      case 2:
        return (
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Preview Generated Landing Page
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Review the AI-generated landing page for {selectedUser?.name || 'selected user'}
            </p>
            
            {generatedTemplateData && (
              <div className="border-2 border-slate-200 rounded-lg shadow-inner bg-white min-h-[400px] overflow-x-auto">
                <iframe
                  srcDoc={generatedTemplateData.pages[generatedTemplateData.activePageId]?.originalHtml}
                  className="w-full h-full border-0"
                  style={{ minHeight: '600px' }}
                  title="Generated Landing Page Preview"
                />
              </div>
            )}

            <div className="mt-8 pt-5 border-t border-slate-200/80 flex justify-between items-center">
              <StyledButton
                onClick={() => setCurrentStep(1)}
                variant="secondary"
                iconLeft={<LucideIcons.ArrowLeft />}
              >
                Back
              </StyledButton>
              <StyledButton
                onClick={handleSaveCampaign}
                variant="launch"
                iconLeft={
                  isSubmitting ? (
                    <LucideIcons.Loader2 className="animate-spin" />
                  ) : (
                    <LucideIcons.Save />
                  )
                }
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Campaign"}
              </StyledButton>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-100 text-slate-800">
        <main className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl mr-4 shrink-0">
                <LucideIcons.Sparkles
                  className="w-8 h-8 text-green-600"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                  AI Campaign Generation
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Let AI create a personalized landing page for your selected user.
                </p>
              </div>
            </div>
          </div>
          
          <TopStepperNav currentStep={currentStep} steps={steps} />
          {renderStepContent()}
        </main>
        
        <PublishSuccessModal
          isOpen={showPublishModal}
          onAddDomain={() => {
            setShowPublishModal(false);
            setHostingResult(null);
            navigate("/domains");
          }}
          onClose={handleCloseModalAndReset}
          onHostPage={handleHostPage}
          isHosting={isHosting}
          hostingResult={hostingResult}
        />
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
}
