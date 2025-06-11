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

// --- UI Components with updated GREEN styling ---

const InputField = ({ label, type = 'text', value, onChange, name, placeholder, required = false, icon, accept, className = '', readOnly = false }) => (
    <div className={`mb-4 ${className}`}>
        <label htmlFor={name} className="block text-xs font-semibold text-slate-600 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            {icon && <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">{React.cloneElement(icon, { className: "h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-200"})}</div>}
            <input
                type={type}
                name={name}
                id={name}
                value={value === null || typeof value === 'undefined' ? '' : value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                accept={accept}
                readOnly={readOnly}
                className={`block w-full ${icon ? 'pl-10' : 'px-3'} py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 sm:text-sm placeholder-slate-400 bg-white text-slate-800 shadow-sm hover:border-slate-400 focus:shadow-md ${readOnly ? 'bg-slate-100 cursor-not-allowed' : ''}`}
            />
        </div>
    </div>
);

const StyledButton = ({ onClick, children, type = 'button', variant = 'primary', disabled = false, className = '', iconLeft, iconRight, size = 'medium' }) => {
    const baseStyle = "rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out inline-flex items-center justify-center group transform hover:-translate-y-px active:translate-y-0 shadow-sm";
    const sizeStyles = {
        small: "px-3 py-1.5 text-xs",
        medium: "px-5 py-2.5 text-sm",
        large: "px-6 py-3 text-base",
    };
    const greenButton = "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 focus:ring-emerald-500";
    const variantStyles = {
        primary: greenButton,
        secondary: "bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-400 border border-slate-300 hover:border-slate-400 active:bg-slate-100",
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 focus:ring-red-500",
    };
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? 'opacity-60 cursor-not-allowed saturate-50 !shadow-none' : ''} ${className}`}
        >
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
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                        <div className="mr-3 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:h-10 sm:w-10">
                            <LucideIcons.AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
                        <LucideIcons.X size={20} />
                    </button>
                </div>
                <p className="text-sm text-slate-600 mb-6 ml-16 sm:ml-13">{message}</p>
                <div className="flex justify-end space-x-3">
                    <StyledButton onClick={onClose} variant="secondary" size="medium">{cancelText}</StyledButton>
                    <StyledButton onClick={onConfirm} variant="danger" size="medium">{confirmText}</StyledButton>
                </div>
            </div>
        </div>
    );
};

const EditContactModal = ({ isOpen, onClose, contact, onSave }) => {
    const [editedContact, setEditedContact] = useState({ userName: '', email: '', linkedInUrl: '', phoneNo: '' });

    useEffect(() => {
        if (contact) {
            setEditedContact({
                id: contact.id,
                userName: contact.userName || '',
                email: contact.email || '',
                linkedInUrl: contact.linkedInUrl || '',
                phoneNo: contact.phoneNo || ''
            });
        } else {
             setEditedContact({ userName: '', email: '', linkedInUrl: '', phoneNo: '' });
        }
    }, [contact, isOpen]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedContact(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!editedContact.email) {
            toast.error("Email is required.");
            return;
        }
        onSave(editedContact);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fadeInModal">
            <div className={`bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-150 ease-out animate-scaleUpModal border border-slate-200`}>
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800">Edit Contact Details</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
                        <LucideIcons.X size={20} />
                    </button>
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
        <div className="mb-6">
            <LucideIcons.FileCog size={64} className="text-emerald-400 animate-spin-slow" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Please Wait</h2>
        <p className="text-slate-300 mb-1 text-center max-w-sm">{progressText}</p>
        {fileName && <p className="text-xs text-emerald-400 font-mono mt-1">{fileName}</p>}
        <div className="w-56 h-2 bg-slate-700 rounded-full overflow-hidden mt-8">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 animate-progress-indeterminate"></div>
        </div>
    </div>
);

const ImportStepper = ({ currentStep }) => {
    const steps = ['Upload File', 'Map Columns', 'Complete'];
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => {
                const stepIndex = index + 1;
                const isCompleted = currentStep > stepIndex;
                const isCurrent = currentStep === stepIndex;

                return (
                    <React.Fragment key={step}>
                        <div className="flex items-center flex-col">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${isCompleted ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500' : 'bg-slate-200 text-slate-500'}`}>
                                {isCompleted ? <LucideIcons.Check size={24} /> : stepIndex}
                            </div>
                            <p className={`mt-2 text-xs font-semibold ${isCurrent || isCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>{step}</p>
                        </div>
                        {index < steps.length - 1 && <div className={`flex-auto border-t-2 transition-all duration-300 mx-4 ${isCompleted ? 'border-emerald-600' : 'border-slate-200'}`}></div>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};


const ContactsManager = () => {
    const [importStep, setImportStep] = useState(0);
    const [isParsingFile, setIsParsingFile] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [rawSheetData, setRawSheetData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [columnMap, setColumnMap] = useState({ userName: '', email: '', linkedInUrl: '', phoneNo: '' });
    const [contactListName, setContactListName] = useState('');
    const [allContactLists, setAllContactLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadContactLists = useCallback(() => {
        const lists = getContactLists();
        setAllContactLists(lists.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }, []);

    useEffect(() => {
        loadContactLists();
    }, [loadContactLists]);

    const contactsToDisplay = useMemo(() => {
        if (!selectedListId) return [];
        const list = allContactLists.find(l => l.id === selectedListId);
        if (!list) return [];

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

    const resetImportProcess = () => {
        setImportStep(0);
        setUploadedFile(null);
        setFileName('');
        setRawSheetData([]);
        setHeaders([]);
        setColumnMap({ userName: '', email: '', linkedInUrl: '', phoneNo: '' });
        setContactListName('');
    };
    
    const handleStartImport = () => {
        resetImportProcess();
        setImportStep(1);
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsParsingFile(true);
            setFileName(file.name);
            setUploadedFile(file);
            setContactListName(file.name.split('.')[0]?.trim() || 'New List');
            
            const startTime = Date.now();
            const readFilePromise = new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsBinaryString(file);
            });

            readFilePromise.then(binaryStr => {
                try {
                    const workbook = read(binaryStr, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = xlsxUtils.sheet_to_json(worksheet, { header: 1, defval: "" });

                    const elapsedTime = Date.now() - startTime;
                    const remainingTime = Math.max(0, 2000 - elapsedTime);

                    setTimeout(() => {
                        if (jsonData.length > 0 && jsonData[0].length > 0) {
                            setHeaders(jsonData[0].map(String));
                            setRawSheetData(jsonData.slice(1));
                            setImportStep(2);
                        } else {
                            toast.error("The file is empty or not structured correctly.");
                            resetImportProcess();
                        }
                        setIsParsingFile(false);
                    }, remainingTime);

                } catch (error) {
                    console.error("Error parsing file content:", error);
                    toast.error("Error parsing file. Please ensure it's a valid .xls, .xlsx, or .csv file.");
                    const elapsedTime = Date.now() - startTime;
                    const remainingTime = Math.max(0, 2000 - elapsedTime);
                    setTimeout(() => {
                        resetImportProcess();
                        setIsParsingFile(false);
                    }, remainingTime);
                }
            }).catch(error => {
                console.error("Error reading file:", error);
                toast.error("Error reading file.");
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, 2000 - elapsedTime);
                setTimeout(() => {
                    resetImportProcess();
                    setIsParsingFile(false);
                }, remainingTime);
            });
        }
        e.target.value = null;
    };

    const handleMapChange = (e) => {
        setColumnMap({ ...columnMap, [e.target.name]: e.target.value });
    };

    const mappedPreviewContacts = useMemo(() => {
        if (rawSheetData.length === 0 || headers.length === 0) return [];
        return rawSheetData.slice(0, 5).map(row => {
            const contact = {};
            if (columnMap.userName && headers.includes(columnMap.userName)) {
                contact.userName = row[headers.indexOf(columnMap.userName)] || '';
            }
            if (columnMap.email && headers.includes(columnMap.email)) {
                contact.email = row[headers.indexOf(columnMap.email)] || '';
            }
            if (columnMap.linkedInUrl && headers.includes(columnMap.linkedInUrl)) {
                contact.linkedInUrl = row[headers.indexOf(columnMap.linkedInUrl)] || '';
            }
            if (columnMap.phoneNo && headers.includes(columnMap.phoneNo)) {
                contact.phoneNo = row[headers.indexOf(columnMap.phoneNo)] || '';
            }
            return contact;
        });
    }, [rawSheetData, headers, columnMap]);

    const handleSaveImportedContacts = () => {
        if (!contactListName.trim()) {
            toast.warn("Please provide a name for this contact list.");
            return;
        }
        if (!columnMap.email) {
            toast.warn("Email column mapping is required.");
            return;
        }
        if (!headers.includes(columnMap.email)) {
            toast.error("The selected Email column header does not exist in the file. Please re-check mapping.");
            return;
        }

        const finalContacts = rawSheetData.map((row) => {
            const contact = {};
            contact.userName = (columnMap.userName && headers.includes(columnMap.userName)) ? (row[headers.indexOf(columnMap.userName)] || 'N/A') : 'N/A';
            contact.email = (headers.includes(columnMap.email) ? row[headers.indexOf(columnMap.email)] : null) || null;
            contact.linkedInUrl = (columnMap.linkedInUrl && headers.includes(columnMap.linkedInUrl)) ? (row[headers.indexOf(columnMap.linkedInUrl)] || '') : '';
            contact.phoneNo = (columnMap.phoneNo && headers.includes(columnMap.phoneNo)) ? (row[headers.indexOf(columnMap.phoneNo)] || '') : '';
            return contact;
        }).filter(contact => contact.email && String(contact.email).includes('@'));

        if (finalContacts.length === 0) {
            toast.warn("No valid contacts (with emails) found after mapping. Please check your mappings and file content.");
            return;
        }

        const newList = addContactList(contactListName.trim(), finalContacts);
        loadContactLists();
        setSelectedListId(newList.id);
        resetImportProcess();
        toast.success(`Contact list "${newList.name}" saved successfully!`);
    };

    const promptDeleteList = (listId) => {
        const listToDelete = allContactLists.find(l => l.id === listId);
        if(listToDelete){
            setConfirmAction({ type: 'deleteList', id: listId, name: listToDelete.name });
            setIsConfirmModalOpen(true);
        }
    };

    const promptDeleteContact = (contactId) => {
        const list = allContactLists.find(l => l.id === selectedListId);
        const contactToDelete = list?.contacts.find(c => c.id === contactId);
        if(contactToDelete){
             setConfirmAction({ type: 'deleteContact', id: contactId, listId: selectedListId, name: contactToDelete.email || contactToDelete.userName });
             setIsConfirmModalOpen(true);
        }
    };

    const handleConfirmDeletion = () => {
        if (!confirmAction) return;
        if (confirmAction.type === 'deleteList') {
            deleteContactList(confirmAction.id);
            toast.success(`List "${confirmAction.name}" deleted.`);
            if (selectedListId === confirmAction.id) {
                setSelectedListId(null);
            }
        } else if (confirmAction.type === 'deleteContact') {
            const success = deleteContactFromList(confirmAction.listId, confirmAction.id);
            if (success) toast.success(`Contact "${confirmAction.name}" deleted.`);
            else toast.error("Failed to delete contact.");
        }
        loadContactLists();
        setIsConfirmModalOpen(false);
        setConfirmAction(null);
    };

    const handleOpenEditModal = (contact) => {
        setEditingContact(contact);
        setIsEditModalOpen(true);
    };

    const handleSaveEditedContact = (updatedContact) => {
        if (updatedContact && updatedContact.id && updatedContact.email && selectedListId) {
            const success = updateContactInList(selectedListId, updatedContact.id, updatedContact);
            if (success) {
                loadContactLists();
                setIsEditModalOpen(false);
                setEditingContact(null);
                toast.success("Contact updated successfully!");
            } else {
                toast.error("Failed to update contact. List or contact not found.");
            }
        } else {
            toast.error("Email is required and contact must be valid.");
        }
    };

    const renderImportStep1_Upload = () => (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 animate-fadeIn p-6 md:p-8">
            <ImportStepper currentStep={1} />
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Upload Your Contact File</h2>
                <p className="text-base text-slate-500 mt-2 mb-8">Begin by selecting a .xlsx, .xls, or .csv file from your computer.</p>
            </div>
            <div className="group text-center border-2 border-dashed border-slate-300 hover:border-emerald-400 p-8 rounded-lg transition-all duration-300 bg-slate-50/50 hover:bg-emerald-50/50 cursor-pointer" onClick={() => document.getElementById('contact-file-upload').click()}>
                <LucideIcons.UploadCloud size={48} className="mx-auto text-slate-400 group-hover:text-emerald-500 mb-4 transition-colors" />
                <label htmlFor="contact-file-upload" className="cursor-pointer">
                    <span className="font-semibold text-emerald-600">Click to upload</span>
                    <span className="text-slate-500"> or drag and drop</span>
                </label>
                <input id="contact-file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".xlsx,.xls,.csv" />
                <p className="text-xs text-slate-400 mt-2">Maximum file size: 10MB</p>
            </div>
            <div className="mt-8 flex justify-center">
                <StyledButton onClick={resetImportProcess} variant="secondary" iconLeft={<LucideIcons.X />}>
                    Cancel
                </StyledButton>
            </div>
        </div>
    );

    const renderImportStep2_Map = () => (
        <div className="p-6 md:p-8 bg-white rounded-2xl shadow-xl border border-slate-200 animate-fadeIn">
            <ImportStepper currentStep={2} />
             <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Map Columns & Save</h2>
                <p className="text-base text-slate-500 mt-2">Match columns from <span className="font-semibold text-emerald-600">{fileName}</span> to contact fields.</p>
            </div>
            
            <InputField
                label="Contact List Name"
                name="contactListName"
                value={contactListName}
                onChange={(e) => setContactListName(e.target.value)}
                placeholder="e.g., Q3 Leads, Conference Attendees"
                required
                icon={<LucideIcons.Tag />}
                className="max-w-md mx-auto"
            />
            <h3 className="text-base font-semibold text-slate-700 mb-3 mt-6 text-center">Map Your File Columns</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 max-w-5xl mx-auto">
                {[{ field: 'userName', label: 'User Name' }, { field: 'email', label: 'Email', required: true }, { field: 'phoneNo', label: 'Phone No.' }, { field: 'linkedInUrl', label: 'LinkedIn URL' }].map(mapItem => (
                    <div key={mapItem.field} className="mb-3">
                        <label htmlFor={mapItem.field} className="block text-xs font-semibold text-slate-600 mb-1.5">
                            {mapItem.label} {mapItem.required && <span className="text-red-500">*</span>}
                        </label>
                        <select name={mapItem.field} value={columnMap[mapItem.field]} onChange={handleMapChange} required={mapItem.required} className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm bg-white text-slate-800 shadow-sm">
                            <option value="">{mapItem.required ? 'Select Header *' : 'Optional'}</option>
                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                ))}
            </div>
            {mappedPreviewContacts.length > 0 && (
                 <div className="mt-6 max-w-5xl mx-auto">
                     <h4 className="text-sm font-semibold text-slate-700 mb-2">Data Preview</h4>
                     <div className="overflow-x-auto max-h-48 border border-slate-200 rounded-lg p-1 bg-slate-50/70 text-xs shadow-inner">
                         <table className="min-w-full">
                            <thead className="bg-slate-100"><tr className="text-left text-slate-500 font-semibold">
                                {columnMap.userName && <th className="p-2">User Name</th>}
                                {columnMap.email && <th className="p-2">Email</th>}
                                {columnMap.phoneNo && <th className="p-2">Phone</th>}
                                {columnMap.linkedInUrl && <th className="p-2">LinkedIn</th>}
                            </tr></thead>
                             <tbody className="divide-y divide-slate-200"><tr/>{mappedPreviewContacts.map((contact, index) => (
                                <tr key={`preview-${index}`}><td className="p-2 text-slate-600 truncate max-w-xs">{columnMap.userName && (contact.userName || '–')}</td><td className="p-2 text-slate-600 truncate max-w-xs">{columnMap.email && (contact.email || '–')}</td><td className="p-2 text-slate-600 truncate max-w-xs">{columnMap.phoneNo && (contact.phoneNo || '–')}</td><td className="p-2 text-slate-600 truncate max-w-xs">{columnMap.linkedInUrl && (contact.linkedInUrl || '–')}</td></tr>
                             ))}</tbody>
                         </table>
                     </div>
                 </div>
             )}
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center max-w-5xl mx-auto">
                <StyledButton onClick={() => setImportStep(1)} variant="secondary" iconLeft={<LucideIcons.ArrowLeft />}>Back</StyledButton>
                <StyledButton onClick={handleSaveImportedContacts} variant="primary" iconRight={<LucideIcons.Save />} disabled={!columnMap.email || !contactListName.trim() || headers.length === 0 || !headers.includes(columnMap.email)}>
                    Save Contact List
                </StyledButton>
            </div>
        </div>
    );

    const renderManageContacts = () => (
        <div className="animate-fadeIn">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">Contact Lists</h1>
                    <p className="text-base text-slate-500 mt-1">Manage your imported lists and individual contacts.</p>
                </div>
                <StyledButton onClick={handleStartImport} variant="primary" iconLeft={<LucideIcons.PlusCircle />} size="medium">
                    Import New List
                </StyledButton>
             </div>
            {allContactLists.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center mb-5"><LucideIcons.ArchiveX size={48} className="text-emerald-300" /></div>
                    <p className="text-slate-700 font-semibold text-xl">No Contact Lists Yet</p>
                    <p className="text-sm text-slate-500 mb-6 mt-1">Get started by importing your first contact list.</p>
                    <StyledButton onClick={handleStartImport} variant="primary" iconLeft={<LucideIcons.UploadCloud />}>Import First List</StyledButton>
                </div>
            ) : (
                <div className="grid lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 bg-white p-5 rounded-2xl shadow-lg border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 px-1">Your Lists ({allContactLists.length})</h3>
                        <ul className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 custom-scrollbar">
                            {allContactLists.map(list => (
                                <li key={list.id} className={`p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200 group relative ${selectedListId === list.id ? 'border-emerald-500 bg-emerald-50/70 shadow-md' : 'border-transparent bg-white hover:bg-slate-50 hover:border-emerald-300'}`} onClick={() => { setSelectedListId(list.id); setSearchTerm('');}}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                             <p className={`font-semibold ${selectedListId === list.id ? 'text-emerald-800' : 'text-slate-700 group-hover:text-slate-800'}`}>{list.name}</p>
                                             <p className="text-xs text-slate-500 mt-0.5">{list.contacts.length} contacts</p>
                                             <p className="text-[10px] text-slate-400 mt-1">Created: {new Date(list.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); promptDeleteList(list.id); }} className="p-1.5 rounded-md text-slate-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2" title="Delete list"><LucideIcons.Trash2 size={16} /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="lg:col-span-8 bg-white p-5 rounded-2xl shadow-lg border border-slate-200">
                        {selectedListId && allContactLists.find(l => l.id === selectedListId) ? (
                            <>
                                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                     <div>
                                         <h3 className="text-xl font-semibold text-slate-800">Contacts in: <span className="text-emerald-600">{allContactLists.find(l => l.id === selectedListId)?.name}</span></h3>
                                         <p className="text-xs text-slate-500">{contactsToDisplay.length} of {allContactLists.find(l => l.id === selectedListId)?.contacts.length} contacts shown</p>
                                     </div>
                                     <InputField name="searchTerm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search in this list..." icon={<LucideIcons.Search size={16}/>} className="mb-0 w-full sm:max-w-xs"/>
                                </div>
                                <div className="overflow-x-auto max-h-[calc(100vh-320px)] border border-slate-200 rounded-lg shadow-inner bg-slate-50/30 custom-scrollbar">
                                    <table className="min-w-full text-sm divide-y divide-slate-200">
                                        <thead className="bg-slate-50 sticky top-0 z-10"><tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            <th className="px-4 py-3">User Name</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Phone</th>
                                            <th className="px-4 py-3">LinkedIn</th>
                                            <th className="px-4 py-3 text-center">Actions</th>
                                        </tr></thead>
                                        <tbody className="bg-white divide-y divide-slate-100">{contactsToDisplay.length > 0 ? contactsToDisplay.map(contact => (
                                            <tr key={contact.id} className="hover:bg-emerald-50/50 transition-colors duration-150"><td className="px-4 py-3 whitespace-nowrap text-slate-700 font-medium">{contact.userName || '–'}</td><td className="px-4 py-3 whitespace-nowrap text-slate-600">{contact.email || '–'}</td><td className="px-4 py-3 whitespace-nowrap text-slate-600">{contact.phoneNo || '–'}</td><td className="px-4 py-3 whitespace-nowrap">
                                                {contact.linkedInUrl ? (<a href={contact.linkedInUrl.startsWith('http') ? contact.linkedInUrl : `https://${contact.linkedInUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 hover:underline text-xs flex items-center max-w-[150px] truncate" title={contact.linkedInUrl}><LucideIcons.Linkedin size={14} className="mr-1.5 shrink-0 text-[#0077B5]" /> View Profile <LucideIcons.ExternalLink size={12} className="ml-1 shrink-0" /></a>) : <span className="text-slate-400 text-xs">N/A</span>}
                                            </td><td className="px-4 py-3 whitespace-nowrap text-center space-x-2">
                                                <button onClick={() => handleOpenEditModal(contact)} className="p-2 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"><LucideIcons.Edit3 size={14}/></button>
                                                <button onClick={() => promptDeleteContact(contact.id)} className="p-2 rounded-md text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors"><LucideIcons.Trash2 size={14}/></button>
                                            </td></tr>
                                        )) : (<tr><td colSpan="5" className="text-center py-12 text-slate-500 bg-white">
                                            <LucideIcons.SearchX size={32} className="mx-auto mb-2 text-slate-400"/>
                                            <span className="font-medium">No Results</span><br/>
                                            {searchTerm ? "No contacts match your search." : "This list is empty."}
                                        </td></tr>)}</tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-10 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50 min-h-[300px]">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-5"><LucideIcons.MousePointerSquareDashed size={32} className="text-emerald-400"/></div>
                                <p className="font-semibold text-lg text-slate-700">Select a list to view</p>
                                <p className="text-sm mt-1 max-w-xs">Choose a contact list from the panel on the left to view and manage its contacts.</p>
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
                    {importStep >= 1 && (
                        <div className="max-w-5xl mx-auto">
                            {importStep === 1 && renderImportStep1_Upload()}
                            {importStep === 2 && renderImportStep2_Map()}
                        </div>
                    )}
                    <EditContactModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingContact(null); }} contact={editingContact} onSave={handleSaveEditedContact} />
                    <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmDeletion} title={`Confirm Deletion`} message={`Are you sure you want to delete "${confirmAction?.name || 'this item'}"? This action cannot be undone.`} confirmText="Delete"/>
                </div>
            </div>
            <style jsx global>{`
                 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
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
                 
                 .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                 .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                 .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
                 .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #bbb; }
            `}</style>
        </>
    );
};

export default ContactsManager;