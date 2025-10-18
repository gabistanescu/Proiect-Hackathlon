export enum UserRole {
  ADMINISTRATOR = 'administrator',
  PROFESSOR = 'professor',
  STUDENT = 'student'
}

export enum ProfileType {
  REAL = 'real',
  TEHNOLOGIC = 'tehnologic',
  UMAN = 'uman'
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
}

export interface Administrator extends User {
  school_name?: string;
  phone?: string;
  last_password_change?: Date;
}

export interface Professor extends User {
  department?: string;
  subjects?: string;
  phone?: string;
}

export interface Student extends User {
  profile_type: ProfileType;
  grade_level?: number;
  school_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
