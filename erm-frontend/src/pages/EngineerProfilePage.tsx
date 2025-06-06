import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../components/AuthContext';
import { getProfile, updateEngineer } from '../api/api';
import { useForm, type SubmitHandler } from 'react-hook-form';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Engineer, EngineerProfileFormData, User } from '../types';

function EngineerProfilePage() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  // user from AuthContext will be of type User | null. We'll refine it if it's an Engineer.
  const { token, user, updateUser } = authContext;

  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EngineerProfileFormData>();

  const fetchUserProfile = async () => {
    if (!token || !user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const profile = await getProfile(token);
      setCurrentUserProfile(profile);

      // Only set form defaults for editable fields if the user is an engineer
      if (profile.role === 'engineer') {
        const engineerProfile = profile as Engineer;
        reset({
          skills: engineerProfile.skills ? engineerProfile.skills.join(', ') : '',
          seniority: engineerProfile.seniority || 'mid',
          department: engineerProfile.department || '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile.');
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [token, user]);

  const onFormSubmit: SubmitHandler<EngineerProfileFormData> = async (data) => {
    if (!user || !token || user.role !== 'engineer') {
      setError('You are not authorized to update this profile.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updatedData: Partial<Engineer> = {
        skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
        seniority: data.seniority,
        department: data.department,
      };

      const response = await updateEngineer(user.id, updatedData, token);
      setSuccessMessage(response.message);

      updateUser(response.engineer);

    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
      console.error('Error updating engineer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-600 bg-red-100 border border-red-400 rounded-md max-w-lg mx-auto mt-8">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!currentUserProfile) {
    return (
      <div className="text-center p-4 text-gray-500 max-w-lg mx-auto mt-8">
        <p>No user profile found.</p>
      </div>
    );
  }

  const isEngineer = currentUserProfile.role === 'engineer';
  const engineerProfile = isEngineer ? (currentUserProfile as Engineer) : null;


  return (
    <div className="container mx-auto p-4 max-w-2xl bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">My Profile</h1>
      <p className="text-center text-gray-600 mb-8">View your profile details. Engineers can update their skills, seniority, and department.</p>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Always display these fields as read-only */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={currentUserProfile.email}
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed text-gray-500"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            id="name"
            type="text"
            value={currentUserProfile.name}
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed text-gray-500"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <input
            id="role"
            type="text"
            value={currentUserProfile.role.charAt(0).toUpperCase() + currentUserProfile.role.slice(1)}
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed text-gray-500"
          />
        </div>

        {/* Engineer-specific fields, only editable if user is an engineer */}
        {isEngineer && (
          <>
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
              <input
                id="skills"
                type="text"
                {...register('skills')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., React, Node.js, SQL, Python"
                disabled={!isEngineer}
              />
              {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills.message as string}</p>}
            </div>

            <div>
              <label htmlFor="seniority" className="block text-sm font-medium text-gray-700 mb-1">Seniority</label>
              <select
                id="seniority"
                {...register('seniority')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={!isEngineer}
              >
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
              </select>
              {errors.seniority && <p className="text-red-500 text-xs mt-1">{errors.seniority.message as string}</p>}
            </div>

            <div>
              <label htmlFor="max_capacity" className="block text-sm font-medium text-gray-700 mb-1">Max Capacity (%)</label>
              <input
                id="max_capacity"
                type="number"
                value={engineerProfile?.max_capacity || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                id="department"
                type="text"
                {...register('department')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Frontend, Backend, AI/ML"
                disabled={!isEngineer}
              />
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message as string}</p>}
            </div>
          </>
        )}
        {!isEngineer && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md relative text-sm">
                <p>As a **{currentUserProfile.role}**, you can view your profile here. Only engineers can modify their specific profile details (skills, seniority, department) on this page.</p>
            </div>
        )}

        {isEngineer && (
          <button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Update Profile'}
          </button>
        )}
      </form>
    </div>
  );
}

export default EngineerProfilePage;