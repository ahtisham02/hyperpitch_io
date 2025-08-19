import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import * as LucideIcons from 'lucide-react';
import getapiRequest from '../../../utils/getapiRequest'; // Assuming a generic helper exists

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

const FullScreenLoader = ({ text }) => (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex flex-col items-center justify-center z-[300] p-4 text-white animate-fadeInModal">
        <LucideIcons.LoaderCircle size={48} className="text-emerald-400 animate-spin" />
        <p className="text-slate-300 mt-4 text-center max-w-sm">{text}</p>
    </div>
);

const ImportContactsView = ({ onCancel, onListUploaded }) => {
    const [listName, setListName] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const token = useSelector((state) => state.auth.userToken);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (!listName) {
                setListName(selectedFile.name.split('.').slice(0, -1).join('.').trim());
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
        formData.append('listName', listName);
        formData.append('file', file);
        try {
            await getapiRequest('post', '/contacts', formData, token, {
                'Content-Type': 'multipart/form-data',
            });
            toast.success(`List "${listName}" has been successfully uploaded.`);
            onListUploaded();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to upload contact list.';
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            {isUploading && <FullScreenLoader text="Uploading and processing your list..." />}
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 animate-fadeIn p-6 md:p-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800">Upload New Contact List</h2>
                        <p className="text-base text-slate-500 mt-2 mb-8">Your file will be processed on the server. Ensure it contains headers like 'email', 'userName', etc.</p>
                    </div>

                    <InputField
                        label="Contact List Name"
                        name="listName"
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        placeholder="e.g., Q4 Leads"
                        required
                        icon={<LucideIcons.Tag />}
                        className="max-w-md mx-auto"
                    />

                    <div className="group text-center border-2 border-dashed border-slate-300 hover:border-emerald-400 p-6 rounded-lg transition-all duration-300 bg-slate-50/50 hover:bg-emerald-50/50 cursor-pointer mt-6" onClick={() => document.getElementById('contact-file-upload').click()}>
                        <LucideIcons.UploadCloud size={48} className="mx-auto text-slate-400 group-hover:text-emerald-500 mb-4 transition-colors" />
                        <input id="contact-file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".xlsx,.xls,.csv" />
                        {!file ? (
                            <>
                                <label htmlFor="contact-file-upload" className="cursor-pointer"><span className="font-semibold text-emerald-600">Click to upload</span><span className="text-slate-500"> or drag and drop</span></label>
                                <p className="text-xs text-slate-400 mt-2">.xlsx, .xls, or .csv files are supported</p>
                            </>
                        ) : (
                            <div>
                                <p className="font-semibold text-slate-700">{file.name}</p>
                                <p className="text-xs text-slate-500 mt-1">({(file.size / 1024).toFixed(1)} KB) - Click to change file</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
                        <StyledButton onClick={onCancel} variant="secondary" iconLeft={<LucideIcons.X />}>Cancel</StyledButton>
                        <StyledButton onClick={handleUpload} variant="primary" iconRight={<LucideIcons.Save />} disabled={!file || !listName.trim() || isUploading}>
                            {isUploading ? 'Uploading...' : 'Upload & Save List'}
                        </StyledButton>
                    </div>
                </div>
            </div>
        </>
    );
};

const ContactsManager = () => {
    const [isImportView, setIsImportView] = useState(false);
    const [allContactLists, setAllContactLists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedListId, setSelectedListId] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const token = useSelector((state) => state.auth.userToken);

    const loadContactLists = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await getapiRequest('get', '/contacts', null, token);
            setAllContactLists(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            toast.error("Could not fetch contact lists.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadContactLists();
    }, [loadContactLists]);

    const contactsToDisplay = useMemo(() => {
        if (!selectedListId) return [];
        const list = allContactLists.find(l => l.id === selectedListId);
        if (!list || !list.contacts) return [];

        let filteredContacts = list.contacts;
        if (searchTerm) {
            filteredContacts = list.contacts.filter(contact =>
                Object.values(contact).some(value =>
                    String(value || '').toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
        return filteredContacts;
    }, [selectedListId, allContactLists, searchTerm]);
    
    const handleListUploaded = () => {
        setIsImportView(false);
        loadContactLists();
    };
    
    const promptDeleteList = (list) => {
        if(list) {
            setConfirmAction({ type: 'deleteList', id: list.id, name: list.name });
            setIsConfirmModalOpen(true);
        }
    };
    
    const handleConfirmDeletion = async () => {
        if (!confirmAction || confirmAction.type !== 'deleteList') return;
        
        try {
            await getapiRequest('delete', `/contacts/${confirmAction.id}`, null, token);
            toast.success(`List "${confirmAction.name}" was deleted.`);
            if (selectedListId === confirmAction.id) {
                setSelectedListId(null);
            }
            loadContactLists();
        } catch (error) {
            toast.error("Failed to delete the list.");
        } finally {
            setIsConfirmModalOpen(false);
            setConfirmAction(null);
        }
    };

    const renderManageContacts = () => (
        <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl text-center sm:text-left font-bold tracking-tight">Contact Lists</h1>
                    <p className="text-base text-slate-500 mt-1">Manage your imported lists and contacts.</p>
                </div>
                <StyledButton onClick={() => setIsImportView(true)} variant="primary" iconLeft={<LucideIcons.PlusCircle />} size="medium" className="w-full sm:w-auto flex-shrink-0">Import New List</StyledButton>
            </div>
            
            {isLoading ? (
                 <div className="text-center py-16"><LucideIcons.LoaderCircle className="w-10 h-10 animate-spin text-emerald-600 mx-auto" /></div>
            ) : allContactLists.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center mb-5"><LucideIcons.ArchiveX size={48} className="text-emerald-300" /></div>
                    <p className="text-slate-700 font-semibold text-xl">No Contact Lists Yet</p>
                    <p className="text-sm text-slate-500 mb-6 mt-1">Get started by importing your first list.</p>
                    <StyledButton onClick={() => setIsImportView(true)} variant="primary" iconLeft={<LucideIcons.UploadCloud />}>Import First List</StyledButton>
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
                                             <p className="text-xs text-slate-500 mt-0.5">{list.contacts?.length || 0} contacts</p>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); promptDeleteList(list); }} className="p-1.5 rounded-md text-slate-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2" title="Delete list"><LucideIcons.Trash2 size={16} /></button>
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
                                         <p className="text-xs text-slate-500">{contactsToDisplay.length} of {allContactLists.find(l => l.id === selectedListId)?.contacts?.length || 0} contacts shown</p>
                                     </div>
                                     <InputField name="searchTerm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search in list..." icon={<LucideIcons.Search size={16}/>} className="mb-0 w-full sm:max-w-xs"/>
                                </div>
                                <div className="overflow-x-auto max-h-[calc(100vh-320px)] border border-slate-200 rounded-lg shadow-inner bg-slate-50/30 custom-scrollbar">
                                    <table className="min-w-full text-sm divide-y divide-slate-200"><thead className="bg-slate-50 sticky top-0 z-10"><tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="px-4 py-3">User Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">LinkedIn</th>
                                    </tr></thead><tbody className="bg-white divide-y divide-slate-100">{contactsToDisplay.map((contact, index) => (
                                        <tr key={contact.id || index} className="hover:bg-emerald-50/50"><td className="px-4 py-3 text-slate-700 font-medium">{contact.userName || '–'}</td><td className="px-4 py-3 text-slate-600">{contact.email || '–'}</td><td className="px-4 py-3 text-slate-600">{contact.phoneNo || '–'}</td><td className="px-4 py-3">
                                            {contact.linkedInUrl ? (<a href={contact.linkedInUrl.startsWith('http') ? contact.linkedInUrl : `https://${contact.linkedInUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs inline-flex items-center truncate max-w-[150px]" title={contact.linkedInUrl}><LucideIcons.Linkedin size={14} className="mr-1.5 shrink-0 text-[#0077B5]" />View Profile</a>) : <span className="text-slate-400 text-xs">N/A</span>}
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
            <div className="p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen font-sans">
                <div className="max-w-screen-xl mx-auto">
                    {isImportView ?
                        <ImportContactsView onCancel={() => setIsImportView(false)} onListUploaded={handleListUploaded} />
                        : renderManageContacts()
                    }
                    <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmDeletion} title={`Confirm Deletion`} message={`Are you sure you want to delete "${confirmAction?.name || 'this item'}"? This action cannot be undone.`} confirmText="Delete"/>
                </div>
            </div>
        </>
    );
};

export default ContactsManager;