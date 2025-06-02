import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoaderCircle } from 'lucide-react';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    toast.info("If an account with that email exists, a password reset link has been sent.");
    navigate('/reset-password');
    setProcessing(false);
  };

  return (
    <>
      <div className="space-y-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label htmlFor="email-forgot" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email-forgot"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              autoFocus
              required
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              disabled={processing}
            />
          </div>

          <div className="my-6 flex items-center justify-start">
            <button
              type="submit"
              className="flex w-full justify-center rounded-lg py-3 font-medium text-white bg-brand-green cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={processing || !email}
            >
              {processing && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
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