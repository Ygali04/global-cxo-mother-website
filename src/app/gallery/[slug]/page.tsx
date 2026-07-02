import { notFound } from "next/navigation"
import galleries from "@/data/GalleryData"
import GalleryDetail from "@/components/gallery/GalleryDetail"

export function generateStaticParams() {
    return galleries.map((g) => ({ slug: g.slug }))
}

export default async function GalleryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const gallery = galleries.find((g) => g.slug === slug)
    if (!gallery) notFound()

    return <GalleryDetail gallery={gallery} />
}
