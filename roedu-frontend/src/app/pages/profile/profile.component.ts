import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="profile-container">
      <!-- Profile Header Section -->
      <div class="profile-header">
        <div class="profile-avatar-large">
          <span class="avatar-text">{{ (username || 'U').charAt(0).toUpperCase() }}</span>
        </div>
        <div class="profile-info">
          <h1>{{ username }}</h1>
          <p class="role-badge" [ngClass]="getRoleBadgeClass()">
            {{ getRoleLabel() }}
          </p>
        </div>
      </div>

      <!-- Profile Data Section -->
      <div class="profile-data-section">
        <div class="section-header">
          <h2>Informații profil</h2>
        </div>
        <div class="data-grid">
          <div class="data-item">
            <span class="data-label">Nume utilizator:</span>
            <span class="data-value">{{ username }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Email:</span>
            <span class="data-value">{{ email }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Puncte acumulate:</span>
            <span class="data-value points">⭐ {{ userPoints }}</span>
          </div>
          <div class="data-item" *ngIf="userRole === 'student'">
            <span class="data-label">Clasă:</span>
            <span class="data-value">{{ gradeLevel || 'Nespecificat' }}</span>
          </div>
          <div class="data-item" *ngIf="userRole === 'professor'">
            <span class="data-label">Specializare:</span>
            <span class="data-value">{{ specialization || 'Nespecificat' }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Membru din:</span>
            <span class="data-value">{{ formatDate(joinDate) }}</span>
          </div>
        </div>
      </div>

      <!-- Dashboard Section -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2>{{ getDashboardTitle() }}</h2>
        </div>

        <!-- Statistics Grid -->
        <div class="stats-grid">
          <!-- Student Stats -->
          <ng-container *ngIf="userRole === 'student'">
            <div class="stat-card">
              <div class="stat-icon">📚</div>
              <div class="stat-content">
                <h3>{{ savedMaterialsCount }}</h3>
                <p>Materiale salvate</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <h3>{{ completedQuizzesCount }}</h3>
                <p>Teste completate</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <h3>{{ averageScore }}%</h3>
                <p>Scor mediu</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💬</div>
              <div class="stat-content">
                <h3>{{ commentsCount }}</h3>
                <p>Comentarii postate</p>
              </div>
            </div>
          </ng-container>

          <!-- Professor Stats -->
          <ng-container *ngIf="userRole === 'professor'">
            <div class="stat-card">
              <div class="stat-icon">📚</div>
              <div class="stat-content">
                <h3>{{ materialsCount }}</h3>
                <p>Materiale create</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📝</div>
              <div class="stat-content">
                <h3>{{ quizzesCount }}</h3>
                <p>Chestionare active</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">👁️</div>
              <div class="stat-content">
                <h3>{{ totalViews }}</h3>
                <p>Vizualizări totale</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💬</div>
              <div class="stat-content">
                <h3>{{ commentsCount }}</h3>
                <p>Comentarii primite</p>
              </div>
            </div>
          </ng-container>

          <!-- Admin Stats -->
          <ng-container *ngIf="userRole === 'administrator'">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <h3>{{ totalUsers }}</h3>
                <p>Utilizatori activi</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📚</div>
              <div class="stat-content">
                <h3>{{ totalMaterials }}</h3>
                <p>Materiale în platformă</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📝</div>
              <div class="stat-content">
                <h3>{{ totalQuizzes }}</h3>
                <p>Chestionare totale</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⏰</div>
              <div class="stat-content">
                <h3>{{ pendingApprovals }}</h3>
                <p>Aprobări în așteptare</p>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Recent Activity -->
        <div class="content-section recent-activity-section">
          <div class="section-header">
            <h3>Activitate recentă</h3>
          </div>
          <div class="activity-list">
            <ng-container *ngIf="recentActivities.length > 0">
              <div class="activity-item" *ngFor="let activity of recentActivities">
                <div class="activity-icon">{{ activity.icon }}</div>
                <div class="activity-content">
                  <p>{{ activity.text }}</p>
                  <span class="activity-time">{{ activity.time }}</span>
                </div>
              </div>
            </ng-container>
            <div class="empty-state" *ngIf="recentActivities.length === 0">
              <p>Nu există activitate recentă</p>
              <p class="note">� Activitățile tale vor apărea aici pe măsură ce interacționezi cu platforma</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .profile-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 1rem;
      padding: 3rem 2rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .profile-avatar-large {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: 700;
      color: #1f2937;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .profile-info h1 {
      color: white;
      font-size: 2.5rem;
      margin: 0 0 0.5rem 0;
    }

    .role-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-weight: 600;
      font-size: 0.9rem;
      margin: 0;
    }

    .role-badge.student {
      background: #dbeafe;
      color: #1e40af;
    }

    .role-badge.professor {
      background: #d1fae5;
      color: #065f46;
    }

    .role-badge.administrator {
      background: #fce7f3;
      color: #9f1239;
    }

    .profile-data-section {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f3f4f6;
    }

    .section-header h2,
    .section-header h3 {
      font-size: 1.5rem;
      color: #1f2937;
      margin: 0;
    }

    .data-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .data-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .data-label {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }

    .data-value {
      font-size: 1.125rem;
      color: #1f2937;
      font-weight: 600;
    }

    .data-value.points {
      color: #f59e0b;
      font-size: 1.25rem;
    }

    .dashboard-section {
      margin-top: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      font-size: 2.5rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      border-radius: 0.5rem;
    }

    .stat-content h3 {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .stat-content p {
      color: #6b7280;
      margin: 0;
      font-size: 0.9rem;
    }

    .recent-activity-section {
      background: white;
      padding: 2rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.5rem;
    }

    .activity-icon {
      font-size: 1.5rem;
    }

    .activity-content p {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
      font-size: 0.95rem;
    }

    .activity-time {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }

    .empty-state .note {
      font-size: 0.875rem;
      color: #9ca3af;
      margin-top: 0.5rem;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .profile-header {
        flex-direction: column;
        text-align: center;
        padding: 2rem 1rem;
      }

      .profile-avatar-large {
        width: 100px;
        height: 100px;
        font-size: 2.5rem;
      }

      .profile-info h1 {
        font-size: 2rem;
      }

      .data-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  username: string = '';
  email: string = '';
  userRole: string | null = null;
  userPoints: number = 0;
  gradeLevel: string = '';
  specialization: string = '';
  joinDate: Date = new Date();

  // Student stats
  savedMaterialsCount: number = 0;
  completedQuizzesCount: number = 0;
  averageScore: number = 0;

  // Professor stats
  materialsCount: number = 0;
  quizzesCount: number = 0;
  totalViews: number = 0;

  // Admin stats
  totalUsers: number = 0;
  totalMaterials: number = 0;
  totalQuizzes: number = 0;
  pendingApprovals: number = 0;

  // Common
  commentsCount: number = 0;
  recentActivities: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.username = user.username || '';
        this.email = user.email || '';
        this.userRole = user.role;
        // TODO: Get actual points from user object when backend supports it
        this.userPoints = 0;
        
        this.loadUserData();
      }
    });
  }

  loadUserData(): void {
    // TODO: Replace mock data with actual backend API calls
    // The statistics and activities below are currently HARDCODED for demonstration
    // 
    // Real implementation should:
    // 1. Fetch user stats from backend (materials count, quiz attempts, etc.)
    // 2. Fetch recent activities from an activity log table/endpoint
    //    - Backend should track user actions (created material, took quiz, posted comment, etc.)
    //    - Each activity should have: type, description, timestamp, related entity ID
    //    - API endpoint example: GET /api/v1/users/{id}/activities?limit=10
    // 3. Calculate aggregate data (average scores, total views, etc.)
    
    if (this.userRole === 'student') {
      // Mock data - replace with API calls
      this.savedMaterialsCount = 15;
      this.completedQuizzesCount = 23;
      this.averageScore = 87;
      this.commentsCount = 12;
      this.gradeLevel = '10';
      
      // HARDCODED activities - should come from backend activity log
      this.recentActivities = [
        { icon: '✅', text: 'Ai completat testul "Ecuații de gradul al doilea"', time: 'Acum 2 ore' },
        { icon: '💾', text: 'Ai salvat materialul "Romantismul în literatura română"', time: 'Ieri' },
        { icon: '💬', text: 'Ai postat un comentariu la "Circuite electrice"', time: 'Acum 3 zile' }
      ];
    } else if (this.userRole === 'professor') {
      // Mock data - replace with API calls
      this.materialsCount = 12;
      this.quizzesCount = 8;
      this.totalViews = 1247;
      this.commentsCount = 45;
      this.specialization = 'Matematică';
      
      // HARDCODED activities - should come from backend activity log
      this.recentActivities = [
        { icon: '📚', text: 'Ai creat materialul "Funcții trigonometrice"', time: 'Acum 1 zi' },
        { icon: '📝', text: 'Ai creat chestionarul "Algebra - Test final"', time: 'Acum 2 zile' },
        { icon: '💬', text: 'Ai primit 5 comentarii noi', time: 'Acum 3 zile' }
      ];
    } else if (this.userRole === 'administrator') {
      // Mock data - replace with API calls
      this.totalUsers = 1523;
      this.totalMaterials = 456;
      this.totalQuizzes = 234;
      this.pendingApprovals = 7;
      this.commentsCount = 89;
      
      // HARDCODED activities - should come from backend activity log
      this.recentActivities = [
        { icon: '✅', text: 'Ai aprobat 3 materiale noi', time: 'Acum 1 oră' },
        { icon: '👥', text: 'S-au înregistrat 12 utilizatori noi', time: 'Astăzi' },
        { icon: '🛡️', text: 'Ai rezolvat 2 raportări', time: 'Ieri' }
      ];
    }
  }

  getRoleLabel(): string {
    switch (this.userRole) {
      case 'student':
        return 'Elev';
      case 'professor':
        return 'Profesor';
      case 'administrator':
        return 'Administrator';
      default:
        return 'Utilizator';
    }
  }

  getRoleBadgeClass(): string {
    return this.userRole || '';
  }

  getDashboardTitle(): string {
    switch (this.userRole) {
      case 'student':
        return 'Progresul meu';
      case 'professor':
        return 'Panou de control - Profesor';
      case 'administrator':
        return 'Panou de control - Administrator';
      default:
        return 'Panou de control';
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }
}
