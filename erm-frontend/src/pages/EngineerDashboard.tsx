// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';

// const API_BASE = import.meta.env.VITE_API_BASE_URL;

// type Assignment = {
//   id: string;
//   engineerid: string;
//   projectid: string;
//   allocationpercentage: number;
//   startdate?: string;
//   enddate?: string;
//   role?: string;
// };

// function EngineerDashboard() {
//   const { user } = useAuth();
//   const [assignments, setAssignments] = useState<Assignment[]>([]);

//   useEffect(() => {
//     if (!user) return;
//     const token = localStorage.getItem('token');
//     axios
//       .get(`${API_BASE}/api/assignments?engineerid=${user.id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => {
//         const normalized = res.data.map((a: any) => ({
//           id: a.id,
//           engineerid: a.engineer_id,
//           projectid: a.project_id,
//           allocationpercentage: a.allocation_percentage,
//           startdate: a.start_date,
//           enddate: a.end_date,
//           role: a.role,
//         }));
//         setAssignments(normalized);
//       });
//   }, [user]);

//   return (
//     <div className="p-4">
//       <h1 className="text-xl font-bold mb-4">My Assignments</h1>
//       <table className="w-full table-auto border border-gray-300">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border p-2">Project ID</th>
//             <th className="border p-2">Allocation (%)</th>
//             <th className="border p-2">Start Date</th>
//             <th className="border p-2">End Date</th>
//             <th className="border p-2">Role</th>
//           </tr>
//         </thead>
//         <tbody>
//           {assignments.map((a) => (
//             <tr key={a.id}>
//               <td className="border p-2 text-center">{a.projectid}</td>
//               <td className="border p-2 text-center">{a.allocationpercentage}%</td>
//               <td className="border p-2 text-center">{a.startdate?.split('T')[0]}</td>
//               <td className="border p-2 text-center">{a.enddate?.split('T')[0]}</td>
//               <td className="border p-2 text-center">{a.role}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default EngineerDashboard;


import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../components/AuthContext.tsx';
import { getAssignments } from '../api/api.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import type { Assignment } from '../types.ts';

function EngineerDashboard() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { token, user } = authContext;

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyAssignments = async () => {
      if (!token || !user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        // Fetch assignments specifically for the logged-in engineer
        const myAssignments = await getAssignments({ engineerId: user.id }, token);
        setAssignments(myAssignments);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch your assignments.');
        console.error('Error fetching engineer assignments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAssignments();
  }, [token, user]);

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
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">My Dashboard</h1>
      <p className="text-center text-gray-600 mb-8">Welcome, {user?.name}! Here are your current and upcoming project assignments.</p>

      {assignments.length === 0 ? (
        <p className="text-center text-gray-500">No assignments found for you.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">{assignment.project_name}</h3>
              <p className="text-gray-700 mb-1">Role: <span className="font-medium">{assignment.assignment_role}</span></p>
              <p className="text-gray-700 mb-1">Allocation: <span className="font-medium">{assignment.allocation_percentage}%</span></p>
              <p className="text-gray-700 mb-1">Start Date: <span className="font-medium">{new Date(assignment.start_date).toLocaleDateString()}</span></p>
              <p className="text-gray-700 mb-4">End Date: <span className="font-medium">{new Date(assignment.end_date).toLocaleDateString()}</span></p>

              {/* Simple progress bar for assignment duration (can be more sophisticated) */}
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                {/* Calculate duration and progress - simplified for now */}
                <div
                  className="bg-purple-500 h-2.5 rounded-full"
                  style={{ width: `${Math.min(100, (new Date().getTime() - new Date(assignment.start_date).getTime()) / (new Date(assignment.end_date).getTime() - new Date(assignment.start_date).getTime()) * 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Project ID: {assignment.project_id.substring(0, 8)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EngineerDashboard;