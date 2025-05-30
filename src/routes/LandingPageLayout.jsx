import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../ui-components/LandingPage/Common/Navbar";
import Footer from "../ui-components/LandingPage/Common/Footer";
import CtaSection from "../ui-components/LandingPage/Common/CtaSection";

const Layout = () => {
  return (
    <div className="text-black font-plus-jakarta">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <CtaSection />
      <Footer />
    </div>
  );
};

export default Layout;
