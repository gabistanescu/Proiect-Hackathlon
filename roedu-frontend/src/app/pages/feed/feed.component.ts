import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialService } from '../../services/material.service';
import { AuthService } from '../../services/auth.service';
import { Material } from '../../models/material.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="feed-container">
      <div class="page-header">
        <h1>📱 Flux de postări</h1>
        <p class="subtitle">Materiale partajate de comunitate</p>
      </div>

      <!-- Loading State -->
      @if (loading()) {
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Se încarcă fluxul...</p>
      </div>
      }

      <!-- Feed List -->
      @if (!loading() && materials().length > 0) {
      <div class="feed-list">
        @for (material of materials(); track material.id) {
        <div class="feed-card">
          <!-- Card Header -->
          <div class="card-header">
            <div class="author-info">
              <div class="author-avatar">
                {{ getInitials(material.professor_id) }}
              </div>
              <div class="author-details">
                <h3 class="author-name">
                  {{ getProfessorName(material.professor_id) }}
                </h3>
                <span class="post-time">{{
                  getRelativeTime(material.published_at)
                }}</span>
              </div>
            </div>

            <div class="visibility-badge">
              @if (material.visibility === 'public') {
              <span class="badge badge-public">🌐 Public</span>
              } @else if (material.visibility === 'professors_only') {
              <span class="badge badge-professors">👨‍🏫 Doar profesori</span>
              }
            </div>
          </div>

          <!-- Card Content -->
          <div class="card-content" (click)="viewMaterial(material.id)">
            <h2 class="material-title">{{ material.title }}</h2>

            @if (material.description) {
            <p class="material-description">{{ material.description }}</p>
            }

            <!-- Metadata badges -->
            <div class="material-badges">
              @if (material.profile_type) {
              <span class="badge badge-profile">{{
                getProfileLabel(material.profile_type)
              }}</span>
              } @if (material.grade_level) {
              <span class="badge badge-grade"
                >Clasa a {{ material.grade_level }}-a</span
              >
              }
              <span class="badge badge-subject">{{ material.subject }}</span>
            </div>

            <!-- Tags -->
            @if (material.tags && material.tags.length > 0) {
            <div class="tags">
              @for (tag of material.tags; track tag) {
              <span class="tag">#{{ tag }}</span>
              }
            </div>
            }

            <!-- Content Preview -->
            @if (material.content) {
            <div
              class="content-preview"
              [innerHTML]="getSafeHtml(material.content)"
            ></div>
            }

            <!-- Files indicator -->
            @if (material.file_paths && material.file_paths.length > 0) {
            <div class="files-indicator">
              📎 {{ material.file_paths.length }}
              {{
                material.file_paths.length === 1
                  ? 'fișier atașat'
                  : 'fișiere atașate'
              }}
            </div>
            }
          </div>

          <!-- Card Footer - Interactions -->
          <div class="card-footer">
            <div class="interaction-buttons">
              <!-- Like buttons - disabled (preview only) -->
              @if (isProfessor() || material.visibility === 'public') {
              <button 
                class="btn-interaction btn-professor" 
                disabled
                title="Like-uri de la profesori">
                <span class="stat-icon">💡</span>
                <span class="stat-value">{{
                  material.feedback_professors_count
                }}</span>
              </button>
              } @if (material.visibility === 'public') {
              <button 
                class="btn-interaction btn-student" 
                disabled
                title="Like-uri de la elevi">
                <span class="stat-icon">⭐</span>
                <span class="stat-value">{{
                  material.feedback_students_count
                }}</span>
              </button>
              }

              <!-- Comments button - disabled (preview only) -->
              <button 
                class="btn-interaction btn-comments" 
                disabled
                title="Comentarii">
                <span class="stat-icon">💬</span>
                <span class="stat-value">{{
                  material.comments_count || 0
                }}</span>
              </button>
            </div>

            <button class="btn-view" (click)="viewMaterial(material.id)">
              Vezi detalii →
            </button>
          </div>
        </div>
        }
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
      <div class="pagination">
        <button
          class="btn-page"
          [disabled]="currentPage() === 1"
          (click)="loadPage(currentPage() - 1)"
        >
          ← Anterior
        </button>

        <span class="page-info">
          Pagina {{ currentPage() }} din {{ totalPages() }}
        </span>

        <button
          class="btn-page"
          [disabled]="currentPage() === totalPages()"
          (click)="loadPage(currentPage() + 1)"
        >
          Următor →
        </button>
      </div>
      } }

      <!-- Empty State -->
      @if (!loading() && materials().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>Nicio postare disponibilă</h3>
        <p>Nu există materiale publicate în flux momentan.</p>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .feed-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;
      }

      .page-header {
        text-align: center;
        margin-bottom: 3rem;
      }

      .page-header h1 {
        font-size: 2.5rem;
        color: #2d3748;
        margin-bottom: 0.5rem;
      }

      .subtitle {
        color: #718096;
        font-size: 1.1rem;
      }

      /* Loading State */
      .loading-state {
        text-align: center;
        padding: 3rem;
      }

      .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #e2e8f0;
        border-top-color: #5548d9;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Feed List */
      .feed-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .feed-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: box-shadow 0.3s;
      }

      .feed-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      /* Card Header */
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .author-info {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .author-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 1.2rem;
      }

      .author-details {
        display: flex;
        flex-direction: column;
      }

      .author-name {
        font-size: 1rem;
        font-weight: 600;
        color: #2d3748;
        margin: 0;
      }

      .post-time {
        font-size: 0.875rem;
        color: #a0aec0;
      }

      .visibility-badge .badge {
        padding: 0.4rem 0.8rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .badge-public {
        background: #c6f6d5;
        color: #22543d;
      }

      .badge-professors {
        background: #fed7d7;
        color: #742a2a;
      }

      /* Card Content */
      .card-content {
        padding: 1.5rem;
        cursor: pointer;
      }

      .material-title {
        font-size: 1.5rem;
        color: #2d3748;
        margin-bottom: 0.75rem;
        font-weight: 600;
      }

      .material-description {
        color: #4a5568;
        line-height: 1.6;
        margin-bottom: 1rem;
      }

      .material-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .badge {
        padding: 0.3rem 0.7rem;
        border-radius: 15px;
        font-size: 0.875rem;
      }

      .badge-profile {
        background: #e6fffa;
        color: #234e52;
      }

      .badge-grade {
        background: #fef5e7;
        color: #7c4f00;
      }

      .badge-subject {
        background: #ebf4ff;
        color: #2c5282;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .tag {
        padding: 0.3rem 0.7rem;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 15px;
        font-size: 0.875rem;
        color: #5548d9;
      }

      .content-preview {
        max-height: 150px;
        overflow: hidden;
        position: relative;
        margin-bottom: 1rem;
        color: #4a5568;
        line-height: 1.6;
      }

      .content-preview::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 50px;
        background: linear-gradient(transparent, white);
      }

      .files-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: #f7fafc;
        border-radius: 8px;
        font-size: 0.875rem;
        color: #4a5568;
      }

      /* Card Footer */
      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        background: #f7fafc;
        border-top: 1px solid #e2e8f0;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .interaction-buttons {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        flex: 1;
      }

      .btn-interaction {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.875rem;
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        cursor: not-allowed;
        transition: all 0.3s;
        opacity: 0.85;
        min-width: 65px;
      }

      .btn-interaction:hover {
        opacity: 1;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .btn-interaction .stat-icon {
        font-size: 1.4rem;
        line-height: 1;
      }

      .btn-interaction .stat-value {
        font-size: 1rem;
        font-weight: 600;
        color: #2d3748;
        line-height: 1;
      }

      .btn-interaction.btn-professor {
        border-color: #c4b5fd;
        background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      }

      .btn-interaction.btn-professor .stat-value {
        color: #7c3aed;
      }

      .btn-interaction.btn-student {
        border-color: #fbbf24;
        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      }

      .btn-interaction.btn-student .stat-value {
        color: #d97706;
      }

      .btn-interaction.btn-comments {
        border-color: #60a5fa;
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      }

      .btn-interaction.btn-comments .stat-value {
        color: #2563eb;
      }

      .stat {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #4a5568;
      }

      .stat-icon {
        font-size: 1.2rem;
      }

      .btn-view {
        padding: 0.5rem 1.5rem;
        background: #5548d9;
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.3s;
        white-space: nowrap;
      }

      .btn-view:hover {
        background: #4338ca;
      }

      /* Pagination */
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 2rem;
        padding: 1rem;
      }

      .btn-page {
        padding: 0.5rem 1rem;
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-page:hover:not(:disabled) {
        background: #5548d9;
        color: white;
        border-color: #5548d9;
      }

      .btn-page:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .page-info {
        color: #4a5568;
        font-weight: 500;
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
        font-size: 1.5rem;
        color: #2d3748;
        margin-bottom: 0.5rem;
      }

      .empty-state p {
        color: #718096;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .feed-container {
          padding: 1rem 0.5rem;
        }

        .page-header h1 {
          font-size: 2rem;
        }

        .card-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .card-footer {
          flex-direction: column;
          gap: 1rem;
        }

        .interaction-stats {
          width: 100%;
          justify-content: space-around;
        }

        .btn-view {
          width: 100%;
        }
      }
    `,
  ],
})
export class FeedComponent implements OnInit {
  materials = signal<Material[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  currentUser = signal<any>(null);

  constructor(
    private materialService: MaterialService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);
    });

    this.loadFeed();
  }

  loadFeed() {
    this.loading.set(true);

    this.materialService.getMaterialsFeed(this.currentPage(), 10).subscribe({
      next: (response: any) => {
        this.materials.set(response.items || []);
        this.totalPages.set(response.total_pages || 1);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading feed:', err);
        this.loading.set(false);
      },
    });
  }

  loadPage(page: number) {
    this.currentPage.set(page);
    this.loadFeed();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewMaterial(id: number) {
    this.router.navigate(['/materials', id]);
  }

  isProfessor(): boolean {
    return this.currentUser()?.role === 'professor';
  }

  getProfileLabel(profile: string): string {
    const labels: any = {
      real: 'Real',
      tehnologic: 'Tehnologic',
      uman: 'Uman',
    };
    return labels[profile] || profile;
  }

  getProfessorName(professorId: number): string {
    // TODO: Fetch professor name from API or store in material
    return `Profesor #${professorId}`;
  }

  getInitials(professorId: number): string {
    // TODO: Get real initials
    return 'P' + (professorId % 10);
  }

  getRelativeTime(date: Date | string | undefined): string {
    if (!date) return 'Dată necunoscută';
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
    });
  }

  getSafeHtml(html: string): SafeHtml {
    // Strip HTML tags for preview, keep only first 200 chars
    const text = html.replace(/<[^>]*>/g, ' ').substring(0, 200);
    return this.sanitizer.sanitize(1, text + '...') || '';
  }
}
