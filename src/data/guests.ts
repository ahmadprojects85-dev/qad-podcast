// QAD Podcast - Guests Data

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

import { getEpisodes } from './episodes';

export const baseGuests: Guest[] = [
  {
    id: 'guest-001',
    name: {
      ckb: 'د.رؤف عثمان',
      ar: 'د.رؤف عثمان',
      en: 'Dr. Rauf Othman'
    },
    title: {
      ckb: 'میوانی ئەلقەی یەکەم',
      ar: 'ضيف الحلقة الأولى',
      en: 'Guest of Episode 1'
    },
    bio: {
      ckb: 'د.رؤف عثمان میوانی ئەلقەی یەکەمی پۆدکاستی QAD بوو.',
      ar: 'د.رؤف عثمان كان ضيف الحلقة الأولى من بودكاست QAD.',
      en: 'Dr. Rauf Othman was the guest of the first episode of QAD Podcast.'
    },
    highlights: {
      ckb: ['میوانی ئەلقەی یەکەم', 'گفتوگۆیەکی قووڵ دەربارەی مێژوو'],
      ar: ['ضيف الحلقة الأولى', 'حوار عميق حول التاريخ'],
      en: ['Guest of Episode 1', 'Deep conversation about history']
    },
    quotes: {
      ckb: ['مێژوو ڕێنمایی ئێمەیە بۆ داهاتوو.'],
      ar: ['التاريخ هو دليلنا للمستقبل.'],
      en: ['History is our guide to the future.']
    },
    episodeIds: []
  },
  {
    id: 'guest-002',
    name: {
      ckb: 'د.هەڤاڵ ئەبوبەکر',
      ar: 'د.هەڤاڵ ئەبوبەکر',
      en: 'Dr. Haval Abubakar'
    },
    title: {
      ckb: 'میوانی ئەلقەی دووەم',
      ar: 'ضيف الحلقة الثانية',
      en: 'Guest of Episode 2'
    },
    bio: {
      ckb: 'د.هەڤاڵ ئەبوبەکر میوانی ئەلقەی دووەمی پۆدکاستی QAD بوو.',
      ar: 'د.هەڤاڵ ئەبوبەکر كان ضيف الحلقة الثانية من بودكاست QAD.',
      en: 'Dr. Haval Abubakar was the guest of the second episode of QAD Podcast.'
    },
    highlights: {
      ckb: ['میوانی ئەلقەی دووەم', 'گفتوگۆیەکی سەرنجڕاکێش'],
      ar: ['ضيف الحلقة الثانية', 'حوار مثير للاهتمام'],
      en: ['Guest of Episode 2', 'Interesting conversation']
    },
    quotes: {
      ckb: ['زانیاری هێزە.'],
      ar: ['المعرفة قوة.'],
      en: ['Knowledge is power.']
    },
    episodeIds: []
  }
];

export const getGuests = (): Guest[] => {
  const eps = getEpisodes();
  const dynamicMap = new Map<string, Guest>();

  // Initialize with base guests but clear out their episodeIds
  baseGuests.forEach(g => {
    dynamicMap.set(g.id, { ...g, episodeIds: [] });
  });

  // Synthesize from episodes
  eps.forEach(ep => {
    const gid = ep.guestId || `guest-${ep.id}`;
    if (dynamicMap.has(gid)) {
      dynamicMap.get(gid)!.episodeIds.push(ep.id);
    } else {
      dynamicMap.set(gid, {
        id: gid,
        name: ep.guestName,
        title: { ckb: 'میوان', ar: 'ضيف', en: 'Guest' },
        bio: { ckb: '', ar: '', en: '' },
        highlights: { ckb: [], ar: [], en: [] },
        quotes: { ckb: [], ar: [], en: [] },
        episodeIds: [ep.id]
      });
    }
  });

  return Array.from(dynamicMap.values()).filter(g => g.episodeIds.length > 0);
};

export const guests: Guest[] = []; // Deprecated, keep for backward compat but empty.

export const getGuestById = (id: string): Guest | undefined =>
  getGuests().find(g => g.id === id);

export const getGuestsByEpisode = (episodeId: string): Guest[] =>
  getGuests().filter(g => g.episodeIds.includes(episodeId));
