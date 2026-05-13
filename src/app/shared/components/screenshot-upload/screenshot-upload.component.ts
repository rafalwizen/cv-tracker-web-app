import { Component, EventEmitter, Output, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-screenshot-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <div class="upload-wrapper">
      <input
        type="file"
        accept="image/*"
        #fileInput
        (change)="onFileSelected($event)"
        class="file-input-hidden"
      />

      @if (previewUrl) {
        <div class="preview-container">
          <img [src]="previewUrl" alt="Preview" class="preview-img" />
          <button mat-icon-button color="warn" (click)="clearFile()" i18n="@@screenshot.clear">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      } @else {
        <button mat-stroked-button (click)="fileInput.click()" i18n="@@screenshot.select">
          <mat-icon>attach_file</mat-icon>
          Select screenshot
        </button>
      }
    </div>
  `,
  styles: [`
    .upload-wrapper {
      display: flex;
      align-items: center;
    }

    .file-input-hidden {
      display: none;
    }

    .preview-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .preview-img {
      max-width: 160px;
      max-height: 100px;
      border-radius: 6px;
      border: 1px solid rgba(0, 0, 0, 0.12);
      object-fit: cover;
    }
  `],
})
export class ScreenshotUploadComponent {
  @Output() fileSelected = new EventEmitter<File | null>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  previewUrl: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.previewUrl = URL.createObjectURL(file);
    this.fileSelected.emit(file);
  }

  clearFile(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = null;
    this.fileInput.nativeElement.value = '';
    this.fileSelected.emit(null);
  }
}
