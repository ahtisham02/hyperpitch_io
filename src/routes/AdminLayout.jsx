import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../ui-components/AdminPage/Common/Navbar";
import Sidebar from "../ui-components/AdminPage/Common/Sidebar";
import Footer from "../ui-components/AdminPage/Common/Footer";

const MD_BREAKPOINT = 768;

const Layout = () => {
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.innerWidth >= MD_BREAKPOINT
  );

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth < MD_BREAKPOINT;
    if (isSidebarOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen]);

  const noFooterPaths = ['/campaigns/create'];
  const showFooter = !noFooterPaths.includes(location.pathname);

  return (
    <div className="flex h-screen bg-gray-100 font-plus-jakarta text-gray-800">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
          <Outlet />
        </main>

        {showFooter && <Footer />}
      </div>

      {isSidebarOpen && window.innerWidth < MD_BREAKPOINT && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Layout;