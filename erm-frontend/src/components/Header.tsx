import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ROUTES } from '../App';

interface HeaderProps {
  navigate: (path: typeof ROUTES[keyof typeof ROUTES]) => void;
  userRole: 'manager' | 'engineer';
}

function Header({ navigate, userRole }: HeaderProps) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { logout } = authContext;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="bg-white shadow-sm p-4 md:px-8 flex flex-col sm:flex-row items-center justify-between">
      <div className="text-xl font-bold text-blue-600 mb-2 sm:mb-0">
        EMS Dashboard
      </div>
      <nav className="flex flex-wrap gap-x-4 gap-y-2 justify-center sm:justify-start">
        {userRole === 'manager' && (
          <>
            <button
              onClick={() => navigate(ROUTES.MANAGER_DASHBOARD)}
              className="text-gray-700 hover:text-blue-600 font-medium py-1 px-3 rounded-md transition-colors"
            >
              Manager Dashboard
            </button>
            <button
              onClick={() => navigate(ROUTES.PROJECTS)}
              className="text-gray-700 hover:text-blue-600 font-medium py-1 px-3 rounded-md transition-colors"
            >
              Projects
            </button>
            <button
              onClick={() => navigate(ROUTES.ASSIGNMENTS)}
              className="text-gray-700 hover:text-blue-600 font-medium py-1 px-3 rounded-md transition-colors"
            >
              Assignments
            </button>
          </>
        )}
        {userRole === 'engineer' && (
          <>
            <button
              onClick={() => navigate(ROUTES.ENGINEER_DASHBOARD)}
              className="text-gray-700 hover:text-blue-600 font-medium py-1 px-3 rounded-md transition-colors"
            >
              My Dashboard
            </button>
            <button
              onClick={() => navigate(ROUTES.PROJECTS)}
              className="text-gray-700 hover:text-blue-600 font-medium py-1 px-3 rounded-md transition-colors"
            >
              Projects
            </button>
            <button
              onClick={() => navigate(ROUTES.ASSIGNMENTS)}
              className="text-gray-700 hover:text-blue-600 font-medium py-1 px-3 rounded-md transition-colors"
            >
              My Assignments
            </button>
          </>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded-md transition-colors"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}

export default Header;