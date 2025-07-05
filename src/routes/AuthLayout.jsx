import React from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Aperture } from "lucide-react";
import bgimg from "../assets/Mask group (1).png";
import illustrationImg from "../assets/Mask group.png";

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
    case "/otp":
      return {
        title: "",
        description: "",
      };
    default:
      return { title: "Hyperpitch.io", description: "" };
  }
};

function AuthLayout() {
  const location = useLocation();
  const { title, description } = getPageMeta(location.pathname);

  const noTopMarginFooterPages = [
    "/reset-password",
    "/verify",
    "/verify-email",
  ];

  return (
    <div className="fixed inset-0 flex bg-gray-100 overflow-hidden">
      <img
        src={bgimg}
        alt=""
        className="absolute bottom-0 left-0 z-50 pointer-events-none object-contain max-w-[250px] max-h-[250px] sm:max-w-[300px] sm:max-h-[300px] md:max-w-[350px] md:max-h-[350px]"
      />

      <div className="relative z-10 hidden h-full w-[45%] flex-shrink-0 bg-[#1B2235] lg:flex flex-col p-6 md:p-10 items-center overflow-hidden">
        <div className="text-center flex-shrink-0">
          <Aperture
            size={80}
            className="text-brand-green mb-6 mx-auto"
            strokeWidth={1.5}
          />
          <h2 className="text-3xl font-medium text-gray-400 mb-4 text-center">
            Welcome Back to{" "}
            <span className="text-3xl font-bold text-gray-200 mb-4 text-center">
              {" "}
              Hyperpitch.io
            </span>
          </h2>
          <p className="text-lg text-slate-300 text-center mb-8">
            Powering the next generation of applications.
          </p>
        </div>

        <div className="w-full max-w-md xl:max-w-lg mt-4 flex-grow flex items-center justify-center">
          <img
            src={illustrationImg}
            alt="Illustration"
            className="w-full h-auto object-contain max-h-[200px] md:max-h-[270px]"
          />
        </div>
      </div>

      <div className={`relative z-10 flex flex-1 flex-col items-center justify-between pt-12 overflow-y-auto ${
            location.pathname === "/forgot-password" ? "!pt-[120px]" : ""
          }`}>
        <div className="w-full max-w-md p-6 sm:p-8 space-y-6">

          <div className="text-left">
            <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
            {description && (
              <p className="mt-2 text-sm text-gray-600">{description}</p>
            )}
          </div>

          <Outlet />
        </div>
        <div
          className={`flex-shrink-0 text-center text-xs text-gray-500 px-4 ${
            noTopMarginFooterPages.includes(location.pathname) ? "mt-0 mb-6" : "my-6"
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
