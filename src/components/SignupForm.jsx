import React from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export default function SignupForm({
  onSubmit,
  isLoading,
  signupForm,
  handleSignupChange,
  showPassword,
  togglePasswordVisibility,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          name="fullname"
          value={signupForm?.fullname}
          onChange={handleSignupChange}
          className="w-full border-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 outline-none border-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={signupForm?.email}
          onChange={handleSignupChange}
          className="w-full border-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 outline-none border-2"
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
            value={signupForm?.password}
            onChange={handleSignupChange}
            className="w-full border-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 outline-none border-2"
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
        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
      >
        {isLoading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}
