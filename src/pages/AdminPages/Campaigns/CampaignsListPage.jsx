import React, { useState, useEffect, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCampaigns, deleteCampaign } from '../../../utils/localStorageHelper';

const StyledButton = ({ onClick, children, type = 'button', variant = 'primary', disabled = false, className = '', iconLeft, iconRight, iconCenter,size = 'medium' }) => {
    const baseStyle = "rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out inline-flex items-center justify-center group transform hover:-translate-y-px active:translate-y-0";
    const sizeStyles = {
        small: "px-3 py-1.5 text-xs",
        medium: "px-5 py-2 text-sm",
        large: "px-6 py-2.5 text-base",
    };
    const greenButton = "bg-[#2e8b57] hover:bg-green-700 text-white shadow-md hover:shadow-lg focus:ring-green-500 focus:ring-offset-white active:bg-green-800";
    const variantStyles = {
        primary: greenButton,
        secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400 border border-slate-300 hover:border-slate-400 shadow-sm hover:shadow-md active:bg-slate-300 focus:ring-offset-white",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md focus:ring-red-500 focus:ring-offset-white active:bg-red-700",
        outline: "border border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-300",
    };
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? 'opacity-60 cursor-not-allowed saturate-50' : ''} ${className}`}
        >
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
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
                        <LucideIcons.X size={20} />
                    </button>
                </div>
                <p className="text-sm text-slate-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <StyledButton onClick={onClose} variant="secondary" size="medium">{cancelText}</StyledButton>
                    <StyledButton onClick={onConfirm} variant="danger" size="medium">{confirmText}</StyledButton>
                </div>
            </div>
        </div>
    );
};


export default function CampaignListPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState(null);
    const navigate = useNavigate();

    const loadCampaigns = useCallback(() => {
        const allCampaigns = getCampaigns();
        setCampaigns(allCampaigns.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)));
    }, []);

    useEffect(() => {
        loadCampaigns();
    }, [loadCampaigns]);

    const filteredCampaigns = campaigns.filter(campaign =>
        campaign.campaignDetails?.campaignName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const promptDelete = (campaign) => {
        setCampaignToDelete(campaign);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (campaignToDelete) {
            deleteCampaign(campaignToDelete.id);
            toast.success(`Campaign "${campaignToDelete.campaignDetails.campaignName}" deleted successfully!`);
            loadCampaigns(); 
            setIsConfirmModalOpen(false);
            setCampaignToDelete(null);
        }
    };

    const getStatusChip = (status) => {
        let bgColor = 'bg-slate-100';
        let textColor = 'text-slate-600';
        let dotColor = 'bg-slate-400';

        switch (status?.toLowerCase()) {
            case 'draft':
                bgColor = 'bg-amber-100'; textColor = 'text-amber-700'; dotColor = 'bg-amber-500'; break;
            case 'active': case 'live': case 'running':
                bgColor = 'bg-green-100'; textColor = 'text-green-700'; dotColor = 'bg-green-500'; break;
            case 'completed': case 'finished':
                bgColor = 'bg-blue-100'; textColor = 'text-blue-700'; dotColor = 'bg-blue-500'; break;
            case 'paused':
                bgColor = 'bg-purple-100'; textColor = 'text-purple-700'; dotColor = 'bg-purple-500'; break;
            case 'archived':
                bgColor = 'bg-gray-100'; textColor = 'text-gray-700'; dotColor = 'bg-gray-500'; break;
            default:
                status = 'Unknown';
        }
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                <span className={`w-2 h-2 mr-1.5 rounded-full ${dotColor}`}></span>
                {status}
            </span>
        );
    };


    return (
        <div className="p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-screen-xl mx-auto">
                <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center">
                        <LucideIcons.Megaphone size={36} className="text-green-600 mr-4" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Campaign Management</h1>
                            <p className="text-sm text-slate-500">Oversee all your marketing initiatives.</p>
                        </div>
                    </div>
                    <Link to="/campaigns/create">
                        <StyledButton iconLeft={<LucideIcons.PlusCircle size={18} />} size="medium">
                            Create New Campaign
                        </StyledButton>
                    </Link>
                </header>

                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LucideIcons.Search size={18} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search campaigns by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white"
                        />
                    </div>
                </div>

                {filteredCampaigns.length > 0 ? (
                    <div className="bg-white shadow-xl rounded-xl border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Audience Size</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Updated</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {filteredCampaigns.map((campaign) => (
                                        <tr key={campaign.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-800">{campaign.campaignDetails?.campaignName || 'Unnamed Campaign'}</div>
                                                <div className="text-xs text-slate-500">ID: {campaign.id.slice(-8)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusChip(campaign.status || 'Draft')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {campaign.campaignDetails?.startTime ? new Date(campaign.campaignDetails.startTime).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center">
                                                {campaign.dataSource?.type === 'fromContacts' ? campaign.dataSource.selectedContactIds?.length : 
                                                 (campaign.dataSource?.file ? 'File Based' : 'N/A')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {new Date(campaign.updatedAt || campaign.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex items-center justify-center space-x-1.5">
                                                    <StyledButton
                                                        onClick={() => navigate(`/analytics/${campaign.id}`)}
                                                        variant="outline"
                                                        size="small"
                                                        iconLeft={<LucideIcons.BarChart3 size={14} />}
                                                        className="!px-2.5 !py-1 border-green-300 text-green-700 hover:bg-green-50"
                                                    >
                                                        Analytics
                                                    </StyledButton>
                                                    <StyledButton
                                                        onClick={() => navigate(`/campaigns/view/${campaign.id}`)}
                                                        variant="outline"
                                                        size="small"
                                                        iconCenter={<LucideIcons.Eye size={14} />}
                                                        className="!px-2.5 !py-1"
                                                    >
                                                        {/* View */}
                                                    </StyledButton>
                                                    <StyledButton
                                                        onClick={() => navigate(`/campaigns/edit/${campaign.id}`)}
                                                        variant="secondary"
                                                        size="small"
                                                        iconCenter={<LucideIcons.Edit3 size={14} />}
                                                        className="!px-2.5 !py-1"
                                                    >
                                                        {/* Edit */}
                                                    </StyledButton>
                                                    <StyledButton
                                                        onClick={() => promptDelete(campaign)}
                                                        variant="danger"
                                                        size="small"
                                                        iconCenter={<LucideIcons.Trash2 size={14} />}
                                                        className="!px-2.5 !py-1"
                                                    >
                                                        {/* Delete */}
                                                    </StyledButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-slate-200">
                        <LucideIcons.ArchiveX size={48} className="mx-auto text-slate-400 mb-4" />
                        <p className="text-slate-600 font-medium text-lg">
                            {searchTerm ? 'No campaigns match your search.' : 'No Campaigns Yet'}
                        </p>
                        <p className="text-sm text-slate-500 mb-6">
                            {searchTerm ? 'Try a different search term or clear the search.' : 'Start by creating your first campaign.'}
                        </p>
                        {!searchTerm && (
                             <Link to="/campaigns/create">
                                <StyledButton iconLeft={<LucideIcons.PlusCircle />}>Create First Campaign</StyledButton>
                            </Link>
                        )}
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Campaign Deletion"
                message={`Are you sure you want to delete the campaign "${campaignToDelete?.campaignDetails?.campaignName || 'this campaign'}"? This action cannot be undone.`}
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