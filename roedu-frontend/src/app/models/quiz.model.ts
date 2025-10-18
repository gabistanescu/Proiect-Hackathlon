export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  FREE_TEXT = 'free_text'
}

export interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: QuestionType;
  options?: string[];  // For SINGLE_CHOICE and MULTIPLE_CHOICE
  correct_answer?: string | string[];
  explanation?: string;
  order: number;
  evaluation_criteria?: string;  // For FREE_TEXT: keywords/examples for evaluation
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  subject?: string;
  grade_level?: number;
  professor_id: number;
  material_id?: number;
  questions: Question[];
  is_published: boolean;
  total_points: number;
  time_limit?: number;
  created_at: Date;
  updated_at: Date;
}

export interface QuizCreate {
  title: string;
  description?: string;
  subject?: string;
  grade_level?: number;
  material_id?: number;
  questions: QuestionCreate[];
  is_published: boolean;
  total_points: number;
  time_limit?: number;
}

export interface QuestionCreate {
  question_text: string;
  question_type: QuestionType;
  options?: string[];  // For grila questions
  correct_answer?: string | string[];
  explanation?: string;
  order: number;
  evaluation_criteria?: string;  // For FREE_TEXT questions
  points?: number;
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  student_id: number;
  answers: QuestionAnswer[];
  score?: number;
  max_score?: number;
  submitted_at?: Date;
  completed_at?: Date;
  started_at: Date;
  time_remaining?: number;  // Seconds remaining
  is_expired?: number;  // 0 or 1
}

export interface QuestionAnswer {
  question_id: number;
  answer: string | string[];
  is_correct: boolean;
  points_earned: number;
}
