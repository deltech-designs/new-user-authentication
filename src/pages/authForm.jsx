import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    fullname: '',
    email: '',
    password: '',
  });

  const { loginUser, signup, isLoading, error, isAuthenticated } =
    useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (window.location.search) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname === '/register') {
      setActiveTab('signup');
    } else {
      setActiveTab('login');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginForm;

    // console.log('Login Form Values:', { email, password });

    const trimmedEmail = email ? email.trim() : '';
    if (!trimmedEmail || !password) {
      toast.error('All fields are required!');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const res = await loginUser({ email: trimmedEmail, password });
      console.log('Login Response:', res);
      if (res.status === 200) {
        // toast.success(res.data?.message || 'Logged in successfully!');
        setLoginForm({ email: '', password: '' });
      } else if (res.data?.action === 'resend_verification') {
        // toast.error(res.data.message || 'Email not verified');
        navigate('/resend-verification', {
          state: { email: res.data.email },
        });
      } else {
        toast.error(res.data?.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'An error occurred during login'
      );
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { fullname, email, password } = signupForm;

    if (!fullname?.trim() || !email?.trim() || !password) {
      toast.error('All fields are required!');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const res = await signup(signupForm);
      if (res.status === 201) {
        toast.success(
          res.message ||
            'Account created successfully! Please verify your email.'
        );
        setSignupForm({ fullname: '', email: '', password: '' });
      } else {
        toast.error(res.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error.response?.data || error);
      toast.error(
        error.response?.data?.message || 'An error occurred during signup'
      );
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-6 sm:px-6 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome
          </h2>
          <p className="mt-1 sm:mt-2 text-sm text-gray-600">
            {activeTab === 'login'
              ? 'Log in to access your account'
              : 'Sign up to create an account'}
          </p>
        </div>

        <div className="flex border-b border-gray-200 mb-4 sm:mb-6">
          <button
            className={`w-1/2 py-3 sm:py-2 text-center font-medium ${
              activeTab === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`w-1/2 py-3 sm:py-2 text-center font-medium ${
              activeTab === 'signup'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {activeTab === 'login' && (
          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            error={error}
            loginForm={loginForm}
            handleLoginChange={handleLoginChange}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
            EyeIcon={EyeIcon}
            EyeOffIcon={EyeOffIcon}
          />
        )}

        {activeTab === 'signup' && (
          <SignupForm
            onSubmit={handleSignup}
            handleSignupChange={handleSignupChange}
            signupForm={signupForm}
            isLoading={isLoading}
            error={error}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
            EyeIcon={EyeIcon}
            EyeOffIcon={EyeOffIcon}
          />
        )}

        <div className="mt-5 sm:mt-6 text-center">
          <p className="text-sm text-gray-600">Or continue with</p>
          <div className="mt-3 flex justify-center space-x-3">
            <button className="flex-1 py-3 sm:py-2 px-4 border border-gray-300 rounded-md shadow-sm text-base sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Google
            </button>
            <button className="flex-1 py-3 sm:py-2 px-4 border border-gray-300 rounded-md shadow-sm text-base sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
