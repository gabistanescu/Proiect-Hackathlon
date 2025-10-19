import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <div class="page-header">
        <h1>⚙️ Setări</h1>
        <p class="subtitle">Personalizează experiența ta</p>
      </div>

      <div class="settings-content">
        <!-- Appearance Settings -->
        <div class="settings-section">
          <h2>🎨 Aspect</h2>
          <div class="settings-card">
            <div class="setting-item">
              <div class="setting-info">
                <h3>Tema</h3>
                <p>Alege tema aplicației</p>
              </div>
              <select class="setting-control" [(ngModel)]="theme" (change)="onThemeChange()">
                <option value="light">☀️ Luminos</option>
                <option value="dark">🌙 Întunecat</option>
                <option value="auto">🔄 Automat</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h3>Contrast ridicat</h3>
                <p>Pentru vizibilitate îmbunătățită</p>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="highContrast" (change)="onHighContrastChange()">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h3>Reducere animații</h3>
                <p>Dezactivează efectele de animație</p>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="reduceMotion" (change)="onReduceMotionChange()">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="settings-section">
          <h2>🔔 Notificări</h2>
          <div class="settings-card">
            <div class="setting-item">
              <div class="setting-info">
                <h3>Notificări email</h3>
                <p>Primește notificări prin email</p>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="emailNotifications">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h3>Notificări comentarii</h3>
                <p>Când cineva comentează la materialele tale</p>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="commentNotifications">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h3>Notificări quiz-uri</h3>
                <p>Când sunt create quiz-uri noi</p>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="quizNotifications">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Privacy Settings -->
        <div class="settings-section">
          <h2>🔒 Confidențialitate</h2>
          <div class="settings-card">
            <div class="setting-item">
              <div class="setting-info">
                <h3>Afișare statistici</h3>
                <p>Arată statisticile tale publice</p>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="showStats">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="settings-actions">
          <button class="btn-save" (click)="saveSettings()">
            💾 Salvează setările
          </button>
          <button class="btn-cancel" (click)="resetSettings()">
            ↺ Resetează
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 900px;
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

    .settings-content {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .settings-section h2 {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
    }

    .settings-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info h3 {
      margin: 0 0 5px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .setting-info p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .setting-control {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      background: white;
    }

    .setting-control:focus {
      outline: none;
      border-color: #667eea;
    }

    /* Toggle Switch */
    .toggle {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 28px;
    }

    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.3s;
      border-radius: 28px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }

    .toggle input:checked + .toggle-slider {
      background-color: #667eea;
    }

    .toggle input:checked + .toggle-slider:before {
      transform: translateX(22px);
    }

    /* Buttons */
    .btn-secondary {
      padding: 8px 16px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: #f5f5f5;
      border-color: #667eea;
      color: #667eea;
    }

    .settings-actions {
      display: flex;
      gap: 15px;
      padding-top: 20px;
    }

    .btn-save {
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-save:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-cancel {
      padding: 12px 30px;
      background: white;
      color: #666;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-cancel:hover {
      background: #f5f5f5;
      border-color: #999;
    }

    @media (max-width: 768px) {
      .settings-container {
        padding: 15px;
      }

      .page-header h1 {
        font-size: 24px;
      }

      .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }

      .settings-actions {
        flex-direction: column;
      }

      .btn-save,
      .btn-cancel {
        width: 100%;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  theme = signal('light');
  highContrast = signal(false);
  reduceMotion = signal(false);
  emailNotifications = signal(true);
  commentNotifications = signal(true);
  quizNotifications = signal(true);
  showStats = signal(true);

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Load saved settings from localStorage
    this.loadSettings();
  }

  loadSettings(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) this.theme.set(savedTheme);

    const savedHighContrast = localStorage.getItem('highContrast');
    if (savedHighContrast) this.highContrast.set(savedHighContrast === 'true');

    const savedReduceMotion = localStorage.getItem('reduceMotion');
    if (savedReduceMotion) this.reduceMotion.set(savedReduceMotion === 'true');
  }

  onThemeChange(): void {
    document.body.classList.remove('light-theme', 'dark-theme');
    if (this.theme() !== 'auto') {
      document.body.classList.add(`${this.theme()}-theme`);
    }
  }

  onHighContrastChange(): void {
    if (this.highContrast()) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }

  onReduceMotionChange(): void {
    if (this.reduceMotion()) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  }

  saveSettings(): void {
    // Save to localStorage
    localStorage.setItem('theme', this.theme());
    localStorage.setItem('highContrast', this.highContrast().toString());
    localStorage.setItem('reduceMotion', this.reduceMotion().toString());

    alert('✅ Setările au fost salvate cu succes!');
  }

  resetSettings(): void {
    this.theme.set('light');
    this.highContrast.set(false);
    this.reduceMotion.set(false);
    this.emailNotifications.set(true);
    this.commentNotifications.set(true);
    this.quizNotifications.set(true);
    this.showStats.set(true);

    document.body.classList.remove('dark-theme', 'high-contrast', 'reduce-motion');
    document.body.classList.add('light-theme');

    alert('↺ Setările au fost resetate!');
  }
}
