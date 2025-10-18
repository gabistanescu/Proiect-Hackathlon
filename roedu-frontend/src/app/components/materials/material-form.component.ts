import {
  Component,
  OnInit,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MaterialService } from '../../services/material.service';
import {
  Material,
  MaterialCreate,
  VisibilityType,
} from '../../models/material.model';
import { ProfileType } from '../../models/user.model';

@Component({
  selector: 'app-material-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="material-form-container">
      <div class="form-header">
        <h2>{{ isEditMode() ? 'Editează Material' : 'Material Nou' }}</h2>
        <button class="btn-back" (click)="goBack()">
          <span class="icon">←</span> Înapoi
        </button>
      </div>

      <form
        [formGroup]="materialForm"
        (ngSubmit)="onSubmit()"
        class="material-form"
      >
        <!-- Title -->
        <div class="form-group">
          <label for="title">Titlu *</label>
          <input
            id="title"
            type="text"
            formControlName="title"
            placeholder="Introduceți titlul materialului"
            class="form-control"
            [class.error]="
              materialForm.get('title')?.invalid &&
              materialForm.get('title')?.touched
            "
          />
          <span
            *ngIf="
              materialForm.get('title')?.invalid &&
              materialForm.get('title')?.touched
            "
            class="error-message"
            >Titlul este obligatoriu</span
          >
        </div>

        <!-- Description -->
        <div class="form-group">
          <label for="description">Descriere Scurtă</label>
          <textarea
            id="description"
            formControlName="description"
            placeholder="Descriere scurtă a materialului..."
            class="form-control"
            rows="3"
          ></textarea>
        </div>

        <!-- Rich Text Content -->
        <div class="form-group">
          <label for="content">Conținut</label>
          <div class="editor-toolbar">
            <button
              type="button"
              (click)="formatText('bold')"
              class="toolbar-btn"
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              (click)="formatText('italic')"
              class="toolbar-btn"
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              (click)="formatText('underline')"
              class="toolbar-btn"
              title="Underline"
            >
              <u>U</u>
            </button>
            <div class="separator"></div>
            <button
              type="button"
              (click)="formatText('insertUnorderedList')"
              class="toolbar-btn"
              title="Lista"
            >
              ☰
            </button>
            <button
              type="button"
              (click)="formatText('insertOrderedList')"
              class="toolbar-btn"
              title="Lista numerotată"
            >
              ⋮
            </button>
            <div class="separator"></div>
            <select (change)="formatBlock($event)" class="toolbar-select">
              <option value="">Paragraf</option>
              <option value="h1">Titlu 1</option>
              <option value="h2">Titlu 2</option>
              <option value="h3">Titlu 3</option>
            </select>
          </div>
          <div
            #contentEditor
            class="content-editor"
            contenteditable="true"
            dir="ltr"
            (input)="onContentChange($event)"
          ></div>
        </div>

        <!-- Subject -->
        <div class="form-group">
          <label for="subject">Materie *</label>
          <input
            id="subject"
            type="text"
            formControlName="subject"
            placeholder="Ex: Matematică, Istorie, etc."
            class="form-control"
            [class.error]="
              materialForm.get('subject')?.invalid &&
              materialForm.get('subject')?.touched
            "
          />
          <span
            *ngIf="
              materialForm.get('subject')?.invalid &&
              materialForm.get('subject')?.touched
            "
            class="error-message"
            >Materia este obligatorie</span
          >
        </div>

        <div class="form-row">
          <!-- Profile Type -->
          <div class="form-group">
            <label for="profileType">Profil</label>
            <select
              id="profileType"
              formControlName="profile_type"
              class="form-control"
            >
              <option value="">Selectează profil</option>
              <option value="real">Real</option>
              <option value="uman">Uman</option>
              <option value="tehnologic">Tehnologic</option>
            </select>
          </div>

          <!-- Grade Level -->
          <div class="form-group">
            <label for="gradeLevel">Clasa</label>
            <select
              id="gradeLevel"
              formControlName="grade_level"
              class="form-control"
            >
              <option value="">Selectează clasa</option>
              <option value="9">Clasa a IX-a</option>
              <option value="10">Clasa a X-a</option>
              <option value="11">Clasa a XI-a</option>
              <option value="12">Clasa a XII-a</option>
            </select>
          </div>
        </div>

        <!-- Tags -->
        <div class="form-group">
          <label for="tags">Etichete (separate prin virgulă)</label>
          <input
            id="tags"
            type="text"
            formControlName="tagsInput"
            placeholder="Ex: bacalaureat, optional, rezolvat"
            class="form-control"
          />
        </div>

        <!-- File Upload -->
        <div class="form-group">
          <label>Atașează Fișiere (PDF, DOC, etc.)</label>
          <div class="file-upload-area">
            <input
              type="file"
              #fileInput
              (change)="onFileSelected($event)"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              multiple
              hidden
            />
            <button
              type="button"
              class="btn-upload"
              (click)="fileInput.click()"
            >
              <span class="icon">📎</span> Selectează Fișiere
            </button>

            <div
              *ngIf="uploadProgress() > 0 && uploadProgress() < 100"
              class="upload-progress"
            >
              <div
                class="progress-bar"
                [style.width.%]="uploadProgress()"
              ></div>
            </div>

            <div *ngIf="uploadedFiles().length > 0" class="uploaded-files">
              <div *ngFor="let file of uploadedFiles()" class="file-item">
                <span class="file-icon">📄</span>
                <span class="file-name">{{ file.name }}</span>
                <button
                  type="button"
                  class="btn-remove"
                  (click)="removeFile(file.path)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Visibility -->
        <div class="form-group">
          <label for="visibility">Vizibilitate *</label>
          <select
            id="visibility"
            formControlName="visibility"
            class="form-control"
          >
            <option value="public">🌐 Public - vizibil pentru toți</option>
            <option value="professors_only">
              👨‍🏫 Doar profesori - vizibil pentru profesori
            </option>
            <option value="private">🔒 Privat - doar pentru mine</option>
          </select>
          <small class="help-text">
            Alege cine poate vedea acest material
          </small>
        </div>

        <!-- Shared (for backwards compatibility) -->
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" formControlName="is_shared" />
            <span>Material partajat (inclusiv în biblioteca publică)</span>
          </label>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage()" class="alert alert-error">
          {{ errorMessage() }}
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="goBack()">
            Anulează
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="materialForm.invalid || isSubmitting()"
          >
            <span *ngIf="isSubmitting()">Se salvează...</span>
            <span *ngIf="!isSubmitting()">{{
              isEditMode() ? 'Salvează Modificările' : 'Creează Material'
            }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .material-form-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem;
      }

      .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .form-header h2 {
        color: #5548d9;
        font-size: 1.8rem;
        margin: 0;
      }

      .btn-back {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: #f5f5f5;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.3s;
      }

      .btn-back:hover {
        background: #e0e0e0;
      }

      .material-form {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #333;
        font-weight: 500;
      }

      .form-control {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s;
      }

      .form-control:focus {
        outline: none;
        border-color: #5548d9;
      }

      .form-control.error {
        border-color: #e53e3e;
      }

      .error-message {
        color: #e53e3e;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
      }

      .help-text {
        display: block;
        color: #666;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      /* Rich Text Editor */
      .editor-toolbar {
        display: flex;
        gap: 0.5rem;
        padding: 0.5rem;
        background: #f5f5f5;
        border: 2px solid #e0e0e0;
        border-bottom: none;
        border-radius: 8px 8px 0 0;
        align-items: center;
      }

      .toolbar-btn {
        padding: 0.4rem 0.8rem;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .toolbar-btn:hover {
        background: #e0e0e0;
      }

      .toolbar-select {
        padding: 0.4rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
      }

      .separator {
        width: 1px;
        height: 24px;
        background: #ddd;
      }

      .content-editor {
        min-height: 300px;
        padding: 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 0 0 8px 8px;
        background: white;
        outline: none;
        overflow-y: auto;
        direction: ltr; /* Force left-to-right typing */
        text-align: left; /* Ensure content starts aligned left */
      }

      .content-editor:focus {
        border-color: #5548d9;
      }

      /* File Upload */
      .file-upload-area {
        padding: 1rem;
        border: 2px dashed #e0e0e0;
        border-radius: 8px;
        text-align: center;
      }

      .btn-upload {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: #5548d9;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.3s;
      }

      .btn-upload:hover {
        background: #4437c9;
      }

      .upload-progress {
        margin-top: 1rem;
        height: 4px;
        background: #e0e0e0;
        border-radius: 2px;
        overflow: hidden;
      }

      .progress-bar {
        height: 100%;
        background: #5548d9;
        transition: width 0.3s;
      }

      .uploaded-files {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .file-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: #f5f5f5;
        border-radius: 8px;
      }

      .file-icon {
        font-size: 1.5rem;
      }

      .file-name {
        flex: 1;
        text-align: left;
      }

      .btn-remove {
        padding: 0.25rem 0.5rem;
        background: #e53e3e;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      /* Checkbox */
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
      }

      .checkbox-label input[type='checkbox'] {
        width: 1.25rem;
        height: 1.25rem;
        cursor: pointer;
      }

      /* Alert */
      .alert {
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
      }

      .alert-error {
        background: #fee;
        color: #c33;
        border: 1px solid #fcc;
      }

      /* Form Actions */
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
      }

      .btn {
        padding: 0.75rem 2rem;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-primary {
        background: #5548d9;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background: #4437c9;
      }

      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: #f5f5f5;
        color: #333;
      }

      .btn-secondary:hover {
        background: #e0e0e0;
      }

      @media (max-width: 768px) {
        .material-form-container {
          padding: 1rem;
        }

        .form-row {
          grid-template-columns: 1fr;
        }

        .form-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
      }
    `,
  ],
})
export class MaterialFormComponent implements OnInit, AfterViewInit {
  @ViewChild('contentEditor') contentEditor!: ElementRef<HTMLDivElement>;

  materialForm: FormGroup;
  isEditMode = signal(false);
  materialId = signal<number | null>(null);
  editorContent = signal('');
  uploadedFiles = signal<Array<{ name: string; path: string }>>([]);
  uploadProgress = signal(0);
  isSubmitting = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.materialForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      subject: ['', Validators.required],
      profile_type: [''],
      grade_level: [''],
      tagsInput: [''],
      visibility: ['public', Validators.required],
      is_shared: [true],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.materialId.set(+id);
      this.loadMaterial(+id);
    }
  }

  ngAfterViewInit() {
    // Set initial content if we're creating a new material
    if (!this.isEditMode() && this.contentEditor) {
      this.contentEditor.nativeElement.innerHTML = '';
    }
  }

  loadMaterial(id: number) {
    this.materialService.getMaterialById(id).subscribe({
      next: (material) => {
        this.materialForm.patchValue({
          title: material.title,
          description: material.description,
          subject: material.subject,
          profile_type: material.profile_type || '',
          grade_level: material.grade_level || '',
          tagsInput: material.tags?.join(', ') || '',
          visibility: material.visibility || 'public',
          is_shared: material.is_shared,
        });

        this.editorContent.set(material.content || '');

        // Set editor content manually after a short delay to ensure DOM is ready
        setTimeout(() => {
          if (this.contentEditor && material.content) {
            this.contentEditor.nativeElement.innerHTML = material.content;
          }
        }, 100);

        if (material.file_paths?.length) {
          const files = material.file_paths.map((path) => ({
            name: path.split('/').pop() || 'file',
            path: path,
          }));
          this.uploadedFiles.set(files);
        }
      },
      error: (err) => {
        this.errorMessage.set('Eroare la încărcarea materialului');
        console.error(err);
      },
    });
  }

  onContentChange(event: Event) {
    const target = event.target as HTMLElement;
    this.editorContent.set(target.innerHTML);
  }

  formatText(command: string) {
    document.execCommand(command, false);
  }

  formatBlock(event: Event) {
    const select = event.target as HTMLSelectElement;
    if (select.value) {
      document.execCommand('formatBlock', false, select.value);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach((file) => {
        this.uploadFile(file);
      });
    }
  }

  uploadFile(file: File) {
    this.uploadProgress.set(10);

    this.materialService.uploadFile(file).subscribe({
      next: (response) => {
        this.uploadProgress.set(100);
        this.uploadedFiles.update((files) => [
          ...files,
          { name: response.filename, path: response.file_path },
        ]);

        setTimeout(() => this.uploadProgress.set(0), 1000);
      },
      error: (err) => {
        this.uploadProgress.set(0);
        this.errorMessage.set(
          'Eroare la încărcarea fișierului: ' +
            (err.error?.detail || 'Eroare necunoscută')
        );
        console.error(err);
      },
    });
  }

  removeFile(path: string) {
    this.uploadedFiles.update((files) => files.filter((f) => f.path !== path));
  }

  onSubmit() {
    if (this.materialForm.invalid) {
      Object.keys(this.materialForm.controls).forEach((key) => {
        this.materialForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formValue = this.materialForm.value;
    const tags = formValue.tagsInput
      ? formValue.tagsInput
          .split(',')
          .map((t: string) => t.trim())
          .filter((t: string) => t)
      : [];

    const materialData: MaterialCreate = {
      title: formValue.title,
      description: formValue.description,
      content: this.editorContent(),
      subject: formValue.subject,
      profile_type: formValue.profile_type || undefined,
      grade_level: formValue.grade_level ? +formValue.grade_level : undefined,
      tags: tags,
      visibility: formValue.visibility as VisibilityType,
      is_shared: formValue.is_shared,
      file_paths: this.uploadedFiles().map((f) => f.path),
    };

    const request = this.isEditMode()
      ? this.materialService.updateMaterial(this.materialId()!, materialData)
      : this.materialService.createMaterial(materialData);

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/materials']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errorDetail = err.error?.detail || 'Eroare necunoscută';
        const statusCode = err.status || 'Fără cod de status';
        this.errorMessage.set(
          `Eroare la salvarea materialului: ${errorDetail} (Cod: ${statusCode})`
        );
        console.error('Detalii eroare:', err);
      },
    });
  }

  goBack() {
    this.router.navigate(['/materials']);
  }
}
