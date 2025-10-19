import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../services/quiz.service';

interface QuizResult {
  attempt: any;
  correct_answers: { [key: number]: string[] };
  student_answers: { [key: number]: string[] | string };
  question_scores: { [key: number]: number };
  ai_evaluations?: { [key: number]: {
    ai_score: number;
    ai_feedback: string;
    ai_reasoning: string;
    ai_model_version: string;
    ai_score_breakdown?: { [key: string]: number };
    ai_strengths?: string[];
    ai_improvements?: string[];
    ai_suggestions?: string[];
  }};
}

@Component({
  selector: 'app-quiz-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="results-container">
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
      <div *ngIf="!isLoading && result" class="results-content">
        <!-- Header with Score -->
        <div class="results-header">
          <div class="score-box">
            <h1 class="score-value">{{ getScore() }}%</h1>
            <p class="score-label">Scor Final</p>
            <p class="score-details">{{ result.attempt.score }} din {{ result.attempt.max_score }} puncte</p>
          </div>
          <div class="status-box" [ngClass]="getScoreStatus()">
            <p class="status-text">{{ getStatusMessage() }}</p>
          </div>
        </div>

        <!-- Questions and Answers Review -->
        <div class="review-section">
          <h2>Revizuire răspunsuri</h2>
          
          <div *ngFor="let question of quiz?.questions; let i = index" class="question-review">
            <div class="question-header" [ngClass]="getQuestionClass(question.id)">
              <div class="question-number">
                <span class="badge" [ngClass]="getQuestionBadgeClass(question.id)">{{ i + 1 }}</span>
              </div>
              <div class="question-info">
                <h3>{{ question.question_text }}</h3>
                <p class="question-type">{{ getQuestionTypeLabel(question.question_type) }}</p>
              </div>
              <div class="question-score">
                <span class="points">{{ result.question_scores[question.id] }}/{{ question.points }} p</span>
              </div>
            </div>

            <div class="question-content">
              <!-- Show Correct Answers -->
              <div class="correct-answers">
                <h4>Răspunsuri corecte:</h4>
                <div *ngIf="question.question_type === 'free_text'" class="criteria">
                  <p>{{ question.evaluation_criteria || 'Evaluare cu AI' }}</p>
                </div>
                <div *ngIf="question.question_type !== 'free_text'" class="answers-list">
                  <div *ngFor="let answer of result.correct_answers[question.id]" class="answer correct">
                    ✓ {{ answer }}
                  </div>
                </div>
              </div>

              <!-- Show Student's Answers -->
              <div class="student-answers">
                <h4>Răspunsul tău:</h4>
                <div *ngIf="question.question_type === 'free_text'" class="free-text-answer">
                  <div class="text-box">{{ getStudentAnswer(question.id) }}</div>
                </div>
                <div *ngIf="question.question_type !== 'free_text'" class="answers-list">
                  <div *ngFor="let answer of getStudentAnswerArray(question.id)" 
                       class="answer" 
                       [ngClass]="isAnswerCorrect(question.id, answer) ? 'correct' : 'incorrect'">
                    {{ isAnswerCorrect(question.id, answer) ? '✓' : '✗' }} {{ answer }}
                  </div>
                </div>
              </div>

              <!-- AI Evaluation Feedback for Free Text -->
              <div *ngIf="question.question_type === 'free_text' && result.ai_evaluations?.[question.id]" class="ai-evaluation">
                <div class="ai-header">
                  <h4>🤖 Evaluare AI</h4>
                  <span class="ai-version">{{ result.ai_evaluations?.[question.id]?.ai_model_version }}</span>
                </div>
                
                <!-- Feedback -->
                <div class="ai-feedback">
                  <p>{{ result.ai_evaluations?.[question.id]?.ai_feedback }}</p>
                </div>

                <!-- Score Breakdown -->
                <div *ngIf="result.ai_evaluations?.[question.id]?.ai_score_breakdown" class="score-breakdown">
                  <h5>Detalii punctaj:</h5>
                  <div class="breakdown-items">
                    <div class="breakdown-item" *ngFor="let item of getScoreBreakdownItems(result.ai_evaluations?.[question.id]?.ai_score_breakdown)">
                      <span class="label">{{ item.label }}:</span>
                      <span class="value">{{ item.value }} puncte</span>
                    </div>
                  </div>
                </div>

                <!-- Strengths -->
                <div *ngIf="result.ai_evaluations?.[question.id]?.ai_strengths?.length" class="strengths">
                  <h5>✓ Puncte forte:</h5>
                  <ul>
                    <li *ngFor="let strength of result.ai_evaluations?.[question.id]?.ai_strengths">{{ strength }}</li>
                  </ul>
                </div>

                <!-- Areas for Improvement -->
                <div *ngIf="result.ai_evaluations?.[question.id]?.ai_improvements?.length" class="improvements">
                  <h5>⚠ Arii de îmbunătățire:</h5>
                  <ul>
                    <li *ngFor="let improvement of result.ai_evaluations?.[question.id]?.ai_improvements">{{ improvement }}</li>
                  </ul>
                </div>

                <!-- Suggestions -->
                <div *ngIf="result.ai_evaluations?.[question.id]?.ai_suggestions?.length" class="suggestions">
                  <h5>💡 Sugestii pentru învățare:</h5>
                  <ul>
                    <li *ngFor="let suggestion of result.ai_evaluations?.[question.id]?.ai_suggestions">{{ suggestion }}</li>
                  </ul>
                </div>

                <!-- Report AI Evaluation Button -->
                <div class="report-ai-actions">
                  <button class="btn btn-warning" (click)="openReportForm(question.id)">
                    🚩 Raportează Evaluare AI
                  </button>
                </div>

                <!-- Report AI Evaluation Form -->
                <div *ngIf="isReportingQuestion === question.id" class="report-ai-form">
                  <h5>🚩 Raportează Evaluare AI</h5>
                  <p class="form-help">Explică de ce crezi că evaluarea AI nu e corectă</p>
                  <textarea 
                    [(ngModel)]="reportReason"
                    placeholder="Explică motivul raportării..."
                    rows="4"
                    class="form-textarea">
                  </textarea>
                  <div class="form-actions">
                    <button class="btn btn-secondary" (click)="cancelReport()">
                      ✕ Anulează
                    </button>
                    <button class="btn btn-primary" (click)="submitReportEvaluation(question.id)">
                      ✓ Trimite Raport
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn btn-secondary" (click)="goBackToQuizzes()">
            ← Înapoi la teste
          </button>
          <button class="btn btn-primary" (click)="downloadResults()">
            ⬇ Descarcă rezultate
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .results-container {
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
      max-width: 900px;
      margin: 0 auto;
    }

    .results-header {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }

    .score-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 8px;
      flex: 1;
      text-align: center;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .score-value {
      margin: 0 0 10px 0;
      font-size: 60px;
      font-weight: 700;
    }

    .score-label {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }

    .score-details {
      margin: 10px 0 0 0;
      font-size: 12px;
      opacity: 0.8;
    }

    .status-box {
      padding: 40px;
      border-radius: 8px;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 18px;
    }

    .status-box.excellent {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .status-box.good {
      background: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    .status-box.fair {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }

    .status-box.poor {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .status-text {
      margin: 0;
    }

    .review-section {
      background: white;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .review-section h2 {
      margin: 0 0 20px 0;
      font-size: 20px;
      color: #333;
    }

    .question-review {
      margin-bottom: 30px;
      border-left: 4px solid #667eea;
      background: #f9f9f9;
      border-radius: 4px;
      overflow: hidden;
    }

    .question-header {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      padding: 15px 20px;
      background: #fff;
    }

    .question-header.correct {
      background: #f0f8f4;
    }

    .question-header.incorrect {
      background: #fef4f2;
    }

    .question-number {
      flex-shrink: 0;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #667eea;
      color: white;
      font-weight: 600;
      font-size: 14px;
    }

    .badge.correct {
      background: #4caf50;
    }

    .badge.incorrect {
      background: #f44336;
    }

    .question-info {
      flex: 1;
    }

    .question-info h3 {
      margin: 0 0 5px 0;
      font-size: 16px;
      color: #333;
    }

    .question-type {
      margin: 0;
      font-size: 12px;
      color: #999;
    }

    .question-score {
      flex-shrink: 0;
      text-align: right;
    }

    .points {
      display: inline-block;
      background: #e8f0ff;
      color: #667eea;
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .question-content {
      padding: 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .correct-answers, .student-answers {
      padding: 15px;
      background: white;
      border-radius: 4px;
    }

    .correct-answers h4, .student-answers h4 {
      margin: 0 0 10px 0;
      font-size: 13px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .answers-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .answer {
      padding: 10px 12px;
      border-radius: 4px;
      font-size: 13px;
      background: #f0f0f0;
    }

    .answer.correct {
      background: #e8f5e9;
      color: #2e7d32;
      border-left: 3px solid #4caf50;
    }

    .answer.incorrect {
      background: #ffebee;
      color: #c62828;
      border-left: 3px solid #f44336;
    }

    .free-text-answer {
      padding: 15px;
      background: #f9f9f9;
      border-radius: 4px;
    }

    .text-box {
      padding: 12px;
      background: white;
      border-radius: 4px;
      font-size: 13px;
      line-height: 1.6;
      max-height: 200px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .criteria {
      padding: 12px;
      background: #fff9c4;
      border-left: 3px solid #fbc02d;
      border-radius: 4px;
      font-size: 13px;
    }

    .criteria p {
      margin: 0;
    }

    .ai-evaluation {
      grid-column: 1 / -1;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 8px;
      border-left: 4px solid #667eea;
      margin-top: 15px;
    }

    .ai-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }

    .ai-header h4 {
      margin: 0;
      font-size: 16px;
      color: #667eea;
      font-weight: 600;
    }

    .ai-version {
      background: #667eea;
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }

    .ai-feedback {
      background: white;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 15px;
      line-height: 1.6;
      color: #333;
      font-size: 14px;
    }

    .score-breakdown {
      background: white;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 15px;
    }

    .score-breakdown h5 {
      margin: 0 0 12px 0;
      font-size: 13px;
      color: #667eea;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .breakdown-items {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
    }

    .breakdown-item {
      background: #f9f9f9;
      padding: 10px 12px;
      border-radius: 4px;
      border-left: 3px solid #667eea;
    }

    .breakdown-item .label {
      display: block;
      font-size: 12px;
      color: #999;
      text-transform: capitalize;
    }

    .breakdown-item .value {
      display: block;
      font-size: 16px;
      font-weight: 600;
      color: #667eea;
    }

    .strengths,
    .improvements,
    .suggestions {
      background: white;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 15px;
    }

    .strengths h5 {
      margin: 0 0 12px 0;
      font-size: 13px;
      color: #4caf50;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .improvements h5 {
      margin: 0 0 12px 0;
      font-size: 13px;
      color: #ff9800;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .suggestions h5 {
      margin: 0 0 12px 0;
      font-size: 13px;
      color: #2196f3;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .strengths ul,
    .improvements ul,
    .suggestions ul {
      margin: 0;
      padding-left: 20px;
      list-style: none;
    }

    .strengths li,
    .improvements li,
    .suggestions li {
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;
      font-size: 13px;
      line-height: 1.5;
      color: #333;
    }

    .strengths li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #4caf50;
      font-weight: 600;
    }

    .improvements li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #ff9800;
      font-weight: 600;
    }

    .suggestions li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: #2196f3;
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      margin-top: 30px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      flex: 1;
    }

    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #f0f0f0;
      color: #333;
      flex: 1;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .report-ai-actions {
      margin-top: 15px;
      text-align: right;
    }

    .report-ai-form {
      margin-top: 20px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 6px;
      border: 1px solid #eee;
    }

    .report-ai-form h5 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 15px;
      color: #333;
    }

    .form-help {
      font-size: 12px;
      color: #666;
      margin-bottom: 10px;
    }

    .form-textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 13px;
      line-height: 1.6;
      resize: vertical;
      min-height: 80px;
      box-sizing: border-box;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 15px;
    }

    @media (max-width: 768px) {
      .results-header {
        flex-direction: column;
      }

      .question-header {
        flex-direction: column;
      }

      .question-content {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class QuizResultsComponent implements OnInit {
  result: QuizResult | null = null;
  quiz: any = null;
  isLoading = true;
  errorMessage: string | null = null;
  isReportingQuestion: number | null = null;
  reportReason: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const attemptId = this.route.snapshot.params['id'];
    if (attemptId) {
      this.loadResults(attemptId);
    }
  }

  private loadResults(attemptId: number): void {
    this.quizService.getAttemptResult(attemptId).subscribe({
      next: (result) => {
        this.result = result;
        this.loadQuizDetails(result.attempt.quiz_id);
        this.isLoading = false;
      },
      error: (error) => {
        // Check if it's an authentication error
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Trebuie să fii logat pentru a vedea rezultatele.';
          setTimeout(() => {
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
          }, 2000);
        } else {
          this.errorMessage = 'Nu s-au putut încărca rezultatele. Te rog încearcă din nou.';
        }
        this.isLoading = false;
      }
    });
  }

  private loadQuizDetails(quizId: number): void {
    this.quizService.getQuiz(quizId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
      },
      error: () => {
        console.error('Nu s-a putut încărca testul');
      }
    });
  }

  getScore(): number {
    if (!this.result) return 0;
    return Math.round((this.result.attempt.score / this.result.attempt.max_score) * 100);
  }

  getScoreStatus(): string {
    const score = this.getScore();
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  getStatusMessage(): string {
    const status = this.getScoreStatus();
    switch (status) {
      case 'excellent': return '🎉 Excelent! Ai înțeles bine!';
      case 'good': return '👍 Bun! Ai înțeles major!';
      case 'fair': return '📚 Bine, dar mai sunt lucruri de invatat!';
      default: return '💪 Continua sa inveti!';
    }
  }

  getQuestionClass(questionId: number): string {
    if (!this.result) return '';
    const score = this.result.question_scores[questionId];
    return score > 0 ? 'correct' : 'incorrect';
  }

  getQuestionBadgeClass(questionId: number): string {
    if (!this.result) return '';
    const score = this.result.question_scores[questionId];
    return score > 0 ? 'correct' : 'incorrect';
  }

  getStudentAnswer(questionId: number): string {
    if (!this.result) return '';
    const answer = this.result.student_answers[questionId];
    return Array.isArray(answer) ? answer[0] : answer;
  }

  getStudentAnswerArray(questionId: number): string[] {
    if (!this.result) return [];
    const answer = this.result.student_answers[questionId];
    return Array.isArray(answer) ? answer : [answer];
  }

  isAnswerCorrect(questionId: number, answer: string): boolean {
    if (!this.result) return false;
    return this.result.correct_answers[questionId].includes(answer);
  }

  getQuestionTypeLabel(type: string): string {
    switch (type) {
      case 'single_choice': return '🔘 Grila - 1 Răspuns';
      case 'multiple_choice': return '☑️ Grila - Multiple';
      case 'free_text': return '✏️ Răspuns Liber';
      default: return type;
    }
  }

  goBackToQuizzes(): void {
    this.router.navigate(['/quizzes']);
  }

  downloadResults(): void {
    // Placeholder for PDF download functionality
    alert('Funcționalitate în dezvoltare');
  }

  getScoreBreakdownItems(breakdown: { [key: string]: number } | undefined): { label: string, value: number }[] {
    if (!breakdown) return [];
    return Object.entries(breakdown).map(([label, value]) => ({ label, value }));
  }

  openReportForm(questionId: number): void {
    this.isReportingQuestion = questionId;
    this.reportReason = '';
  }

  cancelReport(): void {
    this.isReportingQuestion = null;
    this.reportReason = '';
  }

  submitReportEvaluation(questionId: number): void {
    if (!this.reportReason.trim()) {
      alert('Te rog să introduci un motiv pentru raportarea evaluării AI.');
      return;
    }

    if (!this.result?.attempt?.id) {
      alert('ID-ul tentativei nu a putut fi găsit.');
      return;
    }

    this.quizService.reportAIEvaluation(this.result.attempt.id, questionId, this.reportReason).subscribe({
      next: () => {
        alert('Evaluarea AI a fost raportată cu succes!');
        this.isReportingQuestion = null;
        this.reportReason = '';
      },
      error: (error) => {
        console.error('Eroare la raportarea evaluării AI:', error);
        alert('Nu s-a putut raporta evaluarea AI. Te rog încearcă din nou.');
      }
    });
  }
}
