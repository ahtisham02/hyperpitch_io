import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import ElementBuilderPage, { PagePreviewRenderer } from './Header';

const mockGenerateId = (prefix = 'tpl-id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

const StepperNav = ({ currentStep, steps }) => {
  return (
    <nav aria-label="Progress" className="mb-16">
      <ol role="list" className="flex items-center justify-center space-x-1 sm:space-x-2">
        {steps.map((step, stepIdx) => (
          <React.Fragment key={step.name}>
            <li className="relative flex flex-col items-center text-center">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold transition-all duration-300
                  ${currentStep > step.id ? 'bg-sky-600 text-white shadow-md' : ''}
                  ${currentStep === step.id ? 'bg-sky-500 text-white ring-2 ring-offset-2 ring-sky-500 shadow-lg scale-110' : ''}
                  ${currentStep < step.id ? 'bg-slate-200 text-slate-500' : ''}
                `}
              >
                {currentStep > step.id ? <LucideIcons.Check size={24} /> : step.id}
              </span>
              <span className={`mt-2.5 text-xs font-medium w-20 truncate
                ${currentStep === step.id ? 'text-sky-600 font-semibold' : ''}
                ${currentStep > step.id ? 'text-sky-700' : ''}
                ${currentStep < step.id ? 'text-slate-500' : ''}
              `}>
                {step.name}
              </span>
            </li>
            {stepIdx < steps.length - 1 && (
              <div className={`flex-1 h-1 rounded transition-colors duration-300 mx-1 sm:mx-2
                ${currentStep > step.id ? 'bg-sky-500' : 'bg-slate-200'}
              `}></div>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};


const InputField = ({ label, type = 'text', value, onChange, name, placeholder, required = false, icon, accept, className = '' }) => (
  <div className={`mb-6 ${className}`}>
    <label htmlFor={name} className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && <div className="pointer-events-none absolute inset-y-0 left-0 pl-4 flex items-center">{React.cloneElement(icon, { className: "h-5 w-5 text-slate-400"})}</div>}
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        accept={accept}
        className={`block w-full ${icon ? 'pl-12' : 'px-4'} py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all sm:text-sm placeholder-slate-400 bg-white shadow-sm hover:border-slate-400`}
      />
    </div>
  </div>
);

const StyledButton = ({ onClick, children, type = 'button', variant = 'primary', disabled = false, className = '', iconLeft, iconRight }) => {
  const baseStyle = "px-7 py-3.5 rounded-xl font-semibold text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out inline-flex items-center justify-center group";
  const variantStyles = {
    primary: "bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500 active:bg-sky-800",
    secondary: "bg-slate-200 hover:bg-slate-300 text-slate-700 focus:ring-slate-500 active:bg-slate-400",
    launch: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white focus:ring-green-500 text-base px-8 py-4",
    success: "bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500 text-base px-8 py-4 shadow-md",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variantStyles[variant]} ${disabled ? 'opacity-60 cursor-not-allowed' : 'transform hover:scale-105 active:scale-95'} ${className}`}
    >
      {iconLeft && React.cloneElement(iconLeft, {className: "w-4 h-4 mr-2 -ml-1 group-hover:animate-pulse"})}
      {children}
      {iconRight && React.cloneElement(iconRight, {className: "w-4 h-4 ml-2 -mr-1 group-hover:translate-x-1 transition-transform"})}
    </button>
  );
};

const OptionCard = ({ title, description, selected, onClick, icon }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full p-6 border-2 rounded-xl text-left transition-all duration-200 hover:shadow-xl ${
            selected ? 'border-sky-500 bg-sky-50 ring-2 ring-offset-2 ring-sky-500 transform scale-105' : 'border-slate-300 bg-white hover:border-sky-400'
        }`}
    >
        <div className="flex items-start">
            {icon && <div className={`mr-4 p-3 rounded-lg ${selected ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'}`}>{React.cloneElement(icon, { className: "w-6 h-6"})}</div>}
            <div className="flex-1">
                <h3 className={`text-lg font-semibold ${selected ? 'text-sky-700' : 'text-slate-800'}`}>{title}</h3>
                {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
            </div>
            {selected && <LucideIcons.CheckCircle className="h-6 w-6 text-sky-600" />}
        </div>
    </button>
);

const SummaryCard = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
            {React.cloneElement(icon, { className: "w-6 h-6 mr-3 text-sky-600"})}
            {title}
        </h3>
        <div className="space-y-2 text-sm text-slate-600">
            {children}
        </div>
    </div>
);

const SuccessModal = ({ isOpen, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-700/50 backdrop-blur-sm flex items-center justify-center z-[300] p-4 transform transition-opacity duration-300 ease-out animate-fadeInModal">
      <div className="bg-gradient-to-br from-slate-50 via-sky-50 to-cyan-50 p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md text-center transform transition-all duration-300 ease-out animate-scaleUpModal">
        <div className="mx-auto flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-sky-100 mb-6 sm:mb-8 ring-4 ring-sky-200">
          <svg
            className="checkmark h-10 w-10 sm:h-12 sm:w-12 text-sky-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
          >
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">Campaign Launched!</h3>
        <p className="text-slate-500 mb-8 sm:mb-10 text-md sm:text-lg">
          Your new campaign is live and soaring. Well done!
        </p>
        <StyledButton onClick={onConfirm} variant="success" iconLeft={<LucideIcons.PlusCircle />}>
          Create New Campaign
        </StyledButton>
      </div>
      <style jsx>{`
        @keyframes fadeInModal { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fadeInModal { animation: fadeInModal 0.2s ease-out forwards; }
        @keyframes scaleUpModal { 0% { transform: scale(0.95) translateY(10px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-scaleUpModal { animation: scaleUpModal 0.3s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards; }

        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 3;
          stroke-miterlimit: 10;
          stroke: #81c784; /* Light green for circle, can be themed */
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.3s forwards;
        }
        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          stroke-width: 4;
          stroke: #38a169; /* Darker green for check, can be themed sky */
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.7s forwards;
        }
        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};


export default function CampaignCreatorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignDetails, setCampaignDetails] = useState({ campaignName: '', startTime: '', endTime: '' });
  const [dataSource, setDataSource] = useState({ type: 'file', file: null, fileName: '', fields: { firstName: '', lastName: '', email: '', linkedInUrl: '' } });
  const [templateConfig, setTemplateConfig] = useState({ type: 'create', selectedTemplateId: null, templateData: null, editingTemplate: null });
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const mockTemplates = useMemo(() => {
    const pageId1 = mockGenerateId('page');
    const pageId2 = mockGenerateId('page');
    return [
    { id: 'tpl_corporate_sleek', name: 'Sleek Corporate Testimonial', builderData: { pages: { [pageId1]: { id: pageId1, name: 'Main Page', layout: [ { id: mockGenerateId('section'), type: 'section', props: { backgroundType: 'color', backgroundColor: '#f8fafc' }, columns: [ { id: mockGenerateId('col'), type: 'column', props: { width: '100%' }, elements: [ { id: mockGenerateId('heading'), type: 'header', props: { text: "What Our Clients Say", sizeClass: 'text-3xl', textAlign: 'text-center', textColor: '#1e293b' } }, { id: mockGenerateId('spacer'), type: 'spacer', props: { height: "20px" } }, { id: mockGenerateId('testimonials'), type: 'cardSlider', props: { slides: [ { id: mockGenerateId('slide'), imgSrc: 'https://via.placeholder.com/100x100/cbd5e1/475569?Text=User+A', heading: 'Alex Johnson, CEO of TechCorp', text: '"Working with this team has been a game changer for our business. Highly recommended!"', link: '#' }, { id: mockGenerateId('slide'), imgSrc: 'https://via.placeholder.com/100x100/e2e8f0/334155?Text=User+B', heading: 'Maria Garcia, Marketing Director at Innovate Ltd.', text: '"Their strategic insights and creative execution are top-notch. Results exceeded expectations."', link: '#' }, { id: mockGenerateId('slide'), imgSrc: 'https://via.placeholder.com/100x100/94a3b8/ffffff?Text=User+C', heading: 'David Lee, Founder of StartUpX', text: '"Professional, responsive, and delivered outstanding quality. Will definitely partner again."', link: '#' }, ], slidesPerView: 1, spaceBetween: 20, speed: 700, autoplay: true, autoplayDelay: 5000, loop: true, showNavigation: true, showPagination: true, cardBorderRadius: '12px', } } ] } ] } ] } }, activePageId: pageId1, globalNavbar: { id: 'global-navbar-corp', type: 'navbar', path: 'globalNavbar', props: { logoType: 'text', logoText: 'CORP.', links: [{id: mockGenerateId('nav'), text: 'Services', url:'#'}, {id: mockGenerateId('nav'), text: 'About Us', url:'#'}, {id: mockGenerateId('nav'), text: 'Contact', url:'#'}], backgroundColor: '#ffffff', textColor: '#1e293b', linkColor: '#0ea5e9', rightContentType: 'none' } }, globalFooter: { id: 'global-footer-corp', type: 'footer', path: 'globalFooter', props: { copyrightText: `© ${new Date().getFullYear()} CORP. Solutions. All Rights Reserved.`, links: [{id: mockGenerateId('foot'), text:'Privacy Policy', url:'#'}, {id: mockGenerateId('foot'), text:'Terms of Use', url:'#'}], backgroundColor: '#1e293b', textColor: '#94a3b8', linkColor: '#e0f2fe' } } } },
    { id: 'tpl_creative_vibrant', name: 'Vibrant Creative Showcase', builderData: { pages: { [pageId2]: { id: pageId2, name: 'Showcase Page', layout: [ { id: mockGenerateId('section-intro'), type: 'section', props: { backgroundType: 'color', backgroundColor: '#ecfdf5' }, columns: [ { id: mockGenerateId('col-intro'), type: 'column', props: { width: '100%' }, elements: [ { id: mockGenerateId('head'), type: 'header', props: { text: "Hear From Our Awesome Clients!", sizeClass: 'text-4xl', textAlign: 'text-center', textColor: '#059669' }}, { id: mockGenerateId('sub'), type: 'textBlock', props: { text: "We love making our clients happy. Here's what they're saying about their experiences.", sizeClass: 'text-lg', textAlign: 'text-center', textColor: '#047857' }}, ] } ] }, { id: mockGenerateId('section-slider'), type: 'section', props: { backgroundType: 'color', backgroundColor: '#f0fdfa' }, columns: [ { id: mockGenerateId('col-slider'), type: 'column', props: { width: '100%' }, elements: [ { id: mockGenerateId('testimonials-creative'), type: 'cardSlider', props: { slides: [ { id: mockGenerateId('slide'), imgSrc: 'https://randomuser.me/api/portraits/women/44.jpg', heading: 'Sarah Miller, Artist', text: '"Unleashed my creative potential! The platform is intuitive and inspiring."', link: '#' }, { id: mockGenerateId('slide'), imgSrc: 'https://randomuser.me/api/portraits/men/32.jpg', heading: 'James Chen, Designer', text: '"A truly collaborative process with stunning visual outcomes. Five stars!"', link: '#' }, { id: mockGenerateId('slide'), imgSrc: 'https://randomuser.me/api/portraits/women/68.jpg', heading: 'Priya Patel, Photographer', text: '"They understood my vision perfectly and brought it to life beautifully."', link: '#' }, { id: mockGenerateId('slide'), imgSrc: 'https://randomuser.me/api/portraits/men/75.jpg', heading: 'Kenji Tanaka, Illustrator', text: '"Exceptional tools and support. My go-to for all creative projects."', link: '#' }, ], slidesPerView: 2, spaceBetween: 24, speed: 600, autoplay: false, loop: false, showNavigation: true, showPagination: true, cardBorderRadius: '16px', } } ] } ] } ] } }, activePageId: pageId2, globalNavbar: { id: 'global-navbar-creative', type: 'navbar', path: 'globalNavbar', props: { logoType: 'text', logoText: 'CreativeHub', links: [{id: mockGenerateId('nav'), text: 'Portfolio', url:'#'}, {id: mockGenerateId('nav'), text: 'Blog', url:'#'}, {id: mockGenerateId('nav'), text: 'Join Us', url:'#'}], backgroundColor: '#0d9488', textColor: '#ffffff', linkColor: '#ccfbf1', rightContentType: 'searchIcon' } }, globalFooter: { id: 'global-footer-creative', type: 'footer', path: 'globalFooter', props: { copyrightText: `© ${new Date().getFullYear()} CreativeHub Studios. Be Bold. Be Creative.`, links: [{id: mockGenerateId('foot'), text:'Inspiration', url:'#'}, {id: mockGenerateId('foot'), text:'Support', url:'#'}, {id: mockGenerateId('foot'), text:'Careers', url:'#'}], backgroundColor: '#f0fdfa', textColor: '#0f766e', linkColor: '#14b8a6' } } } }
  ]}, []);


  const steps = [
    { id: 1, name: 'Campaign Setup' },
    { id: 2, name: 'Audience Data' },
    { id: 3, name: 'Design Template' },
    { id: 4, name: 'Review & Launch' },
  ];

  const handleDetailChange = (e) => { const { name, value } = e.target; setCampaignDetails(prev => ({ ...prev, [name]: value })); };
  const handleDataSourceChange = (e) => { const { name, value, type, files } = e.target; if (type === 'file') { setDataSource(prev => ({ ...prev, file: files[0], fileName: files[0]?.name || '' })); } else { setDataSource(prev => ({ ...prev, fields: { ...prev.fields, [name]: value } })); } };
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleLaunchCampaign = () => {
    setShowSuccessModal(true);
  };

  const resetCampaign = () => {
    setCampaignDetails({ campaignName: '', startTime: '', endTime: '' });
    setDataSource({ type: 'file', file: null, fileName: '', fields: { firstName: '', lastName: '', email: '', linkedInUrl: '' } });
    setTemplateConfig({ type: 'create', selectedTemplateId: null, templateData: null, editingTemplate: null });
    setCurrentStep(1);
    setShowSuccessModal(false);
  }

  const handleTemplateDataFromBuilder = (builderData) => {
    setTemplateConfig(prev => ({ ...prev, templateData: builderData }));
  };
  
  const selectTemplateToEdit = (templateId) => {
    const templateToEdit = mockTemplates.find(t => t.id === templateId);
    if (templateToEdit) {
      setTemplateConfig(prev => ({
        ...prev,
        type: 'edit',
        selectedTemplateId: templateId,
        editingTemplate: templateToEdit.builderData,
        templateData: templateToEdit.builderData
      }));
    }
  };


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Campaign Setup</h2>
            <p className="text-md text-slate-500 mb-10">Define the basic details for your new campaign.</p>
            <InputField label="Campaign Name" name="campaignName" value={campaignDetails.campaignName} onChange={handleDetailChange} placeholder="e.g., Q4 Product Launch Extravaganza" required icon={<LucideIcons.Tag />} />
            <div className="grid md:grid-cols-2 gap-x-8">
                <InputField label="Start Date & Time" name="startTime" type="datetime-local" value={campaignDetails.startTime} onChange={handleDetailChange} required icon={<LucideIcons.CalendarClock />} />
                <InputField label="End Date & Time" name="endTime" type="datetime-local" value={campaignDetails.endTime} onChange={handleDetailChange} required icon={<LucideIcons.CalendarOff />} />
            </div>
            <div className="mt-12 flex justify-end">
              <StyledButton onClick={nextStep} disabled={!campaignDetails.campaignName || !campaignDetails.startTime || !campaignDetails.endTime} iconRight={<LucideIcons.ArrowRight />}>
                Next: Audience
              </StyledButton>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Audience Data</h2>
            <p className="text-md text-slate-500 mb-10">Specify how you'll provide your audience information.</p>
            <div className="space-y-5 mb-8">
                <OptionCard title="Upload File" description="Import contacts from an XLS/XLSX file." selected={dataSource.type === 'file'} onClick={() => setDataSource(prev => ({...prev, type: 'file'}))} icon={<LucideIcons.FileUp />}/>
                <OptionCard title="Connect API" description="Sync contacts directly from your CRM or API. (Coming Soon)" selected={dataSource.type === 'api'} onClick={() => { }} icon={<LucideIcons.PlugZap />}/>
            </div>
            {dataSource.type === 'file' && (
              <div className="mt-8 p-6 border border-slate-200 rounded-xl bg-slate-50 shadow-inner">
                <h3 className="text-xl font-semibold text-slate-700 mb-5">Upload Audience File</h3>
                <InputField label="Choose XLS/XLSX File" type="file" name="fileUpload" onChange={handleDataSourceChange} accept=".xls,.xlsx" icon={<LucideIcons.Paperclip />}/>
                {dataSource.fileName && <p className="text-sm text-slate-600 mb-6 -mt-3">Selected file: <span className="font-medium text-sky-700">{dataSource.fileName}</span></p>}
                <p className="text-md text-slate-600 mb-4 font-medium">Map your spreadsheet columns to these fields:</p>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
                    <InputField label="First Name Column" name="firstName" value={dataSource.fields.firstName} onChange={handleDataSourceChange} placeholder="e.g., FNAME or first_name" />
                    <InputField label="Last Name Column" name="lastName" value={dataSource.fields.lastName} onChange={handleDataSourceChange} placeholder="e.g., LNAME or last_name" />
                    <InputField label="Email Column" name="email" type="email" value={dataSource.fields.email} onChange={handleDataSourceChange} placeholder="e.g., EMAIL or email_address" required />
                    <InputField label="LinkedIn URL Column" name="linkedInUrl" value={dataSource.fields.linkedInUrl} onChange={handleDataSourceChange} placeholder="e.g., LINKEDIN_PROFILE_URL" />
                </div>
              </div>
            )}
            {dataSource.type === 'api' && ( <div className="mt-8 p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center flex flex-col items-center justify-center min-h-[200px]"> <LucideIcons.Construction className="h-16 w-16 text-amber-500 mx-auto mb-4"/> <p className="text-slate-700 font-semibold text-lg">API Connection Feature</p> <p className="text-sm text-slate-500 mt-1">This functionality is on our roadmap! Please use file upload for now.</p> </div> )}
            <div className="mt-12 flex justify-between items-center">
              <StyledButton onClick={prevStep} variant="secondary" iconLeft={<LucideIcons.ArrowLeft />}>Back</StyledButton>
              <StyledButton onClick={nextStep} disabled={dataSource.type === 'api' || (dataSource.type === 'file' && (!dataSource.file || !dataSource.fields.email))} iconRight={<LucideIcons.ArrowRight />}>Next: Template</StyledButton>
            </div>
          </>
        );
      case 3:
        const isStep3NextDisabled = templateConfig.type === 'create'
            ? !templateConfig.templateData
            : (templateConfig.type === 'edit'
                ? !templateConfig.templateData 
                : (templateConfig.type === 'select' ? !templateConfig.selectedTemplateId : true));

        return (
          <>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Design Template</h2>
            <p className="text-md text-slate-500 mb-10">Choose an existing template or create a new one using our powerful editor.</p>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                 <OptionCard title="Create New Template" description="Build a unique template from scratch." selected={templateConfig.type === 'create'} onClick={() => setTemplateConfig(prev => ({...prev, type: 'create', selectedTemplateId: null, editingTemplate: null, templateData: null}))} icon={<LucideIcons.Palette />}/>
                <OptionCard title="Select Existing Template" description="Choose and customize a pre-built template." selected={templateConfig.type === 'select' || templateConfig.type === 'edit'} onClick={() => setTemplateConfig(prev => ({...prev, type: 'select', selectedTemplateId: null, editingTemplate: null, templateData: null}))} icon={<LucideIcons.LayoutGrid />}/>
            </div>
            {(templateConfig.type === 'select' || templateConfig.type === 'edit') && !templateConfig.editingTemplate && (
                <div className="mt-8 p-6 border border-slate-200 rounded-xl bg-slate-50 shadow-inner">
                    <h3 className="text-xl font-semibold text-slate-700 mb-5">Select a Template</h3>
                    {mockTemplates.length > 0 ? ( <ul className="space-y-4"> {mockTemplates.map(template => ( <li key={template.id} className="p-5 border border-slate-300 rounded-lg hover:shadow-lg transition-shadow flex justify-between items-center bg-white"> <span className="text-md font-medium text-slate-700">{template.name}</span> <StyledButton onClick={() => selectTemplateToEdit(template.id)} variant="secondary" className="py-2 px-4 text-xs" iconLeft={<LucideIcons.Edit3/>}> Edit </StyledButton> </li> ))} </ul> ) : ( <p className="text-md text-slate-500 text-center py-4">No existing templates available. Feel free to create a new one!</p> )}
                </div>
            )}
            {(templateConfig.type === 'create' || templateConfig.editingTemplate) && (
              <div className="mt-8 pt-6">
                <h3 className="text-2xl font-semibold text-slate-700 mb-2"> {templateConfig.editingTemplate ? `Editing: ${mockTemplates.find(t => t.id === templateConfig.selectedTemplateId)?.name}` : "Create New Template"} </h3>
                <p className="text-sm text-slate-500 mb-6">The builder is active below. Use the "Save All Pages" button within the builder's top bar to save your template configuration. Then, use the "Next" button below to proceed.</p>
                <div className="border-2 border-slate-300 rounded-xl overflow-hidden shadow-2xl bg-slate-200" style={{height: 'calc(100vh - 300px)', minHeight: '650px'}}>
                  <ElementBuilderPage onExternalSave={handleTemplateDataFromBuilder} initialBuilderState={templateConfig.editingTemplate || undefined} />
                </div>
              </div>
            )}
            <div className="mt-12 flex justify-between items-center">
              <StyledButton onClick={prevStep} variant="secondary" iconLeft={<LucideIcons.ArrowLeft />}>Back</StyledButton>
              <StyledButton onClick={nextStep} disabled={isStep3NextDisabled} iconRight={<LucideIcons.ArrowRight />}>Next: Review</StyledButton>
            </div>
          </>
        );
      case 4:
        const templateName = templateConfig.selectedTemplateId ? mockTemplates.find(t => t.id === templateConfig.selectedTemplateId)?.name : (templateConfig.templateData ? "Custom Template" : "No Template Selected");
        const currentTemplateData = templateConfig.templateData;
        return (
          <>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Review & Launch</h2>
            <p className="text-md text-slate-500 mb-10">Confirm all details. Your campaign is almost ready to go live!</p>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <SummaryCard title="Campaign Settings" icon={<LucideIcons.Settings2 />}>
                        <p><strong>Name:</strong> {campaignDetails.campaignName || 'N/A'}</p>
                        <p><strong>Start:</strong> {campaignDetails.startTime ? new Date(campaignDetails.startTime).toLocaleString() : 'N/A'}</p>
                        <p><strong>End:</strong> {campaignDetails.endTime ? new Date(campaignDetails.endTime).toLocaleString() : 'N/A'}</p>
                    </SummaryCard>
                    <SummaryCard title="Audience Configuration" icon={<LucideIcons.Users />}>
                        <p><strong>Source:</strong> {dataSource.type === 'file' ? 'File Upload' : 'API (Not Implemented)'}</p>
                        {dataSource.type === 'file' && (
                            <>
                                <p><strong>File:</strong> {dataSource.fileName || 'N/A'}</p>
                                <p className="mt-1 pt-1 border-t border-slate-200"><strong>Field Mappings:</strong></p>
                                <ul className="list-disc list-inside text-xs pl-3 space-y-0.5">
                                    <li>First Name: <span className="font-mono bg-slate-100 px-1 rounded">{dataSource.fields.firstName || 'N/A'}</span></li>
                                    <li>Last Name: <span className="font-mono bg-slate-100 px-1 rounded">{dataSource.fields.lastName || 'N/A'}</span></li>
                                    <li>Email: <span className="font-mono bg-slate-100 px-1 rounded">{dataSource.fields.email || 'N/A'}</span></li>
                                    <li>LinkedIn URL: <span className="font-mono bg-slate-100 px-1 rounded">{dataSource.fields.linkedInUrl || 'N/A'}</span></li>
                                </ul>
                            </>
                        )}
                    </SummaryCard>
                </div>
                <div className="lg:col-span-2">
                    <SummaryCard title="Template Preview" icon={<LucideIcons.Eye />}>
                        <p className="mb-3"><strong>Using:</strong> {templateName}</p>
                        <div className="mb-4 flex justify-center space-x-2 p-2 bg-slate-100 rounded-lg">
                            {['desktop', 'tablet', 'mobile'].map(device => (
                                <button key={device} onClick={() => setPreviewDevice(device)} title={`${device.charAt(0).toUpperCase() + device.slice(1)} View`} className={`p-2 rounded-md transition-colors ${previewDevice === device ? 'bg-sky-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
                                    {device === 'desktop' && <LucideIcons.Monitor className="w-5 h-5"/>}
                                    {device === 'tablet' && <LucideIcons.Tablet className="w-5 h-5"/>}
                                    {device === 'mobile' && <LucideIcons.Smartphone className="w-5 h-5"/>}
                                </button>
                            ))}
                        </div>
                        {currentTemplateData && currentTemplateData.pages && currentTemplateData.activePageId ? (
                            <div className="border-2 border-slate-300 rounded-lg overflow-hidden shadow-xl bg-slate-200" style={{ minHeight: '500px'}}>
                                 <PagePreviewRenderer
                                    pageLayout={currentTemplateData.pages[currentTemplateData.activePageId]?.layout || []}
                                    globalNavbar={currentTemplateData.globalNavbar}
                                    globalFooter={currentTemplateData.globalFooter}
                                    activePageId={currentTemplateData.activePageId}
                                    previewDevice={previewDevice}
                                    onNavigate={() => {}}
                                />
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-100 rounded text-slate-500 text-center min-h-[200px] flex items-center justify-center">
                                <LucideIcons.Info className="w-8 h-8 mr-2"/> No template data available for preview.
                            </div>
                        )}
                    </SummaryCard>
                </div>
            </div>
            <div className="mt-12 flex justify-between items-center">
              <StyledButton onClick={prevStep} variant="secondary" iconLeft={<LucideIcons.ArrowLeft />}>Back</StyledButton>
              <StyledButton onClick={handleLaunchCampaign} variant="launch" iconLeft={<LucideIcons.Rocket />}>Launch Campaign</StyledButton>
            </div>
          </>
        );
      default:
        return <div className="text-center py-10 text-slate-500">Error: Unknown step. Please restart.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex flex-col items-center font-sans antialiased">
      <div className="w-full max-w-6xl mx-auto">
        <header className="my-12 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-700 pb-3 tracking-tight">
                Campaign Launchpad
            </h1>
            <p className="text-slate-600 mt-2 text-lg md:text-xl max-w-2xl mx-auto">Craft and deploy your next marketing masterpiece with unparalleled ease and style.</p>
        </header>
        <StepperNav currentStep={currentStep} steps={steps} />
        <main className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mt-8">
          {renderStepContent()}
        </main>
      </div>
      <SuccessModal isOpen={showSuccessModal} onConfirm={resetCampaign} />
    </div>
  );
}