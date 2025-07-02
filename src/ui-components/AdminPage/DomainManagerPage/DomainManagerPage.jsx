import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

const getDomainsFromStorage = () => JSON.parse(localStorage.getItem('customDomains') || '[]');
const saveDomainsToStorage = (domains) => localStorage.setItem('customDomains', JSON.stringify(domains));

const mockGenerateDnsValue = (domain) => {
    const hash = domain.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    return `${Math.abs(hash)}.sites.hyperpitch.io`;
};

const mockGenerateVerificationCode = (domain) => {
    const hash = domain.split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0);
    return `hp-verify=${Math.abs(hash).toString(36)}`;
};

const Stepper = ({ steps, currentStep }) => (
    <nav aria-label="Progress">
        <ol role="list" className="flex items-start">
            {steps.map((step, stepIdx) => (
                <React.Fragment key={step.name}>
                    <li className="relative flex flex-col items-center flex-1">
                        <div className="flex flex-col items-center text-center">
                            <span className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold border-2 transition-all duration-300 ${currentStep > step.id ? "bg-[#2e8b57] border-green-500 text-white" : ""} ${currentStep === step.id ? "bg-[#2e8b57] border-green-600 text-white scale-110 shadow-lg" : "bg-slate-200 border-slate-300 text-slate-500"}`}>
                                {currentStep > step.id ? <LucideIcons.Check size={20} strokeWidth={3} /> : step.id}
                            </span>
                            <span className={`mt-2 text-xs font-semibold max-w-[100px] transition-colors duration-200 ${currentStep === step.id ? "text-green-700" : "text-slate-600"}`}>
                                {step.name}
                            </span>
                        </div>
                    </li>
                    {stepIdx < steps.length - 1 && (
                         <div className={`flex-auto border-t-2 transition-colors duration-500 w-full mt-5 ${currentStep > step.id ? 'border-green-500' : 'border-slate-300'}`} />
                    )}
                </React.Fragment>
            ))}
        </ol>
    </nav>
);

const StyledButton = ({ onClick, children, variant = "primary", disabled = false, className = "", iconLeft }) => {
    const baseStyle = "px-5 py-2 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out inline-flex items-center justify-center shadow-sm hover:shadow-md transform hover:-translate-y-px";
    const variantStyles = { 
        primary: "bg-[#2e8b57] hover:bg-green-700 text-white focus:ring-green-500", 
        secondary: "bg-slate-200 hover:bg-slate-300 text-slate-700 focus:ring-slate-400 border border-slate-300", 
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variantStyles[variant]} ${disabled ? "opacity-60 cursor-not-allowed saturate-50" : ""} ${className}`}>
            {iconLeft && React.cloneElement(iconLeft, { className: "w-4 h-4 mr-1.5" })}
            {children}
        </button>
    );
};

const CopyButton = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 font-semibold py-1 px-3 rounded-md transition-all">
            {copied ? <div className="flex items-center"><LucideIcons.Check size={14} className="text-green-600 mr-1" /> Copied</div> : 'Copy'}
        </button>
    );
};

const FaqItem = ({ icon, question, children }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 mr-4 mt-1">
            {React.cloneElement(icon, { className: "w-5 h-5 text-green-600"})}
        </div>
        <div>
            <h4 className="font-semibold text-slate-700">{question}</h4>
            <p className="text-slate-500 text-sm mt-1">{children}</p>
        </div>
    </div>
);


const OptionCard = ({ title, description, selected, onClick, icon }) => (
    <button type="button" onClick={onClick} className={`w-full p-6 border-2 rounded-xl text-left transition-all duration-200 group ${selected ? "border-green-500 bg-green-50/80 ring-2 ring-green-200" : "border-slate-300 bg-white hover:border-green-400/70 hover:bg-green-50/30"}`}>
        <div className="flex items-center">
            <div className={`mr-4 p-3 rounded-lg transition-colors duration-200 ${selected ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500 group-hover:bg-green-100"}`}>
                {React.cloneElement(icon, { className: "w-6 h-6" })}
            </div>
            <div className="flex-1">
                <h3 className={`text-md font-semibold ${selected ? "text-green-800" : "text-slate-800"}`}>{title}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{description}</p>
            </div>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ml-4 shrink-0 border-2 transition-all duration-200 ${selected ? "bg-green-600 border-green-600" : "bg-white border-slate-400 group-hover:border-green-500"}`}>
                {selected && <LucideIcons.Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </div>
        </div>
    </button>
);


export default function DomainManagerPage() {
    const [domains, setDomains] = useState(getDomainsFromStorage());
    const [isConnecting, setIsConnecting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [connectType, setConnectType] = useState(null);
    const [domainInput, setDomainInput] = useState('');
    const [subdomainInput, setSubdomainInput] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('pending');

    const fullDomain = connectType === 'subdomain' ? `${subdomainInput}.${domainInput}` : `www.${domainInput}`;
    const brandDomain = domainInput;

    const addDomain = (domainData) => {
        const newDomains = [...domains, domainData];
        setDomains(newDomains);
        saveDomainsToStorage(newDomains);
    };
    
    const deleteDomain = (domainId) => {
        const newDomains = domains.filter(d => d.id !== domainId);
        setDomains(newDomains);
        saveDomainsToStorage(newDomains);
    };
    
    const setAsPrimary = (domainId) => {
        const newDomains = domains.map(d => ({...d, isPrimary: d.id === domainId }));
        setDomains(newDomains);
        saveDomainsToStorage(newDomains);
    };

    const handleNextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };
    
    const handleGoBack = () => {
      if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleVerifyAndConnect = () => {
        setVerificationStatus('verifying');
        setTimeout(() => {
            const newDomain = {
                id: `dom-${Date.now()}`,
                name: fullDomain,
                isPrimary: domains.length === 0,
                status: 'Connected',
                type: 'Website pages',
            };
            addDomain(newDomain);
            setVerificationStatus('verified');
            handleNextStep();
        }, 2500);
    };

    const resetWizard = () => {
        setCurrentStep(1);
        setConnectType(null);
        setDomainInput('');
        setSubdomainInput('');
        setVerificationStatus('pending');
    }

    const connectAnother = () => {
        resetWizard();
    }
    
    const finishSetup = () => {
        setIsConnecting(false);
        resetWizard();
    }

    const steps = [
        { id: 1, name: 'Choose Domain Type' },
        { id: 2, name: 'Update DNS Records' },
        { id: 3, name: 'Domain Connected' }
    ];

    const wizardContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="w-full max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Let's connect your domain</h2>
                        <p className="text-slate-500 mb-8">First, tell us if you're connecting a main domain or a subdomain.</p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <OptionCard
                                title="Root Domain"
                                description="e.g., yourcompany.com"
                                icon={<LucideIcons.Globe2 />}
                                selected={connectType === 'root'}
                                onClick={() => setConnectType('root')}
                            />
                             <OptionCard
                                title="Subdomain"
                                description="e.g., blog.yourcompany.com"
                                icon={<LucideIcons.Globe />}
                                selected={connectType === 'subdomain'}
                                onClick={() => setConnectType('subdomain')}
                            />
                        </div>
                        
                        {connectType && (
                            <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-slate-200 text-left animate-fade-in">
                                {connectType === 'root' && (
                                    <div>
                                        <label htmlFor="domain" className="block text-sm font-medium text-slate-700 mb-2">Enter your root domain</label>
                                        <input type="text" id="domain" value={domainInput} onChange={(e) => setDomainInput(e.target.value.toLowerCase())} placeholder="yourdomain.com" className="block w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500" required />
                                        <p className="text-xs text-slate-500 mt-2">We will automatically set it up to work with the 'www' prefix, like <span className="font-semibold">www.yourdomain.com</span>.</p>
                                    </div>
                                )}
                                {connectType === 'subdomain' && (
                                    <div className="grid md:grid-cols-3 gap-4 items-end">
                                        <div className="md:col-span-1">
                                            <label htmlFor="subdomain" className="block text-sm font-medium text-slate-700 mb-2">Subdomain</label>
                                            <input type="text" id="subdomain" value={subdomainInput} onChange={(e) => setSubdomainInput(e.target.value.toLowerCase())} placeholder="blog" className="block w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500" required />
                                        </div>
                                         <div className="md:col-span-2 ml-2">
                                            <label htmlFor="domain" className="block text-sm font-medium text-slate-700 mb-2">Root Domain</label>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 -mr-7 ml-2 z-10">.</span>
                                                <input type="text" id="domain" value={domainInput} onChange={(e) => setDomainInput(e.target.value.toLowerCase())} placeholder="yourdomain.com" className="block w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500" required />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 2:
                const dnsValue = mockGenerateDnsValue(brandDomain);
                const verificationCode = mockGenerateVerificationCode(brandDomain);
                const hostName = connectType === 'subdomain' ? subdomainInput : 'www';

                return (
                    <div className="w-full max-w-5xl mx-auto">
                        <div className="text-center">
                             <h2 className="text-3xl font-bold text-slate-800 mb-3">Update your DNS records</h2>
                             <p className="text-slate-500 mb-8 max-w-3xl mx-auto">Log in to your domain provider (e.g., GoDaddy, Namecheap) and add the following CNAME record. This proves you own the domain.</p>
                        </div>
                        
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                                <h3 className="font-semibold text-slate-700 mb-4">Add this CNAME Record</h3>
                                <div className="overflow-x-auto rounded-lg border border-slate-200">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-xs text-slate-600 uppercase">
                                            <tr>
                                                <th className="px-4 py-2 font-semibold">Type</th>
                                                <th className="px-4 py-2 font-semibold">Host / Name</th>
                                                <th className="px-4 py-2 font-semibold">Value / Points to</th>
                                                <th className="px-4 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            <tr className="bg-white">
                                                <td className="px-4 py-3 font-mono text-slate-800">CNAME</td>
                                                <td className="px-4 py-3 font-mono text-slate-800">{hostName}</td>
                                                <td className="px-4 py-3 font-mono text-slate-800 break-all">{dnsValue}</td>
                                                <td className="px-4 py-3 text-right"><CopyButton textToCopy={dnsValue} /></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                {verificationStatus === 'verifying' && 
                                    <div className="mt-4 text-sm text-blue-700 flex items-center animate-fade-in"><LucideIcons.Loader className="w-4 h-4 mr-2 animate-spin" /> We're checking your records now...</div>
                                }
                            </div>
                            <div className="lg:col-span-1 bg-green-50/50 p-6 rounded-xl border border-green-200">
                                <h3 className="font-semibold text-slate-800 mb-4">Common Questions</h3>
                                <div className="space-y-5">
                                    <FaqItem icon={<LucideIcons.Clock />} question="How long does it take?">Changes can be instant, but sometimes take up to 48 hours to propagate worldwide.</FaqItem>
                                    <FaqItem icon={<LucideIcons.Settings />} question="Where are my DNS settings?">You can find them in the admin panel of your domain registrar, like GoDaddy, Namecheap, or Cloudflare.</FaqItem>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                 return (
                    <div className="w-full max-w-2xl mx-auto text-center py-12">
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 ring-8 ring-green-50">
                            <LucideIcons.CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Domain connected!</h2>
                        <p className="text-slate-500 mb-8"><strong className="text-slate-700">{fullDomain}</strong> is now live and pointing to your content.</p>

                        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                            <h4 className="font-semibold text-slate-800">What's Next?</h4>
                            <p className="text-sm text-slate-500 mt-1 mb-4">You can now assign this domain to your pages or connect another one.</p>
                            <div className="flex justify-center gap-4">
                                <StyledButton onClick={finishSetup} variant="primary" iconLeft={<LucideIcons.Check />}>Done</StyledButton>
                                <StyledButton onClick={connectAnother} variant="secondary" iconLeft={<LucideIcons.Plus />}>Connect Another Domain</StyledButton>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const wizardButtons = () => {
        const isStep1Complete = connectType && domainInput && (connectType === 'root' || (connectType === 'subdomain' && subdomainInput));

        switch(currentStep) {
            case 1:
                return <div className="mt-10 flex justify-end"><StyledButton onClick={handleNextStep} disabled={!isStep1Complete}>Next</StyledButton></div>;
            case 2:
                return <div className="mt-10 flex justify-between"><StyledButton variant="secondary" onClick={handleGoBack}>Back</StyledButton><StyledButton onClick={handleVerifyAndConnect} disabled={verificationStatus === 'verifying'}>{verificationStatus === 'verifying' ? <><LucideIcons.Loader className="w-4 h-4 mr-1.5 animate-spin" /> Verifying...</> : 'Verify Connection'}</StyledButton></div>;
            case 3:
                return null;
            default:
                return null;
        }
    }
    
    const renderDomainList = () => (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Domains & URLs</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage domains for your website pages, landing pages, and blog.</p>
                </div>
                <StyledButton onClick={() => setIsConnecting(true)} iconLeft={<LucideIcons.Plus/>}>Connect a domain</StyledButton>
            </div>
            
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Domain</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Primary For</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {domains.length > 0 ? domains.map(domain => (
                                <tr key={domain.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-slate-800">{domain.name}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><LucideIcons.CheckCircle size={14} className="mr-1.5" />{domain.status}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{domain.isPrimary ? <div className="flex items-center font-semibold text-green-700"><LucideIcons.Star size={14} className="mr-1.5 fill-current"/> Website pages</div> : <button onClick={() => setAsPrimary(domain.id)} className="text-slate-500 hover:text-green-600 font-medium">Set as primary</button>}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right"><button onClick={() => deleteDomain(domain.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-md transition-colors"><LucideIcons.Trash2 size={16} /></button></td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4"><div className="text-center py-20"><LucideIcons.Globe2 size={48} className="mx-auto text-slate-300 mb-3"/><h3 className="text-lg text-slate-700 font-medium">No domains connected yet</h3><p className="text-slate-500 mt-1">Connect a custom domain to build your brand and publish content.</p></div></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );

    const renderWizard = () => (
        <div className="w-full">
            <div className="mb-12 max-w-3xl mx-auto"><Stepper steps={steps} currentStep={currentStep} /></div>
            {wizardContent()}
            {wizardButtons()}
        </div>
    );
    
    return (
        <div className="bg-slate-50 w-full min-h-screen">
            <main className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                {isConnecting ? renderWizard() : renderDomainList()}
            </main>
            <style jsx global>{`
                @keyframes fade-in { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
}