import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import HomePage from "../pages/LandingPages/Home";
import AdminLayout from "./AdminLayout";
import AuthLayout from "../routes/AuthLayout";
import Dashboard from "../pages/AdminPages/Dashboard/Dashboard";

import RouteMiddleware from "./RouteMIddleware";

import ScrollToTop from "../utils/ScrollToTop";
import LoginPage from "../pages/AuthPages/LoginPage";
import SignupPage from "../pages/AuthPages/SignupPage";
import ForgotPasswordPage from "../pages/AuthPages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/AuthPages/ResetPasswordPage";
import OtpPage from "../pages/AuthPages/OtpVerificationPage";
import VerifyPage from "../pages/AuthPages/VerifyPage";
import VerifyEmailPage from "../pages/AuthPages/VerifyEmailPage";
import TermsOfServicePage from "../pages/Terms&Policy/TermsOfServicePage";
import PrivacyPolicyPage from "../pages/Terms&Policy/PrivacyPolicyPage";
import CampaignAnalyticsPage from "../pages/AdminPages/Analytics/AnalyticsPage";
import Profile from "../pages/AdminPages/Profile/UserProfilePage";
import Settings from "../pages/AdminPages/Settings/GeneralSettingsPage";
import Pricing from "../pages/AdminPages/PricingPage/PricingPage";
import ContactsManager from "../pages/AdminPages/Contacts/ContactsManager";
import CampaignCreatorPage from '../ui-components/AdminPage/Campaign/CampaignCreatorPage';
import CampaignsListPage from '../pages/AdminPages/Campaigns/CampaignsListPage';
import CampaignViewPage from "../pages/AdminPages/Campaigns/CampaignViewPage";
import CampaignComparePage from "../pages/AdminPages/Analytics/CampaignComparePage";
import DomainManagerPage from "../pages/AdminPages/Domains/DomainManagerPage";


const MainRoutes = () => {
  const { userToken } = useSelector((state) => state.auth);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/terms-and-conditions" element={<TermsOfServicePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

        <Route
          element={
            <RouteMiddleware isGuestOnly={true}>
              <AuthLayout />
            </RouteMiddleware>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>
        
        <Route
          element={
            <RouteMiddleware isAuthRequired={true}>
              <AdminLayout />
            </RouteMiddleware>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics/:campaignId" element={<CampaignAnalyticsPage />} />
          <Route path="/compare" element={<CampaignComparePage />} />
          <Route path="/contacts" element={<ContactsManager />} />
          <Route path="/campaigns" element={<CampaignsListPage />} />
          <Route path="/campaigns/create" element={<CampaignCreatorPage />} />
          <Route path="/campaigns/edit/:campaignId" element={<CampaignCreatorPage />} />
          <Route path="/campaigns/view/:campaignId" element={<CampaignViewPage />} />
          <Route path="/domains" element={<DomainManagerPage />} />
          <Route path="/settings/profile" element={<Profile />} />
          <Route path="/settings/general" element={<Settings />} />
          <Route path="/pricing" element={<Pricing />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={userToken ? "/dashboard" : "/"} replace />}
        />
      </Routes>
    </>
  );
};

export default MainRoutes;