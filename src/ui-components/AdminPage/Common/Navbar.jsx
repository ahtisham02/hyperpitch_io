import { Bell, ChevronDown, Search, Settings, User2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockAuth = {
    user: {
        name: 'Jane Doe',
        // avatar: 'https://via.placeholder.com/150/007bff/FFFFFF?Text=JD', // Avatar URL no longer used for display
    },
};

export default function AppSidebarHeader() {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const userDropdownRef = useRef(null);
    const navigate = useNavigate();
    const accentColor = "emerald";

    const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

    const handleClickOutside = (event) => {
        if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
            setIsUserDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigateToProfile = () => {
        setIsUserDropdownOpen(false);
        navigate('/settings/profile');
    };

    const handleNavigateToSettings = () => {
        setIsUserDropdownOpen(false);
        navigate('/settings/general');
    };

    const user = mockAuth.user;

    return (
        <header
            className={`sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between
                       bg-white backdrop-blur-md
                       border-b border-gray-200/70 px-4 shadow-sm
                       sm:px-6 md:pl-[calc(theme(spacing.4)+theme(spacing.20))] lg:px-6`}
        >
            <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-gray-800">
                    Hello, {user?.name || 'Guest'}
                </h2>
                <p className="text-xs text-gray-500 sm:text-sm">Welcome back!</p>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                    className={`p-2 rounded-full text-gray-500 hover:text-${accentColor}-600 hover:bg-${accentColor}-500/10 active:bg-${accentColor}-500/20 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-${accentColor}-500 hidden lg:block`}
                    aria-label="Search"
                >
                    <Search size={20} strokeWidth={2} />
                </button>

                <button
                    className={`p-2 rounded-full text-gray-500 hover:text-${accentColor}-600 hover:bg-${accentColor}-500/10 active:bg-${accentColor}-500/20 relative transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-${accentColor}-500 hidden sm:block`}
                    aria-label="Notifications"
                >
                    <Bell size={20} strokeWidth={2} />
                    <span className={`absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white`} />
                </button>

                <div className="h-6 w-px bg-gray-200/80 hidden sm:block"></div>

                <div className="relative" ref={userDropdownRef}>
                    <button
                        onClick={toggleUserDropdown}
                        className={`flex items-center space-x-2 py-1 pl-1 pr-2 rounded-full hover:bg-gray-100 active:bg-gray-200/80 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-${accentColor}-500 focus-visible:ring-offset-1`}
                        aria-label="User menu"
                    >
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr from-${accentColor}-500 to-${accentColor}-400 text-black flex items-center justify-center shadow-sm`}>
                            <User2 size={18} strokeWidth={2.25} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden md:block group-hover:text-gray-900">
                            {user?.name || 'User'}
                        </span>
                        <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600 hidden sm:block" />
                    </button>
                    {isUserDropdownOpen && (
                        <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <button
                                onClick={handleNavigateToProfile}
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <User2 className="mr-3 h-4 w-4 text-gray-500" />
                                Profile
                            </button>
                            <button
                                onClick={handleNavigateToSettings}
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <Settings className="mr-3 h-4 w-4 text-gray-500" />
                                Settings
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}