import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApplicationService } from '../../core/services/application.service';
import { STATUS_CONFIG } from '../../shared/utils/status-labels';
import { Application, ApplicationStatus } from '../../core/models/application.model';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="detail-container">
      @if (loading) {
        <div class="spinner-wrapper">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else if (application) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ application.company_name }}</mat-card-title>
            <mat-card-subtitle>{{ application.position }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="field-row">
              <span class="label" i18n="@@detail.company">Company:</span>
              <span>{{ application.company_name }}</span>
            </div>

            <div class="field-row">
              <span class="label" i18n="@@detail.position">Position:</span>
              <span>{{ application.position }}</span>
            </div>

            <div class="field-row">
              <span class="label" i18n="@@detail.status">Status:</span>
              <mat-chip-set>
                <mat-chip [color]="getStatusColor(application.status)" highlighted>
                  {{ getStatusLabel(application.status) }}
                </mat-chip>
              </mat-chip-set>
            </div>

            <div class="field-row">
              <span class="label" i18n="@@detail.jobLink">Job link:</span>
              @if (application.job_link) {
                <a [href]="application.job_link" target="_blank" rel="noopener noreferrer" class="job-link">
                  {{ application.job_link }}
                </a>
              } @else {
                <span class="empty-value">&mdash;</span>
              }
            </div>

            <div class="field-row">
              <span class="label" i18n="@@detail.salary">Salary range:</span>
              <span>{{ application.salary_range || '—' }}</span>
            </div>

            <div class="field-row">
              <span class="label" i18n="@@detail.location">Location:</span>
              <span>{{ application.location || '—' }}</span>
            </div>

            <div class="field-row">
              <span class="label" i18n="@@detail.notes">Notes:</span>
              <span class="notes-value">{{ application.notes || '—' }}</span>
            </div>

            <div class="field-row">
              <span class="label" i18n="@@detail.appliedAt">Applied at:</span>
              <span>{{ application.applied_at | date:'mediumDate' }}</span>
            </div>

            @if (application.screenshot_path) {
              <div class="field-row screenshot-row">
                <span class="label" i18n="@@detail.screenshot">Screenshot:</span>
                <img [src]="getScreenshotUrl(application.screenshot_path)" alt="Screenshot" class="screenshot-img" />
              </div>
            }
          </mat-card-content>

          <mat-card-actions align="end">
            <button mat-button (click)="goBack()" i18n="@@detail.back">
              <mat-icon>arrow_back</mat-icon>
              Back
            </button>
            <button mat-raised-button color="primary" (click)="editApplication()" i18n="@@detail.edit">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-raised-button color="warn" (click)="deleteApplication()" i18n="@@detail.delete">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .detail-container {
      max-width: 700px;
      margin: 24px auto;
      padding: 0 16px;
    }

    .spinner-wrapper {
      display: flex;
      justify-content: center;
      padding: 48px 0;
    }

    .field-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .label {
      font-weight: 500;
      min-width: 130px;
      color: rgba(0, 0, 0, 0.54);
    }

    .notes-value {
      white-space: pre-wrap;
    }

    .job-link {
      word-break: break-all;
    }

    .screenshot-row {
      flex-direction: column;
      gap: 8px;
    }

    .screenshot-img {
      max-width: 100%;
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.12);
    }

    .empty-value {
      color: rgba(0, 0, 0, 0.38);
    }

    mat-card-actions {
      display: flex;
      gap: 8px;
    }

    mat-card-actions button mat-icon {
      margin-right: 6px;
      font-size: 18px;
    }
  `],
})
export class ApplicationDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly applicationService = inject(ApplicationService);

  application: Application | null = null;
  loading = true;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard']);
      return;
    }

    try {
      this.application = await this.applicationService.getById(id);
    } catch {
      this.router.navigate(['/dashboard']);
    } finally {
      this.loading = false;
    }
  }

  getStatusLabel(status: ApplicationStatus): string {
    return STATUS_CONFIG[status]?.label ?? status;
  }

  getStatusColor(status: ApplicationStatus): 'primary' | 'accent' | 'warn' {
    return STATUS_CONFIG[status]?.color ?? 'primary';
  }

  editApplication(): void {
    this.router.navigate(['/applications', this.application!.id, 'edit']);
  }

  async deleteApplication(): Promise<void> {
    if (confirm('Are you sure you want to delete this application?')) {
      try {
        await this.applicationService.delete(this.application!.id);
        this.router.navigate(['/dashboard']);
      } catch {
        // silently handle
      }
    }
  }

  getScreenshotUrl(path: string): string {
    return this.applicationService.getScreenshotUrl(path);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
