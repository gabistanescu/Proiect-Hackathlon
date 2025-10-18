import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../services/quiz.service';

interface QuizAttempt {
  id: number;
  student_id: number;
  score: number;
  max_score: number;
  started_at: string;
  completed_at: string;
  student_name?: string;
}

@Component({
  selector: 'app-quiz-results-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="results-list-container">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Se încarcă rezultatele...</p>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage && !isLoading" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <!-- Results Content -->
      <div *ngIf="!isLoading && attempts" class="results-content">
        <!-- Header -->
        <div class="results-header">
          <button class="btn btn-secondary" (click)="goBack()">← Înapoi</button>
          <h1>Rezultate Test: {{ quizTitle }}</h1>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">Tentative:</span>
              <span class="stat-value">{{ attempts.length }}</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="attempts.length === 0" class="empty-state">
          <p>📭 Niciun student nu a completat testul</p>
        </div>

        <!-- Results Table -->
        <div *ngIf="attempts.length > 0" class="results-table-wrapper">
          <table class="results-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Scor</th>
                <th>Procent</th>
                <th>Data Inceput</th>
                <th>Data Finalizare</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let attempt of attempts; let i = index" [ngClass]="getRowClass(attempt)">
                <td class="num">{{ i + 1 }}</td>
                <td class="student-name">{{ attempt.student_name || 'Elev ' + attempt.student_id }}</td>
                <td class="score">
                  {{ attempt.score }}/{{ attempt.max_score }}
                </td>
                <td class="percent">
                  <span class="badge" [ngClass]="getScoreBadgeClass(attempt)">
                    {{ getScorePercent(attempt) }}%
                  </span>
                </td>
                <td class="date">{{ formatDate(attempt.started_at) }}</td>
                <td class="date">{{ formatDate(attempt.completed_at) }}</td>
                <td class="actions">
                  <button class="btn btn-sm btn-primary" (click)="viewDetails(attempt.id)">
                    Detalii
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .results-list-container {
      min-height: 100vh;
      background: #f5f5f5;
      padding: 20px;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 20px;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #eee;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .alert {
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .alert-danger {
      background-color: #fee;
      border: 1px solid #fcc;
      color: #c33;
    }

    .results-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .results-header {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }

    .results-header h1 {
      margin: 0;
      font-size: 24px;
      flex: 1;
      text-align: center;
    }

    .stats {
      display: flex;
      gap: 20px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-label {
      font-size: 12px;
      color: #999;
      font-weight: 600;
      text-transform: uppercase;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
    }

    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary {
      background: #f0f0f0;
      color: #333;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5568d3;
    }

    .empty-state {
      background: white;
      border-radius: 8px;
      padding: 60px 20px;
      text-align: center;
      color: #999;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .results-table-wrapper {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow-x: auto;
    }

    .results-table {
      width: 100%;
      border-collapse: collapse;
    }

    .results-table thead {
      background: #f9f9f9;
      border-bottom: 2px solid #eee;
    }

    .results-table th {
      padding: 16px;
      text-align: left;
      font-weight: 600;
      color: #666;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .results-table td {
      padding: 16px;
      border-bottom: 1px solid #eee;
    }

    .results-table tbody tr:hover {
      background: #f9f9f9;
    }

    .num {
      color: #999;
      width: 40px;
      text-align: center;
    }

    .student-name {
      font-weight: 600;
      color: #333;
    }

    .score {
      font-weight: 600;
      color: #667eea;
    }

    .percent {
      text-align: center;
    }

    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge.excellent {
      background: #d4edda;
      color: #155724;
    }

    .badge.good {
      background: #d1ecf1;
      color: #0c5460;
    }

    .badge.fair {
      background: #fff3cd;
      color: #856404;
    }

    .badge.poor {
      background: #f8d7da;
      color: #721c24;
    }

    .date {
      color: #999;
      font-size: 13px;
    }

    .actions {
      text-align: center;
    }

    @media (max-width: 768px) {
      .results-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .results-header h1 {
        text-align: left;
      }

      .results-table {
        font-size: 12px;
      }

      .results-table th,
      .results-table td {
        padding: 8px;
      }
    }
  `]
})
export class QuizResultsListComponent implements OnInit {
  attempts: QuizAttempt[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  quizTitle = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const quizId = this.route.snapshot.params['id'];
    if (quizId) {
      this.loadResults(quizId);
      this.loadQuizTitle(quizId);
    }
  }

  private loadResults(quizId: number): void {
    this.quizService.getQuizAttempts(quizId).subscribe({
      next: (attempts) => {
        this.attempts = attempts;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Nu s-au putut încărca rezultatele. Te rog încearcă din nou.';
        this.isLoading = false;
      }
    });
  }

  private loadQuizTitle(quizId: number): void {
    this.quizService.getQuiz(quizId).subscribe({
      next: (quiz) => {
        this.quizTitle = quiz.title;
      },
      error: () => {
        console.error('Nu s-a putut încărca titlul testului');
      }
    });
  }

  getScorePercent(attempt: QuizAttempt): number {
    return Math.round((attempt.score / attempt.max_score) * 100);
  }

  getScoreBadgeClass(attempt: QuizAttempt): string {
    const percent = this.getScorePercent(attempt);
    if (percent >= 90) return 'excellent';
    if (percent >= 75) return 'good';
    if (percent >= 50) return 'fair';
    return 'poor';
  }

  getRowClass(attempt: QuizAttempt): string {
    const percent = this.getScorePercent(attempt);
    if (percent >= 90) return 'excellent';
    if (percent >= 75) return 'good';
    if (percent >= 50) return 'fair';
    return 'poor';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  viewDetails(attemptId: number): void {
    this.router.navigate(['/quizzes/results', attemptId]);
  }

  goBack(): void {
    this.router.navigate(['/quizzes']);
  }
}
