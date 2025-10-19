import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { MockNotificationService } from './mock-notification.service';
import { Notification, NotificationStats } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private pollingInterval = 30000; // Poll every 30 seconds
  private useMockData = true; // Set to false when backend is ready

  constructor(
    private apiService: ApiService,
    private mockService: MockNotificationService
  ) {}

  /**
   * Start polling for notifications
   */
  startPolling(): void {
    // Initial load
    this.loadNotifications();
    
    // Poll every 30 seconds
    interval(this.pollingInterval)
      .pipe(
        switchMap(() => this.getNotifications())
      )
      .subscribe({
        next: (notifications) => {
          this.notificationsSubject.next(notifications);
          this.updateUnreadCount(notifications);
        },
        error: (err) => console.error('Error polling notifications:', err)
      });
  }

  /**
   * Load notifications from backend
   */
  loadNotifications(): void {
    this.getNotifications().subscribe({
      next: (notifications) => {
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount(notifications);
      },
      error: (err) => console.error('Error loading notifications:', err)
    });
  }

  /**
   * Get all notifications for current user
   */
  getNotifications(limit: number = 20): Observable<Notification[]> {
    if (this.useMockData) {
      return this.mockService.getNotifications(limit);
    }
    return this.apiService.get<Notification[]>(`/notifications?limit=${limit}`);
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): Observable<Notification[]> {
    if (this.useMockData) {
      return this.mockService.getUnreadNotifications();
    }
    return this.apiService.get<Notification[]>('/notifications?unread=true');
  }

  /**
   * Get notification statistics
   */
  getNotificationStats(): Observable<NotificationStats> {
    if (this.useMockData) {
      return this.mockService.getStats();
    }
    return this.apiService.get<NotificationStats>('/notifications/stats');
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: number): Observable<Notification> {
    if (this.useMockData) {
      return this.mockService.markAsRead(notificationId).pipe(
        map((notification) => {
          // Update local state
          const notifications = this.notificationsSubject.value.map(n => 
            n.id === notificationId ? { ...n, is_read: true } : n
          );
          this.notificationsSubject.next(notifications);
          this.updateUnreadCount(notifications);
          return notification;
        })
      );
    }
    
    return this.apiService.put<Notification>(`/notifications/${notificationId}/read`, {}).pipe(
      map((notification) => {
        // Update local state
        const notifications = this.notificationsSubject.value.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        );
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount(notifications);
        return notification;
      })
    );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<{ message: string }> {
    if (this.useMockData) {
      return this.mockService.markAllAsRead().pipe(
        map((response) => {
          // Update local state
          const notifications = this.notificationsSubject.value.map(n => 
            ({ ...n, is_read: true })
          );
          this.notificationsSubject.next(notifications);
          this.unreadCountSubject.next(0);
          return response;
        })
      );
    }
    
    return this.apiService.put<{ message: string }>('/notifications/read-all', {}).pipe(
      map((response) => {
        // Update local state
        const notifications = this.notificationsSubject.value.map(n => 
          ({ ...n, is_read: true })
        );
        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(0);
        return response;
      })
    );
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: number): Observable<void> {
    if (this.useMockData) {
      return this.mockService.deleteNotification(notificationId).pipe(
        map(() => {
          // Update local state
          const notifications = this.notificationsSubject.value.filter(n => n.id !== notificationId);
          this.notificationsSubject.next(notifications);
          this.updateUnreadCount(notifications);
        })
      );
    }
    
    return this.apiService.delete<void>(`/notifications/${notificationId}`).pipe(
      map(() => {
        // Update local state
        const notifications = this.notificationsSubject.value.filter(n => n.id !== notificationId);
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount(notifications);
      })
    );
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): Observable<{ message: string }> {
    if (this.useMockData) {
      return this.mockService.clearAllNotifications().pipe(
        map((response) => {
          this.notificationsSubject.next([]);
          this.unreadCountSubject.next(0);
          return response;
        })
      );
    }
    
    return this.apiService.delete<{ message: string }>('/notifications/clear').pipe(
      map((response) => {
        this.notificationsSubject.next([]);
        this.unreadCountSubject.next(0);
        return response;
      })
    );
  }

  /**
   * Update unread count from notifications array
   */
  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.filter(n => !n.is_read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  /**
   * Get current unread count value
   */
  getUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  /**
   * Get current notifications value
   */
  getCurrentNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Add a mock notification for testing (development only)
   */
  addMockNotification(type: 'like' | 'comment' | 'quiz' | 'material' | 'suggestion'): void {
    if (this.useMockData) {
      this.mockService.addMockNotification(type);
      this.loadNotifications();
    }
  }
}
