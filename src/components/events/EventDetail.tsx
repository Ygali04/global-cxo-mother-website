"use client"
import React, { useMemo, useState } from "react"
import Link from "next/link"
import Marquee from "react-fast-marquee"
import HeaderFive from "@/layouts/headers/HeaderFive"
import FooterThree from "@/layouts/footers/FooterThree"
import eventsData from "@/data/EventsData"
import type { ItineraryItem } from "@/data/itinerary"

/* ---- Icons ---- */
const CalendarIcon = ({ s = 22 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
)
const PinIcon = ({ s = 22 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
)
const UsersIcon = ({ s = 22 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
)
const ArrowIcon = () => <span aria-hidden="true">→</span>

const typeColor = (type: string) => {
    switch (type) {
        case "keynote": case "pitch": return "#7c3aed"
        case "panel": return "#2563eb"
        case "workshop": return "#059669"
        case "networking": case "cocktails": return "#ea580c"
        case "dinner": case "lunch": case "breakfast": return "#d97706"
        case "cultural": return "#ca8a04"
        case "break": case "travel": case "arrival": return "#64748b"
        case "announcements": return "#dc2626"
        default: return "#0A3CC2"
    }
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 style={{ fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 800, color: "var(--tg-heading-color)", marginBottom: "32px" }}>
        {children}
    </h2>
)

function Avatar({ src, name }: { src: string; name: string }) {
    const [err, setErr] = useState(false)
    const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    if (err || !src) {
        return (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--tg-color-gradient)", color: "#fff", fontWeight: 700, fontSize: "28px" }}>
                {initials}
            </div>
        )
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} onError={() => setErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
}

const ItineraryRow = ({ item }: { item: ItineraryItem }) => {
    const [open, setOpen] = useState(false)
    const color = typeColor(item.type)
    return (
        <div style={{ background: "#fff", borderRadius: "12px", padding: "20px 22px", borderLeft: `4px solid ${color}`, boxShadow: "0 2px 10px rgba(11,26,74,0.05)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                <span style={{ background: "rgba(10,60,194,0.08)", color: "var(--tg-theme-primary)", padding: "6px 12px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {item.time}
                </span>
                <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                        <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--tg-heading-color)", margin: 0 }}>{item.title}</h3>
                        <span style={{ background: color, color: "#fff", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, textTransform: "capitalize" }}>
                            {item.type}
                        </span>
                    </div>
                    {item.type !== "break" && item.type !== "announcements" && item.description && (
                        <p style={{ margin: "8px 0 0", fontSize: "14px", color: "var(--tg-body-color)", lineHeight: 1.6 }}
                            dangerouslySetInnerHTML={{ __html: item.description }} />
                    )}
                    {item.subEvents && item.subEvents.length > 0 && (
                        <div style={{ marginTop: "14px" }}>
                            <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--tg-theme-primary)", fontWeight: 700, fontSize: "13.5px", padding: 0 }}>
                                {open ? "− Hide" : "+ View"} Detailed Timeline ({item.subEvents.length})
                            </button>
                            {open && (
                                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px", borderLeft: "2px solid rgba(10,60,194,0.2)", paddingLeft: "16px" }}>
                                    {item.subEvents.map((se, i) => (
                                        <div key={i} style={{ background: "#f7f8fc", borderRadius: "10px", padding: "12px 14px" }}>
                                            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", flexWrap: "wrap" }}>
                                                <span style={{ background: "rgba(10,60,194,0.12)", color: "var(--tg-theme-primary)", padding: "3px 8px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, whiteSpace: "nowrap" }}>{se.time}</span>
                                                <div style={{ flex: 1, minWidth: "160px" }}>
                                                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--tg-heading-color)", margin: "0 0 4px" }}>{se.title}</h4>
                                                    {se.description && <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "var(--tg-body-color)", lineHeight: 1.55 }}>{se.description}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const EventDetail = ({ slug }: { slug: string }) => {
    const event = eventsData.find((e) => e.slug === slug)

    const [overviewExpanded, setOverviewExpanded] = useState(false)
    const [activeDay, setActiveDay] = useState(0)
    const [showMap, setShowMap] = useState(false)
    const [showAllSpeakers, setShowAllSpeakers] = useState(false)
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

    const SPEAKERS_INITIAL = 9 // 3 rows of 3 on desktop

    const grouped = useMemo(() => {
        const acc: Record<string, ItineraryItem[]> = {}
        event?.itinerary?.forEach((it) => {
            ; (acc[it.date] ||= []).push(it)
        })
        return acc
    }, [event])
    const days = Object.keys(grouped)

    if (!event) {
        return (
            <>
                <HeaderFive />
                <main className="main-area fix" style={{ paddingTop: "160px", paddingBottom: "160px", textAlign: "center" }}>
                    <div className="container">
                        <h1 style={{ color: "var(--tg-heading-color)", marginBottom: "16px" }}>Event not found</h1>
                        <Link href="/events" style={{ color: "var(--tg-theme-primary)", fontWeight: 700 }}>← Back to Events</Link>
                    </div>
                </main>
                <FooterThree />
            </>
        )
    }

    const overviewText = overviewExpanded || event.overview.length <= 320
        ? event.overview
        : `${event.overview.substring(0, 320)}...`

    return (
        <>
            <HeaderFive />
            <main className="main-area fix">
                {/* Hero */}
                <section className="event-hero" style={{ position: "relative", overflow: "hidden" }}>
                    <picture className="event-hero-pic">
                        {event.heroImageMobile && (
                            <source media="(max-width: 991px)" srcSet={event.heroImageMobile} />
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={event.heroImage} alt={event.title} className="event-hero-img" />
                    </picture>
                    <div className="event-hero-overlay" />
                    {/* light top scrim: fades the image into the page bg so the dark navbar stays legible */}
                    <div className="event-hero-scrim" />
                    <div className="event-hero-content">
                      <div className="container">
                        <div style={{ maxWidth: "820px", color: "#fff" }}>
                            <h1 style={{ fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 800, color: "#fff", lineHeight: 1.12, marginBottom: "16px" }}>
                                {event.title}
                            </h1>
                            {event.tagline && (
                                <p style={{ fontSize: "clamp(16px, 2vw, 21px)", color: "rgba(255,255,255,0.9)", marginBottom: "22px" }}>{event.tagline}</p>
                            )}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "22px", fontSize: "16px", color: "rgba(255,255,255,0.95)" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "9px" }}><CalendarIcon s={20} />{event.date}</span>
                                <span style={{ display: "flex", alignItems: "center", gap: "9px" }}><PinIcon s={20} />{event.location}</span>
                                <span style={{ display: "flex", alignItems: "center", gap: "9px" }}><UsersIcon s={20} />{event.attendees} attendees{event.registrationOpen ? " expected" : ""}</span>
                            </div>
                        </div>
                      </div>
                    </div>
                </section>

                <div className="container" style={{ paddingTop: "80px", paddingBottom: "40px" }}>
                    {/* Overview */}
                    <div style={{ marginBottom: "80px" }}>
                        <SectionTitle>Overview</SectionTitle>
                        <p style={{ fontSize: "17px", color: "var(--tg-body-color)", lineHeight: 1.8, maxWidth: "980px" }}>{overviewText}</p>
                        {event.overview.length > 320 && (
                            <button onClick={() => setOverviewExpanded(!overviewExpanded)} style={{ marginTop: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--tg-theme-primary)", fontWeight: 700, fontSize: "15px", padding: 0 }}>
                                {overviewExpanded ? "Read Less ↑" : "Read More ↓"}
                            </button>
                        )}
                    </div>

                    {/* Sponsors */}
                    {event.sponsors && event.sponsors.length > 0 && (
                        <div style={{ marginBottom: "80px" }}>
                            <SectionTitle>Partners</SectionTitle>
                            <Marquee gradient={false} speed={40} pauseOnHover>
                                {event.sponsors.map((s, i) => (
                                    <div key={i} style={{ margin: "0 42px", height: "130px", display: "flex", alignItems: "center" }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={s.logo} alt={s.name} style={{ maxHeight: "100px", maxWidth: "230px", objectFit: "contain" }} />
                                    </div>
                                ))}
                            </Marquee>
                        </div>
                    )}

                    {/* Highlights */}
                    {event.highlightCards && event.highlightCards.length > 0 && (
                        <div style={{ marginBottom: "80px" }}>
                            <SectionTitle>Highlights</SectionTitle>
                            <div className="row gutter-y-24 justify-content-center">
                                {event.highlightCards.map((h, i) => (
                                    <div key={i} className="col-lg-3 col-md-6">
                                        <div className="detail-hl-card" style={{ background: "#fff", borderRadius: "16px", padding: "28px 22px", textAlign: "center", height: "100%", border: "1px solid var(--tg-border-1)", boxShadow: "0 4px 18px rgba(11,26,74,0.05)", transition: "all 0.3s ease" }}>
                                            <div style={{ height: "84px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={h.icon} alt={h.title} style={{ width: "72px", height: "72px", objectFit: "contain" }} />
                                            </div>
                                            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "8px" }}>{h.title}</h3>
                                            <p style={{ fontSize: "14px", color: "var(--tg-body-color)", lineHeight: 1.6, margin: 0 }}>{h.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Livestream */}
                    {event.livestreamUrl && (
                        <div style={{ marginBottom: "80px" }}>
                            <SectionTitle>Live Stream</SectionTitle>
                            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 40px rgba(11,26,74,0.12)" }}>
                                <iframe src={event.livestreamUrl} title="Live stream" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen
                                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }} />
                            </div>
                        </div>
                    )}

                    {/* Speakers */}
                    {event.speakers && event.speakers.length > 0 && (
                        <div style={{ marginBottom: "80px" }}>
                            <SectionTitle>Speakers</SectionTitle>
                            <div className="row gutter-y-30">
                                {(showAllSpeakers ? event.speakers : event.speakers.slice(0, SPEAKERS_INITIAL)).map((sp, i) => (
                                    <div key={i} className="col-lg-4 col-md-6">
                                        <div className="detail-speaker-card" style={{ background: "#fff", borderRadius: "16px", padding: "30px 24px", textAlign: "center", height: "100%", border: "1px solid var(--tg-border-1)", boxShadow: "0 4px 18px rgba(11,26,74,0.05)", transition: "all 0.3s ease" }}>
                                            <div style={{ width: "116px", height: "116px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 18px", border: "4px solid #eef2fb", boxShadow: "0 6px 18px rgba(11,26,74,0.12)" }}>
                                                <Avatar src={sp.image} name={sp.name} />
                                            </div>
                                            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "6px" }}>{sp.name}</h3>
                                            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--tg-theme-primary)", marginBottom: "4px" }}>{sp.title}</p>
                                            <p style={{ fontSize: "13.5px", color: "var(--tg-body-color)", margin: 0 }}>{sp.company}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {event.speakers.length > SPEAKERS_INITIAL && (
                                <div style={{ textAlign: "center", marginTop: "44px" }}>
                                    <button onClick={() => setShowAllSpeakers(!showAllSpeakers)} className="show-more-btn" style={{
                                        background: "transparent", color: "var(--tg-theme-primary)", border: "1.5px solid var(--tg-theme-primary)",
                                        padding: "13px 32px", borderRadius: "100px", fontWeight: 700, fontSize: "15px", cursor: "pointer",
                                        display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.3s ease",
                                    }}>
                                        {showAllSpeakers ? "Show less" : `Show all ${event.speakers.length} speakers`}
                                        <span aria-hidden="true">{showAllSpeakers ? "↑" : "↓"}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Agenda */}
                    {days.length > 0 && (
                        <div style={{ marginBottom: "80px" }}>
                            <SectionTitle>Agenda</SectionTitle>
                            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px", marginBottom: "44px" }}>
                                {days.map((day, i) => (
                                    <button key={day} onClick={() => setActiveDay(i)} style={{
                                        border: "none", cursor: "pointer", padding: "10px 22px", borderRadius: "100px", fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap", transition: "all 0.3s ease",
                                        background: activeDay === i ? "var(--tg-color-gradient)" : "rgba(10,60,194,0.08)",
                                        color: activeDay === i ? "#fff" : "var(--tg-theme-primary)",
                                        boxShadow: activeDay === i ? "0 6px 18px rgba(10,60,194,0.25)" : "none",
                                    }}>
                                        {day}
                                    </button>
                                ))}
                            </div>
                            {(() => {
                                const dayItems = grouped[days[activeDay]] || []
                                const parts: { label: string; items: ItineraryItem[] }[] = [
                                    { label: "Morning", items: dayItems.filter((x) => x.timeOfDay === "morning") },
                                    { label: "Afternoon", items: dayItems.filter((x) => x.timeOfDay === "afternoon") },
                                    { label: "Evening", items: dayItems.filter((x) => x.timeOfDay === "evening") },
                                ]
                                return (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {parts.map((part) => {
                                            const key = `${activeDay}-${part.label}`
                                            const isOpen = !!openGroups[key]
                                            const hasEvents = part.items.length > 0
                                            return (
                                                <div key={part.label} style={{
                                                    border: "1px solid var(--tg-border-1)", borderRadius: "14px", overflow: "hidden",
                                                    background: isOpen && hasEvents ? "#f7f8fc" : "#fff", transition: "background 0.3s ease",
                                                }}>
                                                    <button
                                                        onClick={() => hasEvents && setOpenGroups((p) => ({ ...p, [key]: !p[key] }))}
                                                        disabled={!hasEvents}
                                                        aria-expanded={isOpen && hasEvents}
                                                        style={{
                                                            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
                                                            padding: "20px 24px", background: "transparent", border: "none", textAlign: "left",
                                                            cursor: hasEvents ? "pointer" : "default",
                                                        }}
                                                    >
                                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                            <span style={{ fontSize: "19px", fontWeight: 800, color: hasEvents ? "var(--tg-heading-color)" : "#9aa0ad" }}>{part.label}</span>
                                                            <span style={{ background: "rgba(10,60,194,0.08)", color: "var(--tg-theme-primary)", padding: "3px 12px", borderRadius: "100px", fontSize: "12.5px", fontWeight: 700 }}>
                                                                {part.items.length} {part.items.length === 1 ? "event" : "events"}
                                                            </span>
                                                        </div>
                                                        {hasEvents && (
                                                            <span style={{
                                                                flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
                                                                background: isOpen ? "var(--tg-color-gradient)" : "rgba(10,60,194,0.08)", color: isOpen ? "#fff" : "var(--tg-theme-primary)",
                                                                transform: isOpen ? "rotate(45deg)" : "none", transition: "all 0.3s ease",
                                                            }}>+</span>
                                                        )}
                                                    </button>
                                                    {hasEvents && isOpen && (
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "4px 20px 22px" }}>
                                                            {part.items.map((item, i) => (
                                                                <ItineraryRow key={i} item={item} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })()}
                        </div>
                    )}

                    {/* Banner */}
                    {event.bannerImage && (
                        <div style={{ marginBottom: "80px", maxWidth: "1000px", margin: "0 auto 80px" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={event.bannerImage} alt={`${event.title} banner`} style={{ width: "100%", borderRadius: "18px", boxShadow: "0 10px 40px rgba(11,26,74,0.12)" }} />
                        </div>
                    )}

                    {/* Venue */}
                    {event.venue && (
                        <div style={{ marginBottom: "80px" }}>
                            <SectionTitle>Venue</SectionTitle>
                            <div style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 40px rgba(11,26,74,0.08)", border: "1px solid var(--tg-border-1)", maxWidth: "1000px", margin: "0 auto" }}>
                                {showMap && event.venue.mapEmbedUrl ? (
                                    <div style={{ position: "relative", height: "460px" }}>
                                        <button onClick={() => setShowMap(false)} style={{ position: "absolute", top: "14px", right: "14px", zIndex: 5, background: "#fff", border: "none", borderRadius: "100px", padding: "8px 16px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.15)", color: "var(--tg-heading-color)" }}>✕ Close</button>
                                        <iframe src={event.venue.mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={event.venue.name} />
                                    </div>
                                ) : (
                                    <div className="row g-0">
                                        <div className="col-md-7" style={{ minHeight: "360px", position: "relative" }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={event.venue.image} alt={event.venue.name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                                        </div>
                                        <div className="col-md-5" style={{ padding: "40px 32px", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", background: "linear-gradient(180deg,#fbfcff,#fff)" }}>
                                            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "var(--tg-color-gradient)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                                                <PinIcon s={26} />
                                            </div>
                                            <h3 style={{ fontSize: "22px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "10px" }}>{event.venue.name}</h3>
                                            <p style={{ fontSize: "13.5px", color: "#8a90a0", marginBottom: "14px" }}>{event.venue.address}</p>
                                            <p style={{ fontSize: "14px", color: "var(--tg-body-color)", lineHeight: 1.7, marginBottom: event.venue.mapEmbedUrl ? "26px" : 0 }}>{event.venue.description}</p>
                                            {event.venue.mapEmbedUrl && (
                                                <button onClick={() => setShowMap(true)} className="venue-map-btn" style={{ background: "var(--tg-color-gradient)", color: "#fff", border: "none", padding: "13px 26px", borderRadius: "100px", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center", transition: "all 0.3s ease" }}>
                                                    Show on Map <ArrowIcon />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Back to events */}
                <section style={{ paddingBottom: "100px" }}>
                    <div className="container" style={{ textAlign: "center" }}>
                        <Link href="/events" className="back-to-events-btn" style={{
                            display: "inline-flex", alignItems: "center", gap: "10px",
                            background: "var(--tg-color-gradient)", color: "#fff", padding: "15px 36px",
                            borderRadius: "100px", fontWeight: 700, fontSize: "15px", textDecoration: "none",
                            boxShadow: "0 10px 30px rgba(10,60,194,0.22)", transition: "all 0.3s ease",
                        }}>
                            <span aria-hidden="true">←</span> Back to all events
                        </Link>
                    </div>
                </section>
            </main>
            <FooterThree />

            <style jsx>{`
                /* Hero: mobile shows the image at its natural aspect; desktop fills the screen */
                .event-hero { height: auto; }
                .event-hero-pic { display: block; width: 100%; line-height: 0; }
                .event-hero-img { display: block; width: 100%; height: auto; }
                .event-hero-overlay {
                    position: absolute; inset: 0; pointer-events: none;
                    background: linear-gradient(to top, rgba(6,12,34,0.92) 0%, rgba(6,12,34,0.55) 42%, rgba(6,12,34,0) 78%);
                }
                .event-hero-scrim {
                    position: absolute; top: 0; left: 0; right: 0; height: 150px; pointer-events: none;
                    background: linear-gradient(to bottom, #f8f9fa 0%, rgba(248,249,250,0.6) 42%, rgba(248,249,250,0) 100%);
                }
                .event-hero-content { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding-bottom: 42px; }
                @media (min-width: 992px) {
                    .event-hero { height: 100vh; }
                    .event-hero-pic { position: absolute; inset: 0; height: 100%; }
                    .event-hero-img { height: 100%; object-fit: cover; object-position: center; }
                    .event-hero-content { padding-bottom: 64px; }
                }
                .detail-hl-card:hover, .detail-speaker-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 18px 40px rgba(11,26,74,0.12) !important;
                    border-color: var(--tg-theme-primary) !important;
                }
                .venue-map-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(0,0,0,0.18); }
                .back-to-events-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(10,60,194,0.3); filter: brightness(1.05); }
                .show-more-btn:hover { background: var(--tg-color-gradient) !important; color: #fff !important; border-color: transparent !important; box-shadow: 0 8px 22px rgba(10,60,194,0.25); }
            `}</style>
        </>
    )
}

export default EventDetail
