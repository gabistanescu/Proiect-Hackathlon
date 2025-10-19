import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface SavedMaterial {
  id: number;
  title: string;
  description?: string;
  subject: string;
  profile_type?: string;
  grade_level?: number;
  tags?: string[];
  created_at: string;
}

@Component({
  selector: 'app-saved-materials',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="saved-materials-container">
      <div class="page-header">
        <h1>💾 Materiale Salvate</h1>
        <p class="subtitle">Materialele tale favorite</p>
      </div>

      <!-- Empty State -->
      @if (materials().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">💾</div>
        <h2>Nu ai materiale salvate</h2>
        <p>Salvează materiale din flux pentru a le accesa rapid mai târziu</p>
        <button class="btn btn-primary" (click)="goToFeed()">
          Explorează Materiale
        </button>
      </div>
      }

      <!-- Materials Grid -->
      @if (materials().length > 0) {
      <div class="materials-grid">
        @for (material of materials(); track material.id) {
        <div class="material-card" (click)="viewMaterial(material.id)">
          <div class="card-header">
            <h3>{{ material.title }}</h3>
            <button class="btn-unsave" (click)="unsaveMaterial($event, material.id)" title="Elimină din salvate">
              ❌
            </button>
          </div>

          @if (material.description) {
          <p class="card-description">{{ material.description }}</p>
          }

          <div class="card-meta">
            <div class="meta-badges">
              @if (material.profile_type) {
              <span class="badge badge-profile">{{ getProfileLabel(material.profile_type) }}</span>
              }
              @if (material.grade_level) {
              <span class="badge badge-grade">Cl. {{ material.grade_level }}</span>
              }
              <span class="badge badge-subject">{{ material.subject }}</span>
            </div>
          </div>

          @if (material.tags && material.tags.length > 0) {
          <div class="card-tags">
            @for (tag of material.tags.slice(0, 3); track tag) {
            <span class="tag">{{ tag }}</span>
            }
            @if (material.tags.length > 3) {
            <span class="tag-more">+{{ material.tags.length - 3 }}</span>
            }
          </div>
          }

          <div class="card-footer">
            <span class="date">{{ formatDate(material.created_at) }}</span>
          </div>
        </div>
        }
      </div>
      }
    </div>
  `,
  styles: [`
    .saved-materials-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #667eea;
    }

    .page-header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: 600;
      color: #333;
    }

    .subtitle {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #666;
    }

    .empty-icon {
      font-size: 80px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .empty-state h2 {
      font-size: 24px;
      margin-bottom: 10px;
      color: #333;
    }

    .empty-state p {
      font-size: 16px;
      margin-bottom: 30px;
      color: #666;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .materials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .material-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.2s;
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }

    .material-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .card-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      flex: 1;
    }

    .btn-unsave {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .btn-unsave:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    .card-description {
      padding: 12px 16px;
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-meta {
      padding: 0 16px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .meta-badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
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

    .card-tags {
      padding: 0 16px 12px;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .tag {
      background: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      color: #666;
    }

    .tag-more {
      background: #e0e0e0;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      color: #999;
    }

    .card-footer {
      padding: 12px 16px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }

    .date {
      font-size: 12px;
      color: #999;
    }

    @media (max-width: 768px) {
      .materials-grid {
        grid-template-columns: 1fr;
      }

      .page-header h1 {
        font-size: 24px;
      }
    }
  `]
})
export class SavedMaterialsComponent implements OnInit {
  materials = signal<SavedMaterial[]>([]);

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Placeholder data - în realitate ar trebui să încarce din backend
    this.materials.set([
      // Empty for now - will be populated when save functionality is implemented
    ]);
  }

  viewMaterial(id: number): void {
    this.router.navigate(['/materials', id]);
  }

  unsaveMaterial(event: Event, id: number): void {
    event.stopPropagation();
    if (confirm('Sigur vrei să elimini acest material din salvate?')) {
      this.materials.set(this.materials().filter(m => m.id !== id));
    }
  }

  goToFeed(): void {
    this.router.navigate(['/feed']);
  }

  getProfileLabel(profile: string): string {
    const labels: { [key: string]: string } = {
      real: 'Real',
      uman: 'Uman',
      tehnologic: 'Tehnologic'
    };
    return labels[profile] || profile;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Astăzi';
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `Acum ${diffDays} zile`;

    return date.toLocaleDateString('ro-RO');
  }
}
