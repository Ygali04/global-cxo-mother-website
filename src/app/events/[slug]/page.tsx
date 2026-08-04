import type { Metadata } from "next"
import EventDetail from "@/components/events/EventDetail"
import eventsData from "@/data/EventsData"

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
    const ev = eventsData.find((e) => e.slug === slug)
    if (!ev) return { title: "Events | Global CXO Circle" }
    return {
        title: ev.metadata?.title || `${ev.title} | Global CXO Circle`,
        description: ev.metadata?.description || ev.description,
    }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    return <EventDetail slug={slug} />
}
