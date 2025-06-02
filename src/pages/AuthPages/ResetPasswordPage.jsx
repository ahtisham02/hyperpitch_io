import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoaderCircle, Check, X, Eye, EyeOff } from 'lucide-react'; // Added Eye and EyeOff

const ValidationItem = ({ isValid, text }) => {
  return (
    <div className={`flex items-center gap-2 ${isValid ? 'text-green-600' : 'text-red-600'}`}>
      {isValid ? <Check className="h-4 w-4 flex-shrink-0" /> : <X className="h-4 w-4 flex-shrink-0" />}
      <span className="text-xs sm:text-sm">{text}</span>
    </div>
  );
};

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [urlToken, setUrlToken] = useState('asas');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const [validation, setValidation] = useState({
    length: false,
    mixedCase: false,
    numbersAndSpecial: false,
  });

  // useEffect(() => {
  //   const queryParams = new URLSearchParams(location.search);
  //   const tokenFromUrl = queryParams.get('token');
  //   const emailFromUrl = queryParams.get('email');

  //   if (tokenFromUrl) {
  //     setUrlToken(tokenFromUrl);
  //   } else {
  //     toast.error('Invalid or missing reset token.');
  //     navigate('/login');
  //   }
  //   if (emailFromUrl) {
  //     setEmail(emailFromUrl);
  //   }
  // }, [location, navigate]);

  useEffect(() => {
    setValidation({
      length: password.length >= 12,
      mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
      numbersAndSpecial: /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const passwordsMatch = password && password === passwordConfirmation;
  const isFormValid = Object.values(validation).every(Boolean) && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
        toast.error("Please ensure all password requirements are met and passwords match.");
        return;
    }
    setProcessing(true);
    setErrors({});

    console.log('Reset password attempt:', { token: urlToken, email, password });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = true;
    if (success) {
      setIsSuccess(true);
    } else {
      setErrors({ form: 'Failed to reset password. The link may be invalid or expired.' });
      toast.error('Password reset failed.');
    }
    setProcessing(false);
  };

  if (!urlToken) {
    return <p className="text-center text-gray-600 p-4">Verifying reset link...</p>;
  }

  if (isSuccess) {
    return (
      <>
        <div className="rounded-xl bg-green-50 px-4 py-4 text-left border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green">
              <Check className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-green-800">Password Changed Successfully</h3>
              <p className="text-sm text-green-700">You can now log in with your new password.</p>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <Link
            to="/login"
            className="flex w-full justify-center rounded-lg py-3 font-medium text-white bg-brand-green cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
          >
            Return to Login
          </Link>
        </div>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <div className="hidden">
          <label htmlFor="email-reset-page" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email-reset-page"
            type="email"
            name="email"
            value={email}
            readOnly
            className="mt-0.5 block w-full"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="password-reset-page" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <div className="relative">
            <input
              id="password-reset-page"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              value={password}
              className="mt-0.5 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 pr-10 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
              autoFocus
              required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              disabled={processing}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 top-1 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="mt-0.5 text-xs text-red-600">{errors.password}</p>}
        </div>

        <div className="grid gap-2">
          <label htmlFor="password_confirmation-reset-page" className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="password_confirmation-reset-page"
              type={showPasswordConfirmation ? "text" : "password"}
              name="password_confirmation"
              autoComplete="new-password"
              value={passwordConfirmation}
              required
              className="mt-0.5 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 pr-10 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Repeat your new password"
              disabled={processing}
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
              className="absolute inset-y-0 right-0 top-1 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              aria-label={showPasswordConfirmation ? "Hide password confirmation" : "Show password confirmation"}
            >
              {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="mt-0.5 text-xs text-red-600">{errors.password_confirmation}</p>
          )}
          {passwordConfirmation && !passwordsMatch && (
            <p className="mt-0.5 text-xs text-red-600">Passwords do not match.</p>
          )}

          <div className="mt-3 space-y-1.5">
            <ValidationItem isValid={validation.length} text="At least 12 characters long" />
            <ValidationItem isValid={validation.mixedCase} text="Uppercase & lowercase letters" />
            <ValidationItem isValid={validation.numbersAndSpecial} text="Numbers & special characters" />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 flex w-full justify-center rounded-lg py-3 font-medium text-white bg-brand-green cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={processing || !isFormValid}
        >
          {processing && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
          Set New Password
        </button>
      </div>
    </form>
  );
}

export default ResetPasswordPage;