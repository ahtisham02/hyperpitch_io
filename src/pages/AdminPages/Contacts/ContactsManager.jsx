import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { read, utils as xlsxUtils } from 'xlsx';
import { toast } from 'react-toastify';
import {
    getContactLists,
    addContactList,
    deleteContactList,
    deleteContactFromList,
    updateContactInList,
} from '../../../utils/localStorageHelper';

const InputField = ({ label, type = 'text', value, onChange, name, placeholder, required = false, icon, accept, className = '', readOnly = false }) => (
    <div className={`mb-4 ${className}`}>
        <label htmlFor={name} className="block text-xs font-semibold text-slate-600 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            {icon && <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">{React.cloneElement(icon, { className: "h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-200"})}</div>}
            <input
                type={type} name={name} id={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} required={required} accept={accept} readOnly={readOnly}
                className={`block w-full ${icon ? 'pl-10' : 'px-3'} py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 sm:text-sm placeholder-slate-400 bg-white text-slate-800 shadow-sm hover:border-slate-400 focus:shadow-md ${readOnly ? 'bg-slate-100 cursor-not-allowed' : ''}`}
            />
        </div>
    </div>
);

const StyledButton = ({ onClick, children, type = 'button', variant = 'primary', disabled = false, className = '', iconLeft, iconRight, size = 'medium' }) => {
    const baseStyle = "rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out inline-flex items-center justify-center group transform hover:-translate-y-px active:translate-y-0 shadow-sm";
    const sizeStyles = { small: "px-3 py-1.5 text-xs", medium: "px-5 py-2.5 text-sm", large: "px-6 py-3 text-base" };
    const greenButton = "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 focus:ring-emerald-500";
    const variantStyles = {
        primary: greenButton,
        secondary: "bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-400 border border-slate-300 hover:border-slate-400 active:bg-slate-100",
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 focus:ring-red-500",
    };
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? 'opacity-60 cursor-not-allowed saturate-50 !shadow-none' : ''} ${className}`}>
            {iconLeft && React.cloneElement(iconLeft, {className: `w-4 h-4 ${size === 'small' ? 'mr-1.5' : 'mr-2'} ${size !== 'small' ? '-ml-1' : ''} group-hover:scale-105 transition-transform`})}
            {children}
            {iconRight && React.cloneElement(iconRight, {className: `w-4 h-4 ${size === 'small' ? 'ml-1.5' : 'ml-2'} ${size !== 'small' ? '-mr-1' : ''} group-hover:translate-x-0.5 transition-transform`})}
        </button>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[250] p-4 animate-fadeInModal">
            <div className={`bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-150 ease-out animate-scaleUpModal border border-slate-200`}>
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <LucideIcons.AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                         <h3 className="text-lg font-semibold text-slate-800" id="modal-title">{title}</h3>
                         <div className="mt-2">
                             <p className="text-sm text-slate-600">{message}</p>
                         </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <StyledButton onClick={onConfirm} variant="danger" size="medium" className="w-full sm:w-auto"> {confirmText}</StyledButton>
                    <StyledButton onClick={onClose} variant="secondary" size="medium" className="w-full sm:w-auto">{cancelText}</StyledButton>
                </div>
            </div>
        </div>
    );
};

const EditContactModal = ({ isOpen, onClose, contact, onSave }) => {
    const [editedContact, setEditedContact] = useState({ userName: '', email: '', linkedInUrl: '', phoneNo: '' });
    useEffect(() => {
        if (contact) setEditedContact({ id: contact.id, userName: contact.userName || '', email: contact.email || '', linkedInUrl: contact.linkedInUrl || '', phoneNo: contact.phoneNo || '' });
        else setEditedContact({ userName: '', email: '', linkedInUrl: '', phoneNo: '' });
    }, [contact, isOpen]);

    const handleChange = (e) => setEditedContact(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); if (!editedContact.email) { toast.error("Email is required."); return; } onSave(editedContact); };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fadeInModal">
            <div className={`bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-150 ease-out animate-scaleUpModal border border-slate-200`}>
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800">Edit Contact Details</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"><LucideIcons.X size={20} /></button>
                </div>
                 <form onSubmit={handleSubmit}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <InputField label="User Name" name="userName" value={editedContact.userName} onChange={handleChange} icon={<LucideIcons.User />} />
                        <InputField label="Email" name="email" type="email" value={editedContact.email} onChange={handleChange} required icon={<LucideIcons.Mail />} />
                        <InputField label="Phone Number" name="phoneNo" type="tel" value={editedContact.phoneNo} onChange={handleChange} icon={<LucideIcons.Phone />} />
                        <InputField label="LinkedIn URL" name="linkedInUrl" value={editedContact.linkedInUrl} onChange={handleChange} icon={<LucideIcons.Linkedin />} />
                     </div>
                     <div className="mt-6 flex justify-end space-x-3">
                         <StyledButton type="button" variant="secondary" onClick={onClose}>Cancel</StyledButton>
                         <StyledButton type="submit" variant="primary">Save Changes</StyledButton>
                     </div>
                 </form>
            </div>
        </div>
    );
};

const FileProcessingLoader = ({ fileName, progressText = "Processing your file..." }) => (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex flex-col items-center justify-center z-[300] p-4 text-white animate-fadeInModal">
        <div className="mb-6"><LucideIcons.FileCog size={64} className="text-emerald-400 animate-spin-slow" /></div>
        <h2 className="text-2xl font-semibold mb-2">Please Wait</h2>
        <p className="text-slate-300 mb-1 text-center max-w-sm">{progressText}</p>
        {fileName && <p className="text-xs text-emerald-400 font-mono mt-1">{fileName}</p>}
        <div className="w-56 h-2 bg-slate-700 rounded-full overflow-hidden mt-8"><div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 animate-progress-indeterminate"></div></div>
    </div>
);

const ImportStepper = ({ currentStep }) => {
    const steps = ['Upload', 'Map Columns', 'Complete'];
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => {
                const stepIndex = index + 1; const isCompleted = currentStep > stepIndex; const isCurrent = currentStep === stepIndex;
                return (
                    <React.Fragment key={step}>
                        <div className="flex items-center flex-col text-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${isCompleted ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500' : 'bg-slate-200 text-slate-500'}`}>
                                {isCompleted ? <LucideIcons.Check size={24} /> : stepIndex}
                            </div>
                            <p className={`mt-2 text-xs font-semibold max-w-[80px] ${isCurrent || isCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>{step}</p>
                        </div>
                        {index < steps.length - 1 && <div className={`flex-auto border-t-2 transition-all duration-300 mx-2 sm:mx-4 ${isCompleted ? 'border-emerald-600' : 'border-slate-200'}`}></div>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const ContactsManager = () => {
    const [importStep, setImportStep] = useState(0); const [isParsingFile, setIsParsingFile] = useState(false);
    const [fileName, setFileName] = useState(''); const [rawSheetData, setRawSheetData] = useState([]);
    const [headers, setHeaders] = useState([]); const [columnMap, setColumnMap] = useState({ userName: '', email: '', linkedInUrl: '', phoneNo: '' });
    const [contactListName, setContactListName] = useState(''); const [allContactLists, setAllContactLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState(null); const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null); const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); const [searchTerm, setSearchTerm] = useState('');

    const loadContactLists = useCallback(() => { const lists = getContactLists(); setAllContactLists(lists.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))); }, []);
    useEffect(() => { loadContactLists(); }, [loadContactLists]);

    const contactsToDisplay = useMemo(() => {
        if (!selectedListId) return []; const list = allContactLists.find(l => l.id === selectedListId); if (!list) return [];
        let filteredContacts = list.contacts;
        if (searchTerm) filteredContacts = list.contacts.filter(contact => Object.values(contact).some(value => String(value || '').toLowerCase().includes(searchTerm.toLowerCase())));
        return filteredContacts;
    }, [selectedListId, allContactLists, searchTerm]);

    const resetImportProcess = () => {
        setImportStep(0); setFileName(''); setRawSheetData([]); setHeaders([]); setColumnMap({ userName: '', email: '', linkedInUrl: '', phoneNo: '' }); setContactListName('');
    };
    
    const handleStartImport = () => { resetImportProcess(); setImportStep(1); }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsParsingFile(true); setFileName(file.name); setContactListName(file.name.split('.')[0]?.trim() || 'New List');
            const reader = new FileReader();
            reader.onload = (event) => {
                setTimeout(() => {
                    try {
                        const workbook = read(event.target.result, { type: 'binary' }); const sheetName = workbook.SheetNames[0];
                        const jsonData = xlsxUtils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "" });
                        if (jsonData.length > 0 && jsonData[0].length > 0) {
                            setHeaders(jsonData[0].map(String)); setRawSheetData(jsonData.slice(1)); setImportStep(2);
                        } else { toast.error("File is empty or not structured correctly."); resetImportProcess(); }
                    } catch (error) { toast.error("Error parsing file."); resetImportProcess(); }
                    finally { setIsParsingFile(false); }
                }, 1500);
            };
            reader.onerror = () => { toast.error("Error reading file."); setIsParsingFile(false); resetImportProcess(); };
            reader.readAsBinaryString(file);
        }
        e.target.value = null;
    };

    const handleMapChange = (e) => setColumnMap({ ...columnMap, [e.target.name]: e.target.value });

    const mappedPreviewContacts = useMemo(() => {
        if (rawSheetData.length === 0 || headers.length === 0) return [];
        return rawSheetData.slice(0, 5).map(row => ({
            userName: (columnMap.userName && headers.includes(columnMap.userName)) ? row[headers.indexOf(columnMap.userName)] || '' : '',
            email: (columnMap.email && headers.includes(columnMap.email)) ? row[headers.indexOf(columnMap.email)] || '' : '',
            linkedInUrl: (columnMap.linkedInUrl && headers.includes(columnMap.linkedInUrl)) ? row[headers.indexOf(columnMap.linkedInUrl)] || '' : '',
            phoneNo: (columnMap.phoneNo && headers.includes(columnMap.phoneNo)) ? row[headers.indexOf(columnMap.phoneNo)] || '' : '',
        }));
    }, [rawSheetData, headers, columnMap]);

    const handleSaveImportedContacts = () => {
        if (!contactListName.trim()) { toast.warn("Please provide a name for this contact list."); return; }
        if (!columnMap.email) { toast.warn("Email column mapping is required."); return; }
        if (!headers.includes(columnMap.email)) { toast.error("The selected Email column header does not exist."); return; }
        const finalContacts = rawSheetData.map(row => ({
            userName: (columnMap.userName && headers.includes(columnMap.userName)) ? (row[headers.indexOf(columnMap.userName)] || 'N/A') : 'N/A',
            email: headers.includes(columnMap.email) ? (row[headers.indexOf(columnMap.email)] || null) : null,
            linkedInUrl: (columnMap.linkedInUrl && headers.includes(columnMap.linkedInUrl)) ? (row[headers.indexOf(columnMap.linkedInUrl)] || '') : '',
            phoneNo: (columnMap.phoneNo && headers.includes(columnMap.phoneNo)) ? (row[headers.indexOf(columnMap.phoneNo)] || '') : '',
        })).filter(c => c.email && String(c.email).includes('@'));
        if (finalContacts.length === 0) { toast.warn("No valid contacts found after mapping."); return; }
        const newList = addContactList(contactListName.trim(), finalContacts);
        loadContactLists(); setSelectedListId(newList.id); resetImportProcess(); toast.success(`List "${newList.name}" saved!`);
    };

    const promptDeleteList = (id) => { const list = allContactLists.find(l => l.id === id); if(list) { setConfirmAction({ type: 'deleteList', id, name: list.name }); setIsConfirmModalOpen(true); } };
    const promptDeleteContact = (id) => { const list = allContactLists.find(l => l.id === selectedListId); const contact = list?.contacts.find(c => c.id === id); if(contact) { setConfirmAction({ type: 'deleteContact', id, listId: selectedListId, name: contact.email || contact.userName }); setIsConfirmModalOpen(true); } };
    const handleConfirmDeletion = () => {
        if (!confirmAction) return;
        if (confirmAction.type === 'deleteList') {
            deleteContactList(confirmAction.id); toast.success(`List "${confirmAction.name}" deleted.`); if (selectedListId === confirmAction.id) setSelectedListId(null);
        } else if (confirmAction.type === 'deleteContact') {
            if (deleteContactFromList(confirmAction.listId, confirmAction.id)) toast.success(`Contact "${confirmAction.name}" deleted.`); else toast.error("Failed to delete contact.");
        }
        loadContactLists(); setIsConfirmModalOpen(false); setConfirmAction(null);
    };

    const handleOpenEditModal = (contact) => { setEditingContact(contact); setIsEditModalOpen(true); };
    const handleSaveEditedContact = (updatedContact) => {
        if (updateContactInList(selectedListId, updatedContact.id, updatedContact)) {
            loadContactLists(); setIsEditModalOpen(false); setEditingContact(null); toast.success("Contact updated!");
        } else toast.error("Failed to update contact.");
    };

    const renderImportStep1_Upload = () => (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 animate-fadeIn p-6 md:p-8">
            <ImportStepper currentStep={1} />
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Upload Your Contact File</h2>
                <p className="text-base text-slate-500 mt-2 mb-8">Select a .xlsx, .xls, or .csv file.</p>
            </div>
            <div className="group text-center border-2 border-dashed border-slate-300 hover:border-emerald-400 p-6 md:p-8 rounded-lg transition-all duration-300 bg-slate-50/50 hover:bg-emerald-50/50 cursor-pointer" onClick={() => document.getElementById('contact-file-upload').click()}>
                <LucideIcons.UploadCloud size={48} className="mx-auto text-slate-400 group-hover:text-emerald-500 mb-4 transition-colors" />
                <label htmlFor="contact-file-upload" className="cursor-pointer"><span className="font-semibold text-emerald-600">Click to upload</span><span className="text-slate-500"> or drag and drop</span></label>
                <input id="contact-file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".xlsx,.xls,.csv" />
                <p className="text-xs text-slate-400 mt-2">Maximum file size: 10MB</p>
            </div>
            <div className="mt-8 flex justify-center"><StyledButton onClick={resetImportProcess} variant="secondary" iconLeft={<LucideIcons.X />}>Cancel</StyledButton></div>
        </div>
    );

    const renderImportStep2_Map = () => (
        <div className="p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-xl border border-slate-200 animate-fadeIn">
            <ImportStepper currentStep={2} />
             <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Map Columns & Save</h2>
                <p className="text-base text-slate-500 mt-2">Match columns from <span className="font-semibold text-emerald-600">{fileName}</span>.</p>
            </div>
            <InputField label="Contact List Name" name="contactListName" value={contactListName} onChange={(e) => setContactListName(e.target.value)} placeholder="e.g., Q3 Leads" required icon={<LucideIcons.Tag />} className="max-w-md mx-auto" />
            <h3 className="text-base font-semibold text-slate-700 mb-3 mt-6 text-center">Map Your File Columns</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 max-w-5xl mx-auto">
                {[{ field: 'userName', label: 'User Name' }, { field: 'email', label: 'Email', required: true }, { field: 'phoneNo', label: 'Phone No.' }, { field: 'linkedInUrl', label: 'LinkedIn URL' }].map(item => (
                    <div key={item.field} className="mb-3">
                        <label htmlFor={item.field} className="block text-xs font-semibold text-slate-600 mb-1.5">{item.label} {item.required && <span className="text-red-500">*</span>}</label>
                        <select name={item.field} value={columnMap[item.field]} onChange={handleMapChange} required={item.required} className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm bg-white text-slate-800 shadow-sm">
                            <option value="">{item.required ? 'Select Header *' : 'Optional'}</option>
                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                ))}
            </div>
            {mappedPreviewContacts.length > 0 && (
                 <div className="mt-6 max-w-5xl mx-auto">
                     <h4 className="text-sm font-semibold text-slate-700 mb-2">Data Preview</h4>
                     <div className="border border-slate-200 rounded-lg bg-slate-50/70 shadow-inner max-h-52 overflow-y-auto">
                        <div className="hidden sm:block"><table className="min-w-full text-xs"><thead className="bg-slate-100"><tr className="text-left text-slate-500 font-semibold">
                            {columnMap.userName && <th className="p-2">User Name</th>} {columnMap.email && <th className="p-2">Email</th>} {columnMap.phoneNo && <th className="p-2">Phone</th>} {columnMap.linkedInUrl && <th className="p-2">LinkedIn</th>}
                        </tr></thead><tbody className="divide-y divide-slate-200">{mappedPreviewContacts.map((contact, i) => (
                            <tr key={`p-d-${i}`}><td className="p-2 text-slate-600 truncate max-w-[150px]">{columnMap.userName && (contact.userName || '–')}</td><td className="p-2 text-slate-600 truncate max-w-[150px]">{columnMap.email && (contact.email || '–')}</td><td className="p-2 text-slate-600 truncate max-w-[150px]">{columnMap.phoneNo && (contact.phoneNo || '–')}</td><td className="p-2 text-slate-600 truncate max-w-[150px]">{columnMap.linkedInUrl && (contact.linkedInUrl || '–')}</td></tr>
                        ))}</tbody></table></div>
                        <div className="sm:hidden space-y-2 p-2">{mappedPreviewContacts.map((c,i)=>(<div key={`p-m-${i}`} className="p-2 bg-white rounded-md border border-slate-200 text-xs space-y-1">
                            {columnMap.userName && <div><strong className="text-slate-500">Name:</strong> {c.userName || '–'}</div>}
                            {columnMap.email && <div><strong className="text-slate-500">Email:</strong> {c.email || '–'}</div>}
                            {columnMap.phoneNo && <div><strong className="text-slate-500">Phone:</strong> {c.phoneNo || '–'}</div>}
                        </div>))}</div>
                     </div>
                 </div>
             )}
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center max-w-5xl mx-auto">
                <StyledButton onClick={() => setImportStep(1)} variant="secondary" iconLeft={<LucideIcons.ArrowLeft />}>Back</StyledButton>
                <StyledButton onClick={handleSaveImportedContacts} variant="primary" iconRight={<LucideIcons.Save />} disabled={!columnMap.email || !contactListName.trim() || !headers.includes(columnMap.email)}>Save List</StyledButton>
            </div>
        </div>
    );

    const renderManageContacts = () => (
        <div className="animate-fadeIn">
             <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl text-center sm:text-left font-bold tracking-tight">Contact Lists</h1>
                    <p className="text-base text-slate-500 mt-1">Manage your imported lists and contacts.</p>
                </div>
                <StyledButton onClick={handleStartImport} variant="primary" iconLeft={<LucideIcons.PlusCircle />} size="medium" className="w-full sm:w-auto flex-shrink-0">Import New List</StyledButton>
             </div>
            {allContactLists.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center mb-5"><LucideIcons.ArchiveX size={48} className="text-emerald-300" /></div>
                    <p className="text-slate-700 font-semibold text-xl">No Contact Lists Yet</p>
                    <p className="text-sm text-slate-500 mb-6 mt-1">Get started by importing your first list.</p>
                    <StyledButton onClick={handleStartImport} variant="primary" iconLeft={<LucideIcons.UploadCloud />}>Import First List</StyledButton>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 bg-white p-4 rounded-2xl shadow-lg border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 px-1">Your Lists ({allContactLists.length})</h3>
                        <ul className="space-y-2 max-h-[75vh] lg:max-h-[calc(100vh-250px)] overflow-y-auto pr-1 custom-scrollbar">
                            {allContactLists.map(list => (
                                <li key={list.id} className={`p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200 group relative ${selectedListId === list.id ? 'border-emerald-500 bg-emerald-50/70 shadow-md' : 'border-transparent bg-white hover:bg-slate-50 hover:border-emerald-300'}`} onClick={() => { setSelectedListId(list.id); setSearchTerm('');}}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                             <p className={`font-semibold ${selectedListId === list.id ? 'text-emerald-800' : 'text-slate-700 group-hover:text-slate-800'}`}>{list.name}</p>
                                             <p className="text-xs text-slate-500 mt-0.5">{list.contacts.length} contacts</p>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); promptDeleteList(list.id); }} className="p-1.5 rounded-md text-slate-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2" title="Delete list"><LucideIcons.Trash2 size={16} /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="lg:col-span-8 bg-white p-4 rounded-2xl shadow-lg border border-slate-200">
                        {selectedListId && allContactLists.find(l => l.id === selectedListId) ? (
                            <>
                                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                     <div>
                                         <h3 className="text-xl font-semibold text-slate-800">Contacts in: <span className="text-emerald-600">{allContactLists.find(l => l.id === selectedListId)?.name}</span></h3>
                                         <p className="text-xs text-slate-500">{contactsToDisplay.length} of {allContactLists.find(l => l.id === selectedListId)?.contacts.length} contacts shown</p>
                                     </div>
                                     <InputField name="searchTerm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search in list..." icon={<LucideIcons.Search size={16}/>} className="mb-0 w-full sm:max-w-xs"/>
                                </div>
                                <div className="md:hidden space-y-3">{contactsToDisplay.map(contact=>(<div key={contact.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-sm">
                                    <div className="flex justify-between items-start"><div className="font-semibold text-slate-800">{contact.userName||'N/A'}</div><div className="flex items-center space-x-1">
                                        <button onClick={() => handleOpenEditModal(contact)} className="p-2 rounded-md text-slate-500 hover:bg-slate-200"><LucideIcons.Edit3 size={14}/></button>
                                        <button onClick={() => promptDeleteContact(contact.id)} className="p-2 rounded-md text-slate-500 hover:bg-red-100 hover:text-red-600"><LucideIcons.Trash2 size={14}/></button>
                                    </div></div>
                                    <div className="text-slate-600">{contact.email||'N/A'}</div>
                                    <div className="text-slate-600 text-xs">{contact.phoneNo||'N/A'}</div>
                                    {contact.linkedInUrl && <a href={contact.linkedInUrl.startsWith('http')?contact.linkedInUrl:`https://${contact.linkedInUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs inline-flex items-center"><LucideIcons.Linkedin size={14} className="mr-1 text-[#0077B5]"/>View Profile</a>}
                                </div>))}</div>
                                <div className="hidden md:block overflow-x-auto max-h-[calc(100vh-320px)] border border-slate-200 rounded-lg shadow-inner bg-slate-50/30 custom-scrollbar">
                                    <table className="min-w-full text-sm divide-y divide-slate-200"><thead className="bg-slate-50 sticky top-0 z-10"><tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="px-4 py-3">User Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">LinkedIn</th><th className="px-4 py-3 text-center">Actions</th>
                                    </tr></thead><tbody className="bg-white divide-y divide-slate-100">{contactsToDisplay.map(contact => (
                                        <tr key={contact.id} className="hover:bg-emerald-50/50"><td className="px-4 py-3 text-slate-700 font-medium">{contact.userName || '–'}</td><td className="px-4 py-3 text-slate-600">{contact.email || '–'}</td><td className="px-4 py-3 text-slate-600">{contact.phoneNo || '–'}</td><td className="px-4 py-3">
                                            {contact.linkedInUrl ? (<a href={contact.linkedInUrl.startsWith('http') ? contact.linkedInUrl : `https://${contact.linkedInUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs inline-flex items-center truncate max-w-[150px]" title={contact.linkedInUrl}><LucideIcons.Linkedin size={14} className="mr-1.5 shrink-0 text-[#0077B5]" />View Profile</a>) : <span className="text-slate-400 text-xs">N/A</span>}
                                        </td><td className="px-4 py-3 text-center space-x-2">
                                            <button onClick={() => handleOpenEditModal(contact)} className="p-2 rounded-md text-slate-500 hover:bg-slate-200"><LucideIcons.Edit3 size={14}/></button>
                                            <button onClick={() => promptDeleteContact(contact.id)} className="p-2 rounded-md text-slate-500 hover:bg-red-100 hover:text-red-600"><LucideIcons.Trash2 size={14}/></button>
                                        </td></tr>
                                    ))}</tbody></table>
                                </div>
                                {contactsToDisplay.length === 0 && <div className="text-center py-12 text-slate-500 bg-white md:bg-transparent"><LucideIcons.SearchX size={32} className="mx-auto mb-2 text-slate-400"/><span className="font-medium">No Results</span><br/>{searchTerm ? "No contacts match your search." : "This list is empty."}</div>}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-10 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50 min-h-[300px]">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-5"><LucideIcons.MousePointerSquareDashed size={32} className="text-emerald-400"/></div>
                                <p className="font-semibold text-lg text-slate-700">Select a list to view</p>
                                <p className="text-sm mt-1 max-w-xs">Choose a list from the panel on the left to view its contacts.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            {isParsingFile && <FileProcessingLoader fileName={fileName} />}
            <div className="p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen font-sans">
                <div className="max-w-screen-xl mx-auto">
                    {importStep === 0 && renderManageContacts()}
                    {importStep >= 1 && (<div className="max-w-5xl mx-auto">{importStep === 1 && renderImportStep1_Upload()}{importStep === 2 && renderImportStep2_Map()}</div>)}
                    <EditContactModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingContact(null); }} contact={editingContact} onSave={handleSaveEditedContact} />
                    <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmDeletion} title={`Confirm Deletion`} message={`Are you sure you want to delete "${confirmAction?.name || 'this item'}"? This action cannot be undone.`} confirmText="Delete"/>
                </div>
            </div>
            <style jsx global>{`
                 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                 .font-sans { font-family: 'Inter', sans-serif; }
                 @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                 .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                 @keyframes fadeInModal { 0% { opacity: 0; } 100% { opacity: 1; } }
                 .animate-fadeInModal { animation: fadeInModal 0.2s ease-out forwards; }
                 @keyframes scaleUpModal { 0% { transform: scale(0.95) translateY(10px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
                 .animate-scaleUpModal { animation: scaleUpModal 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                 @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                 .animate-spin-slow { animation: spin-slow 2.5s linear infinite; }
                 @keyframes progress-indeterminate { 0% { transform: translateX(-100%) scaleX(0.5); } 50% { transform: translateX(0) scaleX(1); } 100% { transform: translateX(100%) scaleX(0.5); } }
                 .animate-progress-indeterminate { animation: progress-indeterminate 1.5s ease-in-out infinite; }
                 .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                 .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; } .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #bbb; }
            `}</style>
        </>
    );
};

export default ContactsManager;