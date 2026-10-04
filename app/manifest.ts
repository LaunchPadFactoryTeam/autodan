import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Autodan — Voitures d’occasion à Nice',
    short_name: 'Autodan',
    start_url: '/',
    display: 'standalone',
    background_color: '#EEF5FD',
    theme_color: '#052747',
    lang: 'fr',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
