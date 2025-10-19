export type NotificationType = 'like' | 'comment' | 'quiz' | 'material' | 'suggestion';

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  related_id?: number; // Material ID, Quiz ID, etc.
  related_type?: string; // 'material', 'quiz', 'comment', etc.
  is_read: boolean;
  created_at: Date;
  actor_id?: number; // User who triggered the notification
  actor_name?: string; // Name of user who triggered the notification
}

export interface NotificationCreate {
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  related_id?: number;
  related_type?: string;
  actor_id?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
}
