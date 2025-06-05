import {
    Box,
    // CalendarDays, // No longer used in provided snippet
    ChevronLeft,
    CreditCard,
    LayoutGrid,
    LogOut,
    // MapPin, // No longer used if "Coming Soon" is replaced
    Megaphone, // Icon for Campaigns
    Menu as MenuIcon,
    User,
    Users, 
    X
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const menuItems = [
    { titleKey: 'Dashboard', href: '/dashboard', Icon: LayoutGrid },
    { titleKey: 'Campaigns', href: '/campaigns', Icon: Megaphone }, // <-- ADDED CAMPAIGNS LINK
    { titleKey: 'Contacts', href: '/contacts', Icon: Users },
    { titleKey: 'Pricing', href: '/pricing', Icon: CreditCard },
];

const userProfileFooterItems = [
    { titleKey: 'Profile', href: '/settings/profile', LucideIcon: User },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

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

    const handleLinkClick = () => {
        if (mobileSidebarOpen) {
            setMobileSidebarOpen(false);
        }
    };

    const handleLogout = () => {
        handleLinkClick();
        navigate('/login');
    };

    return (
        <>
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
                    <Link
                        to="/"
                        onClick={handleLinkClick}
                        className={`flex items-center group ${collapsed && !mobileSidebarOpen ? 'justify-center w-full' : ''}`}
                    >
                        <SiteIcon
                            size={collapsed && !mobileSidebarOpen ? 0 : 24} 
                            className={`${collapsed && !mobileSidebarOpen ? '' : 'mr-2'} ${defaultIconColor} group-hover:text-green-700 transition-colors`}
                        />
                        {(!collapsed || mobileSidebarOpen) && (
                            <span className={`text-xl font-semibold ${defaultTextColor} group-hover:text-green-700 transition-colors`}>
                                {siteName}
                            </span>
                        )}
                    </Link>

                    <button
                        onClick={toggleDesktopCollapse}
                        className={`hidden p-2 rounded-md hover:bg-gray-100 md:block ${collapsed && !mobileSidebarOpen ? 'absolute top-4 right-4' : ''}`} 
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <ChevronLeft size={24} className={`text-gray-600 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <nav className="mt-4 flex-1 overflow-y-auto">
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.href) && (item.href === '/' ? location.pathname === '/' : true); 
                            const IconComponent = item.Icon;
                            return (
                                <li key={item.titleKey}>
                                    <Link
                                        to={item.href}
                                        onClick={handleLinkClick}
                                        title={collapsed && !mobileSidebarOpen ? item.titleKey : undefined}
                                        className={`flex items-center space-x-3 p-[11px] group rounded-lg transition-colors duration-150
                                            ${isActive ? `${activeBgColor} ${activeTextColor}` : `${defaultTextColor} ${hoverBgColor} ${hoverTextColor}`}
                                            ${collapsed && !mobileSidebarOpen ? "justify-center md:py-3 md:px-2" : ""}` 
                                        }
                                    >
                                        {IconComponent && (
                                            <IconComponent
                                                size={22} 
                                                className={`h-[22px] w-[22px] transition-colors duration-150 ${isActive ? activeTextColor : `${defaultIconColor} group-hover:text-white`}`}
                                                strokeWidth={isActive ? 2.25 : 2} 
                                            />
                                        )}
                                        {(!collapsed || mobileSidebarOpen) && (
                                            <span className="text-base"> 
                                                {item.titleKey}
                                            </span>
                                        )}
                                    </Link>
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
                                        <Link
                                            to={item.href}
                                            onClick={handleLinkClick}
                                            className={`flex items-center space-x-3 p-[9px] group rounded-lg transition-colors duration-150
                                                ${isActive ? `${activeBgColor} ${activeTextColor}` : `${defaultTextColor} ${hoverBgColor} ${hoverTextColor}`}`
                                            }
                                        >
                                            {item.LucideIcon && <item.LucideIcon size={22} className={`h-[22px] w-[22px] transition-colors duration-150 ${isActive ? activeTextColor : `${defaultIconColor} group-hover:text-white`}`} />}
                                            <span className="text-base">
                                                {item.titleKey}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className={`flex w-full items-center space-x-3 p-[9px] group rounded-lg transition-colors duration-150 ${defaultTextColor} ${hoverBgColor} ${hoverTextColor}`}
                                >
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
                                    <Link
                                        to={item.href}
                                        onClick={handleLinkClick} 
                                        title={item.titleKey}
                                        className={`flex justify-center items-center py-3 px-2 group rounded-lg transition-colors duration-150
                                            ${location.pathname === item.href ? `${activeBgColor} ${activeTextColor}` : `${defaultTextColor} ${hoverBgColor} ${hoverTextColor}`}`
                                        }
                                    >
                                        {item.LucideIcon && <item.LucideIcon size={24} className={`h-[22px] w-[22px] transition-colors duration-150 ${location.pathname === item.href ? activeTextColor : `${defaultIconColor} group-hover:text-white`}`} />}
                                    </Link>
                                </li>
                            ))}
                             <li>
                                <button
                                    onClick={handleLogout}
                                    title="Sign Out"
                                    className={`flex w-full justify-center items-center py-3 px-2 group rounded-lg transition-colors duration-150 ${defaultTextColor} ${hoverBgColor} ${hoverTextColor}`}
                                >
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