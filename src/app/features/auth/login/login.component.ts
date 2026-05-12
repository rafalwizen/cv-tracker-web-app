import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title i18n="@@login.title">Sign In</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label i18n="@@login.email">Email</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required email />
              @if (!email) {
                <mat-error i18n="@@login.emailRequired">Email is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label i18n="@@login.password">Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" [(ngModel)]="password" name="password" required />
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            @if (error) {
              <div class="error-message">{{ error }}</div>
            }

            <button mat-raised-button color="primary" type="submit" class="full-width"
                    [disabled]="!loginForm.valid || submitting">
              @if (submitting) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <span i18n="@@login.submit">Sign In</span>
              }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <a mat-button routerLink="/register" i18n="@@login.registerLink">Don't have an account? Register</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 16px; }
    .auth-card { width: 100%; max-width: 400px; }
    .full-width { width: 100%; }
    .error-message { color: #f44336; margin-bottom: 16px; font-size: 14px; }
    mat-card-actions { display: flex; justify-content: center; padding: 0 16px 16px; }
    button[mat-raised-button] { height: 44px; margin-top: 8px; }
    button[mat-raised-button] mat-spinner { margin: auto; }
  `],
})
export class LoginComponent {
  email = '';
  password = '';
  hidePassword = true;
  error = '';
  submitting = false;

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async onSubmit() {
    this.error = '';
    this.submitting = true;
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error = e.message || 'Login failed';
    } finally {
      this.submitting = false;
    }
  }
}
