import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <div class="hero-content">
          <h1>Welcome to RoEdu</h1>
          <p class="hero-subtitle">Educational Platform for Romanian Schools</p>
          <p class="hero-description">
            Access standardized educational materials, take interactive quizzes,
            and collaborate with teachers and students across Romania.
          </p>
          <div class="hero-buttons">
            <a routerLink="/materials" class="btn btn-primary"
              >Browse Materials</a
            >
            <a routerLink="/quizzes" class="btn btn-secondary">Take Quizzes</a>
          </div>
        </div>
        <div class="hero-image">
          <div class="placeholder-image">
            <span class="icon">📚</span>
            <p>Learning Platform</p>
          </div>
        </div>
      </div>

      <div class="features-section">
        <div class="container">
          <h2>Platform Features</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">📖</div>
              <h3>Educational Materials</h3>
              <p>
                Access standardized materials organized by profile, subject, and
                grade level.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📝</div>
              <h3>Interactive Quizzes</h3>
              <p>
                Take quizzes with multiple question types and get instant
                feedback.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💬</div>
              <h3>Community Feedback</h3>
              <p>
                Ask questions, provide feedback, and collaborate with your
                peers.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🎓</div>
              <h3>Role-Based Access</h3>
              <p>
                Tailored experiences for administrators, professors, and
                students.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="cta-section">
        <div class="container">
          <h2>Ready to Start Learning?</h2>
          <p>
            Join thousands of Romanian students and teachers on our educational
            platform.
          </p>
          <div class="cta-buttons">
            <a routerLink="/register" class="btn btn-primary btn-lg"
              >Înregistrare</a
            >
            <a routerLink="/login" class="btn btn-outline btn-lg"
              >Conectează-te</a
            >
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .home-container {
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
        min-height: 70vh;
      }

      .hero-content h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
        font-weight: 700;
      }

      .hero-subtitle {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
        opacity: 0.9;
      }

      .hero-description {
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 2rem;
        opacity: 0.8;
      }

      .hero-buttons {
        display: flex;
        gap: 1rem;
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

      .features-section {
        padding: 4rem 0;
        background-color: #f9fafb;
      }

      .features-section h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 3rem;
        color: #1f2937;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .feature-card {
        background: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        text-align: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .feature-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      }

      .feature-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      .feature-card h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: #1f2937;
      }

      .feature-card p {
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

        .hero-buttons,
        .cta-buttons {
          flex-direction: column;
          align-items: center;
        }

        .features-grid {
          grid-template-columns: 1fr;
        }

        .features-section h2,
        .cta-section h2 {
          font-size: 2rem;
        }
      }
    `,
  ],
})
export class HomeComponent {}
