// ─────────────────────────────────────────────
// site-config.js — All user-visible content in one place
// Change ONLY what the user sees: texts, headings, image/audio src, dates, emojis
// Do NOT put: alt attrs, aria-labels, CSS class names, data attrs, structural markup
// ─────────────────────────────────────────────

export const siteConfig = {

  // ── Meta ──────────────────────────────────
  meta: {
    title: "Happy Birthday Cutie",           // browser tab title
    favicon: "images/icon.png",              // favicon image path
  },

  // ── Audio ─────────────────────────────────
  audio: {
    bgmSrc: "bgm.mp3",                       // background music file
    bgmVolume: 0.5,                          // volume level (0–1)
  },

  // ── Intro (candle screen) ─────────────────
  intro: {
    instruction: "Blow the candle",          // heading above candle
    candlePrompt: "✨ Make a Wish! ✨",      // prompt text
    blowButtonText: "🎂 Blow the Candle!",   // button label
    birthdayText: "Happy Birthday Tangerine!", // big heading after blow
  },

  // ── Gift ──────────────────────────────────
  gift: {
    title: "A Gift for My Cutie",            // section heading
    boxImageSrc:
      "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzFsaWNsNjR5c21wbWJuZnZzdGR5N2w4ZDBnazFlZWtiZGh2OTRpaCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/At48Y4dT3oDXx64KQj/giphy.gif",
    hint: "Tap to open ✨",                  // hint below gift box
    message:
      "Happy Birthday, Sweetie!💖 Today, the world celebrates you - but for me, every single day with you is a celebration.",
  },

  // ── Letter ────────────────────────────────
  letter: {
    title: "A Love Letter",                  // section heading
    sealText: "Click to Open",               // label on wax seal
    sealLetter: "T",                         // gold letter on wax seal
    greeting: "Dear Love,",                  // opening line
    // paragraphs: [
    //   "I do not know how today feels for you, but for me it is a small miracle. The day you arrived turned ordinary time into a story I still reread.",
    //   "I once imagined a neat little note with a list of reasons and favorite moments. Then I realized you do not fit in a list, and every attempt grew into a sky.",
    //   "So I built this page as a thank you. I shaped it slowly, detail by detail, because you deserve care that is patient and deliberate.",
    //   "Some days the energy faded, and I wondered if it would ever be enough. Still, I kept going, because making this is how I say I love you.",
    //   "If you read this, I hope it feels like a quiet hug. If you do not, the effort still means something to me, and I am glad I tried.",
    //   "There are many more stories I could tell and many more gifts I want to give. This is only a small chapter, but it is written with all the tenderness I have.",
    //   "Happy birthday, my favorite person. May the year ahead be gentle, brave, and bright. I love you today, tomorrow, and every ordinary day in between.",
    // ],
    signoff: "Forever yours,",               // sign-off line
    signoffName: "Your stargazer",           // sign-off name
  },

  // ── Countdown ─────────────────────────────
  countdown: {
    title: "And I'd choose you in every lifetime",  // section heading
    subtitle: "Time drifts so softly when love is the clock.", // sub text
    startDate: "2018-01-24T00:00:00",        // ISO date for time-since calc
    labels: {
      years: "Years",
      months: "Months",
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
    },
    footerText: "Many more years wait for us.",
  },

  // ── Story ─────────────────────────────────
  story: {
    title: "Our Story",                      // section heading
    subtitle:
      "I was not sure about adding photos, but this little timeline deserved a few stars. Think of it as a tiny gallery of moments.",
    footerText: "Written in the stars, sealed with love",
    items: [
      {
        side: "left",
        dateIcon: "💫",
        date: "January 24, 2018",
        title: "Where It All Began",
        description:
          "The first day felt small, but it opened a whole horizon. A glance, a laugh, and suddenly I knew the story had started.",
        imageSrc: "images/pic1.jpg",
        backGifSrc:
          "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnh5ZGVtdWZqYzdyZzgzcDRkbXFuMnl2bjJkc29hN3ZjdjF0b2s1MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/G6N0pDDgDpLjUvNoyQ/giphy.gif",
        backMessage:
          "Thank you for walking into my life. Those early days were simple and bright, full of long walks and stories that made the ride feel short.",
        nodeEmoji: "💫",
      },
      {
        side: "right",
        dateIcon: "✨",
        date: "Mid 2019",
        title: "Finally Together",
        description:
          "We found our way back to each other, and the city felt warmer. A simple meal tasted like a festival because you were there.",
        imageSrc: "images/pic1.jpg",
        backGifSrc: "images/pic1.jpg",
        backMessage:
          "I still remember the shy smiles and the way time slowed down. Even ordinary corners felt magical with you beside me.",
        nodeEmoji: "🌙",
      },
      {
        side: "left",
        dateIcon: "☀️",
        date: "2019 – 2021",
        title: "Golden Days",
        description:
          "Sneaking in small meetups, saving coins, and sharing one drink for an hour. It was never about the place, only about us.",
        imageSrc: "images/pic1.jpg",
        backGifSrc: "images/pic1.jpg",
        backMessage:
          "Those days taught me how rich simple moments can be. I keep them like pressed flowers in a book.",
        nodeEmoji: "☀️",
      },
      {
        side: "right",
        dateIcon: "🌌",
        date: "2021",
        title: "Distance Again",
        description:
          "Life pulled us to different cities, but the calls became our bridge. Some nights were hard, yet your voice steadied me.",
        imageSrc: "images/pic1.jpg",
        backGifSrc: "images/pic1.jpg",
        backMessage:
          "We learned patience, trust, and how to keep a flame alive across miles. That lesson still glows.",
        nodeEmoji: "🌊",
      },
      {
        side: "left",
        dateIcon: "🌹",
        date: "August 15, 2024",
        title: "One Beautiful Day",
        description:
          "A surprise meeting, a rushed schedule, and a heart that refused to hurry. Even a short visit felt like a whole season.",
        imageSrc: "images/pic1.jpg",
        backGifSrc: "images/pic1.jpg",
        backMessage:
          "The photo from that day sits in my mind like a keepsake. I laugh every time I remember how we tried to steal a little more time.",
        nodeEmoji: "🌹",
      },
      {
        side: "right",
        dateIcon: "✨",
        date: "Today",
        title: "Still Completely in Love",
        description:
          "So much has changed, yet my love keeps growing. If I could, I would bottle every moment we share.",
        imageSrc:
          "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDNza3Zicmd4dGxnOXZ3bG1vMTJtbzNueXFobWk3dnY0ZWh4Y3c1MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/dQMySCYUs2qO1CbxN3/giphy.gif",
        backGifSrc:
          "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3aXo1ZmxlY2ZyNXlnbTM2Y3dydXl5NDljenVhMXIwaXAxMWUzczcyYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/qPxBkcBiBr06eEnOup/giphy.gif",
        backMessage:
          "Each card was meant to be short, but memories kept spilling over. I could keep writing, yet I will save some words for future pages. And if life gets loud, remember this:",
        backGlitchVisibleText:
          "we will keep choosing each other, even on the hard days.",
        glitchText:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam incidunt eius dolore ad neque, officiis sint fugit laudantium mollitia dicta architecto soluta similique voluptatem aliquam repudiandae alias ullam minus numquam.",
        nodeEmoji: "💖",
      },
    ],
  },

  // ── Gallery ───────────────────────────────
  gallery: {
    title: "Star Gallery",                   // section heading
    subtitle:
      "I wanted to fill this with our photos, but even the few we have feel priceless.",
    items: [
      {
        src: "images/pic1.jpg",
        title: "Little Days",
        text: "A small snapshot that feels huge to me. It holds a quiet kind of joy I never want to forget.",
        r: -8,
        x: -15,
        y: -10,
      },
      {
        src: "images/pic1.jpg",
        title: "Favorite Frame",
        text: "I kept coming back to this one. Your glow makes the whole moment feel softer and brighter.",
        r: 6,
        x: 10,
        y: 15,
      },
      {
        src: "images/pic1.jpg",
        title: "Brightest Smile",
        text: "Your smile turns any room into home. I could look at it forever and still want another second.",
        r: -4,
        x: 5,
        y: 30,
      },
      {
        src: "images/pic1.jpg",
        title: "Teacher Vibes",
        text: "You look so confident here, like you could teach the stars how to shine.",
        r: 7,
        x: -10,
        y: 10,
      },
      {
        src: "images/pic1.jpg",
        title: "Cosmic Mood",
        text: "This one feels like a mood board for us: calm, dreamy, and a little magical.",
        r: -12,
        x: 20,
        y: -5,
      },
      {
        src: "images/pic1.jpg",
        title: "For You",
        text: "Every detail here was shaped with you in mind, a tiny gift wrapped in pixels.",
        r: 5,
        x: 0,
        y: -20,
      },
    ],
  },

  // ── Wish ──────────────────────────────────
  wish: {
    title: "Whisper to the Universe",        // section heading
    subtitle:
      "Make a wish and send it to the stars. I will be cheering for every dream you whisper.",
    placeholder: "Type your wish here...",    // textarea placeholder
    buttonText: "Send to the Stars ✨",       // button label
    googleFormUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfSCMkix8jCXjBOCu3lL_Gu1RrVDxQ0qUz0tJjsfhiNdC2Ezw/formResponse",
    googleFormField: "entry.149920223",
  },

  // ── Finale ────────────────────────────────
  finale: {
    line1: "This universe is wide and endless...",
    line2: "but its favorite corner, for me,",
    line3: "is you",
    title: "Happy Birthday, Tangerine",
    footerText: "Made with all my heart, just for you",
  },

  // ── Constellation (star text after blow) ──
  constellation: {
    line1: "The Galaxy Shines for You Today",
    line2: '" My Universe, My Tangerine "',   // includes decorative quotes
  },

  // ── Fallbacks ─────────────────────────────
  fallbacks: {
    image: "images/pic1.jpg",                 // fallback for broken images
  },
};