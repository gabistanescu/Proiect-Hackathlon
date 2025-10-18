import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuggestionService } from '../../services/suggestion.service';
import { AuthService } from '../../services/auth.service';
import {
  MaterialSuggestion,
  SuggestionCreate,
  SuggestionComment,
  SuggestionCommentCreate,
  SuggestionStatus,
} from '../../models/material.model';

@Component({
  selector: 'app-material-suggestions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="suggestions-container">
      <div class="suggestions-header">
        <h2>📝 Sugestii de îmbunătățire</h2>
        @if (canCreateSuggestion()) {
        <button class="btn btn-primary" (click)="openCreateModal()">
          ➕ Sugestie nouă
        </button>
        }
      </div>

      <!-- Filters -->
      <div class="filters">
        <button
          class="filter-btn"
          [class.active]="selectedStatus() === null"
          (click)="filterByStatus(null)"
        >
          Toate ({{ getTotalCount() }})
        </button>
        <button
          class="filter-btn filter-open"
          [class.active]="selectedStatus() === 'open'"
          (click)="filterByStatus('open')"
        >
          🟢 Deschise ({{ getCountByStatus('open') }})
        </button>
        <button
          class="filter-btn filter-resolved"
          [class.active]="selectedStatus() === 'resolved'"
          (click)="filterByStatus('resolved')"
        >
          ✅ Rezolvate ({{ getCountByStatus('resolved') }})
        </button>
        <button
          class="filter-btn filter-closed"
          [class.active]="selectedStatus() === 'closed'"
          (click)="filterByStatus('closed')"
        >
          🔒 Închise ({{ getCountByStatus('closed') }})
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
      <div class="loading">
        <div class="spinner"></div>
        <p>Se încarcă sugestiile...</p>
      </div>
      }

      <!-- Suggestions List -->
      @if (!loading() && suggestions().length > 0) {
      <div class="suggestions-list">
        @for (suggestion of suggestions(); track suggestion.id) {
        <div class="suggestion-card" (click)="selectSuggestion(suggestion)">
          <div class="suggestion-header">
            <h3>{{ suggestion.title }}</h3>
            <span class="status-badge" [class]="'status-' + suggestion.status">
              {{ getStatusLabel(suggestion.status) }}
            </span>
          </div>
          <p class="suggestion-description">{{ suggestion.description }}</p>
          <div class="suggestion-meta">
            <span class="meta-item">
              👤 {{ suggestion.professor_name || 'Profesor' }}
            </span>
            <span class="meta-item">
              📅 {{ formatDate(suggestion.created_at) }}
            </span>
            <span class="meta-item">
              💬 {{ suggestion.comments_count }} comentarii
            </span>
          </div>
        </div>
        }
      </div>
      }

      <!-- Empty State -->
      @if (!loading() && suggestions().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>Nicio sugestie</h3>
        <p>
          @if (selectedStatus()) { Nu există sugestii cu acest status } @else {
          Nu există sugestii pentru acest material }
        </p>
      </div>
      }

      <!-- Create Suggestion Modal -->
      @if (showCreateModal()) {
      <div class="modal-overlay" (click)="closeCreateModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>➕ Sugestie nouă</h3>
            <button class="btn-close" (click)="closeCreateModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Titlu *</label>
              <input
                type="text"
                [(ngModel)]="newSuggestion.title"
                placeholder="Scurt și descriptiv..."
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Descriere *</label>
              <textarea
                [(ngModel)]="newSuggestion.description"
                placeholder="Descrie detaliat îmbunătățirea propusă..."
                rows="6"
                class="form-control"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeCreateModal()">
              Anulează
            </button>
            <button
              class="btn btn-primary"
              [disabled]="!isValidNewSuggestion()"
              (click)="createSuggestion()"
            >
              Creează sugestie
            </button>
          </div>
        </div>
      </div>
      }

      <!-- Suggestion Detail Modal -->
      @if (selectedSuggestion()) {
      <div class="modal-overlay" (click)="closeSuggestionDetail()">
        <div
          class="modal-content modal-large"
          (click)="$event.stopPropagation()"
        >
          <div class="modal-header">
            <div class="detail-header">
              <h3>{{ selectedSuggestion()!.title }}</h3>
              <span
                class="status-badge"
                [class]="'status-' + selectedSuggestion()!.status"
              >
                {{ getStatusLabel(selectedSuggestion()!.status) }}
              </span>
            </div>
            <button class="btn-close" (click)="closeSuggestionDetail()">
              ✕
            </button>
          </div>

          <div class="modal-body">
            <!-- Suggestion Info -->
            <div class="suggestion-info">
              <span class="info-item">
                👤 {{ selectedSuggestion()!.professor_name || 'Profesor' }}
              </span>
              <span class="info-item">
                📅 {{ formatDate(selectedSuggestion()!.created_at) }}
              </span>
            </div>

            <div class="suggestion-detail-description">
              {{ selectedSuggestion()!.description }}
            </div>

            <!-- Status Actions (only for material owner) -->
            @if (canChangeStatus()) {
            <div class="status-actions">
              @if (selectedSuggestion()!.status === 'open') {
              <button
                class="btn btn-success"
                (click)="updateStatus('resolved')"
              >
                ✅ Marchează ca rezolvată
              </button>
              <button
                class="btn btn-secondary"
                (click)="updateStatus('closed')"
              >
                🔒 Închide
              </button>
              } @else if (selectedSuggestion()!.status === 'resolved') {
              <button class="btn btn-secondary" (click)="updateStatus('open')">
                🔄 Redeschide
              </button>
              <button
                class="btn btn-secondary"
                (click)="updateStatus('closed')"
              >
                🔒 Închide
              </button>
              } @else {
              <button class="btn btn-secondary" (click)="updateStatus('open')">
                🔄 Redeschide
              </button>
              }
            </div>
            }

            <!-- Comments Section -->
            <div class="comments-section">
              <h4>💬 Comentarii ({{ comments().length }})</h4>

              <!-- Comments List -->
              @if (comments().length > 0) {
              <div class="comments-list">
                @for (comment of comments(); track comment.id) {
                <div class="comment-card">
                  <div class="comment-header">
                    <span class="comment-author">
                      👤 {{ comment.professor_name || 'Profesor' }}
                    </span>
                    <span class="comment-date">
                      {{ formatDate(comment.created_at) }}
                    </span>
                    @if (canDeleteComment(comment)) {
                    <button
                      class="btn-delete-comment"
                      (click)="deleteComment(comment.id)"
                      title="Șterge comentariu"
                    >
                      🗑️
                    </button>
                    }
                  </div>
                  <p class="comment-content">{{ comment.content }}</p>
                </div>
                }
              </div>
              }

              <!-- Add Comment Form -->
              <div class="add-comment">
                <textarea
                  [(ngModel)]="newComment"
                  placeholder="Adaugă un comentariu..."
                  rows="3"
                  class="form-control"
                ></textarea>
                <button
                  class="btn btn-primary btn-sm"
                  [disabled]="!newComment.trim()"
                  (click)="addComment()"
                >
                  💬 Adaugă comentariu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .suggestions-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .suggestions-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .suggestions-header h2 {
        color: #333;
        font-size: 1.8rem;
        margin: 0;
      }

      /* Filters */
      .filters {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }

      .filter-btn {
        padding: 0.6rem 1.2rem;
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        font-weight: 500;
      }

      .filter-btn:hover {
        border-color: #5548d9;
      }

      .filter-btn.active {
        background: #5548d9;
        color: white;
        border-color: #5548d9;
      }

      .filter-open.active {
        background: #48bb78;
        border-color: #48bb78;
      }

      .filter-resolved.active {
        background: #3182ce;
        border-color: #3182ce;
      }

      .filter-closed.active {
        background: #718096;
        border-color: #718096;
      }

      /* Loading */
      .loading {
        text-align: center;
        padding: 3rem;
      }

      .spinner {
        width: 40px;
        height: 40px;
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

      /* Suggestions List */
      .suggestions-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .suggestion-card {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        border: 2px solid #e0e0e0;
        cursor: pointer;
        transition: all 0.3s;
      }

      .suggestion-card:hover {
        border-color: #5548d9;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(85, 72, 217, 0.15);
      }

      .suggestion-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
        gap: 1rem;
      }

      .suggestion-header h3 {
        color: #333;
        font-size: 1.2rem;
        margin: 0;
        flex: 1;
      }

      .status-badge {
        padding: 0.4rem 0.8rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        white-space: nowrap;
      }

      .status-open {
        background: #c6f6d5;
        color: #22543d;
      }

      .status-resolved {
        background: #bee3f8;
        color: #2c5282;
      }

      .status-closed {
        background: #e2e8f0;
        color: #2d3748;
      }

      .suggestion-description {
        color: #666;
        margin-bottom: 1rem;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .suggestion-meta {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
      }

      .meta-item {
        font-size: 0.875rem;
        color: #666;
      }

      /* Empty State */
      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
      }

      .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      .empty-state h3 {
        color: #333;
        margin-bottom: 0.5rem;
      }

      .empty-state p {
        color: #666;
      }

      /* Modal */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 2rem;
      }

      .modal-content {
        background: white;
        border-radius: 12px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }

      .modal-large {
        max-width: 800px;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 1.5rem;
        border-bottom: 1px solid #e0e0e0;
      }

      .detail-header {
        flex: 1;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
      }

      .modal-header h3 {
        color: #333;
        font-size: 1.5rem;
        margin: 0;
        flex: 1;
      }

      .btn-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
        padding: 0;
        line-height: 1;
      }

      .btn-close:hover {
        color: #333;
      }

      .modal-body {
        padding: 1.5rem;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1.5rem;
        border-top: 1px solid #e0e0e0;
      }

      /* Form */
      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #333;
        font-weight: 600;
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

      /* Suggestion Detail */
      .suggestion-info {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e0e0e0;
      }

      .info-item {
        font-size: 0.875rem;
        color: #666;
      }

      .suggestion-detail-description {
        color: #333;
        line-height: 1.8;
        margin-bottom: 2rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
      }

      /* Status Actions */
      .status-actions {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #e0e0e0;
      }

      /* Comments */
      .comments-section h4 {
        color: #333;
        margin-bottom: 1rem;
      }

      .comments-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .comment-card {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
      }

      .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .comment-author {
        font-weight: 600;
        color: #333;
        font-size: 0.9rem;
      }

      .comment-date {
        font-size: 0.85rem;
        color: #666;
      }

      .btn-delete-comment {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        opacity: 0.6;
        transition: opacity 0.3s;
      }

      .btn-delete-comment:hover {
        opacity: 1;
      }

      .comment-content {
        color: #333;
        line-height: 1.6;
        margin: 0;
      }

      .add-comment {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      /* Buttons */
      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
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
        background: #e0e0e0;
        color: #333;
      }

      .btn-secondary:hover {
        background: #d0d0d0;
      }

      .btn-success {
        background: #48bb78;
        color: white;
      }

      .btn-success:hover {
        background: #38a169;
      }

      .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        align-self: flex-end;
      }

      @media (max-width: 768px) {
        .suggestions-container {
          padding: 1rem;
        }

        .suggestions-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .modal-overlay {
          padding: 0.5rem;
        }

        .status-actions {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class MaterialSuggestionsComponent implements OnInit {
  @Input() materialId!: number;
  @Input() materialOwnerId!: number;

  suggestions = signal<MaterialSuggestion[]>([]);
  loading = signal(true);
  selectedStatus = signal<SuggestionStatus | null>(null);
  showCreateModal = signal(false);
  selectedSuggestion = signal<MaterialSuggestion | null>(null);
  comments = signal<SuggestionComment[]>([]);

  newSuggestion: SuggestionCreate = {
    title: '',
    description: '',
  };

  newComment = '';
  currentUser = signal<any>(null);

  constructor(
    private suggestionService: SuggestionService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);
    });

    this.loadSuggestions();
  }

  loadSuggestions() {
    this.loading.set(true);

    const params: any = {};
    if (this.selectedStatus()) {
      params.status = this.selectedStatus();
    }

    this.suggestionService.listSuggestions(this.materialId, params).subscribe({
      next: (suggestions) => {
        this.suggestions.set(suggestions);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading suggestions:', err);
        this.loading.set(false);
      },
    });
  }

  filterByStatus(status: SuggestionStatus | null) {
    this.selectedStatus.set(status);
    this.loadSuggestions();
  }

  getTotalCount(): number {
    return this.suggestions().length;
  }

  getCountByStatus(status: SuggestionStatus): number {
    return this.suggestions().filter((s) => s.status === status).length;
  }

  getStatusLabel(status: SuggestionStatus): string {
    const labels = {
      open: 'Deschisă',
      resolved: 'Rezolvată',
      closed: 'Închisă',
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  canCreateSuggestion(): boolean {
    const user = this.currentUser();
    return user?.role === 'professor' && user?.id !== this.materialOwnerId;
  }

  canChangeStatus(): boolean {
    const user = this.currentUser();
    return user?.role === 'professor' && user?.id === this.materialOwnerId;
  }

  canDeleteComment(comment: SuggestionComment): boolean {
    const user = this.currentUser();
    return user?.role === 'professor' && user?.id === comment.professor_id;
  }

  openCreateModal() {
    this.newSuggestion = { title: '', description: '' };
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  isValidNewSuggestion(): boolean {
    return (
      this.newSuggestion.title.trim().length > 0 &&
      this.newSuggestion.description.trim().length > 0
    );
  }

  createSuggestion() {
    if (!this.isValidNewSuggestion()) return;

    this.suggestionService
      .createSuggestion(this.materialId, this.newSuggestion)
      .subscribe({
        next: (suggestion) => {
          this.suggestions.update((list) => [suggestion, ...list]);
          this.closeCreateModal();
        },
        error: (err) => {
          console.error('Error creating suggestion:', err);
          alert('Eroare la crearea sugestiei');
        },
      });
  }

  selectSuggestion(suggestion: MaterialSuggestion) {
    this.selectedSuggestion.set(suggestion);
    this.loadComments(suggestion.id);
  }

  closeSuggestionDetail() {
    this.selectedSuggestion.set(null);
    this.comments.set([]);
    this.newComment = '';
  }

  loadComments(suggestionId: number) {
    this.suggestionService.listComments(suggestionId).subscribe({
      next: (comments) => {
        this.comments.set(comments);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
      },
    });
  }

  updateStatus(status: SuggestionStatus) {
    const suggestion = this.selectedSuggestion();
    if (!suggestion) return;

    this.suggestionService
      .updateSuggestion(suggestion.id, { status })
      .subscribe({
        next: (updated) => {
          // Update in list
          this.suggestions.update((list) =>
            list.map((s) => (s.id === updated.id ? updated : s))
          );
          // Update selected
          this.selectedSuggestion.set(updated);
        },
        error: (err) => {
          console.error('Error updating suggestion:', err);
          alert('Eroare la actualizarea sugestiei');
        },
      });
  }

  addComment() {
    const suggestion = this.selectedSuggestion();
    if (!suggestion || !this.newComment.trim()) return;

    const commentData: SuggestionCommentCreate = {
      content: this.newComment.trim(),
    };

    this.suggestionService.createComment(suggestion.id, commentData).subscribe({
      next: (comment) => {
        this.comments.update((list) => [...list, comment]);
        this.newComment = '';

        // Update comment count in suggestion
        const updated = {
          ...suggestion,
          comments_count: suggestion.comments_count + 1,
        };
        this.selectedSuggestion.set(updated);
        this.suggestions.update((list) =>
          list.map((s) => (s.id === updated.id ? updated : s))
        );
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        alert('Eroare la adăugarea comentariului');
      },
    });
  }

  deleteComment(commentId: number) {
    if (!confirm('Sigur doriți să ștergeți acest comentariu?')) return;

    this.suggestionService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments.update((list) => list.filter((c) => c.id !== commentId));

        // Update comment count in suggestion
        const suggestion = this.selectedSuggestion();
        if (suggestion) {
          const updated = {
            ...suggestion,
            comments_count: suggestion.comments_count - 1,
          };
          this.selectedSuggestion.set(updated);
          this.suggestions.update((list) =>
            list.map((s) => (s.id === updated.id ? updated : s))
          );
        }
      },
      error: (err) => {
        console.error('Error deleting comment:', err);
        alert('Eroare la ștergerea comentariului');
      },
    });
  }
}
