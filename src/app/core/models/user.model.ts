export interface UserSkill {
  skillId: string;
  proficiency: number;
  endorsements: string[];
}

export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  employeeId: string;
  department: string;
  location: string;
  jobTitle: string;
  email: string;
  password: string;
  bio: string;
  profileImageUrl: string;
  roles: UserRole[];
  skills: UserSkill[];
}

export interface SessionInfo {
  userId: string;
  roles: UserRole[];
  issuedAt: number;
  expiresAt: number;
}
