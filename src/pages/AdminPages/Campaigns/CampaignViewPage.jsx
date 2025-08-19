import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { getContactLists } from '../../../utils/localStorageHelper';
import getapiRequest from '../../../utils/getapiRequest';
import { PagePreviewRenderer } from '../../../ui-components/AdminPage/Campaign/Header';

const mockTemplates = [
    { id: 'tpl_corporate_sleek', name: 'Sleek Corporate Testimonial', builderData: { } },
    { id: 'tpl_creative_vibrant', name: 'Vibrant Creative Showcase', builderData: { } },
];

const InfoCard = ({ title, icon, children, className = "", gradientFrom = "from-green-50", gradientTo = "to-emerald-50" }) => {
    const IconComponent = icon || LucideIcons.Info;
    return (
        <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} p-6 rounded-2xl shadow-xl border border-slate-200/70 hover:shadow-slate-300/70 transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
            <div className="flex items-center text-green-600 mb-5">
                <div className="p-2 bg-white/70 rounded-full shadow-sm mr-3">
                    <IconComponent size={22} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 tracking-tight">{title}</h3>
            </div>
            <div className="space-y-3.5 text-sm text-slate-600">{children}</div>
        </div>
    );
};

const DetailItem = ({ label, value, icon }) => {
    const IconComponent = icon;
    return (
        <div className="flex items-start py-2 border-b border-slate-200/60 last:border-b-0">
            {IconComponent && <IconComponent size={16} className="text-green-500 mr-3 mt-0.5 shrink-0" />}
            <span className="font-medium text-slate-500 w-28 shrink-0">{label}:</span>
            <span className="text-slate-700 break-words leading-relaxed">{value || <span className="italic text-slate-400">Not Set</span>}</span>
        </div>
    );
};

export default function CampaignViewPage() {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewDevice, setPreviewDevice] = useState('desktop');
    const { token } = useSelector((state) => state.auth.userInfo);
    
    useEffect(() => {
        const fetchCampaign = async () => {
            if (!token || !campaignId) return;
            setLoading(true);
            try {
                const response = await getapiRequest('get', `/campaigns/${campaignId}`, {}, token);
                const fetchedCampaign = response.data;
                setCampaign(fetchedCampaign);
            } catch (error) {
                toast.error(error.response?.data?.message || "Campaign not found.");
                navigate('/campaigns');
            }
            setLoading(false);
        };
        fetchCampaign();
    }, [campaignId, navigate, token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <LucideIcons.Loader2 size={48} className="text-green-600 animate-spin" />
                <p className="ml-3 text-slate-600 text-lg">Loading Campaign Details...</p>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-8 text-center">
                <LucideIcons.FileX2 size={64} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-semibold text-slate-700 mb-2">Campaign Not Found</h2>
                <p className="text-slate-500 mb-6">The campaign you are looking for does not exist or may have been deleted.</p>
                <Link to="/campaigns">
                    <button className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center shadow-lg hover:shadow-green-500/50">
                        <LucideIcons.ArrowLeft size={18} className="mr-2" /> Back to Campaigns List
                    </button>
                </Link>
            </div>
        );
    }
    
    const { script, status, createdAt, updatedAt } = campaign;
    const templateConfig = script ? JSON.parse(script) : { type: 'none' };
    
    const templateName = templateConfig.selectedTemplateId
        ? (mockTemplates.find(t => t.id === templateConfig.selectedTemplateId)?.name || "Selected Template")
        : (templateConfig.templateData ? "Custom Designed Template" : "No Template Configured");

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-stone-50 to-sky-100 p-4 md:p-6 lg:p-8">
            <div className="max-w-screen-2xl mx-auto">
                <header className="mb-10 flex flex-col sm:flex-row justify-between items-center gap-4 pb-6 border-b-2 border-green-200">
                    <div>
                        <Link to="/campaigns" className="text-sm text-green-600 hover:text-green-700 flex items-center mb-2 group">
                            <LucideIcons.ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Campaigns
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 flex items-center tracking-tight">
                            <LucideIcons.Presentation size={38} className="mr-3 text-green-500" />
                            {campaign.campaignName || "Campaign View"}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                        <Link to={`/campaigns/edit/${campaign.id}`}>
                             <button className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-lg hover:shadow-green-500/40 transition-all transform hover:scale-105">
                                <LucideIcons.Edit3 size={16} className="mr-2"/> Edit Campaign
                            </button>
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-4 space-y-8">
                        <InfoCard title="Core Details" icon={LucideIcons.FileText} gradientFrom="from-green-50" gradientTo="to-emerald-50">
                            <DetailItem label="Campaign Name" value={campaign.campaignName} />
                            <DetailItem label="Status" value={status || 'Draft'} icon={LucideIcons.Activity} />
                            <DetailItem label="Start Time" value={campaign.startTime ? new Date(campaign.startTime).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null} icon={LucideIcons.CalendarCheck2} />
                            <DetailItem label="End Time" value={campaign.endTime ? new Date(campaign.endTime).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null} icon={LucideIcons.CalendarCheck2} />
                            <DetailItem label="Created At" value={createdAt ? new Date(createdAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric' }) : null} icon={LucideIcons.CalendarPlus} />
                            <DetailItem label="Last Updated" value={updatedAt ? new Date(updatedAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric' }) : null} icon={LucideIcons.CalendarClock} />
                        </InfoCard>

                        <InfoCard title="Audience Configuration" icon={LucideIcons.Users2} gradientFrom="from-sky-50" gradientTo="to-blue-50">
                            <DetailItem label="Source Type" value={campaign.audienceFile ? 'File Upload' : campaign.contactListId ? 'From Saved Contacts' : 'N/A'} icon={campaign.audienceFile ? LucideIcons.FileUp : LucideIcons.Contact2} />
                            {campaign.audienceFile && (
                                <DetailItem label="Uploaded File" value={campaign.audienceFile} icon={LucideIcons.FileArchive}/>
                            )}
                            {campaign.contactListId && (
                                <DetailItem label="Contact List ID" value={campaign.contactListId} icon={LucideIcons.ListChecks} />
                            )}
                        </InfoCard>
                    </div>

                    <div className="xl:col-span-8">
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 h-full flex flex-col hover:shadow-slate-300/70 transition-all duration-300">
                            <div className="flex items-center text-green-600 mb-5">
                                 <div className="p-2 bg-white/70 rounded-full shadow-sm mr-3">
                                    <LucideIcons.LayoutPanelLeft size={22} strokeWidth={2.5}/>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-700 tracking-tight">Landing Page Preview</h3>
                            </div>
                            <p className="mb-3 text-sm text-slate-500">Template: <span className="font-medium text-slate-600">{templateName}</span></p>
                            <div className="mb-5 flex justify-center space-x-2 p-1.5 bg-slate-100 rounded-lg shadow-inner">
                                {['desktop', 'tablet', 'mobile'].map(device => (
                                    <button
                                        key={device}
                                        onClick={() => setPreviewDevice(device)}
                                        title={`${device.charAt(0).toUpperCase() + device.slice(1)} View`}
                                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 transform hover:scale-105
                                            ${previewDevice === device ? 'bg-green-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'}`}
                                    >
                                        {device === 'desktop' && <LucideIcons.Monitor size={14}/>}
                                        {device === 'tablet' && <LucideIcons.Tablet size={14}/>}
                                        {device === 'mobile' && <LucideIcons.Smartphone size={14}/>}
                                        <span>{device.charAt(0).toUpperCase() + device.slice(1)}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex-grow border-2 border-slate-300 rounded-xl overflow-hidden shadow-2xl bg-slate-200" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
                                {templateConfig.templateData && templateConfig.templateData.pages && templateConfig.templateData.activePageId && PagePreviewRenderer ? (
                                    <div className="w-full h-full overflow-auto custom-scrollbar-preview">
                                         <PagePreviewRenderer
                                            pageLayout={templateConfig.templateData.pages[templateConfig.templateData.activePageId]?.layout || []}
                                            globalNavbar={templateConfig.templateData.globalNavbar}
                                            globalFooter={templateConfig.templateData.globalFooter}
                                            activePageId={templateConfig.templateData.activePageId}
                                            previewDevice={previewDevice}
                                            onNavigate={() => {}}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-grow p-8 bg-slate-100/70 rounded-lg text-slate-500 text-center flex flex-col items-center justify-center">
                                        <LucideIcons.ImageOff size={48} className="mb-4 text-slate-400"/>
                                        <p className="font-semibold text-lg">No Template Visual Available</p>
                                        <p className="text-sm mt-1.5">The template data might be missing or not configured for this campaign.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .custom-scrollbar-preview::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar-preview::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 0; }
                .custom-scrollbar-preview::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 0; }
                .custom-scrollbar-preview::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}</style>
        </div>
    );
}