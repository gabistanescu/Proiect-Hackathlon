import { ProfileType } from './user.model';

export type VisibilityType = 'public' | 'professors_only' | 'private';

export type SuggestionStatus = 'open' | 'resolved' | 'closed';

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
  visibility: VisibilityType;
  published_at?: Date;
  feedback_professors_count: number;
  feedback_students_count: number;
  suggestions_count: number;
  user_has_feedback: boolean;
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
  visibility: VisibilityType;
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

// Material Suggestions (GitHub Issues style)
export interface MaterialSuggestion {
  id: number;
  material_id: number;
  professor_id: number;
  professor_name?: string;
  title: string;
  description: string;
  status: SuggestionStatus;
  comments_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface SuggestionCreate {
  title: string;
  description: string;
}

export interface SuggestionUpdate {
  status: SuggestionStatus;
}

export interface SuggestionComment {
  id: number;
  suggestion_id: number;
  professor_id: number;
  professor_name?: string;
  content: string;
  created_at: Date;
}

export interface SuggestionCommentCreate {
  content: string;
}

// Material Feedback
export interface FeedbackStats {
  feedback_professors_count: number;
  feedback_students_count: number;
  user_has_feedback: boolean;
}

export interface FeedbackToggleResponse {
  has_feedback: boolean;
  total_count: number;
}
