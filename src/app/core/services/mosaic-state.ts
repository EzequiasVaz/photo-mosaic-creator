import { computed, effect, Injectable, signal } from '@angular/core';
import {
  ExportSettings,
  MosaicLayout,
  MosaicPhoto,
  MosaicSettings,
  MosaicSnapshot,
  MosaicTheme,
  PhotoTransform,
} from '../models/mosaic.models';

const STORAGE_KEY = 'photo-mosaic-creator-state';
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const DEFAULT_TRANSFORM: PhotoTransform = {
  zoom: 1,
  panX: 0,
  panY: 0,
  rotation: 0,
  flipX: false,
  flipY: false,
  aspectRatio: 'free',
};

const DEFAULT_SETTINGS: MosaicSettings = {
  layout: 'classic',
  theme: 'minimal-white',
  spacing: 10,
  borderSize: 1,
  backgroundColor: '#f6f6f6',
  borderColor: '#e0e0e0',
  roundedCorners: true,
  borderRadius: 12,
  shadow: 8,
  mainPhotoSize: 42,
  showTimeline: true,
  text: {
    title: '2 anos',
    subtitle: 'Nossa história ficou mais bonita desde que você chegou.',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#212121',
    size: 28,
    align: 'center',
    x: 50,
    y: 12,
  },
};

const THEMES: Record<MosaicTheme, Partial<MosaicSettings>> = {
  'minimal-white': { backgroundColor: '#ffffff', borderColor: '#ececec' },
  'minimal-black': { backgroundColor: '#101010', borderColor: '#2b2b2b' },
  scandinavian: { backgroundColor: '#f4f1ea', borderColor: '#d8d2c8' },
  premium: { backgroundColor: '#f8f8f9', borderColor: '#bba37a' },
  'fine-art': { backgroundColor: '#f7f1e8', borderColor: '#c7b59a' },
  elegant: { backgroundColor: '#fdfcfa', borderColor: '#d2c7bb', spacing: 16 },
  instagram: { backgroundColor: '#fbfbfb', borderColor: '#dcdcdc', borderRadius: 4 },
  kids: { backgroundColor: '#fffaf0', borderColor: '#f7d6dd' },
};

@Injectable({ providedIn: 'root' })
export class MosaicState {
  readonly photos = signal<MosaicPhoto[]>([]);
  readonly settings = signal<MosaicSettings>({ ...DEFAULT_SETTINGS });
  readonly selectedPhotoId = signal<string | null>(null);

  private readonly undoStack = signal<MosaicSnapshot[]>([]);
  private readonly redoStack = signal<MosaicSnapshot[]>([]);

  readonly canUndo = computed(() => this.undoStack().length > 0);
  readonly canRedo = computed(() => this.redoStack().length > 0);
  readonly mainPhoto = computed(() => this.photos().find((photo) => photo.isMain) ?? this.photos()[0] ?? null);
  readonly sidePhotos = computed(() => this.photos().filter((photo) => !photo.isMain));
  readonly selectedPhoto = computed(
    () => this.photos().find((photo) => photo.id === this.selectedPhotoId()) ?? this.mainPhoto(),
  );
  readonly timelinePhotos = computed(() => [...this.photos()].sort((a, b) => a.createdAt - b.createdAt));

  constructor() {
    this.restore();
    effect(() => {
      const state: MosaicSnapshot = {
        photos: this.photos().map((photo) => ({ ...photo, src: photo.thumbnailSrc })),
        settings: this.settings(),
        selectedPhotoId: this.selectedPhotoId(),
      };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    });
  }

  async addFiles(input: FileList | File[]): Promise<void> {
    const files = Array.from(input).filter((file) => ALLOWED_TYPES.has(file.type));
    if (!files.length) {
      return;
    }

    const newPhotos = await Promise.all(files.map((file) => this.toPhoto(file)));
    this.saveSnapshot();
    this.photos.update((current) => {
      const merged = [...current, ...newPhotos];
      if (!merged.some((photo) => photo.isMain) && merged[0]) {
        merged[0] = { ...merged[0], isMain: true };
      }
      return merged;
    });
    this.selectedPhotoId.set(newPhotos[0]?.id ?? this.selectedPhotoId());
  }

  reorderPhotos(previousIndex: number, currentIndex: number): void {
    if (previousIndex === currentIndex) {
      return;
    }
    this.saveSnapshot();
    this.photos.update((photos) => {
      const cloned = [...photos];
      const [moved] = cloned.splice(previousIndex, 1);
      cloned.splice(currentIndex, 0, moved);
      return cloned;
    });
  }

  removePhoto(id: string): void {
    this.saveSnapshot();
    this.photos.update((photos) => {
      const next = photos.filter((photo) => photo.id !== id);
      if (!next.length) {
        return [];
      }
      if (!next.some((photo) => photo.isMain)) {
        next[0] = { ...next[0], isMain: true };
      }
      return next;
    });
    if (this.selectedPhotoId() === id) {
      this.selectedPhotoId.set(this.mainPhoto()?.id ?? null);
    }
  }

  duplicatePhoto(id: string): void {
    const target = this.photos().find((photo) => photo.id === id);
    if (!target) {
      return;
    }
    this.saveSnapshot();
    const duplicate: MosaicPhoto = {
      ...target,
      id: this.createId(),
      name: `${target.name} (cópia)`,
      isMain: false,
      createdAt: Date.now(),
    };
    this.photos.update((photos) => [...photos, duplicate]);
  }

  toggleFavorite(id: string): void {
    this.updatePhoto(id, (photo) => ({ ...photo, favorite: !photo.favorite }));
  }

  setMainPhoto(id: string): void {
    this.saveSnapshot();
    this.photos.update((photos) => photos.map((photo) => ({ ...photo, isMain: photo.id === id })));
    this.selectedPhotoId.set(id);
  }

  selectPhoto(id: string): void {
    this.selectedPhotoId.set(id);
  }

  updateTransform(id: string, patch: Partial<PhotoTransform>): void {
    this.updatePhoto(id, (photo) => ({ ...photo, transform: { ...photo.transform, ...patch } }));
  }

  updateSettings(patch: Partial<MosaicSettings>): void {
    this.saveSnapshot();
    this.settings.update((settings) => ({ ...settings, ...patch }));
  }

  updateText<K extends keyof MosaicSettings['text']>(key: K, value: MosaicSettings['text'][K]): void {
    this.saveSnapshot();
    this.settings.update((settings) => ({ ...settings, text: { ...settings.text, [key]: value } }));
  }

  applyLayout(layout: MosaicLayout): void {
    this.updateSettings({ layout });
  }

  applyTheme(theme: MosaicTheme): void {
    const patch = THEMES[theme] ?? {};
    this.saveSnapshot();
    this.settings.update((settings) => ({ ...settings, ...patch, theme }));
  }

  autoArrange(): void {
    const source = this.photos();
    if (source.length < 3) {
      return;
    }

    this.saveSnapshot();
    const portrait = source.filter((photo) => photo.orientation === 'portrait');
    const landscape = source.filter((photo) => photo.orientation === 'landscape');
    const square = source.filter((photo) => photo.orientation === 'square');
    const buckets = [landscape, portrait, square].map((items) => [...items].sort((a, b) => a.name.localeCompare(b.name)));

    const ordered: MosaicPhoto[] = [];
    while (buckets.some((bucket) => bucket.length)) {
      for (const bucket of buckets) {
        const candidate = bucket.shift();
        if (!candidate) {
          continue;
        }
        if (ordered.at(-1)?.name === candidate.name) {
          bucket.push(candidate);
          continue;
        }
        ordered.push(candidate);
      }
    }

    const currentMain = this.mainPhoto();
    this.photos.set(ordered.map((photo) => ({ ...photo, isMain: photo.id === currentMain?.id })));
  }

  undo(): void {
    if (!this.canUndo()) {
      return;
    }
    const previous = this.undoStack().at(-1);
    if (!previous) {
      return;
    }
    this.undoStack.update((entries) => entries.slice(0, -1));
    this.redoStack.update((entries) => [...entries, this.cloneState()]);
    this.applySnapshot(previous);
  }

  redo(): void {
    if (!this.canRedo()) {
      return;
    }
    const next = this.redoStack().at(-1);
    if (!next) {
      return;
    }
    this.redoStack.update((entries) => entries.slice(0, -1));
    this.undoStack.update((entries) => [...entries, this.cloneState()]);
    this.applySnapshot(next);
  }

  clear(): void {
    this.saveSnapshot();
    this.photos.set([]);
    this.selectedPhotoId.set(null);
  }

  getThemeTextColor(): string {
    return this.settings().theme === 'minimal-black' ? '#f5f5f5' : this.settings().text.color;
  }

  getExportDefaults(): ExportSettings {
    return {
      format: 'png',
      quality: 0.95,
      width: 2048,
      height: 2048,
      keepOriginalResolution: false,
    };
  }

  private updatePhoto(id: string, updater: (photo: MosaicPhoto) => MosaicPhoto): void {
    this.saveSnapshot();
    this.photos.update((photos) => photos.map((photo) => (photo.id === id ? updater(photo) : photo)));
  }

  private saveSnapshot(): void {
    this.undoStack.update((entries) => [...entries, this.cloneState()]);
    this.redoStack.set([]);
  }

  private applySnapshot(snapshot: MosaicSnapshot | undefined): void {
    if (!snapshot) {
      return;
    }
    this.photos.set(snapshot.photos);
    this.settings.set(snapshot.settings);
    this.selectedPhotoId.set(snapshot.selectedPhotoId);
  }

  private cloneState(): MosaicSnapshot {
    return {
      photos: this.photos().map((photo) => ({ ...photo, transform: { ...photo.transform } })),
      settings: {
        ...this.settings(),
        text: { ...this.settings().text },
      },
      selectedPhotoId: this.selectedPhotoId(),
    };
  }

  private restore(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    const rawState = localStorage.getItem(STORAGE_KEY);
    if (!rawState) {
      return;
    }
    try {
      const parsed = JSON.parse(rawState) as MosaicSnapshot;
      this.photos.set(parsed.photos ?? []);
      this.settings.set({ ...DEFAULT_SETTINGS, ...parsed.settings, text: { ...DEFAULT_SETTINGS.text, ...parsed.settings?.text } });
      this.selectedPhotoId.set(parsed.selectedPhotoId);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private async toPhoto(file: File): Promise<MosaicPhoto> {
    const src = URL.createObjectURL(file);
    const thumbnailSrc = await this.createThumbnail(src);
    const orientation = await this.getOrientation(src);

    return {
      id: this.createId(),
      name: file.name,
      src,
      thumbnailSrc,
      favorite: false,
      isMain: false,
      createdAt: Date.now(),
      orientation,
      transform: { ...DEFAULT_TRANSFORM },
    };
  }

  private async createThumbnail(src: string): Promise<string> {
    const image = await this.loadImage(src);
    const maxSize = 460;
    const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext('2d');
    if (!context) {
      return src;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  }

  private async getOrientation(src: string): Promise<MosaicPhoto['orientation']> {
    const image = await this.loadImage(src);
    if (image.width === image.height) {
      return 'square';
    }
    return image.width > image.height ? 'landscape' : 'portrait';
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
