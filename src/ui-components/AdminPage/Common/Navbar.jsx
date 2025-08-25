import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Search, Settings, User2, Coins, Info } from 'lucide-react';
import CountUp from 'react-countup';
import { useCredits } from '../../../utils/creditHelper';

export default function AppSidebarHeader() {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isCreditInfoOpen, setIsCreditInfoOpen] = useState(false);

    const userDropdownRef = useRef(null);
    const creditInfoRef = useRef(null);

    const navigate = useNavigate();
    
    const userInfo = useSelector((state) => state.auth.userInfo);
    const user = userInfo;

    const { credits, CAMPAIGN_COST, TOTAL_CREDITS } = useCredits();
    const prevCreditsRef = useRef(credits);

    useEffect(() => {
        prevCreditsRef.current = credits;
    });
    
    const startCountUp = prevCreditsRef.current;

    // --- Event Handlers ---
    const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);
    const toggleCreditInfo = () => setIsCreditInfoOpen(!isCreditInfoOpen);

    const handleNavigateToProfile = () => {
        setIsUserDropdownOpen(false);
        navigate('/settings/profile');
    };

    const handleNavigateToSettings = () => {
        setIsUserDropdownOpen(false);
        navigate('/settings/general');
    };

    const handleNavigateToPricing = () => {
        setIsCreditInfoOpen(false);
        navigate('/pricing');
    };

    // --- Effect for handling clicks outside of dropdowns ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
            if (creditInfoRef.current && !creditInfoRef.current.contains(event.target)) {
                setIsCreditInfoOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header
            className={`sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between
                       bg-white backdrop-blur-md
                       border-b border-gray-200/70 px-4 shadow-sm
                       sm:px-6 md:pl-[calc(theme(spacing.4)+theme(spacing.20))] lg:px-6`}
        >
            {/* Greeting Message */}
            <div className="flex flex-col ml-14 md:ml-0">
                <h2 className="text-lg font-semibold text-gray-800">
                    Hello, {user?.name || 'Guest'}
                </h2>
                <p className="text-xs text-gray-500 sm:text-sm">Welcome back!</p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                    className="p-2 rounded-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-500/10 active:bg-emerald-500/20 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hidden lg:block"
                    aria-label="Search"
                >
                    <Search size={20} strokeWidth={2} />
                </button>

                <button
                    className="p-2 rounded-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-500/10 active:bg-emerald-500/20 relative transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hidden sm:block"
                    aria-label="Notifications"
                >
                    <Bell size={20} strokeWidth={2} />
                    <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>
                
                {/* Credits Display */}
                <div className="min-[525px]:flex hidden items-center space-x-2 p-2 rounded-full bg-emerald-50 text-emerald-700">
                    <Coins size={20} strokeWidth={2.5} className="text-emerald-500 shrink-0" />
                    <div className="text-sm font-semibold flex items-baseline">
                        <CountUp start={startCountUp} end={credits} duration={1.5} separator="," />
                        <span className="text-xs text-emerald-600/80 ml-1"> / {TOTAL_CREDITS} Credits</span>
                    </div>
                </div>

                {/* Credit Info Dropdown */}
                <div className="relative" ref={creditInfoRef}>
                    <button
                        onClick={toggleCreditInfo}
                        className="p-2 rounded-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-500/10 active:bg-emerald-500/20 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        aria-label="Credit usage details"
                    >
                        <Info size={18} strokeWidth={2.25} />
                    </button>
                    {isCreditInfoOpen && (
                        <div className="absolute right-0 z-20 mt-2 w-64 origin-top-right rounded-lg bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                           <h4 className="text-sm font-semibold text-gray-800 mb-2">Credit Usage</h4>
                           <p className="text-xs text-gray-500 mb-4">
                               Credits are used to launch new marketing campaigns.
                           </p>
                           <div className="mb-3">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Your Balance</span>
                                    <span className="font-bold">{credits} / {TOTAL_CREDITS}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(credits / TOTAL_CREDITS) * 100}%` }}></div>
                                </div>
                           </div>
                           <div className="text-xs text-gray-500 space-y-1.5 mb-4">
                               <div className="flex justify-between items-center">
                                   <span>Cost per campaign:</span>
                                   <span className="font-semibold text-gray-700">{CAMPAIGN_COST} credits</span>
                               </div>
                           </div>
                           <button 
                                onClick={handleNavigateToPricing}
                                className="w-full px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
                            >
                               Buy More Credits
                           </button>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-gray-200/80 hidden sm:block"></div>

                {/* User Menu Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                    <button
                        onClick={toggleUserDropdown}
                        className="flex items-center space-x-2 py-1 pl-1 pr-2 rounded-full hover:bg-gray-100 active:bg-gray-200/80 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                        aria-label="User menu"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-400 text-white flex items-center justify-center shadow-sm">
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