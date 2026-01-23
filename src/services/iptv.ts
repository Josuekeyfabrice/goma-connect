
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

  // Source principale: autoembed (très fiable et mise à jour)
  getVidFastMovieUrl: (tmdbId: string) => {
    return `https://player.autoembed.cc/embed/movie/${tmdbId}`;
  },

  getVidFastTVUrl: (tmdbId: string, season: number, episode: number) => {
    return `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`;
  },

  // Alternative 1: multiembed
  getMultiEmbedMovieUrl: (tmdbId: string) => {
    return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
  },

  getMultiEmbedTVUrl: (tmdbId: string, season: number, episode: number) => {
    return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
  },

  // Alternative 2: embed.su
  getEmbedSuMovieUrl: (tmdbId: string) => {
    return `https://embed.su/embed/movie/${tmdbId}`;
  },

  getEmbedSuTVUrl: (tmdbId: string, season: number, episode: number) => {
    return `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;
  },

  // Alternative 3: vidsrc.cc
  getVidSrcCCMovieUrl: (tmdbId: string) => {
    return `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;
  },

  getVidSrcCCTVUrl: (tmdbId: string, season: number, episode: number) => {
    return `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`;
  }
};
