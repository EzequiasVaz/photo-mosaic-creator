import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, computed, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Sortable, { SortableEvent } from 'sortablejs';
import { MosaicState } from '../../core/services/mosaic-state';

@Component({
  selector: 'app-photo-grid',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './photo-grid.html',
  styleUrl: './photo-grid.scss',
})
export class PhotoGrid implements AfterViewInit, OnDestroy {
  private readonly state = inject(MosaicState);
  readonly gridElement = viewChild.required<ElementRef<HTMLElement>>('grid');

  readonly photos = this.state.photos;
  readonly selectedPhoto = this.state.selectedPhoto;
  readonly selectedPhotoId = computed(() => this.selectedPhoto()?.id ?? null);

  private sortable?: Sortable;

  ngAfterViewInit(): void {
    this.sortable = Sortable.create(this.gridElement().nativeElement, {
      animation: 200,
      draggable: '.photo-card',
      onEnd: (event: SortableEvent) => {
        if (event.oldIndex == null || event.newIndex == null) {
          return;
        }
        this.state.reorderPhotos(event.oldIndex, event.newIndex);
      },
    });
  }

  ngOnDestroy(): void {
    this.sortable?.destroy();
  }

  select(id: string): void {
    this.state.selectPhoto(id);
  }

  remove(id: string): void {
    this.state.removePhoto(id);
  }

  duplicate(id: string): void {
    this.state.duplicatePhoto(id);
  }

  toggleFavorite(id: string): void {
    this.state.toggleFavorite(id);
  }

  setMain(id: string): void {
    this.state.setMainPhoto(id);
  }

  trackById(_: number, photo: { id: string }): string {
    return photo.id;
  }
}
