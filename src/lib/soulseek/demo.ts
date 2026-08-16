import type { SearchResult, Transfer } from '@/types';
export const demoResults: SearchResult[] = [
  { id: 'demo-1', file: 'Massive Attack / Mezzanine / 01 - Angel.flac', user: 'lossless.archive', format: 'FLAC', bitrate: 'Lossless', size: '52.8 MB', duration: '06:18', slots: '2 / 4', available: true },
  { id: 'demo-2', file: 'Massive Attack - Angel (Remastered).mp3', user: 'northstar', format: 'MP3', bitrate: '320 kbps', size: '14.6 MB', duration: '06:18', slots: '1 / 3', available: true },
  { id: 'demo-3', file: 'Massive Attack - Angel [1998].ogg', user: 'transmission', format: 'OGG', bitrate: '256 kbps', size: '11.2 MB', duration: '06:17', slots: '0 / 1', available: false },
  { id: 'demo-4', file: 'Massive Attack / Live / Angel (Brixton).flac', user: 'openchannels', format: 'FLAC', bitrate: 'Lossless', size: '61.3 MB', duration: '07:04', slots: '3 / 5', available: true }
];
export const demoTransfers: Transfer[] = [
  { id: 'd1', file: 'Burial - Untrue - Archangel.flac', user: 'lossless.archive', size: '42.1 MB', transferred: '30.4 MB', progress: 72, speed: '4.8 MB/s', eta: '2s', state: 'transferring', direction: 'download' },
  { id: 'd2', file: 'Boards of Canada - Dayvan Cowboy.mp3', user: 'northstar', size: '10.7 MB', transferred: '10.7 MB', progress: 100, speed: '—', eta: 'Complete', state: 'completed', direction: 'download' },
  { id: 'u1', file: 'Four Tet - There Is Love In You.flac', user: 'orbiting', size: '48.3 MB', transferred: '11.6 MB', progress: 24, speed: '1.2 MB/s', eta: '31s', state: 'transferring', direction: 'upload' }
];
