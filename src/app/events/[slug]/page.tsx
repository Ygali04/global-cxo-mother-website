import type { Metadata } from "next"
import EventDetail from "@/components/events/EventDetail"
import eventsData from "@/data/EventsData"

const SLUG_ALIASES: Record<string, string> = {
    "cio-100": "cio-100-awards-conference",
    "cio100": "cio-100-awards-conference",
};

export function resolveEventSlug(slug: string): string {
    return SLUG_ALIASES[slug] || slug;
}

const ALL_EVENT_SLUGS = Array.from(
    new Set([
        ...eventsData.map((e) => e.slug),
        "cio-100",
        "cio-100-awards-conference",
        "mlc-oakland",
        "sri-lanka-2025",
        "sf-conference-2025",
        "dubai-summit-2026",
        "gcio-demo-salon-2026",
    ])
);

export function generateStaticParams() {
    return ALL_EVENT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const resolvedSlug = resolveEventSlug(slug)
    const ev = eventsData.find((e) => e.slug === resolvedSlug)
    if (!ev) return { title: "Events | Global CXO Circle" }
    const title = ev.metadata?.title || `${ev.title} | Global CXO Circle`
    const description = ev.metadata?.description || ev.description
    const image = ev.metadata?.image
    const metadata: Metadata = { title, description }
    if (ev.slug === "cio-100-awards-conference" && image) {
        metadata.openGraph = { title, description, images: [{ url: image, alt: ev.title }] }
        metadata.twitter = { card: "summary_large_image", title, description, images: [image] }
    }
    return metadata
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const resolvedSlug = resolveEventSlug(slug)
    return <EventDetail slug={resolvedSlug} />
}
