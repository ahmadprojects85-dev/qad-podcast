// QAD Podcast - Episodes Data
import { getDb } from '../db/index'

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

export const getEpisodes = async (dbUrl: string): Promise<Episode[]> => {
  const conn = getDb(dbUrl);
  // Order by season DESC, number DESC to get newest first
  const rows = await conn.execute('SELECT * FROM episodes ORDER BY season DESC, number DESC');
  return rows.map((row: any) => ({
    id: row.id,
    number: row.number,
    season: row.season,
    title: {
      ckb: row.title_ckb || '',
      ar: row.title_ar || '',
      en: row.title_en || ''
    },
    description: {
      ckb: row.description_ckb || '',
      ar: row.description_ar || '',
      en: row.description_en || ''
    },
    guestId: row.guest_id || '',
    guestName: {
      ckb: row.guest_name_ckb || '',
      ar: row.guest_name_ar || '',
      en: row.guest_name_en || ''
    },
    date: row.date || '',
    duration: row.duration || '',
    youtubeId: row.youtube_id || '',
    spotifyUrl: row.spotify_url,
    applePodcastUrl: row.apple_podcast_url,
    themes: typeof row.themes === 'string' ? JSON.parse(row.themes) : row.themes || [],
    chapters: typeof row.chapters === 'string' ? JSON.parse(row.chapters) : row.chapters || [],
    thumbnail: row.thumbnail
  }));
}

export const getEpisodeBySlug = async (dbUrl: string, slug: string): Promise<Episode | undefined> => {
  const conn = getDb(dbUrl);
  const rows = await conn.execute('SELECT * FROM episodes WHERE id = ?', [slug]);
  if (!rows || rows.length === 0) return undefined;
  const row = rows[0] as any;
  return {
    id: row.id,
    number: row.number,
    season: row.season,
    title: {
      ckb: row.title_ckb || '',
      ar: row.title_ar || '',
      en: row.title_en || ''
    },
    description: {
      ckb: row.description_ckb || '',
      ar: row.description_ar || '',
      en: row.description_en || ''
    },
    guestId: row.guest_id || '',
    guestName: {
      ckb: row.guest_name_ckb || '',
      ar: row.guest_name_ar || '',
      en: row.guest_name_en || ''
    },
    date: row.date || '',
    duration: row.duration || '',
    youtubeId: row.youtube_id || '',
    spotifyUrl: row.spotify_url,
    applePodcastUrl: row.apple_podcast_url,
    themes: typeof row.themes === 'string' ? JSON.parse(row.themes) : row.themes || [],
    chapters: typeof row.chapters === 'string' ? JSON.parse(row.chapters) : row.chapters || [],
    thumbnail: row.thumbnail
  };
}

export const saveEpisode = async (dbUrl: string, e: Episode): Promise<void> => {
  const conn = getDb(dbUrl);
  await conn.execute(`
    INSERT INTO episodes (
      id, number, season, title_ckb, title_ar, title_en,
      description_ckb, description_ar, description_en,
      guest_id, guest_name_ckb, guest_name_ar, guest_name_en,
      date, duration, youtube_id, spotify_url, apple_podcast_url,
      themes, chapters, thumbnail
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      number=VALUES(number), season=VALUES(season),
      title_ckb=VALUES(title_ckb), title_ar=VALUES(title_ar), title_en=VALUES(title_en),
      description_ckb=VALUES(description_ckb), description_ar=VALUES(description_ar), description_en=VALUES(description_en),
      guest_id=VALUES(guest_id), guest_name_ckb=VALUES(guest_name_ckb), guest_name_ar=VALUES(guest_name_ar), guest_name_en=VALUES(guest_name_en),
      date=VALUES(date), duration=VALUES(duration), youtube_id=VALUES(youtube_id),
      spotify_url=VALUES(spotify_url), apple_podcast_url=VALUES(apple_podcast_url),
      themes=VALUES(themes), chapters=VALUES(chapters), thumbnail=VALUES(thumbnail)
  `, [
    e.id,
    e.number || 0,
    e.season || 0,
    e.title?.ckb || '', e.title?.ar || '', e.title?.en || '',
    e.description?.ckb || '', e.description?.ar || '', e.description?.en || '',
    e.guestId || '',
    e.guestName?.ckb || '', e.guestName?.ar || '', e.guestName?.en || '',
    e.date || '',
    e.duration || '',
    e.youtubeId || '',
    e.spotifyUrl || '',
    e.applePodcastUrl || '',
    JSON.stringify(e.themes || []),
    JSON.stringify(e.chapters || []),
    e.thumbnail || ''
  ]);
}

export const deleteEpisode = async (dbUrl: string, id: string): Promise<void> => {
  const conn = getDb(dbUrl);
  await conn.execute('DELETE FROM episodes WHERE id = ?', [id]);
}

export const getEpisodesByTheme = async (dbUrl: string, theme: string): Promise<Episode[]> => {
  const allEpisodes = await getEpisodes(dbUrl);
  return allEpisodes.filter(ep => ep.themes && ep.themes.includes(theme));
}

export const getEpisodesBySeason = async (dbUrl: string, season: number): Promise<Episode[]> => {
  const allEpisodes = await getEpisodes(dbUrl);
  return allEpisodes.filter(ep => ep.season === season);
}

export const getLatestEpisode = async (dbUrl: string): Promise<Episode | undefined> => {
  const allEpisodes = await getEpisodes(dbUrl);
  return allEpisodes.length > 0 ? allEpisodes[0] : undefined;
}

export const getAllThemes = async (dbUrl: string): Promise<string[]> => {
  const allEpisodes = await getEpisodes(dbUrl);
  return [...new Set(allEpisodes.flatMap(ep => ep.themes || []))];
}

export const getAllSeasons = async (dbUrl: string): Promise<number[]> => {
  const allEpisodes = await getEpisodes(dbUrl);
  return [...new Set(allEpisodes.map(ep => ep.season))].sort((a, b) => b - a);
}
