import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { LoaderCircle, Eye, EyeOff, Check } from 'lucide-react';
import apiRequest from "../../utils/apiRequest";
import { setUserInfo } from "../../auth/authSlice";

const ValidationItem = ({ isValid, text }) => (
  <div
    className={`flex items-center gap-2 text-xs transition-colors ${
      isValid ? "text-green-500" : "text-gray-500"
    }`}
  >
    <Check className="w-4 h-4 flex-shrink-0" />
    <span>{text}</span>
  </div>
);

function SignupPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleAuthSuccess = (data) => {
    if (data?.token) {
      dispatch(setUserInfo({ token: data.token, data: data.user }));
      toast.success("Login successful! Redirecting...");
      navigate("/dashboard");
    } else {
      throw new Error("Invalid response from server.");
    }
  };

  const handleGoogleAuth = async (googleProfile) => {
    setIsGoogleLoading(true);
    try {
      const response = await apiRequest("post", "/user/google/callback", {
        email: googleProfile.email,
        name: googleProfile.name,
      });
      handleAuthSuccess(response.data);
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
        const googleResponse = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );
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

  const formik = useFormik({
    initialValues: {
      name: "",
      companyName: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(3, "Full name must be at least 3 characters")
        .required("Full name is required"),
      companyName: Yup.string(),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[a-z]/, "Password must contain a lowercase letter")
        .matches(/[A-Z]/, "Password must contain an uppercase letter")
        .matches(/[0-9]/, "Password must contain a number")
        .required("Password is required"),
      password_confirmation: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Password confirmation is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await apiRequest("post", "/auth/signup", {
            name: values.name,
            companyName: values.companyName,
            email: values.email,
            password: values.password
        });
        toast.success("Account created successfully!");
        navigate("/login");
        // navigate("/verify", { state: { email: values.email, token: response.data.token } });
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            "Signup failed. Please try again later."
        );
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input id="name" name="name" type="text" required autoFocus tabIndex={1} autoComplete="name" {...formik.getFieldProps('name')} disabled={formik.isSubmitting} placeholder="Your full name"
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm" />
            {formik.touched.name && formik.errors.name ? (<p className="mt-1 text-xs text-red-600">{formik.errors.name}</p>) : null}
          </div>
          <div className="grid gap-2">
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name (Optional)</label>
            <input id="companyName" name="companyName" type="text" tabIndex={2} autoComplete="organization" {...formik.getFieldProps('companyName')} disabled={formik.isSubmitting} placeholder="Your company name"
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm" />
            {formik.touched.companyName && formik.errors.companyName ? (<p className="mt-1 text-xs text-red-600">{formik.errors.companyName}</p>) : null}
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input id="email" name="email" type="email" required tabIndex={3} autoComplete="email" {...formik.getFieldProps('email')} disabled={formik.isSubmitting} placeholder="you@example.com"
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm" />
            {formik.touched.email && formik.errors.email ? (<p className="mt-1 text-xs text-red-600">{formik.errors.email}</p>) : null}
          </div>
          <div className="grid gap-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? "text" : "password"} required tabIndex={4} autoComplete="new-password" {...formik.getFieldProps('password')} disabled={formik.isSubmitting} placeholder="Create a password"
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="!mt-2 space-y-1">
              <ValidationItem isValid={formik.values.password.length >= 8} text="At least 8 characters" />
              <ValidationItem isValid={/[A-Z]/.test(formik.values.password) && /[a-z]/.test(formik.values.password)} text="Uppercase & lowercase letters" />
              <ValidationItem isValid={/[0-9]/.test(formik.values.password)} text="At least one number" />
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirm password</label>
            <input id="password_confirmation" name="password_confirmation" type="password" required tabIndex={5} autoComplete="new-password" {...formik.getFieldProps('password_confirmation')} disabled={formik.isSubmitting} placeholder="Confirm your password"
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm" />
            {formik.touched.password_confirmation && formik.errors.password_confirmation ? (<p className="mt-1 text-xs text-red-600">{formik.errors.password_confirmation}</p>) : null}
          </div>
          <button type="submit" tabIndex={6} disabled={formik.isSubmitting || !formik.isValid}
            className="mt-2 flex w-full justify-center rounded-lg py-3 font-medium text-white bg-brand-green cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {formik.isSubmitting && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />} Create account
          </button>
        </div>
      </form>
      {/* <div className="my-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
          <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">OR</span></div>
        </div>
      </div> */}
      <div>
        {/* <button
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
        </button> */}
      </div>
      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" tabIndex={7} className="font-medium text-brand-green hover:text-green-700 hover:underline">Log in</Link>
      </div>
    </>
  );
}

export default SignupPage;