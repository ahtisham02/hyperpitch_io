import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../ui-components/AdminPage/Common/Navbar"; // Adjust path as needed
import Sidebar from "../ui-components/AdminPage/Common/Sidebar"; // Adjust path as needed
import Footer from "../ui-components/AdminPage/Common/Footer";   // Adjust path as needed

const Layout = () => {
  // For desktop, sidebar is open by default. For mobile, it's closed.
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Adjust sidebar state on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // If screen becomes small, and sidebar was open (desktop default), close it.
        if(isSidebarOpen && !document.body.classList.contains('sidebar-explicitly-closed-on-mobile')) {
            // setIsSidebarOpen(false); // This can be aggressive if user explicitly opened it on mobile
        }
      } else {
        // If screen becomes large, set to default open state for desktop
        // This could also be left to user interaction if preferred
        // setIsSidebarOpen(true); 
      }
    };
    window.addEventListener('resize', handleResize);
    // Initial check in case window is already small
    if (window.innerWidth < 768) {
        setIsSidebarOpen(false); // Start closed on mobile
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array to run only on mount and unmount

  // Add a class to body when sidebar is open on mobile to prevent background scroll
  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto'; // Cleanup on unmount
    };
  }, [isSidebarOpen]);


  return (
    <div className="flex h-screen bg-gray-100 font-plus-jakarta text-gray-800 overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0"> {/* min-w-0 prevents content from pushing flex item */}
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
          <Outlet />
        </main>

        <Footer />
      </div>

      {isSidebarOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default Layout;