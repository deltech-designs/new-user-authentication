import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';

export default function ResendVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerificationEmail, isLoading } = useAuthStore();
  const [email, setEmail] = useState(location.state?.email || '');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Email is required');
      toast.error('Email is required'); 
      return;
    }

    try {
      const result = await resendVerificationEmail(email);
      if (!result.success) {
        throw new Error(result.error || 'Failed to resend verification email');
      }

      toast.success('Verification email sent! Please check your inbox.');
      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (error) {
      setError(error.message || 'Failed to resend verification email');
      toast.error(error.message || 'Failed to resend verification email');
      console.error('Resend verification error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
          Resend Verification Email
        </h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your email address to receive a new verification link.
        </p>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-center gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {isLoading ? 'Sending...' : 'Resend Email'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Go to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
