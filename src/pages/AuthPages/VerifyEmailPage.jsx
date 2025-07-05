import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoaderCircle, CheckCircle, XCircle } from 'lucide-react';
import apiRequest from '../../utils/apiRequest';

function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const token = location.state?.token;

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Verification token is missing. Please try signing up again.');
        return;
      }

      try {
        await apiRequest('post', '/auth/verify-email', { token });
        setStatus('success');
        toast.success('Email verified successfully!');
      } catch (error) {
        setStatus('error');
        setErrorMessage(error?.response?.data?.message || 'An unknown error occurred.');
        toast.error('Email verification failed.');
      }
    };

    verifyToken();
  }, [token]);

  if (status === 'verifying') {
    return (
      <div className="text-center space-y-4">
        <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-brand-green" />
        <p className="text-lg font-medium text-gray-700">Verifying your email...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center text-center space-y-6">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-800">Email Verified!</h2>
        <p className="text-gray-600">Your account has been successfully verified. You can now log in.</p>
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

  return null;
}

export default VerifyEmailPage;