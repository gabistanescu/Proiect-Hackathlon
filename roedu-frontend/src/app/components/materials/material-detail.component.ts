import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
} from '@angular/platform-browser';
import { MaterialService } from '../../services/material.service';
import { Material } from '../../models/material.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-material-detail',
  standalone: true,
  imports: [CommonModule],
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
            @if (!material()!.is_shared) {
            <span class="badge badge-private">🔒 Privat</span>
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
      } @else {
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materialService: MaterialService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMaterial(+id);
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

  canEdit(): boolean {
    const user = this.currentUser();
    const mat = this.material();
    if (!user || !mat) return false;

    return user.role === 'professor' && user.id === mat.professor_id;
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
}
