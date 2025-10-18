export interface Comment {
  id: number;
  material_id: number;
  user_id: number;
  username: string;
  text: string;
  is_question: boolean;
  is_approved?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CommentCreate {
  material_id: number;
  text: string;
  is_question: boolean;
}

export interface CommentUpdate {
  text?: string;
  is_approved?: boolean;
}
