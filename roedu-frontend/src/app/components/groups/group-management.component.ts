import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../services/group.service';
import { Group, GroupCreate } from '../../models/group.model';

@Component({
  selector: 'app-group-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="group-management-container">
      <div class="page-header">
        <h1>👥 Gestionare Grupuri Elevi</h1>
        <button class="btn btn-primary" (click)="toggleForm()">
          {{ showForm ? '✕ Anulează' : '+ Grup Nou' }}
        </button>
      </div>

      <!-- Create Group Form -->
      <div *ngIf="showForm" class="form-container">
        <form [formGroup]="groupForm" (ngSubmit)="submitForm()" class="group-form">
          <div class="form-group">
            <label for="name">Nume Grup *</label>
            <input type="text" id="name" class="form-control" 
                   formControlName="name" placeholder="Ex: Grupa A - Matematică">
            <div class="error-message" *ngIf="groupForm.get('name')?.invalid && groupForm.get('name')?.touched">
              Numele grupului este obligatoriu
            </div>
          </div>

          <div class="form-group">
            <label for="description">Descriere</label>
            <textarea id="description" class="form-control" rows="2"
                     formControlName="description" placeholder="Descriere grup..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="subject">Materie</label>
              <input type="text" id="subject" class="form-control" 
                     formControlName="subject" placeholder="Ex: Matematică">
            </div>

            <div class="form-group">
              <label for="grade_level">Clasa</label>
              <select id="grade_level" class="form-control" formControlName="grade_level">
                <option value="">Selectează</option>
                <option value="9">Clasa a IX-a</option>
                <option value="10">Clasa a X-a</option>
                <option value="11">Clasa a XI-a</option>
                <option value="12">Clasa a XII-a</option>
              </select>
            </div>
          </div>

          <!-- Student Emails Input -->
          <div class="form-group">
            <label>Adaugă Elevi (Email-uri)</label>
            <p class="help-text">Introduceți emailurile elevilor separați prin virgulă</p>
            <textarea class="form-control" rows="3"
                     formControlName="student_emails_text" 
                     placeholder="elev1@email.com, elev2@email.com, elev3@email.com"></textarea>
            <div class="student-emails-list" *ngIf="studentEmails.length > 0">
              <div *ngFor="let email of studentEmails; let i = index" class="email-tag">
                {{ email }}
                <button type="button" class="remove-btn" (click)="removeEmail(i)">×</button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="isSubmitting || groupForm.invalid">
              {{ isSubmitting ? 'Se creează...' : 'Creează Grup' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="toggleForm()">
              Anulează
            </button>
          </div>
        </form>
      </div>

      <!-- Error/Success Messages -->
      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
        <button class="close-alert" (click)="errorMessage = null">×</button>
      </div>
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
        <button class="close-alert" (click)="successMessage = null">×</button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Se încarcă grupuri...</p>
      </div>

      <!-- Groups List -->
      <div *ngIf="!isLoading && groups.length > 0" class="groups-list">
        <div *ngFor="let group of groups" class="group-card">
          <div class="group-header">
            <div>
              <h3>{{ group.name }}</h3>
              <p class="group-meta" *ngIf="group.subject || group.grade_level">
                <span *ngIf="group.subject">📚 {{ group.subject }}</span>
                <span *ngIf="group.grade_level">🎓 Clasa {{ group.grade_level }}</span>
              </p>
            </div>
            <div class="group-student-count">
              👥 {{ group.student_count || 0 }} elevi
            </div>
          </div>

          <div class="group-body">
            <p class="description" *ngIf="group.description">{{ group.description }}</p>
            
            <div class="students-section">
              <h4>Elevi din grup:</h4>
              <div class="students-list">
                <div *ngFor="let student of group.students" class="student-item">
                  <span>{{ student.first_name }} {{ student.last_name }}</span>
                  <span class="student-email">{{ student.email }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="group-actions">
            <button class="btn btn-warning" (click)="editGroup(group.id)">✏️ Editează</button>
            <button class="btn btn-danger" (click)="deleteGroup(group.id)">🗑️ Șterge</button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && groups.length === 0" class="empty-state">
        <p>📭 Nu sunt grupuri create</p>
        <p class="help-text">Crează un grup nou pentru a organiza elevii</p>
      </div>
    </div>
  `,
  styles: [`
    .group-management-container {
      max-width: 1000px;
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
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }

    .btn-secondary:hover {
      background: #d0d0d0;
    }

    .btn-warning {
      background: #ff9800;
      color: white;
    }

    .btn-warning:hover {
      background: #e68900;
    }

    .btn-danger {
      background: #ff6b6b;
      color: white;
    }

    .btn-danger:hover {
      background: #ff5252;
    }

    .form-container {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
    }

    .group-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    label {
      margin-bottom: 6px;
      font-weight: 600;
      color: #555;
      font-size: 14px;
    }

    .form-control {
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

    .help-text {
      font-size: 12px;
      color: #999;
      margin: 0;
    }

    .student-emails-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .email-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #667eea;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
    }

    .remove-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-weight: bold;
      padding: 0;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
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
      background: #fee;
      border: 1px solid #fcc;
      color: #c33;
    }

    .alert-success {
      background: #efe;
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

    .groups-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .group-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
    }

    .group-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .group-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .group-header h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .group-meta {
      margin: 0;
      font-size: 12px;
      opacity: 0.9;
      display: flex;
      gap: 12px;
    }

    .group-student-count {
      background: rgba(255, 255, 255, 0.3);
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    .group-body {
      padding: 16px;
      flex: 1;
    }

    .description {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 13px;
      line-height: 1.4;
    }

    .students-section h4 {
      margin: 0 0 8px 0;
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }

    .students-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 120px;
      overflow-y: auto;
    }

    .student-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 12px;
    }

    .student-email {
      color: #999;
      font-size: 11px;
    }

    .group-actions {
      padding: 12px 16px;
      display: flex;
      gap: 8px;
      border-top: 1px solid #eee;
    }

    .group-actions .btn {
      flex: 1;
      padding: 8px 12px;
      font-size: 12px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .empty-state p:first-child {
      font-size: 18px;
      margin-bottom: 8px;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .groups-list {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GroupManagementComponent implements OnInit {
  groups: Group[] = [];
  groupForm!: FormGroup;
  showForm = false;
  isLoading = false;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  studentEmails: string[] = [];

  constructor(
    private fb: FormBuilder,
    private groupService: GroupService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadGroups();
  }

  private initializeForm(): void {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      subject: [''],
      grade_level: [null],
      student_emails_text: ['']
    });

    this.groupForm.get('student_emails_text')?.valueChanges.subscribe((value: string) => {
      if (value) {
        this.studentEmails = value
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0 && email.includes('@'));
      }
    });
  }

  private loadGroups(): void {
    this.isLoading = true;
    this.groupService.getGroups().subscribe({
      next: (data) => {
        this.groups = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Nu s-au putut încărca grupurile';
        this.isLoading = false;
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.initializeForm();
      this.studentEmails = [];
    }
  }

  removeEmail(index: number): void {
    this.studentEmails.splice(index, 1);
  }

  submitForm(): void {
    if (this.groupForm.invalid) {
      this.errorMessage = 'Completeaza toate campurile obligatorii';
      return;
    }

    this.isSubmitting = true;
    const formValue = this.groupForm.value;

    const groupData: GroupCreate = {
      name: formValue.name,
      description: formValue.description || undefined,
      subject: formValue.subject || undefined,
      grade_level: formValue.grade_level ? parseInt(formValue.grade_level) : undefined,
      student_emails: this.studentEmails
    };

    this.groupService.createGroup(groupData).subscribe({
      next: () => {
        this.successMessage = 'Grup creat cu succes!';
        this.showForm = false;
        this.initializeForm();
        this.studentEmails = [];
        this.loadGroups();
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.detail || 'Eroare la crearea grupului';
        this.isSubmitting = false;
      }
    });
  }

  editGroup(groupId: number): void {
    // TODO: Implement group editing
    this.router.navigate([`/groups/${groupId}/edit`]);
  }

  deleteGroup(groupId: number): void {
    if (confirm('Ești sigur că vrei să ștergi acest grup?')) {
      this.groupService.deleteGroup(groupId).subscribe({
        next: () => {
          this.successMessage = 'Grup șters cu succes!';
          this.loadGroups();
        },
        error: () => {
          this.errorMessage = 'Nu s-a putut șterge grupul';
        }
      });
    }
  }
}
