import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ExportSettings } from '../../core/models/mosaic.models';
import { MosaicState } from '../../core/services/mosaic-state';

@Component({
  selector: 'app-export-dialog',
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatOptionModule, MatSelectModule],
  templateUrl: './export-dialog.html',
  styleUrl: './export-dialog.scss',
})
export class ExportDialog {
  private readonly dialogRef = inject(MatDialogRef<ExportDialog>);
  private readonly state = inject(MosaicState);

  readonly busy = signal(false);
  readonly config = signal<ExportSettings>(this.state.getExportDefaults());

  readonly sizes = [
    { label: '1080 x 1080', width: 1080, height: 1080 },
    { label: '2048 x 2048', width: 2048, height: 2048 },
    { label: '3000 x 3000', width: 3000, height: 3000 },
    { label: '4000 x 4000', width: 4000, height: 4000 },
    { label: '6000 x 6000', width: 6000, height: 6000 },
  ] as const;

  setFormat(format: ExportSettings['format']): void {
    this.config.update((config) => ({ ...config, format }));
  }

  setSize(value: string): void {
    if (value === 'original') {
      this.config.update((config) => ({ ...config, keepOriginalResolution: true }));
      return;
    }

    const [width, height] = value.split('x').map((item) => Number(item));
    this.config.update((config) => ({
      ...config,
      width,
      height,
      keepOriginalResolution: false,
    }));
  }

  async export(): Promise<void> {
    const canvasElement = document.getElementById('mosaic-canvas');
    if (!canvasElement) {
      return;
    }

    this.busy.set(true);
    const settings = this.config();

    try {
      const canvas = await html2canvas(canvasElement, {
        useCORS: true,
        backgroundColor: null,
        width: settings.keepOriginalResolution ? undefined : settings.width,
        height: settings.keepOriginalResolution ? undefined : settings.height,
        scale: settings.keepOriginalResolution ? window.devicePixelRatio : 1,
      });

      if (settings.format === 'pdf') {
        await this.exportPdf(canvas);
      } else {
        const mimeType = settings.format === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, settings.quality);
        const blob = await (await fetch(dataUrl)).blob();
        await this.save(blob, `mosaic.${settings.format}`);
      }

      this.dialogRef.close();
    } finally {
      this.busy.set(false);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  private async exportPdf(canvas: HTMLCanvasElement): Promise<void> {
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
      compress: true,
    });
    const image = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(image, 'JPEG', 0, 0, canvas.width, canvas.height);
    const blob = pdf.output('blob');
    await this.save(blob, 'mosaic.pdf');
  }

  private async save(blob: Blob, fileName: string): Promise<void> {
    if ('showSaveFilePicker' in window) {
      const picker = await (
        window as Window & {
          showSaveFilePicker: (params: {
            suggestedName: string;
            types: Array<{ description: string; accept: Record<string, string[]> }>;
          }) => Promise<FileSystemFileHandle>;
        }
      ).showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: 'Imagem', accept: { [blob.type || 'application/octet-stream']: [`.${fileName.split('.').pop()}`] } }],
      });

      const writable = await picker.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
