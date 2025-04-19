import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verify, error } = useAuthStore();
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        return;
      }
      try {
        await verify(token);
        setStatus('success');
        // Redirect to dashboard after 2 seconds
        setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
      } catch (error) {
        setStatus('error', error);
      }
    };
    verifyEmail();
  }, [token, verify, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-6 sm:px-6 sm:py-12">
      <div className="w-full max-w-md text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Email Verification
        </h2>
        {status === 'verifying' && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Verifying your email...
            </p>
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          </div>
        )}
        {status === 'success' && (
          <div>
            <p className="text-sm text-green-600 mb-4">
              Email verified successfully! Redirecting to dashboard...
            </p>
            <div className="inline-block h-8 w-8 animate-pulse rounded-full border-4 border-solid border-green-600"></div>
          </div>
        )}
        {status === 'error' && (
          <div>
            <p className="text-sm text-red-600 mb-4">
              {error ||
                'Failed to verify email. The token may be invalid or expired.'}
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
