import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatOptionModule } from '@angular/material/core';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/auth/auth.service';
import {
  Application,
  ApplicationStatus,
  ApplicationCreate,
} from '../../core/models/application.model';
import { ALL_STATUSES, STATUS_CONFIG } from '../../shared/utils/status-labels';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatOptionModule,
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            @if (isEditMode()) {
              <span i18n="@@form.editTitle">Edit Application</span>
            } @else {
              <span i18n="@@form.createTitle">New Application</span>
            }
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="application-form">
            <!-- Company Name -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label i18n="@@form.companyName">Company Name</mat-label>
              <input matInput formControlName="company_name" />
              @if (companyName?.invalid && companyName?.touched) {
                <mat-error>
                  @if (companyName?.errors?.['required']) {
                    <span>Company name is required</span>
                  }
                </mat-error>
              }
            </mat-form-field>

            <!-- Position -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label i18n="@@form.position">Position</mat-label>
              <input matInput formControlName="position" />
              @if (position?.invalid && position?.touched) {
                <mat-error>
                  @if (position?.errors?.['required']) {
                    <span>Position is required</span>
                  }
                </mat-error>
              }
            </mat-form-field>

            <!-- Status -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label i18n="@@form.status">Status</mat-label>
              <mat-select formControlName="status">
                @for (status of allStatuses; track status) {
                  <mat-option [value]="status">{{ statusConfig[status].label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <!-- Job Link -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label i18n="@@form.jobLink">Job Link</mat-label>
              <input matInput formControlName="job_link" placeholder="https://" />
              @if (jobLink?.invalid && jobLink?.touched) {
                <mat-error>
                  @if (jobLink?.errors?.['url']) {
                    <span>Please enter a valid URL</span>
                  }
                </mat-error>
              }
            </mat-form-field>

            <!-- Salary Range -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label i18n="@@form.salaryRange">Salary Range</mat-label>
              <input matInput formControlName="salary_range" placeholder="e.g. 80k-120k PLN" />
            </mat-form-field>

            <!-- Location -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label i18n="@@form.location">Location</mat-label>
              <input matInput formControlName="location" placeholder="e.g. Warsaw / Remote" />
            </mat-form-field>

            <!-- Notes -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label i18n="@@form.notes">Notes</mat-label>
              <textarea matInput formControlName="notes" rows="4"></textarea>
            </mat-form-field>

            <!-- Applied At -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label i18n="@@form.appliedAt">Applied At</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="applied_at" />
              <mat-datepicker-toggle matSuffix [for]="picker" />
              <mat-datepicker #picker />
            </mat-form-field>

            <!-- Screenshot -->
            <div class="screenshot-section full-width">
              <label class="screenshot-label" i18n="@@form.screenshot">Screenshot</label>
              <div class="upload-area">
                <button type="button" mat-stroked-button (click)="fileInput.click()">
                  <mat-icon>attach_file</mat-icon>
                  Choose File
                </button>
                <input
                  #fileInput
                  type="file"
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  hidden
                />
              </div>
              @if (previewUrl()) {
                <div class="preview-container">
                  <img [src]="previewUrl()" alt="Screenshot preview" class="preview-image" />
                  <button
                    type="button"
                    mat-icon-button
                    color="warn"
                    (click)="removeScreenshot()"
                  >
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              }
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button
                type="submit"
                mat-raised-button
                color="primary"
                [disabled]="submitting()"
              >
                @if (submitting()) {
                  <mat-spinner diameter="20"></mat-spinner>
                }
                <span i18n="@@form.save">Save</span>
              </button>
              <button
                type="button"
                mat-button
                (click)="cancel()"
                i18n="@@form.cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 16px;
    }

    .application-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
    }

    .full-width {
      width: 100%;
    }

    .screenshot-section {
      margin-bottom: 8px;
    }

    .screenshot-label {
      display: block;
      font-size: 14px;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.6);
    }

    .upload-area {
      margin-bottom: 12px;
    }

    .preview-container {
      position: relative;
      display: inline-block;
    }

    .preview-image {
      max-width: 200px;
      max-height: 150px;
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.12);
    }

    .preview-container button {
      position: absolute;
      top: -8px;
      right: -8px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-top: 16px;
    }

    .form-actions button[mat-raised-button] {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-spinner {
      display: inline-block;
    }

    @media (max-width: 480px) {
      .form-container {
        padding: 8px;
      }

      .form-actions {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `],
})
export class ApplicationFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly applicationService = inject(ApplicationService);
  private readonly authService = inject(AuthService);

  readonly allStatuses = ALL_STATUSES;
  readonly statusConfig = STATUS_CONFIG;

  readonly isEditMode = signal(false);
  readonly submitting = signal(false);
  readonly previewUrl = signal<string | null>(null);

  private applicationId: string | null = null;
  private existingScreenshotPath: string | null = null;
  private selectedFile: File | null = null;
  private routeSub!: Subscription;

  form: FormGroup = this.fb.group({
    company_name: ['', Validators.required],
    position: ['', Validators.required],
    status: ['applied' as ApplicationStatus],
    job_link: [null],
    salary_range: [null],
    location: [null],
    notes: [null],
    applied_at: [new Date()],
  });

  get companyName() {
    return this.form.get('company_name');
  }

  get position() {
    return this.form.get('position');
  }

  get jobLink() {
    return this.form.get('job_link');
  }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.applicationId = id;
        this.loadApplication(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private async loadApplication(id: string): Promise<void> {
    try {
      const app = await this.applicationService.getById(id);
      if (!app) {
        this.router.navigate(['/dashboard']);
        return;
      }

      this.form.patchValue({
        company_name: app.company_name,
        position: app.position,
        status: app.status,
        job_link: app.job_link,
        salary_range: app.salary_range,
        location: app.location,
        notes: app.notes,
        applied_at: app.applied_at ? new Date(app.applied_at) : new Date(),
      });

      this.existingScreenshotPath = app.screenshot_path;
      if (app.screenshot_path) {
        this.previewUrl.set(app.screenshot_path);
      }
    } catch {
      this.router.navigate(['/dashboard']);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(this.selectedFile!);
    }
  }

  removeScreenshot(): void {
    this.selectedFile = null;
    this.previewUrl.set(null);
    this.existingScreenshotPath = null;
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    try {
      const formValue = this.form.value;

      const payload: ApplicationCreate = {
        company_name: formValue.company_name,
        position: formValue.position,
        status: formValue.status,
        job_link: formValue.job_link || null,
        salary_range: formValue.salary_range || null,
        location: formValue.location || null,
        notes: formValue.notes || null,
        applied_at: formValue.applied_at
          ? this.formatDate(formValue.applied_at)
          : this.formatDate(new Date()),
        screenshot_path: this.existingScreenshotPath || null,
      };

      if (this.isEditMode() && this.applicationId) {
        await this.applicationService.update({ id: this.applicationId, ...payload });

        if (this.selectedFile) {
          const screenshotPath = await this.applicationService.uploadScreenshot(
            this.selectedFile,
            this.applicationId,
          );
          await this.applicationService.update({
            id: this.applicationId,
            screenshot_path: screenshotPath,
          });
        }
      } else {
        const created = await this.applicationService.create(payload);

        if (this.selectedFile && created.id) {
          const screenshotPath = await this.applicationService.uploadScreenshot(
            this.selectedFile,
            created.id,
          );
          await this.applicationService.update({
            id: created.id,
            screenshot_path: screenshotPath,
          });
        }
      }

      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Failed to save application:', error);
    } finally {
      this.submitting.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  private markAllAsTouched(): void {
    this.form.markAllAsTouched();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
