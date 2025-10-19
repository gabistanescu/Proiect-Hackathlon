import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-container">
      <div class="hero">
        <div class="hero-content">
          <h1>Despre RoEdu</h1>
          <p class="lead">
            RoEdu este o platformă educațională creată pentru a sprijini
            profesorii și elevii din România în crearea, partajarea și accesarea
            materialelor didactice digitale.
          </p>
        </div>
      </div>

      <div class="content container">
        <section class="mission">
          <h2>Misiunea noastră</h2>
          <p>
            Să oferim resurse pedagogice structurate, ușor de folosit, care
            să îmbunătățească procesul de predare și învățare în școli.
          </p>
        </section>

        <section class="values">
          <h2>Valori</h2>
          <ul>
            <li>Colaborare între cadre didactice</li>
            <li>Accesibilitate și incluziune</li>
            <li>Calitate și transparență</li>
            <li>Securitate și confidențialitate</li>
          </ul>
        </section>

        <section class="how-it-works">
          <h2>Cum funcționează</h2>
          <p>
            Profesorii pot încărca materiale, le pot organiza pe profil, materie
            și clasă, iar elevii pot accesa materialele partajate. Accesul la
            anumite funcționalități este restricționat prin autentificare.
          </p>
        </section>

        <section class="team">
          <h2>Echipa</h2>
          <p>
            Echipa RoEdu este formată din profesori, dezvoltatori și designeri
            dedicați educației digitale. Vrei să colaborezi? Contactează-ne pe
            pagina de contact.
          </p>
        </section>

        <div class="cta">
          <a routerLink="/contact" class="btn btn-primary">Contact</a>
          <a routerLink="/register" class="btn btn-outline">Cum obții acces</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .about-container { min-height: 100vh; }
      .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 3rem 1rem; text-align: center; }
      .hero-content h1 { font-size:2.5rem; margin-bottom:0.5rem; }
      .lead { max-width:800px; margin:0.5rem auto 0; color:#e6eefc; }
      .container { max-width:1100px; margin:2rem auto; padding:0 1rem; }
      section { margin-bottom:1.5rem; }
      h2 { color:#0f172a; margin-bottom:0.5rem; }
      p, li { color:#374151; line-height:1.6; }
      .values ul { padding-left:1.25rem; }
      .cta { display:flex; gap:1rem; margin-top:2rem; }
      .btn { padding:0.6rem 1rem; border-radius:8px; text-decoration:none; }
      .btn-primary { background:#5548d9; color:white; }
      .btn-outline { border:2px solid #e5e7eb; color:#111827; background:white; }
      @media (max-width:768px){ .cta{flex-direction:column;align-items:center;} }
    `,
  ],
})
export class AboutComponent {}
