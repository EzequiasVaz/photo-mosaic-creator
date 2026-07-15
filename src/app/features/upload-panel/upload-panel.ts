import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MosaicState } from '../../core/services/mosaic-state';

@Component({
  selector: 'app-upload-panel',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './upload-panel.html',
  styleUrl: './upload-panel.scss',
})
export class UploadPanel {
  private readonly state = inject(MosaicState);
  readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  readonly folderInput = viewChild.required<ElementRef<HTMLInputElement>>('folderInput');
  readonly supportsDirectoryPicker = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  readonly photos = this.state.photos;

  openFiles(): void {
    this.fileInput().nativeElement.click();
  }

  openFolder(): void {
    this.folderInput().nativeElement.click();
  }

  async openFolderSystemAccess(): Promise<void> {
    if (!this.supportsDirectoryPicker) {
      return;
    }

    const windowWithPicker = window as Window & {
      showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
    };
    const handle = await windowWithPicker.showDirectoryPicker?.();
    if (!handle) {
      return;
    }
    const files: File[] = [];
    await this.walkDirectory(handle, files);
    await this.state.addFiles(files);
  }

  async onFilesPicked(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files) {
      return;
    }
    await this.state.addFiles(input.files);
    input.value = '';
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (!files?.length) {
      return;
    }
    await this.state.addFiles(files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private async walkDirectory(handle: FileSystemDirectoryHandle, files: File[]): Promise<void> {
    for await (const item of handle.values()) {
      if (item.kind === 'file') {
        const file = await (item as FileSystemFileHandle).getFile();
        files.push(file);
      } else {
        await this.walkDirectory(item as FileSystemDirectoryHandle, files);
      }
    }
  }
}
