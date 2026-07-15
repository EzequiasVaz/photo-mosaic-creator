import { Component, HostListener, inject, viewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MosaicState } from '../../core/services/mosaic-state';
import { ExportDialog } from '../export-dialog/export-dialog';
import { MosaicEditor } from '../mosaic-editor/mosaic-editor';
import { SettingsPanel } from '../settings-panel/settings-panel';
import { TimelinePanel } from '../timeline-panel/timeline-panel';
import { Toolbar } from '../toolbar/toolbar';
import { UploadPanel } from '../upload-panel/upload-panel';

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatDialogModule, Toolbar, UploadPanel, MosaicEditor, SettingsPanel, TimelinePanel],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly state = inject(MosaicState);
  private readonly dialog = inject(MatDialog);

  readonly uploadPanel = viewChild(UploadPanel);

  readonly canUndo = this.state.canUndo;
  readonly canRedo = this.state.canRedo;

  triggerUpload(): void {
    this.uploadPanel()?.openFiles();
  }

  autoArrange(): void {
    this.state.autoArrange();
  }

  undo(): void {
    this.state.undo();
  }

  redo(): void {
    this.state.redo();
  }

  openExportDialog(): void {
    this.dialog.open(ExportDialog);
  }

  async toggleFullscreen(): Promise<void> {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return;
    }
    await document.exitFullscreen();
  }

  @HostListener('document:keydown', ['$event'])
  async onKeydown(event: KeyboardEvent): Promise<void> {
    const key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && key === 'z') {
      event.preventDefault();
      this.undo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key === 'y') {
      event.preventDefault();
      this.redo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key === 'o') {
      event.preventDefault();
      this.triggerUpload();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key === 'e') {
      event.preventDefault();
      this.openExportDialog();
      return;
    }
    if (key === 'f') {
      event.preventDefault();
      await this.toggleFullscreen();
    }
  }
}
