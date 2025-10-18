import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
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
    redirectTo: '/home',
  },
];
