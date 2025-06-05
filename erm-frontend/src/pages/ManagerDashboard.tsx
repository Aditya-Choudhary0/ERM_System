// // import { useEffect, useState } from 'react';
// // import axios from 'axios';

// // const API_BASE = import.meta.env.VITE_API_BASE_URL;

// // type Engineer = {
// //   id: string;
// //   name: string;
// //   maxcapacity: number;
// // };

// // type Assignment = {
// //   id: string;
// //   engineerid: string;
// //   projectid: string;
// //   allocationpercentage: number;
// // };

// // function ManagerDashboard() {
// //   const [engineers, setEngineers] = useState<Engineer[]>([]);
// //   const [assignments, setAssignments] = useState<Assignment[]>([]);

// //   useEffect(() => {
// //     const token = localStorage.getItem('token');
// //     axios
// //       .get(`${API_BASE}/api/engineers`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       })
// //       .then((res) => setEngineers(res.data));
// //     axios
// //       .get(`${API_BASE}/api/assignments`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       })
// //       .then((res) => setAssignments(res.data));
// //   }, []);

// //   const getTotalAllocation = (engineerId: string) => {
// //     return assignments
// //       .filter((a) => a.engineerid === engineerId)
// //       .reduce((sum, curr) => sum + curr.allocationpercentage, 0);
// //   };

// //   return (
// //     <div className="p-4">
// //       <h1 className="text-xl font-bold mb-4">Team Overview</h1>
// //       <table className="w-full table-auto border border-gray-300">
// //         <thead>
// //           <tr className="bg-gray-200">
// //             <th className="border p-2">Engineer</th>
// //             <th className="border p-2">Capacity (%)</th>
// //             <th className="border p-2">Allocated (%)</th>
// //             <th className="border p-2">Available (%)</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {engineers.map((eng) => {
// //             const allocated = getTotalAllocation(eng.id);
// //             return (
// //               <tr key={eng.id}>
// //                 <td className="border p-2 text-center">{eng.name}</td>
// //                 <td className="border p-2 text-center">{eng.maxcapacity}</td>
// //                 <td className="border p-2 text-center">{allocated}</td>
// //                 <td className="border p-2 text-center">{eng.maxcapacity - allocated}</td>
// //               </tr>
// //             );
// //           })}
// //         </tbody>
// //       </table>
// //     </div>
// //   );
// // }

// // export default ManagerDashboard;


// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';

// const API_BASE = import.meta.env.VITE_API_BASE_URL;

// function ManagerDashboard() {
//     const { user } = useAuth();
//     const [projects, setProjects] = useState<any[]>([]);
//     const [engineers, setEngineers] = useState<any[]>([]);
//     const [newProject, setNewProject] = useState({
//         name: '',
//         description: '',
//         startDate: '',
//         endDate: '',
//         requiredSkills: '',
//         teamSize: 1,
//         status: 'active',
//     });
    
//     const [isModalOpen, setIsModalOpen] = useState(false);

//     // Fetch projects and engineers on component mount
//     useEffect(() => {
//         fetchProjects();
//         fetchEngineers();
//     }, []);

//     // Fetch projects from the server
//     const fetchProjects = async () => {
//         const token = localStorage.getItem('token');
//         try {
//             const res = await axios.get(`${API_BASE}/api/projects`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             setProjects(res.data);
//         } catch (err) {
//             console.error('Error fetching projects', err);
//         }
//     };

//     // Fetch engineers from the server
//     const fetchEngineers = async () => {
//         const token = localStorage.getItem('token');
//         try {
//             const res = await axios.get(`${API_BASE}/api/engineers`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             setEngineers(res.data);
//         } catch (err) {
//             console.error('Error fetching engineers', err);
//         }
//     };

//     // Handle project creation form change for all form elements
//     const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//         const { name, value } = e.target;
//         setNewProject((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmitProject = async (e: React.FormEvent) => {
//         e.preventDefault();
//         const token = localStorage.getItem('token');
//         try {
//             const res = await axios.post(
//                 `${API_BASE}/api/projects`,
//                 newProject,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             setProjects([...projects, res.data]); // Add the newly created project to the list
//             setNewProject({
//                 name: '',
//                 description: '',
//                 startDate: '',
//                 endDate: '',
//                 requiredSkills: '',
//                 teamSize: 1,
//                 status: 'active',
//             });
//             setIsModalOpen(false); // Close modal after successful project creation
//         } catch (err) {
//             console.error('Error creating project', err);
//         }
//     };

//     return (
//         <div className="p-4">
//             <h1 className="text-xl font-bold mb-4">Manager Dashboard</h1>

//             {/* Button to trigger the modal */}
//             <button
//                 onClick={() => setIsModalOpen(true)}
//                 className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
//             >
//                 Create New Project
//             </button>

//             {/* Modal for creating a project */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//                     <div className="bg-white p-6 rounded shadow-md w-96">
//                         <h2 className="text-lg font-semibold mb-2">Create New Project</h2>
//                         <form onSubmit={handleSubmitProject}>
//                             <div className="mb-2">
//                                 <label className="block mb-1">Project Name</label>
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     value={newProject.name}
//                                     onChange={handleProjectChange}
//                                     className="border p-2 w-full"
//                                     required
//                                 />
//                             </div>
//                             <div className="mb-2">
//                                 <label className="block mb-1">Description</label>
//                                 <textarea
//                                     name="description"
//                                     value={newProject.description}
//                                     onChange={handleProjectChange}
//                                     className="border p-2 w-full"
//                                     required
//                                 />
//                             </div>
//                             <div className="mb-2">
//                                 <label className="block mb-1">Start Date</label>
//                                 <input
//                                     type="date"
//                                     name="startDate"
//                                     value={newProject.startDate}
//                                     onChange={handleProjectChange}
//                                     className="border p-2 w-full"
//                                     required
//                                 />
//                             </div>
//                             <div className="mb-2">
//                                 <label className="block mb-1">End Date</label>
//                                 <input
//                                     type="date"
//                                     name="endDate"
//                                     value={newProject.endDate}
//                                     onChange={handleProjectChange}
//                                     className="border p-2 w-full"
//                                     required
//                                 />
//                             </div>
//                             <div className="mb-2">
//                                 <label className="block mb-1">Required Skills</label>
//                                 <input
//                                     type="text"
//                                     name="requiredSkills"
//                                     value={newProject.requiredSkills}
//                                     onChange={handleProjectChange}
//                                     className="border p-2 w-full"
//                                     required
//                                 />
//                             </div>
//                             <div className="mb-2">
//                                 <label className="block mb-1">Team Size</label>
//                                 <input
//                                     type="number"
//                                     name="teamSize"
//                                     value={newProject.teamSize}
//                                     onChange={handleProjectChange}
//                                     className="border p-2 w-full"
//                                     min="1"
//                                     max="10"
//                                     required
//                                 />
//                             </div>
//                             <div className="mb-2">
//                                 <label className="block mb-1">Status</label>
//                                 <select
//                                     name="status"
//                                     value={newProject.status}
//                                     onChange={handleProjectChange}
//                                     className="border p-2 w-full"
//                                     required
//                                 >
//                                     <option value="active">Active</option>
//                                     <option value="completed">Completed</option>
//                                     <option value="pending">Pending</option>
//                                 </select>
//                             </div>
//                             <button
//                                 type="submit"
//                                 className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
//                             >
//                                 Create Project
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={() => setIsModalOpen(false)}
//                                 className="bg-gray-500 text-white px-4 py-2 rounded"
//                             >
//                                 Cancel
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Projects Table */}
//             <h2 className="text-xl font-semibold mb-2">Projects</h2>
//             <table className="w-full table-auto border border-gray-300 mb-4">
//                 <thead>
//                     <tr className="bg-gray-200">
//                         <th className="border p-2">Project Name</th>
//                         <th className="border p-2">Team Size</th>
//                         <th className="border p-2">Status</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {projects.map((project) => (
//                         <tr key={project.id}>
//                             <td className="border p-2">{project.name}</td>
//                             <td className="border p-2">{project.team_size}</td>
//                             <td className="border p-2">{project.status}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>

//             {/* Engineers Table */}
//             <h2 className="text-xl font-semibold mb-2">Engineers</h2>
//             <table className="w-full table-auto border border-gray-300">
//                 <thead>
//                     <tr className="bg-gray-200">
//                         <th className="border p-2">Name</th>
//                         <th className="border p-2">Role</th>
//                         <th className="border p-2">Assigned Project</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {engineers.map((engineer) => (
//                         <tr key={engineer.id}>
//                             <td className="border p-2">{engineer.name}</td>
//                             <td className="border p-2">{engineer.role}</td>
//                             <td className="border p-2">{engineer.assignedProject}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }

// export default ManagerDashboard;


import React, { useState, useEffect, useContext } from 'react';
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
              return { ...engineer, engineerId: engineer.id, maxCapacity: engineer.max_capacity, totalAllocated: 0, availableCapacity: engineer.max_capacity };
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