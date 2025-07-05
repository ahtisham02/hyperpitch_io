import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LoaderCircle, KeyRound, Eye, EyeOff, CheckCircle, Check, X } from 'lucide-react';
import apiRequest from '../../utils/apiRequest'; 

const OTP_LENGTH = 6;

const ValidationItem = ({ isValid, text }) => {
  return (
    <div className={`flex items-center gap-2 ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
      {isValid ? <Check className="h-4 w-4 flex-shrink-0" /> : <X className="h-4 w-4 flex-shrink-0 text-red-500" />}
      <span className="text-xs sm:text-sm">{text}</span>
    </div>
  );
};

function ResetPasswordConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validation, setValidation] = useState({
    length: false,
    mixedCase: false,
    numbersAndSpecial: false,
  });
  const inputRefs = useRef([]);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error("No email found. Please start the password reset process again.");
      navigate('/forgot-password');
    }
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  const formik = useFormik({
    initialValues: {
      email: email || '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .length(OTP_LENGTH, `OTP must be ${OTP_LENGTH} digits`)
        .required('OTP is required'),
      newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters long')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[@$!%*?&]/, 'Password must contain at least one special character')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          code: values.otp,
          email: values.email,
          newPassword: values.newPassword,
        };
        await apiRequest("post", "/auth/reset-password", payload);
        setIsSuccess(true);
        toast.success("Password updated successfully!")
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to reset password. Please check the OTP and try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { setFieldValue, values } = formik;
  useEffect(() => {
    setFieldValue('otp', otp.join(''));
  }, [otp, setFieldValue]);

  useEffect(() => {
    const password = values.newPassword;
    setValidation({
      length: password.length >= 8,
      mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
      numbersAndSpecial: /[0-9]/.test(password) && /[@$!%*?&]/.test(password),
    });
  }, [values.newPassword]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value.substring(element.value.length - 1);
    setOtp(newOtp);
    if (element.value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handleOtpPaste = (e) => {
    const value = e.clipboardData.getData("text");
    if (isNaN(value) || value.length !== OTP_LENGTH) return;
    setOtp(value.split(""));
    inputRefs.current[OTP_LENGTH - 1]?.focus();
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 !mt-11 space-y-6">
        <div className="w-20 h-20 flex items-center justify-center bg-green-100 rounded-full">
          <CheckCircle className="w-12 h-12 text-brand-green" strokeWidth={2.5} />
        </div>
        <div className='space-y-2'>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Password Changed!
          </h1>
          <p className="text-base text-gray-600">
            You can now use your new password to log in to your account.
          </p>
        </div>
        <Link
          to="/login"
          className="w-full sm:w-auto inline-flex justify-center rounded-lg px-8 py-3 font-semibold text-white bg-brand-green cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 transition-colors duration-200"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <KeyRound size={40} className="mx-auto text-brand-green mb-3" />
        <h2 className="text-2xl font-bold text-gray-800">Set New Password</h2>
        <p className="text-gray-600 text-sm mt-2">
          An OTP has been sent to <span className="font-semibold">{email}</span>.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Enter OTP</label>
          <div className="flex justify-center space-x-2" onPaste={handleOtpPaste}>
            {otp.map((data, index) => (
              <input key={index} type="text" inputMode="numeric" maxLength="1"
                className={`w-10 h-12 text-center text-lg font-medium border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                    formik.touched.otp && formik.errors.otp ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-green focus:border-brand-green'
                }`}
                value={data}
                onChange={e => handleOtpChange(e.target, index)}
                onKeyDown={e => handleOtpKeyDown(e, index)}
                onFocus={e => e.target.select()}
                ref={el => (inputRefs.current[index] = el)}
                disabled={formik.isSubmitting}
              />
            ))}
          </div>
          {formik.touched.otp && formik.errors.otp && (
            <p className="mt-2 text-xs text-red-600 text-center">{formik.errors.otp}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
          <input id="newPassword" name="newPassword" type={showPassword ? "text" : "password"}
            {...formik.getFieldProps('newPassword')}
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                formik.touched.newPassword && formik.errors.newPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-green'
            }`}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-500">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        <div className="mt-3 space-y-1.5">
          <ValidationItem isValid={validation.length} text="At least 8 characters long" />
          <ValidationItem isValid={validation.mixedCase} text="Uppercase & lowercase letters" />
          <ValidationItem isValid={validation.numbersAndSpecial} text="Numbers & special characters" />
        </div>

        <div className="relative">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"}
            {...formik.getFieldProps('confirmPassword')}
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-green'
            }`}
          />
           <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-500">
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{formik.errors.confirmPassword}</p>
          )}
        </div>

        <button type="submit"
          className="flex w-full justify-center rounded-lg py-3 font-medium text-white bg-brand-green cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={formik.isSubmitting || !formik.isValid}
        >
          {formik.isSubmitting && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
          Reset Password
        </button>
      </form>
    </div>
  );
}

export default ResetPasswordConfirmPage;