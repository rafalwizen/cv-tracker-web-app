import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import { ApplicationService } from '../../core/services/application.service';
import { STATUS_CONFIG, ALL_STATUSES } from '../../shared/utils/status-labels';
import { Application, ApplicationStatus } from '../../core/models/application.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="header-bar">
        <h1 i18n="@@dashboard.title">Job Applications</h1>
        <button mat-raised-button color="primary" routerLink="/applications/new">
          <mat-icon>add</mat-icon>
          Add Application
        </button>
      </div>

      <!-- Filter row -->
      <div class="filter-row">
        <mat-form-field appearance="outline" class="status-filter">
          <mat-label>Filter by status</mat-label>
          <mat-select [(ngModel)]="selectedStatus" (selectionChange)="onFilterChange()">
            <mat-option [value]="''">All</mat-option>
            @for (status of allStatuses; track status) {
              <mat-option [value]="status">{{ getStatusLabel(status) }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Loading spinner -->
      @if (loading) {
        <div class="spinner-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      <!-- Table -->
      @if (!loading && filteredApplications.length > 0) {
        <div class="table-wrapper">
          <table mat-table [dataSource]="filteredApplications" class="applications-table">
            <!-- Company Name column -->
            <ng-container matColumnDef="company_name">
              <th mat-header-cell *matHeaderCellDef>Company</th>
              <td mat-cell *matCellDef="let app">{{ app.company_name }}</td>
            </ng-container>

            <!-- Position column -->
            <ng-container matColumnDef="position">
              <th mat-header-cell *matHeaderCellDef>Position</th>
              <td mat-cell *matCellDef="let app">{{ app.position }}</td>
            </ng-container>

            <!-- Status column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let app">
                <mat-chip
                  [color]="getStatusColor(app.status)"
                  [highlighted]="true"
                  class="status-chip"
                >
                  {{ getStatusLabel(app.status) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Applied At column -->
            <ng-container matColumnDef="applied_at">
              <th mat-header-cell *matHeaderCellDef>Applied</th>
              <td mat-cell *matCellDef="let app">{{ app.applied_at | date:'mediumDate' }}</td>
            </ng-container>

            <!-- Actions column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let app">
                <button mat-icon-button matTooltip="View" (click)="viewApplication(app.id)">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Edit" (click)="editApplication(app.id)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" matTooltip="Delete" (click)="deleteApplication(app)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      }

      <!-- Empty state -->
      @if (!loading && filteredApplications.length === 0) {
        <mat-card class="empty-state">
          <mat-card-content>
            <mat-icon class="empty-icon">inbox</mat-icon>
            <p>No applications found.</p>
            @if (selectedStatus) {
              <p class="empty-hint">Try changing the status filter or add a new application.</p>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header-bar h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 500;
    }

    .header-bar button mat-icon {
      margin-right: 8px;
    }

    .filter-row {
      margin-bottom: 16px;
    }

    .status-filter {
      width: 260px;
    }

    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 48px 0;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .applications-table {
      width: 100%;
      min-width: 600px;
    }

    .applications-table th {
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 0.05em;
    }

    .status-chip {
      font-size: 0.8rem;
      min-height: 28px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #9e9e9e;
      margin-bottom: 16px;
    }

    .empty-state p {
      margin: 0;
      font-size: 1.1rem;
      color: #616161;
    }

    .empty-hint {
      margin-top: 8px !important;
      font-size: 0.9rem !important;
      color: #9e9e9e !important;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .header-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .status-filter {
        width: 100%;
      }
    }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly applicationService = inject(ApplicationService);
  private readonly router = inject(Router);

  applications: Application[] = [];
  filteredApplications: Application[] = [];
  displayedColumns: string[] = ['company_name', 'position', 'status', 'applied_at', 'actions'];
  loading = true;
  selectedStatus: string = '';

  readonly allStatuses = ALL_STATUSES;

  ngOnInit(): void {
    this.loadApplications();
  }

  async loadApplications(): Promise<void> {
    this.loading = true;
    try {
      this.applications = await this.applicationService.getAll();
      this.applyFilter();
    } catch {
      // silently handle - table will be empty
    } finally {
      this.loading = false;
    }
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  private applyFilter(): void {
    if (!this.selectedStatus) {
      this.filteredApplications = [...this.applications];
    } else {
      this.filteredApplications = this.applications.filter(
        (app) => app.status === this.selectedStatus
      );
    }
  }

  getStatusLabel(status: ApplicationStatus): string {
    return STATUS_CONFIG[status]?.label ?? status;
  }

  getStatusColor(status: ApplicationStatus): 'primary' | 'accent' | 'warn' {
    const themePalette = STATUS_CONFIG[status]?.color ?? 'primary';
    if (themePalette === 'primary' || themePalette === 'accent' || themePalette === 'warn') {
      return themePalette;
    }
    return 'primary';
  }

  viewApplication(id: string): void {
    this.router.navigate(['/applications', id]);
  }

  editApplication(id: string): void {
    this.router.navigate(['/applications', id, 'edit']);
  }

  async deleteApplication(app: Application): Promise<void> {
    const confirmed = window.confirm(
      `Are you sure you want to delete the application for "${app.position}" at "${app.company_name}"?`
    );
    if (!confirmed) return;

    try {
      await this.applicationService.delete(app.id);
      this.applications = this.applications.filter((a) => a.id !== app.id);
      this.applyFilter();
    } catch {
      // silently handle
    }
  }
}
