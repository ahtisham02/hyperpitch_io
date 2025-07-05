import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MailWarning, LoaderCircle, CheckCircle, XCircle } from 'lucide-react';
import apiRequest from '../../utils/apiRequest';

function VerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState('idle'); // 'idle', 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  const email = location.state?.email;
  const token = location.state?.token;

  useEffect(() => {
    if (!token) {
      toast.error("Verification data missing. Please sign up again.");
      navigate('/signup');
    }
  }, [token, navigate]);

  const handleVerification = async () => {
    setStatus('verifying');
    try {
      await apiRequest('post', '/auth/verify-email', { token });
      setStatus('success');
      toast.success('Email verified successfully!');
    } catch (error) {
      setStatus('error');
      const msg = error?.response?.data?.message || 'An unknown error occurred.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  if (status === 'verifying') {
    return (
      <div className="text-center space-y-4">
        <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-brand-green" />
        <p className="text-lg font-medium text-gray-700">Verifying your account...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center text-center space-y-6">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-800">Email Verified!</h2>
        <p className="text-gray-600">Your account is ready. You can now log in.</p>
        <Link
          to="/login"
          className="w-full max-w-xs inline-flex justify-center rounded-lg px-8 py-3 font-semibold text-white bg-brand-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
        >
          Proceed to Login
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center text-center space-y-6">
        <XCircle className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-800">Verification Failed</h2>
        <p className="text-gray-600 bg-red-50 p-3 rounded-md">{errorMessage}</p>
        <Link
          to="/signup"
          className="w-full max-w-xs inline-flex justify-center rounded-lg px-8 py-3 font-semibold text-white bg-brand-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
        >
          Return to Signup
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center">
        <MailWarning size={48} className="mx-auto text-brand-green mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Almost there!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for signing up. Please click the button below to verify your email address.
        </p>
      </div>
      <div className="w-full space-y-4 mt-6">
        <button
          onClick={handleVerification}
          disabled={status === 'verifying'}
          className="flex w-full justify-center rounded-lg py-3 font-medium text-white bg-brand-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'verifying' ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : null}
          Verify My Email
        </button>
        <Link
          to="/login"
          className="block w-full text-center rounded-lg py-3 font-medium text-brand-green border border-brand-green hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default VerifyPage;