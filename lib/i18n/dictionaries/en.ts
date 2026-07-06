import type { Dictionary } from "../dictionary";

/**
 * English dictionary. Values are copied verbatim (or are the direct,
 * unambiguous translation of a short standard UI label) from the same 4
 * catalog reports and `clarifications.md` used for `vi.ts` — see that
 * file's header comment for the source-of-truth pointers.
 *
 * `satisfies Dictionary` is the compile-time parity guard: this object must
 * have every key `vi.ts` has, correctly typed, or `tsc --noEmit` fails.
 */
export const en = {
  shared: {
    nav: {
      aboutSaa: "About SAA 2025",
      awardInfo: "Award Information",
      kudos: "Sun* Kudos",
    },
    footer: {
      copyright: "Copyright © 2025 Sun*",
      generalStandards: "General Standards",
    },
    account: {
      profile: "Profile",
      signOut: "Sign out",
    },
    notifications: {
      empty: "No notifications yet",
    },
    widget: {
      comingSoon: "Coming soon",
    },
    countdown: {
      days: "DAYS",
      hours: "HOURS",
      minutes: "MINUTES",
    },
    detailsCta: "Details",
  },
  login: {
    meta: {
      title: "Login | Sun* Annual Awards 2025",
      description: "Sign in to explore Sun* Annual Awards 2025.",
    },
    error: {
      oauthFailed: "Sign-in failed. Please try again.",
      notConfigured:
        "Login isn't configured yet. Please set up Supabase in `.env.local` (see `.env.local.example`).",
    },
    hero: {
      subtitle: "Start your journey with SAA 2025.\nSign in to explore!",
    },
    button: {
      loading: "Signing in...",
      google: "Login with Google",
    },
  },
  homepage: {
    hero: {
      eventInfo: {
        timeLabel: "Time:",
        venueLabel: "Venue:",
        livestreamNote: "Broadcast live via livestream",
      },
      eventDate: "December 26, 2025",
      comingSoon: "Coming soon",
      cta: {
        aboutAwards: "ABOUT AWARDS",
        aboutKudos: "ABOUT KUDOS",
      },
    },
    rootFurther: {
      paragraph1:
        'Facing the rapid transformation of the AI era and ever-rising client expectations, Sun* has chosen a strategy of diversifying capabilities — not only to excel as specialists in our own fields, but to reach further: a place where every Sunner is a "problem-solver," an expert who can tackle any challenge and find answers for every project, client, and society.\nInspired by diverse capabilities, the ability to grow flexibly, and the spirit of digging deep to break through in the AI era, "Root Further" was chosen as the official theme of the Sun* Annual Awards 2025.\nBeyond its surface meaning, "Root Further" is our ongoing journey to reach farther, root deeper, and touch the hidden "geological layers" beneath the surface — to keep surviving, rising, and nurturing the Sun* spirit\'s ever-burning passion for creating value. Like roots constantly pushing deeper into the earth, weaving through layer after layer of "sediment" to absorb what is most essential, Sun* people are likewise "absorbing" nourishment from this era and the market\'s challenges to renew ourselves every day — expanding our capabilities and firmly "taking root" in the AI era: an entirely new, complex, and unpredictable "geological layer," yet one brimming with potential and opportunity.',
      // EN drops the VI back-translation parenthetical per clarifications.md.
      pullQuote: ' "A tree with deep roots fears no storm"',
      paragraph2:
        'When storms hit, only trees with roots strong enough can stand firm. An organization built on individuals who trust in their diverse capabilities, who are ready to create and embrace challenges, and who take charge of change is one that not only stays resilient through turbulence but also seizes every advantage and rises to meet the challenges of the times. More than just the name of a new chapter in our organization\'s journey, "Root Further" is also a call to action: daring to believe in ourselves, daring to dig deep and unlock our full potential, daring to break through our limits, daring to become the most versatile and excellent version of ourselves. Because in the AI era, diverse capabilities and harnessing the strength of the times are the prerequisites for lasting success.\nNo one can know in advance how many hidden "geological layers" still lie beneath the "ground" of today\'s technology and market. All we know is that once "Root Further" becomes our rooted spirit, we will face any uncharted territory ahead not with fear but with excitement — because we always believe that within those boundless frontiers lie countless wonders and opportunities for us to rise and grow.',
    },
    awards: {
      heading: "Award System",
      items: {
        topTalent: {
          description: "Honoring the top individuals who excel across every dimension",
        },
        topProject: {
          description:
            "Honoring outstanding projects that excel across every dimension, with standout revenue performance",
        },
        topProjectLeader: {
          description: "Honoring managers who inspire and lead projects to breakthrough success",
        },
        bestManager: {
          description:
            "Honoring managers with strong management capability who lead their teams effectively",
        },
        signatureCreator: {
          description:
            "Honoring managers with strong management capability who lead their teams effectively",
        },
        mvp: {
          description:
            "Honoring managers with strong management capability who lead their teams effectively",
        },
      },
    },
    kudos: {
      eyebrow: "Recognition Movement",
      description:
        "WHAT'S NEW IN SAA 2025\nA recognition and appreciation activity for colleagues — held for the first time, open to all Sunners. It will run in November 2025, encouraging Sun* people to share notes of recognition and thanks for their colleagues on the platform announced by the Organizing Committee. This content will serve as reference material for the Heads Council during the award selection process.",
    },
  },
  prelaunch: {
    meta: {
      title: "Event Starting Soon — Sun* Annual Awards 2025",
      description: "Countdown - Prelaunch page — Sun* Annual Awards 2025.",
    },
    countdown: {
      heading: "The event will begin in",
    },
  },
  awards: {
    meta: {
      description: "Information about the Sun* Annual Awards 2025 award categories.",
    },
    title: {
      heading: "SAA 2025 Awards System",
    },
    detail: {
      quantityLabel: "Number of awards: ",
      valueLabel: "Award value: ",
      descriptions: {
        sharedUnfinished:
          "The Top Talent award honors comprehensively outstanding individuals — those who consistently demonstrate strong professional competence and outstanding performance, consistently deliver value beyond expectations, and are highly regarded by clients and teammates alike. With a readiness to take on any task the organization assigns, they are a constant source of inspiration, driving motivation and making a positive impact on the whole team.",
        signatureCreator:
          "The Signature award honors individuals or teams who embody the distinctive spirit Sun* champions in each era. In 2025, the Signature award celebrates the Creator — individuals/teams with a proactive, sharp mindset who consistently spot opportunity within challenge and take the lead in action. They are quick to sense problems, swiftly identify them, and deliver practical solutions that create clear value for projects, clients, or the organization. With a builder's mindset and the distinctive \"Creator\" spirit of Sun*, they don't just respond positively to change — they proactively drive improvements, helping shape new standards for how Sun* people create value.",
      },
      entries: {
        topTalent: {
          quantity: "10 Units",
          value: "7,000,000 VND per award",
        },
        topProject: {
          quantity: "02 Teams",
          value: "15,000,000 VND per award",
        },
        topProjectLeader: {
          quantity: "03 Individuals",
          value: "7,000,000 VND",
        },
        bestManager: {
          quantity: "01 Individual",
          value: "10,000,000 VND",
        },
        signatureCreator: {
          quantity: "01 (individual or team)",
          value: "5,000,000 VND (individual) OR 8,000,000 VND (team)",
        },
        mvp: {
          quantity: "01",
          value: "15,000,000 VND",
        },
      },
    },
  },
  kudos: {
    meta: {
      description: "Live Sun* Kudos recognition board — Sun* Annual Awards 2025.",
    },
    banner: {
      title: "Recognition & appreciation system",
    },
    composer: {
      placeholder: "Who would you like to thank and recognize today?",
    },
    filters: {
      hashtagLabel: "Hashtag",
      departmentLabel: "Department",
      allOption: "All",
    },
    card: {
      viewDetail: "View details",
      copyLink: "Copy Link",
      copied: "Link copied",
    },
    empty: {
      kudos: "There are no Kudos yet.",
      recipients: "No data yet",
    },
    spotlight: {
      searchPlaceholder: "Search",
      panZoom: "Pan/Zoom",
    },
    stats: {
      received: "Kudos received",
      sent: "Kudos sent",
      hearts: "Hearts received",
      secretBoxOpened: "Secret Boxes opened",
      secretBoxUnopened: "Secret Boxes unopened",
    },
    gift: {
      openButton: "Open Secret Box",
      dialogTitle: "Your Secret Box",
      dialogBody: "The real reward is coming soon. This is a preview screen for the mock build.",
      close: "Close",
    },
    recent: {
      heading: "10 LATEST SUNNER GIFT RECIPIENTS",
    },
  },
} satisfies Dictionary;
