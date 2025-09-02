import React, { useState, useMemo, useEffect, useLayoutEffect } from "react";
import * as XLSX from "xlsx";
import * as LucideIcons from "lucide-react";
import { UserCheck, UsersRound as AudienceIcon, FileText } from "lucide-react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { getContactLists } from "../../../utils/localStorageHelper";
import getapiRequest from "../../../utils/getapiRequest";
import { useCredits } from "../../../utils/creditHelper";
import ElementBuilderPage, { PagePreviewRenderer } from "./Header";
import { mockTemplates } from "../../../utils/mockTemplates";

const mockGenerateId = (prefix = "tpl-id") => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
const TopStepperNav = ({ currentStep, steps, setCurrentStep, canProceed }) => (
    <nav className="w-full py-4 px-2 md:px-0 mb-6 md:mb-8">
        <ol role="list" className="flex items-center">
            {steps.map((step, stepIdx) => (
                <React.Fragment key={step.id}>
                    <li>
                        <button
                            onClick={() => (step.id < currentStep || (step.id === currentStep + 1 && canProceed()) || step.id === currentStep ? setCurrentStep(step.id) : null)}
                            disabled={step.id > currentStep + 1 && !(step.id < currentStep || (step.id === currentStep + 1 && canProceed()))}
                            className={`group flex flex-col items-center text-center p-2 rounded-md transition-colors duration-200 ${step.id < currentStep || (step.id === currentStep + 1 && canProceed()) || step.id === currentStep ? "cursor-pointer hover:bg-slate-200/50" : "cursor-not-allowed opacity-60"}`}>
                            <span className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold border-2 transition-all duration-200 ${currentStep > step.id ? "bg-[#2e8b57] border-green-500 text-white" : ""} ${currentStep === step.id ? "bg-[#2e8b57] border-green-600 text-white scale-110 shadow-lg" : ""} ${currentStep < step.id ? "bg-slate-200 border-slate-300 text-slate-500 group-hover:border-slate-400" : ""}`}>
                                {currentStep > step.id ? <LucideIcons.Check size={20} strokeWidth={3} /> : step.id}
                            </span>
                            <span className={`mt-2 text-xs font-semibold max-w-[60px] sm:max-w-[80px] md:max-w-xs truncate transition-colors duration-200 ${currentStep === step.id ? "text-green-700" : ""} ${currentStep > step.id ? "text-slate-700" : ""} ${currentStep < step.id ? "text-slate-500" : ""}`}>
                                {step.name}
                            </span>
                        </button>
                    </li>
                    {stepIdx < steps.length - 1 && <div className={`flex-auto border-t-2 transition-colors duration-300 ${currentStep > step.id ? "border-green-500" : "border-slate-300"}`} />}
                </React.Fragment>
            ))}
        </ol>
    </nav>
);
const InputField = ({ label, type = "text", value, onChange, name, placeholder, required = false, icon, accept, className = "" }) => (
    <div className={`mb-5 ${className}`}>
        <label htmlFor={name} className="block text-xs font-medium text-slate-600 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
        <div className="relative group">
            {icon && <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">{React.cloneElement(icon, { className: "h-4 w-4 text-slate-400 group-focus-within:text-green-600 transition-colors duration-200" })}</div>}
            <input type={type} name={name} id={name} value={value === null || typeof value === "undefined" ? "" : value} onChange={onChange} placeholder={placeholder} required={required} accept={accept} className={`block w-full ${icon ? "pl-9" : "px-3"} py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 transition-all duration-200 sm:text-sm placeholder-slate-400 bg-white text-slate-800 shadow-sm hover:border-slate-400 focus:shadow-md`} />
        </div>
    </div>
);
const StyledButton = ({ onClick, children, type = "button", variant = "primary", disabled = false, className = "", iconLeft, iconRight }) => {
    const baseStyle = "px-5 py-2 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out inline-flex items-center justify-center group transform hover:-translate-y-px active:translate-y-0";
    const greenButton = "bg-[#2e8b57] hover:bg-green-700 text-white shadow-md hover:shadow-lg focus:ring-green-500 focus:ring-offset-white active:bg-green-800";
    const variantStyles = { primary: greenButton, secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400 border border-slate-300 hover:border-slate-400 shadow-sm hover:shadow-md active:bg-slate-300 focus:ring-offset-white", launch: `${greenButton} text-base px-6 py-2.5`, success: `${greenButton} text-base px-6 py-2.5` };
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variantStyles[variant]} ${disabled ? "opacity-60 cursor-not-allowed saturate-50" : ""} ${className}`}>
            {iconLeft && React.cloneElement(iconLeft, { className: "w-4 h-4 mr-1.5 -ml-1 group-hover:scale-105 transition-transform" })}
            {children}
            {iconRight && React.cloneElement(iconRight, { className: "w-4 h-4 ml-1.5 -mr-1 group-hover:translate-x-0.5 transition-transform" })}
        </button>
    );
};
const OptionCard = ({ title, description, selected, onClick, icon, disabled = false }) => (
    <button type="button" onClick={onClick} disabled={disabled} className={`w-full p-4 border rounded-xl text-left transition-all duration-150 ease-in-out group ${selected ? "border-green-500 bg-green-50 ring-1 ring-green-500/80 shadow-lg transform scale-[1.01]" : `border-slate-300 bg-white ${disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : "hover:border-green-400/70 hover:bg-green-50/30 hover:shadow-md"}`}`}>
        <div className="flex items-center">
            {icon && <div className={`mr-3 p-2 rounded-lg transition-colors duration-150 ${selected ? "bg-green-100 text-green-600" : `bg-slate-100 text-slate-500 ${!disabled ? "group-hover:bg-slate-200 group-hover:text-slate-600" : ""}`}`}>{React.cloneElement(icon, { className: "w-5 h-5" })}</div>}
            <div className="flex-1">
                <h3 className={`text-sm font-semibold ${selected ? "text-green-700" : `text-slate-700 ${!disabled ? "group-hover:text-slate-800" : ""}`}`}>{title}</h3>
                {description && <p className={`text-xs text-slate-500 mt-0.5 ${!disabled ? "group-hover:text-slate-600" : ""}`}>{description}</p>}
            </div>
            {selected && <div className="w-4 h-4 rounded-full bg-[#2e8b57] flex items-center justify-center ml-2 shrink-0"><LucideIcons.Check className="h-2.5 w-2.5 text-white" strokeWidth={3} /></div>}
        </div>
    </button>
);
const SummaryCard = ({ title, icon, children }) => (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-md font-semibold text-slate-700 mb-3 flex items-center">
            {React.cloneElement(icon, { className: "w-5 h-5 mr-2 text-green-600 stroke-[2]" })} {title}
        </h3>
        <div className="space-y-1.5 text-xs text-slate-600">{children}</div>
    </div>
);
const PublishSuccessModal = ({ isOpen, onAddDomain, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-800/40 backdrop-blur-sm flex items-center justify-center z-[300] p-4 animate-fadeInModal">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg text-center transform animate-scaleUpModal border border-slate-200">
                <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-100 mb-5 sm:mb-6 ring-4 ring-green-200/70">
                    <svg className="checkmark h-8 w-8 sm:h-10 sm:w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                        <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Template Saved!</h3>
                <p className="text-slate-500 mb-8">Your template has been successfully saved and loaded.</p>
                <div className="border-t border-slate-200 pt-6">
                    <h4 className="font-semibold text-slate-700 mb-1">Ready to continue?</h4>
                    <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">You can now review your campaign and proceed to the next step.</p>
                    <div className="flex justify-center">
                        <StyledButton onClick={onClose} variant="primary">Continue to Review</StyledButton>
                    </div>
                </div>
            </div>
            <style jsx>{` @keyframes fadeInModal { 0% { opacity: 0; } 100% { opacity: 1; } } .animate-fadeInModal { animation: fadeInModal 0.15s ease-out forwards; } @keyframes scaleUpModal { 0% { transform: scale(0.95) translateY(10px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } } .animate-scaleUpModal { animation: scaleUpModal 0.2s cubic-bezier(0.22, 1, 0.36, 1) 0.05s forwards; } .checkmark__circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 3; stroke-miterlimit: 10; stroke: #4ade80; fill: none; animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.3s forwards; } .checkmark__check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; stroke-width: 4; stroke: #16a34a; animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.7s forwards; } @keyframes stroke { 100% { stroke-dashoffset: 0; } } `}</style>
        </div>
    );
};
const initialCampaignDetails = { campaignName: "", startTime: "", endTime: "" };
    const initialDataSource = { type: null, file: null, fileName: "", contactListId: null, selectedContactIds: [] };
const initialTemplateConfig = { type: null, selectedTemplateId: null, templateData: null, editingTemplate: null };

export default function CampaignCreatorPage() {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { credits, deductCredits, CAMPAIGN_COST } = useCredits();
    const token = useSelector((state) => state.auth.userToken);

    const [isEditing, setIsEditing] = useState(!!campaignId);
    const [isLoading, setIsLoading] = useState(!!campaignId);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [campaignDetails, setCampaignDetails] = useState(initialCampaignDetails);
    const [dataSource, setDataSource] = useState(initialDataSource);
    const [availableContactLists, setAvailableContactLists] = useState([]);
    const [contactsInSelectedList, setContactsInSelectedList] = useState([]);
    const [searchTermInList, setSearchTermInList] = useState("");
    const [templateConfig, setTemplateConfig] = useState(initialTemplateConfig);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [fileError, setFileError] = useState("");
    const [showContactDropdown, setShowContactDropdown] = useState(false);
    const [showTemplateEditor, setShowTemplateEditor] = useState(false);

    // Save campaign data to localStorage whenever it changes
    useEffect(() => {
        // Only save if we have meaningful data
        if (campaignDetails.campaignName || dataSource.type || templateConfig.type) {
            const campaignData = {
                campaignDetails,
                dataSource,
                templateConfig,
                currentStep
            };
            localStorage.setItem('campaign_creator_data', JSON.stringify(campaignData));

        }
    }, [campaignDetails, dataSource, templateConfig, currentStep]);

    // Save template data separately for better persistence
    useEffect(() => {
        if (templateConfig.templateData && templateConfig.templateData.pages) {
            localStorage.setItem('campaign_template_data', JSON.stringify(templateConfig.templateData));

        }
    }, [templateConfig.templateData]);

    // Load campaign data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('campaign_creator_data');
        if (savedData && !campaignId) { // Only load if not editing existing campaign
            try {
                const parsedData = JSON.parse(savedData);

                
                // Only restore data if it's not empty/null
                if (parsedData.campaignDetails && Object.keys(parsedData.campaignDetails).length > 0) {
                    setCampaignDetails(parsedData.campaignDetails);
                }
                if (parsedData.dataSource && Object.keys(parsedData.dataSource).length > 0) {
                    setDataSource(parsedData.dataSource);
                }
                if (parsedData.templateConfig && Object.keys(parsedData.templateConfig).length > 0) {
                    setTemplateConfig(parsedData.templateConfig);
                }
                if (parsedData.currentStep && parsedData.currentStep >= 1 && parsedData.currentStep <= 4) {
                    setCurrentStep(parsedData.currentStep);
                }
            } catch (error) {
                console.error('Error loading saved campaign data:', error);
            }
        }
    }, [campaignId]);

    // Auto-sync template data from location.state when component mounts
    useEffect(() => {
        if (location.state?.fromEditor && location.state?.templateData && !templateConfig.templateData) {

            const newTemplateConfig = {
                type: "create",
                templateData: location.state.templateData,
                editingTemplate: location.state.templateData
            };
            setTemplateConfig(newTemplateConfig);
        }
    }, [location.state, templateConfig.templateData]);

    // Load template data from localStorage if available
    useEffect(() => {
        const savedTemplateData = localStorage.getItem('campaign_template_data');
        if (savedTemplateData && !templateConfig.templateData) {
            try {
                const parsedTemplateData = JSON.parse(savedTemplateData);

                
                // Only load if it has valid structure
                if (parsedTemplateData.pages && parsedTemplateData.activePageId) {
                    setTemplateConfig(prev => ({
                        ...prev,
                        type: "create",
                        templateData: parsedTemplateData,
                        editingTemplate: parsedTemplateData
                    }));
                }
            } catch (error) {
                console.error('Error loading template data from localStorage:', error);
            }
        }
    }, [templateConfig.templateData]);

    const getEmptyBuilderState = () => {
        const pageId = mockGenerateId("page");
        return { 
            pages: { 
                [pageId]: { 
                    id: pageId, 
                    name: "Untitled", 
                    layout: []
                }
            }, 
            activePageId: pageId,
            globalNavbar: null,
            globalFooter: null,
            pageTitle: "Untitled"
        };
    };

    const templates = useMemo(() => mockTemplates(), []);
    
         // Handle return from template editor
     useEffect(() => {
         if (location.state?.fromEditor && location.state?.templateData) {
             
             
             // Set template config first
             const newTemplateConfig = {
                 type: "create",
                 templateData: location.state.templateData,
                 editingTemplate: location.state.templateData
             };
     
             setTemplateConfig(newTemplateConfig);
             
             // Force a re-render to ensure state is updated
             setTimeout(() => {
         
                 setTemplateConfig(prev => ({
                     ...prev,
                     type: "create",
                     templateData: location.state.templateData,
                     editingTemplate: location.state.templateData
                 }));
             }, 100);
             
             // Then set step and update URL
             setCurrentStep(3);
             
             // URL will be updated automatically by the useEffect above
     
             
             toast.success("Template loaded successfully! Review your template.");
         }
     }, [location.state]);

    // Use useLayoutEffect to ensure step is set immediately when returning from editor
    useLayoutEffect(() => {
        if (location.state?.fromEditor && location.state?.templateData) {
    
            setCurrentStep(3);
        }
    }, [location.state]);

    // Simple URL handling - only update URL when step changes, don't read from it
    useEffect(() => {
        // Skip if we're returning from template editor
        if (location.state?.fromEditor) return;
        
        const url = new URL(window.location);
        url.searchParams.set('step', currentStep.toString());
        window.history.replaceState({}, '', url);
    }, [currentStep, location.state]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showContactDropdown && !event.target.closest('.relative')) {
                setShowContactDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showContactDropdown]);
    
    // Create sample contacts if none exist (for testing purposes)
    useEffect(() => {
        const createSampleContacts = () => {
            const existingContacts = localStorage.getItem('contactImports');
            if (!existingContacts) {
                const sampleContacts = [{
                    id: 'sample-list-1',
                    listName: 'Sample Contacts',
                    name: 'Sample Contacts',
                    contacts: [
                        { id: 'contact-1', userName: 'John Smith', email: 'john.smith@example.com' },
                        { id: 'contact-2', userName: 'Sarah Johnson', email: 'sarah.johnson@example.com' },
                        { id: 'contact-3', userName: 'Mike Davis', email: 'mike.davis@example.com' }
                    ],
                    createdAt: new Date().toISOString(),
                    contactCount: 3
                }];
                localStorage.setItem('contactImports', JSON.stringify(sampleContacts));
            }
        };
        
        createSampleContacts();
    }, []);

    useEffect(() => {
        const loadCampaignForEdit = async () => {
            if (campaignId && token) {
                setIsLoading(true);
                try {
                    const response = await getapiRequest('get', `/campaigns/${campaignId}`, {}, token);
                    const campaignToEdit = response.data;
                    setCampaignDetails({
                        campaignName: campaignToEdit.campaignName || "",
                        startTime: campaignToEdit.startTime ? new Date(campaignToEdit.startTime).toISOString().slice(0, 16) : "",
                        endTime: campaignToEdit.endTime ? new Date(campaignToEdit.endTime).toISOString().slice(0, 16) : "",
                    });
                    setDataSource({
                        type: campaignToEdit.audienceFile ? 'file' : 'fromContacts',
                        file: null,
                        fileName: campaignToEdit.audienceFile || "",
                        contactListId: campaignToEdit.contactListId || null,
                        selectedContactIds: [],
                    });
                    setTemplateConfig({
                        type: "edit",
                        selectedTemplateId: null,
                        templateData: campaignToEdit.script ? JSON.parse(campaignToEdit.script) : getEmptyBuilderState(),
                        editingTemplate: campaignToEdit.script ? JSON.parse(campaignToEdit.script) : getEmptyBuilderState(),
                    });
                } catch (error) {
                    toast.error("Campaign not found. Redirecting to create new.");
                    navigate("/campaigns/create");
                } finally {
                    setIsLoading(false);
                }
                         } else if (!campaignId) {
                 // Don't reset campaign states if we're returning from template editor
                 if (!location.state?.fromEditor) {
             
                     resetCampaignStates();
                                   } else {
              
                      // Don't load from localStorage here - let the main useEffect handle it
                      // Just ensure we don't reset the states
                  }
                 setIsLoading(false);
             }
        };
        loadCampaignForEdit();
    }, [campaignId, navigate, token]);

    const steps = [{ id: 1, name: "Campaign Details" }, { id: 2, name: "Audience Source" }, { id: 3, name: "Template Design" }, { id: 4, name: "Review & Save" }];

    useEffect(() => {
        if (dataSource.type === "fromContacts") {
            // Get contacts from both sources: hyperpitch_contact_lists and contactImports
            const hyperpitchLists = getContactLists();
            const contactImports = JSON.parse(localStorage.getItem('contactImports') || '[]');
            
            
            
            // Convert contactImports to the expected format
            const convertedImports = contactImports.map(importData => ({
                id: importData.id,
                name: importData.listName || importData.name,
                contacts: importData.contacts || []
            }));
            
            const allLists = [...convertedImports, ...hyperpitchLists];

            setAvailableContactLists(allLists);
            
            if (dataSource.contactListId) {
                const currentList = allLists.find((l) => l.id === dataSource.contactListId);

                if (currentList) {

                    setContactsInSelectedList(currentList.contacts);
                } else { 
                    setDataSource((prev) => ({ ...prev, contactListId: null, selectedContactIds: [] })); 
                    setContactsInSelectedList([]); 
                }
            }
        } else {
            setAvailableContactLists([]); setContactsInSelectedList([]); setSearchTermInList("");
        }
    }, [dataSource.type, dataSource.contactListId]);

    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setCampaignDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleDataSourceChange = (e) => {
        const { name, value, type, files, checked } = e.target;
        if (name === "fileUpload" && type === "file") {
            const file = files[0];
            if (!file) {
                setDataSource((prev) => ({ ...prev, file: null, fileName: "" })); setFileError(""); return;
            }
            const validExtensions = [".xls", ".xlsx"];
            const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
            if (!validExtensions.includes(fileExtension)) {
                toast.error("Invalid file type. Please select an .xls or .xlsx file."); setFileError("Invalid file type."); setDataSource((prev) => ({ ...prev, file: null, fileName: "" })); e.target.value = null; return;
            }
            setFileError(""); setDataSource((prev) => ({ ...prev, file: file, fileName: file.name }));
        } else if (name === "contactListId") {
            const selectedList = availableContactLists.find((l) => l.id === value);
            // Reset selected contacts when changing lists
            setDataSource((prev) => ({ ...prev, contactListId: value, selectedContactIds: [] }));
            setContactsInSelectedList(selectedList ? selectedList.contacts : []);
            setSearchTermInList("");
        } else if (name && name.startsWith("contact-select-")) {
            const contactId = name.split("contact-select-")[1];

            
            // Handle contact selection with unique identifiers
            if (contactId && contactId !== 'undefined' && contactId !== 'null') {
                setDataSource((prev) => {
                    if (checked) {
                        // Add contact if not already selected
                        if (!prev.selectedContactIds.includes(contactId)) {
                            const newSelectedIds = [...prev.selectedContactIds, contactId];

                            return { ...prev, selectedContactIds: newSelectedIds };
                        }
                    } else {
                        // Remove contact if selected
                        const newSelectedIds = prev.selectedContactIds.filter((id) => id !== contactId);

                        return { ...prev, selectedContactIds: newSelectedIds };
                    }
                    return prev;
                });
            } else {
                console.error('Invalid contact ID:', contactId);
            }
        }
    };

    const handleDataSourceTypeChange = (newType) => {
        setDataSource((prev) => ({ ...prev, type: newType, file: newType !== "file" ? null : prev.file, fileName: newType !== "file" ? "" : prev.fileName, contactListId: newType !== "fromContacts" ? null : prev.contactListId, selectedContactIds: newType !== "fromContacts" ? [] : prev.selectedContactIds }));
    };

    const filteredContactsForSelection = useMemo(() => {
        if (!searchTermInList) return contactsInSelectedList;
        return contactsInSelectedList.filter((contact) => String(contact.userName || "").toLowerCase().includes(searchTermInList.toLowerCase()) || String(contact.email || "").toLowerCase().includes(searchTermInList.toLowerCase()));
    }, [contactsInSelectedList, searchTermInList]);

    const canProceedToNext = () => {
        switch (currentStep) {
            case 1: return !!(campaignDetails.campaignName && campaignDetails.startTime && campaignDetails.endTime);
            case 2: 
                if (dataSource.type === "file") return !!dataSource.file || !!dataSource.fileName; 
                else if (dataSource.type === "fromContacts") return !!(dataSource.contactListId && dataSource.selectedContactIds.length > 0); 
                return false;
            case 3: return (templateConfig.type && !!templateConfig.templateData) || (location.state?.fromEditor && location.state?.templateData);
            default: return true;
        }
    };

    const nextStep = () => { if (canProceedToNext()) setCurrentStep((prev) => Math.min(prev + 1, steps.length)); };
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
    const resetCampaignStates = () => { 
        setCampaignDetails(initialCampaignDetails); 
        setDataSource(initialDataSource); 
        setTemplateConfig(initialTemplateConfig); 
        setCurrentStep(1); 
        setContactsInSelectedList([]); 
        setSearchTermInList(""); 
        setIsEditing(false); 
        setFileError(""); 
        // Only clear localStorage if not returning from template editor
        if (!location.state?.fromEditor) {
            localStorage.removeItem('campaign_creator_data');
    
        } else {

        }
    };

    const handleSaveCampaign = async () => {
        if (!campaignDetails.campaignName) { toast.warn("Campaign Name is required."); setCurrentStep(1); return; }
        if (!isEditing) { if (credits < CAMPAIGN_COST) { toast.error(`Not enough credits. Required: ${CAMPAIGN_COST}, Balance: ${credits}.`); return; } }
        
        setIsSubmitting(true);
        const BASE_URL = import.meta.env.VITE_API_BASE_URL;

        const formData = new FormData();
        formData.append('campaignName', campaignDetails.campaignName);
        formData.append('startTime', new Date(campaignDetails.startTime).toISOString());
        formData.append('endTime', new Date(campaignDetails.endTime).toISOString());
        formData.append('script', JSON.stringify(templateConfig.templateData || {}));

        if (dataSource.type === 'file' && dataSource.file) {
            formData.append('audienceFile', dataSource.file, dataSource.fileName);
        }
        if (dataSource.type === 'fromContacts' && dataSource.contactListId) {
            formData.append('contactListId', dataSource.contactListId);
        }
        
        const axiosConfig = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        try {
            if (isEditing) {
                await axios.put(`${BASE_URL}/campaigns/${campaignId}`, formData, axiosConfig);
                toast.success("Campaign updated successfully!");
            } else {
                await axios.post(`${BASE_URL}/campaigns`, formData, axiosConfig);
                deductCredits(CAMPAIGN_COST);
                toast.success("Campaign created successfully!");
            }
            setShowPublishModal(true);
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred while saving the campaign.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModalAndReset = () => { 
        setShowPublishModal(false); 
        // Clear localStorage after successful save
        localStorage.removeItem('campaign_creator_data');
        // Navigate to campaigns page
        navigate("/campaigns"); 
    };
    const handleTemplateDataFromBuilder = (builderData) => setTemplateConfig((prev) => ({ ...prev, templateData: builderData }));
    const selectTemplateToEdit = (templateId) => {
        const templateToEdit = templates.find((t) => t.id === templateId);
        if (templateToEdit) setTemplateConfig({ type: "edit", selectedTemplateId: templateId, editingTemplate: templateToEdit.builderData, templateData: templateToEdit.builderData });
    };

    const handleTemplateOptionClick = (type) => {
        if (type === "create") { 
            const emptyState = getEmptyBuilderState(); 
            setTemplateConfig({ 
                type: "create", 
                selectedTemplateId: null, 
                editingTemplate: emptyState, 
                templateData: emptyState 
            }); 
        }
        else if (type === "select") { 
            setTemplateConfig({ 
                type: "select", 
                selectedTemplateId: null, 
                editingTemplate: null, 
                templateData: null 
            }); 
        }
    };


    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <LucideIcons.Loader2 className="animate-spin text-green-600 w-12 h-12" />
            </div>
        );
    }
    
    const renderStepContent = () => {
        let content;
        switch (currentStep) {
            case 1: content = ( <> <InputField label="Campaign Name" name="campaignName" value={campaignDetails.campaignName} onChange={handleDetailChange} placeholder="e.g., Q4 Product Showcase" required icon={<LucideIcons.Edit3 />} /> <div className="grid md:grid-cols-2 gap-x-5"> <InputField label="Start Date & Time" name="startTime" type="datetime-local" value={campaignDetails.startTime} onChange={handleDetailChange} required icon={<LucideIcons.CalendarPlus />} /> <InputField label="End Date & Time" name="endTime" type="datetime-local" value={campaignDetails.endTime} onChange={handleDetailChange} required icon={<LucideIcons.CalendarMinus />} /> </div> </> ); break;
            case 2: 
                content = ( 
                    <> 
                        <div className="space-y-3 mb-6"> 
                            <OptionCard 
                                title="Upload File (.xls, .xlsx)" 
                                description="Import contacts directly from a spreadsheet." 
                                selected={dataSource.type === "file"} 
                                onClick={() => handleDataSourceTypeChange("file")} 
                                icon={<LucideIcons.FileUp />} 
                            /> 
                            <OptionCard 
                                title="From My Contacts" 
                                description="Select from your saved contact lists." 
                                selected={dataSource.type === "fromContacts"} 
                                onClick={() => handleDataSourceTypeChange("fromContacts")} 
                                icon={<UserCheck />} 
                            /> 
                        </div> 
                        
                        {dataSource.type === "file" && (
                            <div className="mt-5 p-4 border border-slate-200 rounded-xl bg-slate-50/70 animate-fadeIn"> 
                                <h3 className="text-base font-semibold text-slate-700 mb-3">Audience File Details</h3> 
                                <InputField 
                                    label="Choose Spreadsheet File" 
                                    type="file" 
                                    name="fileUpload" 
                                    onChange={handleDataSourceChange} 
                                    accept=".xls,.xlsx" 
                                    icon={<LucideIcons.UploadCloud />} 
                                /> 
                                {fileError && <p className="text-xs text-red-500 -mt-3 mb-3">{fileError}</p>} 
                                {dataSource.fileName && !fileError && (
                                    <p className="text-xs text-slate-500 mb-4 -mt-3">
                                        Selected: <span className="font-medium text-green-600">{dataSource.fileName}</span>
                                    </p>
                                )} 
                            </div> 
                        )} 
                        
                        {dataSource.type === "fromContacts" && (
                            <div className="mt-5 p-4 border border-slate-200 rounded-xl bg-slate-50/70 animate-fadeIn"> 
                                <h3 className="text-base font-semibold text-slate-700 mb-3">Select From Your Contacts</h3> 
                                {availableContactLists.length > 0 ? (
                                    <> 
                                        <div className="mb-4"> 
                                            <label className="block text-xs font-medium text-slate-600 mb-2">Choose a Contact List:</label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowContactDropdown(!showContactDropdown)}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500 sm:text-sm bg-white text-left flex items-center justify-between"
                                                >
                                                    <span className={dataSource.contactListId ? "text-slate-800" : "text-slate-500"}>
                                                        {dataSource.contactListId 
                                                            ? availableContactLists.find(l => l.id === dataSource.contactListId)?.name || "Select a List"
                                                            : "-- Select a List --"
                                                        }
                                                    </span>
                                                    <LucideIcons.ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showContactDropdown ? 'rotate-180' : ''}`} />
                                                </button>
                                                
                                                {showContactDropdown && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                        <ul className="py-1">
                                                            {availableContactLists.map((list) => (
                                                                <li key={list.id}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            handleDataSourceChange({ target: { name: "contactListId", value: list.id } });
                                                                            setShowContactDropdown(false);
                                                                        }}
                                                                        className={`w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors ${
                                                                            dataSource.contactListId === list.id 
                                                                                ? "bg-green-50 text-green-700 border-r-2 border-green-500" 
                                                                                : "text-slate-700"
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="font-medium">{list.name}</span>
                                                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                                                                {list.contacts.length} contacts
                                                                            </span>
                                                                        </div>
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div> 
                                        
                                        {dataSource.contactListId && contactsInSelectedList.length > 0 && (
                                            <> 
                                                <InputField 
                                                    label="Search Contacts in Selected List" 
                                                    name="searchTermInList" 
                                                    value={searchTermInList} 
                                                    onChange={(e) => setSearchTermInList(e.target.value)} 
                                                    placeholder="Search by name or email..." 
                                                    icon={<LucideIcons.Search size={14} />} 
                                                    className="mb-3" 
                                                /> 
                                                <p className="text-xs text-slate-600 mb-2">
                                                    Select contacts for this campaign ({dataSource.selectedContactIds.length} selected):
                                                </p> 
                                                <div className="max-h-60 overflow-y-auto border border-slate-300 rounded-lg bg-white p-2 space-y-1.5 custom-scrollbar"> 
                                                    {filteredContactsForSelection.length > 0 ? (
                                                        filteredContactsForSelection.map((contact, index) => {
                                                            // Debug: Log contact object to see what we're working with
                                                    
                                                            
                                                            // Create a truly unique identifier for each contact
                                                            const contactIdentifier = contact.id || `contact-${index}-${contact.email}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                                                            
                                                    
                                                            
                                                            return (
                                                                <div key={contactIdentifier} className="flex items-center p-2 rounded-md hover:bg-slate-100 transition-colors"> 
                                                                    <input 
                                                                        type="checkbox" 
                                                                        id={`contact-select-${contactIdentifier}`} 
                                                                        name={`contact-select-${contactIdentifier}`} 
                                                                        checked={dataSource.selectedContactIds.includes(contactIdentifier)} 
                                                                        onChange={(e) => handleDataSourceChange({
                                                                            target: { 
                                                                                name: `contact-select-${contactIdentifier}`, 
                                                                                checked: e.target.checked 
                                                                            }
                                                                        })} 
                                                                        className="h-4 w-4 text-green-600 border-slate-300 rounded focus:ring-green-500 mr-2.5 cursor-pointer accent-[#2e8b57]" 
                                                                    /> 
                                                                    <label htmlFor={`contact-select-${contactIdentifier}`} className="flex-1 text-xs text-slate-700 cursor-pointer"> 
                                                                        <span className="font-medium">{contact.userName || "N/A"}</span> - <span className="text-slate-500">{contact.email}</span> 
                                                                    </label> 
                                                                </div> 
                                                            );
                                                        })
                                                    ) : (
                                                        <p className="text-xs text-slate-500 text-center py-3">
                                                            {searchTermInList ? "No contacts match your search." : "No contacts in this list (or clear search)."}
                                                        </p> 
                                                    )} 
                                                </div> 
                                            </> 
                                        )} 
                                        
                                        {dataSource.contactListId && contactsInSelectedList.length === 0 && (
                                            <p className="text-xs text-slate-500 text-center py-3">This list is empty.</p>
                                        )} 
                                    </> 
                                ) : (
                                    <div className="text-center py-6"> 
                                        <LucideIcons.Users size={28} className="mx-auto text-slate-400 mb-2" /> 
                                        <p className="text-sm text-slate-500">No contact lists available.</p> 
                                        <p className="text-xs text-slate-400">
                                            Please create a contact list in the <Link to="/contacts" className="text-green-600 hover:underline font-medium">'Contacts'</Link> section first.
                                        </p> 
                                    </div> 
                                )} 
                            </div> 
                        )} 
                    </> 
                ); 
                break;
            case 3: 
                // Check if we're returning from template editor
                const isReturningFromEditor = location.state?.fromEditor && location.state?.templateData;
                const showEditor = templateConfig.type === "edit"; 
                const showCreatedTemplate = (templateConfig.type === "create" && templateConfig.templateData && templateConfig.templateData.pages) || isReturningFromEditor; 

                content = ( 
                    <> 
                        <div className="mb-5"> 
                            <h3 className="text-lg font-semibold text-slate-800 mb-3">Select Template or Create New</h3> 
                            <p className="text-sm text-slate-600 mb-4">Choose how you want to design your campaign template</p> 
                            <div className="space-y-3"> 
                                <div className="grid md:grid-cols-2 gap-3"> 
                                    <OptionCard 
                                        title="Create New Template" 
                                        description="Build a unique template from scratch in full-screen editor." 
                                        selected={templateConfig.type === "create"} 
                                        onClick={() => {
                                            setTemplateConfig({ 
                                                type: "create", 
                                                selectedTemplateId: null, 
                                                editingTemplate: getEmptyBuilderState(), 
                                                templateData: getEmptyBuilderState() 
                                            });
                                            setShowTemplateEditor(true);
                                        }} 
                                        icon={<LucideIcons.Brush />} 
                                    /> 
                                    <OptionCard 
                                        title="Select Existing Template" 
                                        description="Choose and customize a pre-built design." 
                                        selected={templateConfig.type === "select" || (templateConfig.type === "edit" && !!templateConfig.selectedTemplateId)} 
                                        onClick={() => handleTemplateOptionClick("select")} 
                                        icon={<LucideIcons.LayoutGrid />} 
                                    /> 
                                </div> 
                            </div> 
                        </div> 
                        
                        {templateConfig.type === "create" && !showCreatedTemplate && (
                            <div className="mt-5 p-4 border border-slate-200 rounded-xl bg-slate-50/70"> 
                                <h3 className="text-base font-semibold text-slate-700 mb-3">Page Title</h3> 
                                <InputField 
                                    label="Landing Page Title" 
                                    name="pageTitle" 
                                    value={templateConfig.templateData?.pageTitle || "Untitled"} 
                                    onChange={(e) => setTemplateConfig(prev => ({ 
                                        ...prev, 
                                        templateData: { 
                                            ...prev.templateData, 
                                            pageTitle: e.target.value 
                                        } 
                                    }))} 
                                    placeholder="Enter page title..." 
                                    icon={<LucideIcons.Edit3 />} 
                                /> 
                                <p className="text-xs text-slate-500 mt-2">This title will be displayed in the browser tab and can be edited in the template editor.</p> 
                            </div> 
                        )} 
                        
                        {showCreatedTemplate && (
                            <div className="mt-5"> 
                                <h3 className="text-lg font-semibold text-slate-800 mb-0.5">
                                    Using: {(templateConfig.templateData?.pageTitle || location.state?.templateData?.pageTitle) || "Custom Template"}
                                </h3> 
                                <p className="text-xs text-slate-500 mb-3">Template created successfully. You can proceed to the next step.</p> 
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg"> 
                                    <p className="text-sm text-green-700 font-medium">✓ Template loaded successfully</p> 
                                    <p className="text-xs text-green-600 mt-1">Your custom template "{(templateConfig.templateData?.pageTitle || location.state?.templateData?.pageTitle) || "Untitled"}" has been created and is ready for use.</p> 
                                    <div className="mt-2 text-xs text-slate-600">
                                        <p><strong>Template Type:</strong> Custom Landing Page</p>
                                        <p><strong>Page Title:</strong> {(templateConfig.templateData?.pageTitle || location.state?.templateData?.pageTitle) || "Untitled"}</p>
                                        <p><strong>Status:</strong> Ready for Review</p>
                                    </div>
                                </div> 
                            </div> 
                        )} 
                        
                        {templateConfig.type === "select" && (
                            <div className="mt-5 p-4 border border-slate-200 rounded-xl bg-slate-50/70"> 
                                <h3 className="text-base font-semibold text-slate-700 mb-3">Available Templates</h3> 
                                {templates.length > 0 ? (
                                    <ul className="space-y-2.5">
                                        {templates.map((template) => (
                                            <li key={template.id} className="p-2.5 pr-3 border border-slate-300/80 rounded-lg hover:shadow-sm transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 bg-white hover:bg-slate-50"> 
                                                <span className="text-xs font-medium text-slate-600">{template.name}</span> 
                                                <StyledButton 
                                                    onClick={() => selectTemplateToEdit(template.id)} 
                                                    variant="secondary" 
                                                    className="py-1 px-2.5 text-xs self-start sm:self-center" 
                                                    iconLeft={<LucideIcons.Edit3 size={12} />}
                                                >
                                                    Use Template
                                                </StyledButton> 
                                            </li> 
                                        ))}
                                    </ul> 
                                ) : (
                                    <p className="text-xs text-slate-500 text-center py-2">No existing templates. Create one!</p> 
                                )} 
                            </div> 
                        )} 
                        
                        {showEditor && (
                            <div className="mt-5"> 
                                <h3 className="text-lg font-semibold text-slate-800 mb-0.5">
                                    {templateConfig.type === "edit" ? `Using: ${templates.find((t) => t.id === templateConfig.selectedTemplateId)?.name}` : "Create New Template"}
                                </h3> 
                                <p className="text-xs text-slate-500 mb-3">Template selected successfully. You can proceed to the next step.</p> 
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg"> 
                                    <p className="text-sm text-green-700 font-medium">✓ Template loaded successfully</p> 
                                    <p className="text-xs text-green-600 mt-1">The selected template has been loaded and is ready for use.</p> 
                                </div> 
                            </div> 
                        )} 
                    </> 
                ); 
                break;
                        case 4: 
                // Get template data from localStorage first, then templateConfig, then location.state
                const savedTemplateData = localStorage.getItem('campaign_template_data');
                let currentTemplateData = null;
                
                if (savedTemplateData) {
                    try {
                        currentTemplateData = JSON.parse(savedTemplateData);
        
                    } catch (error) {
                        console.error('Error parsing saved template data:', error);
                    }
                }
                
                // Fallback to other sources if localStorage is empty
                if (!currentTemplateData) {
                    currentTemplateData = templateConfig.templateData || location.state?.templateData;
                }
                
                const templateName = templateConfig.selectedTemplateId 
                    ? templates.find((t) => t.id === templateConfig.selectedTemplateId)?.name 
                    : currentTemplateData 
                        ? (currentTemplateData.pageTitle || "Custom Template")
                        : "No Template";
                
                const selectedContactListName = dataSource.contactListId && availableContactLists.length > 0 
                    ? availableContactLists.find((l) => l.id === dataSource.contactListId)?.name || "N/A" 
                    : "N/A";
                

                
                // Template preview rendering
                
                content = ( 
                    <> 
                        <div className="grid lg:grid-cols-3 gap-5"> 
                            <div className="lg:col-span-1 space-y-4"> 
                                <SummaryCard title="Campaign Settings" icon={<LucideIcons.Settings2 />}> 
                                    <p><strong>Name:</strong> {campaignDetails.campaignName || "N/A"}</p> 
                                    <p><strong>Start:</strong> {campaignDetails.startTime ? new Date(campaignDetails.startTime).toLocaleString() : "N/A"}</p> 
                                    <p><strong>End:</strong> {campaignDetails.endTime ? new Date(campaignDetails.endTime).toLocaleString() : "N/A"}</p> 
                                </SummaryCard> 
                                <SummaryCard title="Audience Data" icon={<AudienceIcon />}> 
                                    <p><strong>Source:</strong>{dataSource.type === "file" && " File Upload"}{dataSource.type === "fromContacts" && " From My Contacts"}</p> 
                                    {dataSource.type === "file" && dataSource.fileName && <p><strong>File:</strong> {dataSource.fileName || "N/A"}</p>} 
                                    {dataSource.type === "fromContacts" && ( 
                                        <> 
                                            <p><strong>List Name:</strong> {selectedContactListName}</p> 
                                            <p><strong>Selected Contacts:</strong> {dataSource.selectedContactIds.length} contacts</p> 
                                        </> 
                                    )} 
                                </SummaryCard> 
                            </div> 
                            <div className="lg:col-span-2 min-w-0"> 
                                <SummaryCard title="Template Preview" icon={<LucideIcons.MonitorPlay />}> 
                                    <p className="mb-3 text-xs"><strong>Using:</strong> {templateName}</p> 
                                    
                                    {currentTemplateData && currentTemplateData.pages && currentTemplateData.activePageId && PagePreviewRenderer ? (
                                        <div className="border-2 border-slate-200 rounded-lg shadow-inner bg-white min-h-[400px] overflow-x-auto">
                                            <PagePreviewRenderer 
                                                pageLayout={currentTemplateData.pages[currentTemplateData.activePageId]?.layout || []} 
                                                globalNavbar={currentTemplateData.globalNavbar} 
                                                globalFooter={currentTemplateData.globalFooter} 
                                                activePageId={currentTemplateData.activePageId} 
                                                onNavigate={() => {}} 
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-100/70 rounded-lg text-slate-500 text-center min-h-[150px] flex flex-col items-center justify-center border border-slate-200">
                                            <LucideIcons.ImageOff className="w-6 h-6 mb-1.5 text-slate-400" />
                                            <p className="font-medium text-xs">No template preview available.</p>
                                            <p className="text-[11px]">Please complete the template design step.</p>
                                        </div>
                                    )} 
                                </SummaryCard> 
                            </div> 
                        </div> 
                    </> 
                ); break;
            default: content = <div className="text-center py-8 text-slate-500">Error: Unknown step.</div>;
        }
        return ( <div className="bg-white p-5 md:p-6 rounded-xl shadow-lg border border-slate-200"> {content} <div className="mt-8 pt-5 border-t border-slate-200/80 flex justify-between items-center"> <StyledButton onClick={prevStep} variant="secondary" iconLeft={<LucideIcons.ArrowLeft />} disabled={currentStep === 1}>Back</StyledButton> {currentStep < steps.length ? <StyledButton onClick={nextStep} disabled={!canProceedToNext()} iconRight={<LucideIcons.ArrowRight />}>{canProceedToNext() ? "Next" : "Complete Step"}</StyledButton> : <StyledButton onClick={handleSaveCampaign} variant="launch" iconLeft={isSubmitting ? <LucideIcons.Loader2 className="animate-spin" /> : <LucideIcons.Save />} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (isEditing ? 'Update Campaign' : 'Save Campaign')}</StyledButton>} </div> </div> );
    };

    return (
        <>
            <div className="min-h-screen bg-slate-100 text-slate-800">
                <main className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                                         <div className="flex items-center justify-between mb-6 md:mb-8">
                         <div className="flex items-center">
                             <div className="p-3 bg-green-100 rounded-xl mr-4 shrink-0"><LucideIcons.ClipboardCheck className="w-8 h-8 text-green-600" strokeWidth={1.5} /></div>
                             <div>
                                 <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Campaign Setup</h1>
                                 <p className="text-sm text-slate-500 mt-0.5">Follow the steps to create or edit your campaign.</p>
                             </div>
                         </div>
                                                   
                     </div>
                    <TopStepperNav currentStep={currentStep} steps={steps} setCurrentStep={setCurrentStep} canProceed={canProceedToNext} />
                    {renderStepContent()}
                </main>
                <PublishSuccessModal isOpen={showPublishModal} onAddDomain={() => { setShowPublishModal(false); resetCampaignStates(); navigate("/domains"); }} onClose={handleCloseModalAndReset} />
            </div>
            
            {/* Template Editor Overlay */}
            {showTemplateEditor && (
                <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm">
                        <div className="flex items-center space-x-3">
                            <h2 className="text-xl font-bold text-slate-800">Template Editor</h2>
                            <span className="text-sm text-slate-500">Create and customize your campaign template</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <StyledButton 
                                onClick={() => setShowTemplateEditor(false)} 
                                variant="secondary"
                                iconLeft={<LucideIcons.X />}
                            >
                                Cancel
                            </StyledButton>
                            <StyledButton 
                                onClick={() => {
                                    // Save template data and close editor
                                    if (templateConfig.templateData) {
                                        localStorage.setItem('campaign_template_data', JSON.stringify(templateConfig.templateData));
                            
                                        toast.success('Template saved successfully!');
                                    }
                                    setShowTemplateEditor(false);
                                    // Move to next step
                                    if (canProceedToNext()) {
                                        setCurrentStep(4);
                                    }
                                }} 
                                variant="primary"
                                iconLeft={<LucideIcons.Save />}
                            >
                                Save Template
                            </StyledButton>
                        </div>
                    </div>
                    
                    {/* Editor Content */}
                    <div className="flex-1 overflow-hidden">
                        {ElementBuilderPage ? (
                            <ElementBuilderPage 
                                onExternalSave={handleTemplateDataFromBuilder} 
                                initialBuilderState={templateConfig.templateData || getEmptyBuilderState()} 
                                key={JSON.stringify(templateConfig.templateData)}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <LucideIcons.AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                    <p className="text-lg font-semibold text-slate-800">Builder Component Not Loaded</p>
                                    <p className="text-slate-500">Please refresh the page and try again.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <style jsx global>{` @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; } .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; } .custom-scrollbar::-webkit-scrollbar-track { background: #f7fafc; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a0aec0; } `}</style>
        </>
    );
}