import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Sign In</h1>
          <p>Welcome back to RoEdu</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              class="form-control"
              placeholder="your.email@school.ro"
              required
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              class="form-control"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg"
            [disabled]="loading"
          >
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Nu ai cont?
            <a routerLink="/register">Află cum poți obține acces</a> sau
            contactează <strong>administratorul școlii tale</strong>.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background-color: #f9fafb;
      }

      .auth-card {
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        padding: 2.5rem;
        width: 100%;
        max-width: 400px;
      }

      .auth-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .auth-header h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 0.5rem;
      }

      .auth-header p {
        color: #6b7280;
      }

      .auth-form {
        margin-bottom: 2rem;
      }

      .auth-footer {
        text-align: center;
        padding-top: 1.5rem;
        border-top: 1px solid #e5e7eb;
      }

      .auth-footer p {
        color: #6b7280;
        margin: 0;
      }

      .auth-footer a {
        color: #4f46e5;
        text-decoration: none;
        font-weight: 500;
      }

      .auth-footer a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) return;

    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        alert('Login failed. Please check your credentials.');
        this.loading = false;
      },
    });
  }
}
