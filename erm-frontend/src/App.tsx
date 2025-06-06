import { useState, useEffect, useContext } from 'react';
import Login from './components/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import EngineerDashboard from './pages/EngineerDashboard';
import ProjectsPage from './pages/ProjectsPage';
import AssignmentsPage from './pages/AssignmentsPage';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, AuthContext } from './components/AuthContext';
import EngineerProfilePage from './pages/EngineerProfilePage';

// Use a const object with 'as const' instead of enum for better compatibility and tree-shaking
export const ROUTES = {
  LOGIN: 'login',
  MANAGER_DASHBOARD: 'manager-dashboard',
  ENGINEER_DASHBOARD: 'engineer-dashboard',
  PROJECTS: 'projects',
  ASSIGNMENTS: 'assignments',
  ENGINEER_PROFILE: 'engineer-profile',
  NOT_FOUND: 'not-found',
} as const;

type RouteValue = typeof ROUTES[keyof typeof ROUTES];


function AppContent() {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { user, loading: authLoading } = authContext;

  const [currentPath, setCurrentPath] = useState<RouteValue>(ROUTES.LOGIN);

  // Effect to handle initial routing based on user's role
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        if (user.role === 'manager') {
          setCurrentPath(ROUTES.MANAGER_DASHBOARD);
        } else if (user.role === 'engineer') {
          setCurrentPath(ROUTES.ENGINEER_DASHBOARD);
        }
      } else {
        setCurrentPath(ROUTES.LOGIN);
      }
    }
  }, [user, authLoading]);

  // Function to navigate between pages
  const navigate = (path: RouteValue) => {
    setCurrentPath(path);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  // Simple switch-case for routing based on `currentPath` state
  const renderPage = () => {
    switch (currentPath) {
      case ROUTES.LOGIN:
        return <Login onLoginSuccess={() => navigate(user?.role === 'manager' ? ROUTES.MANAGER_DASHBOARD : ROUTES.ENGINEER_DASHBOARD)} />;
      case ROUTES.MANAGER_DASHBOARD:
        return <ProtectedRoute allowedRoles={['manager']}><ManagerDashboard /></ProtectedRoute>;
      case ROUTES.ENGINEER_DASHBOARD:
        return <ProtectedRoute allowedRoles={['engineer']}><EngineerDashboard /></ProtectedRoute>;
      case ROUTES.PROJECTS:
        return <ProtectedRoute allowedRoles={['manager', 'engineer']}><ProjectsPage /></ProtectedRoute>;
      case ROUTES.ASSIGNMENTS:
        return <ProtectedRoute allowedRoles={['manager', 'engineer']}><AssignmentsPage /></ProtectedRoute>;
      case ROUTES.ENGINEER_PROFILE:
        return <ProtectedRoute allowedRoles={['manager', 'engineer']}><EngineerProfilePage /></ProtectedRoute>;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
              <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
              <button
                onClick={() => navigate(user && user.role === 'manager' ? ROUTES.MANAGER_DASHBOARD : (user && user.role === 'engineer' ? ROUTES.ENGINEER_DASHBOARD : ROUTES.LOGIN))}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Go to {user ? 'Dashboard' : 'Login'}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Only show header if user is logged in */}
      {user && <Header navigate={navigate} userRole={user.role} />}
      <main className="flex-grow p-4 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );
}
