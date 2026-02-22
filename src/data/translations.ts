// QAD Podcast - Multilingual Data
// Supports: Sorani Kurdish (ckb), Arabic (ar), English (en)

export type Language = 'ckb' | 'ar' | 'en';

export const translations = {
  ckb: {
    // Navigation
    nav: {
      home: 'سەرەکی',
      episodes: 'ئەلقەکان',
      guests: 'میوانەکان',
      about: 'دەربارە',
      contact: 'پەیوەندی',
      language: 'زمان'
    },
    // Hero Section
    hero: {
      title: 'QAD پۆدکاست',
      tagline: 'مێژوو لە یەک لاپەڕەدا',
      mission: 'گفتوگۆی قووڵ لەگەڵ کەسایەتییە گرنگەکانی مێژوو و ئەمڕۆ، بۆ پاراستن و گەیاندنی زانیاری بە نەوەکانی داهاتوو.',
      watchYoutube: 'سەیرکردن لە یوتیوب',
      latestEpisode: 'دوایین ئەلقە',
      subscribe: 'بەشداربوون'
    },
    // Episodes
    episodes: {
      title: 'ئەرشیفی ئەلقەکان',
      subtitle: 'هەموو قسەکردنەکان، وەک لاپەڕەکانی مێژوو پاراستراون',
      filter: {
        all: 'هەموو',
        season: 'وەرز',
        guest: 'میوان',
        theme: 'بابەت'
      },
      watch: 'سەیرکردن',
      listen: 'گوێگرتن',
      episode: 'ئەلقەی',
      duration: 'ماوە',
      date: 'بەروار',
      chapters: 'بەشەکان',
      share: 'هاوبەشکردن',
      next: 'داهاتوو',
      previous: 'پێشوو'
    },
    // Guests
    guests: {
      title: 'میوانەکانمان',
      subtitle: 'کەسایەتییە بەناوبانگەکانی مێژوو، کولتوور، و زانست',
      episodes: 'ئەلقەکان',
      bio: 'ژیاننامە',
      highlights: 'دەربارە',
      quotes: 'وتەکان'
    },
    // About
    about: {
      title: 'دەربارەی ئێمە | دامەزراوەی قەد (QAD Foundation)',
      vision: 'دیدگای ئێمە: پردێک لەنێوان یادەوەری و داهاتوودا',
      visionDesc: 'دامەزراوەی قەد (QAD Foundation) لە ساڵی 2024دا وەک دەسپێشخەرییەکی کولتووری و مێژوویی پێشەنگ دامەزراوە. ئێمە لە دڵی کوردستانەوە کار دەکەین بۆ ئەوەی ببینە پاسەوانێکی دەستپاک بۆ پاراستنی میراتی دەوڵەمەندی ناوچەکە. بڕوای تەواومان وایە مێژوو تەنها ڕووداوێکی ڕابردوو نییە، بەڵکو ئەو ناسنامەیەیە کە ئێستامان پێکدەهێنێت و نەخشەی داهاتوومان دەکێشێت.',
      mission: 'پەیامی ئێمە',
      missionPoints: [
        { title: 'پاراستن و بەدۆکۆمێنتکردن', desc: 'ئەرشیفکردنی چیرۆکە مرۆییەکان و کەرەستە مێژووییە دەگمەنەکان بۆ ڕێگری لە فەوتانیان.' },
        { title: 'بڵاوکردنەوەی مەعریفە', desc: 'گەیاندنی بیرەوەری گشتی بە نەوەکانی داهاتوو و توێژەران بە شێوازێکی سەردەمیانە و باوەڕپێکراو.' },
        { title: 'بەرزکردنەوەی هۆشیاری', desc: 'بەستنەوەی نەوەی نوێ بە ڕەگ و ڕیشە کولتوورییەکانی و بەهێزکردنی هەستی ئینتیما و ناسنامە.' }
      ],
      projects: 'دیارترین پڕۆژەمان: پۆدکاستی قەد',
      projectsDesc: 'پۆدکاستی قەد قۆڵی میدیایی و سەکۆیەکی دیالۆگی سەرەکی دامەزراوەکەیە. لە ڕێگەی ئەم سەکۆیەوە پەنجەرەیەک بەرەو ڕابردوو و ئێستا دەکەینەوە لە ڕێگەی:',
      projectsPoints: [
        'میوانداریکردنی کەسایەتییە کاریگەرەکان و شایەتحاڵەکان بۆ گێڕانەوەی ئەزموونە زیندووەکانیان.',
        'تۆمارکردنی وێستگە مێژووییە یەکلاکەرەوەکان بە شێوازێکی گێڕانەوەی سەرنجڕاکێش.',
        'شیکردنەوەی واقیعی هاوچەرخ و بەستنەوەی بە ڕەهەندە کولتوورییەکانی ناوچەکە.'
      ],
      whyQad: 'بۆچی دامەزراوەی قەد؟',
      whyQadDesc: 'لە کاتی دەستپێکردنمانەوە لە ساڵی 2024، پابەندبووین بە توێژینەوە و وردبینی بۆ پێشکەشکردنی ناوەڕۆکێک کە کۆکەرەوەی بەهای زانستی و بڵاوبوونەوەی میدیایی بێت. ئێمە هەوڵدەدەین ببینە سەرچاوەی یەکەم بۆ هەر کەسێک کە بەدوای ڕەسەنایەتی، بەردەوامی کولتووری، و ئەو چیرۆکانەدا دەگەڕێت کە هێشتا نەگێڕدراونەتەوە.',
      foundation: 'بنکەی QAD',
      foundationDesc: 'QAD پۆدکاست بەشێکە لە بنکەی QAD کە خەباتکارە بۆ پەرەپێدانی فەرهەنگ و زانست لە کوردستان و جیهان.'
    },
    // Contact
    contact: {
      title: 'پەیوەندیمان پێوە بکە',
      subtitle: 'ئێمە ئامادەین بۆ گوێگرتن لە بیرۆکەکانت',
      name: 'ناو',
      email: 'ئیمەیڵ',
      subject: 'بابەت',
      message: 'پەیام',
      send: 'ناردن',
      suggestGuest: 'پێشنیاری میوان',
      suggestTopic: 'پێشنیاری بابەت',
      success: 'سوپاس! پەیامەکەت نێردرا.'
    },
    // Footer
    footer: {
      rights: 'هەموو مافەکان پارێزراون',
      foundation: 'بنکەی QAD',
      followUs: 'شوێنمان بکەوە',
      newsletter: 'بەشداربوون لە نامەلیست'
    },
    // Common
    common: {
      loading: 'چاوەڕوان بە...',
      error: 'هەڵە ڕوویدا',
      readMore: 'زیاتر بخوێنەرەوە',
      viewAll: 'هەموو ببینە'
    }
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      episodes: 'الحلقات',
      guests: 'الضيوف',
      about: 'حولنا',
      contact: 'اتصل بنا',
      language: 'اللغة'
    },
    hero: {
      title: 'بودكاست QAD',
      tagline: 'التاريخ في صفحة واحدة',
      mission: 'حوارات عميقة مع شخصيات تاريخية ومعاصرة مؤثرة، للحفاظ على المعرفة ونقلها للأجيال القادمة.',
      watchYoutube: 'شاهد على يوتيوب',
      latestEpisode: 'أحدث حلقة',
      subscribe: 'اشترك'
    },
    episodes: {
      title: 'أرشيف الحلقات',
      subtitle: 'كل المحادثات، محفوظة كصفحات من التاريخ',
      filter: {
        all: 'الكل',
        season: 'الموسم',
        guest: 'الضيف',
        theme: 'الموضوع'
      },
      watch: 'شاهد',
      listen: 'استمع',
      episode: 'الحلقة',
      duration: 'المدة',
      date: 'التاريخ',
      chapters: 'الفصول',
      share: 'مشاركة',
      next: 'التالي',
      previous: 'السابق'
    },
    guests: {
      title: 'ضيوفنا',
      subtitle: 'شخصيات بارزة في التاريخ والثقافة والعلوم',
      episodes: 'الحلقات',
      bio: 'السيرة الذاتية',
      highlights: 'أبرز النقاط',
      quotes: 'اقتباسات'
    },
    about: {
      title: 'معلومات عنا | مؤسسة قەد',
      vision: 'رؤيتنا: جسر بين الذاكرة والمستقبل',
      visionDesc: 'تأسست مؤسسة قەد (QAD Foundation) في عام 2024 كمبادرة ثقافية وتاريخية رائدة. نعمل من قلب كردستان لنكون حراساً أمناء لحماية التراث الغني للمنطقة. نؤمن إيماناً راسخاً بأن التاريخ ليس مجرد أحداث ماضية، بل هو الهوية التي تشكل حاضرنا وترسم خريطة مستقبلنا.',
      mission: 'رسالتنا',
      missionPoints: [
        { title: 'الحفظ والتوثيق', desc: 'أرشفة القصص الإنسانية والمواد التاريخية النادرة لمنع ضياعها.' },
        { title: 'نشر المعرفة', desc: 'إيصال الذاكرة العامة للأجيال القادمة والباحثين بأسلوب عصري وموثوق.' },
        { title: 'زيادة الوعي', desc: 'ربط الجيل الجديد بجذوره الثقافية وتقوية الشعور بالانتماء والهوية.' }
      ],
      projects: 'أبرز مشاريعنا: بودكاست قەد',
      projectsDesc: 'بودكاست قەد هو الذراع الإعلامي ومنصة الحوار الرئيسية للمؤسسة. من خلال هذه المنصة، نفتح نافذة إلى الماضي والحاضر من خلال:',
      projectsPoints: [
        'استضافة الشخصيات المؤثرة والشهود لرواية تجاربهم الحية.',
        'توثيق المحطات التاريخية الحاسمة بأسلوب سردي جذاب.',
        'تحليل الواقع المعاصر وربطه بالأبعاد الثقافية للمنطقة.'
      ],
      whyQad: 'لماذا مؤسسة قەد؟',
      whyQadDesc: 'منذ بدايتنا في عام 2024، التزمنا بالبحث والدقة لتقديم محتوى يجمع القيمة العلمية مع الانتشار الإعلامي. نسعى لأن نكون المصدر الأول لأي شخص يبحث عن الأصالة، والاستمرارية الثقافية، وتلك القصص التي لم تُروَ بعد.',
      foundation: 'مؤسسة QAD',
      foundationDesc: 'بودكاست QAD هو جزء من مؤسسة QAD التي تعمل على تطوير الثقافة والعلوم في كردستان والعالم.'
    },
    contact: {
      title: 'تواصل معنا',
      subtitle: 'نحن مستعدون للاستماع لأفكارك',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      subject: 'الموضوع',
      message: 'الرسالة',
      send: 'إرسال',
      suggestGuest: 'اقتراح ضيف',
      suggestTopic: 'اقتراح موضوع',
      success: 'شكراً! تم إرسال رسالتك.'
    },
    footer: {
      rights: 'جميع الحقوق محفوظة',
      foundation: 'مؤسسة QAD',
      followUs: 'تابعنا',
      newsletter: 'اشترك في النشرة'
    },
    common: {
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      readMore: 'اقرأ المزيد',
      viewAll: 'عرض الكل'
    }
  },
  en: {
    nav: {
      home: 'Home',
      episodes: 'Episodes',
      guests: 'Guests',
      about: 'About',
      contact: 'Contact',
      language: 'Language'
    },
    hero: {
      title: 'QAD Podcast',
      tagline: 'History In One Page',
      mission: 'Deep conversations with influential historical and contemporary figures, preserving and transmitting knowledge to future generations.',
      watchYoutube: 'Watch on YouTube',
      latestEpisode: 'Latest Episode',
      subscribe: 'Subscribe'
    },
    episodes: {
      title: 'Episodes Archive',
      subtitle: 'Every conversation, preserved like pages of history',
      filter: {
        all: 'All',
        season: 'Season',
        guest: 'Guest',
        theme: 'Theme'
      },
      watch: 'Watch',
      listen: 'Listen',
      episode: 'Episode',
      duration: 'Duration',
      date: 'Date',
      chapters: 'Chapters',
      share: 'Share',
      next: 'Next',
      previous: 'Previous'
    },
    guests: {
      title: 'Our Guests',
      subtitle: 'Distinguished figures in history, culture, and science',
      episodes: 'Episodes',
      bio: 'Biography',
      highlights: 'Highlights',
      quotes: 'Quotes'
    },
    about: {
      title: 'About Us | QAD Foundation',
      vision: 'Our Vision: A Bridge Between Memory and the Future',
      visionDesc: 'QAD Foundation was established in 2024 as a pioneering cultural and historical initiative. Working from the heart of Kurdistan, we strive to be honest guardians preserving the region\'s rich heritage. We firmly believe that history is not just past events, but the identity that forms our present and maps our future.',
      mission: 'Our Mission',
      missionPoints: [
        { title: 'Preservation and Documentation', desc: 'Archiving human stories and rare historical materials to prevent their loss.' },
        { title: 'Spreading Knowledge', desc: 'Delivering common memory to future generations and researchers in a modern and reliable manner.' },
        { title: 'Raising Awareness', desc: 'Connecting the new generation to their cultural roots and strengthening their sense of belonging and identity.' }
      ],
      projects: 'Our Most Prominent Project: QAD Podcast',
      projectsDesc: 'QAD Podcast is the media arm and main dialogue platform of the foundation. Through this platform, we open a window to the past and present by:',
      projectsPoints: [
        'Hosting influential figures and witnesses to narrate their living experiences.',
        'Documenting crucial historical milestones in an engaging narrative style.',
        'Analyzing contemporary reality and connecting it to the cultural dimensions of the region.'
      ],
      whyQad: 'Why QAD Foundation?',
      whyQadDesc: 'Since our inception in 2024, we have been committed to research and precision to provide content that combines scientific value and media reach. We aim to be the premier source for anyone seeking authenticity, cultural continuity, and those untold stories.',
      foundation: 'QAD Foundation',
      foundationDesc: 'QAD Podcast is part of the QAD Foundation which works on developing culture and science in Kurdistan and the world.'
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'We are ready to hear your ideas',
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message',
      send: 'Send',
      suggestGuest: 'Suggest a Guest',
      suggestTopic: 'Suggest a Topic',
      success: 'Thank you! Your message has been sent.'
    },
    footer: {
      rights: 'All Rights Reserved',
      foundation: 'QAD Foundation',
      followUs: 'Follow Us',
      newsletter: 'Subscribe to Newsletter'
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      readMore: 'Read More',
      viewAll: 'View All'
    }
  }
};

export const isRTL = (lang: Language): boolean => lang === 'ckb' || lang === 'ar';

export const getDirection = (lang: Language): 'rtl' | 'ltr' => isRTL(lang) ? 'rtl' : 'ltr';

export const getLangName = (lang: Language): string => {
  const names: Record<Language, string> = {
    ckb: 'کوردی',
    ar: 'العربية',
    en: 'English'
  };
  return names[lang];
};
