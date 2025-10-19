import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../services/group.service';
import { Group, GroupCreate } from '../../models/group.model';

@Component({
  selector: 'app-group-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <h1>👥 Gestionare Grupuri Elevi</h1>
          <p class="subtitle">Organizează elevii în grupuri pentru a asigna teste și materiale</p>
        </div>
        <button class="btn-create" (click)="openCreateModal()" *ngIf="!editingGroupId">
          <span class="icon">+</span> Grup Nou
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Se încarcă grupuri...</p>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage && !isLoading" class="alert alert-error">
        <span>❌ {{ errorMessage }}</span>
        <button (click)="errorMessage = ''" class="close">×</button>
      </div>

      <!-- Success Message -->
      <div *ngIf="successMessage && !isLoading" class="alert alert-success">
        <span>✅ {{ successMessage }}</span>
        <button (click)="successMessage = ''" class="close">×</button>
      </div>

      <!-- Groups Grid -->
      <div *ngIf="!isLoading && groups.length > 0" class="groups-grid">
        <div *ngFor="let group of groups" class="group-card">
          <!-- Card Header -->
          <div class="card-header">
            <div class="group-title">
              <h3>{{ group.name }}</h3>
              <div class="group-badges">
                <span *ngIf="group.subject" class="badge badge-subject">📚 {{ group.subject }}</span>
                <span *ngIf="group.grade_level" class="badge badge-grade">🎓 Cl. {{ group.grade_level }}</span>
              </div>
            </div>
            <div class="group-actions-btn">
              <button class="btn-icon" (click)="openEditModal(group)" title="Editează">
                ✏️
              </button>
              <button class="btn-icon btn-danger" (click)="confirmDelete(group)" title="Șterge">
                🗑️
              </button>
            </div>
          </div>

          <!-- Card Content -->
          <div class="card-content">
            <p *ngIf="group.description" class="description">{{ group.description }}</p>
            
            <!-- Student Count -->
            <div class="stats">
              <div class="stat">
                <span class="stat-label">Elevi</span>
                <span class="stat-value">{{ group.student_count || 0 }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Status</span>
                <span class="stat-value" [class.active]="group.student_count && group.student_count > 0">
                  {{ (group.student_count && group.student_count > 0) ? 'Activ' : 'Gol' }}
                </span>
              </div>
            </div>

            <!-- Students List -->
            <div *ngIf="group.students && group.students.length > 0" class="students-list">
              <h4>Membri:</h4>
              <div class="students">
                <div *ngFor="let student of group.students" class="student-item">
                  <div class="student-avatar">{{ getInitials(student.first_name, student.last_name) }}</div>
                  <div class="student-info">
                    <span class="student-name">{{ student.first_name }} {{ student.last_name }}</span>
                    <span class="student-email">{{ student.email }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="!group.students || group.students.length === 0" class="empty-students">
              <p>Nici un elev nu este parte din acest grup</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && groups.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h2>Nu sunt grupuri create</h2>
        <p>Crează un grup nou pentru a organiza elevii în clase</p>
        <button class="btn-create" (click)="openCreateModal()">
          <span class="icon">+</span> Creează primul grup
        </button>
      </div>

      <!-- Modal Overlay -->
      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()"></div>

      <!-- Modal -->
      <div *ngIf="showModal" class="modal">
        <div class="modal-header">
          <h2>{{ editingGroupId ? '✏️ Editează Grup' : '➕ Grup Nou' }}</h2>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>

        <form [formGroup]="groupForm" (ngSubmit)="submitForm()" class="modal-content">
          <!-- Name Field -->
          <div class="form-group">
            <label>Nume Grup *</label>
            <input type="text" 
                   formControlName="name" 
                   placeholder="Ex: Grupa A - Matematică"
                   class="form-input">
            <small *ngIf="groupForm.get('name')?.invalid && groupForm.get('name')?.touched" class="error">
              Numele grupului este obligatoriu
            </small>
          </div>

          <!-- Description Field -->
          <div class="form-group">
            <label>Descriere</label>
            <textarea formControlName="description" 
                     placeholder="Descriere grup..."
                     rows="3"
                     class="form-input"></textarea>
          </div>

          <!-- Subject and Grade -->
          <div class="form-row">
            <div class="form-group">
              <label>Materie</label>
              <input type="text" 
                     formControlName="subject" 
                     placeholder="Ex: Matematică"
                     class="form-input">
            </div>

            <div class="form-group">
              <label>Clasa</label>
              <select formControlName="grade_level" class="form-input">
                <option value="">Selectează clasa</option>
                <option value="9">Clasa a IX-a</option>
                <option value="10">Clasa a X-a</option>
                <option value="11">Clasa a XI-a</option>
                <option value="12">Clasa a XII-a</option>
              </select>
            </div>
          </div>

          <!-- Students Input -->
          <div class="form-group">
            <label>Adaugă Elevi (Email-uri)</label>
            <textarea formControlName="student_emails_text" 
                     placeholder="elev1@email.com&#10;elev2@email.com&#10;elev3@email.com"
                     rows="4"
                     class="form-input"></textarea>
            <small>Introduceți emailurile elevilor, fiecare pe un rând</small>
          </div>

          <!-- Email Tags -->
          <div *ngIf="studentEmails.length > 0" class="email-tags">
            <div *ngFor="let email of studentEmails; let i = index" class="tag">
              {{ email }}
              <button type="button" (click)="removeEmail(i)" class="tag-remove">×</button>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="submit" 
                   class="btn btn-primary"
                   [disabled]="isSubmitting || groupForm.invalid">
              {{ isSubmitting ? 'Se procesează...' : (editingGroupId ? 'Actualizează' : 'Creează') }}
            </button>
            <button type="button" 
                   class="btn btn-secondary"
                   (click)="closeModal()"
                   [disabled]="isSubmitting">
              Anulează
            </button>
          </div>
        </form>
      </div>

      <!-- Delete Confirmation Modal -->
      <div *ngIf="showDeleteConfirm" class="modal-overlay" (click)="showDeleteConfirm = false"></div>
      <div *ngIf="showDeleteConfirm" class="modal modal-danger">
        <div class="modal-header">
          <h2>⚠️ Confirmare Ștergere</h2>
        </div>
        <div class="modal-content">
          <p>Ești sigur că vrei să ștergi grupul <strong>{{ deleteGroupName }}</strong>?</p>
          <p class="warning-text">Această acțiune nu poate fi anulată.</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-danger" (click)="deleteConfirmed()" [disabled]="isDeleting">
            {{ isDeleting ? 'Se șterge...' : 'Da, șterge' }}
          </button>
          <button class="btn btn-secondary" (click)="showDeleteConfirm = false" [disabled]="isDeleting">
            Anulează
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
    }

    .subtitle {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .btn-create {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-create:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .btn-create .icon {
      font-size: 18px;
    }

    /* Alerts */
    .alert {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-weight: 500;
    }

    .alert-error {
      background: #fee;
      border: 1px solid #fcc;
      color: #c33;
    }

    .alert-success {
      background: #efe;
      border: 1px solid #cfc;
      color: #3c3;
    }

    .alert .close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: inherit;
    }

    /* Loading */
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 20px;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e0e0e0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Groups Grid */
    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .group-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
    }

    .group-card:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      transform: translateY(-4px);
    }

    .card-header {
      padding: 20px;
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #667eea20;
    }

    .group-title h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #333;
    }

    .group-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-subject {
      background: #e3f2fd;
      color: #1976d2;
    }

    .badge-grade {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .group-actions-btn {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon:hover {
      background: #667eea;
      color: white;
      transform: scale(1.1);
    }

    .btn-icon.btn-danger:hover {
      background: #e53935;
    }

    .card-content {
      padding: 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .description {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }

    .stats {
      display: flex;
      gap: 16px;
      padding: 12px 0;
      border-top: 1px solid #e0e0e0;
      border-bottom: 1px solid #e0e0e0;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .stat-label {
      font-size: 12px;
      color: #999;
      font-weight: 600;
      text-transform: uppercase;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 700;
      color: #667eea;
    }

    .stat-value.active {
      color: #4caf50;
    }

    .students-list {
      flex: 1;
    }

    .students-list h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #333;
      text-transform: uppercase;
    }

    .students {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .student-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .student-item:hover {
      background: #efefef;
    }

    .student-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #667eea;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .student-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .student-name {
      font-size: 13px;
      font-weight: 600;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .student-email {
      font-size: 11px;
      color: #999;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .empty-students {
      padding: 20px;
      text-align: center;
      color: #999;
      font-size: 13px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .empty-state h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #333;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      color: #999;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      animation: fadeIn 0.2s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 1001;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s;
      width: 90%;
      max-width: 500px;
    }

    @keyframes slideUp {
      from {
        transform: translate(-50%, -40%);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      color: #333;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: #f0f0f0;
      border-radius: 6px;
      font-size: 24px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #e0e0e0;
    }

    .modal-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .form-input {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-group small {
      font-size: 12px;
      color: #999;
    }

    .form-group small.error {
      color: #e53935;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .email-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #e3f2fd;
      border-radius: 20px;
      font-size: 13px;
      color: #1976d2;
    }

    .tag-remove {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 16px;
      padding: 0;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      flex: 1;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #d0d0d0;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Delete Modal */
    .modal-danger .modal-header {
      background: #fee;
    }

    .modal-danger .modal-header h2 {
      color: #c33;
    }

    .modal-danger .modal-content {
      padding: 24px;
    }

    .modal-danger p {
      margin: 0;
      color: #666;
    }

    .modal-danger .warning-text {
      color: #c33;
      font-weight: 600;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      padding: 0 24px 24px 24px;
    }

    .btn-danger {
      background: #e53935;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #c62828;
    }
  `]
})
export class GroupManagementComponent implements OnInit {
  groups: Group[] = [];
  groupForm: FormGroup;
  studentEmails: string[] = [];
  
  isLoading = false;
  isSubmitting = false;
  isDeleting = false;
  showModal = false;
  showDeleteConfirm = false;
  
  errorMessage: string = '';
  successMessage: string = '';
  
  editingGroupId: number | null = null;
  deleteGroupId: number | null = null;
  deleteGroupName: string = '';

  constructor(
    private fb: FormBuilder,
    private groupService: GroupService
  ) {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      subject: [''],
      grade_level: [null],
      student_emails_text: ['']
    });
  }

  ngOnInit(): void {
    this.loadGroups();
    this.setupEmailListener();
  }

  private setupEmailListener(): void {
    this.groupForm.get('student_emails_text')?.valueChanges.subscribe((value: string) => {
      if (value) {
        this.studentEmails = value
          .split('\n')
          .map(email => email.trim())
          .filter(email => email.length > 0 && email.includes('@'));
      } else {
        this.studentEmails = [];
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

  openCreateModal(): void {
    this.editingGroupId = null;
    this.groupForm.reset();
    this.studentEmails = [];
    this.showModal = true;
  }

  openEditModal(group: Group): void {
    this.editingGroupId = group.id;
    this.groupForm.patchValue({
      name: group.name,
      description: group.description,
      subject: group.subject,
      grade_level: group.grade_level,
      student_emails_text: group.students?.map(s => s.email).join('\n') || ''
    });
    this.studentEmails = group.students?.map(s => s.email) || [];
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingGroupId = null;
    this.groupForm.reset();
    this.studentEmails = [];
  }

  removeEmail(index: number): void {
    this.studentEmails.splice(index, 1);
    this.groupForm.patchValue({
      student_emails_text: this.studentEmails.join('\n')
    });
  }

  submitForm(): void {
    if (this.groupForm.invalid) {
      this.errorMessage = 'Te rog completează toate câmpurile obligatorii';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.groupForm.value;
    const groupData: GroupCreate = {
      name: formValue.name,
      description: formValue.description || undefined,
      subject: formValue.subject || undefined,
      grade_level: formValue.grade_level ? parseInt(formValue.grade_level) : undefined,
      student_emails: this.studentEmails
    };

    if (this.editingGroupId) {
      this.groupService.updateGroup(this.editingGroupId, groupData).subscribe({
        next: () => {
          this.successMessage = '✅ Grup actualizat cu succes!';
          this.closeModal();
          this.loadGroups();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.detail || 'Eroare la actualizarea grupului';
          this.isSubmitting = false;
        }
      });
    } else {
      this.groupService.createGroup(groupData).subscribe({
        next: () => {
          this.successMessage = '✅ Grup creat cu succes!';
          this.closeModal();
          this.loadGroups();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.detail || 'Eroare la crearea grupului';
          this.isSubmitting = false;
        }
      });
    }
  }

  confirmDelete(group: Group): void {
    this.deleteGroupId = group.id;
    this.deleteGroupName = group.name;
    this.showDeleteConfirm = true;
  }

  deleteConfirmed(): void {
    if (!this.deleteGroupId) return;
    
    this.isDeleting = true;
    this.groupService.deleteGroup(this.deleteGroupId).subscribe({
      next: () => {
        this.successMessage = '✅ Grup șters cu succes!';
        this.showDeleteConfirm = false;
        this.deleteGroupId = null;
        this.loadGroups();
        this.isDeleting = false;
      },
      error: () => {
        this.errorMessage = 'Nu s-a putut șterge grupul';
        this.isDeleting = false;
      }
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  }
}
