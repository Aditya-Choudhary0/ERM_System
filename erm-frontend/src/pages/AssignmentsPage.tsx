import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../components/AuthContext';
import { getAssignments, createAssignment, updateAssignment, deleteAssignment, getEngineers, getProjects } from '../api/api';
import { useForm, type SubmitHandler } from 'react-hook-form';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Assignment, AssignmentFormData, Engineer, Project } from '../types';
// import { Assignment, Engineer, Project, AssignmentFormData } from '../types'; // Import types


// Re-using the simple Modal component for consistency
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

function AssignmentsPage() {
    const authContext = useContext(AuthContext);
    if (!authContext) {
      throw new Error('AuthContext must be used within an AuthProvider');
    }
    const { token, user } = authContext;

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [engineers, setEngineers] = useState<Engineer[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null); // Assignment being edited

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AssignmentFormData>();

    const fetchAllData = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const [assignmentsList, engineersList, projectsList] = await Promise.all([
                getAssignments({}, token), // Fetch all assignments
                getEngineers(token),
                getProjects(token),
            ]);
            setAssignments(assignmentsList);
            setEngineers(engineersList);
            setProjects(projectsList);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data.');
            console.error('Error fetching data for assignments page:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [token]);

    const onFormSubmit: SubmitHandler<AssignmentFormData> = async (data) => {
        setLoading(true);
        setError(null);
        try {
            if (editingAssignment) {
                // Map form data fields to API expected fields for update
                await updateAssignment(editingAssignment.id, {
                    engineer_id: data.engineerId,
                    project_id: data.projectId,
                    allocation_percentage: data.allocationPercentage,
                    start_date: data.startDate,
                    end_date: data.endDate,
                    assignment_role: data.role // Mapping 'role' to 'assignment_role'
                }, token as string);
            } else {
                // Map form data fields to API expected fields for create
                await createAssignment({
                    engineer_id: data.engineerId,
                    project_id: data.projectId,
                    allocation_percentage: data.allocationPercentage,
                    start_date: data.startDate,
                    end_date: data.endDate,
                    assignment_role: data.role // Mapping 'role' to 'assignment_role'
                }, token as string);
            }
            setIsModalOpen(false);
            reset(); // Clear form fields
            await fetchAllData(); // Refresh all lists
        } catch (err: any) {
            setError(err.message || 'Failed to save assignment.');
            console.error('Error saving assignment:', err);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingAssignment(null);
        reset({
            engineerId: '', projectId: '', allocationPercentage: 0,
            startDate: '', endDate: '', role: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (assignment: Assignment) => {
        setEditingAssignment(assignment);
        // Set form values from assignment data (mapping snake_case to camelCase for form)
        setValue('engineerId', assignment.engineer_id);
        setValue('projectId', assignment.project_id);
        setValue('allocationPercentage', assignment.allocation_percentage);
        setValue('startDate', assignment.start_date.split('T')[0]);
        setValue('endDate', assignment.end_date.split('T')[0]);
        setValue('role', assignment.assignment_role);
        setIsModalOpen(true);
    };

    const handleDelete = async (assignmentId: string) => {
        // Using a custom modal/dialog instead of window.confirm for better UI/UX and consistent behavior
        // For simplicity, I'll keep the `window.confirm` for now, but note it should be replaced.
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            setLoading(true);
            setError(null);
            try {
                await deleteAssignment(assignmentId, token as string);
                await fetchAllData(); // Refresh list
            } catch (err: any) {
                setError(err.message || 'Failed to delete assignment.');
                console.error('Error deleting assignment:', err);
            } finally {
                setLoading(false);
            }
        }
    };


    if (loading && (!assignments.length || !engineers.length || !projects.length)) {
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
            <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">Assignment Management</h1>
            <p className="text-center text-gray-600 mb-8">Assign engineers to projects and manage their allocations.</p>

            {user?.role === 'manager' && (
                <div className="flex justify-end mb-6">
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Create New Assignment
                    </button>
                </div>
            )}

            {assignments.length === 0 ? (
                <p className="text-center text-gray-500">No assignments found.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engineer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation %</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                {user?.role === 'manager' && (
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {assignments.map((assignment) => (
                                <tr key={assignment.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assignment.engineer_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.project_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.allocation_percentage}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(assignment.start_date).toLocaleDateString()} - {new Date(assignment.end_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.assignment_role}</td>
                                    {user?.role === 'manager' && (
                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                          <button
                                              onClick={() => openEditModal(assignment)}
                                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                                          >
                                              Edit
                                          </button>
                                          <button
                                              onClick={() => handleDelete(assignment.id)}
                                              className="text-red-600 hover:text-red-900"
                                          >
                                              Delete
                                          </button>
                                      </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setError(null); }}>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h2>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="engineerId" className="block text-sm font-medium text-gray-700">Engineer</label>
                        <select
                            id="engineerId"
                            {...register('engineerId', { required: 'Engineer is required' })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">Select Engineer</option>
                            {engineers.map(eng => (
                                <option key={eng.id} value={eng.id}>{eng.name} ({eng.email})</option>
                            ))}
                        </select>
                        {errors.engineerId && <p className="text-red-500 text-xs mt-1">{errors.engineerId.message as string}</p>}
                    </div>
                    <div>
                        <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">Project</label>
                        <select
                            id="projectId"
                            {...register('projectId', { required: 'Project is required' })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">Select Project</option>
                            {projects.map(proj => (
                                <option key={proj.id} value={proj.id}>{proj.name}</option>
                            ))}
                        </select>
                        {errors.projectId && <p className="text-red-500 text-xs mt-1">{errors.projectId.message as string}</p>}
                    </div>
                    <div>
                        <label htmlFor="allocationPercentage" className="block text-sm font-medium text-gray-700">Allocation Percentage</label>
                        <input
                            id="allocationPercentage"
                            type="number"
                            {...register('allocationPercentage', {
                                required: 'Allocation percentage is required',
                                min: { value: 0, message: 'Minimum 0%' },
                                max: { value: 100, message: 'Maximum 100%' },
                                valueAsNumber: true
                            })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        {errors.allocationPercentage && <p className="text-red-500 text-xs mt-1">{errors.allocationPercentage.message as string}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                id="startDate"
                                type="date"
                                {...register('startDate', { required: 'Start date is required' })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message as string}</p>}
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                id="endDate"
                                type="date"
                                {...register('endDate', { required: 'End date is required' })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                            {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message as string}</p>}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role on Project</label>
                        <input
                            id="role"
                            {...register('role')}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder="e.g., Developer, QA Engineer"
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                    </button>
                </form>
            </Modal>
        </div>
    );
}

export default AssignmentsPage;