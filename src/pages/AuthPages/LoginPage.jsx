import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoaderCircle } from 'lucide-react';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [processing, setProcessing] = useState(false);

  const canResetPassword = true;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    toast.success('Login Successful!');
    navigate('/dashboard');
    setProcessing(false);
  };

  return (
    <>
      <form className="flex flex-col" onSubmit={handleLoginSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              tabIndex={1}
              autoComplete="email"
              value={email}
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={processing}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
            </label>
            <input
              id="password"
              type="password"
              required
              tabIndex={2}
              autoComplete="current-password"
              value={password}
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={processing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                tabIndex={3}
                className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                disabled={processing}
                />
                <label htmlFor="remember" className="text-sm font-medium text-gray-700">
                Remember me
                </label>
            </div>
            {canResetPassword && (
                <Link
                to="/forgot-password"
                className="text-sm font-medium text-brand-green hover:text-green-700 hover:underline"
                tabIndex={5}
                >
                Forgot password?
                </Link>
            )}
          </div>
          <button
            type="submit"
            className="mt-2 flex w-full justify-center rounded-lg py-3 font-medium text-white bg-brand-green cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            tabIndex={4}
            disabled={processing}
          >
            {processing && (
              <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
            )}
            Log in
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link
            to="/signup"
            className="font-medium text-brand-green hover:text-green-700 hover:underline"
        >
            Sign up
        </Link>
      </div>
    </>
  );
}

export default LoginPage;