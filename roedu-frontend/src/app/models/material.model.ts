import { ProfileType } from './user.model';

export interface Material {
  id: number;
  title: string;
  description?: string;
  content?: string; // Rich text HTML content
  profile_type?: ProfileType;
  subject: string;
  grade_level?: number;
  tags?: string[];
  is_shared: boolean;
  file_paths: string[];
  professor_id: number;
  last_reviewed?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface MaterialCreate {
  title: string;
  description?: string;
  content?: string; // Rich text HTML content
  profile_type?: ProfileType;
  subject: string;
  grade_level?: number;
  tags?: string[];
  is_shared: boolean;
  file_paths?: string[];
}

export interface MaterialSearchParams {
  profile_type?: ProfileType;
  subject?: string;
  grade_level?: number;
  tags?: string[];
  search_query?: string;
  professor_id?: number;
}
