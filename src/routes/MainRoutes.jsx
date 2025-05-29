import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/LandingPages/Home/Home";

import Dashboard from "../pages/AdminPages/Dashboard/Dashboard";

import LandingPageLayout from "./LandingPageLayout";
import AdminLayout from "./AdminLayout";
import ScrollToTop from "../utils/ScrollToTop";

const MainRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<LandingPageLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  );
};

export default MainRoutes;
