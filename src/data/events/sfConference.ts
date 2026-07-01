import { Speaker } from '../speakers';
import { Sponsor } from '../sponsors';
import { ItineraryItem } from '../itinerary';

const sfBasePath = '/assets/events/Dec 8 Silicon Valley';
const sfSpeakerPhotoPath = `${sfBasePath}/Speakers Photos`;
const sfSponsorPath = `${sfBasePath}/Site Logos`;

export const sfConferenceImages = {
    hero: `${sfBasePath}/NEW Event Image wt Logo.png`,
    heroMobile: `${sfBasePath}/Event Image no Logo.webp`,
    card: `${sfBasePath}/Event Image no Logo.webp`,
    banner: `${sfBasePath}/NEW Partners Banner wt Image.png`,
    venue: `${sfBasePath}/Venue Image 1.jpg`,
    gallery: [
        `${sfBasePath}/Speakers Panels for Reference/1.png`,
        `${sfBasePath}/Speakers Panels for Reference/2.png`,
        `${sfBasePath}/Speakers Panels for Reference/3.png`,
        `${sfBasePath}/NEW Partners Banner.png`,
    ],
};

export const sfConferenceSpeakers: Speaker[] = [
    {
        name: 'Jeff Applebaum',
        title: 'Stand-Up Comedian & Actor',
        company: 'Emcee',
        image: `${sfSpeakerPhotoPath}/1.jpg`,
    },
    {
        name: 'Karthik Chakkarapani',
        title: 'SVP & CIO',
        company: 'Zuora',
        image: `${sfSpeakerPhotoPath}/2.png`,
    },
    {
        name: 'Saket Srivastava',
        title: 'CIO',
        company: 'Asana',
        image: `${sfSpeakerPhotoPath}/3.png`,
    },
    {
        name: 'Chetna Mahajan',
        title: 'Global CDO & CIO',
        company: 'Webflow',
        image: `${sfSpeakerPhotoPath}/4.png`,
    },
    {
        name: 'Ravi Malick',
        title: 'SVP & Global CIO',
        company: 'Box',
        image: `${sfSpeakerPhotoPath}/5.JPG`,
    },
    {
        name: 'Sandy Venugopal',
        title: 'CIO',
        company: 'CoreWeave',
        image: `${sfSpeakerPhotoPath}/6.png`,
    },
    {
        name: 'Bhawna Singh',
        title: 'CTO, Auth0 / Okta',
        company: 'Auth0 / Okta',
        image: `${sfSpeakerPhotoPath}/7.png`,
    },
    {
        name: 'Sagnik Nandy',
        title: 'President & Chief Technology Officer',
        company: 'DocuSign',
        image: `${sfSpeakerPhotoPath}/8.png`,
    },
    {
        name: 'Alistair Russell',
        title: 'Co-Founder & CTO',
        company: 'Tray.ai',
        image: `${sfSpeakerPhotoPath}/9.png`,
    },
    {
        name: 'Manosiz Bhattacharyya',
        title: 'SVP Engineering & CTO',
        company: 'Nutanix',
        image: `${sfSpeakerPhotoPath}/10.png`,
    },
    {
        name: 'Arvind Nithrakashyap',
        title: 'Co-Founder & CTO',
        company: 'Rubrik',
        image: `${sfSpeakerPhotoPath}/11.png`,
    },
    {
        name: 'Lenin Gali',
        title: 'CBO & Founding Team',
        company: 'Atomicwork',
        image: `${sfSpeakerPhotoPath}/12.jpg`,
    },
    {
        name: 'Amit Prakash',
        title: 'Co-Founder & CEO',
        company: 'AmpUp.ai',
        image: `${sfSpeakerPhotoPath}/13.jpg`,
    },
    {
        name: 'Vijay Rayapati',
        title: 'Co-Founder & CEO',
        company: 'Atomicwork',
        image: `${sfSpeakerPhotoPath}/14.jpg`,
    },
    {
        name: 'Colin Zima',
        title: 'Co-Founder & CEO',
        company: 'Omni',
        image: `${sfSpeakerPhotoPath}/15.png`,
    },
    {
        name: 'Manoj Agarwal',
        title: 'Co-Founder & President',
        company: 'DevRev',
        image: `${sfSpeakerPhotoPath}/16.png`,
    },
    {
        name: 'Aaron Levie',
        title: 'CEO',
        company: 'Box',
        image: `${sfSpeakerPhotoPath}/17.png`,
    },
    {
        name: 'Parag Agrawal',
        title: 'Founder & CEO',
        company: 'Parallel.ai',
        image: `${sfSpeakerPhotoPath}/18.png`,
    },
    {
        name: 'Ashutosh Garg',
        title: 'Co-Founder & CEO',
        company: 'Viven',
        image: `${sfSpeakerPhotoPath}/19.jpg`,
    },
    {
        name: 'Shiv Agarwal',
        title: 'Co-Founder & CEO',
        company: 'Singulr.ai',
        image: `${sfSpeakerPhotoPath}/20.jpg`,
    },
    {
        name: 'Krishna Namasivayam',
        title: 'Founder & CEO',
        company: 'Featurely.ai',
        image: `${sfSpeakerPhotoPath}/21.jpg`,
    },
    {
        name: 'Pritish Gupta',
        title: 'Co-Founder',
        company: 'Trupeer.ai',
        image: `${sfSpeakerPhotoPath}/22.jpg`,
    },
    {
        name: 'Ankur Shah',
        title: 'Co-Founder & CEO',
        company: 'Straiker',
        image: `${sfSpeakerPhotoPath}/23.jpg`,
    },
];

export const sfConferenceSponsors: Sponsor[] = [
    { name: 'Atomicwork', logo: `${sfSponsorPath}/1.png`, website: 'https://www.atomicwork.com' },
    { name: 'Okta Ventures', logo: `${sfSponsorPath}/2.png`, website: 'https://www.okta.com/' },
    { name: 'Box', logo: `${sfSponsorPath}/3.png`, website: 'https://www.box.com' },
    { name: 'Tray.ai', logo: `${sfSponsorPath}/4.png`, website: 'https://tray.ai' },
    { name: 'Alteryx', logo: `${sfSponsorPath}/5.png`, website: 'https://www.alteryx.com' },
    { name: 'Zuora', logo: `${sfSponsorPath}/6.png`, website: 'https://www.zuora.com' },
    { name: 'Asana', logo: `${sfSponsorPath}/7.png`, website: 'https://asana.com' },
    { name: 'Dodge & Cox', logo: `${sfSponsorPath}/8.png`, website: 'https://www.dodgeandcox.com' },
    { name: 'DocuSign', logo: `${sfSponsorPath}/9.png`, website: 'https://www.docusign.com' },
    { name: 'Rubrik', logo: `${sfSponsorPath}/10.png`, website: 'https://www.rubrik.com' },
    { name: 'Nutanix', logo: `${sfSponsorPath}/11.png`, website: 'https://www.nutanix.com' },
    { name: 'DevRev', logo: `${sfSponsorPath}/12.png`, website: 'https://www.devrev.ai' },
    { name: 'AmpUp.ai', logo: `${sfSponsorPath}/13.png`, website: 'https://www.ampup.ai' },
    { name: 'Omni', logo: `${sfSponsorPath}/14.png`, website: 'https://www.omni.co' },
    { name: 'Lewrick & Company', logo: `${sfSponsorPath}/15.png`, website: 'https://www.lewrick.ch' },
    { name: 'Straiker', logo: `${sfSponsorPath}/16.png`, website: 'https://www.straiker.ai' },
    { name: 'Trupeer', logo: `${sfSponsorPath}/17.png`, website: 'https://www.trupeer.ai' },
    { name: 'Featurely', logo: `${sfSponsorPath}/18.png`, website: 'https://www.featurely.ai' },
    { name: 'Linen Cloud', logo: `${sfSponsorPath}/19.png`, website: 'https://linen.cloud' },
    { name: 'Thunai.ai', logo: `${sfSponsorPath}/20.png`, website: 'https://www.thunai.ai' },
    { name: 'Arambh Labs', logo: `${sfSponsorPath}/21.png`, website: 'https://arambhlabs.com/' },
    { name: 'Hivel', logo: `${sfSponsorPath}/22.png`, website: 'https://www.hivel.ai' },
    { name: 'Joy', logo: `${sfSponsorPath}/23.png`, website: 'https://withjoy.com' },
];

export const sfConferenceItinerary: ItineraryItem[] = [
    {
        date: 'December 8',
        time: '01:00 pm - 01:30 pm',
        title: 'Registration & Welcome Networking',
        description: 'Doors open with light bites and a first round of curated introductions between CxOs, VCs, and founders.',
        type: 'networking',
        timeOfDay: 'afternoon',
    },
    {
        date: 'December 8',
        time: '01:30 pm - 02:00 pm',
        title: 'Startup Pitches',
        description: 'Rapid-fire pitches from emerging AI startups outlining the enterprise problems they are tackling and the results to date.',
        type: 'pitch',
        timeOfDay: 'afternoon',
        sponsors: ['Atomicwork'],
    },
    {
        date: 'December 8',
        time: '02:00 pm - 02:30 pm',
        title: 'CIO Panel - Enterprise AI: Context is King',
        description:
            'Senior CxOs unpack how contextual understanding, rigorous data curation, and continuous QA determine the success of AI deployments at scale.',
        type: 'panel',
        timeOfDay: 'afternoon',
        sponsors: ['Atomicwork', 'Asana', 'Box', 'Dodge & Cox', 'Zuora'],
        moderators: ['Karthik Chakkarapani'],
        speakers: ['Saket Srivastava', 'Chetna Mahajan', 'Ravi Malick', 'Monica Khurana'],
    },
    {
        date: 'December 8',
        time: '02:35 pm - 03:05 pm',
        title: 'CTO Panel - Building & Securing Products for Enterprises',
        description:
            'Leaders from Tray.ai, DocuSign, Rubrik, Nutanix, and Okta dig into the new playbook for architecture, deployment, and security in the AI era.',
        type: 'panel',
        timeOfDay: 'afternoon',
        sponsors: ['Tray.ai', 'DocuSign', 'Rubrik', 'Nutanix', 'Okta Ventures'],
        moderators: ['Bhawna Singh'],
        speakers: ['Sagnik Nandy', 'Alistair Russell', 'Manosiz Bhattacharyya', 'Arvind Nithrakashyap'],
    },
    {
        date: 'December 8',
        time: '03:10 pm - 03:40 pm',
        title: 'Founders Panel - Building a Startup in the AI Era',
        description:
            'Repeat founders share the hard-earned lessons that separate AI hype from enterprise outcomes, covering GTM, pricing, and customer success.',
        type: 'panel',
        timeOfDay: 'afternoon',
        sponsors: ['Atomicwork', 'AmpUp.ai', 'DevRev', 'Omni'],
        moderators: ['Lenin Gali'],
        speakers: ['Amit Prakash', 'Vijay Rayapati', 'Colin Zima', 'Manoj Agarwal'],
    },
    {
        date: 'December 8',
        time: '03:40 pm - 03:55 pm',
        title: 'Coffee Break',
        description: 'Reset with artisanal coffee while exploring startup exhibits and booking follow-up meetings.',
        type: 'break',
        timeOfDay: 'afternoon',
    },
    {
        date: 'December 8',
        time: '04:00 pm - 05:00 pm',
        title: 'Workshop - Securing the AI Agents',
        description:
            'Okta Ventures convenes a hands-on session focused on identity, governance, and the operational realities of AI agent sprawl.',
        type: 'workshop',
        timeOfDay: 'afternoon',
        sponsors: ['Okta Ventures', 'Straiker', 'Thunai.ai', 'Lewrick & Company'],
        speakers: ['Charlotte Wylie', 'Ankur Shah', 'Dr. Michael Lewrick'],
        subEvents: [
            {
                time: '04:00 pm - 04:05 pm',
                title: 'Agent Identity',
                speakers: ['Charlotte Wylie, Deputy CISO, Okta'],
                description: 'Why identity and context remain the control plane for autonomous agents.',
            },
            {
                time: '04:05 pm - 04:10 pm',
                title: 'Securing AI Agents',
                speakers: ['Ankur Shah, Co-Founder & CEO, Straiker'],
                description: 'The evolving threat landscape, governance gaps, and mitigation strategies.',
            },
            {
                time: '04:10 pm - 04:55 pm',
                title: 'Guided Discussion & Working Session',
                speakers: ['Dr. Michael Lewrick, CEO, Lewrick & Company'],
                description: 'Interactive dialogue with executives on playbooks for policy, tooling, and accountability.',
            },
            {
                time: '04:55 pm - 05:00 pm',
                title: 'Workshop Support',
                speakers: ['Thunai.ai Facilitation Team'],
                description: 'Recap of key takeaways and logistics for ongoing collaboration.',
            },
        ],
    },
    {
        date: 'December 8',
        time: '05:15 pm - 06:00 pm',
        title: 'AI Infused Conversation',
        description:
            'Open discussion on training data, compliance, quantum + AI, and the cultural impact of automation over the next decade.',
        type: 'panel',
        timeOfDay: 'evening',
    },
    {
        date: 'December 8',
        time: '06:00 pm - 06:30 pm',
        title: 'Networking, Cocktails & Startup Exhibits',
        description: 'Quality time to deepen relationships, explore demos, and set next steps before year-end.',
        type: 'networking',
        timeOfDay: 'evening',
    },
    {
        date: 'December 8',
        time: '06:30 pm - 08:30 pm',
        title: 'Atomicwork Holiday Party',
        description: 'Celebrate the day with music, hosted cocktails, and intimate conversations under the lights.',
        type: 'cocktails',
        timeOfDay: 'evening',
    },
];

export const sfConferenceHighlightCards = [
    {
        icon: '/assets/icons/global.png',
        title: '150+ Global Leaders',
        text: 'CxOs, VCs, and founders from the Bay Area, India, and beyond convene in one room.',
    },
    {
        icon: '/assets/icons/founders.png',
        title: 'Purposeful Conversations',
        text: 'Atomicwork, Okta Ventures, Tray.ai, and partners go beyond surface-level AI chatter.',
    },
    {
        icon: '/assets/icons/meetings.png',
        title: 'Hands-on Agenda',
        text: 'Panels, pitches, and a Securing AI Agents workshop deliver practical playbooks.',
    },
    {
        icon: '/assets/icons/vacation.png',
        title: 'Palo Alto Immersion',
        text: 'Gather at the Palo Alto Art Center and stay for the Atomicwork holiday celebration.',
    },
];

