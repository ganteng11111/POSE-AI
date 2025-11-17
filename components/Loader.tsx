import React from 'react';

interface LoaderProps {
    message: string;
    progress: number;
    total: number;
}

export const Loader: React.FC<LoaderProps> = ({ message, progress, total }) => {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="mt-12 text-center p-8 bg-gray-800/50 rounded-2xl max-w-lg mx-auto border border-gray-700">
        <div className="flex justify-center items-center mb-4">
          <svg className="animate-spin h-8 w-8 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-200">{message}</p>
        { progress > 0 &&
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{width: `${percentage}%`}}></div>
            </div>
        }
    </div>
  );
};