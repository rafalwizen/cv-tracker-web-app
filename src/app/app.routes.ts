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
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'applications/new',
    loadComponent: () => import('./features/application-form/application-form.component').then(m => m.ApplicationFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'applications/:id',
    loadComponent: () => import('./features/application-detail/application-detail.component').then(m => m.ApplicationDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'applications/:id/edit',
    loadComponent: () => import('./features/application-form/application-form.component').then(m => m.ApplicationFormComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
