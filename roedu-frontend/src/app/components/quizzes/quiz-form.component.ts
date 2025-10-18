import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../services/quiz.service';
import { QuestionType, Quiz, QuizCreate } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="quiz-form-container">
      <div class="form-header">
        <h2>{{ isEditMode ? 'Editează Test' : 'Test Nou' }}</h2>
        <button class="btn-back" (click)="goBack()">
          <span class="icon">←</span> Înapoi
        </button>
      </div>

      <!-- Error/Success Messages -->
      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
        <button type="button" class="close-alert" (click)="errorMessage = null">×</button>
      </div>
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
        <button type="button" class="close-alert" (click)="successMessage = null">×</button>
      </div>

      <form [formGroup]="quizForm" (ngSubmit)="submitForm()" class="quiz-form">
        <!-- Quiz Information Section -->
        <div class="form-section">
          <h3>Informații Test</h3>
          
          <div class="form-group">
            <label for="title">Titlu Test *</label>
            <input type="text" id="title" class="form-control" 
                   formControlName="title" placeholder="Ex: Test Biologie Capitolul 1">
            <div class="error-message" *ngIf="quizForm.get('title')?.invalid && quizForm.get('title')?.touched">
              Titlul este obligatoriu (1-255 caractere)
            </div>
          </div>

          <div class="form-group">
            <label for="description">Descriere</label>
            <textarea id="description" class="form-control" rows="3"
                     formControlName="description" placeholder="Descriere test..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="subject">Materie</label>
              <input type="text" id="subject" class="form-control" 
                     formControlName="subject" placeholder="Ex: Biologie">
            </div>

            <div class="form-group">
              <label for="grade_level">Clasa</label>
              <input type="number" id="grade_level" class="form-control" 
                     formControlName="grade_level" min="9" max="12" placeholder="9-12">
            </div>

            <div class="form-group">
              <label for="time_limit">Limita Timp (minute)</label>
              <input type="number" id="time_limit" class="form-control" 
                     formControlName="time_limit" min="0" placeholder="0 = nelimitat">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="total_points">Puncte Total *</label>
              <input type="number" id="total_points" class="form-control" 
                     formControlName="total_points" min="0">
            </div>

            <div class="form-group checkbox">
              <label>
                <input type="checkbox" formControlName="is_published">
                Publicat
              </label>
            </div>
          </div>
        </div>

        <!-- Questions Section -->
        <div class="form-section">
          <div class="section-header">
            <h3>Întrebări</h3>
            <button type="button" class="btn-add" (click)="addQuestion()">
              + Adaugă Întrebare
            </button>
          </div>

          <div formArrayName="questions">
            <div *ngFor="let question of questions.controls; let currentQuestionIndex = index" 
                 class="question-card" [formGroupName]="currentQuestionIndex">
              
              <div class="question-header">
                <h4>Întrebarea {{ currentQuestionIndex + 1 }}</h4>
                <button type="button" class="btn-remove" *ngIf="questions.length > 1"
                       (click)="removeQuestion(currentQuestionIndex)">
                  🗑️ Șterge
                </button>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Tip Întrebare *</label>
                  <select class="form-control" formControlName="question_type" 
                         (change)="onQuestionTypeChange(currentQuestionIndex)">
                    <option value="">Selectează tip</option>
                    <option value="single_choice">Grila - 1 Răspuns</option>
                    <option value="multiple_choice">Grila - Multiple</option>
                    <option value="free_text">Răspuns Liber</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Puncte</label>
                  <input type="number" class="form-control" formControlName="points" min="0">
                </div>
              </div>

              <div class="form-group">
                <label>Textul Întrebării *</label>
                <textarea class="form-control" rows="3" formControlName="question_text" 
                         placeholder="Introdu textul întrebării..."></textarea>
              </div>

              <!-- Grila Questions -->
              <div *ngIf="isGrilaQuestion(question.get('question_type')?.value)">
                <div class="form-group">
                  <label>Variante Răspuns *</label>
                  <div class="options-list">
                    <div *ngFor="let option of (question.get('options')?.value || []); let optIdx = index" 
                         class="option-input">
                      <input type="text" class="form-control" 
                             (ngModelChange)="(question.get('options')?.value || [])[optIdx] = $event"
                             [ngModel]="(question.get('options')?.value || [])[optIdx]"
                             placeholder="Introdu variant...">
                      <button type="button" class="btn-remove-option" 
                             (click)="removeOption(currentQuestionIndex, optIdx)">×</button>
                    </div>
                  </div>
                  <button type="button" class="btn-add-option" 
                         (click)="addOption(currentQuestionIndex)">
                    + Adaugă Variantă
                  </button>
                </div>

                <div class="form-group">
                  <label>Răspunsuri Corecte *</label>
                  <div *ngIf="getQuestionType(question) === 'single_choice'">
                    <select class="form-control" formControlName="correct_answer">
                      <option value="">Selectează</option>
                      <option *ngFor="let option of (question.get('options')?.value || [])" [value]="option">
                        {{ option }}
                      </option>
                    </select>
                  </div>
                  <div *ngIf="getQuestionType(question) === 'multiple_choice'">
                    <div *ngFor="let option of (question.get('options')?.value || [])" class="checkbox">
                      <label>
                        <input type="checkbox"
                               [checked]="getCorrectAnswers(question).includes(option)"
                               (change)="toggleMultipleChoice(option, getCorrectAnswers(question))">
                        {{ option }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Free Text Questions -->
              <div *ngIf="getQuestionType(question) === 'free_text'">
                <div class="form-group">
                  <label>Răspuns(uri) Corect(e) *</label>
                  <textarea class="form-control" rows="2" formControlName="correct_answer" 
                           placeholder="Introdu răspunsul corect..."></textarea>
                </div>

                <div class="form-group">
                  <label>Cuvinte Cheie pentru Evaluare (optional)</label>
                  <textarea class="form-control" rows="2" formControlName="evaluation_criteria" 
                           placeholder="Cuvinte cheie separate prin virgulă..."></textarea>
                </div>
              </div>

              <div class="form-group">
                <label>Explicație</label>
                <textarea class="form-control" rows="2" formControlName="explanation" 
                         placeholder="Explicația răspunsului..."></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="isSubmitting || isLoading">
            {{ isEditMode ? 'Actualizează Test' : 'Creează Test' }}
          </button>
          <button type="button" class="btn-secondary" (click)="goBack()">
            Anulează
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .quiz-form-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .form-header h2 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }

    .btn-back {
      background: none;
      border: none;
      color: #667eea;
      font-size: 16px;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .btn-back:hover {
      background: rgba(102, 126, 234, 0.1);
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

    .alert-success {
      background-color: #efe;
      border: 1px solid #cfc;
      color: #3c3;
    }

    .close-alert {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: inherit;
    }

    .quiz-form {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .form-section {
      margin-bottom: 30px;
    }

    .form-section h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #333;
      border-bottom: 2px solid #667eea;
      padding-bottom: 8px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #555;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .error-message {
      color: #c33;
      font-size: 12px;
      margin-top: 4px;
    }

    .checkbox {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    .checkbox label {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: normal;
    }

    .checkbox input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .question-card {
      background: #f9f9f9;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 16px;
      border-left: 4px solid #667eea;
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .question-header h4 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .btn-add, .btn-add-option {
      background: #667eea;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    }

    .btn-add:hover, .btn-add-option:hover {
      background: #5568d3;
    }

    .btn-remove, .btn-remove-option {
      background: #ff6b6b;
      color: white;
      border: none;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: background 0.2s;
    }

    .btn-remove:hover, .btn-remove-option:hover {
      background: #ff5252;
    }

    .options-list {
      background: white;
      padding: 8px;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .option-input {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      align-items: center;
    }

    .option-input .form-control {
      flex: 1;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #eee;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }

    .btn-secondary:hover {
      background: #d0d0d0;
    }
  `]
})
export class QuizFormComponent implements OnInit {
  quizForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  QuestionType = QuestionType;
  questionTypes = Object.values(QuestionType);
  
  isEditMode = false;
  quizId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    // Check if editing
    this.route.params.subscribe((params: any) => {
      if (params['id']) {
        this.isEditMode = true;
        this.quizId = +params['id'];
        if (this.quizId) {
          this.loadQuiz(this.quizId);
        }
      }
    });
  }

  private initializeForm(): void {
    this.quizForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
      description: [''],
      subject: [''],
      grade_level: [null],
      time_limit: [null],
      is_published: [false],
      total_points: [0, Validators.required],
      questions: this.fb.array([this.createQuestionGroup()])
    });
  }

  private createQuestionGroup(questionData?: any): FormGroup {
    const questionType = questionData?.question_type || QuestionType.SINGLE_CHOICE;
    
    return this.fb.group({
      question_text: [questionData?.question_text || '', Validators.required],
      question_type: [questionType, Validators.required],
      options: [questionData?.options || []],
      correct_answer: [questionData?.correct_answer || [], Validators.required],
      explanation: [questionData?.explanation || ''],
      order: [questionData?.order || 0],
      evaluation_criteria: [questionData?.evaluation_criteria || ''],
      points: [1, [Validators.required, Validators.min(0)]]
    });
  }

  private loadQuiz(quizId: number): void {
    this.isLoading = true;
    this.quizService.getQuizById(quizId).subscribe({
      next: (quiz: Quiz) => {
        this.populateFormWithQuiz(quiz);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load quiz';
        this.isLoading = false;
      }
    });
  }

  private populateFormWithQuiz(quiz: Quiz): void {
    const questionsArray = this.quizForm.get('questions') as FormArray;
    questionsArray.clear();
    
    this.quizForm.patchValue({
      title: quiz.title,
      description: quiz.description,
      subject: quiz.title.split('-')[0],
      time_limit: quiz.time_limit,
      is_published: false,
      total_points: quiz.total_points
    });

    quiz.questions.forEach(question => {
      questionsArray.push(this.createQuestionGroup(question));
    });
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  addQuestion(): void {
    this.questions.push(this.createQuestionGroup());
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  onQuestionTypeChange(index: number): void {
    const question = this.questions.at(index);
    const questionType = question.get('question_type')?.value;
    
    // Reset options and evaluation_criteria based on type
    if (questionType === QuestionType.FREE_TEXT) {
      question.patchValue({ options: [] });
    } else {
      question.patchValue({ evaluation_criteria: '' });
    }
  }

  toggleMultipleChoice(option: string, correctAnswers: any[]): void {
    const index = correctAnswers.indexOf(option);
    if (index > -1) {
      correctAnswers.splice(index, 1);
    } else {
      correctAnswers.push(option);
    }
  }

  getCorrectAnswers(questionFormGroup: any): any[] {
    return questionFormGroup.get('correct_answer')?.value || [];
  }

  getQuestionType(questionFormGroup: any): string {
    return questionFormGroup.get('question_type')?.value;
  }

  addOption(questionIndex: number): void {
    const question = this.questions.at(questionIndex);
    const options = question.get('options')?.value || [];
    options.push('');
    question.patchValue({ options });
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const question = this.questions.at(questionIndex);
    const options = question.get('options')?.value || [];
    options.splice(optionIndex, 1);
    question.patchValue({ options });
  }

  isGrilaQuestion(questionType: QuestionType): boolean {
    return questionType === QuestionType.SINGLE_CHOICE || questionType === QuestionType.MULTIPLE_CHOICE;
  }

  submitForm(): void {
    if (this.quizForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly';
      return;
    }

    this.isSubmitting = true;
    const quizData: QuizCreate = {
      ...this.quizForm.value,
      questions: this.quizForm.value.questions.map((q: any) => ({
        ...q,
        correct_answer: Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer]
      }))
    };

    if (this.isEditMode && this.quizId) {
      this.quizService.updateQuiz(this.quizId, quizData).subscribe({
        next: () => {
          this.successMessage = 'Quiz updated successfully';
          setTimeout(() => this.router.navigate(['/quizzes']), 2000);
        },
        error: () => {
          this.errorMessage = 'Failed to update quiz';
          this.isSubmitting = false;
        }
      });
    } else {
      this.quizService.createQuiz(quizData).subscribe({
        next: () => {
          this.successMessage = 'Quiz created successfully';
          setTimeout(() => this.router.navigate(['/quizzes']), 2000);
        },
        error: () => {
          this.errorMessage = 'Failed to create quiz';
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/quizzes']);
  }
}
