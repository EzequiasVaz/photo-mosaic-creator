import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-toolbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {
  readonly canUndo = input(false);
  readonly canRedo = input(false);
  readonly onUpload = output<void>();
  readonly onAutoArrange = output<void>();
  readonly onUndo = output<void>();
  readonly onRedo = output<void>();
  readonly onExport = output<void>();
  readonly onFullscreen = output<void>();
}
