import React, { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import DataTable from "./Table/DataTable";
import FilterDrawer from "./Table/FilterDrawer";
import AsyncMultiSelect from "./Table/AsyncMultiSelect";
import FilterInput from "./Table/FilterInput";
import IntentTopicModal from "./Modal/IntentTopicModal";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

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
    console.log('SearchAndSelectView: Starting API call with filters:', filters);
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
    
    // Clean up empty parameters
    Object.keys(params).forEach((key) => (!params[key] || (Array.isArray(params[key]) && params[key].length === 0)) && delete params[key]);
    
    const finalUrlForHistory = `${API_BASE_URL}${API_ENDPOINTS.SEARCH_PEOPLE}?${new URLSearchParams(params).toString()}`;
    console.log('SearchAndSelectView: Final API URL:', finalUrlForHistory);
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
      console.log('SearchAndSelectView: API Response:', result);
      console.log('SearchAndSelectView: API Response pagination:', result.pagination);
      console.log('SearchAndSelectView: API Response data:', result.data);
      console.log('SearchAndSelectView: API Response data.pagination:', result.data?.pagination);
      setData(result.data?.people || []);
      const newPagination = result.data?.pagination || result.pagination || { page: 1, per_page: 25, total_entries: 0, total_pages: 1 };
      console.log('SearchAndSelectView: Setting pagination to:', newPagination);
      setPagination(newPagination);
      
      if (page === 1) {
        toast.success('Search completed successfully!');
      }
    } catch (error) {
      console.error("SearchAndSelectView: Search failed:", error);
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
    console.log('SearchAndSelectView: Received filters from drawer:', drawerFilters);
    setFilters(drawerFilters);
    // Don't auto-trigger search - let user click Search button manually
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
    
    // Call the onUsersSelected callback with the selected user
    onUsersSelected(selectedUser);
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
              Search & Select User for AI Generation
            </h2>
            <p className="text-base text-slate-500 mt-2">
              Search for users online and select one to generate a personalized landing page
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
                  <LucideIcons.Sparkles size={16} className="mr-2" />
                  <span>Generate AI Page</span>
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
            <button
              onClick={onCancel}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
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
              <button
                onClick={() => {
                  setIsConfirmImportModalOpen(false);
                  setImportFileName('');
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={!importFileName.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Import
              </button>
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
              <button
                onClick={handleSuccessClose}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Return to Contacts
              </button>
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

export default SearchAndSelectView;
