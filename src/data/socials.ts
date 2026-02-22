// QAD Podcast - Social Links Data

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  label: {
    ckb: string;
    ar: string;
    en: string;
  };
}

export const socialLinks: SocialLink[] = [
  {
    platform: 'youtube',
    url: 'https://youtube.com/@qadpodcast',
    icon: 'fab fa-youtube',
    label: { ckb: 'یوتیوب', ar: 'يوتيوب', en: 'YouTube' }
  },
  {
    platform: 'facebook',
    url: 'https://facebook.com/qadpodcast',
    icon: 'fab fa-facebook-f',
    label: { ckb: 'فەیسبووک', ar: 'فيسبوك', en: 'Facebook' }
  },
  {
    platform: 'instagram',
    url: 'https://instagram.com/qadpodcast',
    icon: 'fab fa-instagram',
    label: { ckb: 'ئینستاگرام', ar: 'انستجرام', en: 'Instagram' }
  },
  {
    platform: 'twitter',
    url: 'https://twitter.com/qadpodcast',
    icon: 'fab fa-x-twitter',
    label: { ckb: 'ئێکس', ar: 'إكس', en: 'X' }
  },
  {
    platform: 'spotify',
    url: 'https://open.spotify.com/show/qadpodcast',
    icon: 'fab fa-spotify',
    label: { ckb: 'سپۆتیفای', ar: 'سبوتيفاي', en: 'Spotify' }
  },
  {
    platform: 'apple',
    url: 'https://podcasts.apple.com/podcast/qadpodcast',
    icon: 'fab fa-apple',
    label: { ckb: 'ئەپڵ پۆدکاست', ar: 'آبل بودكاست', en: 'Apple Podcasts' }
  },
  {
    platform: 'telegram',
    url: 'https://t.me/qadpodcast',
    icon: 'fab fa-telegram-plane',
    label: { ckb: 'تێلێگرام', ar: 'تلجرام', en: 'Telegram' }
  }
];

export const getSocialByPlatform = (platform: string): SocialLink | undefined =>
  socialLinks.find(s => s.platform === platform);
