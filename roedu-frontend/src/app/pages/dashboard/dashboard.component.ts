import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Bun venit, {{ professorName }}!</h1>
        <p class="subtitle">Panou de control - Profesor</p>
      </div>

      <div class="stats-grid">
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
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{ studentsCount }}</h3>
            <p>Elevi activi</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💬</div>
          <div class="stat-content">
            <h3>{{ commentsCount }}</h3>
            <p>Comentarii noi</p>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="content-section">
          <div class="section-header">
            <h2>Acțiuni rapide</h2>
          </div>
          <div class="action-cards">
            <a routerLink="/materials/new" class="action-card">
              <div class="action-icon">➕</div>
              <div class="action-content">
                <h3>Creează material</h3>
                <p>Adaugă un nou material educațional pentru elevi</p>
              </div>
            </a>

            <a routerLink="/quizzes/new" class="action-card">
              <div class="action-icon">📋</div>
              <div class="action-content">
                <h3>Creează chestionar</h3>
                <p>Dezvoltă un test interactiv pentru evaluare</p>
              </div>
            </a>

            <a routerLink="/materials" class="action-card">
              <div class="action-icon">📖</div>
              <div class="action-content">
                <h3>Gestionează materiale</h3>
                <p>Vizualizează și editează materialele tale</p>
              </div>
            </a>

            <a routerLink="/quizzes" class="action-card">
              <div class="action-icon">📊</div>
              <div class="action-content">
                <h3>Vezi rezultate</h3>
                <p>Analizează performanța elevilor la chestionare</p>
              </div>
            </a>
          </div>
        </div>

        <div class="content-section">
          <div class="section-header">
            <h2>Materiale recente</h2>
            <a routerLink="/materials" class="view-all">Vezi toate →</a>
          </div>
          <div class="recent-items">
            <div class="recent-item" *ngFor="let material of recentMaterials">
              <div class="item-icon">📄</div>
              <div class="item-content">
                <h4>{{ material.title }}</h4>
                <p class="item-meta">{{ material.subject }} • Clasa {{ material.gradeLevel }}</p>
              </div>
            </div>
            <div class="empty-state" *ngIf="recentMaterials.length === 0">
              <p>Nu aveți materiale create încă</p>
              <a routerLink="/materials/new" class="btn btn-primary">Creează primul material</a>
            </div>
          </div>
        </div>

        <div class="content-section">
          <div class="section-header">
            <h2>Notificări</h2>
          </div>
          <div class="notifications">
            <div class="notification-item">
              <div class="notification-icon">💬</div>
              <div class="notification-content">
                <p><strong>{{ pendingCommentsCount }}</strong> comentarii așteaptă aprobare</p>
                <span class="notification-time">Astăzi</span>
              </div>
            </div>

            <div class="notification-item">
              <div class="notification-icon">⏰</div>
              <div class="notification-content">
                <p><strong>{{ materialsNeedReview }}</strong> materiale necesită revizuire anuală</p>
                <span class="notification-time">Această săptămână</span>
              </div>
            </div>

            <div class="notification-item">
              <div class="notification-icon">📈</div>
              <div class="notification-content">
                <p>Ai avut <strong>{{ viewsThisWeek }}</strong> vizualizări la materiale săptămâna aceasta</p>
                <span class="notification-time">Săptămâna aceasta</span>
              </div>
            </div>
          </div>
        </div>

        <div class="content-section">
          <div class="section-header">
            <h2>Sfaturi utile</h2>
          </div>
          <div class="tips-section">
            <div class="tip-card">
              <div class="tip-icon">💡</div>
              <h4>Standardizare și colaborare</h4>
              <p>Utilizați tag-uri clare (profil, clasă, materie) pentru ca elevii din alte școli să găsească ușor materialele tale.</p>
            </div>

            <div class="tip-card">
              <div class="tip-icon">🎯</div>
              <h4>Revizuire anuală</h4>
              <p>Actualizează periodic materialele pentru a menține informațiile relevante și corecte.</p>
            </div>

            <div class="tip-card">
              <div class="tip-icon">🤝</div>
              <h4>Feedback constructiv</h4>
              <p>Răspunde la întrebările elevilor și oferă feedback la comentarii pentru a încuraja participarea.</p>
            </div>

            <div class="tip-card">
              <div class="tip-icon">🤖</div>
              <h4>Utilizează AI</h4>
              <p>Folosește funcția de generare automată pentru a crea chestionare rapid și eficient.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #6b7280;
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
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

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }

    .content-section {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f3f4f6;
    }

    .section-header h2 {
      font-size: 1.5rem;
      color: #1f2937;
      margin: 0;
    }

    .view-all {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .view-all:hover {
      text-decoration: underline;
    }

    .action-cards {
      display: grid;
      gap: 1rem;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .action-card:hover {
      border-color: #4f46e5;
      background: #f9fafb;
      transform: translateX(4px);
    }

    .action-icon {
      font-size: 2rem;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      border-radius: 0.5rem;
    }

    .action-content h3 {
      font-size: 1.1rem;
      color: #1f2937;
      margin: 0 0 0.25rem 0;
    }

    .action-content p {
      font-size: 0.9rem;
      color: #6b7280;
      margin: 0;
    }

    .recent-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .recent-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.5rem;
      transition: background 0.2s ease;
    }

    .recent-item:hover {
      background: #f3f4f6;
    }

    .item-icon {
      font-size: 1.5rem;
    }

    .item-content h4 {
      font-size: 1rem;
      color: #1f2937;
      margin: 0 0 0.25rem 0;
    }

    .item-meta {
      font-size: 0.85rem;
      color: #6b7280;
      margin: 0;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }

    .empty-state p {
      margin-bottom: 1rem;
    }

    .notifications {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 0.5rem;
    }

    .notification-icon {
      font-size: 1.5rem;
    }

    .notification-content {
      flex: 1;
    }

    .notification-content p {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
      font-size: 0.95rem;
    }

    .notification-time {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .tips-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .tip-card {
      padding: 1rem;
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      border-radius: 0.5rem;
    }

    .tip-icon {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .tip-card h4 {
      font-size: 1rem;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .tip-card p {
      font-size: 0.9rem;
      color: #4b5563;
      margin: 0;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-header h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  professorName: string = 'Profesor';
  
  // Statistics
  materialsCount: number = 12;
  quizzesCount: number = 8;
  studentsCount: number = 156;
  commentsCount: number = 5;
  
  // Notifications
  pendingCommentsCount: number = 5;
  materialsNeedReview: number = 3;
  viewsThisWeek: number = 234;
  
  // Recent materials
  recentMaterials: any[] = [
    { title: 'Ecuații de gradul al doilea', subject: 'Matematică', gradeLevel: 10 },
    { title: 'Romantismul în literatura română', subject: 'Română', gradeLevel: 11 },
    { title: 'Circuite electrice serie și paralel', subject: 'Fizică', gradeLevel: 9 }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.professorName = user.username || 'Profesor';
      }
    });
    
    // TODO: Load actual data from API
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // This method will be implemented to load real data from the backend
    // For now, we're using mock data
  }
}
