import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MosaicLayout, MosaicTheme } from '../../core/models/mosaic.models';
import { MosaicState } from '../../core/services/mosaic-state';

@Component({
  selector: 'app-settings-panel',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule,
  ],
  templateUrl: './settings-panel.html',
  styleUrl: './settings-panel.scss',
})
export class SettingsPanel {
  private readonly state = inject(MosaicState);

  readonly settings = this.state.settings;

  readonly layouts: Array<{ value: MosaicLayout; label: string }> = [
    { value: 'classic', label: 'Clássico' },
    { value: 'timeline', label: 'Timeline' },
    { value: 'grid', label: 'Grade' },
    { value: 'polaroid', label: 'Polaroid' },
    { value: 'elegant', label: 'Elegante' },
    { value: 'frame', label: 'Moldura' },
  ];

  readonly themes: Array<{ value: MosaicTheme; label: string }> = [
    { value: 'minimal-white', label: 'Minimalista Branco' },
    { value: 'minimal-black', label: 'Minimalista Preto' },
    { value: 'scandinavian', label: 'Escandinavo' },
    { value: 'premium', label: 'Premium' },
    { value: 'fine-art', label: 'Fine Art' },
    { value: 'elegant', label: 'Elegante' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'kids', label: 'Infantil' },
  ];

  setLayout(layout: MosaicLayout): void {
    this.state.applyLayout(layout);
  }

  setTheme(theme: MosaicTheme): void {
    this.state.applyTheme(theme);
  }

  setNumber(key: 'spacing' | 'borderSize' | 'borderRadius' | 'shadow' | 'mainPhotoSize', value: number): void {
    this.state.updateSettings({ [key]: value });
  }

  setBoolean(key: 'roundedCorners' | 'showTimeline', value: boolean): void {
    this.state.updateSettings({ [key]: value });
  }

  setColor(key: 'backgroundColor' | 'borderColor' | 'text.color', value: string): void {
    if (key === 'text.color') {
      this.state.updateText('color', value);
      return;
    }
    this.state.updateSettings({ [key]: value });
  }

  setTextNumber(key: 'size' | 'x' | 'y', value: number): void {
    this.state.updateText(key, value);
  }

  setTextString(key: 'title' | 'subtitle' | 'fontFamily', value: string): void {
    this.state.updateText(key, value);
  }

  setTextAlign(value: 'left' | 'center' | 'right'): void {
    this.state.updateText('align', value);
  }
}
