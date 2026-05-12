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
  selector: 'app-register',
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
          <mat-card-title i18n="@@register.title">Create Account</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label i18n="@@register.displayName">Display Name</mat-label>
              <input matInput [(ngModel)]="displayName" name="displayName" required />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label i18n="@@register.email">Email</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required email />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label i18n="@@register.password">Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" [(ngModel)]="password" name="password" required minlength="6" />
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            @if (error) {
              <div class="error-message">{{ error }}</div>
            }

            <button mat-raised-button color="primary" type="submit" class="full-width"
                    [disabled]="!registerForm.valid || submitting">
              @if (submitting) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <span i18n="@@register.submit">Create Account</span>
              }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <a mat-button routerLink="/login" i18n="@@register.loginLink">Already have an account? Sign In</a>
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
export class RegisterComponent {
  displayName = '';
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
      await this.auth.register(this.email, this.password, this.displayName);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error = e.message || 'Registration failed';
    } finally {
      this.submitting = false;
    }
  }
}
