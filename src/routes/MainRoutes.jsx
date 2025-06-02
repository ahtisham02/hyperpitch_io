// src/routes/MainRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPageLayout from "./LandingPageLayout";
import HomePage from "../pages/LandingPages/Home/Home";

import AdminLayout from "./AdminLayout";
import Dashboard from "../pages/AdminPages/Dashboard/Dashboard";

import AuthLayout from "../routes/AuthLayout";
import LoginPage from "../pages/AuthPages/LoginPage";
import SignupPage from "../pages/AuthPages/SignupPage";
import ForgotPasswordPage from "../pages/AuthPages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/AuthPages/ResetPasswordPage";

import ScrollToTop from "../utils/ScrollToTop";
import VerifyPage from "../pages/AuthPages/VerifyPage";
import VerifyEmailPage from "../pages/AuthPages/VerifyEmailPage";
// import OtpVerificationPage from "../pages/AuthPages/OtpVerificationPage";

const MainRoutes = () => {
  const isAuthenticated = false; // Replace with actual authentication logic

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<LandingPageLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {/* <Route path="/verify-otp" element={<OtpVerificationPage />} /> */}
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        <Route
          element={
            !isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default MainRoutes;