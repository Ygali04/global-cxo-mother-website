"use client"
import React, { useEffect, useMemo, useState, type CSSProperties } from "react"
import HeaderFive from "@/layouts/headers/HeaderFive"
import FooterThree from "@/layouts/footers/FooterThree"
import AnimateOnScroll from "@/components/ui/AnimateOnScroll"
import resourcesLibrary, { ResourceItem } from "@/data/ResourcesData"

/* Same Google Form used by the source site — keeps leads flowing into the same tracking sheet */
const GOOGLE_FORM_URL = "https://docs.google.com/forms/u/0/d/e/1FAIpQLScmHQHJ-nt-wFonlJmhJozSwpLzsfH87GIv8b-oGPxEMN_F8w/formResponse"
const FIELD_MAP = {
    firstName: "entry.1316581783",
    lastName: "entry.370114307",
    company: "entry.2033120551",
    occupation: "entry.1364179664",
    linkedin: "entry.1853145722",
    gmail: "entry.1043305592",
} as const

const STORAGE_KEY = "gcc_resource_download_counts"
const DOWNLOAD_BASELINE = 110

function useDownloadCounts() {
    const [counts, setCounts] = useState<Record<string, number>>({})

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) setCounts(JSON.parse(raw))
        } catch { /* ignore */ }
    }, [])

    const increment = (id: string) => {
        setCounts((prev) => {
            const next = { ...prev, [id]: (prev[id] ?? 0) + 1 }
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
            return next
        })
    }

    return { counts, increment }
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
// Locale-independent so server and client render identically (avoids hydration mismatch).
function formatDate(iso: string) {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

// Locale-independent thousands separator (avoids hydration mismatch from toLocaleString).
function formatCount(n: number) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const CalendarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
)
const DownloadIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
)

const labelStyle: CSSProperties = { display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--tg-heading-color)", marginBottom: "5px" }
const inputStyle: CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--tg-border-1)",
    background: "#fff", fontSize: "14px", color: "var(--tg-heading-color)",
    boxShadow: "0 2px 8px rgba(11,26,74,0.04)", transition: "all 0.3s ease",
}
const errorStyle: CSSProperties = { borderColor: "#DC2626", boxShadow: "0 0 0 3px rgba(220,38,38,0.1)" }
const Required = () => <span style={{ color: "#DC2626" }}> *</span>

type FormState = { firstName: string; lastName: string; company: string; occupation: string; linkedin: string; gmail: string }
const emptyForm: FormState = { firstName: "", lastName: "", company: "", occupation: "", linkedin: "", gmail: "" }

const LINKEDIN_RE = /^(https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[^\s/?#]+\/?|https?:\/\/lnkd\.in\/[^\s/?#]+)$/
const GMAIL_RE = /@(gmail\.com|googlemail\.com)$/i

function ResourceModal({ item, downloads, onClose, onDownloaded }: { item: ResourceItem; downloads: number; onClose: () => void; onDownloaded: () => void }) {
    const [form, setForm] = useState<FormState>(emptyForm)
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, boolean>>>({})
    const [consent, setConsent] = useState(false)
    const [consentError, setConsentError] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const setField = (key: keyof FormState, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: false }))
    }

    const validate = () => {
        const errors: Partial<Record<keyof FormState, boolean>> = {}
        if (!form.firstName.trim()) errors.firstName = true
        if (!form.lastName.trim()) errors.lastName = true
        if (!form.company.trim()) errors.company = true
        if (!form.occupation.trim()) errors.occupation = true
        if (!LINKEDIN_RE.test(form.linkedin.trim())) errors.linkedin = true
        if (!GMAIL_RE.test(form.gmail.trim())) errors.gmail = true
        setFieldErrors(errors)
        const consentOk = consent
        setConsentError(!consentOk)
        return Object.keys(errors).length === 0 && consentOk
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setSubmitting(true)
        try {
            const fd = new FormData()
            fd.append(FIELD_MAP.firstName, form.firstName.trim())
            fd.append(FIELD_MAP.lastName, form.lastName.trim())
            fd.append(FIELD_MAP.company, form.company.trim())
            fd.append(FIELD_MAP.occupation, form.occupation.trim())
            fd.append(FIELD_MAP.linkedin, form.linkedin.trim())
            fd.append(FIELD_MAP.gmail, form.gmail.trim())
            await fetch(GOOGLE_FORM_URL, { method: "POST", mode: "no-cors", body: fd })
        } catch {
            /* no-cors gives no readable response either way — proceed to download */
        } finally {
            setSubmitting(false)
            onDownloaded()
            window.open(item.fileUrl, "_blank", "noopener,noreferrer")
        }
    }

    return (
        <div onClick={onClose} style={{
            position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(11,26,74,0.6)", backdropFilter: "blur(5px)", padding: "24px",
        }}>
            <div onClick={(e) => e.stopPropagation()} className="resource-modal" style={{
                background: "#fff", borderRadius: "20px", maxWidth: "980px", width: "100%",
                maxHeight: "90vh", overflowY: "auto", overflowX: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.3)", position: "relative",
                boxSizing: "border-box",
            }}>
                <button onClick={onClose} aria-label="Close" style={{
                    position: "absolute", top: "16px", right: "16px", zIndex: 3, width: "34px", height: "34px", borderRadius: "50%",
                    border: "none", background: "#f1f5f9", color: "var(--tg-heading-color)", fontSize: "18px",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    ×
                </button>

                <div className="resource-modal-body" style={{ display: "flex", alignItems: "stretch", minWidth: 0 }}>
                    <div className="resource-modal-cover" style={{
                        flexShrink: 0, width: "280px", background: "#eef2fb",
                        display: "flex", alignItems: "center", justifyContent: "center", padding: "36px 30px",
                    }}>
                        <div style={{ width: "100%", maxWidth: "210px", aspectRatio: "3 / 4", borderRadius: "10px", overflow: "hidden", boxShadow: "0 14px 34px rgba(11,26,74,0.18)", flexShrink: 0 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.coverImage} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                    </div>

                    <div style={{ padding: "34px 34px 38px", flex: "1 1 0%", minWidth: 0, boxSizing: "border-box" }}>
                        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--tg-heading-color)", lineHeight: 1.3, marginBottom: "10px" }}>
                            {item.title}
                        </h2>
                        <div style={{ fontSize: "13px", color: "var(--tg-body-color)", marginBottom: "6px" }}>By {item.author}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "12.5px", color: "#8a90a0", marginBottom: "18px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><CalendarIcon /> {formatDate(item.publishedAt)}</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><DownloadIcon /> {formatCount(downloads)} downloads</span>
                        </div>
                        <p style={{ fontSize: "14.5px", color: "var(--tg-body-color)", lineHeight: 1.65, marginBottom: "24px" }}>
                            {item.description}
                        </p>

                        <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "14px" }}>
                            Enter your details to download
                        </p>

                        <form onSubmit={handleSubmit} noValidate style={{ minWidth: 0 }}>
                            <div className="resource-form-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "12px", marginBottom: "12px" }}>
                                <div>
                                    <label style={labelStyle}>First Name<Required /></label>
                                    <input type="text" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)}
                                        placeholder="Jane" style={{ ...inputStyle, ...(fieldErrors.firstName ? errorStyle : {}) }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Last Name<Required /></label>
                                    <input type="text" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)}
                                        placeholder="Doe" style={{ ...inputStyle, ...(fieldErrors.lastName ? errorStyle : {}) }} />
                                </div>
                            </div>
                            <div className="resource-form-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "12px", marginBottom: "12px" }}>
                                <div>
                                    <label style={labelStyle}>Company<Required /></label>
                                    <input type="text" value={form.company} onChange={(e) => setField("company", e.target.value)}
                                        placeholder="Acme Corp" style={{ ...inputStyle, ...(fieldErrors.company ? errorStyle : {}) }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Occupation<Required /></label>
                                    <input type="text" value={form.occupation} onChange={(e) => setField("occupation", e.target.value)}
                                        placeholder="Chief Information Officer" style={{ ...inputStyle, ...(fieldErrors.occupation ? errorStyle : {}) }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: "12px" }}>
                                <label style={labelStyle}>LinkedIn URL<Required /></label>
                                <input type="text" value={form.linkedin} onChange={(e) => setField("linkedin", e.target.value)}
                                    placeholder="https://www.linkedin.com/in/your-profile" style={{ ...inputStyle, ...(fieldErrors.linkedin ? errorStyle : {}) }} />
                            </div>
                            <div style={{ marginBottom: "16px" }}>
                                <label style={labelStyle}>Gmail Address<Required /></label>
                                <input type="email" value={form.gmail} onChange={(e) => setField("gmail", e.target.value)}
                                    placeholder="you@gmail.com" style={{ ...inputStyle, ...(fieldErrors.gmail ? errorStyle : {}) }} />
                            </div>

                            <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", color: "var(--tg-body-color)", cursor: "pointer", marginBottom: "18px", minWidth: 0 }}>
                                <input type="checkbox" checked={consent}
                                    onChange={(e) => { setConsent(e.target.checked); if (consentError) setConsentError(false) }}
                                    style={{
                                        width: "16px", height: "16px", padding: 0, margin: 0, marginTop: "2px",
                                        border: "1px solid var(--tg-border-1)", borderRadius: "4px", background: "#fff",
                                        accentColor: "var(--tg-theme-primary)", flexShrink: 0, cursor: "pointer",
                                    }} />
                                <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                                    I consent to sharing my information with Global CXO Circle for the purpose of accessing this resource.
                                </span>
                            </label>
                            {consentError && (
                                <p style={{ color: "#DC2626", fontSize: "12.5px", marginTop: "-10px", marginBottom: "16px" }}>
                                    Please check the fields highlighted in red and accept the consent statement.
                                </p>
                            )}

                            <button type="submit" disabled={submitting} className="resource-download-btn" style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                background: "var(--tg-color-gradient)", color: "#fff", fontSize: "14.5px", fontWeight: 700,
                                border: "none", padding: "13px 28px", borderRadius: "10px", cursor: submitting ? "default" : "pointer",
                                opacity: submitting ? 0.75 : 1, boxShadow: "0 8px 22px rgba(10,60,194,0.25)", transition: "all 0.3s ease",
                            }}>
                                <DownloadIcon /> {submitting ? "Preparing…" : "Download PDF"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .resource-download-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    filter: brightness(1.06);
                    box-shadow: 0 12px 28px rgba(10,60,194,0.32);
                }
                @media (max-width: 640px) {
                    .resource-modal-body {
                        flex-direction: column;
                    }
                    .resource-modal-cover {
                        width: 100% !important;
                        height: 220px !important;
                    }
                    .resource-form-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    )
}

const ResourcesPage = () => {
    const [active, setActive] = useState<ResourceItem | null>(null)
    const { counts, increment } = useDownloadCounts()

    const sorted = useMemo(
        () => [...resourcesLibrary].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
        []
    )

    return (
        <>
            <HeaderFive />
            <main className="main-area fix">
                {/* Hero */}
                <section style={{ paddingTop: "120px", paddingBottom: "60px", backgroundColor: "#ffffff" }}>
                    <div className="container">
                        <div className="row justify-content-center text-center">
                            <div className="col-lg-8">
                                <AnimateOnScroll>
                                    <span style={{
                                        background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                        fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", fontSize: "12px",
                                        marginBottom: "16px", display: "inline-block",
                                    }}>
                                        Resources
                                    </span>
                                    <h1 style={{ fontSize: "clamp(38px, 5vw, 56px)", fontWeight: 800, color: "var(--tg-heading-color)", marginBottom: "18px", lineHeight: 1.12 }}>
                                        Insights Worth{" "}
                                        <span style={{ background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sharing</span>
                                    </h1>
                                    <p style={{ fontSize: "17px", color: "var(--tg-body-color)", lineHeight: 1.7, maxWidth: "620px", margin: "0 auto" }}>
                                        A curated library of playbooks, reports, and guides published by Global CXO Circle.
                                    </p>
                                </AnimateOnScroll>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Grid */}
                <section style={{ backgroundColor: "#f8f9fa", padding: "20px 0 120px" }}>
                    <div className="container">
                        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 gutter-y-30">
                            {sorted.map((item, i) => {
                                const downloads = DOWNLOAD_BASELINE + (counts[item.id] ?? 0)
                                return (
                                    <div key={item.id} className="col">
                                        <AnimateOnScroll delay={0.06 * i} className="h-100">
                                            <button
                                                onClick={() => setActive(item)}
                                                className="resource-card"
                                                style={{
                                                    background: "#fff", border: "1px solid var(--tg-border-1)", borderRadius: "14px",
                                                    padding: 0, width: "100%", height: "100%", textAlign: "left", cursor: "pointer",
                                                    overflow: "hidden", boxShadow: "0 4px 20px rgba(11,26,74,0.05)",
                                                    transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
                                                    display: "flex", flexDirection: "column",
                                                }}
                                            >
                                                <div style={{ aspectRatio: "3 / 4", position: "relative", overflow: "hidden", background: "#eef2fb" }}>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={item.coverImage} alt={item.title} className="resource-card-img"
                                                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }} />
                                                    <span style={{
                                                        position: "absolute", top: "12px", right: "12px",
                                                        background: "rgba(255,255,255,0.9)", color: "var(--tg-heading-color)",
                                                        fontSize: "10.5px", fontWeight: 700, padding: "4px 9px", borderRadius: "100px",
                                                        textTransform: "uppercase", letterSpacing: "0.5px",
                                                    }}>
                                                        PDF
                                                    </span>
                                                </div>
                                                <div style={{ padding: "18px 18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                                                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--tg-heading-color)", lineHeight: 1.35, marginBottom: "6px" }}>
                                                        {item.title}
                                                    </h3>
                                                    <p style={{ fontSize: "12.5px", color: "var(--tg-body-color)", margin: "0 0 12px" }}>
                                                        {item.author}
                                                    </p>
                                                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "12px", fontSize: "11.5px", color: "#8a90a0" }}>
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><CalendarIcon /> {formatDate(item.publishedAt)}</span>
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><DownloadIcon /> {formatCount(downloads)}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        </AnimateOnScroll>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>
            </main>
            <FooterThree />

            {active && (
                <ResourceModal
                    item={active}
                    downloads={DOWNLOAD_BASELINE + (counts[active.id] ?? 0)}
                    onClose={() => setActive(null)}
                    onDownloaded={() => increment(active.id)}
                />
            )}

            <style jsx>{`
                .resource-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 22px 50px rgba(11,26,74,0.14) !important;
                    border-color: var(--tg-theme-primary) !important;
                }
                .resource-card:hover .resource-card-img {
                    transform: scale(1.05);
                }
            `}</style>
        </>
    )
}

export default ResourcesPage
