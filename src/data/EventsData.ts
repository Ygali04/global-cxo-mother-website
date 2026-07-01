// Import modular data structures
import {
  Speaker,
  globalInnovationSummitSpeakers,
} from './speakers';

import {
  ItineraryItem,
  globalInnovationSummitItinerary,
} from './itinerary';

import {
  globalInnovationSummitImages,
} from './images';

import {
  Sponsor,
  globalInnovationSummitSponsors,
} from './sponsors';

import {
  sfConferenceImages,
  sfConferenceSpeakers,
  sfConferenceSponsors,
  sfConferenceItinerary,
  sfConferenceHighlightCards,
} from './events/sfConference';

import {
  dubaiSummitImages,
  dubaiSummitSpeakers,
  dubaiSummitSponsors,
  dubaiSummitItinerary,
  dubaiSummitHighlightCards,
} from './events/dubaiSummit';

export interface HighlightCard {
  icon: string;
  title: string;
  text: string;
}

export interface CTAConfig {
  primaryLabel: string;
  primaryUrl: string;
  isExternal?: boolean;
  secondaryLabel?: string;
  secondaryUrl?: string;
}

export interface EventMetadata {
  title: string;
  description: string;
  image: string;
}

export type EventLifecycleStatus = 'current' | 'past' | 'archived';

interface VenueInfo {
  name: string;
  address: string;
  description: string;
  image: string;
  mapEmbedUrl?: string;
}

export interface EventDetail {
  id: number;
  slug: string;
  title: string;
  tagline?: string;
  date: string;
  location: string;
  description: string;
  attendees: string;
  heroImage: string;
  heroImageMobile?: string;
  cardImage?: string;
  bannerImage: string;
  gallery: string[];
  overview: string;
  objectives: string[];
  speakers: Speaker[];
  sponsors: Sponsor[];
  itinerary: ItineraryItem[];
  highlights: string[];
  highlightCards: HighlightCard[];
  pastHighlights?: string;
  lifecycleStatus?: EventLifecycleStatus;
  registrationOpen?: boolean;
  price?: string;
  isTeaser?: boolean;
  cta?: CTAConfig;
  metadata: EventMetadata;
  venue: VenueInfo;
  livestreamUrl?: string;
}

const sriLankaHighlightCards: HighlightCard[] = [
  {
    icon: '/assets/icons/global.png',
    title: 'Global Leaders',
    text: '75+ CIOs, CTOs, CISOs from enterprise innovators.',
  },
  {
    icon: '/assets/icons/founders.png',
    title: 'Founder Track',
    text: '30+ startups refining enterprise go-to-market.',
  },
  {
    icon: '/assets/icons/meetings.png',
    title: 'Curated 1-on-1s',
    text: 'Guaranteed executive matchmaking for every founder.',
  },
  {
    icon: '/assets/icons/vacation.png',
    title: 'Coastal Retreat',
    text: 'Immersive Sri Lankan hospitality in Colombo.',
  },
];

export const eventsData: EventDetail[] = [
  {
    id: 1,
    slug: 'sri-lanka-2025',
    title: 'Global Innovation Summit & Retreat',
    tagline: 'A seaside innovation retreat uniting CIOs and founders.',
    date: 'September 2-5, 2025',
    location: 'Colombo, Sri Lanka',
    description:
      'Where startup founders and enterprise innovators come together. Led by CIOs & CxOs for thought leadership, enterprise innovation, and advisory.',
    attendees: '150+',
    heroImage: globalInnovationSummitImages.heroImage,
    heroImageMobile: globalInnovationSummitImages.heroImage,
    cardImage: globalInnovationSummitImages.heroImage,
    bannerImage: '/assets/events/SriLanka/banner.png',
    gallery: globalInnovationSummitImages.gallery,
    overview:
      'This is a one-of-a-kind summit & retreat where startup founders and enterprise leaders unite to share common challenges and opportunities to develop a brighter future together. Bringing together more than 75 global enterprise leaders including CIOs, CISOs, CTOs, and CxOs with over 30 high-growth startups to explore the impact of AI initiatives, evaluate build-versus-buy strategies for enterprises, and equip founders to succeed in enterprise sales. Organized by current and former CIOs and CISOs, this exclusive event is being held in the stunning island nation of Sri Lanka, celebrated for its world-class hospitality, vibrant culture, and exceptional culinary experiences.',
    objectives: [
      'Connect 75+ global leading enterprise innovators (CIO/CISO, CTO, CxO) with 30+ startup founders',
      'Explore AI influence on enterprises, digital work experience, employee empowerment, and productivity',
      'Create collaborative innovation partnerships between startups and enterprises',
      'Build strategic relationships and advisory board opportunities',
    ],
    speakers: globalInnovationSummitSpeakers,
    sponsors: globalInnovationSummitSponsors,
    itinerary: globalInnovationSummitItinerary,
    highlights: [
      '75+ global leading enterprise innovators (CIOs, CTOs, CxOs) from mid to large enterprises with 1000+ employees',
      '30+ startup founders with revenue over $1M+ and raised Series A funding',
      'Guaranteed 1-on-1 meetings: Each founder meets at least 5 CxOs for quality relationship building',
      'Organized by former and current CIOs & CISOs for authentic peer-to-peer learning in beautiful Sri Lanka',
    ],
    highlightCards: sriLankaHighlightCards,
    registrationOpen: false,
    price: 'Contact for pricing',
    cta: {
      primaryLabel: 'Request Recap Deck',
      primaryUrl: 'mailto:hello@globalciocircle.com?subject=Sri Lanka 2025 Recap',
      secondaryLabel: 'Explore Gallery',
      secondaryUrl: '/gallery',
    },
    metadata: {
      title: 'Global CIO Circle | Sri Lanka Innovation Summit 2025',
      description:
        'Go inside the four-day Sri Lanka retreat where 75+ CIOs and 30+ founders co-create the future of enterprise innovation.',
      image: globalInnovationSummitImages.heroImage,
    },
    venue: {
      name: 'Taj Samudra',
      address: '25 Galle Face Centre Road, Colombo 00300, Sri Lanka',
      description:
        "A seaside splendor overlooking the iconic Galle Face Green, Taj Samudra is Colombo's premier luxury hotel. Set within 11 acres of landscaped gardens with 300 rooms and suites, you'll enjoy stunning Indian Ocean views, exquisite accommodations, and authentic Sri Lankan hospitality.",
      image: globalInnovationSummitImages.venue,
      mapEmbedUrl:
        'https://maps.google.com/maps?q=Taj+Samudra+Hotel,+25+Galle+Face+Centre+Road,+Colombo,+Sri+Lanka&t=&z=15&ie=UTF8&iwloc=&output=embed',
    },
  },
  {
    id: 4,
    slug: 'gcio-demo-salon-2026',
    title: 'GCIO Demo Salon 2026',
    tagline: 'A proof-of-concept event for testing registration, dashboards, and admin workflows.',
    date: 'April 24, 2026',
    location: 'San Francisco, California',
    description:
      'A compact mock event created specifically for the GCIO product demo environment. It exercises the dashboard, registration, startup linking, and admin attendee workflows without implying a live production summit.',
    attendees: '40+',
    heroImage: sfConferenceImages.card,
    heroImageMobile: sfConferenceImages.card,
    cardImage: sfConferenceImages.card,
    bannerImage: sfConferenceImages.banner,
    gallery: [],
    overview:
      'This event exists purely as a product proof of concept. Use it to demonstrate how a founder, CIO, VC, or admin would move through the GCIO experience: log in, register, review the dashboard, and verify the attendee record in the admin console. It is intentionally lightweight but fully wired into the mock demo state.',
    objectives: [
      'Validate the mock registration flow for all user tiers.',
      'Demonstrate startup profile creation for unlinked founder accounts.',
      'Show real-time admin visibility into attendee changes.',
    ],
    speakers: [],
    sponsors: [],
    itinerary: [],
    highlights: [
      'Dedicated sandbox event for platform demos.',
      'Supports founder, CIO, VC, admin, and dev test accounts.',
      'Safe environment for end-to-end workflow walkthroughs.',
    ],
    highlightCards: [],
    registrationOpen: true,
    cta: {
      primaryLabel: 'Open Demo Dashboard',
      primaryUrl: '/dashboard',
    },
    metadata: {
      title: 'Global CIO Circle | GCIO Demo Salon 2026',
      description:
        'A sandbox event used to demonstrate the GCIO dashboard, startup registration flow, and admin attendee management experience.',
      image: sfConferenceImages.banner,
    },
    venue: {
      name: 'GCIO Innovation Studio',
      address: 'Palo Alto / San Francisco Demo Environment',
      description:
        'A fictional venue used for the product demo. All event activity is mock-only and intended for internal testing and stakeholder presentations.',
      image: sfConferenceImages.card,
      mapEmbedUrl: 'https://maps.google.com/maps?q=Palo%20Alto%20Art%20Center&output=embed',
    },
  },
  {
    id: 2,
    slug: 'sf-conference-2025',
    title: 'Silicon Valley AI Thought Leadership Summit',
    tagline: 'Exploring AI-first Principles',
    date: 'December 8, 2025',
    location: 'Palo Alto Art Center, Palo Alto, CA',
    description:
      'Atomicwork, Global CIO Circle, Okta Ventures, Tray.ai, and a coalition of startups and enterprises congregate as 150+ CxOs, VCs, and founders to examine the mission, purpose, and practical realities of building global AI-powered companies. Expect curated conversations, focused workshops, and an evening celebration that keeps the dialogue going well past the main event.',
    attendees: '100+',
    heroImage: sfConferenceImages.card,
    heroImageMobile: sfConferenceImages.heroMobile || sfConferenceImages.card,
    cardImage: sfConferenceImages.card,
    bannerImage: sfConferenceImages.banner,
    gallery: sfConferenceImages.gallery,
    overview:
      'Hosted by Atomicwork in collaboration with Global CIO Circle, Okta Ventures, Tray.ai, selected startups, and enterprise innovation leaders to look beyond surface-level conversations. Together we will explore the deeper purpose, mission, and vision of entrepreneurship, the problems and solutions being addressed, and what it takes to build a global enterprise. Senior CxOs who lead large teams and navigate complex AI challenges will share wisdom, insights, and lessons learned for the benefits of founders and executives who wish to accelerate growth and achieve 10x outcomes. Join us for a full afternoon of panel discussions, hands-on workshops, and an evening celebration that showcases the best of the Bay Area ecosystem.',
    objectives: [
      'Dig into the purpose, mission, and vision behind building AI-first companies with guidance from seasoned global CxOs.',
      'Gather 150+ CxOs, VCs, and founders from the Bay Area, India, and the rest of the world for meaningful peer exchange.',
      'Translate on-stage insights into practical playbooks through expert panels, startup pitches, and a Securing AI Agents workshop.',
      'Foster long-term relationships during networking exhibits and the Atomicwork holiday celebration.',
    ],
    speakers: sfConferenceSpeakers,
    sponsors: sfConferenceSponsors,
    itinerary: sfConferenceItinerary,
    highlights: [
      'Atomicwork + Global CIO Circle partnership with Okta Ventures, Tray.ai, and leading enterprises.',
      '150+ CxOs, VCs, and founders from the Bay Area, India, and across the globe.',
      'Panels on enterprise AI, CTO playbooks, founders in the AI era, and an immersive Securing AI Agents workshop.',
      'Networking lounges, startup exhibits, and the Atomicwork holiday party to keep conversations flowing.',
    ],
    highlightCards: sfConferenceHighlightCards,
    registrationOpen: false,
    cta: {
      primaryLabel: 'Request Invite',
      primaryUrl: 'https://luma.com/qtfo7tkt',
      isExternal: true,
    },
    metadata: {
      title: 'Global CIO Circle | Silicon Valley AI Thought Leadership Summit',
      description:
        'Join Atomicwork, Global CIO Circle, Okta Ventures, and Tray.ai at the Palo Alto Art Center for a 150+ person summit on the deeper purpose of AI entrepreneurship.',
      image: sfConferenceImages.banner,
    },
    venue: {
      name: 'Palo Alto Art Center',
      address: '1313 Newell Rd, Palo Alto, CA 94303',
      description:
        'A creative venue in the heart of Palo Alto. The precise meeting rooms and access instructions are shared with confirmed guests during registration.',
      image: sfConferenceImages.venue || sfConferenceImages.hero,
      mapEmbedUrl: 'https://maps.google.com/maps?q=Palo Alto Art Center&output=embed',
    },
  },
  {
    id: 3,
    slug: 'dubai-summit-2026',
    title: 'Dubai Global Innovation Summit & Retreat 2026',
    tagline: 'Aspire • Transpire • Inspire',
    date: 'January 9-11, 2026',
    location: 'Dubai, United Arab Emirates',
    description:
      'At the Global Innovation Summit & Retreat in Dubai-created with ISF, AEIC (American University in Dubai), and Global CIO Circle - we bring together the next generation of dreamers and the leaders who still are. It is where Junicorns aspire to change the world, founders transpire visions into reality, and unicorn founders and CxOs inspire the future of innovation.',
    attendees: '150+',
    heroImage: dubaiSummitImages.card,
    heroImageMobile: dubaiSummitImages.heroMobile || dubaiSummitImages.card,
    cardImage: dubaiSummitImages.card,
    bannerImage: dubaiSummitImages.banner,
    gallery: dubaiSummitImages.gallery,
    overview:
      'Join us for an extraordinary gathering that bridges ambition and achievement-where ideas meet experience and tomorrow’s breakthroughs begin today. This focused retreat brings CxOs, VCs, founders, and aspiring Junicorns from India, the US, and the Middle East together to go beyond the surface, understand the purpose and mission behind entrepreneurship, and co-create global companies. Senior executives share wisdom, pain points, and practical advice so founders can accelerate growth and achieve 10x outcomes, while CxOs explore advisory and investment opportunities.',
    objectives: [
      'Bridge Junicorns, Soonicorns, unicorn founders, and enterprise CxOs in a retreat setting built for mentorship and collaboration.',
      'Provide 30+ startups and 40+ aspiring founders with immersive workshops, pitches, and exhibition moments that convert into advisory relationships.',
      'Equip founders with guidance on strategic fundraising, pricing, AI go-to-market motions, and creating boards packed with CxO investors.',
      'Enable CxOs from India, the US, MEA, and beyond to evaluate investments, advisory roles, and partnerships that accelerate corridor innovation.',
    ],
    speakers: dubaiSummitSpeakers,
    sponsors: dubaiSummitSponsors,
    itinerary: dubaiSummitItinerary,
    highlights: [
      'Participating enterprises include Tabhi, Mondee, AEIC @ AUD, Grant Thornton, Alteryx, Philips, NTT, Oracle, Hitachi, JPMorgan, KPMG, AWS, Zoom, Meta, The Baldwin Group, Stanford Medicine, Global Ventures, SucSEED Ventures, Inclusive Ventures Group, Techinnova, Blitz India, and more.',
      '30+ startups and 40+ aspiring founders such as Potpie.ai, Atomicwork, Trupeer.ai, Lumif.ai, Featurely.ai, Thunai.ai, Hivel.ai, and WithJoy present pitches, workshops, and exhibits.',
      '100+ CxOs from the US, UK, EU, MEA, India, Singapore, and APAC attend for peer networking, advisory board creation, and investment opportunities.',
      'Partnership tiers (Entry through Platinum) cover lodging, transportation, primetime pitches, dedicated rooms, curated dining tables, and recognition across the retreat.',
    ],
    highlightCards: dubaiSummitHighlightCards,
    registrationOpen: true,
    cta: {
      primaryLabel: 'Request VIP Invite',
      primaryUrl: 'https://lu.ma/globalcio-dubai',
      isExternal: true,
    },
    metadata: {
      title: 'Global CIO Circle | Dubai Summit 2026',
      description:
        'Experience the Global Innovation Summit & Retreat in Dubai-where ISF, AEIC, and Global CIO Circle unite Junicorns, founders, unicorns, VCs, and CxOs.',
      image: dubaiSummitImages.banner,
    },
    venue: {
      name: 'InterContinental Dubai Festival City',
      address: 'Dubai Festival City, Dubai, United Arab Emirates',
      description:
        'InterContinental Dubai Festival City overlooks Dubai Creek and offers purpose-built ballrooms, breakout lounges, and waterfront networking spaces for the Global Innovation Summit & Retreat.',
      image: dubaiSummitImages.venue || dubaiSummitImages.hero,
      mapEmbedUrl: 'https://maps.google.com/maps?q=InterContinental%20Dubai%20Festival%20City&output=embed',
    },
    livestreamUrl: 'https://www.youtube.com/embed/woI3-ARzql0?si=ySOHc-NRXa-wol_c',
  },
];

export default eventsData;