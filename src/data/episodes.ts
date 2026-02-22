// QAD Podcast - Episodes Data
import episodesData from './episodes.json'

export interface Episode {
  id: string;
  number: number;
  season: number;
  title: {
    ckb: string;
    ar: string;
    en: string;
  };
  description: {
    ckb: string;
    ar: string;
    en: string;
  };
  guestId: string;
  guestName: {
    ckb: string;
    ar: string;
    en: string;
  };
  date: string;
  duration: string;
  youtubeId: string;
  spotifyUrl?: string;
  applePodcastUrl?: string;
  themes: string[];
  chapters: {
    time: string;
    title: {
      ckb: string;
      ar: string;
      en: string;
    };
  }[];
  thumbnail?: string;
}

// Static data for production compatibility
export const loadEpisodes = (): Episode[] => {
  return episodesData as Episode[];
}

export const saveEpisodes = (eps: Episode[]): void => {
  console.warn('saveEpisodes is disabled in production (serverless environment)');
}

// Live reference
export const getEpisodes = (): Episode[] => loadEpisodes()

// Cache reference
export let episodes: Episode[] = loadEpisodes()

// Refresh (no-op in prod, but keeps API compatibility)
export const refreshEpisodes = () => {
  episodes = loadEpisodes()
  return episodes
}

export const getEpisodesByTheme = (theme: string): Episode[] =>
  getEpisodes().filter(ep => ep.themes.includes(theme));

export const getEpisodesBySeason = (season: number): Episode[] =>
  getEpisodes().filter(ep => ep.season === season);

export const getEpisodeBySlug = (slug: string): Episode | undefined =>
  getEpisodes().find(ep => ep.id === slug);

export const getLatestEpisode = (): Episode => getEpisodes()[0];

export const getAllThemes = (): string[] =>
  [...new Set(getEpisodes().flatMap(ep => ep.themes))];

export const getAllSeasons = (): number[] =>
  [...new Set(getEpisodes().map(ep => ep.season))].sort((a, b) => b - a);
