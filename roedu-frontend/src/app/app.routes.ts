import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestAccessGuard } from './guards/guest-access.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./components/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./components/contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'how-to-access',
    canActivate: [GuestAccessGuard],
    loadComponent: () =>
      import('./components/access/access.component').then((m) => m.AccessComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/auth/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'materials',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/materials/material-list.component').then(
            (m) => m.MaterialListComponent
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/materials/material-form.component').then(
            (m) => m.MaterialFormComponent
          ),
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./components/materials/material-form.component').then(
            (m) => m.MaterialFormComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/materials/material-detail.component').then(
            (m) => m.MaterialDetailComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
