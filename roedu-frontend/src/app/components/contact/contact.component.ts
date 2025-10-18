import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="contact-container">
      <div class="hero-section">
        <div class="hero-content">
          <h1>Contact</h1>
          <p class="hero-subtitle">Contactează echipa RoEdu</p>
          <p class="hero-description">
            Ai întrebări sau feedback? Suntem aici să te ajutăm! Contactează
            echipa noastră pentru suport, sugestii sau oportunități de colaborare.
          </p>
        </div>
        <div class="hero-image">
          <div class="hero-subtitle placeholder-image">
            <span class="icon">📧</span>
            <p class="hero-subtitle">Contactați Suportul</p>
          </div>
        </div>
      </div>

      <div class="contact-section">
        <div class="container">
          <div class="contact-grid">
            <div class="contact-card">
              <div class="contact-icon">📍</div>
              <h3>Adresă</h3>
              <p>
                București, România<br />
                Sector 1, Strada Exemplu 123
              </p>
            </div>
            <div class="contact-card">
              <div class="contact-icon">📞</div>
              <h3>Telefon</h3>
              <p>
                Suport: +40 123 456 789<br />
                Birou: +40 987 654 321
              </p>
            </div>
            <div class="contact-card">
              <div class="contact-icon">✉️</div>
              <h3>Email</h3>
              <p>
                support&#64;roedu.ro<br />
                info&#64;roedu.ro
              </p>
            </div>
            <div class="contact-card">
              <div class="contact-icon">🕒</div>
              <h3>Program</h3>
              <p>
                Luni - Vineri<br />
                09:00 - 17:00
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="cta-section">
        <div class="container">
          <h2>Ai nevoie de asistență imediată?</h2>
          <p>
            Echipa noastră de suport este pregătită să te ajute cu orice
            întrebări sau nelămuriri legate de platformă.
          </p>
          <div class="cta-buttons">
            <a href="mailto:support&#64;roedu.ro" class="btn btn-primary btn-lg"
              >Trimite Email</a
            >
            <a routerLink="/faq" class="btn btn-outline btn-lg"
              >Întrebări frecvente</a
            >
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .contact-container {
        min-height: 100vh;
      }

      .hero-section {
        background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
        color: white;
        padding: 4rem 1rem;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        align-items: center;
        min-height: 50vh;
      }

      .hero-content h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
        font-weight: 700;
      }

      /* subtitle and description use an accent color for readability */
      .hero-subtitle {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #e0f2fe; /* light sky blue */
        font-weight: 600;
      }

      .hero-description {
        font-size: 1.05rem;
        line-height: 1.6;
        margin-bottom: 2rem;
        color: #dbeafe; /* soft indigo */
      }

      .hero-image {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .placeholder-image {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        padding: 3rem;
        text-align: center;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .placeholder-image .icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      .placeholder-image p {
        font-size: 1.25rem;
        margin: 0;
        opacity: 0.9;
      }

      .contact-section {
        padding: 4rem 0;
        background-color: #f9fafb;
      }

      .contact-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .contact-card {
        background: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        text-align: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .contact-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      }

      .contact-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      .contact-card h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: #1f2937;
      }

      .contact-card p {
        color: #6b7280;
        line-height: 1.6;
      }

      .cta-section {
        background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
        color: white;
        padding: 4rem 0;
        text-align: center;
      }

      .cta-section h2 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
      }

      .cta-section p {
        font-size: 1.1rem;
        margin-bottom: 2rem;
        opacity: 0.9;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }

      .cta-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
      }

      @media (max-width: 768px) {
        .hero-section {
          grid-template-columns: 1fr;
          text-align: center;
          padding: 2rem 1rem;
        }

        .hero-content h1 {
          font-size: 2.5rem;
        }

        .cta-buttons {
          flex-direction: column;
          align-items: center;
        }

        .contact-grid {
          grid-template-columns: 1fr;
        }

        .cta-section h2 {
          font-size: 2rem;
        }
      }
    `,
  ],
})
export class ContactComponent {}
