import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('manager' | 'engineer')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { user, loading } = authContext;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  // If no user is logged in, show an unauthorized message or redirect
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Unauthorized Access</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view this page.</p>
          <a href="/login" className="px-6 py-3 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // If user is logged in but role is not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
          {user.role === 'manager' && (
            <a href="/manager-dashboard" className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-md shadow-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2">
              Go to Manager Dashboard
            </a>
          )}
          {user.role === 'engineer' && (
            <a href="/engineer-dashboard" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              Go to Engineer Dashboard
            </a>
          )}
        </div>
      </div>
    );
  }

  // If authorized, render the children components
  return <>{children}</>;
};

export default ProtectedRoute;