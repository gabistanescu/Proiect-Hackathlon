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
        <!-- Main Quiz UI (hidden while submitting) -->
        <div *ngIf="!isSubmitting">
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
                           [formControl]="getFormControl(currentQuestionIndex)">
                  </textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="navigation-buttons">
            <button class="btn btn-secondary" 
                   (click)="previousQuestion()"
                   *ngIf="currentQuestionIndex > 0">
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

        <!-- Submission Progress State -->
        <div *ngIf="isSubmitting" class="submission-state">
          <div class="submission-content">
            <div class="ai-brain-container">
              <div class="brain-icon" [class.pulsing]="submissionStep >= 2">🧠</div>
            </div>
            
            <h2>Se evaluează răspunsurile tale</h2>
            
            <p class="submission-description">
              Te rog așteptă în timp ce procesez răspunsurile tale. Aceasta poate dura câteva momente deoarece folosim AI pentru a evalua răspunsurile libere.
            </p>
            
            <div class="submission-steps">
              <div class="step" [class.active]="submissionStep >= 1" [class.completed]="submissionStep > 1">
                <div class="step-icon">
                  <span *ngIf="submissionStep > 1" class="check-icon">✓</span>
                  <span *ngIf="submissionStep <= 1" class="upload-icon">📤</span>
                </div>
                <span class="step-label">Se transmit răspunsurile</span>
              </div>
              
              <div class="step" [class.active]="submissionStep >= 2" [class.completed]="submissionStep > 2">
                <div class="step-icon">
                  <span *ngIf="submissionStep > 2" class="check-icon">✓</span>
                  <span *ngIf="submissionStep <= 2" class="brain-icon-step">🧠</span>
                </div>
                <span class="step-label">Se evaluează răspunsurile</span>
              </div>
              
              <div class="step" [class.active]="submissionStep >= 3" [class.completed]="submissionStep > 3">
                <div class="step-icon">
                  <span *ngIf="submissionStep > 3" class="check-icon">✓</span>
                  <span *ngIf="submissionStep <= 3" class="calc-icon">🧮</span>
                </div>
                <span class="step-label">Se calculează scorul final</span>
              </div>
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
      color: white;
      opacity: 1;
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
      color: white;
    }

    .timer-label {
      margin: 8px 0 0 0;
      font-size: 12px;
      color: white;
      opacity: 1;
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
      font-size: 16px;
      margin: 0;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      transition: all 0.2s;
      background: #fafafa;
    }

    .radio-label:hover, .checkbox-label:hover {
      border-color: #667eea;
      background: #f5f7ff;
    }

    .radio-label input, .checkbox-label input {
      display: none;
    }

    .radio-custom, .checkbox-custom {
      width: 22px;
      height: 22px;
      border: 2px solid #bbb;
      display: inline-block;
      transition: all 0.2s;
      flex-shrink: 0;
      position: relative;
    }

    .radio-custom {
      border-radius: 50%;
    }

    .checkbox-custom {
      border-radius: 4px;
    }

    .radio-label input:checked ~ .radio-custom {
      background: #667eea;
      border-color: #667eea;
    }

    .radio-label input:checked ~ .radio-custom::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      background: white;
      border-radius: 50%;
    }

    .checkbox-label input:checked ~ .checkbox-custom {
      background: #4caf50;
      border-color: #4caf50;
    }

    .checkbox-label input:checked ~ .checkbox-custom::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 14px;
      font-weight: bold;
    }

    .radio-label input:checked {
      & ~ .radio-custom {
        background: #667eea;
        border-color: #667eea;
      }
    }

    .checkbox-label input:checked {
      & ~ .checkbox-custom {
        background: #4caf50;
        border-color: #4caf50;
      }
    }

    .radio-label:has(input:checked) {
      border-color: #667eea;
      background: #f5f7ff;
    }

    .checkbox-label:has(input:checked) {
      border-color: #4caf50;
      background: #f0fff4;
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

    .submission-state {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      background: #f5f5f5;
      padding: 20px;
    }

    .submission-content {
      text-align: center;
      padding: 30px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;
    }

    .ai-brain-container {
      margin-bottom: 20px;
    }

    .brain-icon {
      font-size: 80px;
      color: #667eea;
      animation: pulse 1.5s infinite alternate;
    }

    .brain-icon.pulsing {
      animation: pulse 1.5s infinite alternate;
    }

    @keyframes pulse {
      from { transform: scale(1); opacity: 0.8; }
      to { transform: scale(1.1); opacity: 1; }
    }

    .submission-content h2 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #333;
    }

    .submission-description {
      color: #666;
      margin-bottom: 25px;
      font-size: 14px;
    }

    .submission-steps {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 30px;
      gap: 20px;
      position: relative;
    }
    
    .submission-steps::before {
      content: '';
      position: absolute;
      top: 25px;
      left: 0;
      right: 0;
      height: 2px;
      background: #e0e0e0;
      z-index: 0;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      flex: 1;
      z-index: 1;
    }

    .step-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: white;
      border: 3px solid #e0e0e0;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 16px;
      font-size: 28px;
      color: #999;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .step-icon.active {
      background: #667eea;
      border-color: #667eea;
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      animation: pulse 1.5s infinite alternate;
    }

    .step-icon.completed {
      background: #4caf50;
      border-color: #4caf50;
      color: white;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .step-label {
      font-size: 13px;
      color: #666;
      font-weight: 600;
      text-align: center;
      line-height: 1.4;
      max-width: 110px;
      letter-spacing: 0.3px;
    }

    .step.active .step-label {
      color: #667eea;
      font-weight: 700;
    }

    .step.completed .step-label {
      color: #4caf50;
    }

    .step-icon .check-icon {
      font-size: 28px;
    }

    .step-icon .upload-icon {
      font-size: 28px;
    }

    .step-icon .brain-icon-step {
      font-size: 28px;
    }

    .step-icon .calc-icon {
      font-size: 28px;
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
  submissionStep = 0; // 0: Initial, 1: Submitting, 2: Evaluating, 3: Calculating
  
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
        
        // Check if there's an existing active attempt first
        if (quiz.time_limit && quiz.time_limit > 0) {
          // Try to get existing attempt from localStorage
          const attemptKey = `quiz_attempt_${quizId}`;
          const savedAttemptId = localStorage.getItem(attemptKey);
          
          if (savedAttemptId) {
            // Resume existing attempt
            this.quizService.getAttemptResult(parseInt(savedAttemptId)).subscribe({
              next: (result) => {
                if (result.attempt && !result.attempt.completed_at && !result.attempt.is_expired) {
                  // Valid active attempt found - resume it
                  this.attemptId = result.attempt.id;
                  this.timeLeft = result.attempt.time_remaining || ((this.quiz?.time_limit || 60) * 60);
                  this.startTime = new Date(result.attempt.started_at);
                  
                  // Restore answers if any
                  if (result.attempt.answers) {
                    try {
                      const savedAnswers = JSON.parse(result.attempt.answers);
                      this.restoreAnswers(savedAnswers);
                    } catch (e) {
                      console.error('Failed to parse saved answers:', e);
                    }
                  }
                  
                  this.startTimer();
                  this.isLoading = false;
                } else {
                  // Attempt is completed or expired, start new one
                  localStorage.removeItem(attemptKey);
                  this.startNewAttempt(quizId);
                }
              },
              error: () => {
                // Attempt not found or error, start new one
                localStorage.removeItem(attemptKey);
                this.startNewAttempt(quizId);
              }
            });
          } else {
            // No saved attempt, start new one
            this.startNewAttempt(quizId);
          }
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
  
  private startNewAttempt(quizId: number): void {
    this.quizService.startAttempt(quizId).subscribe({
      next: (attempt) => {
        this.attemptId = attempt.id;
        // Save attempt ID to localStorage
        localStorage.setItem(`quiz_attempt_${quizId}`, attempt.id.toString());
        
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
  }
  
  private restoreAnswers(savedAnswers: any): void {
    if (!this.quiz || !savedAnswers) return;
    
    this.quiz.questions.forEach((question, index) => {
      const savedAnswer = savedAnswers[question.id];
      if (savedAnswer !== undefined && savedAnswer !== null) {
        const control = this.answersFormArray.at(index);
        if (control) {
          control.setValue(savedAnswer);
        }
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
      
      // Sync with server every 5 seconds to keep time accurate
      if (syncCounter % 5 === 0 && this.attemptId) {
        this.quizService.syncTimer(this.attemptId).subscribe({
          next: (attempt) => {
            // Always use server time as source of truth
            const serverTime = attempt.time_remaining || 0;
            
            // Only update if there's a significant difference (>2 seconds)
            // This prevents jitter while keeping sync accurate
            if (Math.abs(this.timeLeft - serverTime) > 2) {
              console.log(`Timer sync: ${this.timeLeft}s → ${serverTime}s`);
              this.timeLeft = serverTime;
            }
            
            if (attempt.is_expired || serverTime <= 0) {
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
        // Clear localStorage for this quiz attempt
        if (this.quiz) {
          localStorage.removeItem(`quiz_attempt_${this.quiz.id}`);
        }
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
    this.submissionStep = 1; // Step 1: Submitting answers
    clearInterval(this.timerInterval);
    
    const answers = this.quizForm.get('answers')?.value || [];
    const answersDict: any = {};
    
    this.quiz.questions.forEach((question, index) => {
      answersDict[question.id] = Array.isArray(answers[index]) ? answers[index] : [answers[index]];
    });

    // Step 1 → 2: Move to evaluation step
    setTimeout(() => {
      this.submissionStep = 2; // Step 2: Evaluating responses (AI processing)
    }, 500);

    // If we have an attempt ID, use auto-submit endpoint (includes AI evaluation)
    // Pass answers so they get saved before evaluation
    if (this.attemptId) {
      this.quizService.autoSubmitAttempt(this.attemptId, answersDict).subscribe({
        next: (attempt) => {
          // Step 2 → 3: Move to calculating final score
          this.submissionStep = 3;
          
          // Clear localStorage for this quiz attempt
          if (this.quiz) {
            localStorage.removeItem(`quiz_attempt_${this.quiz.id}`);
          }
          
          // Final step before redirect
          setTimeout(() => {
            this.router.navigate(['/quizzes/results', attempt.id]);
          }, 500);
        },
        error: () => {
          this.errorMessage = 'Nu s-au putut trimite răspunsurile. Te rog încearcă din nou.';
          this.isSubmitting = false;
          this.submissionStep = 0;
        }
      });
    } else {
      // Fallback to old endpoint if no attempt ID (shouldn't happen)
      this.quizService.submitAttempt(this.quiz.id, answersDict).subscribe({
        next: (attempt) => {
          // Step 2 → 3: Move to calculating final score
          this.submissionStep = 3;
          
          // Clear localStorage for this quiz attempt
          if (this.quiz) {
            localStorage.removeItem(`quiz_attempt_${this.quiz.id}`);
          }
          
          // Final step before redirect
          setTimeout(() => {
            this.router.navigate(['/quizzes/results', attempt.id]);
          }, 500);
        },
        error: () => {
          this.errorMessage = 'Nu s-au putut trimite răspunsurile. Te rog încearcă din nou.';
          this.isSubmitting = false;
          this.submissionStep = 0;
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
