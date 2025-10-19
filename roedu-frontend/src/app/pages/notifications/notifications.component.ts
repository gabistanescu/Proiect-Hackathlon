import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-page">
      <div class="page-header">
        <h1>🔔 Notificări</h1>
        <div class="header-actions">
          @if (unreadCount > 0) {
            <button class="btn btn-primary" (click)="markAllAsRead()">
              ✓ Marchează toate ca citite ({{ unreadCount }})
            </button>
          }
          @if (notifications.length > 0) {
            <button class="btn btn-secondary" (click)="clearAll()">
              🗑️ Șterge toate
            </button>
          }
        </div>
      </div>

      @if (loading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Se încarcă notificările...</p>
        </div>
      } @else if (notifications.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🔕</div>
          <h3>Nu ai notificări</h3>
          <p>Vei primi notificări când cineva interacționează cu materialele tale.</p>
        </div>
      } @else {
        <div class="notifications-list">
          @for (notification of notifications; track notification.id) {
            <div 
              class="notification-card" 
              [class.unread]="!notification.is_read"
              (click)="handleNotificationClick(notification)">
              <div class="notification-icon">
                {{ getNotificationIcon(notification.type) }}
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <h3 class="notification-title">{{ notification.title }}</h3>
                  <span class="notification-time">{{ getRelativeTime(notification.created_at) }}</span>
                </div>
                <p class="notification-message">{{ notification.message }}</p>
                @if (notification.actor_name) {
                  <p class="notification-actor">De la: {{ notification.actor_name }}</p>
                }
                @if (!notification.is_read) {
                  <span class="unread-badge">Nou</span>
                }
              </div>
              <div class="notification-actions">
                @if (!notification.is_read) {
                  <button 
                    class="btn-action btn-read" 
                    (click)="markAsRead(notification.id, $event)"
                    title="Marchează ca citit">
                    ✓
                  </button>
                }
                <button 
                  class="btn-action btn-delete" 
                  (click)="deleteNotification(notification.id, $event)"
                  title="Șterge notificarea">
                  🗑️
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-page {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header h1 {
      font-size: 2rem;
      color: #1f2937;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 0.95rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }

    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6b7280;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e5e7eb;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #6b7280;
      font-size: 1rem;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-card {
      display: flex;
      gap: 1.25rem;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
    }

    .notification-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .notification-card.unread {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-left: 4px solid #3b82f6;
    }

    .notification-icon {
      font-size: 2.5rem;
      flex-shrink: 0;
      line-height: 1;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .notification-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
      line-height: 1.4;
    }

    .notification-time {
      color: #9ca3af;
      font-size: 0.875rem;
      white-space: nowrap;
    }

    .notification-message {
      color: #4b5563;
      font-size: 0.95rem;
      line-height: 1.6;
      margin: 0 0 0.5rem 0;
    }

    .notification-actor {
      color: #6b7280;
      font-size: 0.875rem;
      font-style: italic;
      margin: 0;
    }

    .unread-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #3b82f6;
      color: white;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }

    .notification-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .btn-action {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      background: #f3f4f6;
      color: #6b7280;
    }

    .btn-action:hover {
      transform: scale(1.1);
    }

    .btn-read:hover {
      background: #d1fae5;
      color: #065f46;
    }

    .btn-delete:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    @media (max-width: 768px) {
      .notifications-page {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
      }

      .btn {
        flex: 1;
        padding: 0.65rem 1rem;
        font-size: 0.875rem;
      }

      .notification-card {
        padding: 1rem;
        gap: 1rem;
      }

      .notification-icon {
        font-size: 2rem;
      }

      .notification-title {
        font-size: 1rem;
      }

      .notification-message {
        font-size: 0.875rem;
      }

      .notification-actions {
        flex-direction: row;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount: number = 0;
  loading: boolean = true;
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to notifications
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
        this.loading = false;
      });

    // Subscribe to unread count
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });

    // Load notifications
    this.notificationService.loadNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleNotificationClick(notification: Notification): void {
    // Mark as read if unread
    if (!notification.is_read) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }

    // Navigate to related item
    if (notification.related_type && notification.related_id) {
      switch (notification.related_type) {
        case 'material':
          this.router.navigate(['/materials', notification.related_id]);
          break;
        case 'quiz':
          this.router.navigate(['/quizzes', notification.related_id]);
          break;
        case 'comment':
          this.router.navigate(['/materials', notification.related_id]);
          break;
        default:
          console.log('Unknown related type:', notification.related_type);
      }
    }
  }

  markAsRead(notificationId: number, event: Event): void {
    event.stopPropagation();
    
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        console.log('Notification marked as read');
      },
      error: (err) => {
        console.error('Error marking notification as read:', err);
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        console.log('All notifications marked as read');
      },
      error: (err) => {
        console.error('Error marking all as read:', err);
        alert('Eroare la marcarea notificărilor ca citite');
      }
    });
  }

  deleteNotification(notificationId: number, event: Event): void {
    event.stopPropagation();
    
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        console.log('Notification deleted');
      },
      error: (err) => {
        console.error('Error deleting notification:', err);
        alert('Eroare la ștergerea notificării');
      }
    });
  }

  clearAll(): void {
    if (confirm('Sigur vrei să ștergi toate notificările?')) {
      this.notificationService.clearAllNotifications().subscribe({
        next: () => {
          console.log('All notifications cleared');
        },
        error: (err) => {
          console.error('Error clearing notifications:', err);
          alert('Eroare la ștergerea notificărilor');
        }
      });
    }
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'like': '❤️',
      'comment': '💬',
      'quiz': '📝',
      'material': '📚',
      'suggestion': '💡'
    };
    return icons[type] || '🔔';
  }

  getRelativeTime(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Acum';
    if (minutes < 60) return `Acum ${minutes} min`;
    if (hours < 24) return `Acum ${hours}h`;
    if (days < 7) return `Acum ${days} zile`;
    if (days < 30) return `Acum ${Math.floor(days / 7)} săptămâni`;

    return d.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
