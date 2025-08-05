import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { CustomDropdown } from '../Common/CustomDropdown';

export default function GeneralSettingsPage() {
    const [siteTitle, setSiteTitle] = useState('Hyperpitch.io Platform');
    const [tagline, setTagline] = useState('Elevate Your Pitch.');
    const [adminEmail, setAdminEmail] = useState('support@hyperpitch.io');
    const [membership, setMembership] = useState(true);
    const [selectedDefaultRole, setSelectedDefaultRole] = useState({ value: 'subscriber', label: 'Standard User' });
    const [selectedSiteLanguage, setSelectedSiteLanguage] = useState({value: 'en_US', label: 'English (United States)'});
    const [selectedTimezone, setSelectedTimezone] = useState({ value: 'America/New_York', label: 'America/New York' });
    const [companyName, setCompanyName] = useState('Hyperpitch Inc.');
    const [companyAddress, setCompanyAddress] = useState('123 Innovation Drive, Tech City, USA');
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ siteTitle, tagline, adminEmail, membership, selectedDefaultRole, selectedSiteLanguage, selectedTimezone, companyName, companyAddress, maintenanceMode });
        alert('Hyperpitch.io General Settings Saved!');
    };

    const userRoleOptions = [
      {value: 'subscriber', label: 'Standard User'}, {value: 'editor', label: 'Content Editor'}, {value: 'administrator', label: 'Platform Administrator'},
    ];
    const languageOptions = [
      {value: 'en_US', label: 'English (United States)'}, {value: 'es_ES', label: 'Español'}, {value: 'fr_FR', label: 'Français'}, {value: 'de_DE', label: 'Deutsch'},
    ];
    const timezoneOptions = [
      { value: 'UTC-0', label: 'UTC+0' }, { value: 'America/New_York', label: 'America/New York (EST/EDT)' }, { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' }, { value: 'Europe/London', label: 'Europe/London (GMT/BST)' }, { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
    ];
  
    const inputBase = "block w-full bg-white/70 border border-slate-300/70 rounded-lg py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2e8b57]/60 focus:border-[#2e8b57] transition-all duration-150 ease-in-out text-sm";
    const labelBase = "block text-xs font-semibold text-slate-700 mb-1";
    const sectionWrapper = "bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-slate-200/60";
    const fieldGroup = "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5";
    const toggleBase = "relative inline-flex items-center h-5 rounded-full w-9 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2e8b57]/50 focus:ring-offset-1 focus:ring-offset-white";
    const toggleChecked = "bg-[#2e8b57]";
    const toggleUnchecked = "bg-slate-300";
    const toggleKnob = "inline-block w-3.5 h-3.5 transform bg-white rounded-full transition-transform duration-150 ease-in-out";

    return (
        <div className="space-y-10">
            <header className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                    Platform Configuration
                </h1>
                <p className="mt-1.5 text-base text-slate-600 max-w-2xl mx-auto md:mx-0">
                    Manage core settings that define your Hyperpitch.io experience.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10">
                <section className={sectionWrapper}>
                    <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                        <LucideIcons.Info size={24} className="mr-2.5 text-[#2e8b57]" />
                        Platform Details
                    </h2>
                    <div className={fieldGroup}>
                        <div>
                            <label htmlFor="siteTitle" className={labelBase}>Platform Name</label>
                            <input type="text" id="siteTitle" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} className={inputBase} />
                        </div>
                        <div>
                            <label htmlFor="tagline" className={labelBase}>Platform Tagline</label>
                            <input type="text" id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputBase} />
                        </div>
                        <div>
                            <label htmlFor="companyName" className={labelBase}>Company Name</label>
                            <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputBase} />
                        </div>
                        <div>
                            <label htmlFor="companyAddress" className={labelBase}>Company Address</label>
                            <input type="text" id="companyAddress" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className={inputBase} />
                        </div>
                    </div>
                </section>

                <section className={sectionWrapper}>
                    <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                        <LucideIcons.Users size={24} className="mr-2.5 text-[#2e8b57]" />
                        User Settings
                    </h2>
                    <div className={fieldGroup}>
                        <div>
                            <label htmlFor="adminEmail" className={labelBase}>Administrator Email <span className="text-red-500">*</span></label>
                            <input type="email" id="adminEmail" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required className={inputBase} />
                        </div>
                        <CustomDropdown label="Default New User Role" labelBase={labelBase} options={userRoleOptions} selected={selectedDefaultRole} onSelect={setSelectedDefaultRole} />
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <label className={labelBase}>Allow User Registration</label>
                            <p className="text-xs text-slate-500 max-w-sm">Enable this to allow new users to sign up for an account on Hyperpitch.io.</p>
                        </div>
                        <button type="button" onClick={() => setMembership(!membership)} className={`${toggleBase} flex-shrink-0 sm:mt-1 ${membership ? toggleChecked : toggleUnchecked}`}>
                            <span className={`${toggleKnob} ${membership ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </section>
                
                <section className={sectionWrapper}>
                    <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                        <LucideIcons.Languages size={24} className="mr-2.5 text-[#2e8b57]" />
                        Localization & Region
                    </h2>
                    <div className={fieldGroup}>
                        <CustomDropdown label="Platform Language" labelBase={labelBase} options={languageOptions} selected={selectedSiteLanguage} onSelect={setSelectedSiteLanguage} />
                        <CustomDropdown label="Default Timezone" labelBase={labelBase} options={timezoneOptions} selected={selectedTimezone} onSelect={setSelectedTimezone} />
                    </div>
                </section>

                <section className={sectionWrapper}>
                    <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                        <LucideIcons.ServerCog size={24} className="mr-2.5 text-[#2e8b57]" />
                        Advanced Settings
                    </h2>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <label className={labelBase}>Maintenance Mode</label>
                            <p className="text-xs text-slate-500 max-w-sm">Temporarily make the platform unavailable to users while performing updates.</p>
                        </div>
                        <button type="button" onClick={() => setMaintenanceMode(!maintenanceMode)} className={`${toggleBase} flex-shrink-0 sm:mt-1 ${maintenanceMode ? toggleChecked : toggleUnchecked}`}>
                            <span className={`${toggleKnob} ${maintenanceMode ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                    <div className="mt-6">
                        <label className={labelBase}>API Key Management</label>
                        <button type="button" className="text-xs px-3 py-1.5 bg-green-50 text-[#2e8b57] border border-green-200 rounded-md hover:bg-green-100 transition-colors font-medium">
                            Manage API Keys (Admins Only)
                        </button>
                        <p className="text-xs text-slate-500 mt-1">Configure API access for integrations.</p>
                    </div>
                </section>
                
                <div className="pt-6 flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-lg text-slate-700 font-medium hover:bg-slate-100/80 transition-colors duration-150 text-sm order-2 sm:order-1 border border-slate-300">
                        Revert Changes
                    </button>
                    <button type="submit" className="order-1 sm:order-2 inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#2e8b57] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-200 focus:ring-green-500 transition-all duration-150 ease-in-out transform hover:scale-[1.02]">
                        <LucideIcons.Check size={18} className="mr-2" />
                        Save Configurations
                    </button>
                </div>
            </form>
        </div>
    );
}