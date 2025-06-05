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
  engineerId: string;
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
  startDate: string;
  endDate: string;
  requiredSkills: string; // Comma-separated string for form input
  teamSize: number;
  status: 'planning' | 'active' | 'completed';
  managerId?: string; // Optional for existing projects, but needed for new
}

export interface AssignmentFormData {
  engineerId: string;
  projectId: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  role: string;
}