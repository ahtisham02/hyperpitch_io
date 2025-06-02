import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoaderCircle, KeyRound, MailWarning } from 'lucide-react';

const OTP_LENGTH = 6;

function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [email, setEmail] = useState(location.state?.email || '');
  const [processing, setProcessing] = useState(false);
  const [resendProcessing, setResendProcessing] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    // For demo, we assume email is passed. In a real app, you'd handle missing email.
    if (!email && !location.state?.email) { // Check if email was ever set
        // A simple fallback for demo if email is not passed, can be improved
        // console.warn("Email not found for OTP verification. Using placeholder or redirecting.");
        // setEmail("demo@example.com"); // or navigate('/signup');
        toast.warn("Email missing for OTP. Please start from signup or login.");
        navigate('/signup'); 
    }
    inputRefs.current = inputRefs.current.slice(0, OTP_LENGTH);
    if (inputRefs.current[0]) { // Always try to focus on first input if available
        inputRefs.current[0].focus();
    }
  }, [email, navigate, location.state?.email]);


  const handleChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return false;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError('');

    if (value && index < OTP_LENGTH - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
    } else if (e.key === "ArrowLeft" && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, OTP_LENGTH).replace(/[^0-9]/g, '');
    if (pasteData.length > 0) {
        const newOtp = [...otp];
        for (let i = 0; i < OTP_LENGTH; i++) {
            if (i < pasteData.length) {
                newOtp[i] = pasteData[i];
            } else {
                newOtp[i] = ""; // Ensure remaining fields are cleared if paste is shorter
            }
        }
        setOtp(newOtp);
        const lastFilledIndex = Math.min(pasteData.length, OTP_LENGTH) -1;
        if (pasteData.length >= OTP_LENGTH && inputRefs.current[OTP_LENGTH - 1]) {
            inputRefs.current[OTP_LENGTH - 1].focus();
        } else if (inputRefs.current[lastFilledIndex]) {
            inputRefs.current[lastFilledIndex].focus();
        }
    }
  };

  const joinedOtp = otp.join("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (joinedOtp.length !== OTP_LENGTH) {
      setError(`Please enter a ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    setProcessing(true);
    setError('');

    // Simulate API call removed

    const isOtpValid = joinedOtp === "123456"; // Demo OTP
    if (isOtpValid) {
      // toast.success('OTP Verified successfully!'); // Removed
      navigate('/login', { state: { message: "Account verified. You can now log in.", email: email } });
    } else {
      setError('Invalid OTP. Please try again.');
      setOtp(new Array(OTP_LENGTH).fill(""));
      if(inputRefs.current[0]) inputRefs.current[0].focus();
      // toast.error('OTP verification failed.'); // Removed, error displayed on page
    }
    setProcessing(false);
  };

  const handleResendOtp = async () => {
    if (!email) {
        toast.error("Cannot resend OTP without an email address.");
        return;
    }
    setResendProcessing(true);
    setError('');
    // Simulate API call removed

    toast.info(`A new OTP has been sent to ${email}.`);
    setOtp(new Array(OTP_LENGTH).fill(""));
    if(inputRefs.current[0]) inputRefs.current[0].focus();
    setResendProcessing(false);
  };

  if (!email) {
    // This part is slightly problematic for a demo if not handled well earlier.
    // The useEffect now attempts to redirect if email is truly missing.
    // Showing a loading or brief message before redirect might be an option.
    return (
      <div className="text-center p-4">
        <MailWarning size={48} className="mx-auto text-orange-500 mb-4" />
        <p className="text-gray-700">Email address is required for OTP verification.</p>
        <p className="text-gray-600 text-sm mt-2">Redirecting to signup...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <KeyRound size={40} className="mx-auto text-brand-green mb-3" />
        <p className="text-gray-700 text-sm">
          We've sent a {OTP_LENGTH}-digit One-Time Password (OTP) to your email address:
        </p>
        <p className="font-semibold text-gray-900 mt-1">{email || "your_email@example.com"}</p>
        <p className="text-gray-600 text-xs mt-2">Please enter it below to proceed. (Hint: 123456)</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center space-x-1.5 sm:space-x-2" onPaste={handlePaste}>
          {otp.map((data, index) => {
            return (
              <input
                key={index}
                type="text" // text allows easier manipulation, inputMode numeric for mobile
                name="otp"
                inputMode="numeric"
                pattern="[0-9]*" // Helps with mobile keyboard
                maxLength="1"
                className={`w-9 h-10 sm:w-10 sm:h-12 md:w-12 md:h-14 text-center text-base sm:text-lg md:text-xl font-medium border rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2
                            ${error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-gray-300 focus:ring-brand-green focus:border-brand-green'}`}
                value={data}
                onChange={e => handleChange(e.target, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onFocus={e => e.target.select()}
                ref={el => inputRefs.current[index] = el}
                disabled={processing}
                autoComplete="one-time-code" // semantic auto-complete
              />
            );
          })}
        </div>
        {error && <p className="mt-1 text-xs text-red-600 text-center">{error}</p>}

        <button
          type="submit"
          className="flex w-full justify-center rounded-lg py-3 font-medium text-white bg-brand-green cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={processing || joinedOtp.length !== OTP_LENGTH}
        >
          {processing && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
          Verify OTP
        </button>
      </form>

      <div className="text-center text-sm border-b pb-4 border-gray-200">
        <p className="text-gray-600">Didn't receive the OTP?</p>
        <button
          onClick={handleResendOtp}
          disabled={resendProcessing || !email}
          className="font-medium text-brand-green hover:text-green-700 hover:underline disabled:opacity-70 disabled:cursor-not-allowed disabled:no-underline"
        >
          {resendProcessing ? (
            <span className="flex items-center justify-center">
              <LoaderCircle className="mr-1 h-4 w-4 animate-spin" /> Resending...
            </span>
          ) : (
            "Resend OTP"
          )}
        </button>
      </div>

      <div className="text-center text-sm !mt-2">
        <Link
            to="/login"
            className="font-medium text-gray-600 hover:text-brand-green hover:underline"
        >
            Back to Login
        </Link>
      </div>
    </div>
  );
}

export default OtpVerificationPage;