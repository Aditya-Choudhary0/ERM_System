export interface User {
  id: string;
  email: string;
  name: string;
  role: 'engineer' | 'manager';
  skills?: string[];
  seniority?: 'junior' | 'mid' | 'senior';
  max_capacity?: number;
  department?: string;
}

export interface Engineer extends User {
  role: 'engineer';
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior';
  max_capacity: number;
  department: string;
}

export interface EngineerCapacity {
  engineer_id: string;
  maxCapacity: number;
  totalAllocated: number;
  availableCapacity: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  required_skills: string[];
  team_size: number;
  status: 'planning' | 'active' | 'completed';
  manager_id: string;
  manager_name: string;
}

export interface Assignment {
  id: string;
  engineer_id: string;
  engineer_name: string;
  engineer_email: string;
  project_id: string;
  project_name: string;
  allocation_percentage: number;
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  assignment_role: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  required_skills: string; // Comma-separated string for form input
  team_size: number;
  status: 'planning' | 'active' | 'completed';
  manager_id?: string; // Optional for existing projects, but needed for new
}

export interface AssignmentFormData {
  engineer_id: string;
  project_id: string;
  allocation_percentage: number;
  start_date: string;
  end_date: string;
  role: string;
}

export interface EngineerProfileFormData {
  skills: string;
  seniority: 'junior' | 'mid' | 'senior';
  department: string;
}