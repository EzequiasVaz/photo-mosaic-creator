import { TestBed } from '@angular/core/testing';
import { MosaicPhoto } from '../models/mosaic.models';
import { MosaicState } from './mosaic-state';

describe('MosaicState', () => {
  let service: MosaicState;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(MosaicState);
  });

  const buildPhoto = (id: string): MosaicPhoto => ({
    id,
    name: `${id}.jpg`,
    src: `blob:${id}`,
    thumbnailSrc: `thumb:${id}`,
    favorite: false,
    isMain: id === 'a',
    createdAt: Date.now(),
    orientation: 'landscape',
    transform: {
      zoom: 1,
      panX: 0,
      panY: 0,
      rotation: 0,
      flipX: false,
      flipY: false,
      aspectRatio: 'free',
    },
  });

  it('should undo and redo settings updates', () => {
    const initialSpacing = service.settings().spacing;

    service.updateSettings({ spacing: 24 });
    expect(service.settings().spacing).toBe(24);

    service.undo();
    expect(service.settings().spacing).toBe(initialSpacing);

    service.redo();
    expect(service.settings().spacing).toBe(24);
  });

  it('should keep current main photo after auto arrange', () => {
    service.photos.set([buildPhoto('a'), buildPhoto('b'), buildPhoto('c')]);
    service.setMainPhoto('b');

    service.autoArrange();

    expect(service.mainPhoto()?.id).toBe('b');
    expect(service.photos().length).toBe(3);
  });
});
