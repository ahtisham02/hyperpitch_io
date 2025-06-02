import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailWarning } from 'lucide-react';

function VerifyPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="text-center">
        <MailWarning size={48} className="mx-auto text-brand-green mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Check Your Email</h2>
        <p className="text-gray-600 mb-6">
          We've sent a (simulated) verification link to your email address.
          Please click the button below to simulate verifying your email.
        </p>
      </div>

      <div className="space-y-4 mt-6">
        <button
          onClick={() => navigate('/verify-email')}
          className="flex w-full justify-center rounded-lg py-3 font-medium text-white bg-brand-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
        >
          Simulate Email Verification Link
        </button>
        <Link
          to="/login"
          className="block w-full text-center rounded-lg py-3 font-medium text-brand-green border border-brand-green hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
        >
          Back to Login
        </Link>
      </div>
    </>
  );
}

export default VerifyPage;