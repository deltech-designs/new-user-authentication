import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';

export default function VerifyEmail() {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuthStore();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        // Parse email from query parameters using useLocation
        const query = new URLSearchParams(location.search);
        const email = query.get('email');

        if (!token || !email) {
          throw new Error('Invalid verification link: Token or email missing');
        }

        setStatus('verifying');

        const result = await verifyEmail(token, email);
        if (!result.success) {
          throw new Error(result.error || 'Verification failed');
        }

        setStatus('success');
        toast.success('Email verified successfully!');
        // Redirect to dashboard after 2 seconds
        setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
      } catch (error) {
        setStatus('error');
        setErrorMessage(error.message || 'Verification failed');
        toast.error(error.message || 'Verification failed');
        console.error('Verification error:', error);
      }
    };
    verify();
  }, [token, location.search, verifyEmail, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Email Verification
        </h1>
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
              {errorMessage ||
                'Failed to verify email. The token may be invalid or expired.'}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() =>
                  navigate('/resend-verification', {
                    state: {
                      email: new URLSearchParams(location.search).get('email'),
                    },
                  })
                }
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Resend Verification Email
              </button>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
