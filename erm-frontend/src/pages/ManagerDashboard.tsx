import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../components/AuthContext';
import { getEngineers, getEngineerCapacity } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Engineer, EngineerCapacity } from '../types.ts';

interface EngineerWithCapacity extends Engineer, EngineerCapacity {}

function ManagerDashboard() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { token, user } = authContext;

  const [engineers, setEngineers] = useState<EngineerWithCapacity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEngineersData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const engineersList = await getEngineers(token);
        // Fetch capacity for each engineer concurrently
        const engineersWithCapacity = await Promise.all(
          engineersList.map(async (engineer) => {
            try {
              const capacityData = await getEngineerCapacity(engineer.id, token);
              return { ...engineer, ...capacityData };
            } catch (capErr: any) {
              console.error(`Failed to fetch capacity for ${engineer.name}:`, capErr);
              // Assign a number fallback (e.g., 0) for type consistency
              return { ...engineer, engineer_id: engineer.id, maxCapacity: engineer.max_capacity, totalAllocated: 0, availableCapacity: engineer.max_capacity };
            }
          })
        );
        setEngineers(engineersWithCapacity);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch engineers data.');
        console.error('Error fetching engineers for dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEngineersData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-600 bg-red-100 border border-red-400 rounded-md">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">Manager Dashboard</h1>
      <p className="text-center text-gray-600 mb-8">Welcome, {user?.name}! Here's an overview of your team's workload.</p>

      {engineers.length === 0 ? (
        <p className="text-center text-gray-500">No engineers found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {engineers.map((engineer) => (
            <div key={engineer.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{engineer.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{engineer.email}</p>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700">Skills: </span>
                {engineer.skills && engineer.skills.length > 0 ? (
                  engineer.skills.map((skill, index) => (
                    <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-1 mb-1">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-xs">No skills listed</span>
                )}
              </div>

              {/* Capacity Bar */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Allocated Capacity: {typeof engineer.totalAllocated === 'number' ? `${engineer.totalAllocated}%` : engineer.totalAllocated}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className={`h-2.5 rounded-full ${
                      typeof engineer.totalAllocated === 'number' && engineer.totalAllocated > 80 ? 'bg-red-500' : typeof engineer.totalAllocated === 'number' && engineer.totalAllocated > 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${typeof engineer.totalAllocated === 'number' ? engineer.totalAllocated : 0}%` }}
                  ></div>
                </div>
                <p className="text-sm font-medium text-gray-700 mt-2">Available Capacity: {typeof engineer.availableCapacity === 'number' ? `${engineer.availableCapacity}%` : engineer.availableCapacity}</p>
              </div>

              <p className="text-sm text-gray-500">Seniority: <span className="font-semibold capitalize">{engineer.seniority || 'N/A'}</span></p>
              <p className="text-sm text-gray-500">Employment: <span className="font-semibold">{engineer.max_capacity === 100 ? 'Full-time' : engineer.max_capacity === 50 ? 'Part-time' : 'N/A'}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManagerDashboard;