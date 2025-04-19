import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (userData, token) =>
        set({
          user: userData,
          token: token,
          isAuthenticated: userData?.isVerified || false,
          error: null,
        }),

      clearUser: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_URL}/api/v1/auth/register`,
            userData,
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );
          const data = response.data;
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          toast.success(data.message || 'Registration successful!');
          return {
            status: response.status,
            message: data.message || 'Registration successful',
          };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Registration failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          return {
            status: error.response?.status || 400,
            error: errorMessage,
          };
        }
      },

      loginUser: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_URL}/api/v1/auth/login`,
            credentials,
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );
          const data = response.data;
          if (data.action === 'resend_verification') {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: data.message,
            });
            toast.error(data.message);
            return response;
          }
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          toast.success(data.message || 'Login successful!');
          return response;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || error.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          return (
            error.response || {
              status: 500,
              data: { message: errorMessage },
            }
          );
        }
      },

      logoutUser: async () => {
        set({ isLoading: true });
        try {
          const token = get().token;
          if (token) {
            await axios.post(`${API_URL}/api/v1/auth/logout`, null, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          }
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          toast.success('Logged out successfully');
          return { success: true };
        } catch (error) {
          const errorMessage = error.message || 'Logout failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          return { success: false };
        }
      },

      verifyEmail: async (token, email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(
            `${API_URL}/api/v1/auth/verify-email/${token}`,
            {
              params: { email },
              headers: { 'Content-Type': 'application/json' },
            }
          );
          const data = response.data;
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, isVerified: true },
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: {
                id: data.user.id,
                fullname: data.user.fullname,
                email: data.user.email,
                isVerified: data.user.isVerified,
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
          toast.success(data.message || 'Email verified successfully!');
          return { success: true, verified: true };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Verification failed';
          set({ isLoading: false, error: errorMessage });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      resendVerificationEmail: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_URL}/api/v1/auth/resend-verification`,
            { email },
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );
          const data = response.data;
          set({ isLoading: false, error: null });
          toast.success(
            data.message || 'Verification email resent successfully!'
          );
          return { success: true };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to resend verification email';
          set({ isLoading: false, error: errorMessage });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      getCurrentUser: async () => {
        const token = get().token;
        if (!token) {
          return { success: false, message: 'No authentication token' };
        }
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`${API_URL}/api/v1/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = response.data;
          set({
            user: data.user,
            isAuthenticated: data.user.isVerified,
            isLoading: false,
            error: null,
          });
          toast.success('Welcome back!');
          return { success: true, user: data.user };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch user profile';
          set({
            isLoading: false,
            error: errorMessage,
          });
          if (
            errorMessage.includes('unauthorized') ||
            errorMessage.includes('401')
          ) {
            get().clearUser();
            toast.error('Session expired. Please login again.');
          } else {
            toast.error(errorMessage);
          }
          return { success: false, message: errorMessage };
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
