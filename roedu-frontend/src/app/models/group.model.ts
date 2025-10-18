export interface StudentInGroup {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  subject?: string;
  grade_level?: number;
  professor_id: number;
  student_count?: number;
  students?: StudentInGroup[];
  created_at?: string;
  updated_at?: string;
}

export interface GroupCreate {
  name: string;
  description?: string;
  subject?: string;
  grade_level?: number;
  student_emails: string[];
}

export interface GroupUpdate {
  name?: string;
  description?: string;
  subject?: string;
  grade_level?: number;
}

export interface GroupAddStudents {
  student_emails: string[];
}

export interface GroupRemoveStudents {
  student_ids: number[];
}
