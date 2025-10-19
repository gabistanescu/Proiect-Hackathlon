import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../services/quiz.service';
import { Quiz, Question, QuestionType } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz-take',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="quiz-take-container">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Se încarcă testul...</p>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage && !isLoading" class="alert alert-danger">
        {{ errorMessage }}
        <button class="close-alert" (click)="errorMessage = null">×</button>
      </div>

      <!-- Quiz Content -->
      <div *ngIf="!isLoading && quiz" class="quiz-content">
        <!-- Header -->
        <div class="quiz-header">
          <div>
            <h2>{{ quiz.title }}</h2>
            <p class="quiz-description" *ngIf="quiz?.description">{{ quiz!.description }}</p>
          </div>
          <div class="timer-box" *ngIf="quiz.time_limit && quiz.time_limit > 0">
            <div class="timer">{{ getTimeDisplay() }}</div>
            <p class="timer-label">Timp rămas</p>
          </div>
        </div>

        <div class="quiz-main">
          <!-- Question Navigator Sidebar -->
          <div class="navigator-sidebar">
            <h3>Întrebări</h3>
            <div class="question-navigator">
              <button *ngFor="let q of quiz.questions; let i = index"
                     class="nav-button"
                     [class.active]="currentQuestionIndex === i"
                     [class.answered]="answersFormArray.at(i)?.value"
                     (click)="goToQuestion(i)">
                {{ i + 1 }}
              </button>
            </div>
          </div>

          <!-- Main Question Area -->
          <div class="main-content">
            <!-- Question -->
            <div *ngIf="currentQuestion" class="question-section">
              <div class="question-header-info">
                <h4>Întrebarea {{ currentQuestionIndex + 1 }} din {{ quiz?.questions?.length }}</h4>
                <span class="question-type" *ngIf="currentQuestion">
                  {{ getQuestionTypeLabel(currentQuestion.question_type) }}
                </span>
              </div>

              <h3 class="question-text">{{ currentQuestion?.question_text }}</h3>

              <!-- Question Type: Grila (Single Choice) -->
              <div *ngIf="currentQuestion?.question_type === QuestionType.SINGLE_CHOICE" class="options">
                <div *ngFor="let option of getGrilaOptions(currentQuestion)" class="option">
                  <label class="radio-label">
                    <input type="radio" 
                           name="single"
                           [value]="option"
                           [formControl]="getFormControl(currentQuestionIndex)"
                           (change)="toggleOption(currentQuestion, option)">
                    <span class="radio-custom"></span>
                    {{ option }}
                  </label>
                </div>
              </div>

              <!-- Question Type: Grila (Multiple Choice) -->
              <div *ngIf="currentQuestion?.question_type === QuestionType.MULTIPLE_CHOICE" class="options">
                <div *ngFor="let option of getGrilaOptions(currentQuestion)" class="option">
                  <label class="checkbox-label">
                    <input type="checkbox"
                           [checked]="isMultipleChoiceSelected(option)"
                           (change)="toggleOption(currentQuestion, option)">
                    <span class="checkbox-custom"></span>
                    {{ option }}
                  </label>
                </div>
              </div>

              <!-- Question Type: Free Text -->
              <div *ngIf="currentQuestion?.question_type === QuestionType.FREE_TEXT" class="free-text">
                <textarea class="textarea" 
                         placeholder="Scrie răspunsul tău..."
                         [formControl]="getFormControl(currentQuestionIndex)"
                         rows="6"></textarea>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="navigation-buttons">
              <button class="btn btn-secondary" 
                     (click)="previousQuestion()"
                     [disabled]="currentQuestionIndex === 0">
                ← Înapoi
              </button>
              
              <button class="btn btn-secondary"
                     (click)="nextQuestion()"
                     *ngIf="currentQuestionIndex < (quiz?.questions?.length || 0) - 1"
                     [disabled]="currentQuestionIndex === (quiz?.questions?.length || 0) - 1">
                Înainte →
              </button>

              <button class="btn btn-primary" 
                     (click)="submitQuiz()"
                     *ngIf="currentQuestionIndex === (quiz?.questions?.length || 0) - 1"
                     [disabled]="isSubmitting || quizForm.invalid">
                {{ isSubmitting ? 'Se trimit răspunsurile...' : 'Trimite Răspunsurile' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quiz-take-container {
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

    .quiz-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .quiz-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .quiz-header h2 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
    }

    .quiz-description {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }

    .timer-box {
      background: rgba(255, 255, 255, 0.2);
      padding: 16px 24px;
      border-radius: 6px;
      text-align: center;
    }

    .timer {
      font-size: 36px;
      font-weight: 700;
      font-family: 'Courier New', monospace;
      letter-spacing: 2px;
    }

    .timer-label {
      margin: 8px 0 0 0;
      font-size: 12px;
      opacity: 0.9;
    }

    .quiz-main {
      display: flex;
      gap: 20px;
    }

    .navigator-sidebar {
      width: 150px;
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      height: fit-content;
    }

    .navigator-sidebar h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .question-navigator {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
    }

    .nav-button {
      width: 100%;
      aspect-ratio: 1;
      border: 2px solid #ddd;
      background: white;
      color: #333;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
      transition: all 0.2s;
    }

    .nav-button:hover {
      border-color: #667eea;
    }

    .nav-button.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .nav-button.answered {
      background: #4caf50;
      color: white;
      border-color: #4caf50;
    }

    .main-content {
      flex: 1;
      background: white;
      padding: 32px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .question-section {
      margin-bottom: 32px;
    }

    .question-header-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .question-header-info h4 {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .question-type {
      background: #e8f0ff;
      color: #667eea;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .question-text {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      line-height: 1.5;
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .option {
      display: flex;
      align-items: center;
    }

    .radio-label, .checkbox-label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      flex: 1;
      font-size: 14px;
      margin: 0;
    }

    .radio-label input, .checkbox-label input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .radio-custom, .checkbox-custom {
      width: 20px;
      height: 20px;
      border: 2px solid #ddd;
      border-radius: 4px;
      display: inline-block;
      transition: all 0.2s;
    }

    .radio-label input:checked ~ .radio-custom {
      background: #667eea;
      border-color: #667eea;
    }

    .checkbox-label input:checked ~ .checkbox-custom {
      background: #4caf50;
      border-color: #4caf50;
    }

    .free-text {
      margin-bottom: 20px;
    }

    .textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
      transition: border-color 0.2s;
    }

    .textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .navigation-buttons {
      display: flex;
      gap: 12px;
      justify-content: space-between;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #eee;
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

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      flex: 1;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #f0f0f0;
      color: #333;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e0e0e0;
    }

    @media (max-width: 768px) {
      .quiz-header {
        flex-direction: column;
        gap: 16px;
      }

      .quiz-main {
        flex-direction: column;
      }

      .navigator-sidebar {
        width: 100%;
      }

      .question-navigator {
        grid-template-columns: repeat(8, 1fr);
      }

      .main-content {
        padding: 16px;
      }
    }
  `]
})
export class QuizTakeComponent implements OnInit, OnDestroy {
  quiz: Quiz | null = null;
  quizForm!: FormGroup;
  currentQuestionIndex = 0;
  isLoading = false;
  isSubmitting = false;
  errorMessage: string | null = null;
  startTime: Date | null = null;
  timeLeft = 0;
  timerInterval: any;
  attemptId: number | null = null;  // Store attempt ID
  
  QuestionType = QuestionType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const quizId = this.route.snapshot.params['id'];
    if (quizId) {
      this.loadQuiz(quizId);
    }
  }

  private loadQuiz(quizId: number): void {
    this.isLoading = true;
    this.quizService.getQuizById(quizId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.initializeForm();
        
        // Start attempt on backend to get server-synced timer
        if (quiz.time_limit && quiz.time_limit > 0) {
          this.quizService.startAttempt(quizId).subscribe({
            next: (attempt) => {
              this.attemptId = attempt.id;
              // Get time remaining from server
              this.timeLeft = attempt.time_remaining || ((this.quiz?.time_limit || 60) * 60);
              this.startTime = new Date(attempt.started_at);
              this.startTimer();
              this.isLoading = false;
            },
            error: () => {
              this.errorMessage = 'Nu s-a putut incepe testul';
              this.isLoading = false;
            }
          });
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.errorMessage = 'Nu s-a putut încărca testul';
        this.isLoading = false;
      }
    });
  }

  private initializeForm(): void {
    if (!this.quiz) return;
    
    const answersFormArray = new FormArray(
      this.quiz.questions.map((_: any) => this.fb.control('', Validators.required))
    );
    
    this.quizForm = this.fb.group({
      answers: answersFormArray
    });
  }

  private startTimer(): void {
    let syncCounter = 0;
    
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      syncCounter++;
      
      // Sync with server every 10 seconds to handle multi-device scenarios
      if (syncCounter % 10 === 0 && this.attemptId) {
        this.quizService.syncTimer(this.attemptId).subscribe({
          next: (attempt) => {
            // Update time from server (more accurate)
            this.timeLeft = Math.max(0, attempt.time_remaining || this.timeLeft);
            
            if (attempt.is_expired) {
              clearInterval(this.timerInterval);
              this.autoSubmitQuiz();
            }
          },
          error: (err) => {
            console.error('Timer sync error:', err);
            // Continue with local timer if sync fails
          }
        });
      }
      
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.autoSubmitQuiz();
      }
    }, 1000);
  }

  get currentQuestion(): Question | null {
    return this.quiz?.questions[this.currentQuestionIndex] || null;
  }

  get answersFormArray(): FormArray {
    return this.quizForm.get('answers') as FormArray;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < (this.quiz?.questions.length || 0) - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < (this.quiz?.questions.length || 0)) {
      this.currentQuestionIndex = index;
    }
  }

  isGrilaQuestion(type: QuestionType): boolean {
    return type === QuestionType.SINGLE_CHOICE || type === QuestionType.MULTIPLE_CHOICE;
  }

  isMultipleChoice(type: QuestionType): boolean {
    return type === QuestionType.MULTIPLE_CHOICE;
  }

  getGrilaOptions(question: Question | null): string[] {
    if (!question || !question.options) return [];
    return question.options;
  }

  toggleOption(question: Question | null, option: string): void {
    if (!question) return;
    
    const answerControl = this.answersFormArray.at(this.currentQuestionIndex);
    if (!answerControl) return;
    
    if (this.isMultipleChoice(question.question_type)) {
      const currentAnswers = answerControl.value || [];
      const answerArray = Array.isArray(currentAnswers) ? currentAnswers : [];
      
      if (answerArray.includes(option)) {
        answerArray.splice(answerArray.indexOf(option), 1);
      } else {
        answerArray.push(option);
      }
      
      answerControl.setValue(answerArray);
    } else {
      answerControl.setValue(option);
    }
  }

  isSingleChoiceSelected(option: string): boolean {
    const answer = this.answersFormArray.at(this.currentQuestionIndex)?.value;
    return answer === option;
  }

  isMultipleChoiceSelected(option: string): boolean {
    const answer = this.answersFormArray.at(this.currentQuestionIndex)?.value;
    const answerArray = Array.isArray(answer) ? answer : [];
    return answerArray.includes(option);
  }

  getTimeDisplay(): string {
    if (this.timeLeft <= 0) return '00:00';
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  private autoSubmitQuiz(): void {
    if (!this.attemptId) {
      // Fallback to manual submit if no attempt ID
      this.submitQuiz();
      return;
    }
    
    // Use server-side auto-submit which will evaluate answers with AI
    this.quizService.autoSubmitAttempt(this.attemptId).subscribe({
      next: (attempt) => {
        this.router.navigate(['/quizzes/results', attempt.id]);
      },
      error: () => {
        this.errorMessage = 'Eroare la trimiterea automata. Te rog incearca manual.';
        this.isSubmitting = false;
      }
    });
  }

  submitQuiz(): void {
    if (!this.quiz) return;
    
    if (this.quizForm.invalid) {
      this.errorMessage = 'Te rog răspunde la toate întrebările înainte de a trimite';
      return;
    }

    this.isSubmitting = true;
    clearInterval(this.timerInterval);
    
    const answers = this.quizForm.get('answers')?.value || [];
    const answersDict: any = {};
    
    this.quiz.questions.forEach((question, index) => {
      answersDict[question.id] = Array.isArray(answers[index]) ? answers[index] : [answers[index]];
    });

    // If we have an attempt ID, use auto-submit endpoint (includes AI evaluation)
    // Pass answers so they get saved before evaluation
    if (this.attemptId) {
      this.quizService.autoSubmitAttempt(this.attemptId, answersDict).subscribe({
        next: (attempt) => {
          this.router.navigate(['/quizzes/results', attempt.id]);
        },
        error: () => {
          this.errorMessage = 'Nu s-au putut trimite răspunsurile. Te rog încearcă din nou.';
          this.isSubmitting = false;
        }
      });
    } else {
      // Fallback to old endpoint if no attempt ID (shouldn't happen)
      this.quizService.submitAttempt(this.quiz.id, answersDict).subscribe({
        next: (attempt) => {
          this.router.navigate(['/quizzes/results', attempt.id]);
        },
        error: () => {
          this.errorMessage = 'Nu s-au putut trimite răspunsurile. Te rog încearcă din nou.';
          this.isSubmitting = false;
        }
      });
    }
  }

  getFormControl(index: number) {
    return this.answersFormArray.at(index) as any;
  }

  getQuestionTypeLabel(type: QuestionType): string {
    switch (type) {
      case QuestionType.SINGLE_CHOICE:
        return '🔘 Grila - 1 Răspuns';
      case QuestionType.MULTIPLE_CHOICE:
        return '☑️ Grila - Multiple';
      case QuestionType.FREE_TEXT:
        return '✏️ Răspuns Liber';
      default:
        return type;
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }
}
