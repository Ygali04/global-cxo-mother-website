export type ResourceItem = {
    id: string
    title: string
    author: string
    coverImage: string
    fileUrl: string
    publishedAt: string
    description: string
}

const resourcesLibrary: ResourceItem[] = [
    {
        id: "cio-circle-workshops-2025-summary",
        title: "Founder's Strategic Playbook for the AI Era",
        author: "Global CXO Circle Research Team",
        coverImage: "/resources/Summary_Report_CIO_Circle_Workshops_2025-pages.jpg",
        fileUrl: "/resources/Summary_Report_CIO_Circle_Workshops_2025.pdf",
        publishedAt: "2025-09-29",
        description:
            "Highlights and actionable insights distilled from our 2025 leadership workshops across regions. This report covers digital transformation playbooks, AI adoption patterns, cybersecurity posture improvements, operating model shifts, and leadership takeaways shared by participating executives.",
    },
]

export default resourcesLibrary
