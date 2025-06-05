import type { Assignment, Engineer, EngineerCapacity, Project, User } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * @function authFetch
 * @description A wrapper around fetch for authenticated requests.
 * @param {string} endpoint - The API endpoint (e.g., '/auth/profile').
 * @param {RequestInit} options - Fetch options (method, headers, body).
 * @param {string} [token] - Optional: The JWT token for authorization.
 * @returns {Promise<T>} - The JSON response from the API.
 * @throws {Error} - Throws an error if the request fails or returns a non-2xx status.
 */
async function authFetch<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
  // Explicitly type headers as Record<string, string> to allow dynamic property assignment
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}), // Cast options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers, // Use the dynamically built headers object
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Something went wrong with the API request.');
  }

  return response.json() as Promise<T>;
}

// --- Authentication API Calls ---

interface LoginResponse {
  token: string;
  user: User;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  return authFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const getProfile = async (token: string): Promise<User> => {
  return authFetch<User>('/auth/profile', { method: 'GET' }, token);
};

// --- Engineer API Calls ---

export const getEngineers = async (token: string): Promise<Engineer[]> => {
  return authFetch<Engineer[]>('/engineers', { method: 'GET' }, token);
};

export const getEngineerCapacity = async (engineerId: string, token: string): Promise<EngineerCapacity> => {
  return authFetch<EngineerCapacity>(`/engineers/${engineerId}/capacity`, { method: 'GET' }, token);
};

export const updateEngineer = async (engineerId: string, data: Partial<Engineer>, token: string): Promise<{ message: string; engineer: Engineer }> => {
  return authFetch<{ message: string; engineer: Engineer }>(`/engineers/${engineerId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token);
};

export const getSuitableEngineers = async (skills: string[], token: string): Promise<Engineer[]> => {
  const skillQuery = skills.length > 0 ? `?skills=${skills.join(',')}` : '';
  return authFetch<Engineer[]>(`/engineers/suitable${skillQuery}`, { method: 'GET' }, token);
};

// --- Project API Calls ---

export const getProjects = async (token: string): Promise<Project[]> => {
  return authFetch<Project[]>('/projects', { method: 'GET' }, token);
};

export const createProject = async (projectData: Omit<Project, 'id' | 'manager_name'>, token: string): Promise<{ message: string; project: Project }> => {
  return authFetch<{ message: string; project: Project }>('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }, token);
};

export const updateProject = async (projectId: string, data: Partial<Omit<Project, 'id' | 'manager_name'>>, token: string): Promise<{ message: string; project: Project }> => {
  return authFetch<{ message: string; project: Project }>(`/projects/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token);
};

// --- Assignment API Calls ---

export const getAssignments = async (filters: { engineerId?: string; projectId?: string } = {}, token: string): Promise<Assignment[]> => {
  const queryParams = new URLSearchParams(filters).toString();
  const queryString = queryParams ? `?${queryParams}` : '';
  return authFetch<Assignment[]>(`/assignments${queryString}`, { method: 'GET' }, token);
};

export const createAssignment = async (assignmentData: Omit<Assignment, 'id' | 'engineer_name' | 'engineer_email' | 'project_name'>, token: string): Promise<{ message: string; assignment: Assignment }> => {
  return authFetch<{ message: string; assignment: Assignment }>('/assignments', {
    method: 'POST',
    body: JSON.stringify(assignmentData),
  }, token);
};

export const updateAssignment = async (assignmentId: string, data: Partial<Omit<Assignment, 'id' | 'engineer_name' | 'engineer_email' | 'project_name'>>, token: string): Promise<{ message: string; assignment: Assignment }> => {
  return authFetch<{ message: string; assignment: Assignment }>(`/assignments/${assignmentId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token);
};

export const deleteAssignment = async (assignmentId: string, token: string): Promise<{ message: string; assignmentId: string }> => {
  return authFetch<{ message: string; assignmentId: string }>(`/assignments/${assignmentId}`, { method: 'DELETE' }, token);
};