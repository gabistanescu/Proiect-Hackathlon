import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialService } from '../../services/material.service';
import { AuthService } from '../../services/auth.service';
import { Material } from '../../models/material.model';

@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="materials-container">
      <div class="page-header">
        <h1>📚 Materiale Educaționale</h1>
        @if (isProfessor()) {
        <button class="btn btn-primary" (click)="createMaterial()">
          ➕ Material Nou
        </button>
        }
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="search-bar">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Caută materiale..."
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>

        <div class="filter-controls">
          <select
            [(ngModel)]="selectedProfile"
            (change)="applyFilters()"
            class="filter-select"
          >
            <option value="">Toate profilurile</option>
            <option value="real">Real</option>
            <option value="uman">Uman</option>
            <option value="tehnologic">Tehnologic</option>
          </select>

          <select
            [(ngModel)]="selectedGrade"
            (change)="applyFilters()"
            class="filter-select"
          >
            <option value="">Toate clasele</option>
            <option value="9">Clasa a IX-a</option>
            <option value="10">Clasa a X-a</option>
            <option value="11">Clasa a XI-a</option>
            <option value="12">Clasa a XII-a</option>
          </select>

          <input
            type="text"
            [(ngModel)]="selectedSubject"
            (input)="applyFilters()"
            placeholder="Materie..."
            class="filter-input"
          />
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Se încarcă materialele...</p>
      </div>
      }

      <!-- Materials Grid -->
      @if (!loading() && materials().length > 0) {
      <div class="materials-grid">
        @for (material of materials(); track material.id) {
        <div class="material-card" (click)="viewMaterial(material.id)">
          <div class="card-header">
            <h3>{{ material.title }}</h3>
            <div class="header-badges">
              @if (material.visibility === 'public') {
              <span
                class="badge-visibility badge-public"
                title="Vizibil pentru toți"
                >🌐</span
              >
              } @else if (material.visibility === 'professors_only') {
              <span
                class="badge-visibility badge-professors"
                title="Doar profesori"
                >👨‍🏫</span
              >
              } @else if (material.visibility === 'private') {
              <span class="badge-visibility badge-private-vis" title="Privat"
                >🔒</span
              >
              }
            </div>
          </div>

          @if (material.description) {
          <p class="card-description">{{ material.description }}</p>
          }

          <div class="card-meta">
            <div class="meta-badges">
              @if (material.profile_type) {
              <span class="badge badge-profile">{{
                getProfileLabel(material.profile_type)
              }}</span>
              } @if (material.grade_level) {
              <span class="badge badge-grade"
                >Cl. {{ material.grade_level }}</span
              >
              }
              <span class="badge badge-subject">{{ material.subject }}</span>
            </div>

            @if (material.file_paths && material.file_paths.length > 0) {
            <div class="file-count">
              <span class="icon">📎</span>
              <span
                >{{ material.file_paths.length }} fișier{{
                  material.file_paths.length > 1 ? 'e' : ''
                }}</span
              >
            </div>
            }
          </div>

          @if (material.tags && material.tags.length > 0) {
          <div class="card-tags">
            @for (tag of material.tags.slice(0, 3); track tag) {
            <span class="tag">{{ tag }}</span>
            } @if (material.tags.length > 3) {
            <span class="tag-more">+{{ material.tags.length - 3 }}</span>
            }
          </div>
          }

          <!-- Feedback Section -->
          <div class="card-feedback" (click)="$event.stopPropagation()">
            @if (isProfessor()) {
            <button
              class="feedback-btn"
              [class.active]="material.user_has_feedback"
              (click)="toggleProfessorFeedback(material)"
              title="M-a ajutat ca profesor"
            >
              💡 {{ material.feedback_professors_count || 0 }}
            </button>
            } @if (isStudent()) {
            <button
              class="feedback-btn"
              [class.active]="material.user_has_feedback"
              (click)="toggleStudentFeedback(material)"
              title="M-a ajutat ca student"
            >
              ⭐ {{ material.feedback_students_count || 0 }}
            </button>
            } @if (material.suggestions_count > 0 && isProfessor()) {
            <span class="suggestions-count" title="Sugestii de îmbunătățire">
              📝 {{ material.suggestions_count }}
            </span>
            }
          </div>

          <div class="card-footer">
            <span class="date">{{ formatDate(material.created_at) }}</span>
            @if (canEdit(material)) {
            <div class="card-actions" (click)="$event.stopPropagation()">
              <button
                class="btn-icon"
                (click)="editMaterial(material.id)"
                title="Editează"
              >
                ✏️
              </button>
              <button
                class="btn-icon btn-delete"
                (click)="deleteMaterial(material.id)"
                title="Șterge"
              >
                🗑️
              </button>
            </div>
            }
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
          (click)="goToPage(currentPage() - 1)"
        >
          ← Anterior
        </button>

        <span class="page-info">
          Pagina {{ currentPage() }} din {{ totalPages() }}
        </span>

        <button
          class="btn-page"
          [disabled]="currentPage() === totalPages()"
          (click)="goToPage(currentPage() + 1)"
        >
          Următorul →
        </button>
      </div>
      } }

      <!-- Empty State -->
      @if (!loading() && materials().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>Niciun material găsit</h3>
        <p>
          @if (hasActiveFilters()) { Încearcă să modifici filtrele de căutare }
          @else { @if (isProfessor()) { Creează primul material educațional }
          @else { Nu există materiale disponibile momentan } }
        </p>
        @if (isProfessor() && !hasActiveFilters()) {
        <button class="btn btn-primary" (click)="createMaterial()">
          ➕ Creează Material
        </button>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      .materials-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .page-header h1 {
        color: #333;
        font-size: 2rem;
        margin: 0;
      }

      /* Filters */
      .filters-section {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
      }

      .search-bar {
        position: relative;
        margin-bottom: 1rem;
      }

      .search-input {
        width: 100%;
        padding: 0.75rem 3rem 0.75rem 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s;
      }

      .search-input:focus {
        outline: none;
        border-color: #5548d9;
      }

      .search-icon {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.2rem;
      }

      .filter-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
      }

      .filter-select,
      .filter-input {
        padding: 0.5rem 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        transition: border-color 0.3s;
      }

      .filter-select:focus,
      .filter-input:focus {
        outline: none;
        border-color: #5548d9;
      }

      .checkbox-filter {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
      }

      .checkbox-filter input {
        width: 1.1rem;
        height: 1.1rem;
        cursor: pointer;
      }

      /* Loading */
      .loading-state {
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

      /* Materials Grid */
      .materials-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .material-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        flex-direction: column;
      }

      .material-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(85, 72, 217, 0.2);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
      }

      .card-header h3 {
        color: #333;
        font-size: 1.2rem;
        margin: 0;
        flex: 1;
        line-height: 1.3;
      }

      .header-badges {
        display: flex;
        gap: 0.5rem;
        margin-left: 0.5rem;
      }

      .badge-visibility {
        font-size: 1.2rem;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
      }

      .badge-public {
        background: #e8f5e9;
      }

      .badge-professors {
        background: #e3f2fd;
      }

      .badge-private-vis {
        background: #f5f5f5;
      }

      .badge-private {
        font-size: 1rem;
        margin-left: 0.5rem;
      }

      .card-description {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .card-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .meta-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }

      .badge {
        padding: 0.3rem 0.6rem;
        border-radius: 15px;
        font-size: 0.75rem;
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

      .file-count {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.85rem;
        color: #666;
      }

      .card-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-bottom: 1rem;
      }

      .tag {
        padding: 0.2rem 0.6rem;
        background: #f5f5f5;
        border-radius: 12px;
        font-size: 0.75rem;
        color: #666;
      }

      .tag-more {
        padding: 0.2rem 0.6rem;
        background: #5548d9;
        color: white;
        border-radius: 12px;
        font-size: 0.75rem;
      }

      /* Feedback Section */
      .card-feedback {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #f0f0f0;
      }

      .feedback-btn {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem 0.75rem;
        background: #f5f5f5;
        border: 2px solid transparent;
        border-radius: 8px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s;
      }

      .feedback-btn:hover {
        background: #e8e8e8;
      }

      .feedback-btn.active {
        background: #fff3e0;
        border-color: #ff9800;
        color: #ff9800;
        font-weight: 600;
      }

      .suggestions-count {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.4rem 0.7rem;
        background: #e3f2fd;
        border-radius: 8px;
        font-size: 0.85rem;
        color: #1976d2;
        font-weight: 500;
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid #f0f0f0;
      }

      .date {
        font-size: 0.85rem;
        color: #999;
      }

      .card-actions {
        display: flex;
        gap: 0.5rem;
      }

      .btn-icon {
        padding: 0.4rem 0.6rem;
        background: #f5f5f5;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.3s;
      }

      .btn-icon:hover {
        background: #e0e0e0;
      }

      .btn-delete:hover {
        background: #ffebee;
      }

      /* Pagination */
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 2rem;
      }

      .btn-page {
        padding: 0.5rem 1rem;
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
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
        color: #666;
        font-size: 0.9rem;
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
        margin-bottom: 2rem;
      }

      /* Buttons */
      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s;
      }

      .btn-primary {
        background: #5548d9;
        color: white;
      }

      .btn-primary:hover {
        background: #4437c9;
      }

      @media (max-width: 768px) {
        .materials-container {
          padding: 1rem;
        }

        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .materials-grid {
          grid-template-columns: 1fr;
        }

        .filter-controls {
          flex-direction: column;
          align-items: stretch;
        }

        .filter-select,
        .filter-input {
          width: 100%;
        }
      }
    `,
  ],
})
export class MaterialListComponent implements OnInit {
  materials = signal<Material[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  pageSize = 10;

  searchQuery = '';
  selectedProfile = '';
  selectedGrade = '';
  selectedSubject = '';
  showOnlyMine = false;

  currentUser = signal<any>(null);

  constructor(
    private materialService: MaterialService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);
    });

    this.loadMaterials();
  }

  loadMaterials() {
    this.loading.set(true);

    const params: any = {
      page: this.currentPage(),
      page_size: this.pageSize,
    };

    if (this.searchQuery) params.search = this.searchQuery;
    if (this.selectedProfile) params.profile_type = this.selectedProfile;
    if (this.selectedGrade) params.grade_level = parseInt(this.selectedGrade);
    if (this.selectedSubject) params.subject = this.selectedSubject;
    if (this.showOnlyMine && this.currentUser()) {
      params.professor_id = this.currentUser().id;
    }

    this.materialService.getMaterials(params).subscribe({
      next: (response: any) => {
        this.materials.set(response.items || response);
        this.totalPages.set(response.total_pages || 1);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading materials:', err);
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadMaterials();
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadMaterials();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchQuery ||
      this.selectedProfile ||
      this.selectedGrade ||
      this.selectedSubject ||
      this.showOnlyMine
    );
  }

  isProfessor(): boolean {
    return this.currentUser()?.role === 'professor';
  }

  isStudent(): boolean {
    return this.currentUser()?.role === 'student';
  }

  canEdit(material: Material): boolean {
    const user = this.currentUser();
    return user?.role === 'professor' && user?.id === material.professor_id;
  }

  getProfileLabel(profileType: string): string {
    const labels: { [key: string]: string } = {
      real: 'Real',
      uman: 'Uman',
      tehnologic: 'Tehnologic',
    };
    return labels[profileType] || profileType;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  viewMaterial(id: number) {
    this.router.navigate(['/materials', id]);
  }

  createMaterial() {
    this.router.navigate(['/materials/new']);
  }

  editMaterial(id: number) {
    this.router.navigate(['/materials/edit', id]);
  }

  deleteMaterial(id: number) {
    if (confirm('Sigur doriți să ștergeți acest material?')) {
      this.materialService.deleteMaterial(id).subscribe({
        next: () => {
          this.loadMaterials();
        },
        error: (err) => {
          console.error('Error deleting material:', err);
          alert('Eroare la ștergerea materialului');
        },
      });
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadMaterials();
  }

  toggleProfessorFeedback(material: Material) {
    this.materialService.toggleProfessorFeedback(material.id).subscribe({
      next: (response) => {
        // Update material locally
        const materials = this.materials();
        const index = materials.findIndex((m) => m.id === material.id);
        if (index !== -1) {
          materials[index] = {
            ...materials[index],
            user_has_feedback: response.has_feedback,
            feedback_professors_count: response.total_count,
          };
          this.materials.set([...materials]);
        }
      },
      error: (err) => {
        console.error('Error toggling professor feedback:', err);
        alert('Eroare la salvarea feedback-ului');
      },
    });
  }

  toggleStudentFeedback(material: Material) {
    this.materialService.toggleStudentFeedback(material.id).subscribe({
      next: (response) => {
        // Update material locally
        const materials = this.materials();
        const index = materials.findIndex((m) => m.id === material.id);
        if (index !== -1) {
          materials[index] = {
            ...materials[index],
            user_has_feedback: response.has_feedback,
            feedback_students_count: response.total_count,
          };
          this.materials.set([...materials]);
        }
      },
      error: (err) => {
        console.error('Error toggling student feedback:', err);
        alert('Eroare la salvarea feedback-ului');
      },
    });
  }
}
