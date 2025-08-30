import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { X, Loader2, Edit, Building2, Ban, Users, Tag, Briefcase, Workflow, Factory, MailCheck, Target, Cpu, DollarSign, PiggyBank, Globe, Search, CalendarDays, RefreshCw, CalendarClock, SlidersHorizontal } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

import FilterInput from './FilterInput';
import MultiSelectDropdown from './MultiSelectDropdown';
import AsyncMultiSelect from './AsyncMultiSelect';
import SimpleSelectDropdown from './SimpleSelectDropdown';
import TagInput from './TagInput';


const employeeOptions = ['0-10', '11-20', '21-50', '51-100', '101-200', '201-500', '501-1000', '1001-2000', '2001-5000', '5001-10000', '10001+'];
const seniorityOptions = ['Owner', 'Founder', 'C Suite', 'Partner', 'Vp', 'Head', 'Director', 'Manager', 'Senior', 'Entry', 'Intern'];
const departmentOptions = ['c suite', 'product management', 'master engineering technical', 'design', 'education'];
const emailStatusOptions = ['Likely to engage', 'Verfied', 'Unverfied', 'Update Required', 'Unavailable'];
const jobChangeOptions = ['Contact who have changed jobs', 'Contact who have not changed jobs'];
const timezoneOptions = Array.from({ length: 25 }, (_, i) => { const offset = i - 10; return `(GMT ${offset >= 0 ? '+' : ''}${offset}:00)`; });

const FilterSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-lg border border-slate-200 p-0">
    <div className="p-5">
               <h3 className="text-md font-bold text-slate-800 mb-4 pb-3 border-b border-slate-200 flex items-center gap-3">
                 <span className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><Icon size={20}/></span>
        <span>{title}</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">{children}</div>
    </div>
  </div>
);

const PairedInput = ({ label, icon: Icon, value1, value2, name1, name2, onChange, placeholder1, placeholder2 }) => (
  <div>
         <label className="text-sm font-medium block mb-1.5 flex items-center gap-2 text-slate-700">{Icon && <Icon className="text-slate-500" size={16}/>}<span>{label}</span></label>
    <div className="flex items-center gap-2">
                 <input type="number" name={name1} value={value1} onChange={onChange} placeholder={placeholder1} className="w-full p-2 bg-white rounded-lg border border-slate-300 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"/>
        <span className="text-gray-400">-</span>
                 <input type="number" name={name2} value={value2} onChange={onChange} placeholder={placeholder2} className="w-full p-2 bg-white rounded-lg border border-slate-300 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"/>
    </div>
  </div>
);

const FilterDrawer = ({ isOpen, onClose, onApply, isLoading, onIntentEdit, buyingIntentOptions, initialFilters }) => {
  const [localFilters, setLocalFilters] = useState(initialFilters);
  const [includeListQuery, setIncludeListQuery] = useState('');
  const [isListLoading, setIsListLoading] = useState(false);
  const [isSheetLoading, setIsSheetLoading] = useState(false);
  const [staticOptions, setStaticOptions] = useState({ industries: [], funding: [], technologies: [] });
  const [areOptionsLoading, setAreOptionsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) { 
        document.body.style.overflow = 'hidden';
        setLocalFilters(initialFilters);
    } else { 
        document.body.style.overflow = 'auto'; 
    }
  }, [isOpen, initialFilters]);

  const handleLocalFilterChange = useCallback((name, value) => {
    setLocalFilters(prev => ({...prev, [name]: value}));
  }, []);

  useEffect(() => {
    const fetchDropdownData = async () => {
      if (isOpen && staticOptions.industries.length === 0) {
        setAreOptionsLoading(true);
                 try {
                       const [industriesRes, fundingRes, techRes] = await Promise.all([
              fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_INDUSTRIES}`),
              fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_FUNDING_DETAILS}`),
              fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_TECHNOLOGIES}`)
            ]);
           const [industriesData, fundingData, techData] = await Promise.all([
             industriesRes.json(),
             fundingRes.json(),
             techRes.json()
           ]);
           setStaticOptions({ 
             industries: industriesData.data?.map(item => item.cleaned_name).filter(Boolean) || [], 
             funding: fundingData.data?.latest_funding_stage_facets?.map(item => `${item.display_name} (${item.count.toLocaleString()})`).filter(Boolean) || [], 
             technologies: techData.data?.map(item => item.cleaned_name).filter(Boolean) || [] 
           });
         } catch (error) { toast.error("Could not load filter options."); } finally { setAreOptionsLoading(false); }
      }
    };
    fetchDropdownData();
  }, [isOpen]);

  const companyOptionFormatter = (option) => option;
  const companyDisplayFormatter = (value) => value.name || value;
  const companySuggestionFormatter = (option) => option.name || option;

  const handleIncludeListSearch = async () => {
    const queries = includeListQuery.split(',').map(q => q.trim()).filter(Boolean);
    if (queries.length === 0) { toast.info("Please enter one or more list names to search."); return; }
    setIsListLoading(true);
         try {
               const apiPromises = queries.map(query => fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_LISTID_INCLUDE_OR_EXCLUDE_COMPANIES}?query=${encodeURIComponent(query)}`));
       const results = await Promise.all(apiPromises);
       const resultsData = await Promise.all(results.map(res => res.json()));
       const foundIds = resultsData.map(res => res.data?.data).filter(Boolean);
      const newUniqueIds = foundIds.filter(id => !localFilters.includeListIds.includes(id));
      if (newUniqueIds.length > 0) {
        handleLocalFilterChange('includeListIds', [...localFilters.includeListIds, ...newUniqueIds]);
        toast.success(`${newUniqueIds.length} new list ID(s) added!`);
      } else { toast.info("No new list IDs were found from your query."); }
      setIncludeListQuery('');
    } catch (error) { toast.error("An error occurred while searching for lists."); } 
    finally { setIsListLoading(false); }
  };

  const handleSheetUrlSubmit = async (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const { parentSheetUrl, blacklistSheetUrl } = localFilters;
    if (!parentSheetUrl && !blacklistSheetUrl) {
      toast.info("Please provide at least one sheet URL.");
      return;
    }
    setIsSheetLoading(true);
         try {
       const payload = {
           parent_sheet: parentSheetUrl || "",
           blacklist_sheet: blacklistSheetUrl || ""
       };
               const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LISTID_VIA_SPREADSHEET_LINKS}`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(payload)
       });
       const data = await res.json();
       const listId = data.data?.data?.list_id;

      if (listId) {
          if (!localFilters.includeListIds.includes(listId)) {
              handleLocalFilterChange('includeListIds', [...localFilters.includeListIds, listId]);
              toast.success(`List ID "${listId}" added successfully!`);
          } else {
              toast.info(`List ID "${listId}" is already included.`);
          }
      } else {
          throw new Error(res.data?.message || "Could not retrieve List ID from sheet.");
      }
    } catch (error) {
      console.log(error);
      
                 toast.error("Failed to process sheet URL.");
    } finally {
        setIsSheetLoading(false);
    }
  };
  
  const handlePairedInputChange = useCallback((e) => handleLocalFilterChange(e.target.name, e.target.value), [handleLocalFilterChange]);
  const removeIncludeListId = useCallback(idToRemove => handleLocalFilterChange('includeListIds', localFilters.includeListIds.filter(id => id !== idToRemove)), [localFilters.includeListIds, handleLocalFilterChange]);
  
  const handleApplyClick = () => {
      onApply(localFilters);
      onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
                     <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-50 flex flex-col shadow-2xl">
                         <header className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
                                 <h2 className="text-lg font-bold flex items-center gap-3 text-slate-800"><SlidersHorizontal className="text-emerald-600"/>All Filters</h2>
                                 <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={20}/></button>
            </header>
            <main className="relative flex-grow p-4 sm:p-6 overflow-y-auto">
              <div className="space-y-6">
                <FilterSection title="Company & Sourcing" icon={Building2}>
                  <div className="sm:col-span-2">
                                         <AsyncMultiSelect 
                         label="Company" 
                         icon={Building2} 
                         placeholder="Type to search..." 
                         values={localFilters.companies} 
                         setValues={v => handleLocalFilterChange('companies', v)} 
                         fetchEndpoint={API_ENDPOINTS.GET_ORGANIZATION_ID} 
                         optionFormatter={companyOptionFormatter} 
                         displayFormatter={companyDisplayFormatter}
                         suggestionFormatter={companySuggestionFormatter}
                     />
                    <div className="mt-4">
                                             <label className="text-sm font-medium text-slate-600 mb-1 block">Include list of companies</label>
                      <div className="relative">
                                                 <input type="text" placeholder="Search list(s), comma-separated..." value={includeListQuery} onChange={(e) => setIncludeListQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleIncludeListSearch()} className="w-full p-2 pr-10 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"/>
                        <button onClick={handleIncludeListSearch} disabled={isListLoading} className="absolute top-1/2 right-1.5 -translate-y-1/2 p-1.5 text-gray-400 disabled:cursor-wait">{isListLoading ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>}</button>
                      </div>
                      {localFilters.includeListIds.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">{localFilters.includeListIds.map(id => (<div key={id} className="text-xs text-green-800 bg-green-100 py-1 pl-2 pr-1 rounded-full flex items-center gap-2"><span>{id}</span><button onClick={() => removeIncludeListId(id)} className='p-0.5 rounded-full hover:bg-red-200'><X size={14}/></button></div>))}</div>
                      )}
                    </div>
                  </div>
                                     <AsyncMultiSelect 
                       label="Exclude Company" 
                       icon={Ban} 
                       placeholder="Type to search..." 
                       values={localFilters.excludeCompanies} 
                       setValues={v => handleLocalFilterChange('excludeCompanies', v)} 
                       fetchEndpoint={API_ENDPOINTS.GET_ORGANIZATION_ID} 
                       optionFormatter={companyOptionFormatter} 
                       displayFormatter={companyDisplayFormatter}
                       suggestionFormatter={companySuggestionFormatter}
                   />
                  <div className="space-y-4 relative">
                    <FilterInput label="Parent Sheet URL" type="url" placeholder="Paste URL & press Enter..." name="parentSheetUrl" value={localFilters.parentSheetUrl} onChange={e => handleLocalFilterChange('parentSheetUrl', e.target.value)} onKeyDown={handleSheetUrlSubmit} disabled={isSheetLoading} />
                    <FilterInput label="Blacklist Sheet URL" type="url" placeholder="Paste URL & press Enter..." name="blacklistSheetUrl" value={localFilters.blacklistSheetUrl} onChange={e => handleLocalFilterChange('blacklistSheetUrl', e.target.value)} onKeyDown={handleSheetUrlSubmit} disabled={isSheetLoading} />
                    {isSheetLoading && (
                                                 <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
                                                         <Loader2 className="animate-spin text-emerald-600" />
                        </div>
                    )}
                  </div>
                </FilterSection>
                <FilterSection title="Company Profile" icon={Factory}><MultiSelectDropdown title="Employees" icon={Users} options={employeeOptions} selected={localFilters.employees} setSelected={v=>handleLocalFilterChange('employees',v)}/><MultiSelectDropdown title="Industry" icon={Factory} options={staticOptions.industries} selected={localFilters.industries} setSelected={v=>handleLocalFilterChange('industries',v)} isLoading={areOptionsLoading}/><PairedInput label="Revenue ($)" icon={DollarSign} value1={localFilters.minRevenue} name1="minRevenue" value2={localFilters.maxRevenue} name2="maxRevenue" onChange={handlePairedInputChange} placeholder1="Min" placeholder2="Max"/></FilterSection>
                <FilterSection title="Person Profile" icon={Briefcase}><MultiSelectDropdown title="Seniorities" icon={Briefcase} options={seniorityOptions} selected={localFilters.seniorities} setSelected={v=>handleLocalFilterChange('seniorities',v)}/><MultiSelectDropdown title="Departments" icon={Workflow} options={departmentOptions} selected={localFilters.departments} setSelected={v=>handleLocalFilterChange('departments',v)}/><TagInput label="Tags" icon={Tag} placeholder="Add tags & press Enter" values={localFilters.tags} setValues={v=>handleLocalFilterChange('tags',v)}/><MultiSelectDropdown title="Timezone" icon={Globe} options={timezoneOptions} selected={localFilters.timezones} setSelected={v=>handleLocalFilterChange('timezones',v)}/><PairedInput label="Experience (yrs)" icon={CalendarDays} value1={localFilters.minExp} name1="minExp" value2={localFilters.maxExp} name2="maxExp" onChange={handlePairedInputChange} placeholder1="Min" placeholder2="Max"/><PairedInput label="Role (yrs)" icon={CalendarClock} value1={localFilters.minRoleYears} name1="minRoleYears" value2={localFilters.maxRoleYears} name2="maxRoleYears" onChange={handlePairedInputChange} placeholder1="Min" placeholder2="Max"/></FilterSection>
                <FilterSection title="Technology & Financials" icon={Cpu}><MultiSelectDropdown title="Technologies" icon={Cpu} options={staticOptions.technologies} selected={localFilters.technologies} setSelected={v=>handleLocalFilterChange('technologies',v)} isLoading={areOptionsLoading}/><MultiSelectDropdown title="Funding" icon={PiggyBank} options={staticOptions.funding} selected={localFilters.funding} setSelected={v=>handleLocalFilterChange('funding',v)} isLoading={areOptionsLoading}/></FilterSection>
                <FilterSection title="Contact & Behavior" icon={MailCheck}><MultiSelectDropdown title="Email Status" icon={MailCheck} options={emailStatusOptions} selected={localFilters.emailStatus} setSelected={v=>handleLocalFilterChange('emailStatus',v)}/><div><div className="flex items-center justify-between mb-1.5"><label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Target className="text-slate-500" size={16}/><span>Buying Intent</span></label><button onClick={onIntentEdit} className="text-sm font-medium text-emerald-600 hover:underline flex items-center gap-1">Edit<Edit size={14}/></button></div><MultiSelectDropdown options={buyingIntentOptions} selected={localFilters.buyingIntent} setSelected={v=>handleLocalFilterChange('buyingIntent',v)}/></div><SimpleSelectDropdown title="Job Change" icon={RefreshCw} options={jobChangeOptions} selected={localFilters.jobChange} setSelected={v=>handleLocalFilterChange('jobChange',v)}/></FilterSection>
              </div>
            </main>
                         <footer className="flex items-center justify-end p-4 border-t border-slate-200 bg-white">
                                 <button onClick={onClose} className="py-2 px-4 font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">Cancel</button>
                <button onClick={handleApplyClick} disabled={isLoading || isSheetLoading} className="ml-3 flex items-center justify-center w-36 h-10 rounded-lg action-button">{isLoading ? <Loader2 className="animate-spin"/> : 'Apply Filters'}</button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default FilterDrawer;
