import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { LoaderCircle, Eye, EyeOff } from 'lucide-react';

import apiRequest from "../../utils/apiRequest";
import { setUserInfo } from "../../auth/authSlice";

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const canResetPassword = true;

  const handleAuthSuccess = async (loginResponseData) => {
    if (!loginResponseData?.token) {
      throw new Error("Login failed: No token received.");
    }
    const { token } = loginResponseData;

    // As requested, the profile API call remains commented out.
    // This assumes the login response itself contains all necessary user data.
    // const profileResponse = await apiRequest("get", "/user/profile", null, token);
    // const userData = profileResponse.data;

    // Dispatch `setUserInfo` using the data directly from the login response.
    dispatch(setUserInfo({ token, data: loginResponseData }));

    toast.success("Login successful! Redirecting...");
    navigate("/dashboard");
  };

  // --- Google Login (Unchanged) ---
  const handleGoogleAuth = async (googleProfile) => {
    setIsGoogleLoading(true);
    try {
      const response = await apiRequest("post", "/user/google/callback", {
        email: googleProfile.email,
      });
      await handleAuthSuccess(response.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Google login failed.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        await handleGoogleAuth(googleResponse.data);
      } catch (err) {
        toast.error("Failed to fetch Google profile.");
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error("Google Login was cancelled or failed.");
      setIsGoogleLoading(false);
    },
  });
  // --- End of Google Login ---


  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Email is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    }),
    
    // The form now submits to the live API endpoint.
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await apiRequest("post", "/auth/login", values);
        // The success handler will use the response data directly.
        await handleAuthSuccess(response.data);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Login failed. Please check your credentials.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <form className="flex flex-col" onSubmit={formik.handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              tabIndex={1}
              autoComplete="email"
              value={formik.values.email}
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="you@example.com"
              disabled={formik.isSubmitting}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-xs text-red-500">{formik.errors.email}</div>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                tabIndex={2}
                autoComplete="current-password"
                value={formik.values.password}
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Password"
                disabled={formik.isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password ? (
              <div className="text-xs text-red-500">{formik.errors.password}</div>
            ) : null}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  tabIndex={3}
                  className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                  disabled={formik.isSubmitting}
                />
                <label htmlFor="remember" className="text-sm font-medium text-gray-700">
                  Remember me
                </label>
            </div>
            {canResetPassword && (
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-brand-green hover:text-green-700 hover:underline"
                  tabIndex={5}
                >
                  Forgot password?
                </Link>
            )}
          </div>
          <button
            type="submit"
            className="mt-2 flex w-full justify-center rounded-lg py-3 font-medium text-white bg-brand-green cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            tabIndex={4}
            disabled={formik.isSubmitting || !formik.isValid}
          >
            {formik.isSubmitting ? (
              <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
            ) : null}
            Log in
          </button>
        </div>
      </form>
      
      {/* 
        This section is commented out in your original code, so I've left it that way.
        If you want to re-enable Google Login, just uncomment this block.
      */}
      {/* <div className="my-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">OR</span>
          </div>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={isGoogleLoading}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.122 6.122a.75.75 0 011.06 0L10 9.939l3.818-3.817a.75.75 0 111.06 1.06L11.061 11l3.817 3.818a.75.75 0 11-1.06 1.06L10 12.061l-3.818 3.817a.75.75 0 01-1.06-1.06L8.939 11 5.122 7.182a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>
      </div> */}
      
      <div className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link
            to="/signup"
            className="font-medium text-brand-green hover:text-green-700 hover:underline"
        >
            Sign up
        </Link>
      </div>
    </>
  );
}

export default LoginPage;