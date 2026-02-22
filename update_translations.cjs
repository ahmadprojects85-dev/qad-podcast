const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

const tAboutCkb = `    about: {
      title: 'دەربارەی ئێمە | دامەزراوەی قاد (QAD Foundation)',
      vision: 'دیدگای ئێمە: پردێک لەنێوان یادەوەری و داهاتوودا',
      visionDesc: 'دامەزراوەی قاد (QAD Foundation) لە ساڵی 2024دا وەک دەسپێشخەرییەکی کولتووری و مێژوویی پێشەنگ دامەزراوە. ئێمە لە دڵی کوردستانەوە کار دەکەین بۆ ئەوەی ببینە پاسەوانێکی دەستپاک بۆ پاراستنی میراتی دەوڵەمەندی ناوچەکە. بڕوای تەواومان وایە مێژوو تەنها ڕووداوێکی ڕابردوو نییە، بەڵکو ئەو ناسنامەیەیە کە ئێستامان پێکدەهێنێت و نەخشەی داهاتوومان دەکێشێت.',
      mission: 'پەیامی ئێمە',
      missionPoints: [
        { title: 'پاراستن و بەدۆکۆمێنتکردن', desc: 'ئەرشیفکردنی چیرۆکە مرۆییەکان و کەرەستە مێژووییە دەگمەنەکان بۆ ڕێگری لە فەوتانیان.' },
        { title: 'بڵاوکردنەوەی مەعریفە', desc: 'گەیاندنی بیرەوەری گشتی بە نەوەکانی داهاتوو و توێژەران بە شێوازێکی سەردەمیانە و باوەڕپێکراو.' },
        { title: 'بەرزکردنەوەی هۆشیاری', desc: 'بەستنەوەی نەوەی نوێ بە ڕەگ و ڕیشە کولتوورییەکانی و بەهێزکردنی هەستی ئینتیما و ناسنامە.' }
      ],
      projects: 'دیارترین پڕۆژەمان: پۆدکاستی قاد',
      projectsDesc: 'پۆدکاستی قاد قۆڵی میدیایی و سەکۆیەکی دیالۆگی سەرەکی دامەزراوەکەیە. لە ڕێگەی ئەم سەکۆیەوە پەنجەرەیەک بەرەو ڕابردوو و ئێستا دەکەینەوە لە ڕێگەی:',
      projectsPoints: [
        'میوانداریکردنی کەسایەتییە کاریگەرەکان و شایەتحاڵەکان بۆ گێڕانەوەی ئەزموونە زیندووەکانیان.',
        'تۆمارکردنی وێستگە مێژووییە یەکلاکەرەوەکان بە شێوازێکی گێڕانەوەی سەرنجڕاکێش.',
        'شیکردنەوەی واقیعی هاوچەرخ و بەستنەوەی بە ڕەهەندە کولتوورییەکانی ناوچەکە.'
      ],
      whyQad: 'بۆچی دامەزراوەی قاد؟',
      whyQadDesc: 'لە کاتی دەستپێکردنمانەوە لە ساڵی 2024، پابەندبووین بە توێژینەوە و وردبینی بۆ پێشکەشکردنی ناوەڕۆکێک کە کۆکەرەوەی بەهای زانستی و بڵاوبوونەوەی میدیایی بێت. ئێمە هەوڵدەدەین ببینە سەرچاوەی یەکەم بۆ هەر کەسێک کە بەدوای ڕەسەنایەتی، بەردەوامی کولتووری، و ئەو چیرۆکانەدا دەگەڕێت کە هێشتا نەگێڕدراونەتەوە.',
      foundation: 'بنکەی QAD',
      foundationDesc: 'QAD پۆدکاست بەشێکە لە بنکەی QAD کە خەباتکارە بۆ پەرەپێدانی فەرهەنگ و زانست لە کوردستان و جیهان.'
    },`;

const tAboutAr = `    about: {
      title: 'معلومات عنا | مؤسسة قاد',
      vision: 'رؤيتنا: جسر بين الذاكرة والمستقبل',
      visionDesc: 'تأسست مؤسسة قاد (QAD Foundation) في عام 2024 كمبادرة ثقافية وتاريخية رائدة. نعمل من قلب كردستان لنكون حراساً أمناء لحماية التراث الغني للمنطقة. نؤمن إيماناً راسخاً بأن التاريخ ليس مجرد أحداث ماضية، بل هو الهوية التي تشكل حاضرنا وترسم خريطة مستقبلنا.',
      mission: 'رسالتنا',
      missionPoints: [
        { title: 'الحفظ والتوثيق', desc: 'أرشفة القصص الإنسانية والمواد التاريخية النادرة لمنع ضياعها.' },
        { title: 'نشر المعرفة', desc: 'إيصال الذاكرة العامة للأجيال القادمة والباحثين بأسلوب عصري وموثوق.' },
        { title: 'زيادة الوعي', desc: 'ربط الجيل الجديد بجذوره الثقافية وتقوية الشعور بالانتماء والهوية.' }
      ],
      projects: 'أبرز مشاريعنا: بودكاست قاد',
      projectsDesc: 'بودكاست قاد هو الذراع الإعلامي ومنصة الحوار الرئيسية للمؤسسة. من خلال هذه المنصة، نفتح نافذة إلى الماضي والحاضر من خلال:',
      projectsPoints: [
        'استضافة الشخصيات المؤثرة والشهود لرواية تجاربهم الحية.',
        'توثيق المحطات التاريخية الحاسمة بأسلوب سردي جذاب.',
        'تحليل الواقع المعاصر وربطه بالأبعاد الثقافية للمنطقة.'
      ],
      whyQad: 'لماذا مؤسسة قاد؟',
      whyQadDesc: 'منذ بدايتنا في عام 2024، التزمنا بالبحث والدقة لتقديم محتوى يجمع القيمة العلمية مع الانتشار الإعلامي. نسعى لأن نكون المصدر الأول لأي شخص يبحث عن الأصالة، والاستمرارية الثقافية، وتلك القصص التي لم تُروَ بعد.',
      foundation: 'مؤسسة QAD',
      foundationDesc: 'بودكاست QAD هو جزء من مؤسسة QAD التي تعمل على تطوير الثقافة والعلوم في كردستان والعالم.'
    },`;

const tAboutEn = `    about: {
      title: 'About Us | QAD Foundation',
      vision: 'Our Vision: A Bridge Between Memory and the Future',
      visionDesc: 'QAD Foundation was established in 2024 as a pioneering cultural and historical initiative. Working from the heart of Kurdistan, we strive to be honest guardians preserving the region\\'s rich heritage. We firmly believe that history is not just past events, but the identity that forms our present and maps our future.',
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
    },`;

content = content.replace(/about: \{[\s\S]*?valuesList: \[.*?\]\s*\},/g, "##REPLACE_ME##");

let index = 0;
content = content.replace(/##REPLACE_ME##/g, () => {
    index++;
    if (index === 1) return tAboutCkb;
    if (index === 2) return tAboutAr;
    if (index === 3) return tAboutEn;
    return "##REPLACE_ME##";
});

fs.writeFileSync(filePath, content);
console.log('Done replacing translations');
