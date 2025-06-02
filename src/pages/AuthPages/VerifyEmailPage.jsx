import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShieldCheck } from 'lucide-react';

function VerifyEmailPage() {
  const navigate = useNavigate();

  useEffect(() => {
    toast.success("Email verified successfully! You can now log in.");
  }, []);

  return (
    <>
      <div className="text-center">
        <ShieldCheck size={48} className="mx-auto text-brand-green mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Email Verified!</h2>
        <p className="text-gray-600 mb-6">
          Your email address has been successfully verified.
        </p>
      </div>
      <div className="mt-6">
        <button
          onClick={() => navigate('/login')}
          className="flex w-full justify-center rounded-lg py-3 font-medium text-white bg-brand-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
        >
          Proceed to Login
        </button>
      </div>
    </>
  );
}

export default VerifyEmailPage;