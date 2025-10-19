import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="notifications-bell">
      <button 
        class="bell-button" 
        (click)="toggleDropdown()"
        [class.has-notifications]="unreadCount > 0">
        <span class="bell-icon">🔔</span>
        @if (unreadCount > 0) {
          <span class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        }
      </button>

      @if (showDropdown) {
        <div class="notifications-dropdown" (click)="$event.stopPropagation()">
          <div class="dropdown-header">
            <h3>Notificări</h3>
            <div class="header-actions">
              @if (unreadCount > 0) {
                <button class="btn-mark-all" (click)="markAllAsRead()">
                  Marchează toate ca citite
                </button>
              }
              @if (notifications.length > 0) {
                <button class="btn-clear" (click)="clearAll()">
                  Șterge toate
                </button>
              }
            </div>
          </div>

          <div class="notifications-list">
            @if (loading) {
              <div class="loading-state">
                <div class="spinner"></div>
                <p>Se încarcă notificările...</p>
              </div>
            } @else if (notifications.length === 0) {
              <div class="empty-state">
                <span class="empty-icon">🔕</span>
                <p>Nu ai notificări noi</p>
              </div>
            } @else {
              @for (notification of notifications; track notification.id) {
                <div 
                  class="notification-item" 
                  [class.unread]="!notification.is_read"
                  (click)="handleNotificationClick(notification)">
                  <div class="notification-icon">
                    {{ getNotificationIcon(notification.type) }}
                  </div>
                  <div class="notification-content">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-message">{{ notification.message }}</div>
                    <div class="notification-time">{{ getRelativeTime(notification.created_at) }}</div>
                  </div>
                  @if (!notification.is_read) {
                    <div class="unread-dot"></div>
                  }
                  <button 
                    class="btn-delete-notification" 
                    (click)="deleteNotification(notification.id, $event)">
                    ×
                  </button>
                </div>
              }
            }
          </div>

          @if (notifications.length > 5) {
            <div class="dropdown-footer">
              <button class="btn-view-all" (click)="viewAllNotifications()">
                Vezi toate notificările
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-bell {
      position: relative;
      display: flex;
      align-items: center;
    }

    .bell-button {
      position: relative;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bell-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .bell-button.has-notifications {
      animation: ring 2s ease-in-out infinite;
    }

    @keyframes ring {
      0%, 100% { transform: rotate(0deg); }
      10%, 30% { transform: rotate(-10deg); }
      20%, 40% { transform: rotate(10deg); }
      50% { transform: rotate(0deg); }
    }

    .bell-icon {
      font-size: 1.5rem;
      display: block;
    }

    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: linear-gradient(135deg, #ff4757 0%, #ff6348 100%);
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.4rem;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
      box-shadow: 0 2px 6px rgba(255, 71, 87, 0.4);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .notifications-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      width: 420px;
      max-height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      z-index: 1001;
      overflow: hidden;
      animation: dropdownSlide 0.3s ease;
    }

    @keyframes dropdownSlide {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-header {
      padding: 1rem 1.25rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .dropdown-header h3 {
      margin: 0 0 0.75rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-mark-all,
    .btn-clear {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-mark-all:hover,
    .btn-clear:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .notifications-list {
      max-height: 450px;
      overflow-y: auto;
      background: #f9fafb;
    }

    .notifications-list::-webkit-scrollbar {
      width: 6px;
    }

    .notifications-list::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .notifications-list::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .notifications-list::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    .loading-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #6b7280;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
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
      padding: 3rem 1rem;
      color: #9ca3af;
    }

    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.5rem;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.95rem;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }

    .notification-item:hover {
      background: #f3f4f6;
    }

    .notification-item.unread {
      background: #eff6ff;
      border-left: 3px solid #3b82f6;
    }

    .notification-item.unread:hover {
      background: #dbeafe;
    }

    .notification-icon {
      font-size: 1.75rem;
      flex-shrink: 0;
      line-height: 1;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      color: #1f2937;
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
      line-height: 1.3;
    }

    .notification-message {
      color: #6b7280;
      font-size: 0.85rem;
      line-height: 1.4;
      margin-bottom: 0.35rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notification-time {
      color: #9ca3af;
      font-size: 0.75rem;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      background: #3b82f6;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 0.25rem;
    }

    .btn-delete-notification {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: transparent;
      border: none;
      color: #9ca3af;
      font-size: 1.5rem;
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s;
      opacity: 0;
    }

    .notification-item:hover .btn-delete-notification {
      opacity: 1;
    }

    .btn-delete-notification:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .dropdown-footer {
      padding: 0.75rem 1.25rem;
      background: white;
      border-top: 1px solid #e5e7eb;
    }

    .btn-view-all {
      width: 100%;
      padding: 0.75rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-view-all:hover {
      background: #5568d3;
    }

    @media (max-width: 768px) {
      .notifications-dropdown {
        width: calc(100vw - 2rem);
        max-width: 420px;
        right: -1rem;
      }
    }

    @media (max-width: 480px) {
      .notifications-dropdown {
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        width: 100%;
        max-width: none;
        max-height: calc(100vh - 60px);
        border-radius: 0;
      }
    }
  `]
})
export class NotificationsBellComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount: number = 0;
  showDropdown: boolean = false;
  loading: boolean = false;
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
        this.notifications = notifications.slice(0, 10); // Show last 10
      });

    // Subscribe to unread count
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });

    // Start polling for notifications
    this.notificationService.startPolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.notificationService.loadNotifications();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Close dropdown when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.notifications-bell')) {
      this.showDropdown = false;
    }
  }

  handleNotificationClick(notification: Notification): void {
    // Mark as read
    if (!notification.is_read) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }

    // Navigate to related item
    if (notification.related_type && notification.related_id) {
      this.showDropdown = false;
      
      switch (notification.related_type) {
        case 'material':
          this.router.navigate(['/materials', notification.related_id]);
          break;
        case 'quiz':
          this.router.navigate(['/quizzes', notification.related_id]);
          break;
        case 'comment':
          // Navigate to material with comment
          this.router.navigate(['/materials', notification.related_id]);
          break;
        default:
          console.log('Unknown related type:', notification.related_type);
      }
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        console.log('All notifications marked as read');
      },
      error: (err) => {
        console.error('Error marking all as read:', err);
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
        }
      });
    }
  }

  deleteNotification(notificationId: number, event: Event): void {
    event.stopPropagation();
    
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        console.log('Notification deleted');
      },
      error: (err) => {
        console.error('Error deleting notification:', err);
      }
    });
  }

  viewAllNotifications(): void {
    this.showDropdown = false;
    this.router.navigate(['/notifications']);
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
      month: 'short'
    });
  }
}
