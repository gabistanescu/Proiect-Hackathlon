import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
} from '@angular/platform-browser';
import { MaterialService } from '../../services/material.service';
import { Material } from '../../models/material.model';
import { AuthService } from '../../services/auth.service';
import { QuizService } from '../../services/quiz.service';
import { CommentService } from '../../services/comment.service';
import { Comment } from '../../models/comment.model';
import { MaterialSuggestionsComponent } from './material-suggestions.component';

@Component({
  selector: 'app-material-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialSuggestionsComponent],
  template: `
    <div class="material-detail-container">
      @if (loading()) {
      <div class="loading">
        <div class="spinner"></div>
        <p>Se încarcă materialul...</p>
      </div>
      } @else if (material()) {
      <div class="material-header">
        <button class="btn-back" (click)="goBack()">
          <span class="icon">←</span> Înapoi
        </button>

        @if (canEdit()) {
        <div class="actions">
          <button class="btn btn-edit" (click)="editMaterial()">
            ✏️ Editează
          </button>
          <button class="btn btn-delete" (click)="deleteMaterial()">
            🗑️ Șterge
          </button>
        </div>
        }

        <!-- Generate AI Quiz Button -->
        <button class="btn btn-ai" (click)="generateAIQuiz()" [disabled]="isGeneratingQuiz()">
          {{ isGeneratingQuiz() ? '⏳ Se generează...' : '🤖 Generează Test cu AI' }}
        </button>
      </div>

      <div class="material-content">
        <!-- Title and metadata -->
        <div class="material-meta">
          <h1>{{ material()!.title }}</h1>

          <div class="meta-tags">
            @if (material()!.profile_type) {
            <span class="badge badge-profile">{{
              getProfileLabel(material()!.profile_type!)
            }}</span>
            } @if (material()!.grade_level) {
            <span class="badge badge-grade"
              >Clasa a {{ material()!.grade_level }}-a</span
            >
            }
            <span class="badge badge-subject">{{ material()!.subject }}</span>
            @if (material()!.visibility === 'private') {
            <span class="badge badge-private">🔒 Privat</span>
            } @else if (material()!.visibility === 'professors_only') {
            <span class="badge badge-professors">👨‍🏫 Doar profesori</span>
            } @else {
            <span class="badge badge-public">🌐 Public</span>
            }
          </div>

          @if (material()!.tags && material()!.tags!.length > 0) {
          <div class="tags">
            @for (tag of material()!.tags; track tag) {
            <span class="tag">{{ tag }}</span>
            }
          </div>
          } @if (material()!.description) {
          <p class="description">{{ material()!.description }}</p>
          }
        </div>

        <!-- Feedback Section -->
        <div class="feedback-section">
          <h3>💡 Feedback</h3>
          <div class="feedback-stats">
            <div class="stat-card">
              <div class="stat-icon">👨‍🏫</div>
              <div class="stat-info">
                <div class="stat-number">
                  {{ material()!.feedback_professors_count || 0 }}
                </div>
                <div class="stat-label">Profesori</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">👨‍🎓</div>
              <div class="stat-info">
                <div class="stat-number">
                  {{ material()!.feedback_students_count || 0 }}
                </div>
                <div class="stat-label">Studenți</div>
              </div>
            </div>
          </div>

          <!-- Feedback button only for non-owners -->
          @if (isProfessor() && !canEdit()) {
          <button
            class="btn-feedback"
            [class.active]="material()!.user_has_feedback"
            (click)="toggleProfessorFeedback()"
          >
            <span class="btn-icon">💡</span>
            <span class="btn-text">
              {{
                material()!.user_has_feedback ? 'M-a ajutat!' : 'Material util?'
              }}
            </span>
          </button>
          } @if (isStudent()) {
          <button
            class="btn-feedback"
            [class.active]="material()!.user_has_feedback"
            (click)="toggleStudentFeedback()"
          >
            <span class="btn-icon">⭐</span>
            <span class="btn-text">
              {{
                material()!.user_has_feedback ? 'M-a ajutat!' : 'Material util?'
              }}
            </span>
          </button>
          } @if (isProfessor() && material()!.suggestions_count > 0) {
          <div class="suggestions-link">
            <button class="btn-suggestions" (click)="showSuggestions()">
              📝 {{ material()!.suggestions_count }}
              {{
                material()!.suggestions_count === 1 ? 'Sugestie' : 'Sugestii'
              }}
            </button>
          </div>
          } @if (isProfessor() && canSuggest()) {
          <button class="btn-add-suggestion" (click)="addSuggestion()">
            ➕ Propune îmbunătățire
          </button>
          }
        </div>

        <!-- Rich Text Content -->
        @if (material()!.content) {
        <div class="content-section">
          <h3>Conținut</h3>
          <div
            class="rich-content"
            [innerHTML]="getSafeHtml(material()!.content!)"
          ></div>
        </div>
        }

        <!-- Attached Files -->
        @if (material()!.file_paths && material()!.file_paths.length > 0) {
        <div class="files-section">
          <h3>Fișiere Atașate</h3>
          <div class="files-list">
            @for (filePath of material()!.file_paths; track filePath) {
            <div class="file-card">
              <div class="file-info">
                <span class="file-icon">
                  @if (isPdf(filePath)) { 📄 } @else { 📎 }
                </span>
                <span class="file-name">{{ getFileName(filePath) }}</span>
              </div>
              <div class="file-actions">
                @if (isPdf(filePath)) {
                <button class="btn-file" (click)="viewFile(filePath)">
                  👁️ Vizualizează
                </button>
                }
                <a
                  [href]="getFileUrl(filePath)"
                  download
                  class="btn-file btn-download"
                >
                  ⬇️ Descarcă
                </a>
              </div>
            </div>
            }
          </div>
        </div>
        }

        <!-- Comments Section -->
        <div class="comments-section">
          <h3>💬 Comentarii ({{ comments().length }})</h3>

          <!-- Add Comment Form -->
          <div class="add-comment-form">
            <textarea
              [(ngModel)]="newCommentText"
              placeholder="Adaugă un comentariu..."
              class="comment-textarea"
              rows="3"
            ></textarea>
            <button
              class="btn btn-primary"
              (click)="addComment()"
              [disabled]="!newCommentText.trim() || isSubmittingComment()"
            >
              {{
                isSubmittingComment()
                  ? 'Se trimite...'
                  : '📝 Trimite comentariul'
              }}
            </button>
          </div>

          <!-- Comments List -->
          @if (comments().length === 0) {
          <p class="no-comments">
            Niciun comentariu încă. Fii primul care comentează!
          </p>
          } @else {
          <div class="comments-list">
            @for (comment of comments(); track comment.id) {
            <div class="comment-card">
              <div class="comment-header">
                <span class="comment-author">
                  {{ comment.username || 'Anonim' }}
                </span>
                <span class="comment-date">{{
                  formatDate(comment.created_at)
                }}</span>
              </div>
              <div class="comment-content">
                {{ comment.text }}
              </div>
              @if (canDeleteComment(comment)) {
              <button
                class="btn-delete-comment"
                (click)="deleteComment(comment.id)"
              >
                🗑️ Șterge
              </button>
              }
            </div>
            }
          </div>
          }
        </div>

        <!-- PDF Viewer Modal -->
        @if (selectedPdf()) {
        <div class="pdf-viewer-modal" (click)="closePdfViewer()">
          <div class="pdf-viewer-container" (click)="$event.stopPropagation()">
            <div class="pdf-header">
              <h4>{{ getFileName(selectedPdf()!) }}</h4>
              <button class="btn-close" (click)="closePdfViewer()">✕</button>
            </div>
            <iframe
              [src]="getSafePdfUrl(selectedPdf()!)"
              class="pdf-iframe"
              frameborder="0"
            ></iframe>
          </div>
        </div>
        }
      </div>

      <!-- Suggestions Modal -->
      @if (showSuggestionsModal() && isProfessor()) {
      <div class="suggestions-modal-overlay" (click)="hideSuggestionsModal()">
        <div
          class="suggestions-modal-container"
          (click)="$event.stopPropagation()"
        >
          <button
            class="btn-close-suggestions"
            (click)="hideSuggestionsModal()"
          >
            ✕
          </button>
          <app-material-suggestions
            [materialId]="material()!.id"
            [materialOwnerId]="material()!.professor_id"
          ></app-material-suggestions>
        </div>
      </div>
      } } @else {
      <div class="error-state">
        <p>Materialul nu a fost găsit</p>
        <button class="btn btn-primary" (click)="goBack()">
          Înapoi la listă
        </button>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .material-detail-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 2rem;
      }

      /* Loading State */
      .loading {
        text-align: center;
        padding: 4rem;
      }

      .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #5548d9;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Header */
      .material-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
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

      .actions {
        display: flex;
        gap: 0.5rem;
      }

      /* Content */
      .material-content {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .material-meta h1 {
        color: #333;
        font-size: 2rem;
        margin-bottom: 1rem;
      }

      .meta-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .badge {
        padding: 0.4rem 0.8rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .badge-profile {
        background: #e3f2fd;
        color: #1976d2;
      }

      .badge-grade {
        background: #f3e5f5;
        color: #7b1fa2;
      }

      .badge-subject {
        background: #e8f5e9;
        color: #388e3c;
      }

      .badge-private {
        background: #fff3e0;
        color: #f57c00;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .tag {
        padding: 0.3rem 0.7rem;
        background: #f5f5f5;
        border-radius: 15px;
        font-size: 0.875rem;
        color: #666;
      }

      .description {
        color: #666;
        line-height: 1.6;
        margin-bottom: 2rem;
      }

      /* Feedback Section */
      .feedback-section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 12px;
        border: 2px solid #dee2e6;
      }

      .feedback-section h3 {
        color: #5548d9;
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
      }

      .feedback-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        transition: transform 0.3s;
      }

      .stat-card:hover {
        transform: translateY(-2px);
      }

      .stat-icon {
        font-size: 2.5rem;
      }

      .stat-info {
        flex: 1;
      }

      .stat-number {
        font-size: 2rem;
        font-weight: bold;
        color: #5548d9;
        line-height: 1;
      }

      .stat-label {
        font-size: 0.875rem;
        color: #666;
        margin-top: 0.25rem;
      }

      .btn-feedback {
        width: 100%;
        padding: 1rem 1.5rem;
        background: white;
        border: 3px solid #e0e0e0;
        border-radius: 10px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .btn-feedback:hover {
        background: #f8f9fa;
        border-color: #5548d9;
      }

      .btn-feedback.active {
        background: linear-gradient(135deg, #ffd54f 0%, #ffb300 100%);
        border-color: #ff9800;
        color: #fff;
        box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
      }

      .btn-icon {
        font-size: 1.5rem;
      }

      .btn-text {
        font-size: 1rem;
      }

      .suggestions-link {
        margin-bottom: 1rem;
      }

      .btn-suggestions {
        width: 100%;
        padding: 0.75rem 1.5rem;
        background: #e3f2fd;
        border: 2px solid #1976d2;
        border-radius: 8px;
        color: #1976d2;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-suggestions:hover {
        background: #1976d2;
        color: white;
      }

      .btn-add-suggestion {
        width: 100%;
        padding: 0.75rem 1.5rem;
        background: white;
        border: 2px dashed #5548d9;
        border-radius: 8px;
        color: #5548d9;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-add-suggestion:hover {
        background: #5548d9;
        color: white;
        border-style: solid;
      }

      /* Content Section */
      .content-section {
        margin-bottom: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #e0e0e0;
      }

      .content-section h3 {
        color: #5548d9;
        margin-bottom: 1rem;
      }

      .rich-content {
        line-height: 1.8;
        color: #333;
      }

      .rich-content h1,
      .rich-content h2,
      .rich-content h3 {
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        color: #333;
      }

      .rich-content ul,
      .rich-content ol {
        margin-left: 2rem;
        margin-bottom: 1rem;
      }

      .rich-content p {
        margin-bottom: 1rem;
      }

      /* Files Section */
      .files-section {
        margin-top: 2rem;
      }

      .files-section h3 {
        color: #5548d9;
        margin-bottom: 1rem;
      }

      .files-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .file-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
      }

      .file-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .file-icon {
        font-size: 1.5rem;
      }

      .file-name {
        color: #333;
        font-weight: 500;
      }

      .file-actions {
        display: flex;
        gap: 0.5rem;
      }

      .btn-file {
        padding: 0.5rem 1rem;
        background: #5548d9;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        text-decoration: none;
        transition: background 0.3s;
        display: inline-block;
      }

      .btn-file:hover {
        background: #4437c9;
      }

      .btn-download {
        background: #48bb78;
      }

      .btn-download:hover {
        background: #38a169;
      }

      /* Comments Section */
      .comments-section {
        margin-top: 3rem;
        padding: 2rem;
        background: white;
        border-radius: 12px;
        border: 2px solid #e2e8f0;
      }

      .comments-section h3 {
        color: #2d3748;
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
      }

      .add-comment-form {
        margin-bottom: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .comment-textarea {
        width: 100%;
        padding: 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        font-family: inherit;
        resize: vertical;
        transition: border-color 0.3s;
      }

      .comment-textarea:focus {
        outline: none;
        border-color: #5548d9;
      }

      .no-comments {
        text-align: center;
        color: #a0aec0;
        padding: 2rem;
        font-style: italic;
      }

      .comments-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .comment-card {
        padding: 1.5rem;
        background: #f7fafc;
        border-radius: 8px;
        border-left: 4px solid #5548d9;
      }

      .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .comment-author {
        font-weight: 600;
        color: #2d3748;
        font-size: 0.95rem;
      }

      .comment-date {
        color: #a0aec0;
        font-size: 0.85rem;
      }

      .comment-content {
        color: #4a5568;
        line-height: 1.6;
        margin-bottom: 0.75rem;
      }

      .btn-delete-comment {
        background: #fc8181;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background 0.3s;
      }

      .btn-delete-comment:hover {
        background: #f56565;
      }

      /* PDF Viewer Modal */
      .pdf-viewer-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 2rem;
      }

      .pdf-viewer-container {
        width: 100%;
        max-width: 1200px;
        height: 90vh;
        background: white;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .pdf-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        background: #5548d9;
        color: white;
      }

      .pdf-header h4 {
        margin: 0;
        font-size: 1.1rem;
      }

      .btn-close {
        background: transparent;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
      }

      .pdf-iframe {
        flex: 1;
        width: 100%;
        border: none;
      }

      /* Buttons */
      .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        font-size: 0.9rem;
      }

      .btn-edit {
        background: #5548d9;
        color: white;
      }

      .btn-edit:hover {
        background: #4437c9;
      }

      .btn-delete {
        background: #e53e3e;
        color: white;
      }

      .btn-delete:hover {
        background: #c53030;
      }

      .btn-ai {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;
      }

      .btn-ai:hover:not(:disabled) {
        background: linear-gradient(135deg, #5568d4 0%, #653a91 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      .btn-ai:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .btn-primary {
        background: #5548d9;
        color: white;
        padding: 0.75rem 2rem;
      }

      .btn-primary:hover {
        background: #4437c9;
      }

      /* Error State */
      .error-state {
        text-align: center;
        padding: 4rem;
      }

      .error-state p {
        font-size: 1.2rem;
        color: #666;
        margin-bottom: 2rem;
      }

      /* Suggestions Modal */
      .suggestions-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        z-index: 2000;
        overflow-y: auto;
      }

      .suggestions-modal-container {
        background: white;
        min-height: 100vh;
        position: relative;
      }

      .btn-close-suggestions {
        position: fixed;
        top: 1rem;
        right: 1rem;
        background: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 1.5rem;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 2001;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
      }

      .btn-close-suggestions:hover {
        background: #f5f5f5;
        transform: scale(1.1);
      }

      @media (max-width: 768px) {
        .material-detail-container {
          padding: 1rem;
        }

        .material-meta h1 {
          font-size: 1.5rem;
        }

        .file-card {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .pdf-viewer-modal {
          padding: 0.5rem;
        }

        .pdf-viewer-container {
          height: 95vh;
        }
      }
    `,
  ],
})
export class MaterialDetailComponent implements OnInit {
  material = signal<Material | null>(null);
  loading = signal(true);
  selectedPdf = signal<string | null>(null);
  currentUser = signal<any>(null);
  showSuggestionsModal = signal(false);
  isGeneratingQuiz = signal(false);

  // Comments
  comments = signal<Comment[]>([]);
  newCommentText = '';
  isSubmittingComment = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materialService: MaterialService,
    private authService: AuthService,
    private quizService: QuizService,
    private commentService: CommentService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMaterial(+id);
      this.loadComments(+id);
    }
  }

  loadMaterial(id: number) {
    this.materialService.getMaterialById(id).subscribe({
      next: (material) => {
        this.material.set(material);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading material:', err);
        this.loading.set(false);
      },
    });
  }

  loadComments(materialId: number) {
    this.commentService.getComments(materialId).subscribe({
      next: (comments) => {
        this.comments.set(comments);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
      },
    });
  }

  addComment() {
    const mat = this.material();
    if (!mat || !this.newCommentText.trim()) return;

    this.isSubmittingComment.set(true);

    this.commentService
      .createComment({
        material_id: mat.id,
        text: this.newCommentText.trim(),
        is_question: false,
      })
      .subscribe({
        next: (comment) => {
          this.comments.set([comment, ...this.comments()]);
          this.newCommentText = '';
          this.isSubmittingComment.set(false);
        },
        error: (err) => {
          console.error('Error adding comment:', err);
          alert('Eroare la adăugarea comentariului');
          this.isSubmittingComment.set(false);
        },
      });
  }

  deleteComment(commentId: number) {
    if (!confirm('Sigur vrei să ștergi acest comentariu?')) return;

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments.set(this.comments().filter((c) => c.id !== commentId));
      },
      error: (err) => {
        console.error('Error deleting comment:', err);
        alert('Eroare la ștergerea comentariului');
      },
    });
  }

  canDeleteComment(comment: Comment): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Poate șterge propriul comentariu sau dacă este owner-ul materialului
    return comment.user_id === user.id || this.canEdit();
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Acum';
    if (minutes < 60) return `Acum ${minutes} min`;
    if (hours < 24) return `Acum ${hours}h`;
    if (days < 7) return `Acum ${days} zile`;

    return d.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  canEdit(): boolean {
    const user = this.currentUser();
    const mat = this.material();
    if (!user || !mat) return false;

    return user.role === 'professor' && user.id === mat.professor_id;
  }

  isProfessor(): boolean {
    return this.currentUser()?.role === 'professor';
  }

  isStudent(): boolean {
    return this.currentUser()?.role === 'student';
  }

  canSuggest(): boolean {
    // Professors can suggest on materials that are not theirs
    const user = this.currentUser();
    const mat = this.material();
    if (!user || !mat) return false;

    return user.role === 'professor' && user.id !== mat.professor_id;
  }

  toggleProfessorFeedback() {
    const mat = this.material();
    if (!mat) return;

    this.materialService.toggleProfessorFeedback(mat.id).subscribe({
      next: (response) => {
        // Update material locally
        this.material.set({
          ...mat,
          user_has_feedback: response.has_feedback,
          feedback_professors_count: response.total_count,
        });
      },
      error: (err) => {
        console.error('Error toggling professor feedback:', err);
        alert('Eroare la salvarea feedback-ului');
      },
    });
  }

  toggleStudentFeedback() {
    const mat = this.material();
    if (!mat) return;

    this.materialService.toggleStudentFeedback(mat.id).subscribe({
      next: (response) => {
        // Update material locally
        this.material.set({
          ...mat,
          user_has_feedback: response.has_feedback,
          feedback_students_count: response.total_count,
        });
      },
      error: (err) => {
        console.error('Error toggling student feedback:', err);
        alert('Eroare la salvarea feedback-ului');
      },
    });
  }

  showSuggestions() {
    this.showSuggestionsModal.set(true);
  }

  hideSuggestionsModal() {
    this.showSuggestionsModal.set(false);
    // Reload material to get updated suggestions count
    const mat = this.material();
    if (mat) {
      this.loadMaterial(mat.id);
    }
  }

  addSuggestion() {
    this.showSuggestionsModal.set(true);
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getSafePdfUrl(path: string): SafeResourceUrl {
    const url = this.getFileUrl(path);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getFileUrl(path: string): string {
    // Assuming backend serves files at /uploads
    return `http://localhost:8000${path}`;
  }

  getFileName(path: string): string {
    return path.split('/').pop() || 'file';
  }

  isPdf(path: string): boolean {
    return path.toLowerCase().endsWith('.pdf');
  }

  getProfileLabel(profileType: string): string {
    const labels: { [key: string]: string } = {
      real: 'Real',
      uman: 'Uman',
      tehnologic: 'Tehnologic',
    };
    return labels[profileType] || profileType;
  }

  viewFile(path: string) {
    this.selectedPdf.set(path);
  }

  closePdfViewer() {
    this.selectedPdf.set(null);
  }

  editMaterial() {
    this.router.navigate(['/materials/edit', this.material()!.id]);
  }

  deleteMaterial() {
    if (confirm('Sigur doriți să ștergeți acest material?')) {
      this.materialService.deleteMaterial(this.material()!.id).subscribe({
        next: () => {
          this.router.navigate(['/materials']);
        },
        error: (err) => {
          console.error('Error deleting material:', err);
          alert('Eroare la ștergerea materialului');
        },
      });
    }
  }

  goBack() {
    this.router.navigate(['/materials']);
  }

  generateAIQuiz() {
    const mat = this.material();
    if (!mat) return;

    this.isGeneratingQuiz.set(true);
    this.quizService.generateQuizFromMaterial(mat.id).subscribe({
      next: (quiz) => {
        this.isGeneratingQuiz.set(false);
        alert('Test generat cu succes! Poți să-l iei pentru a te antren.');
        this.router.navigate(['/quizzes', quiz.id]);
      },
      error: (err) => {
        this.isGeneratingQuiz.set(false);
        console.error('Error generating AI quiz:', err);
        alert('Eroare la generarea testului cu AI. Încearcă din nou.');
      },
    });
  }
}
