/**
 * English UI strings — the source of truth for the dictionary shape.
 *
 * Every other locale file is typed `satisfies UiStrings`, so a missing or
 * misspelled key is a build error rather than a blank spot on the page.
 *
 * Strings under `legal`, `contact.disclaimer` and `about` are rendered with
 * `set:html`, so they may carry inline markup and these placeholders:
 *   {site} {email} {mailto} {contact} {privacy} {terms} {channels}
 */

export const en = {
  meta: {
    tagline: "Warm life lessons from a family of Yetis.",
    motto:
      "We might be Yetis, but our ways are warm. ❄️❤️ Big hearts. Thick fur. Good vibes.",
    description:
      "The Yeti Ways is a family blog co-authored by Papa, Mama, and Babu Yeti — warm, honest stories about family, relationships, parenting, and growing up, each one built around a video from our channels.",
  },

  nav: {
    home: "Home",
    stories: "Stories",
    family: "The Family",
    about: "About",
    contact: "Contact",
    search: "Search",
  },

  common: {
    readStories: "Read the stories",
    meetTheFamily: "Meet the family",
    allStories: "All stories",
    backHome: "Back home",
    skipToContent: "Skip to content",
    primaryNav: "Primary",
    mobileNav: "Mobile",
    categoriesNav: "Story categories",
    paginationNav: "Stories pagination",
    toggleTheme: "Toggle dark mode",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    searchStories: "Search stories",
    searchHint: "Search stories (press /)",
    language: "Language",
    chooseLanguage: "Choose a language",
    featured: "Featured",
    featuredStory: "Featured story",
    all: "All",
    newer: "Newer",
    older: "Older",
    page: "Page",
    noStoriesYet: "No stories here yet — check back soon. ❄️",
    story: "story",
    /* The 2-4 form, for languages that have one. Where a language has no
       separate few form, this is simply the plural again. */
    storiesFew: "stories",
    stories: "stories",
  },

  home: {
    latestStories: "Latest stories",
    meetTheFamilyIntro:
      "Every story here has more than one teller — the grown-ups and the kid who lived the same day from a different height. Same fireplace, different footprints in the snow.",
    findYourTrail: "Find your trail",
    findYourTrailIntro: "Browse by what you're navigating right now.",
  },

  stories: {
    title: "Stories",
    intro:
      "Warm, honest notes on family, relationships, parenting, and growing up — each one built around a video from our channels.",
    description:
      "Every story from The Yeti Ways — warm, honest notes on family, relationships, parenting, and growing up, each one built around a video.",
    /** e.g. "(page 2 of 3)" — appended to the title on pages 2 and up. */
    pageSuffix: "(page {current} of {total})",
  },

  post: {
    updated: "updated",
    watchOn: "Watch on",
    related: "More warm ways",
    playVideo: "Play video: {title}",
    breadcrumbHome: "Home",
    breadcrumbStories: "Stories",
  },

  category: {
    eyebrow: "Category",
    labels: {
      Family: "Family",
      Relationships: "Relationships",
      Parenting: "Parenting",
      "Growing Up": "Growing Up",
      "Life Lessons": "Life Lessons",
    },
    slugs: {
      Family: "family",
      Relationships: "relationships",
      Parenting: "parenting",
      "Growing Up": "growing-up",
      "Life Lessons": "life-lessons",
    },
    blurbs: {
      Family:
        "The everyday of living together — chores, routines, and the small rituals that hold a cave together.",
      Relationships:
        "Staying warm with the people you love, even when the wind picks up.",
      Parenting:
        "What we're learning as we raise Babu — usually the hard, honest way.",
      "Growing Up":
        "Babu on new schools, new friends, and figuring out who he is.",
      "Life Lessons":
        "The bigger stuff — change, courage, patience — as it actually shows up.",
    },
  },

  authors: {
    title: "The Yeti Family",
    description:
      "Papa, Mama, and Babu Yeti — the three voices behind The Yeti Ways.",
    intro:
      "Three of us. One cave. We write about the same days from different heights — because a lesson learned by the whole family is the one that actually sticks.",
    /** "{name} on The Yeti Ways — {tagline}" */
    profileDescription: "{name} on The Yeti Ways — {tagline}",
    storiesFrom: "Stories from {name}",
    noStoriesFrom: "{name} hasn't shared a story yet — soon. ❄️",
  },

  search: {
    title: "Search",
    description:
      "Search every story on The Yeti Ways by title, tag, category, or which Yeti wrote it.",
    intro: "Find a story by title, tag, category, or which Yeti wrote it.",
    placeholder: "Try “snoring”, “Mama Yeti”, or “relationships”",
    submit: "Search",
    loading: "Loading stories…",
    latest: "Latest stories",
    noJs: "Search needs JavaScript to run in your browser. You can still",
    noJsLink: "browse every story",
    noJsTail: "or pick a category below.",
    orBrowse: "Or browse by category",
    noMatch: "No stories match “{query}”.",
    noMatchBody:
      "Try a single word, one of the categories below, or a Yeti's name. You can also",
    browseAll: "read every story",
    matchOne: "1 story matches “{query}”.",
    matchMany: "{count} stories match “{query}”.",
    matchTrimmed:
      "{count} stories match “{query}” — showing the closest {shown}.",
    indexError: "Search isn't loading right now.",
    indexErrorBody: "Something went wrong fetching the story index.",
    indexErrorLink: "Browse all stories",
  },

  cta: {
    heading: "Follow the Yetis",
    text: "New stories land on our channels first. Come say hello — we save you a warm seat by the fire.",
    aboutHeading: "Come along",
    aboutText:
      "We post new stories on our channels first. Follow along and bring a blanket.",
  },

  notFound: {
    title: "Page not found",
    description: "This trail went cold.",
    heading: "This trail went cold",
    body: "We couldn't find the page you were looking for. The footprints stop here — but there's a warm fire back at the den.",
  },

  footer: {
    explore: "Explore",
    family: "The Family",
    follow: "Follow",
    more: "More",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    rss: "RSS feed",
    rights: "Big hearts. Thick fur. Good vibes.",
  },

  about: {
    title: "About",
    heading: "About The Yeti Ways",
    paragraphs: [
      "We're a family of Yetis — Papa, Mama, and Babu — and this is where we write things down. It's an extension of what we already share on Facebook, YouTube, and TikTok: short videos about the ordinary work of being a family.",
      "Every story here starts with one of those videos. Then we sit down and write about what was actually going on — the part that didn't fit in sixty seconds. Sometimes Papa writes it. Sometimes Babu writes his own version of the same afternoon, and you get to read both.",
      "We moved a lot. New caves, new mountains, new schools. Adapting as a team taught us most of what we know, and that's the thread through everything: family, relationships, parenting, growing up, and the life lessons that show up whether you're ready or not.",
      "We might be Yetis. Our ways are warm anyway.",
    ],
  },

  contact: {
    title: "Contact",
    description:
      "Get in touch with the Yeti family — email us, or find us on our channels.",
    heading: "Say hello",
    intro:
      "There's no form here and no ticket number — just us, reading our own inbox. Write whenever you like. We answer as a family, usually within a few days, sometimes slower when the mountain is busy.",
    emailLabel: "Email",
    writeToUs: "Write to us",
    reasonsHeading: "Good reasons to write",
    reasons: [
      {
        heading: "Say hello",
        text: "A story landed, or reminded you of your own afternoon. This is our favourite kind of mail.",
      },
      {
        heading: "Ask about using something",
        text: "You'd like to quote, translate, or republish a story. Tell us which one and where it's going.",
      },
      {
        heading: "Tell us we got it wrong",
        text: "A broken link, a name misspelled, a fact off. We'd rather hear it than leave it.",
      },
      {
        heading: "Privacy and terms",
        text: "Anything about what we store or how our writing may be used.",
      },
    ],
    channelsHeading: "Find us on our channels",
    channelsIntro:
      "New stories land here first. If you'd rather reply in public than in an inbox, this is the place.",
    channelNotes: {
      Facebook:
        "Where most of the conversation happens. Comments, replies, all of it.",
      YouTube: "The videos every story here is built around.",
      TikTok: "The short version, usually posted first.",
    },
    disclaimer:
      '{site} is a personal family blog, so please keep anything sensitive out of your message. What happens to an email once it reaches us is covered in our <a href="{privacy}">Privacy Policy</a>, and what you may do with our stories is covered in our <a href="{terms}">Terms &amp; Conditions</a>.',
  },

  legal: {
    lastUpdated: "Last updated",
    privacy: {
      title: "Privacy Policy",
      description:
        "How {site} handles your information — what we store, what we don't, and how to reach us about it.",
      lead: "{site} is a family blog. We are not in the data business, and this page is the short, honest version of what that means when you visit.",
      sections: [
        {
          heading: "The short version",
          html: [
            "<ul><li>We don't ask you to create an account, and there is nothing to log in to.</li><li>We don't run advertising trackers or sell anything about you.</li><li>The only thing this site stores in your browser is your light/dark theme choice.</li><li>If you email us, we keep that email so we can reply to it.</li></ul>",
          ],
        },
        {
          heading: "What we store in your browser",
          html: [
            "<p>When you use the theme toggle in the header, your choice is saved in your browser's <code>localStorage</code> under the key <code>yeti-theme</code>. It stays on your device, it is never sent to us or to anyone else, and it only exists so the site doesn't flash the wrong colours at you on your next visit. Clearing your browser's site data removes it, and the site falls back to your operating system's preference.</p>",
            "<p>We do not set advertising or tracking cookies.</p>",
          ],
        },
        {
          heading: "Videos and other embedded content",
          html: [
            "<p>Every story here is built around one of our videos. Those videos are hosted on YouTube, and we load them in a deliberately careful way: until you press play, the page shows only a still image and a button, and your browser makes no request to YouTube's player at all. When you do press play, we load the video through <code>youtube-nocookie.com</code>, YouTube's privacy-enhanced mode.</p>",
            '<p>Once that player loads, YouTube receives your IP address and can set its own storage on your device, under <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google\'s privacy policy</a> rather than this one. The same is true of any link that takes you off to our channels on {channels}: once you leave, that platform\'s rules apply.</p>',
          ],
        },
        {
          heading: "Server logs",
          html: [
            "<p>This is a static site served by a hosting provider. Like essentially every web host, ours records standard technical request information — IP address, the page requested, timestamp, browser user agent — to serve the site and to keep it secure and available. We don't use those logs to build a profile of you.</p>",
          ],
        },
        {
          heading: "When you email us",
          html: [
            '<p>If you write to us at <a href="{mailto}">{email}</a>, we receive your email address, your name if you give it, and whatever you chose to tell us. We use it to reply and nothing else. We don\'t add you to a mailing list, and we don\'t pass it on. We keep correspondence only as long as it\'s useful to the conversation.</p>',
            "<p>Please don't send us anything sensitive — health details, financial information, government ID numbers. A family blog is not the right place for it.</p>",
          ],
        },
        {
          heading: "Children",
          html: [
            "<p>Our stories are about a kid, but the site isn't built to collect anything from one. We don't knowingly collect personal information from children under 13. If you believe a child has sent us personal information, email us and we'll delete it.</p>",
          ],
        },
        {
          heading: "Your choices",
          html: [
            '<p>You can browse this site without giving us anything. If you have emailed us and would like that correspondence deleted, or you want to know what we hold, write to <a href="{mailto}">{email}</a> and we\'ll sort it out. Depending on where you live, you may have formal rights to access, correct, or delete personal information we hold about you; we\'ll honour those requests regardless of where you\'re writing from.</p>',
          ],
        },
        {
          heading: "Changes to this policy",
          html: [
            "<p>If we add anything to the site that changes the picture above — a comment system, a newsletter, analytics — we'll update this page and change the date at the top before it goes live.</p>",
          ],
        },
        {
          heading: "Contact",
          html: [
            '<p>Questions about any of this go to <a href="{mailto}">{email}</a>, or through the <a href="{contact}">contact page</a>.</p>',
          ],
        },
      ],
    },
    terms: {
      title: "Terms & Conditions",
      description:
        "The terms for reading and sharing {site} — what you may do with our stories, and what we promise in return.",
      lead: "By reading {site} you're agreeing to the terms below. They're deliberately plain: this is a family blog, not a service you're buying.",
      sections: [
        {
          heading: "What this site is",
          html: [
            "<p>{site} publishes personal stories written by our family, each one built around a video from our channels. It's free to read, and we run it for the pleasure of writing it.</p>",
          ],
        },
        {
          heading: "Our writing, photos, and videos",
          html: [
            "<p>Unless a page says otherwise, everything here — the stories, the artwork, the photographs, the videos, the site design — belongs to us. You're welcome to:</p>",
            "<ul><li>read it, print it for yourself, and send it to someone;</li><li>quote a short passage, as long as you credit {site} and link back to the story you took it from.</li></ul>",
            "<p>Please don't:</p>",
            "<ul><li>republish a whole story, here or translated, without asking first;</li><li>use our writing, images, or video to train a model or build a dataset;</li><li>use our name, our likenesses, or our stories to advertise or endorse something.</li></ul>",
            '<p>If you\'d like to use something more fully, just ask — <a href="{mailto}">{email}</a>. We\'re usually happy to say yes.</p>',
          ],
        },
        {
          heading: "Linking to us",
          html: [
            "<p>Link to any page here, freely, with no permission needed. Just don't frame the site inside your own or present our stories in a way that suggests we wrote them for you.</p>",
          ],
        },
        {
          heading: "Links out",
          html: [
            "<p>We link to YouTube, Facebook, TikTok, and occasionally to other people's sites. We don't control those places and aren't responsible for what they do or what they show you. Their terms and privacy policies apply once you arrive.</p>",
          ],
        },
        {
          heading: "These are our stories, not advice",
          html: [
            "<p>We write about parenting, relationships, moving house, and growing up, because that's what happened to us. None of it is professional advice — medical, psychological, legal, or financial. What worked in our family may not work in yours. For anything that matters, talk to someone qualified.</p>",
          ],
        },
        {
          heading: "Availability",
          html: [
            "<p>We publish when we can and we may edit, move, or take down any story at any time. We don't promise the site will always be reachable or error-free, and to the extent the law allows, we're not liable for any loss that comes from using it or from being unable to.</p>",
          ],
        },
        {
          heading: "Anything you send us",
          html: [
            "<p>If you email us a comment, a suggestion, or a story of your own, we may quote it on the site or on our channels — never with your full name or contact details unless you tell us that's fine. If you'd rather we didn't quote you at all, say so in the message and we won't.</p>",
          ],
        },
        {
          heading: "Changes",
          html: [
            "<p>We may update these terms. The date at the top of this page always shows the last revision, and continuing to use the site after a change means you accept the new version.</p>",
          ],
        },
        {
          heading: "Contact",
          html: [
            '<p>Questions about these terms go to <a href="{mailto}">{email}</a>, or through the <a href="{contact}">contact page</a>.</p>',
          ],
        },
      ],
    },
  },
};

export type UiStrings = typeof en;
