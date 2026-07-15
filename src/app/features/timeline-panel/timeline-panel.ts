import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MosaicState } from '../../core/services/mosaic-state';

@Component({
  selector: 'app-timeline-panel',
  imports: [DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './timeline-panel.html',
  styleUrl: './timeline-panel.scss',
})
export class TimelinePanel {
  private readonly state = inject(MosaicState);

  readonly settings = this.state.settings;
  readonly photos = this.state.timelinePhotos;

  makeMain(id: string): void {
    this.state.setMainPhoto(id);
  }
}
