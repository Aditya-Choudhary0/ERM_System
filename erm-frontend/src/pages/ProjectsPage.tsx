import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../components/AuthContext.tsx';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { createProject, getProjects, updateProject } from '../api/api.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import type { Project, ProjectFormData } from '../types.ts';

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

function ProjectsPage() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { token, user } = authContext;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProjectFormData>();

  const fetchProjects = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const projectsList = await getProjects(token);
      setProjects(projectsList);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects.');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const onFormSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure skills are an array of strings
      const requiredSkillsArray = data.requiredSkills ? data.requiredSkills.split(',').map(s => s.trim()) : [];

      if (!editingProject) {
        if (user?.role !== 'manager') {
            setError('Only managers can create projects.');
            setLoading(false);
            return;
        }
        await createProject({
            name: data.name,
            description: data.description,
            start_date: data.startDate,
            end_date: data.endDate,
            required_skills: requiredSkillsArray,
            team_size: data.teamSize,
            status: data.status,
            manager_id: user.id
        }, token as string);
      } else {
        await updateProject(editingProject.id, {
            name: data.name,
            description: data.description,
            start_date: data.startDate,
            end_date: data.endDate,
            required_skills: requiredSkillsArray,
            team_size: data.teamSize,
            status: data.status,
        }, token as string);
      }
      
      setIsModalOpen(false);
      reset();
      
      await fetchProjects();

    } catch (err: any) {
      setError(err.message || 'Failed to save project.');
      console.error('Error saving project:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    reset({
      name: '', description: '', startDate: '', endDate: '',
      requiredSkills: '', teamSize: undefined, status: 'planning'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setValue('name', project.name);
    setValue('description', project.description);
    setValue('startDate', project.start_date.split('T')[0]);
    setValue('endDate', project.end_date.split('T')[0]);
    setValue('requiredSkills', project.required_skills ? project.required_skills.join(', ') : '');
    setValue('teamSize', project.team_size);
    setValue('status', project.status);
    setIsModalOpen(true);
  };


  if (loading && !projects.length) {
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
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">Project Management</h1>
      <p className="text-center text-gray-600 mb-8">Manage active, planning, and completed projects.</p>

      {user?.role === 'manager' && (
        <div className="flex justify-end mb-6">
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create New Project
          </button>
        </div>
      )}

      {projects.length === 0 ? (
        <p className="text-center text-gray-500">No projects found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Skills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                {user?.role === 'manager' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">{project.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                    {project.required_skills && project.required_skills.map((skill, index) => (
                      <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-1 mb-1">
                        {skill}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.team_size}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.manager_name}</td>
                  {user?.role === 'manager' && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(project)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Project Name</label>
            <input
              id="name"
              {...register('name', { required: 'Project name is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            ></textarea>
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
            <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-700">Required Skills (comma-separated)</label>
            <input
              id="requiredSkills"
              {...register('requiredSkills')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="e.g., React, Node.js, SQL"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700">Required Team Size</label>
              <input
                id="teamSize"
                type="number"
                {...register('teamSize', { valueAsNumber: true })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                {...register('status', { required: 'Status is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message as string}</p>}
            </div>
          </div>
          <button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            disabled={loading}
          >
            {loading ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default ProjectsPage;