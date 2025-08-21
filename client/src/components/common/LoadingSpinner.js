import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="glass-effect rounded-xl p-8 shadow-xl border border-white/20">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
