import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFormik } from "formik";
import * as Yup from "yup";
import { LoaderCircle } from 'lucide-react';
import apiRequest from "../../utils/apiRequest";

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Email is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await apiRequest("post", "/auth/forgot-password", values);
        toast.info("If an account with that email exists, a reset link has been sent.");
        navigate("/otp", { state: { email: values.email } });
      } catch (error) {
        const errorMessage = error?.response?.data?.message || "An error occurred. Please try again.";
        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <div className="space-y-6">
        <form onSubmit={formik.handleSubmit}>
          <div className="grid gap-2">
            <label htmlFor="email-forgot" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email-forgot"
              type="email"
              name="email"
              autoComplete="email"
              value={formik.values.email}
              autoFocus
              required
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your registered email"
              disabled={formik.isSubmitting}
            />
            {formik.touched.email && formik.errors.email ? (
              <p className="mt-1 text-xs text-red-600">{formik.errors.email}</p>
            ) : null}
          </div>

          <div className="my-6 flex items-center justify-start">
            <button
              type="submit"
              className="flex w-full justify-center rounded-lg py-3 font-medium text-white bg-brand-green cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={formik.isSubmitting || !formik.isValid}
            >
              {formik.isSubmitting && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
              Send Reset Link
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <Link
            to="/login"
            className="font-medium text-brand-green hover:text-green-700 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </>
  );
}

export default ForgotPasswordPage;