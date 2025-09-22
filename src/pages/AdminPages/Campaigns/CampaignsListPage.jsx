import React, { useState, useEffect, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axios from 'axios';
import getapiRequest from '../../../utils/getapiRequest';

const StyledButton = ({ onClick, children, type = 'button', variant = 'primary', disabled = false, className = '', iconLeft, iconRight, iconCenter, size = 'medium' }) => {
    const baseStyle = "rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out inline-flex items-center justify-center group transform hover:-translate-y-px active:translate-y-0";
    const sizeStyles = { small: "px-3 py-1.5 text-xs", medium: "px-5 py-2 text-sm", large: "px-6 py-2.5 text-base" };
    const greenButton = "bg-[#2e8b57] hover:bg-green-700 text-white shadow-md hover:shadow-lg focus:ring-green-500 focus:ring-offset-white active:bg-green-800";
    const variantStyles = {
        primary: greenButton,
        secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400 border border-slate-300 hover:border-slate-400 shadow-sm hover:shadow-md active:bg-slate-300 focus:ring-offset-white",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md focus:ring-red-500 focus:ring-offset-white active:bg-red-700",
        outline: "border border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-300",
    };
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? 'opacity-60 cursor-not-allowed saturate-50' : ''} ${className}`}>
            {iconLeft && React.cloneElement(iconLeft, {className: `w-4 h-4 ${size === 'small' ? 'mr-1' : 'mr-1.5'} ${size !== 'small' ? '-ml-1' : ''} group-hover:scale-105 transition-transform`})}
            {iconCenter && React.cloneElement(iconCenter, {className: `w-4 h-4 group-hover:scale-105 transition-transform`})}
            {children}
            {iconRight && React.cloneElement(iconRight, {className: `w-4 h-4 ${size === 'small' ? 'ml-1' : 'ml-1.5'} ${size !== 'small' ? '-mr-1' : ''} group-hover:translate-x-0.5 transition-transform`})}
        </button>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-800/60 backdrop-blur-sm flex items-center justify-center z-[250] p-4 animate-fadeInModal">
            <div className={`bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-150 ease-out animate-scaleUpModal border border-slate-200`}>
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <LucideIcons.AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                        <div className="mt-2"><p className="text-sm text-slate-600">{message}</p></div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <StyledButton onClick={onConfirm} variant="danger" size="medium" className="w-full sm:w-auto">{confirmText}</StyledButton>
                    <StyledButton onClick={onClose} variant="secondary" size="medium" className="w-full sm:w-auto">{cancelText}</StyledButton>
                </div>
            </div>
        </div>
    );
};

export default function CampaignListPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState(null);
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.userToken);

    const loadCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getapiRequest('get', '/campaigns', {}, token);
            const sortedCampaigns = response.data.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
            setCampaigns(sortedCampaigns);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load campaigns.");
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            loadCampaigns();
        }
    }, [loadCampaigns, token]);

    const filteredCampaigns = campaigns.filter(c => c.campaignName?.toLowerCase().includes(searchTerm.toLowerCase()));

    const promptDelete = (campaign) => {
        setCampaignToDelete(campaign);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (campaignToDelete) {
            const BASE_URL = import.meta.env.VITE_API_BASE_URL;
            try {
                await axios.delete(`${BASE_URL}/campaigns/${campaignToDelete.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                toast.success(`Campaign "${campaignToDelete.campaignName}" deleted!`);
                loadCampaigns();
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to delete campaign.");
            } finally {
                setIsConfirmModalOpen(false);
                setCampaignToDelete(null);
            }
        }
    };

    const getStatusChip = (status) => {
        let bgColor = 'bg-slate-100', textColor = 'text-slate-600', dotColor = 'bg-slate-400';
        switch (status?.toLowerCase()) {
            case 'draft': bgColor = 'bg-amber-100'; textColor = 'text-amber-700'; dotColor = 'bg-amber-500'; break;
            case 'active': case 'live': case 'running': bgColor = 'bg-green-100'; textColor = 'text-green-700'; dotColor = 'bg-green-500'; break;
            case 'completed': case 'finished': bgColor = 'bg-blue-100'; textColor = 'text-blue-700'; dotColor = 'bg-blue-500'; break;
            case 'paused': bgColor = 'bg-purple-100'; textColor = 'text-purple-700'; dotColor = 'bg-purple-500'; break;
            case 'archived': bgColor = 'bg-gray-100'; textColor = 'text-gray-700'; dotColor = 'bg-gray-500'; break;
            default: status = 'Unknown';
        }
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}><span className={`w-2 h-2 mr-1.5 rounded-full ${dotColor}`}></span>{status}</span>;
    };

    const renderEmptyState = () => (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-slate-200">
            <LucideIcons.ArchiveX size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium text-lg">{searchTerm ? 'No campaigns match your search' : 'No Campaigns Yet'}</p>
            <p className="text-sm text-slate-500 mb-6">{searchTerm ? 'Try a different search term.' : 'Start by creating your first campaign.'}</p>
            {!searchTerm && (<Link to="/campaigns/create"><StyledButton iconLeft={<LucideIcons.PlusCircle />}>Create First Campaign</StyledButton></Link>)}
        </div>
    );
    
    if (loading) {
        return (
            <div className="p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen flex items-center justify-center">
                <LucideIcons.Loader2 className="animate-spin text-green-600 w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-screen-xl mx-auto">
                <header className="mb-8 flex flex-col text-center sm:flex-row sm:justify-between sm:items-center sm:text-left gap-4">
                   <div className="flex flex-col sm:flex-row items-center">
                    <LucideIcons.Megaphone size={36} className="text-green-600 hidden sm:block mb-2 sm:mb-0 sm:mr-4" />
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Campaigns</h1>
                        <p className="text-sm text-slate-500">Oversee all your marketing initiatives.</p>
                    </div>
                </div>
                    <Link to="/campaigns/create">
                        <StyledButton iconLeft={<LucideIcons.PlusCircle size={18} />} size="medium" className="w-full sm:w-auto">
                            Create New Campaign
                        </StyledButton>
                    </Link>
                </header>

                <div className="mb-6 relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LucideIcons.Search size={18} className="text-slate-400 group-focus-within:text-green-500 transition-colors duration-200" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search campaigns by name..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 sm:text-sm bg-white transition-all duration-300 hover:border-slate-400 hover:shadow-md focus:shadow-lg" 
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')} 
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-r-xl transition-all duration-200 group/clear"
                            title="Clear search"
                        >
                            <LucideIcons.X size={16} className="group-hover/clear:scale-110 transition-transform" />
                        </button>
                    )}
                </div>

                {filteredCampaigns.length > 0 ? (
                    <>
                        <div className="md:hidden space-y-4">
                            {filteredCampaigns.map((campaign) => (
                                <div key={campaign.id} className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 pr-2">
                                            <p className="text-sm font-semibold text-slate-800">{campaign.campaignName || 'Unnamed Campaign'}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">ID: {String(campaign.id).slice(-8)}</p>
                                        </div>
                                        {getStatusChip(campaign.status || 'Draft')}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 mt-3 py-3 border-y border-slate-100">
                                        <div><strong className="block text-slate-500">Start Date</strong>{campaign.startTime ? new Date(campaign.startTime).toLocaleDateString() : 'N/A'}</div>
                                        <div><strong className="block text-slate-500">Audience</strong>{campaign.audienceFile ? 'File Based' : (campaign.contactListId ? 'Contact List' : 'N/A')}</div>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <p className="text-[11px] text-slate-400">Updated: {new Date(campaign.updatedAt || campaign.createdAt).toLocaleString()}</p>
                                        <div className="flex items-center space-x-1">
                                            <StyledButton onClick={() => navigate(`/analytics/${campaign.id}`)} variant="outline" size="small" iconLeft={<LucideIcons.BarChart3 size={14} />} className="!px-2 !py-1 border-green-300 text-green-700 hover:bg-green-50" />
                                            <StyledButton onClick={() => navigate(`/campaigns/view/${campaign.id}`)} variant="outline" size="small" iconCenter={<LucideIcons.Eye size={14} />} className="!px-2 !py-1" />
                                            <StyledButton onClick={() => navigate(`/campaigns/edit/${campaign.id}`)} variant="secondary" size="small" iconCenter={<LucideIcons.Edit3 size={14} />} className="!px-2 !py-1" />
                                            <StyledButton onClick={() => promptDelete(campaign)} variant="danger" size="small" iconCenter={<LucideIcons.Trash2 size={14} />} className="!px-2 !py-1" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="hidden md:block bg-white shadow-2xl rounded-2xl border border-slate-200/80 overflow-hidden backdrop-blur-sm">
                            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                                <table className="min-w-full divide-y divide-slate-200/60">
                                    <thead className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 border-b border-slate-200/60">
                                        <tr className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest">
                                            <th className="px-6 py-5 font-extrabold">Campaign Name</th>
                                            <th className="px-6 py-5 font-extrabold">Status</th>
                                            <th className="px-6 py-5 font-extrabold">Start Date</th>
                                            <th className="px-6 py-5 text-center font-extrabold">Audience Source</th>
                                            <th className="px-6 py-5 font-extrabold">Last Updated</th>
                                            <th className="px-6 py-5 text-center font-extrabold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {filteredCampaigns.map((campaign) => (
                                            <tr key={campaign.id} className="hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-slate-100/60 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] group">
                                                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-slate-800">{campaign.campaignName || 'Unnamed Campaign'}</div><div className="text-xs text-slate-500">ID: {String(campaign.id).slice(-8)}</div></td>
                                                <td className="px-6 py-4 whitespace-nowrap">{getStatusChip(campaign.status || 'Draft')}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{campaign.startTime ? new Date(campaign.startTime).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center">{campaign.audienceFile ? 'File Based' : (campaign.contactListId ? 'Contact List' : 'N/A')}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(campaign.updatedAt || campaign.createdAt).toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"><div className="flex items-center justify-center space-x-1.5">
                                                    <StyledButton onClick={() => navigate(`/analytics/${campaign.id}`)} variant="outline" size="small" iconLeft={<LucideIcons.BarChart3 size={14} />} className="!px-2.5 !py-1 border-green-300 text-green-700 hover:bg-green-50">Analytics</StyledButton>
                                                    <StyledButton onClick={() => navigate(`/campaigns/view/${campaign.id}`)} variant="outline" size="small" iconCenter={<LucideIcons.Eye size={14} />} className="!px-2.5 !py-1" />
                                                    <StyledButton onClick={() => navigate(`/campaigns/edit/${campaign.id}`)} variant="secondary" size="small" iconCenter={<LucideIcons.Edit3 size={14} />} className="!px-2.5 !py-1" />
                                                    <StyledButton onClick={() => promptDelete(campaign)} variant="danger" size="small" iconCenter={<LucideIcons.Trash2 size={14} />} className="!px-2.5 !py-1" />
                                                </div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : ( renderEmptyState() )}
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmDelete}
                title="Confirm Campaign Deletion" message={`Are you sure you want to delete "${campaignToDelete?.campaignName || 'this campaign'}"? This action cannot be undone.`}
            />
            <style jsx global>{`
                @keyframes fadeInModal { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fadeInModal { animation: fadeInModal 0.15s ease-out forwards; }
                @keyframes scaleUpModal { 0% { transform: scale(0.95) translateY(10px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
                .animate-scaleUpModal { animation: scaleUpModal 0.2s cubic-bezier(0.22, 1, 0.36, 1) 0.05s forwards; }
            `}</style>
        </div>
    );
}