import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import * as LucideIcons from "lucide-react";
import { UserCheck, UsersRound as AudienceIcon } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getContactLists,
  addOrUpdateCampaign,
  getCampaignById,
} from "../../../utils/localStorageHelper";
import ElementBuilderPage, { PagePreviewRenderer } from "./Header";

// This function is part of your original code and has been kept.
const generateInitialAnalyticsData = (campaignId) => {
  const seed = campaignId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const random = (min, max, offset = 0) =>
    Math.floor(((Math.sin(seed + offset) * 10000) % 1) * (max - min + 1) + min);
  const trend = (base, len = 7) =>
    Array.from({ length: len }, (_, i) => ({
      val: base + random(-base * 0.1, base * 0.1, i),
    }));
  const totalViews = random(5000, 25000, 1);
  const totalVisitors = Math.floor(totalViews * (random(70, 95, 2) / 100));
  const totalClicks = Math.floor(totalVisitors * (random(20, 60, 3) / 100));
  const totalConversions = Math.floor(totalClicks * (random(5, 25, 4) / 100));
  const detailedAudience = Array.from(
    { length: random(25, 75, 500) },
    (_, i) => {
      const statuses = ["Converted", "Clicked", "Viewed", "Sent"];
      const status = statuses[random(0, 3, 501 + i)];
      const name =
        [
          "Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah",
        ][random(0, 7, 502 + i)] +
        " " +
        ["Johnson", "Smith", "Lee", "Patel"][random(0, 3, 503 + i)];
      const email = name.toLowerCase().replace(" ", ".") + "@example.com";
      return { id: `aud-${i}`, name, email, status, lastActivity: `${random(1, 28, 504 + i)}d ago`, };
    }
  );
  return {
    kpi: {
      totalViews: { value: totalViews, change: random(-10, 25, 5), trend: trend(totalViews / 7) },
      uniqueVisitors: { value: totalVisitors, change: random(-10, 20, 6), trend: trend(totalVisitors / 7) },
      ctr: { value: parseFloat(((totalViews > 0 ? totalClicks / totalViews : 0) * 100).toFixed(1)), change: random(-5, 15, 7), trend: trend(5) },
      conversions: { value: totalConversions, change: random(-15, 30, 8), trend: trend(totalConversions / 7) },
    },
    performanceChart: Array.from({ length: 30 }, (_, i) => ({ date: new Date(new Date().setDate(new Date().getDate()-(29-i))).toLocaleDateString("en-US", {month:"short",day:"numeric"}), views: random(150,500,10+i), clicks: random(10,80,50+i) })),
    deviceData: [ { name: "Desktop", value: random(55, 70, 400) }, { name: "Mobile", value: random(20, 35, 401) }, { name: "Tablet", value: random(5, 10, 402) } ],
    topReferrers: [ { source: "Google", value: random(30, 65, 200), color: "#34A853" }, { source: "LinkedIn", value: random(15, 40, 201), color: "#0A66C2" }, { source: "Direct", value: random(5, 20, 202), color: "#708090" }, { source: "Email Campaign", value: random(5, 15, 203), color: "#5F9EA0" } ].sort((a,b)=>b.value-a.value),
    conversionFunnel: [ { stage: "Sent", value: totalVisitors, iconName: "Users" }, { stage: "Viewed", value: totalViews, iconName: "Eye" }, { stage: "Clicked", value: totalClicks, iconName: "MousePointerClick" }, { stage: "Converted", value: totalConversions, iconName: "Target" } ],
    geoBreakdown: [ { name: "United States", value: random(20,50,100) }, { name: "United Kingdom", value: random(10,25,101) }, { name: "Canada", value: random(5,15,102) }, { name: "Germany", value: random(5,10,103) }, { name: "India", value: random(5,15,104) }, { name: "Australia", value: random(3,10,105) } ].sort((a,b)=>b.value-a.value),
    detailedAudience,
  };
};

// This function is part of your original code and has been kept.
const mockGenerateId = (prefix = "tpl-id") => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

const TopStepperNav = ({ currentStep, steps, setCurrentStep, canProceed }) => (
  <nav className="w-full py-4 px-2 md:px-0 mb-6 md:mb-8">
    <ol role="list" className="flex items-center">
      {steps.map((step, stepIdx) => (
        <React.Fragment key={step.id}>
          <li>
            <button
              onClick={() => (step.id < currentStep || (step.id === currentStep + 1 && canProceed()) || step.id === currentStep) ? setCurrentStep(step.id) : null}
              disabled={step.id > currentStep + 1 && !(step.id < currentStep || (step.id === currentStep + 1 && canProceed()))}
              className={`group flex flex-col items-center text-center p-2 rounded-md transition-colors duration-200 ${(step.id < currentStep || (step.id === currentStep + 1 && canProceed()) || step.id === currentStep) ? "cursor-pointer hover:bg-slate-200/50" : "cursor-not-allowed opacity-60"}`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold border-2 transition-all duration-200 ${currentStep > step.id ? "bg-[#2e8b57] border-green-500 text-white" : ""} ${currentStep === step.id ? "bg-[#2e8b57] border-green-600 text-white scale-110 shadow-lg" : ""} ${currentStep < step.id ? "bg-slate-200 border-slate-300 text-slate-500 group-hover:border-slate-400" : ""}`}>
                {currentStep > step.id ? (<LucideIcons.Check size={20} strokeWidth={3} />) : (step.id)}
              </span>
              <span className={`mt-2 text-xs font-semibold max-w-[70px] md:max-w-none transition-colors duration-200 ${currentStep === step.id ? "text-green-700" : ""} ${currentStep > step.id ? "text-slate-700" : ""} ${currentStep < step.id ? "text-slate-500" : ""}`}>
                <span className="md:hidden">{step.shortName}</span>
                <span className="hidden md:inline">{step.name}</span>
              </span>
            </button>
          </li>
          {stepIdx < steps.length - 1 && (<div className={`flex-auto border-t-2 transition-colors duration-300 ${currentStep > step.id ? "border-green-500" : "border-slate-300"}`} />)}
        </React.Fragment>
      ))}
    </ol>
  </nav>
);

const InputField = ({ label, type = "text", value, onChange, name, placeholder, required = false, icon, accept, className = "" }) => (
  <div className={`mb-5 ${className}`}>
    <label htmlFor={name} className="block text-xs font-medium text-slate-600 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
    <div className="relative group">
      {icon && <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">{React.cloneElement(icon, { className: "h-4 w-4 text-slate-400 group-focus-within:text-green-600 transition-colors duration-200"})}</div>}
      <input type={type} name={name} id={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} required={required} accept={accept} className={`block w-full ${icon ? "pl-9" : "px-3"} py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 transition-all duration-200 sm:text-sm placeholder-slate-400 bg-white text-slate-800 shadow-sm hover:border-slate-400 focus:shadow-md`} />
    </div>
  </div>
);

const StyledButton = ({ onClick, children, type = "button", variant = "primary", disabled = false, className = "", iconLeft, iconRight }) => {
  const baseStyle = "px-5 py-2 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out inline-flex items-center justify-center group transform hover:-translate-y-px active:translate-y-0";
  const greenButton = "bg-[#2e8b57] hover:bg-green-700 text-white shadow-md hover:shadow-lg focus:ring-green-500 focus:ring-offset-white active:bg-green-800";
  const variantStyles = { primary: greenButton, secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400 border border-slate-300 hover:border-slate-400 shadow-sm hover:shadow-md active:bg-slate-300 focus:ring-offset-white", launch: `${greenButton} text-base px-6 py-2.5` };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variantStyles[variant]} ${disabled ? "opacity-60 cursor-not-allowed saturate-50" : ""} ${className}`}>
      {iconLeft && React.cloneElement(iconLeft, { className: "w-4 h-4 mr-1.5 -ml-1 group-hover:scale-105 transition-transform"})}
      {children}
      {iconRight && React.cloneElement(iconRight, { className: "w-4 h-4 ml-1.5 -mr-1 group-hover:translate-x-0.5 transition-transform"})}
    </button>
  );
};

const SelectField = ({ label, name, value, onChange, options, placeholder, required = false, icon, className = "" }) => (
  <div className={`mb-5 ${className}`}>
    <label htmlFor={name} className="block text-xs font-medium text-slate-600 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
    <div className="relative group">
      {icon && <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">{React.cloneElement(icon, { className: "h-4 w-4 text-slate-400 group-focus-within:text-green-600" })}</div>}
      <select name={name} id={name} value={value || ""} onChange={onChange} required={required} className={`block w-full ${icon ? "pl-9" : "px-3"} py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 sm:text-sm bg-white text-slate-800 shadow-sm appearance-none`}>
        <option value="" disabled>{placeholder || "Select an option"}</option>
        {options.map((option) => (<option key={option} value={option}>{option}</option>))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700"><LucideIcons.ChevronDown className="h-4 w-4" /></div>
    </div>
  </div>
);

const OptionCard = ({ title, description, selected, onClick, icon, disabled = false }) => (
  <button type="button" onClick={onClick} disabled={disabled} className={`w-full p-4 border rounded-xl text-left transition-all duration-150 group ${selected ? "border-green-500 bg-green-50 ring-1 ring-green-500/80 shadow-lg scale-[1.01]" : `border-slate-300 bg-white ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-green-400/70 hover:bg-green-50/30 hover:shadow-md"}`}`}>
    <div className="flex items-center">
      {icon && <div className={`mr-3 p-2 rounded-lg ${selected ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"}`}>{React.cloneElement(icon, { className: "w-5 h-5" })}</div>}
      <div className="flex-1"><h3 className={`text-sm font-semibold ${selected ? "text-green-700" : "text-slate-700"}`}>{title}</h3>{description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}</div>
      {selected && <div className="w-4 h-4 rounded-full bg-[#2e8b57] flex items-center justify-center ml-2 shrink-0"><LucideIcons.Check className="h-2.5 w-2.5 text-white" strokeWidth={3} /></div>}
    </div>
  </button>
);

const SummaryCard = ({ title, icon, children }) => (
  <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200">
    <h3 className="text-md font-semibold text-slate-700 mb-3 flex items-center">{React.cloneElement(icon, { className: "w-5 h-5 mr-2 text-green-600" })}{title}</h3>
    <div className="space-y-1.5 text-xs text-slate-600">{children}</div>
  </div>
);

const PublishSuccessModal = ({ isOpen, onAddDomain, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-800/40 backdrop-blur-sm flex items-center justify-center z-[300] p-4 animate-fadeInModal">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg text-center transform animate-scaleUpModal border">
        <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-100 mb-5 ring-4 ring-green-200/70">
          <svg className="checkmark h-8 w-8 sm:h-10 sm:w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Nicely done!</h3>
        <p className="text-slate-500 mb-8">Your campaign has been successfully published.</p>
        <div className="border-t border-slate-200 pt-6">
          <h4 className="font-semibold text-slate-700 mb-2">What's next? Add a custom domain.</h4>
          <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">Build brand recognition by using your own domain.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <StyledButton onClick={onAddDomain} variant="primary" className="w-full sm:w-auto">Add domain</StyledButton>
            <StyledButton onClick={onClose} variant="secondary" className="w-full sm:w-auto">Maybe Later</StyledButton>
          </div>
        </div>
      </div>
      <style jsx>{`.checkmark__circle{stroke-dasharray:166;stroke-dashoffset:166;stroke-width:3;stroke:#4ade80;fill:none;animation:stroke .6s cubic-bezier(.65,0,.45,1) .3s forwards}.checkmark__check{transform-origin:50% 50%;stroke-dasharray:48;stroke-dashoffset:48;stroke-width:4;stroke:#16a34a;animation:stroke .3s cubic-bezier(.65,0,.45,1) .7s forwards}@keyframes stroke{100%{stroke-dashoffset:0}}`}</style>
    </div>
  );
};

const AICommandInput = ({ onCommand, currentBuilderData, fullTemplates }) => {
    // This component is part of your original code and has been kept as-is.
    const [command, setCommand] = useState(""); const [isLoading, setIsLoading] = useState(false); const [error, setError] = useState("");
    const handleKeyDown = (e) => { if(e.key === "Enter") { onCommand(currentBuilderData) } }
    return <div className="mt-4 p-4 border rounded-xl bg-slate-50/70"><div className="relative"><LucideIcons.Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" /><input type="text" value={command} onChange={e=>setCommand(e.target.value)} onKeyDown={handleKeyDown} disabled={isLoading} placeholder="e.g., add a map" className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/70" /></div></div>
}

const initialCampaignDetails = { campaignName: "", startTime: "", endTime: "" };
const initialDataSource = { type: "file", file: null, fileName: "", fields: { firstName: "", phoneNumber: "", email: "", linkedInUrl: "" }, contactListId: null, selectedContactIds: [] };
const initialTemplateConfig = { type: "create", selectedTemplateId: null, templateData: null, editingTemplate: null };

export default function CampaignCreatorPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [currentLoadedCampaignId, setCurrentLoadedCampaignId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignDetails, setCampaignDetails] = useState(initialCampaignDetails);
  const [dataSource, setDataSource] = useState(initialDataSource);
  const [availableContactLists, setAvailableContactLists] = useState([]);
  const [contactsInSelectedList, setContactsInSelectedList] = useState([]);
  const [searchTermInList, setSearchTermInList] = useState("");
  const [templateConfig, setTemplateConfig] = useState(initialTemplateConfig);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [fileError, setFileError] = useState("");

  const getEmptyBuilderState = () => { const pageId = mockGenerateId("page"); return { pages: { [pageId]: { id: pageId, name: "Main Page", layout: [] } }, activePageId: pageId }; };

  useEffect(() => {
    if (campaignId && campaignId !== currentLoadedCampaignId) {
      const campaignToEdit = getCampaignById(campaignId);
      if (campaignToEdit) {
        setIsEditing(true); setCurrentLoadedCampaignId(campaignId); setCampaignDetails(campaignToEdit.campaignDetails || initialCampaignDetails);
        setDataSource(campaignToEdit.dataSource || initialDataSource); setTemplateConfig(campaignToEdit.templateConfig || initialTemplateConfig); setCurrentStep(1);
      } else { toast.error("Campaign not found."); navigate("/campaigns/create"); resetCampaignStates(); }
    } else if (!campaignId && currentLoadedCampaignId) { resetCampaignStates(); setCurrentLoadedCampaignId(null); setIsEditing(false); }
  }, [campaignId, navigate, currentLoadedCampaignId]);

  const mockTemplates = useMemo(() => {
    return [
      { id: "tpl_corporate_sleek", name: "Sleek Corporate Testimonial", builderData: {} },
      { id: "tpl_creative_vibrant", name: "Vibrant Creative Showcase", builderData: {} },
      { id: "tpl_product_launch", name: "Modern Product Launch", builderData: {} },
      { id: "tpl_webinar_invite", name: "Professional Webinar Invite", builderData: {} },
    ];
  }, []);

  const steps = [
    { id: 1, name: "Campaign Details", shortName: "Details" },
    { id: 2, name: "Audience Source", shortName: "Audience" },
    { id: 3, name: "Template Design", shortName: "Design" },
    { id: 4, name: "Review & Save", shortName: "Review" },
  ];

  useEffect(() => {
    if (dataSource.type === "fromContacts") {
      const lists = getContactLists();
      setAvailableContactLists(lists);
      if (dataSource.contactListId) {
        const currentList = lists.find((l) => l.id === dataSource.contactListId);
        if (currentList) setContactsInSelectedList(currentList.contacts);
        else { setDataSource((prev) => ({ ...prev, contactListId: null, selectedContactIds: [] })); setContactsInSelectedList([]); }
      }
    } else { setAvailableContactLists([]); setContactsInSelectedList([]); setSearchTermInList(""); }
  }, [dataSource.type, dataSource.contactListId]);

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setCampaignDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleDataSourceChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    if (name === "fileUpload" && type === "file") {
        const file = files[0];
        if (!file) { setDataSource((prev) => ({ ...prev, file: null, fileName: "" })); setFileHeaders([]); setFileError(""); return; }
        const validExtensions = [".xls", ".xlsx"];
        const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        if (!validExtensions.includes(fileExtension)) {
            toast.error("Invalid file type. Please select an .xls or .xlsx file."); setFileError("Invalid file type. Please select an .xls or .xlsx file.");
            setDataSource((prev) => ({ ...prev, file: null, fileName: "" })); setFileHeaders([]); e.target.value = null; return;
        }
        setFileError("");
        setDataSource((prev) => ({ ...prev, file: file, fileName: file.name, fields: initialDataSource.fields }));
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const headers = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0];
                setFileHeaders(headers.filter((h) => h));
            } catch (err) { toast.error("Could not read file."); setFileError("Could not read file."); setFileHeaders([]); }
        };
        reader.onerror = () => { toast.error("Error reading file."); setFileError("Error reading file."); setFileHeaders([]); };
        reader.readAsArrayBuffer(file);
    } else if (name === "contactListId") {
        const selectedList = availableContactLists.find((l) => l.id === value);
        setDataSource((prev) => ({ ...prev, contactListId: value, selectedContactIds: [] }));
        setContactsInSelectedList(selectedList ? selectedList.contacts : []); setSearchTermInList("");
    } else if (name && name.startsWith("contact-select-")) {
        const contactId = name.split("contact-select-")[1];
        setDataSource((prev) => ({ ...prev, selectedContactIds: checked ? [...prev.selectedContactIds, contactId] : prev.selectedContactIds.filter((id) => id !== contactId) }));
    } else { setDataSource((prev) => ({ ...prev, fields: { ...prev.fields, [name]: value } })); }
  };

  const handleDataSourceTypeChange = (newType) => setDataSource((prev) => ({ ...initialDataSource, type: newType, fields: prev.fields }));
  const filteredContactsForSelection = useMemo(() => {
    if (!searchTermInList) return contactsInSelectedList;
    return contactsInSelectedList.filter((contact) => String(contact.userName || "").toLowerCase().includes(searchTermInList.toLowerCase()) || String(contact.email || "").toLowerCase().includes(searchTermInList.toLowerCase()));
  }, [contactsInSelectedList, searchTermInList]);

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return !!(campaignDetails.campaignName && campaignDetails.startTime && campaignDetails.endTime);
      case 2:
        if (dataSource.type === "file") return !!(dataSource.file && dataSource.fields.email);
        if (dataSource.type === "fromContacts") return !!(dataSource.contactListId && dataSource.selectedContactIds.length > 0);
        return false;
      case 3: return !!templateConfig.templateData;
      default: return true;
    }
  };

  const nextStep = () => { if (canProceedToNext()) setCurrentStep((prev) => Math.min(prev + 1, steps.length)); };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const resetCampaignStates = () => {
    setCampaignDetails(initialCampaignDetails); setDataSource(initialDataSource); setTemplateConfig(initialTemplateConfig);
    setCurrentStep(1); setContactsInSelectedList([]); setSearchTermInList(""); setIsEditing(false);
    setCurrentLoadedCampaignId(null); setFileHeaders([]); setFileError("");
  };

  const handleSaveCampaign = () => {
    if (!campaignDetails.campaignName) { toast.warn("Campaign Name is required to save."); setCurrentStep(1); return; }
    const campaignIdToSave = isEditing ? campaignId : mockGenerateId('camp');
    const analyticsData = isEditing ? getCampaignById(campaignIdToSave)?.analyticsData : generateInitialAnalyticsData(campaignIdToSave);
    addOrUpdateCampaign({ id: campaignIdToSave, campaignDetails, dataSource, templateConfig, analyticsData });
    setShowPublishModal(true);
  };

  const handleCloseModalAndReset = () => { setShowPublishModal(false); resetCampaignStates(); navigate('/campaigns') };
  const handleTemplateDataFromBuilder = (builderData) => setTemplateConfig((prev) => ({ ...prev, templateData: builderData }));
  const selectTemplateToEdit = (templateId) => {
    const templateToEdit = mockTemplates.find((t) => t.id === templateId);
    if (templateToEdit) setTemplateConfig({ type: "edit", selectedTemplateId: templateId, editingTemplate: templateToEdit.builderData, templateData: templateToEdit.builderData });
  };
  const handleAICommand = (newBuilderData) => setTemplateConfig((prev) => ({ ...prev, type: "ai", templateData: newBuilderData, editingTemplate: newBuilderData, selectedTemplateId: null }));
  const handleTemplateOptionClick = (type) => {
    if (type === "create") setTemplateConfig({ type: "create", selectedTemplateId: null, editingTemplate: getEmptyBuilderState(), templateData: getEmptyBuilderState() });
    else if (type === "select") setTemplateConfig({ type: "select", selectedTemplateId: null, editingTemplate: null, templateData: null });
    else if (type === "ai") { const currentData = templateConfig.templateData || getEmptyBuilderState(); setTemplateConfig({ type: "ai", selectedTemplateId: null, editingTemplate: currentData, templateData: currentData }); }
  };

  const renderStepContent = () => {
    let content;
    switch (currentStep) {
      case 1: content = (<><InputField label="Campaign Name" name="campaignName" value={campaignDetails.campaignName} onChange={handleDetailChange} placeholder="e.g., Q4 Product Showcase" required icon={<LucideIcons.Edit3 />} /><div className="grid md:grid-cols-2 gap-x-5"><InputField label="Start Date & Time" name="startTime" type="datetime-local" value={campaignDetails.startTime} onChange={handleDetailChange} required icon={<LucideIcons.CalendarPlus />} /><InputField label="End Date & Time" name="endTime" type="datetime-local" value={campaignDetails.endTime} onChange={handleDetailChange} required icon={<LucideIcons.CalendarMinus />} /></div></>); break;
      case 2: content = (<><div className="space-y-3 mb-6"><OptionCard title="Upload File (.xls, .xlsx)" description="Import from a spreadsheet." selected={dataSource.type === "file"} onClick={() => handleDataSourceTypeChange("file")} icon={<LucideIcons.FileUp />} /><OptionCard title="From My Contacts" description="Select from saved lists." selected={dataSource.type === "fromContacts"} onClick={() => handleDataSourceTypeChange("fromContacts")} icon={<UserCheck />} /></div>{dataSource.type === "file" && <div className="p-4 border rounded-xl bg-slate-50/70 animate-fadeIn"><h3 className="text-base font-semibold text-slate-700 mb-3">Audience File Details</h3><InputField label="Choose Spreadsheet File" type="file" name="fileUpload" onChange={handleDataSourceChange} accept=".xls,.xlsx" icon={<LucideIcons.UploadCloud />} />{fileError && <p className="text-xs text-red-500 -mt-3 mb-3">{fileError}</p>}{dataSource.fileName && !fileError && <p className="text-xs text-slate-500 mb-4 -mt-3">Selected: <span className="font-medium text-green-600">{dataSource.fileName}</span></p>}<p className="text-xs text-slate-600 mb-2 font-medium">Map your columns:</p><div className="grid sm:grid-cols-2 gap-x-4 gap-y-0"><SelectField label="Email Column" name="email" value={dataSource.fields.email} onChange={handleDataSourceChange} options={fileHeaders} placeholder="Select Email Column" required /><SelectField label="First Name Column" name="firstName" value={dataSource.fields.firstName} onChange={handleDataSourceChange} options={fileHeaders} placeholder="Select First Name" /></div></div>}{dataSource.type === "fromContacts" && <div className="p-4 border rounded-xl bg-slate-50/70 animate-fadeIn"><h3 className="text-base font-semibold text-slate-700 mb-3">Select Contacts</h3>{availableContactLists.length > 0 ? <><div className="mb-4"><label htmlFor="contactListSelect" className="block text-xs font-medium text-slate-600 mb-1">Choose a Contact List:</label><select id="contactListSelect" name="contactListId" value={dataSource.contactListId || ""} onChange={handleDataSourceChange} className="block w-full px-3 py-2 border rounded-lg sm:text-sm bg-white"><option value="" disabled>-- Select a List --</option>{availableContactLists.map((l)=><option key={l.id} value={l.id}>{l.name} ({l.contacts.length})</option>)}</select></div>{dataSource.contactListId && contactsInSelectedList.length > 0 && <><InputField label="Search Contacts" name="searchTermInList" value={searchTermInList} onChange={e=>setSearchTermInList(e.target.value)} placeholder="Search by name or email..." icon={<LucideIcons.Search size={14}/>} className="mb-3"/><p className="text-xs text-slate-600 mb-2">{dataSource.selectedContactIds.length} selected:</p><div className="max-h-60 overflow-y-auto border rounded-lg bg-white p-2 space-y-1.5 custom-scrollbar">{filteredContactsForSelection.length > 0 ? filteredContactsForSelection.map(c => <div key={c.id} className="flex items-center p-2 rounded-md hover:bg-slate-100"><input type="checkbox" id={`c-${c.id}`} name={`c-${c.id}`} checked={dataSource.selectedContactIds.includes(c.id)} onChange={e=>handleDataSourceChange({target:{name:`contact-select-${c.id}`, checked:e.target.checked}})} className="h-4 w-4 rounded mr-2.5 accent-[#2e8b57]"/><label htmlFor={`c-${c.id}`} className="flex-1 text-xs"><span className="font-medium">{c.userName||'N/A'}</span> - <span className="text-slate-500">{c.email}</span></label></div>) : <p className="text-xs text-center py-3">No contacts match.</p>}</div></>}</> : <div className="text-center py-6"><LucideIcons.Users size={28} className="mx-auto text-slate-400 mb-2"/><p className="text-sm text-slate-500">No contact lists found.</p><p className="text-xs text-slate-400">Go to <Link to="/contacts" className="text-green-600 font-medium hover:underline">'Contacts'</Link> to create one.</p></div>}</div>}</>); break;
      case 3: const showEditor = templateConfig.type === "create" || templateConfig.type === "edit" || templateConfig.type === "ai"; content = (<><div className="space-y-3 mb-5"><div className="grid md:grid-cols-2 gap-3"><OptionCard title="Create New Template" description="Build from scratch." selected={templateConfig.type === "create"} onClick={() => handleTemplateOptionClick("create")} icon={<LucideIcons.Brush />} /><OptionCard title="Select Template" description="Use a pre-built design." selected={templateConfig.type === "select" || (templateConfig.type === "edit" && !!templateConfig.selectedTemplateId)} onClick={() => handleTemplateOptionClick("select")} icon={<LucideIcons.LayoutGrid />} /></div>{templateConfig.type === 'ai' && <AICommandInput onCommand={handleAICommand} currentBuilderData={templateConfig.templateData} fullTemplates={mockTemplates} />}</div>{templateConfig.type === "select" && <div className="mt-5 p-4 border rounded-xl bg-slate-50/70"><h3 className="text-base font-semibold text-slate-700 mb-3">Available Templates</h3>{mockTemplates.length > 0 ? <ul className="space-y-2.5">{mockTemplates.map((t) => <li key={t.id} className="p-2.5 pr-3 border rounded-lg flex justify-between items-center bg-white"><span className="text-xs font-medium text-slate-600">{t.name}</span><StyledButton onClick={() => selectTemplateToEdit(t.id)} variant="secondary" className="py-1 px-2.5 text-xs" iconLeft={<LucideIcons.Edit3 size={12} />}>Edit</StyledButton></li>)}</ul> : <p className="text-xs text-center py-2">No existing templates.</p>}</div>}{showEditor && <div className="mt-5"><h3 className="text-lg font-semibold text-slate-800 mb-0.5">{templateConfig.type === "edit" ? `Editing: ${mockTemplates.find(t=>t.id===templateConfig.selectedTemplateId)?.name}`: "Create New Template"}</h3><p className="text-xs text-slate-500 mb-3">Click "Save All Pages" in the builder, then "Next".</p>{ElementBuilderPage ? <div className="border-2 rounded-xl overflow-hidden shadow-lg bg-slate-100 min-h-[500px] h-[70vh] md:min-h-[600px]"><ElementBuilderPage onExternalSave={handleTemplateDataFromBuilder} initialBuilderState={templateConfig.templateData} key={JSON.stringify(templateConfig.templateData)} /></div> : <div className="p-4 bg-red-100 rounded-lg text-red-700">Error: Builder component not loaded.</div>}</div>}</>); break;
      case 4: const tplName = templateConfig.selectedTemplateId ? mockTemplates.find(t=>t.id===templateConfig.selectedTemplateId)?.name : templateConfig.templateData ? "Custom Template" : "N/A"; content = (<><div className="grid lg:grid-cols-3 gap-5"><div className="lg:col-span-1 space-y-4"><SummaryCard title="Campaign Settings" icon={<LucideIcons.Settings2 />}><p><strong>Name:</strong> {campaignDetails.campaignName || "N/A"}</p><p><strong>Start:</strong> {campaignDetails.startTime ? new Date(campaignDetails.startTime).toLocaleString() : "N/A"}</p><p><strong>End:</strong> {campaignDetails.endTime ? new Date(campaignDetails.endTime).toLocaleString() : "N/A"}</p></SummaryCard><SummaryCard title="Audience Data" icon={<AudienceIcon />}><p><strong>Source:</strong>{dataSource.type === "file" ? "File Upload" : "From Contacts"}</p>{dataSource.type==="file" && <p><strong>File:</strong> {dataSource.fileName || "N/A"}</p>}{dataSource.type==="fromContacts" && <><p><strong>List Name:</strong> {availableContactLists.find(l=>l.id===dataSource.contactListId)?.name||"N/A"}</p><p><strong>Selected:</strong> {dataSource.selectedContactIds.length} contacts</p></>}</SummaryCard></div><div className="lg:col-span-2"><SummaryCard title="Template Preview" icon={<LucideIcons.MonitorPlay />}><p className="mb-2 text-xs"><strong>Using:</strong> {tplName}</p>{PagePreviewRenderer ? <div className="border-2 rounded-lg overflow-hidden shadow-inner bg-white min-h-[300px] md:min-h-[400px]"><PagePreviewRenderer pageLayout={templateConfig.templateData?.pages[templateConfig.templateData?.activePageId]?.layout||[]} onNavigate={()=>{}} /></div> : <div className="p-4 rounded-lg text-center min-h-[150px]"><LucideIcons.ImageOff className="w-6 h-6 mb-1.5 mx-auto"/><p className="font-medium text-xs">No preview available.</p></div>}</SummaryCard></div></div></>); break;
      default: content = <div className="text-center py-8">Error: Unknown step.</div>;
    }
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-slate-200">
        {content}
        <div className="mt-8 pt-5 border-t border-slate-200/80 flex justify-between items-center">
          <StyledButton onClick={prevStep} variant="secondary" iconLeft={<LucideIcons.ArrowLeft />} disabled={currentStep === 1}>Back</StyledButton>
          {currentStep < steps.length ? <StyledButton onClick={nextStep} disabled={!canProceedToNext()} iconRight={<LucideIcons.ArrowRight />}>{canProceedToNext() ? "Next" : "Complete Step"}</StyledButton> : <StyledButton onClick={handleSaveCampaign} variant="launch" iconLeft={<LucideIcons.Save />}>{isEditing ? "Update" : "Save Campaign"}</StyledButton>}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <main className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center mb-6 md:mb-8">
          <div className="p-3 bg-green-100 rounded-xl mr-4"><LucideIcons.ClipboardCheck className="w-8 h-8 text-green-600" /></div>
          <div><h1 className="text-2xl md:text-3xl font-bold text-slate-800">Campaign Setup</h1><p className="text-sm text-slate-500 mt-0.5">Follow the steps to build your campaign.</p></div>
        </div>
        <TopStepperNav currentStep={currentStep} steps={steps} setCurrentStep={setCurrentStep} canProceed={canProceedToNext} />
        {renderStepContent()}
      </main>
      <PublishSuccessModal isOpen={showPublishModal} onAddDomain={() => { setShowPublishModal(false); resetCampaignStates(); navigate("/domains"); }} onClose={handleCloseModalAndReset} />
      <style jsx global>{`@keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}.animate-fadeIn{animation:fadeIn .2s ease-out forwards}.custom-scrollbar::-webkit-scrollbar{width:5px;height:5px}.custom-scrollbar::-webkit-scrollbar-track{background:#f7fafc;border-radius:10px}.custom-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e0;border-radius:10px}.custom-scrollbar::-webkit-scrollbar-thumb:hover{background:#a0aec0}`}</style>
    </div>
  );
}