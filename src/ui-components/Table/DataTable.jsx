import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ArrowUpDown, Mail, Phone, Copy, Check, Linkedin, Facebook, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import EmptyStateImage from '../../assets/DBimg.svg';


const DataTable = ({ data, pagination, onPageChange, rowSelection, onRowSelectionChange, setSorting, globalFilter, columns }) => {
  const [revealedData, setRevealedData] = useState({});
  const [copiedState, setCopiedState] = useState({});

  const { userToken } = useSelector((state) => state.auth);

  // Filter data based on globalFilter
  const filteredData = React.useMemo(() => {
    if (!globalFilter || globalFilter.trim() === '') {
      return data;
    }
    
    const filterValue = globalFilter.toLowerCase();
    return data.filter((row) => {
      // Search in name, title, company name, and location
      const name = (row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim()).toLowerCase();
      const title = (row.title || '').toLowerCase();
      const companyName = (row.organization?.name || '').toLowerCase();
      const location = (row.city || row.formatted_address || '').toLowerCase();
      
      return name.includes(filterValue) || 
             title.includes(filterValue) || 
             companyName.includes(filterValue) || 
             location.includes(filterValue);
    });
  }, [data, globalFilter]);

  const handleReveal = async (row, type) => {
    const rowId = row.id;
    setRevealedData(prev => ({ ...prev, [rowId]: { ...prev[rowId], [type]: { status: 'loading' } } }));

    try {
        const payload = { linkedin_url: row.linkedin_url, full_name: row.name, company_website: row.organization?.website_url };
        
        const response = await fetch('https://salesdriver.site:8001/smart-profile-search', { 
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }, 
            body: JSON.stringify(payload) 
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        const result = await response.json();
        let revealedValue = "Not Found";
        if (type === 'email') revealedValue = result.primary_email || "Not Found";
        else if (type === 'phone') revealedValue = (result.phoneNumber && result.phoneNumber.mobile && result.phoneNumber.mobile[0]) || "Not Found";

        setRevealedData(prev => ({ ...prev, [rowId]: { ...prev[rowId], [type]: { status: 'revealed', value: revealedValue } } }));
        
        if (revealedValue !== 'Not Found') {
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} revealed!`);
        } else {
            toast.info(`No ${type} could be found.`);
        }
        return revealedValue;
    } catch (error) {
        console.error(`Failed to reveal ${type}:`, error);
        toast.error(`Failed to reveal ${type}.`);
        setRevealedData(prev => ({ ...prev, [rowId]: { ...prev[rowId], [type]: { status: 'error' } } }));
        return "Not Found";
    }
  };

  const handleCopy = (text, copyKey) => {
    navigator.clipboard.writeText(text);
    setCopiedState(prev => ({ ...prev, [copyKey]: true }));
    setTimeout(() => setCopiedState(prev => ({ ...prev, [copyKey]: false })), 2000);
  };

  const handlePageChange = (newPage) => {
    console.log('DataTable: handlePageChange called with page:', newPage);
    console.log('DataTable: current pagination:', pagination);
    if (onPageChange && typeof onPageChange === 'function') {
      onPageChange(newPage);
    } else {
      console.error('DataTable: onPageChange is not a function or not provided');
    }
  };

  const renderButton = (row, type) => {
    const rowId = row.id;
    const state = revealedData[rowId]?.[type];

    if (state?.status === 'loading') {
              return <div className="w-[110px] h-[40px] flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div></div>;
    }
    
    if (state?.status === 'revealed') {
      return (
        <div className="h-[40px] flex items-center justify-center">
                     <div className={`flex items-center gap-1 p-1 pr-2 rounded-md ${type === 'email' ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-100 text-teal-700'} text-xs font-mono`}>
            <span className="max-w-[120px] truncate">{state.value}</span>
            {state.value !== 'Not Found' && (
                             <button onClick={() => handleCopy(state.value, `${rowId}-${type}`)} className={`p-1 rounded ${type === 'email' ? 'hover:bg-emerald-200' : 'hover:bg-teal-200'}`}>
                {copiedState[`${rowId}-${type}`] ? <Check size={14} className="text-success-DEFAULT" /> : <Copy size={14} />}
              </button>
            )}
          </div>
        </div>
      );
    }
    
    if (state?.status === 'error') {
      return (
        <button 
          onClick={() => handleReveal(row, type)} 
          className="flex items-center justify-center w-[110px] h-[40px] text-xs px-2 py-1 rounded-md transition-colors gap-1.5 bg-red-100 text-red-700 hover:bg-red-200"
        >
          <RefreshCw size={14}/><span>Retry</span>
        </button>
      );
    }
    
    const buttonText = type === 'email' ? 'Reveal Email' : 'Reveal Phone';
    const Icon = type === 'email' ? Mail : Phone;
    return (
             <button 
         onClick={() => handleReveal(row, type)} 
         className={`flex items-center justify-center w-[110px] h-[40px] text-xs px-2 py-1 rounded-md transition-colors gap-1.5 ${
           type === 'email' ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200' : 'text-teal-700 bg-teal-100 hover:bg-teal-200'
         }`}
       >
        <Icon size={14} /><span>{buttonText}</span>
      </button>
    );
  };

  // Debug logging
  console.log('DataTable render - pagination:', pagination);
  console.log('DataTable render - data length:', data?.length);
  console.log('DataTable render - onPageChange type:', typeof onPageChange);

  return (
    <div className="w-full">
             <div className="bg-white rounded-lg overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-slate-700">
                         <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                {columns.map((column, index) => (
                  <th key={column.id || index} className="px-6 py-3">
                    {column.id === 'select' ? (
                      <input 
                        type="checkbox" 
                        className="custom-checkbox"
                        checked={data.length > 0 && Object.keys(rowSelection).length === data.length}
                        indeterminate={Object.keys(rowSelection).length > 0 && Object.keys(rowSelection).length < data.length}
                        onChange={() => {
                          if (Object.keys(rowSelection).length === data.length) {
                            onRowSelectionChange({});
                          } else {
                            const newSelection = {};
                            data.forEach((_, idx) => { newSelection[idx] = true; });
                            onRowSelectionChange(newSelection);
                          }
                        }}
                      />
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData && filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <motion.tr 
                    key={row.id || index} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ duration: 0.2 }} 
                    className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50"
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        {column.id === 'select' ? (
                          <input 
                            type="checkbox" 
                            className="custom-checkbox"
                            checked={rowSelection[index] || false}
                            onChange={() => {
                              const newSelection = { ...rowSelection };
                              if (newSelection[index]) {
                                delete newSelection[index];
                              } else {
                                newSelection[index] = true;
                              }
                              onRowSelectionChange(newSelection);
                            }}
                          />
                        ) : column.cell ? (
                          column.cell({ row: { original: row }, getValue: () => column.accessorFn ? column.accessorFn(row) : row[column.accessorKey] })
                        ) : (
                          column.accessorFn ? column.accessorFn(row) : row[column.accessorKey]
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-10">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                      <img src={EmptyStateImage} alt="No records found" className="w-64 h-auto" />
                                             <h3 className="text-xl font-semibold text-slate-800 mt-4">No Results Found</h3>
                       <p className="text-sm text-slate-500 max-w-sm">
                        {globalFilter ? `Your search for "${globalFilter}" did not match any records.` : "We couldn't find any results matching your search criteria."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-between">
        <div className="text-sm text-slate-600">
          Showing <strong>{((pagination?.page || 1) - 1) * (pagination?.per_page || 25) + 1}</strong> to <strong>{Math.min((pagination?.page || 1) * (pagination?.per_page || 25), pagination?.total_entries || 0)}</strong> of <strong>{pagination?.total_entries || 0}</strong> results
        </div>
        {pagination && pagination.total_pages > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-slate-600 border border-slate-200 rounded-lg p-3 bg-slate-50">
            <span>Page <strong>{pagination.page}</strong> of <strong>{pagination.total_pages}</strong></span>
            <button 
              onClick={() => handlePageChange(1)} 
              disabled={pagination.page === 1} 
              className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors border border-slate-300"
            >
              <ChevronsLeft size={18}/>
            </button>
            <button 
              onClick={() => handlePageChange(pagination.page - 1)} 
              disabled={pagination.page === 1} 
              className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors border border-slate-300"
            >
              <ChevronLeft size={18}/>
            </button>
            <button 
              onClick={() => handlePageChange(pagination.page + 1)} 
              disabled={pagination.page >= pagination.total_pages} 
              className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors border border-slate-300"
            >
              <ChevronRight size={18}/>
            </button>
            <button 
              onClick={() => handlePageChange(pagination.total_pages)} 
              disabled={pagination.page >= pagination.total_pages} 
              className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors border border-slate-300"
            >
              <ChevronsRight size={18}/>
            </button>
          </div>
        )}
        

      </div>
    </div>
  );
};

export default DataTable;
