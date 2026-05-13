import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () => import('./features/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'applications/new',
        loadComponent: () => import('./features/application-form/application-form.component').then(m => m.ApplicationFormComponent),
      },
      {
        path: 'applications/:id',
        loadComponent: () => import('./features/application-detail/application-detail.component').then(m => m.ApplicationDetailComponent),
      },
      {
        path: 'applications/:id/edit',
        loadComponent: () => import('./features/application-form/application-form.component').then(m => m.ApplicationFormComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
