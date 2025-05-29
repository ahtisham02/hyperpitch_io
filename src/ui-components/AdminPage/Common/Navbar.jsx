import React from "react";
import { Menu, Bell, ChevronDown, Search } from "lucide-react";

const Navbar = ({ toggleSidebar }) => {
  const accentColor = "emerald"; // << NEW ACCENT
  const userInitials = "JD";
  const userName = "Jane Doe";

  return (
    <nav
      className={`sticky top-0 z-30 flex items-center justify-between h-16 shrink-0
                   bg-white/80 backdrop-blur-md 
                   border-b border-gray-200/70 px-4 sm:px-6 shadow-sm`}
    >
      <div className="flex items-center">
        {/* Sidebar Toggle Button (visible on all screens to allow toggling) */}
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-full text-gray-500 hover:text-${accentColor}-600 hover:bg-${accentColor}-500/10 active:bg-${accentColor}-500/20 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-${accentColor}-500`}
          aria-label="Toggle Sidebar"
        >
          <Menu size={22} strokeWidth={2} />
        </button>

        {/* Optional: Breadcrumbs or Page Title could go here */}
        {/* <h1 className="text-lg font-semibold text-gray-700 ml-3 hidden md:block">Dashboard</h1> */}
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Optional Search Button - could open a modal or a search bar */}
        <button
          className={`p-2 rounded-full text-gray-500 hover:text-${accentColor}-600 hover:bg-${accentColor}-500/10 active:bg-${accentColor}-500/20 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-${accentColor}-500`}
          aria-label="Search"
        >
          <Search size={20} strokeWidth={2} />
        </button>

        <button
          className={`p-2 rounded-full text-gray-500 hover:text-${accentColor}-600 hover:bg-${accentColor}-500/10 active:bg-${accentColor}-500/20 relative transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-${accentColor}-500`}
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={2} />
          <span className={`absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-${accentColor}-500 ring-2 ring-white`} />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-200/80 hidden sm:block"></div>

        <button
          className={`flex items-center space-x-2 py-1 pl-1 pr-2 rounded-full hover:bg-gray-100 active:bg-gray-200/80 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-${accentColor}-500 focus-visible:ring-offset-1`}
          aria-label="User menu"
        >
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-tr from-${accentColor}-500 to-${accentColor}-400 text-white flex items-center justify-center text-sm font-medium shadow-sm`}
          >
            {userInitials}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden md:block group-hover:text-gray-900">
            {userName}
          </span>
          <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600 hidden sm:block" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;