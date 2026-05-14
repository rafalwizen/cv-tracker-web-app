import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <span class="toolbar-title" routerLink="/dashboard">CV Tracker</span>
      <span class="spacer"></span>
      @if (auth.user()?.email) {
        <span class="user-info">{{ auth.user()!.email }}</span>
      }
      <button mat-icon-button routerLink="/settings" matTooltip="Settings">
        <mat-icon>settings</mat-icon>
      </button>
      <button mat-icon-button (click)="logout()" matTooltip="Sign out">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="main-content">
      <router-outlet />
    </div>

    <nav class="bottom-nav">
      <a class="nav-item" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
        <mat-icon>list</mat-icon>
        <span i18n="@@nav.applications">Applications</span>
      </a>
      <a class="nav-item" routerLink="/applications/new" routerLinkActive="active">
        <mat-icon>add_circle</mat-icon>
        <span i18n="@@nav.addNew">Add New</span>
      </a>
      <a class="nav-item" routerLink="/settings" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
        <mat-icon>settings</mat-icon>
        <span i18n="@@nav.settings">Settings</span>
      </a>
    </nav>
  `,
  styles: [`
    .toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
    }

    .toolbar-title {
      cursor: pointer;
      font-weight: 500;
    }

    .spacer { flex: 1; }

    .user-info {
      margin-right: 12px;
      font-size: 0.85rem;
      opacity: 0.85;
    }

    .main-content {
      margin-top: 64px;
      padding-bottom: 72px;
      min-height: calc(100vh - 64px - 72px);
    }

    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: white;
      display: flex;
      justify-content: space-around;
      align-items: center;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      z-index: 100;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: rgba(0, 0, 0, 0.54);
      font-size: 0.75rem;
      padding: 6px 16px;
      border-radius: 8px;
      transition: color 0.2s;
    }

    .nav-item mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      margin-bottom: 2px;
    }

    .nav-item.active {
      color: #1976d2;
    }

    @media (min-width: 769px) {
      .bottom-nav { display: none; }
      .main-content { padding-bottom: 0; min-height: calc(100vh - 64px); }
    }
  `],
})
export class LayoutComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
