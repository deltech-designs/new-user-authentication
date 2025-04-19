import React from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export default function LoginForm({
  onSubmit,
  isLoading,
  loginForm,
  handleLoginChange,
  showPassword,
  togglePasswordVisibility,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email" // Changed from type="text" for better UX
          name="email" // Fixed from name="fullname"
          value={loginForm.email}
          onChange={handleLoginChange}
          className="w-full border-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 outline-none border-2"
          placeholder="Enter your email"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={loginForm.password}
            onChange={handleLoginChange}
            className="w-full flex justify-end items-center border-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 outline-none border-2"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <span
            className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </span>
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
