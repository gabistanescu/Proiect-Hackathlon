import { Injectable } from '@angular/core';
import { Observable, of, delay, BehaviorSubject } from 'rxjs';
import { Notification } from '../models/notification.model';

/**
 * Mock Notification Service - simulates backend API calls
 * Replace with real API calls once backend is implemented
 */
@Injectable({
  providedIn: 'root'
})
export class MockNotificationService {
  private mockNotifications: Notification[] = [];
  private notificationId = 1;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Create some mock notifications for testing
    this.mockNotifications = [
      {
        id: this.notificationId++,
        user_id: 1,
        type: 'like',
        title: 'Material apreciat!',
        message: 'Ana Popescu a apreciat materialul tău "Ecuații de gradul al doilea"',
        related_id: 1,
        related_type: 'material',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        actor_id: 2,
        actor_name: 'Ana Popescu'
      },
      {
        id: this.notificationId++,
        user_id: 1,
        type: 'comment',
        title: 'Comentariu nou',
        message: 'Mihai Ionescu a comentat pe materialul "Romantismul în literatura română"',
        related_id: 2,
        related_type: 'material',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        actor_id: 3,
        actor_name: 'Mihai Ionescu'
      },
      {
        id: this.notificationId++,
        user_id: 1,
        type: 'like',
        title: 'Material apreciat!',
        message: 'Andrei Pop a apreciat materialul tău "Circuite electrice"',
        related_id: 3,
        related_type: 'material',
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        actor_id: 4,
        actor_name: 'Andrei Pop'
      },
      {
        id: this.notificationId++,
        user_id: 1,
        type: 'suggestion',
        title: 'Sugestie nouă',
        message: 'Elena Marinescu a propus o îmbunătățire pentru materialul "Fotosinteza"',
        related_id: 4,
        related_type: 'material',
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        actor_id: 5,
        actor_name: 'Elena Marinescu'
      }
    ];

    this.notificationsSubject.next(this.mockNotifications);
  }

  getNotifications(limit: number = 20): Observable<Notification[]> {
    const notifications = this.mockNotifications.slice(0, limit);
    return of(notifications).pipe(delay(500)); // Simulate network delay
  }

  getUnreadNotifications(): Observable<Notification[]> {
    const unread = this.mockNotifications.filter(n => !n.is_read);
    return of(unread).pipe(delay(300));
  }

  markAsRead(notificationId: number): Observable<Notification> {
    const notification = this.mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.is_read = true;
      this.notificationsSubject.next([...this.mockNotifications]);
      return of(notification).pipe(delay(200));
    }
    throw new Error('Notification not found');
  }

  markAllAsRead(): Observable<{ message: string }> {
    this.mockNotifications.forEach(n => n.is_read = true);
    this.notificationsSubject.next([...this.mockNotifications]);
    return of({ message: 'All notifications marked as read' }).pipe(delay(300));
  }

  deleteNotification(notificationId: number): Observable<void> {
    this.mockNotifications = this.mockNotifications.filter(n => n.id !== notificationId);
    this.notificationsSubject.next([...this.mockNotifications]);
    return of(void 0).pipe(delay(200));
  }

  clearAllNotifications(): Observable<{ message: string }> {
    this.mockNotifications = [];
    this.notificationsSubject.next([]);
    return of({ message: 'All notifications cleared' }).pipe(delay(300));
  }

  /**
   * Simulate receiving a new notification (for testing)
   */
  addMockNotification(type: 'like' | 'comment' | 'quiz' | 'material' | 'suggestion'): void {
    const messages = {
      like: 'cineva a apreciat materialul tău',
      comment: 'cineva a comentat pe materialul tău',
      quiz: 'ai un rezultat nou la test',
      material: 'ai un material nou partajat',
      suggestion: 'ai o sugestie nouă pentru material'
    };

    const newNotification: Notification = {
      id: this.notificationId++,
      user_id: 1,
      type: type,
      title: `${type === 'like' ? 'Material apreciat!' : 'Notificare nouă'}`,
      message: messages[type],
      related_id: Math.floor(Math.random() * 10) + 1,
      related_type: 'material',
      is_read: false,
      created_at: new Date(),
      actor_id: Math.floor(Math.random() * 100) + 1,
      actor_name: 'Utilizator Test'
    };

    this.mockNotifications.unshift(newNotification);
    this.notificationsSubject.next([...this.mockNotifications]);
  }

  /**
   * Get notification statistics
   */
  getStats(): Observable<{ total: number; unread: number }> {
    const total = this.mockNotifications.length;
    const unread = this.mockNotifications.filter(n => !n.is_read).length;
    return of({ total, unread }).pipe(delay(200));
  }
}
