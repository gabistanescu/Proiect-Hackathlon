export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  ESSAY = 'essay'
}

export interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: QuestionType;
  options?: string[];
  correct_answer?: string | string[];
  explanation?: string;
  order: number;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
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
  material_id?: number;
  questions: QuestionCreate[];
  is_published: boolean;
  total_points: number;
  time_limit?: number;
}

export interface QuestionCreate {
  question_text: string;
  question_type: QuestionType;
  options?: string[];
  correct_answer?: string | string[];
  explanation?: string;
  order: number;
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  student_id: number;
  answers: QuestionAnswer[];
  score: number;
  max_score: number;
  submitted_at: Date;
  completed_at?: Date;
}

export interface QuestionAnswer {
  question_id: number;
  answer: string | string[];
  is_correct: boolean;
  points_earned: number;
}
