
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

  // Obtenir l'URL d'intégration pour un film (utilise vidsrc.xyz qui fonctionne sans sandbox restrictions)
  getVidFastMovieUrl: (tmdbId: string) => {
    return `https://vidsrc.xyz/embed/movie/${tmdbId}`;
  },

  // Obtenir l'URL d'intégration pour une série
  getVidFastTVUrl: (tmdbId: string, season: number, episode: number) => {
    return `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`;
  },

  // Alternative: 2embed
  get2EmbedMovieUrl: (tmdbId: string) => {
    return `https://www.2embed.cc/embed/${tmdbId}`;
  },

  get2EmbedTVUrl: (tmdbId: string, season: number, episode: number) => {
    return `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;
  },

  // Alternative: VidSrc.to
  getVidSrcMovieUrl: (tmdbId: string) => {
    return `https://vidsrc.to/embed/movie/${tmdbId}`;
  },

  getVidSrcTVUrl: (tmdbId: string, season: number, episode: number) => {
    return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
  }
};
