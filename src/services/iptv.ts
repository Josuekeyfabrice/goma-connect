
import { supabase } from '@/integrations/supabase/client';

export interface XtreamConfig {
  url: string;
  username: string;
  password: string;
}

export const IPTV_SERVERS: XtreamConfig[] = [
  { url: 'http://7smartvplayers.top:8080', username: '52546757', password: '746465877' },
  { url: 'http://7smartvplayers.top:8080', username: '0mpyvcix', password: '0uovsen8' },
  { url: 'http://7smartvplayers.top:8080', username: 'claudia0064', password: 'ccd506941' },
  { url: 'http://7smartvplayers.top:8080', username: '08588258823', password: '746465877' } // Note: password assumed from first entry as it was missing in last entry
];

export const iptvService = {
  // Obtenir l'URL de streaming pour une chaîne Xtream Codes
  getStreamUrl: (config: XtreamConfig, streamId: string, extension: string = 'm3u8') => {
    return `${config.url}/live/${config.username}/${config.password}/${streamId}.${extension}`;
  },

  // Obtenir l'URL d'intégration VidFast pour un film
  getVidFastMovieUrl: (tmdbId: string) => {
    return `https://vidfast.pro/movie/${tmdbId}`;
  },

  // Obtenir l'URL d'intégration VidFast pour une série
  getVidFastTVUrl: (tmdbId: string, season: number, episode: number) => {
    return `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}`;
  },

  // Obtenir l'URL d'intégration VidNest pour un film
  getVidNestMovieUrl: (tmdbId: string, server: string = 'gama') => {
    return `https://vidnest.fun/movie/${tmdbId}?server=${server}`;
  },

  // Obtenir l'URL d'intégration VidNest pour une série
  getVidNestTVUrl: (tmdbId: string, season: number, episode: number, server: string = 'alfa') => {
    return `https://vidnest.fun/tv/${tmdbId}/${season}/${episode}?server=${server}`;
  }
};
