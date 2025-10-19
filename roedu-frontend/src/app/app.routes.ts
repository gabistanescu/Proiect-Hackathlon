import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

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
      import('./components/about/about.component').then(
        (m) => m.AboutComponent
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./components/contact/contact.component').then(
        (m) => m.ContactComponent
      ),
  },
  {
    path: 'how-to-access',
    loadComponent: () =>
      import('./components/access/access.component').then(
        (m) => m.AccessComponent
      ),
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
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
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
    path: 'quizzes',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/quizzes/quiz-list.component').then(
            (m) => m.QuizListComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./components/quizzes/quiz-form.component').then(
            (m) => m.QuizFormComponent
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./components/quizzes/quiz-form.component').then(
            (m) => m.QuizFormComponent
          ),
      },
      {
        path: ':id/take',
        loadComponent: () =>
          import('./components/quizzes/quiz-take.component').then(
            (m) => m.QuizTakeComponent
          ),
      },
      {
        path: 'results/:id',
        loadComponent: () =>
          import('./components/quizzes/quiz-results.component').then(
            (m) => m.QuizResultsComponent
          ),
      },
      {
        path: ':id/results',
        loadComponent: () =>
          import('./components/quizzes/quiz-results-list.component').then(
            (m) => m.QuizResultsListComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/quizzes/quiz-take.component').then(
            (m) => m.QuizTakeComponent
          ),
      },
    ],
  },
  {
    path: 'groups',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/groups/group-management.component').then(
            (m) => m.GroupManagementComponent
          ),
      },
    ],
  },
  {
    path: 'feed',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/feed/feed.component').then((m) => m.FeedComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
