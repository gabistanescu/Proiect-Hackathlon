import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-access',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="access-container">
      <div class="hero">
        <div class="hero-content">
          <h1>Cum obții acces</h1>
          <p class="lead">
            Înregistrarea pe platforma RoEdu este gestionată centralizat prin
            administratorii școlilor. Aici găsești pașii clari pentru a obține
            accesul necesar.
          </p>
        </div>
      </div>

      <div class="content container">
        <section>
          <h2>Pași pentru profesori</h2>
          <ol>
            <li>Contactează administratorul școlii sau responsabilul IT.</li>
            <li>Solicită crearea unui cont specificând: nume, email și profil (profesor).</li>
            <li>Primești un username și o parolă inițială pe email.</li>
            <li>Autentifică-te și schimbă parola la prima accesare.</li>
          </ol>
        </section>

        <section>
          <h2>Pași pentru elevi</h2>
          <ol>
            <li>Rugă profesorul sau administratorul școlii să solicite un cont pentru tine.</li>
            <li>Primești credențialele de la administrator sau profesor.</li>
            <li>Autentifică-te și urmează instrucțiunile din cont.</li>
          </ol>
        </section>

        <section>
          <h2>Pentru administratori de școală</h2>
          <p>
            Dacă ești administrator și ai nevoie să creezi conturi în număr mai
            mare, contactează echipa RoEdu la:
          </p>
          <ul>
            <li>Email: <a href="mailto:admin&#64;roedu.ro">admin&#64;roedu.ro</a></li>
            <li>Telefon: +40 123 456 789</li>
          </ul>
          <p>
            Administratorii pot crea profesori și elevi prin panoul administrativ
            după autentificare. Dacă ai nevoie de setări avansate sau migrare de
            date, scrie-ne și te ajutăm.</p>
        </section>

        <div class="cta">
          <a routerLink="/contact" class="btn btn-outline">Contact</a>
          <a routerLink="/login" class="btn btn-primary">Autentificare</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .access-container { min-height: 100vh; }
      .hero { background: linear-gradient(135deg,#4f46e5 0%,#4338ca 100%); color:#fff; padding:3rem 1rem; text-align:center; }
      .hero-content h1 { font-size:2.25rem; margin-bottom:0.5rem; }
      .lead { max-width:800px; margin:0.5rem auto 0; color:#e6eefc; }
      .container { max-width:900px; margin:2rem auto; padding:0 1rem; }
      section { margin-bottom:1.25rem; }
      h2 { color:#0f172a; margin-bottom:0.5rem; }
      p, li, ol { color:#374151; line-height:1.6; }
      ol { padding-left:1.25rem; }
      .cta { display:flex; gap:1rem; margin-top:1.5rem; }
      .btn { padding:0.6rem 1rem; border-radius:8px; text-decoration:none; }
      .btn-primary { background:#5548d9; color:white; }
      .btn-outline { border:2px solid #e5e7eb; color:#111827; background:white; }
      @media (max-width:768px){ .cta{flex-direction:column;align-items:center;} }
    `,
  ],
})
export class AccessComponent {}
