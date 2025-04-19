import React from 'react';

export default function VerificationRequired() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500">
          Verification Required
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          Please verify your email address to access this page.
        </p>
      </div>
    </div>
  );
}
