import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../services/quiz.service';
import { Quiz, QuestionType } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quizzes-container">
      <div class="page-header">
        <h1>📝 Chestionare</h1>
        <button *ngIf="userRole === 'professor'" class="btn btn-primary" (click)="createQuiz()">
          ➕ Creeaza Test
        </button>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
        <button class="close-alert" (click)="errorMessage = null">×</button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Se încarcă chestionarele...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && quizzes.length === 0" class="empty-state">
        <p>📭 Nu sunt chestionare disponibile</p>
      </div>

      <!-- Quizzes Grid -->
      <div *ngIf="!isLoading && quizzes.length > 0" class="quizzes-grid">
        <div *ngFor="let quiz of quizzes" class="quiz-card">
          <div class="card-header">
            <h3>{{ quiz.title }}</h3>
            <span class="question-count">{{ getQuestionCount(quiz) }} întrebări</span>
          </div>

          <div class="card-body">
            <p class="description" *ngIf="quiz.description">{{ quiz.description }}</p>

            <div class="quiz-info">
              <div class="info-item" *ngIf="quiz.subject">
                <span class="info-label">📚 Materie:</span>
                <span class="info-value">{{ quiz.subject || 'N/A' }}</span>
              </div>

              <div class="info-item" *ngIf="quiz.grade_level">
                <span class="info-label">🎓 Clasa:</span>
                <span class="info-value">{{ quiz.grade_level }}</span>
              </div>

              <div class="info-item" *ngIf="quiz.time_limit">
                <span class="info-label">⏱️ Timp:</span>
                <span class="info-value">{{ quiz.time_limit }} min</span>
              </div>

              <div class="info-item">
                <span class="info-label">⭐ Puncte:</span>
                <span class="info-value">{{ quiz.total_points }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button (click)="takeQuiz(quiz.id)" class="btn btn-success">
                ▶️ Rezolva Test
              </button>
              <button *ngIf="userRole === 'professor'" (click)="editQuiz(quiz.id)" class="btn btn-warning">
                ✏️ Editeaza
              </button>
              <button *ngIf="userRole === 'professor'" (click)="viewResults(quiz.id)" class="btn btn-info">
                📊 Rezultate
              </button>
              <button *ngIf="userRole === 'professor'" (click)="deleteQuiz(quiz.id)" class="btn btn-danger">
                🗑️ Sterge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quizzes-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #667eea;
    }

    .page-header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
      color: #333;
    }

    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .btn-success {
      background: #4caf50;
      color: white;
    }

    .btn-success:hover {
      background: #45a049;
    }

    .btn-warning {
      background: #ff9800;
      color: white;
    }

    .btn-warning:hover {
      background: #e68900;
    }

    .btn-info {
      background: #00bcd4;
      color: white;
    }

    .btn-info:hover {
      background: #00acc1;
    }

    .btn-danger {
      background: #ff6b6b;
      color: white;
    }

    .btn-danger:hover {
      background: #ff5252;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .alert-danger {
      background-color: #fee;
      border: 1px solid #fcc;
      color: #c33;
    }

    .close-alert {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: inherit;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      gap: 20px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #eee;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
      font-size: 18px;
    }

    .quizzes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .quiz-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
    }

    .quiz-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .card-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      flex: 1;
    }

    .question-count {
      background: rgba(255, 255, 255, 0.3);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }

    .card-body {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .description {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.4;
    }

    .quiz-info {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 12px;
      flex: 1;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 13px;
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .info-label {
      color: #666;
      font-weight: 500;
    }

    .info-value {
      color: #333;
      font-weight: 600;
    }

    .card-footer {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .card-footer .btn {
      flex: 0 0 auto;
      min-width: auto;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }

      .page-header h1 {
        font-size: 24px;
      }

      .quizzes-grid {
        grid-template-columns: 1fr;
      }

      .card-footer {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class QuizListComponent implements OnInit {
  quizzes: Quiz[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  userRole: string | null = null;

  QuestionType = QuestionType;

  constructor(
    private quizService: QuizService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
    this.userRole = localStorage.getItem('role');
  }

  private loadQuizzes(): void {
    this.isLoading = true;
    this.quizService.getQuizzes().subscribe({
      next: (data: any) => {
        this.quizzes = Array.isArray(data) ? data : (data.quizzes || []);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Nu s-au putut încărca chestionarele';
        this.isLoading = false;
      }
    });
  }

  createQuiz(): void {
    this.router.navigate(['/quizzes/create']);
  }

  editQuiz(quizId: number): void {
    this.router.navigate([`/quizzes/${quizId}/edit`]);
  }

  takeQuiz(quizId: number): void {
    this.router.navigate([`/quizzes/${quizId}/take`]);
  }

  viewResults(quizId: number): void {
    this.router.navigate([`/quizzes/${quizId}/results`]);
  }

  deleteQuiz(quizId: number): void {
    if (confirm('Ești sigur că vrei să ștergi acest test?')) {
      this.quizService.deleteQuiz(quizId).subscribe({
        next: () => {
          this.loadQuizzes();
        },
        error: () => {
          this.errorMessage = 'Nu s-a putut șterge testul';
        }
      });
    }
  }

  getQuestionTypeLabel(type: QuestionType): string {
    switch (type) {
      case QuestionType.SINGLE_CHOICE:
        return 'Grila - 1 Răspuns';
      case QuestionType.MULTIPLE_CHOICE:
        return 'Grila - Multiple';
      case QuestionType.FREE_TEXT:
        return 'Răspuns Liber';
      default:
        return type;
    }
  }

  getQuestionCount(quiz: Quiz): number {
    return quiz.questions?.length || 0;
  }
}
