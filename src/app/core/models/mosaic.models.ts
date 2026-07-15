export type MosaicLayout = 'classic' | 'timeline' | 'grid' | 'polaroid' | 'elegant' | 'frame';

export type MosaicTheme =
  | 'minimal-white'
  | 'minimal-black'
  | 'scandinavian'
  | 'premium'
  | 'fine-art'
  | 'elegant'
  | 'instagram'
  | 'kids';

export interface TextOverlay {
  title: string;
  subtitle: string;
  fontFamily: string;
  color: string;
  size: number;
  align: 'left' | 'center' | 'right';
  x: number;
  y: number;
}

export interface PhotoTransform {
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  aspectRatio: 'free' | '1:1' | '4:5' | '16:9';
}

export interface MosaicPhoto {
  id: string;
  name: string;
  src: string;
  thumbnailSrc: string;
  favorite: boolean;
  isMain: boolean;
  createdAt: number;
  orientation: 'portrait' | 'landscape' | 'square';
  transform: PhotoTransform;
}

export interface MosaicSettings {
  layout: MosaicLayout;
  theme: MosaicTheme;
  spacing: number;
  borderSize: number;
  backgroundColor: string;
  borderColor: string;
  roundedCorners: boolean;
  borderRadius: number;
  shadow: number;
  mainPhotoSize: number;
  showTimeline: boolean;
  text: TextOverlay;
}

export interface MosaicSnapshot {
  photos: MosaicPhoto[];
  settings: MosaicSettings;
  selectedPhotoId: string | null;
}

export interface ExportSettings {
  format: 'png' | 'jpeg' | 'pdf';
  quality: number;
  width: number;
  height: number;
  keepOriginalResolution: boolean;
}
