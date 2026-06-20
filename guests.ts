// QAD Podcast - Guests Data
import { getDb } from '../db/index'

export interface Guest {
  id: string;
  name: {
    ckb: string;
    ar: string;
    en: string;
  };
  title: {
    ckb: string;
    ar: string;
    en: string;
  };
  bio: {
    ckb: string;
    ar: string;
    en: string;
  };
  highlights: {
    ckb: string[];
    ar: string[];
    en: string[];
  };
  quotes: {
    ckb: string[];
    ar: string[];
    en: string[];
  };
  episodeIds: string[];
  image?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export const getGuests = async (dbUrl: string): Promise<Guest[]> => {
  const conn = getDb(dbUrl);
  const rows = await conn.execute('SELECT * FROM guests');
  return rows.map((row: any) => ({
    id: row.id,
    name: {
      ckb: row.name_ckb || '',
      ar: row.name_ar || '',
      en: row.name_en || ''
    },
    title: {
      ckb: row.title_ckb || '',
      ar: row.title_ar || '',
      en: row.title_en || ''
    },
    bio: {
      ckb: row.bio_ckb || '',
      ar: row.bio_ar || '',
      en: row.bio_en || ''
    },
    highlights: typeof row.highlights === 'string' ? JSON.parse(row.highlights) : row.highlights || { ckb: [], ar: [], en: [] },
    quotes: typeof row.quotes === 'string' ? JSON.parse(row.quotes) : row.quotes || { ckb: [], ar: [], en: [] },
    episodeIds: typeof row.episode_ids === 'string' ? JSON.parse(row.episode_ids) : row.episode_ids || [],
    image: row.image,
    socialLinks: typeof row.social_links === 'string' ? JSON.parse(row.social_links) : row.social_links || {}
  }));
}

export const getGuestById = async (dbUrl: string, id: string): Promise<Guest | undefined> => {
  const conn = getDb(dbUrl);
  const rows = await conn.execute('SELECT * FROM guests WHERE id = ?', [id]);
  if (!rows || rows.length === 0) return undefined;
  const row = rows[0] as any;
  return {
    id: row.id,
    name: {
      ckb: row.name_ckb || '',
      ar: row.name_ar || '',
      en: row.name_en || ''
    },
    title: {
      ckb: row.title_ckb || '',
      ar: row.title_ar || '',
      en: row.title_en || ''
    },
    bio: {
      ckb: row.bio_ckb || '',
      ar: row.bio_ar || '',
      en: row.bio_en || ''
    },
    highlights: typeof row.highlights === 'string' ? JSON.parse(row.highlights) : row.highlights || { ckb: [], ar: [], en: [] },
    quotes: typeof row.quotes === 'string' ? JSON.parse(row.quotes) : row.quotes || { ckb: [], ar: [], en: [] },
    episodeIds: typeof row.episode_ids === 'string' ? JSON.parse(row.episode_ids) : row.episode_ids || [],
    image: row.image,
    socialLinks: typeof row.social_links === 'string' ? JSON.parse(row.social_links) : row.social_links || {}
  };
}

export const saveGuest = async (dbUrl: string, g: Guest): Promise<void> => {
  const conn = getDb(dbUrl);
  await conn.execute(`
    INSERT INTO guests (
      id, name_ckb, name_ar, name_en, title_ckb, title_ar, title_en,
      bio_ckb, bio_ar, bio_en, highlights, quotes, episode_ids, image, social_links
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name_ckb=VALUES(name_ckb), name_ar=VALUES(name_ar), name_en=VALUES(name_en),
      title_ckb=VALUES(title_ckb), title_ar=VALUES(title_ar), title_en=VALUES(title_en),
      bio_ckb=VALUES(bio_ckb), bio_ar=VALUES(bio_ar), bio_en=VALUES(bio_en),
      highlights=VALUES(highlights), quotes=VALUES(quotes), episode_ids=VALUES(episode_ids),
      image=VALUES(image), social_links=VALUES(social_links)
  `, [
    g.id,
    g.name?.ckb || '', g.name?.ar || '', g.name?.en || '',
    g.title?.ckb || '', g.title?.ar || '', g.title?.en || '',
    g.bio?.ckb || '', g.bio?.ar || '', g.bio?.en || '',
    JSON.stringify(g.highlights || { ckb: [], ar: [], en: [] }),
    JSON.stringify(g.quotes || { ckb: [], ar: [], en: [] }),
    JSON.stringify(g.episodeIds || []),
    g.image || '',
    JSON.stringify(g.socialLinks || {})
  ]);
}

export const deleteGuest = async (dbUrl: string, id: string): Promise<void> => {
  const conn = getDb(dbUrl);
  await conn.execute('DELETE FROM guests WHERE id = ?', [id]);
}

export const getGuestsByEpisode = async (dbUrl: string, episodeId: string): Promise<Guest[]> => {
  const allGuests = await getGuests(dbUrl);
  return allGuests.filter(g => g.episodeIds && g.episodeIds.includes(episodeId));
}
