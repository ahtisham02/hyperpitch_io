import React from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Aperture } from "lucide-react";

const getPageMeta = (pathname) => {
  switch (pathname) {
    case "/login":
      return {
        title: "Welcome Back",
        description: "Log in to continue to Hyperpitch.io.",
      };
    case "/signup":
      return {
        title: "Create Account",
        description: "Join Hyperpitch.io today.",
      };
    case "/forgot-password":
      return {
        title: "Forgot Password?",
        description: "Enter your email to reset your password.",
      };
    case "/reset-password":
      return {
        title: "Reset Password",
        description: "Enter your new password.",
      };
    case "/verify":
      return {
        title: "Verify Your Email",
        description: "A verification link has been sent to your email address.",
      };
    case "/verify-email":
      return {
        title: "Email Verified",
        description: "Your email has been successfully verified.",
      };
    default:
      return { title: "Hyperpitch.io", description: "" };
  }
};

function AuthLayout() {
  const location = useLocation();
  const { title, description } = getPageMeta(location.pathname);

  const noTopMarginFooterPages = ["/reset-password", "/verify", "/verify-email"];

  return (
    <div
      className={`flex ${
        location.pathname === "/signup" ? "min-h-screen " : "h-screen "
      } w-full bg-gray-100`}
    >
      <div className="hidden w-[45%] items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 lg:flex flex-col p-10">
        <Aperture
          size={80}
          className="text-brand-green mb-6"
          strokeWidth={1.5}
        />
        <h2 className="text-4xl font-bold text-white mb-4 text-center">
          Hyperpitch.io
        </h2>
        <p className="text-lg text-slate-300 text-center">
          Powering the next generation of applications.
        </p>
      </div>
      <div className="flex w-full flex-col items-center justify-center py-12 lg:w-1/2">
        <div className="w-full max-w-md p-6 sm:p-8 space-y-6">
          <div className="flex flex-col items-start gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-800 hover:text-brand-green transition-colors"
            >
              <Aperture size={40} className="text-brand-green" />
              <span className="text-3xl font-bold">Hyperpitch.io</span>
            </Link>
          </div>

          <div className="text-left">
            <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
            {description && (
              <p className="mt-2 text-sm text-gray-600">{description}</p>
            )}
          </div>

          <Outlet />
        </div>
        <div
          className={`text-center text-xs text-gray-500 px-4 ${
            noTopMarginFooterPages.includes(location.pathname) ? "mt-0" : "mt-2"
          }`}
        >
          © {new Date().getFullYear()} Hyperpitch.io. All rights reserved. //
          STATUS:{" "}
          <span className="text-green-500 font-semibold">OPERATIONAL</span>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;