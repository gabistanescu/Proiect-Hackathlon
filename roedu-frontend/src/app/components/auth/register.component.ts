import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card info-card">
        <div class="auth-header">
          <h1>Înregistrare Închisă</h1>
          <p>Crearea conturilor este gestionată de administratorii școlilor</p>
        </div>

        <div class="info-content">
          <div class="info-section">
            <h2>📋 Cum obții un cont?</h2>
            <p>
              Înregistrarea publică nu este disponibilă. Pentru a accesa
              platforma, trebuie să primești credențiale de la
              <strong>administratorul școlii tale</strong>.
            </p>
          </div>

          <div class="info-section">
            <h2>👥 Pentru profesori și elevi</h2>
            <p>
              Contactează <strong>administratorul școlii tale</strong> pentru a
              primi:
            </p>
            <ul>
              <li>Numele de utilizator sau email-ul</li>
              <li>Parola inițială</li>
              <li>Instrucțiuni de acces</li>
            </ul>
          </div>

          <div class="info-section">
            <h2>🏫 Pentru administratori de școală</h2>
            <p>
              Dacă ești administrator de școală și ai nevoie de acces la
              platformă, contactează echipa RoEdu la:
              <a href="mailto:admin&#64;roedu.ro">admin&#64;roedu.ro</a>
            </p>
          </div>

          <div class="cta-section">
            <p>Ai primit deja credențiale?</p>
            <a routerLink="/login" class="btn-login"> Conectează-te aici → </a>
          </div>
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
        background: linear-gradient(135deg, #eef2ff 0%, #f5f5f5 100%);
        padding: 2rem;
      }

      .auth-card {
        background: #ffffff;
        border-radius: 1.5rem;
        box-shadow: 0 20px 40px rgba(79, 70, 229, 0.1);
        padding: 3rem;
        max-width: 640px;
        width: 100%;
      }

      .auth-header {
        text-align: center;
        margin-bottom: 2.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid #e5e7eb;
      }

      .auth-header h1 {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
        color: #111827;
        font-weight: 700;
      }

      .auth-header p {
        color: #6b7280;
        font-size: 1.1rem;
        margin: 0;
      }

      .info-content {
        margin-top: 1.5rem;
        color: #374151;
        line-height: 1.75;
      }

      .info-section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: #f9fafb;
        border-radius: 0.75rem;
        border-left: 4px solid #4f46e5;
      }

      .info-section h2 {
        font-size: 1.25rem;
        color: #1f2937;
        margin-bottom: 0.75rem;
        font-weight: 600;
      }

      .info-section p {
        margin: 0.5rem 0;
        font-size: 1rem;
      }

      .info-section ul {
        margin: 1rem 0;
        padding-left: 1.5rem;
      }

      .info-section li {
        margin: 0.5rem 0;
        color: #4b5563;
      }

      .info-content a {
        color: #4f46e5;
        font-weight: 600;
        text-decoration: none;
      }

      .info-content a:hover {
        text-decoration: underline;
      }

      .cta-section {
        text-align: center;
        margin-top: 2.5rem;
        padding-top: 2rem;
        border-top: 2px solid #e5e7eb;
      }

      .cta-section p {
        font-size: 1.1rem;
        color: #6b7280;
        margin-bottom: 1rem;
      }

      .btn-login {
        display: inline-block;
        background: #4f46e5;
        color: #ffffff !important;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        font-weight: 700;
        font-size: 1.1rem;
        transition: all 0.2s;
        text-decoration: none;
        cursor: pointer;
        border: none;
        letter-spacing: 0.5px;
      }

      .btn-login:hover {
        background: #4338ca;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
        text-decoration: none;
        color: #ffffff;
      }
    `,
  ],
})
export class RegisterComponent {}
