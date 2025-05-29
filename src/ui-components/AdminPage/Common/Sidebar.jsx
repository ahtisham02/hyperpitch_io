import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Feather,
  LayoutGrid,
  PieChart,
  User,
  // Settings2,
  LogOut,
  X,
} from "lucide-react";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const accentColor = "emerald";
  const siteName = "Hyperpitch.io";

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutGrid },
    { name: "Analytics", path: "/reports", icon: PieChart },
  ];

  const userProfileItems = [
    { name: "My Profile", path: "/profile", icon: User },
    // { name: "Settings", path: "/settings", icon: Settings2 },
  ];

  // Active/Default classes mostly for colors, not layout that changes with collapse
  const activeLinkClass = `bg-${accentColor}-600 text-white shadow-md shadow-${accentColor}-600/40`;
  const defaultLinkClass = `text-gray-400 hover:text-white hover:bg-gray-700/50`;

  const handleLinkClick = () => {
    // On mobile, if sidebar is open and a link is clicked, close the sidebar.
    // On desktop, clicking a link shouldn't affect collapsed/expanded state.
    if (window.innerWidth < 768 && isSidebarOpen) {
      toggleSidebar();
    }
  };

  const NavIcon = ({ icon: Icon, isActive }) => (
    <Icon
      size={isSidebarOpen ? 18 : 20} // Icon can be slightly larger when collapsed
      className={`transition-all duration-300 ${
        isActive ? "text-white" : `text-gray-500 group-hover:text-${accentColor}-300`
      }`}
      strokeWidth={isActive ? 2.25 : 2}
    />
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-900 text-gray-300 border-r border-gray-700/60
                 transition-all duration-300 ease-in-out
                 ${isSidebarOpen ? "w-64" : "md:w-20 w-64"} // Desktop collapsed width, mobile keeps w-64 when open
                 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} // Mobile toggle, desktop always 'visible'
                 md:relative md:shadow-none`} // Desktop position
    >
      {/* Sidebar Header */}
      <div
        className={`flex items-center h-16 px-4 border-b border-gray-700/60 shrink-0
                    ${isSidebarOpen ? "justify-between" : "md:justify-center"}`}
      >
        <Link
          to="/"
          onClick={handleLinkClick}
          className={`flex items-center group ${isSidebarOpen ? "space-x-2.5" : "md:space-x-0"}`}
        >
          <div className={`p-1.5 rounded-md bg-gradient-to-br from-${accentColor}-500 to-${accentColor}-600 shadow-sm shadow-${accentColor}-500/30`}>
            <Feather size={20} className="text-white" strokeWidth={2} />
          </div>
          <span
            className={`text-lg font-semibold text-white group-hover:text-${accentColor}-300 transition-opacity duration-200
                        ${isSidebarOpen ? "opacity-100 inline-block" : "md:opacity-0 md:hidden"}`}
          >
            {siteName}
          </span>
        </Link>
        {/* Mobile close button: only shows if sidebar is open AND on mobile screen */}
        {isSidebarOpen && (
            <button
                onClick={toggleSidebar}
                className="md:hidden p-1 rounded-md text-gray-400 hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close sidebar"
            >
                <X size={22} />
            </button>
        )}
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={handleLinkClick}
            title={!isSidebarOpen ? item.name : undefined} // Show tooltip when collapsed
            className={({ isActive }) =>
              `flex items-center py-2.5 rounded-lg group transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-${accentColor}-500
              ${isSidebarOpen ? "px-3.5 mx-2 space-x-3" : "md:px-2 md:mx-auto md:w-12 md:h-12 md:justify-center md:items-center md:space-x-0"}
              ${isActive ? activeLinkClass : defaultLinkClass}`
            }
          >
            {({ isActive }) => (
              <>
                <NavIcon icon={item.icon} isActive={isActive} />
                <span
                  className={`transition-opacity duration-200 ${
                    isSidebarOpen ? "opacity-100 inline-block" : "md:opacity-0 md:hidden"
                  } ${isActive && isSidebarOpen ? "font-medium" : ""}`} // font-medium only if open and active
                >
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer / User Area */}
      <div className="px-2 py-3 mt-auto border-t border-gray-700/60 space-y-1">
        {userProfileItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={handleLinkClick}
            title={!isSidebarOpen ? item.name : undefined}
            className={({ isActive }) =>
              `flex items-center py-2.5 rounded-lg group transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-${accentColor}-500
              ${isSidebarOpen ? "px-3.5 mx-2 space-x-3" : "md:px-2 md:mx-auto md:w-12 md:h-12 md:justify-center md:items-center md:space-x-0"}
              ${isActive ? activeLinkClass : defaultLinkClass}`
            }
          >
            {({ isActive }) => (
              <>
                <NavIcon icon={item.icon} isActive={isActive} />
                <span
                  className={`transition-opacity duration-200 ${
                    isSidebarOpen ? "opacity-100 inline-block" : "md:opacity-0 md:hidden"
                  } ${isActive && isSidebarOpen ? "font-medium" : ""}`}
                >
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
        <button
          onClick={() => { console.log("Signing out..."); handleLinkClick(); }}
          title={!isSidebarOpen ? "Sign Out" : undefined}
          className={`flex items-center py-2.5 rounded-lg group transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-red-500
            ${isSidebarOpen ? "px-3.5 mx-2 space-x-3 w-[calc(100%-1rem)]" : "md:px-2 md:mx-auto md:w-12 md:h-12 md:justify-center md:items-center md:space-x-0"}
            ${defaultLinkClass} !text-gray-400 hover:!text-red-400 hover:!bg-red-500/10 group`}
        >
          <LogOut
            size={isSidebarOpen ? 18 : 20}
            className="text-gray-500 group-hover:text-red-400 transition-colors"
            strokeWidth={2}
          />
          <span
            className={`transition-opacity duration-200 ${
              isSidebarOpen ? "opacity-100 inline-block" : "md:opacity-0 md:hidden"
            }`}
          >
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;