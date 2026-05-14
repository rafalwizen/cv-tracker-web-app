import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  template: `
    <div class="settings-container">
      <h1>Settings</h1>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Account Information</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="field-row">
            <span class="label">Email:</span>
            <span>{{ auth.user()?.email }}</span>
          </div>
          <div class="field-row">
            <span class="label">Display name:</span>
            <span>{{ auth.user()?.user_metadata?.['display_name'] }}</span>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-divider />

      <mat-card class="danger-card">
        <mat-card-header>
          <mat-card-title>Danger Zone</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p class="danger-text">
            Deleting your account is permanent and cannot be undone. All your data, including
            applications and screenshots, will be removed.
          </p>
          <button mat-raised-button color="warn" (click)="deleteAccount()" [disabled]="deleting()">
            @if (deleting()) {
              <mat-spinner diameter="18" class="btn-spinner" />
            } @else {
              <mat-icon>delete_forever</mat-icon>
            }
            Delete Account
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 600px;
      margin: 24px auto;
      padding: 0 16px;
    }

    h1 {
      font-size: 22px;
      font-weight: 400;
      margin: 0 0 20px;
    }

    .field-row {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }

    .label {
      font-weight: 500;
      min-width: 130px;
      color: rgba(0, 0, 0, 0.54);
    }

    mat-divider {
      margin: 24px 0;
    }

    .danger-card {
      background: #fff5f5;
      border: 1px solid #ffcdd2;
    }

    .danger-text {
      margin: 0 0 16px;
      line-height: 1.6;
      color: rgba(0, 0, 0, 0.7);
    }

    button[mat-raised-button] mat-icon {
      margin-right: 6px;
      font-size: 18px;
    }

    .btn-spinner {
      display: inline-block;
      vertical-align: middle;
      margin-right: 8px;
    }
  `],
})
export class SettingsComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  deleting = signal(false);

  async deleteAccount(): Promise<void> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Account',
        message: 'Are you sure you want to delete your account? This action is permanent and all your data will be lost.',
      } satisfies ConfirmDialogData,
    });

    const confirmed = await ref.afterClosed().toPromise();
    if (!confirmed) return;

    this.deleting.set(true);
    try {
      await this.auth.deleteAccount();
      await this.router.navigate(['/login']);
    } catch {
      this.notification.error('Failed to delete account. Please try again.');
    } finally {
      this.deleting.set(false);
    }
  }
}
