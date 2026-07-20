# Global CXO Circle

Marketing website for Global CXO Circle, an invite-only network for enterprise technology leaders. Built with Next.js and exported as a static site.

## Tech Stack

- **Next.js 16** (App Router, static export)
- **React 19**
- **Bootstrap 5** grid + custom CSS variables for theming
- **Framer Motion** for scroll animations

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the static site (output goes to `out/`) |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/                  # Routes (App Router) — one folder per page
├── components/
│   ├── homes/home-five/  # Homepage sections
│   ├── events/           # Event detail page component
│   └── gallery/          # Gallery detail page component
├── data/                 # Static content (events, speakers, resources, etc.)
├── layouts/              # Shared header/footer
└── styles/                # Global styles
```

## Pages

Home, About Us, Circles, Pricing, Events (+ detail pages), Gallery (+ detail pages), Resources, Awards, Contact, Waitlist, Privacy Policy, Terms of Service.

## Notes

- This is a **static export** (`output: 'export'` in `next.config.ts`) — there are no API routes or server actions. Any backend calls (waitlist form, resource downloads) go directly to external services from the client.
- The waitlist form submits to an external Railway-hosted API.
- The contact form and resource downloads submit to Web3Forms and a Google Form respectively.
