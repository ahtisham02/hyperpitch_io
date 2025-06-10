import { Box, ChevronLeft, CreditCard, LayoutGrid, LogOut, Megaphone, Menu as MenuIcon, User, Users, BarChart3, TestTubeDiagonal, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCampaigns } from '../../../utils/localStorageHelper'; // We need this to get campaigns for the modal

// --- The Modal Component (added directly to Sidebar.js for simplicity) ---
const CampaignSelectorModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [campaigns] = useState(() => getCampaigns().filter(c => c.analyticsData));
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredCampaigns = campaigns.filter(c => 
        c.campaignDetails.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (campaignId) => {
        navigate(`/analytics/${campaignId}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in-fast" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform animate-scale-up" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <BarChart3 className="text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">View Campaign Report</h2>
                            <p className="text-sm text-slate-500">Select a campaign to view its detailed analytics.</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <input
                        type="text"
                        placeholder="Search for a campaign..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="px-6 pb-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {filteredCampaigns.length > 0 ? (
                        <ul className="space-y-2">
                            {filteredCampaigns.map(campaign => (
                                <li key={campaign.id}>
                                    <button onClick={() => handleSelect(campaign.id)}
                                        className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center justify-between group">
                                        <div>
                                            <p className="font-semibold text-slate-700">{campaign.campaignDetails.campaignName}</p>
                                            <p className="text-xs text-slate-500">Last updated: {new Date(campaign.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                        <ChevronLeft className="w-5 h-5 text-slate-400 -rotate-180 group-hover:text-green-600 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-slate-500">No matching campaigns found.</p>
                        </div>
                    )}
                </div>
            </div>
             <style jsx global>{`@keyframes fade-in-fast{0%{opacity:0}100%{opacity:1}} .animate-fade-in-fast{animation:fade-in-fast .2s ease-out forwards} @keyframes scale-up{0%{transform:scale(.95);opacity:0}100%{transform:scale(1);opacity:1}} .animate-scale-up{animation:scale-up .25s cubic-bezier(.22,1,.36,1) forwards}`}</style>
        </div>
    );
};


// --- The Main Sidebar Component ---
export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal
    const location = useLocation();
    const navigate = useNavigate();
    
    // Updated menuItems
    const menuItems = [
        { titleKey: 'Dashboard', href: '/dashboard', Icon: LayoutGrid, action: () => navigate('/dashboard') },
        { titleKey: 'Analytics', href: '/analytics', Icon: BarChart3, action: () => setIsModalOpen(true) },
        { titleKey: 'Compare', href: '/compare', Icon: TestTubeDiagonal, action: () => navigate('/compare') },
        { titleKey: 'Campaigns', href: '/campaigns', Icon: Megaphone, action: () => navigate('/campaigns') },
        { titleKey: 'Contacts', href: '/contacts', Icon: Users, action: () => navigate('/contacts') },
        { titleKey: 'Pricing', href: '/pricing', Icon: CreditCard, action: () => navigate('/pricing') },
    ];

    const userProfileFooterItems = [
        { titleKey: 'Profile', href: '/settings/profile', LucideIcon: User },
    ];
    
    const siteName = "Hyperpitch.io";
    const SiteIcon = Box; 

    const activeBgColor = 'bg-[#2e8b57]'; 
    const activeTextColor = 'text-white';
    const hoverBgColor = 'hover:bg-[#2e8b57]'; 
    const hoverTextColor = 'hover:text-white';
    const defaultIconColor = 'text-gray-600';
    const sidebarBgColor = 'bg-slate-50'; 
    const defaultTextColor = 'text-gray-700';

    const toggleDesktopCollapse = () => setCollapsed(!collapsed);
    const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);

    const handleLinkClick = (itemAction) => {
        itemAction(); // Execute the action (navigate or open modal)
        if (mobileSidebarOpen) {
            setMobileSidebarOpen(false);
        }
    };

    const handleLogout = () => {
        if (mobileSidebarOpen) setMobileSidebarOpen(false);
        navigate('/login');
    };

    return (
        <>
            <CampaignSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <button
                onClick={toggleMobileSidebar}
                className="fixed top-3 left-3 z-50 rounded-lg bg-white p-2 shadow-md md:hidden"
                aria-label={mobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
                {mobileSidebarOpen ? <X size={24} className="text-gray-700" /> : <MenuIcon size={24} className="text-gray-700" />}
            </button>

            <div
                className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col ${sidebarBgColor} p-3 py-4 shadow-lg transition-all duration-300 ease-in-out md:relative md:shadow-none border-r border-gray-200
                           ${collapsed && !mobileSidebarOpen ? 'md:w-[75px]' : 'w-64'}
                           ${mobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
                           md:translate-x-0`}
            >
                <div className={`flex -mt-2.5 items-center pr-1 h-14 mb-4 ${collapsed && !mobileSidebarOpen ? 'justify-center' : 'justify-between'}`}>
                    <Link to="/" onClick={() => mobileSidebarOpen && setMobileSidebarOpen(false)} className={`flex items-center group ${collapsed && !mobileSidebarOpen ? 'justify-center w-full' : ''}`}>
                        <SiteIcon size={collapsed && !mobileSidebarOpen ? 0 : 24} className={`${collapsed && !mobileSidebarOpen ? '' : 'mr-2'} ${defaultIconColor} group-hover:text-green-700 transition-colors`} />
                        {(!collapsed || mobileSidebarOpen) && (<span className={`text-xl font-semibold ${defaultTextColor} group-hover:text-green-700 transition-colors`}>{siteName}</span>)}
                    </Link>
                    <button onClick={toggleDesktopCollapse} className={`hidden p-2 rounded-md hover:bg-gray-100 md:block ${collapsed && !mobileSidebarOpen ? 'absolute top-4 right-4' : ''}`} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
                        <ChevronLeft size={24} className={`text-gray-600 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <nav className="mt-4 flex-1 overflow-y-auto">
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.href);
                            const IconComponent = item.Icon;
                            return (
                                <li key={item.titleKey}>
                                    <button
                                        onClick={() => handleLinkClick(item.action)}
                                        title={collapsed && !mobileSidebarOpen ? item.titleKey : undefined}
                                        className={`w-full flex items-center space-x-3 p-[11px] group rounded-lg transition-colors duration-150
                                            ${isActive ? `${activeBgColor} ${activeTextColor}` : `${defaultTextColor} ${hoverBgColor} ${hoverTextColor}`}
                                            ${collapsed && !mobileSidebarOpen ? "justify-center md:py-3 md:px-2" : ""}` 
                                        }
                                    >
                                        {IconComponent && <IconComponent size={22} className={`h-[22px] w-[22px] transition-colors duration-150 ${isActive ? activeTextColor : `${defaultIconColor} group-hover:text-white`}`} strokeWidth={isActive ? 2.25 : 2} />}
                                        {(!collapsed || mobileSidebarOpen) && <span className="text-base">{item.titleKey}</span>}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {(!collapsed || mobileSidebarOpen) && (
                    <div className="mt-auto pt-4 border-t border-gray-200">
                        <ul className="space-y-1">
                            {userProfileFooterItems.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <li key={item.titleKey}>
                                        <Link to={item.href} onClick={() => mobileSidebarOpen && setMobileSidebarOpen(false)} className={`flex items-center space-x-3 p-[9px] group rounded-lg transition-colors duration-150 ${isActive ? `${activeBgColor} ${activeTextColor}` : `${defaultTextColor} ${hoverBgColor} ${hoverTextColor}`}`}>
                                            {item.LucideIcon && <item.LucideIcon size={22} className={`h-[22px] w-[22px] transition-colors duration-150 ${isActive ? activeTextColor : `${defaultIconColor} group-hover:text-white`}`} />}
                                            <span className="text-base">{item.titleKey}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                            <li>
                                <button onClick={handleLogout} className={`flex w-full items-center space-x-3 p-[9px] group rounded-lg transition-colors duration-150 ${defaultTextColor} ${hoverBgColor} ${hoverTextColor}`}>
                                    <LogOut size={22} className={`h-[22px] w-[22px] transition-colors duration-150 ${defaultIconColor} group-hover:text-white`} />
                                    <span className="text-base">Sign Out</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
                 {collapsed && !mobileSidebarOpen && (
                    <div className="mt-auto pt-4 border-t border-gray-200">
                        <ul className="space-y-1">
                            {userProfileFooterItems.map((item) => (
                                <li key={item.titleKey + "-collapsed"}>
                                    <Link to={item.href} onClick={() => mobileSidebarOpen && setMobileSidebarOpen(false)} title={item.titleKey} className={`flex justify-center items-center py-3 px-2 group rounded-lg transition-colors duration-150 ${location.pathname === item.href ? `${activeBgColor} ${activeTextColor}` : `${defaultTextColor} ${hoverBgColor} ${hoverTextColor}`}`}>
                                        {item.LucideIcon && <item.LucideIcon size={24} className={`h-[22px] w-[22px] transition-colors duration-150 ${location.pathname === item.href ? activeTextColor : `${defaultIconColor} group-hover:text-white`}`} />}
                                    </Link>
                                </li>
                            ))}
                             <li>
                                <button onClick={handleLogout} title="Sign Out" className={`flex w-full justify-center items-center py-3 px-2 group rounded-lg transition-colors duration-150 ${defaultTextColor} ${hoverBgColor} ${hoverTextColor}`}>
                                    <LogOut size={24} className={`h-[22px] w-[22px] transition-colors duration-150 ${defaultIconColor} group-hover:text-white`} />
                                </button>
                            </li>
                        </ul>
                    </div>
                 )}
            </div>
        </>
    );
}