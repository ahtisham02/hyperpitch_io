import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import getapiRequest from "../../../utils/getapiRequest";
import DataTable from "../../../ui-components/Table/DataTable";
import FilterDrawer from "../../../ui-components/Table/FilterDrawer";
import AsyncMultiSelect from "../../../ui-components/Table/AsyncMultiSelect";
import FilterInput from "../../../ui-components/Table/FilterInput";
import IntentTopicModal from "../../../ui-components/Modal/IntentTopicModal";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";


const styles = `
  @keyframes fadeInModal {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleUpModal {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeInModal {
    animation: fadeInModal 0.2s ease-out;
  }
  
  .animate-scaleUpModal {
    animation: scaleUpModal 0.2s ease-out;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  name,
  placeholder,
  required = false,
  icon,
  accept,
  className = "",
  readOnly = false,
  onKeyDown,
}) => (
  <div className={`mb-4 ${className}`}>
    <label
      htmlFor={name}
      className="block text-xs font-semibold text-slate-600 mb-1.5"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
          {React.cloneElement(icon, {
            className:
              "h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-200",
          })}
        </div>
      )}
      <input
        type={type}
        name={name}
        id={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        accept={accept}
        readOnly={readOnly}
        onKeyDown={onKeyDown}
        className={`block w-full ${
          icon ? "pl-10" : "px-3"
        } py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 sm:text-sm placeholder-slate-400 bg-white text-slate-800 shadow-sm hover:border-slate-400 focus:shadow-md ${
          readOnly ? "bg-slate-100 cursor-not-allowed" : ""
        }`}
      />
    </div>
  </div>
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
  size = "medium",
}) => {
  const baseStyle =
    "rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out inline-flex items-center justify-center group transform hover:-translate-y-px active:translate-y-0 shadow-sm";
  const sizeStyles = {
    small: "px-3 py-1.5 text-xs",
    medium: "px-5 py-2.5 text-sm",
    large: "px-6 py-3 text-base",
  };
  const greenButton =
    "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 focus:ring-emerald-500";
  const variantStyles = {
    primary: greenButton,
    secondary:
      "bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-400 border border-slate-300 hover:border-slate-400 active:bg-slate-100",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 focus:ring-red-500",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${
        disabled ? "opacity-60 cursor-not-allowed saturate-50 !shadow-none" : ""
      } ${className}`}
    >
      {iconLeft &&
        React.cloneElement(iconLeft, {
          className: `w-4 h-4 ${size === "small" ? "mr-1.5" : "mr-2"} ${
            size !== "small" ? "-ml-1" : ""
          } group-hover:scale-105 transition-transform`,
        })}
      {children}
      {iconRight &&
        React.cloneElement(iconRight, {
          className: `w-4 h-4 ${size === "small" ? "ml-1.5" : "ml-2"} ${
            size !== "small" ? "-mr-1" : ""
          } group-hover:translate-x-0.5 transition-transform`,
        })}
    </button>
  );
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[250] p-4 animate-fadeInModal">
      <div
        className={`bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-150 ease-out animate-scaleUpModal border border-slate-200`}
      >
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <LucideIcons.AlertTriangle
              className="h-6 w-6 text-red-600"
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3
              className="text-lg font-semibold text-slate-800"
              id="modal-title"
            >
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-slate-600">{message}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <StyledButton
            onClick={onConfirm}
            variant="danger"
            size="medium"
            className="w-full sm:w-auto"
          >
            {" "}
            {confirmText}
          </StyledButton>
          <StyledButton
            onClick={onClose}
            variant="secondary"
            size="medium"
            className="w-full sm:w-auto"
          >
            {cancelText}
          </StyledButton>
        </div>
      </div>
    </div>
  );
};

const FullScreenLoader = ({ text }) => (
  <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex flex-col items-center justify-center z-[300] p-4 text-white animate-fadeInModal">
    <LucideIcons.LoaderCircle
      size={48}
      className="text-emerald-400 animate-spin"
    />
    <p className="text-slate-300 mt-4 text-center max-w-sm">{text}</p>
  </div>
);

const ImportContactsView = ({ onCancel, onListUploaded }) => {
  const [listName, setListName] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const token = useSelector((state) => state.auth.userToken);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type !== "application/json" &&
        !selectedFile.name.endsWith(".json")
      ) {
        toast.error("Please select a valid JSON file.");
        e.target.value = "";
        return;
      }

      setFile(selectedFile);
      if (!listName) {
        setListName(selectedFile.name.split(".").slice(0, -1).join(".").trim());
      }
    }
  };

  const handleUpload = async () => {
    if (!listName.trim()) {
      toast.warn("Please provide a name for the contact list.");
      return;
    }
    if (!file) {
      toast.warn("Please select a file to upload.");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("listName", listName);
    formData.append("file", file);
    try {
      await getapiRequest("post", "/contacts", formData, token, {
        "Content-Type": "multipart/form-data",
      });
      toast.success(`List "${listName}" has been successfully uploaded.`);
      onListUploaded();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to upload contact list.";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {isUploading && (
        <FullScreenLoader text="Uploading and processing your list..." />
      )}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 animate-fadeIn p-6 md:p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">
              Upload New Contact List
            </h2>
            <p className="text-base text-slate-500 mt-2 mb-8">
              Upload a JSON file with your contacts. The file should contain an
              array of contact objects with fields like 'email', 'userName',
              'phoneNo', 'linkedInUrl'.
            </p>
          </div>

          <InputField
            label="Contact List Name"
            name="listName"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="e.g., Q4 Leads"
            required
            icon={<LucideIcons.Tag />}
            className="mx-auto"
          />

          <div
            className="group text-center border-2 border-dashed border-slate-300 hover:border-emerald-400 p-6 rounded-lg transition-all duration-300 bg-slate-50/50 hover:bg-emerald-50/50 cursor-pointer mt-6"
            onClick={() =>
              document.getElementById("contact-file-upload").click()
            }
          >
            <LucideIcons.UploadCloud
              size={48}
              className="mx-auto text-slate-400 group-hover:text-emerald-500 mb-4 transition-colors"
            />
            <input
              id="contact-file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".json"
            />
            {!file ? (
              <>
                <label htmlFor="contact-file-upload" className="cursor-pointer">
                  <span className="font-semibold text-emerald-600">
                    Click to upload
                  </span>
                  <span className="text-slate-500"> or drag and drop</span>
                </label>
                <p className="text-xs text-slate-400 mt-2">
                  Only .json files are supported
                </p>
              </>
            ) : (
              <div>
                <p className="font-semibold text-slate-700">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  ({(file.size / 1024).toFixed(1)} KB) - Click to change file
                </p>
              </div>
            )}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
            <StyledButton
              onClick={onCancel}
              variant="secondary"
              iconLeft={<LucideIcons.X />}
            >
              Cancel
            </StyledButton>
            <StyledButton
              onClick={handleUpload}
              variant="primary"
              iconRight={<LucideIcons.Save />}
              disabled={!file || !listName.trim() || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload & Save List"}
            </StyledButton>
          </div>
        </div>
      </div>
    </>
  );
};

const ImportOptionsModal = ({ isOpen, onClose, onSelectOption }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[250] p-4 animate-fadeInModal">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-150 ease-out animate-scaleUpModal border border-slate-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Choose Import Method
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Select how you would like to import your contacts
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => onSelectOption('upload')}
            className="w-full p-4 border border-slate-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-200 text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <LucideIcons.UploadCloud size={20} className="text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Click to Upload</h4>
                <p className="text-xs text-slate-500">Upload a JSON file with your contacts</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => onSelectOption('search')}
            className="w-full p-4 border border-slate-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-200 text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <LucideIcons.Search size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Search & Select Online</h4>
                <p className="text-xs text-slate-500">Search and select users from online database</p>
              </div>
            </div>
          </button>
        </div>
        
        <div className="mt-6 flex justify-end">
          <StyledButton
            onClick={onClose}
            variant="secondary"
            size="medium"
          >
            Cancel
          </StyledButton>
        </div>
      </div>
    </div>
  );
};

const SearchAndSelectView = ({ onCancel, onUsersSelected }) => {
  const [filters, setFilters] = useState({
    personName: "",
    jobTitles: [],
    locations: [],
    companies: [],
    excludeCompanies: [],
    parentSheetUrl: "",
    blacklistSheetUrl: "",
    includeListIds: [],
    employees: [],
    industries: [],
    minRevenue: "",
    maxRevenue: "",
    seniorities: [],
    departments: [],
    tags: [],
    timezones: [],
    minExp: "",
    maxExp: "",
    minRoleYears: "",
    maxRoleYears: "",
    technologies: [],
    funding: [],
    emailStatus: [],
    buyingIntent: [],
    jobChange: null,
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, per_page: 25, total_entries: 0, total_pages: 1 });
  console.log('SearchAndSelectView: Initial pagination state:', pagination);
  const [isLoading, setIsLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [buyingIntentOptions, setBuyingIntentOptions] = useState(["High", "Medium", "Low", "None"]);
  const [lastApiUrl, setLastApiUrl] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isIntentModalOpen, setIsIntentModalOpen] = useState(false);
  const [isConfirmImportModalOpen, setIsConfirmImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
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
    const timezoneMap = (tz) => { 
      const match = tz.match(/-?\d+/); 
      return match ? match[0] * 60 : null; 
    };

    const params = {
      q_person_name: filters.personName, 
      person_titles: filters.jobTitles.join(","), 
      person_locations: filters.locations.join(","),
      organization_ids: filters.companies.map((company) => company.id).join(","), 
      contact_email_status_v2: filters.emailStatus.map((s) => s.split(" ")[0].toLowerCase()).join(","),
      min_revenue: filters.minRevenue, 
      max_revenue: filters.maxRevenue, 
      organization_num_employees_ranges: filters.employees.map((e) => employeeRangesMap[e]).join(","),
      person_seniorities: filters.seniorities.map((s) => s.toLowerCase()).join(","), 
      open_factor_names: filters.jobChange === "Contact who have changed jobs" ? true : filters.jobChange === "Contact who have not changed jobs" ? false : undefined,
      person_department_or_subdepartments: filters.departments.join(","), 
      q_organization_keyword_tags: filters.tags.join(","),
      intent_strengths: filters.buyingIntent.map((s) => s.toLowerCase()).join(","), 
      person_time_zones: filters.timezones.map(timezoneMap).filter((tz) => tz !== null).join(","),
      currently_using_any_of_technology_uids: filters.technologies.join(","), 
      page: page,
    };
    
    Object.keys(params).forEach((key) => (!params[key] || (Array.isArray(params[key]) && params[key].length === 0)) && delete params[key]);
    const finalUrlForHistory = `${API_BASE_URL}${API_ENDPOINTS.SEARCH_PEOPLE}?${new URLSearchParams(params).toString()}`;
    setLastApiUrl(finalUrlForHistory);

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
      console.log('API Response:', result);
      console.log('API Response pagination:', result.pagination);
      console.log('API Response data:', result.data);
      console.log('API Response data.pagination:', result.data?.pagination);
      setData(result.data?.people || []);
      const newPagination = result.data?.pagination || result.pagination || { page: 1, per_page: 25, total_entries: 0, total_pages: 1 };
      console.log('Setting pagination to:', newPagination);
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
    
    const contactsToImport = selectedPeople.map(person => ({
      userName: person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || '',
      email: person.email || '',
      phoneNo: person.phone || '',
      linkedInUrl: person.linkedin_url || '',
      title: person.title || '',
      company: person.organization?.name || '',
      location: person.city || person.formatted_address || ''
    }));

    setSelectedUsers(contactsToImport);
    setIsConfirmImportModalOpen(true);
  };

  const handleConfirmImport = () => {
    if (!importFileName.trim()) {
      toast.error('Please enter a file name');
      return;
    }

    // Create a unique ID for this import
    const importId = `import-${Date.now()}`;
    
    // Store this specific import
    const importData = {
      id: importId,
      name: importFileName,
      contacts: selectedUsers,
      createdAt: new Date().toISOString(),
      contactCount: selectedUsers.length
    };
    
    // Get existing imports
    const existingImports = JSON.parse(localStorage.getItem('contactImports') || '[]');
    const updatedImports = [...existingImports, importData];
    localStorage.setItem('contactImports', JSON.stringify(updatedImports));
    
    toast.success(`Successfully imported ${selectedUsers.length} contacts to "${importFileName}"`);
    
    setIsConfirmImportModalOpen(false);
    setIsSuccessModalOpen(true);
    // Don't clear importFileName here - keep it for the success modal
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    setImportFileName(''); // Clear the filename after success modal closes
    onUsersSelected();
  };

  const columns = useMemo(() => [
    { 
      id: 'select', 
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
      ), 
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          indeterminate={row.getIsSomeSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
      ) 
    },
         {
       accessorFn: row => row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
       id: 'name',
       header: 'Name',
       cell: ({ row, getValue }) => (
         <a 
           href={row.original.linkedin_url} 
           target="_blank" 
           rel="noopener noreferrer" 
           className="flex items-center gap-2 font-medium text-slate-700 group hover:text-emerald-600 transition-colors"
         >
           <LucideIcons.Linkedin size={14} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
           <span>{getValue()}</span>
         </a>
       )
     },
    {
      accessorKey: 'title',
      header: 'Title'
    },
    {
      accessorFn: row => row.organization,
      id: 'company',
      header: 'Company',
      cell: ({ getValue }) => {
        const org = getValue();
        if (!org) return 'Not Available';
        return (
          <div className="flex items-center gap-3">
            <img 
              src={org.logo_url || `https://avatar.vercel.sh/${org.name}.png?size=32`} 
              alt={`${org.name} logo`} 
              className="w-8 h-8 rounded-md object-contain border border-slate-200" 
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src=`https://avatar.vercel.sh/${org.name}.png?size=32`; 
              }} 
            />
            <div>
              <p className="font-semibold text-slate-700">{org.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {org.linkedin_url && (
                  <a href={org.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-600">
                    <LucideIcons.Linkedin size={14}/>
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      }
    },
         {
       accessorFn: row => row.city || row.formatted_address || '',
       id: 'location',
       header: 'Location'
     }
  ], []);

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
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
              <LucideIcons.Search className="text-emerald-600" />
              <span>Search Command Center</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-6">
              <FilterInput 
                name="personName" 
                label="Name" 
                icon={LucideIcons.User} 
                placeholder="Type name..." 
                value={filters.personName} 
                onChange={(e) => handleFilterChange("personName", e.target.value)} 
                onKeyDown={handleKeyDown} 
              />
                             <AsyncMultiSelect 
                 name="jobTitles" 
                 label="Job Title" 
                 icon={LucideIcons.Briefcase} 
                 placeholder="e.g., 'Software Engineer'" 
                 values={filters.jobTitles} 
                 setValues={(v) => handleFilterChange("jobTitles", v)} 
                 fetchEndpoint={API_ENDPOINTS.GET_JOB_TITLES} 
                 optionFormatter={(o) => o.cleaned_name} 
                 displayFormatter={(val) => val} 
                 suggestionFormatter={(o) => o.cleaned_name} 
               />
               <AsyncMultiSelect 
                 name="locations" 
                 label="Location" 
                 icon={LucideIcons.MapPin} 
                 placeholder="e.g., 'San Francisco'" 
                 values={filters.locations} 
                 setValues={(v) => handleFilterChange("locations", v)} 
                 fetchEndpoint={API_ENDPOINTS.GET_LOCATION} 
                 optionFormatter={(o) => o.cleaned_name} 
                 displayFormatter={(val) => val} 
                 suggestionFormatter={(o) => o.cleaned_name} 
               />
              <div className="flex items-end">
                <button 
                  onClick={() => setIsDrawerOpen(true)} 
                  className="w-full h-[46px] flex items-center justify-center gap-2 font-semibold rounded-lg text-emerald-600 bg-emerald-100 hover:bg-emerald-200 transition-all duration-300 shadow-sm border border-emerald-200 hover:border-emerald-300"
                >
                  <LucideIcons.SlidersHorizontal size={18} />
                  <span>All Filters</span>
                </button>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleTriggerSearch} 
                  disabled={isLoading} 
                  className="w-full h-[46px] flex items-center justify-center gap-2 font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <LucideIcons.LoaderCircle size={20} className="animate-spin" /> : <LucideIcons.Search size={20} />}
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Search Results</h2>
              {isLoading && (
                <div className="flex items-center gap-2 text-emerald-600 mt-2 sm:mt-0">
                  <LucideIcons.LoaderCircle className="animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-5 p-3 bg-white/60 rounded-lg border border-slate-200 backdrop-blur-sm">
              <div className="relative w-full md:w-auto">
                <LucideIcons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Filter current results..."
                  className="w-full md:w-64 lg:w-80 pl-11 pr-4 py-2.5 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">
                  Selected: <strong className="text-emerald-600">{numSelected.toLocaleString()}</strong> of <strong>{pagination.total_entries.toLocaleString()}</strong>
                </span>
                <button
                  onClick={handleImportSelected}
                  disabled={isLoading || numSelected === 0}
                  className="group text-nowrap flex items-center justify-center w-40 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LucideIcons.Download size={16} className="mr-2" />
                  <span>Import Selected</span>
                </button>
              </div>
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
            {console.log('ContactsManager: Passing pagination to DataTable:', pagination)}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
            <StyledButton
              onClick={onCancel}
              variant="secondary"
              iconLeft={<LucideIcons.X />}
            >
              Cancel
            </StyledButton>
          </div>
        </div>
      </div>

      {isConfirmImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[250] p-4 animate-fadeInModal">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-150 ease-out animate-scaleUpModal border border-slate-200">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Confirm Import
              </h3>
              <p className="text-sm text-slate-600">
                You are about to import {selectedUsers.length} contacts. Please provide a name for this contact list.
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact List Name
              </label>
              <input
                type="text"
                value={importFileName}
                onChange={(e) => setImportFileName(e.target.value)}
                placeholder="e.g., Q4 Leads from Search"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>

            <div className="mb-6 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Selected Contacts ({selectedUsers.length}):</h4>
              <div className="space-y-1">
                {selectedUsers.slice(0, 10).map((user, index) => (
                  <div key={index} className="text-xs text-slate-600 flex justify-between">
                    <span>{user.userName || 'Unknown'}</span>
                    <span className="text-slate-500">{user.company || 'No Company'}</span>
                  </div>
                ))}
                {selectedUsers.length > 10 && (
                  <div className="text-xs text-slate-500 italic">
                    ... and {selectedUsers.length - 10} more contacts
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <StyledButton
                onClick={() => {
                  setIsConfirmImportModalOpen(false);
                  setImportFileName('');
                }}
                variant="secondary"
                size="medium"
              >
                Cancel
              </StyledButton>
              <StyledButton
                onClick={handleConfirmImport}
                variant="primary"
                size="medium"
                disabled={!importFileName.trim()}
              >
                Confirm Import
              </StyledButton>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[250] p-4 animate-fadeInModal">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-150 ease-out animate-scaleUpModal border border-slate-200">
            <div className="text-center">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Successfully Imported!
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {selectedUsers.length} contacts have been imported to your contacts list.
              </p>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-6"
              >
                <p className="text-sm text-emerald-800">
                  <strong>File Name:</strong> {importFileName}
                </p>
              </motion.div>
            </div>
            <div className="flex justify-center">
              <StyledButton
                onClick={handleSuccessClose}
                variant="primary"
                iconLeft={<LucideIcons.Check />}
              >
                Return to Contacts
              </StyledButton>
            </div>
          </div>
        </div>
      )}

      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onApply={handleApplyDrawerFilters}
        isLoading={isLoading}
        onIntentEdit={() => setIsIntentModalOpen(true)}
        buyingIntentOptions={buyingIntentOptions}
        initialFilters={filters}
      />
      
      <IntentTopicModal
        isOpen={isIntentModalOpen}
        onClose={() => setIsIntentModalOpen(false)}
        currentOptions={buyingIntentOptions}
        setCurrentOptions={setBuyingIntentOptions}
      />
    </>
  );
};

const ContactsManager = () => {
  const [isImportView, setIsImportView] = useState(false);
  const [importMethod, setImportMethod] = useState(null);
  const [isImportOptionsModalOpen, setIsImportOptionsModalOpen] = useState(false);
  const [allContactLists, setAllContactLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedListContacts, setSelectedListContacts] = useState([]);
  const [isContactsLoading, setIsContactsLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const token = useSelector((state) => state.auth.userToken);

  const loadContactLists = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await getapiRequest("get", "/api/contacts", null, token);
      
      // Get imported contacts from localStorage
      const contactImports = JSON.parse(localStorage.getItem('contactImports') || '[]');
      
      // Create lists for each imported contact list
      let allLists = response.data;
      if (contactImports.length > 0) {
        const importedLists = contactImports.map(importData => ({
          id: importData.id,
          listName: importData.name,
          createdAt: importData.createdAt,
          contactCount: importData.contactCount,
          isImported: true
        }));
        allLists = [...importedLists, ...response.data];
      }
      
      setAllContactLists(
        allLists.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (error) {
      toast.error("Could not fetch contact lists.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const loadContactsForList = useCallback(
    async (listId) => {
      if (!listId) return;
      setIsContactsLoading(true);
      setSelectedListContacts([]);
      
      try {
        // Handle imported contacts
        if (listId.startsWith('import-')) {
          const contactImports = JSON.parse(localStorage.getItem('contactImports') || '[]');
          const importData = contactImports.find(imp => imp.id === listId);
          if (importData) {
            setSelectedListContacts(importData.contacts || []);
          }
        } else {
          // Handle regular API contacts
          if (!token) return;
          const response = await getapiRequest(
            "get",
            `/api/contacts/${listId}`,
            null,
            token
          );
          setSelectedListContacts(response.data.contacts || []);
        }
      } catch (error) {
        toast.error(`Could not fetch contacts for the selected list.`);
      } finally {
        setIsContactsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    loadContactLists();
  }, [loadContactLists]);

  const handleSelectList = (listId) => {
    if (selectedListId === listId) return;
    setSelectedListId(listId);
    setSearchTerm("");
    loadContactsForList(listId);
  };

  const contactsToDisplay = useMemo(() => {
    if (selectedListContacts.length === 0) return [];

    let filteredContacts = selectedListContacts;
    if (searchTerm) {
      filteredContacts = selectedListContacts.filter((contact) =>
        Object.values(contact).some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }
    return filteredContacts;
  }, [selectedListContacts, searchTerm]);

  const handleListUploaded = () => {
    setIsImportView(false);
    setSelectedListId(null);
    setSelectedListContacts([]);
    loadContactLists();
  };

  const promptDeleteList = (list) => {
    if (list) {
      setConfirmAction({ type: "deleteList", id: list.id, name: list.listName });
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmDeletion = async () => {
    if (!confirmAction || confirmAction.type !== "deleteList") return;

    try {
      // Handle imported contact list deletion
      if (confirmAction.id.startsWith('import-')) {
        const contactImports = JSON.parse(localStorage.getItem('contactImports') || '[]');
        const updatedImports = contactImports.filter(imp => imp.id !== confirmAction.id);
        localStorage.setItem('contactImports', JSON.stringify(updatedImports));
        toast.success(`List "${confirmAction.name}" was deleted.`);
      } else {
        // Handle regular API contact list deletion
        await getapiRequest(
          "delete",
          `/api/contacts/${confirmAction.id}`,
          null,
          token
        );
        toast.success(`List "${confirmAction.name}" was deleted.`);
      }
      
      if (selectedListId === confirmAction.id) {
        setSelectedListId(null);
        setSelectedListContacts([]);
      }
      loadContactLists();
    } catch (error) {
      toast.error("Failed to delete the list.");
    } finally {
      setIsConfirmModalOpen(false);
      setConfirmAction(null);
    }
  };

  const handleImportNewList = () => {
    setIsImportOptionsModalOpen(true);
  };

  const handleImportOptionSelect = (option) => {
    setImportMethod(option);
    setIsImportOptionsModalOpen(false);
    setIsImportView(true);
  };

  const handleUsersSelected = () => {
    setIsImportView(false);
    setImportMethod(null);
    setSelectedListId(null);
    setSelectedListContacts([]);
    loadContactLists();
    // Auto-select the most recent imported contacts list after import
    setTimeout(() => {
      const contactImports = JSON.parse(localStorage.getItem('contactImports') || '[]');
      if (contactImports.length > 0) {
        // Get the most recent import
        const mostRecentImport = contactImports.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        setSelectedListId(mostRecentImport.id);
        loadContactsForList(mostRecentImport.id);
      }
    }, 100);
  };

  const renderManageContacts = () => (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl text-center sm:text-left font-bold tracking-tight">
            Contact Lists
          </h1>
          <p className="text-base text-slate-500 mt-1">
            Manage your imported lists and contacts.
          </p>
        </div>
        <StyledButton
          onClick={handleImportNewList}
          variant="primary"
          iconLeft={<LucideIcons.PlusCircle />}
          size="medium"
          className="w-full sm:w-auto flex-shrink-0"
        >
          Import New List
        </StyledButton>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <LucideIcons.LoaderCircle className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
        </div>
      ) : allContactLists.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center mb-5">
            <LucideIcons.ArchiveX size={48} className="text-emerald-300" />
          </div>
          <p className="text-slate-700 font-semibold text-xl">
            No Contact Lists Yet
          </p>
          <p className="text-sm text-slate-500 mb-6 mt-1">
            Get started by importing your first list.
          </p>
          <StyledButton
            onClick={handleImportNewList}
            variant="primary"
            iconLeft={<LucideIcons.UploadCloud />}
          >
            Import First List
          </StyledButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 px-1">
              Your Lists ({allContactLists.length})
            </h3>
            <ul className="space-y-2 max-h-[75vh] lg:max-h-[calc(100vh-250px)] overflow-y-auto pr-1 custom-scrollbar">
              {allContactLists.map((list) => {
                const contactCount = list.contactCount || 0;
                return (
                <li
                  key={list.id}
                  className={`p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200 group relative ${
                    selectedListId === list.id
                      ? "border-emerald-500 bg-emerald-50/70 shadow-md"
                      : "border-transparent bg-white hover:bg-slate-50 hover:border-emerald-300"
                  }`}
                  onClick={() => handleSelectList(list.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p
                        className={`font-semibold ${
                          selectedListId === list.id
                            ? "text-emerald-800"
                            : "text-slate-700 group-hover:text-slate-800"
                        }`}
                      >
                        {list.listName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        {contactCount > 0 ? (
                          <>{contactCount} contacts</>
                        ) : (
                          <>
                            <LucideIcons.FileJson size={12} className="text-slate-400" />
                            <span>
                               {list.filePath?.split('/').pop() || 'file'}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        promptDeleteList(list);
                      }}
                      className="p-1.5 rounded-md text-slate-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                      title="Delete list"
                    >
                      <LucideIcons.Trash2 size={16} />
                    </button>
                  </div>
                </li>
              )})}
            </ul>
          </div>
          <div className="lg:col-span-8 bg-white p-4 rounded-2xl shadow-lg border border-slate-200">
            {selectedListId ? (
              <>
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">
                      Contacts in:{" "}
                      <span className="text-emerald-600">
                        {
                          allContactLists.find((l) => l.id === selectedListId)
                            ?.listName
                        }
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isContactsLoading
                        ? "Loading contacts..."
                        : `${contactsToDisplay.length} of ${selectedListContacts.length} contacts shown`}
                    </p>
                  </div>
                  <InputField
                    name="searchTerm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search in list..."
                    icon={<LucideIcons.Search size={16} />}
                    className="mb-0 w-full sm:max-w-xs"
                    disabled={isContactsLoading}
                  />
                </div>
                {isContactsLoading ? (
                  <div className="flex items-center justify-center min-h-[300px]">
                    <LucideIcons.LoaderCircle className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto max-h-[calc(100vh-320px)] border border-slate-200 rounded-lg shadow-inner bg-slate-50/30 custom-scrollbar">
                      <table className="min-w-full text-sm divide-y divide-slate-200">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                          <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <th className="px-4 py-3">User Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">LinkedIn</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                          {contactsToDisplay.map((contact, index) => (
                            <tr
                              key={contact.id || index}
                              className="hover:bg-emerald-50/50"
                            >
                              <td className="px-4 py-3 text-slate-700 font-medium">
                                {contact.userName || "–"}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {contact.email || "–"}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {contact.phoneNo || "–"}
                              </td>
                              <td className="px-4 py-3">
                                {contact.linkedInUrl ? (
                                  <a
                                    href={
                                      contact.linkedInUrl.startsWith("http")
                                        ? contact.linkedInUrl
                                        : `https://${contact.linkedInUrl}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline text-xs inline-flex items-center truncate max-w-[150px]"
                                    title={contact.linkedInUrl}
                                  >
                                    <LucideIcons.Linkedin
                                      size={14}
                                      className="mr-1.5 shrink-0 text-[#0077B5]"
                                    />
                                    View Profile
                                  </a>
                                ) : (
                                  <span className="text-slate-400 text-xs">
                                    N/A
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {contactsToDisplay.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        <LucideIcons.SearchX
                          size={32}
                          className="mx-auto mb-2 text-slate-400"
                        />
                        <span className="font-medium">
                          {searchTerm
                            ? "No Results Found"
                            : "This List is Empty"}
                        </span>
                        <br />
                        <span className="text-xs">
                          {searchTerm
                            ? "No contacts match your search term."
                            : "There are no contacts in this list."}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-10 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50 min-h-[300px]">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
                  <LucideIcons.MousePointerSquareDashed
                    size={32}
                    className="text-emerald-400"
                  />
                </div>
                <p className="font-semibold text-lg text-slate-700">
                  Select a list to view
                </p>
                <p className="text-sm mt-1 max-w-xs">
                  Choose a list from the panel on the left to view its contacts.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-screen-xl mx-auto">
          {isImportView ? (
            importMethod === 'upload' ? (
              <ImportContactsView
                onCancel={() => {
                  setIsImportView(false);
                  setImportMethod(null);
                }}
                onListUploaded={handleListUploaded}
              />
            ) : (
              <SearchAndSelectView
                onCancel={() => {
                  setIsImportView(false);
                  setImportMethod(null);
                }}
                onUsersSelected={handleUsersSelected}
              />
            )
          ) : (
            renderManageContacts()
          )}
          <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleConfirmDeletion}
            title={`Confirm Deletion`}
            message={`Are you sure you want to delete "${
              confirmAction?.name || "this item"
            }"? This action cannot be undone.`}
            confirmText="Delete"
          />
          <ImportOptionsModal
            isOpen={isImportOptionsModalOpen}
            onClose={() => setIsImportOptionsModalOpen(false)}
            onSelectOption={handleImportOptionSelect}
          />
        </div>
      </div>
    </>
  );
};

export default ContactsManager;