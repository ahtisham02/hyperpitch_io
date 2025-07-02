import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoaderCircle } from 'lucide-react';

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: "Passwords do not match." });
      setProcessing(false);
      return;
    }
    if (formData.password.length < 8) {
        setErrors({ password: "Password must be at least 8 characters." });
        setProcessing(false);
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    toast.success('Account created! Please verify your email.');
    navigate('/verify');
    setProcessing(false);
  };

  return (
    <>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              tabIndex={1}
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              disabled={processing}
              placeholder="Your full name"
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div className="grid gap-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              tabIndex={1}
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              disabled={processing}
              placeholder="Your Company name"
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div className="grid gap-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              tabIndex={2}
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={processing}
              placeholder="you@example.com"
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              tabIndex={3}
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={processing}
              placeholder="Create a password (min. 8 characters)"
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div className="grid gap-2">
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              required
              tabIndex={4}
              autoComplete="new-password"
              value={formData.password_confirmation}
              onChange={handleChange}
              disabled={processing}
              placeholder="Confirm your password"
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-brand-green focus:outline-none focus:ring-brand-green sm:text-sm"
            />
            {errors.password_confirmation && (
              <p className="mt-1 text-xs text-red-600">{errors.password_confirmation}</p>
            )}
          </div>

          <button
            type="submit"
            className="mt-2 flex w-full justify-center rounded-lg py-3 font-medium text-white bg-brand-green cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            tabIndex={5}
            disabled={processing}
          >
            {processing && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
            Create account
          </button>
        </div>
      </form>
      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link
            to="/login"
            tabIndex={6}
            className="font-medium text-brand-green hover:text-green-700 hover:underline"
        >
            Log in
        </Link>
      </div>
    </>
  );
}

export default SignupPage;