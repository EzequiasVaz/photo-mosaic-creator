import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MosaicState } from '../../core/services/mosaic-state';
import { PhotoGrid } from '../photo-grid/photo-grid';

@Component({
  selector: 'app-mosaic-editor',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatSliderModule,
    PhotoGrid,
  ],
  templateUrl: './mosaic-editor.html',
  styleUrl: './mosaic-editor.scss',
})
export class MosaicEditor {
  private readonly state = inject(MosaicState);

  readonly settings = this.state.settings;
  readonly mainPhoto = this.state.mainPhoto;
  readonly sidePhotos = this.state.sidePhotos;
  readonly selectedPhoto = this.state.selectedPhoto;
  readonly textColor = computed(() => this.state.getThemeTextColor());

  readonly layouts = [
    { value: 'classic', label: 'Clássico' },
    { value: 'timeline', label: 'Timeline' },
    { value: 'grid', label: 'Grade' },
    { value: 'polaroid', label: 'Polaroid' },
    { value: 'elegant', label: 'Elegante' },
    { value: 'frame', label: 'Moldura' },
  ] as const;

  setTransform(key: 'zoom' | 'rotation' | 'panX' | 'panY', value: number): void {
    const photo = this.selectedPhoto();
    if (!photo) {
      return;
    }
    this.state.updateTransform(photo.id, { [key]: value });
  }

  toggleFlip(axis: 'x' | 'y'): void {
    const photo = this.selectedPhoto();
    if (!photo) {
      return;
    }
    if (axis === 'x') {
      this.state.updateTransform(photo.id, { flipX: !photo.transform.flipX });
      return;
    }
    this.state.updateTransform(photo.id, { flipY: !photo.transform.flipY });
  }

  setAspectRatio(value: 'free' | '1:1' | '4:5' | '16:9'): void {
    const photo = this.selectedPhoto();
    if (!photo) {
      return;
    }
    this.state.updateTransform(photo.id, { aspectRatio: value });
  }

  transformStyle(photoId: string | undefined): string {
    const photo = this.state.photos().find((entry) => entry.id === photoId);
    if (!photo) {
      return '';
    }
    const { zoom, panX, panY, rotation, flipX, flipY } = photo.transform;
    return `translate(${panX}px, ${panY}px) scale(${flipX ? -zoom : zoom}, ${flipY ? -zoom : zoom}) rotate(${rotation}deg)`;
  }

  aspectClass(photoId: string | undefined): string {
    const photo = this.state.photos().find((entry) => entry.id === photoId);
    const aspect = photo?.transform.aspectRatio ?? 'free';
    return `ratio-${aspect.replace(':', '-')}`;
  }
}
