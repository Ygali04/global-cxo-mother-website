export type GalleryPhoto = {
    thumb: string
    full: string
    alt: string
}

export type EventGallery = {
    slug: string
    title: string
    location: string
    dateRange: string
    coverImage: string
    photos: GalleryPhoto[]
}

const sriLankaFilenames = [
    "GIS_04th_C1-104.jpg",
    "GIS_04th_C1-151.jpg",
    "GIS_04th_C1-377.jpg",
    "GIS_04th_C1-41.jpg",
    "GIS_04th_C1-7.jpg",
    "GIS_05th_EC1-244.jpg",
    "GIS_05th_EC1-326.jpg",
    "GIS_2nd-140.jpg",
    "GIS_2nd-141.jpg",
    "GIS_2nd-193.jpg",
    "GIS_2nd-199.jpg",
    "GIS_2nd-215.jpg",
    "GIS_2nd-240.jpg",
    "GIS_2nd-28.jpg",
    "GIS_2nd-280.jpg",
    "GIS_2nd-285.jpg",
    "GIS_2nd-303.jpg",
    "GIS_2nd-32.jpg",
    "GIS_2nd-356.jpg",
    "GIS_2nd-362.jpg",
    "GIS_2nd-372.jpg",
    "GIS_2nd-377.jpg",
    "GIS_2nd-384.jpg",
    "GIS_2nd-389.jpg",
    "GIS_2nd-412.jpg",
    "GIS_2nd-444.jpg",
    "GIS_2nd-480.jpg",
    "GIS_2nd-500.jpg",
    "GIS_2nd-553.jpg",
    "GIS_2nd-559.jpg",
    "GIS_2nd-656.jpg",
    "GIS_2nd-671.jpg",
    "GIS_2nd-740.jpg",
    "GIS_3rd_C1-134.jpg",
    "GIS_3rd_C1-166.jpg",
    "GIS_3rd_C1-187.jpg",
    "GIS_3rd_C1-232.jpg",
    "GIS_3rd_C1-240.jpg",
    "GIS_3rd_C1-310.jpg",
    "GIS_3rd_C1-316.jpg",
    "GIS_3rd_C1-330.jpg",
    "GIS_3rd_C1-331.jpg",
    "GIS_3rd_C1-346.jpg",
    "GIS_3rd_C1-355.jpg",
    "GIS_3rd_C1-388.jpg",
    "GIS_3rd_C1-393.jpg",
    "GIS_3rd_C1-407.jpg",
    "GIS_3rd_C1-433.jpg",
    "GIS_3rd_C1-460.jpg",
    "GIS_3rd_C1-47.jpg",
    "GIS_3rd_C1-474.jpg",
    "GIS_3rd_C1-482.jpg",
    "GIS_3rd_C1-487.jpg",
    "GIS_3rd_C1-498.jpg",
    "GIS_3rd_C1-645.jpg",
    "GIS_3rd_C1-660.jpg",
    "GIS_3rd_C1-675.jpg",
    "GIS_3rd_C1-677.jpg",
    "GIS_3rd_C1-682.jpg",
    "GIS_3rd_C1-693.jpg",
    "GIS_3rd_C1-703.jpg",
    "GIS_3rd_C1-709.jpg",
    "GIS_5th-503.jpg",
]

const SRI_LANKA_BASE = "/assets/events/SriLanka/photos"

const galleries: EventGallery[] = [
    {
        slug: "sri-lanka-2025",
        title: "Global Innovation Summit 2025",
        location: "Colombo, Sri Lanka",
        dateRange: "September 2–5, 2025",
        coverImage: "/assets/events/SriLanka/venue/colombo-picture.jpg",
        photos: sriLankaFilenames.map((f) => ({
            thumb: `${SRI_LANKA_BASE}/thumbs/${f}`,
            full: `${SRI_LANKA_BASE}/${f}`,
            alt: "Global Innovation Summit 2025 — Colombo, Sri Lanka",
        })),
    },
]

export default galleries
