"use client"
import React from "react"
import Link from "next/link"
import AnimateOnScroll from "@/components/ui/AnimateOnScroll"

const CalendarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
)
const PinIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
)
const UsersIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
)

const UpcomingEvent = () => {
    return (
        <section className="section-py-130" style={{ backgroundColor: "#fff" }}>
            <div className="container">
                <AnimateOnScroll>
                    <div className="row justify-content-center text-center" style={{ marginBottom: "36px" }}>
                        <div className="col-lg-7">
                            <span style={{
                                background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", fontSize: "12px",
                                marginBottom: "6px", display: "inline-block",
                            }}>
                                Upcoming Events
                            </span>
                            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 700, color: "var(--tg-heading-color)" }}>
                                Join Us at Our Next Gathering
                            </h2>
                        </div>
                    </div>
                </AnimateOnScroll>

                <AnimateOnScroll delay={0.1}>
                    <Link href="/events/mlc-oakland" className="upcoming-event-link" style={{ display: "block", textDecoration: "none", color: "inherit", maxWidth: "560px", margin: "0 auto" }}>
                        <div className="upcoming-event-card" style={{
                            background: "#fff", borderRadius: "20px", overflow: "hidden",
                            border: "1px solid var(--tg-border-1)", boxShadow: "0 6px 28px rgba(11,26,74,0.06)",
                            transition: "all 0.3s ease",
                        }}>
                            {/* Landscape banner across the top (shown in full — it's a banner, not a poster) */}
                            <div style={{ position: "relative", width: "100%", aspectRatio: "1366 / 768", overflow: "hidden", background: "#0b1020" }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/events/mlc_main_banner.webp" alt="MLC T20 Cricket Finals — Saturday, 18 July 2026 at The Oakland Coliseum. 100+ Enterprise CXOs confirmed."
                                    className="upcoming-event-img"
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }} />
                            </div>
                            <div style={{ padding: "clamp(26px, 3.6vw, 42px)" }}>
                                <span style={{
                                    background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                    fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", fontSize: "12px",
                                    marginBottom: "12px", display: "inline-block",
                                }}>
                                    VIP Experience · CXO Networking
                                </span>
                                <h3 style={{ fontSize: "clamp(22px, 2.6vw, 28px)", fontWeight: 700, color: "var(--tg-heading-color)", lineHeight: 1.3, marginBottom: "18px" }}>
                                    Major League Cricket — Season 04 Final
                                </h3>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 26px", marginBottom: "18px" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--tg-body-color)", fontSize: "14.5px" }}>
                                        <span style={{ color: "var(--tg-theme-primary)", display: "flex" }}><CalendarIcon /></span>
                                        Saturday, 18 July 2026 · 4:30 PM
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--tg-body-color)", fontSize: "14.5px" }}>
                                        <span style={{ color: "var(--tg-theme-primary)", display: "flex" }}><PinIcon /></span>
                                        The Oakland Coliseum
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--tg-body-color)", fontSize: "14.5px" }}>
                                        <span style={{ color: "var(--tg-theme-primary)", display: "flex" }}><UsersIcon /></span>
                                        200+ attendees expected
                                    </span>
                                </div>
                                <p style={{ fontSize: "15px", color: "var(--tg-body-color)", lineHeight: 1.7, marginBottom: "24px", maxWidth: "680px" }}>
                                    Join 200+ CXOs and 100+ startups for the T20 Cricket VIP Experience — restaurant-style
                                    hospitality, private balcony seating, and curated 1:1s with enterprise leaders at the season finale.
                                </p>
                                <span className="upcoming-event-cta" style={{
                                    display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--tg-heading-color)",
                                    fontWeight: 700, fontSize: "15px", transition: "gap 0.3s ease",
                                }}>
                                    Learn More <span aria-hidden="true">→</span>
                                </span>
                            </div>
                        </div>
                    </Link>
                </AnimateOnScroll>

                <AnimateOnScroll delay={0.2}>
                    <div className="text-center" style={{ marginTop: "40px" }}>
                        <Link href="/events?tab=past" className="see-past-events-btn" style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            background: "transparent", color: "var(--tg-theme-primary)", border: "1.5px solid var(--tg-theme-primary)",
                            padding: "13px 32px", borderRadius: "100px", fontWeight: 700, fontSize: "15px", textDecoration: "none",
                            transition: "all 0.3s ease",
                        }}>
                            See Past Events <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </AnimateOnScroll>
            </div>

            <style jsx>{`
                .upcoming-event-link:hover .upcoming-event-card {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 48px rgba(11,26,74,0.12) !important;
                    border-color: var(--tg-theme-primary) !important;
                }
                .upcoming-event-link:hover .upcoming-event-img {
                    transform: scale(1.05);
                }
                .upcoming-event-link:hover .upcoming-event-cta {
                    gap: 12px;
                    color: var(--tg-theme-primary);
                }
                .see-past-events-btn:hover {
                    background: var(--tg-color-gradient) !important;
                    color: #fff !important;
                    border-color: transparent !important;
                    box-shadow: 0 8px 22px rgba(10,60,194,0.25);
                }
            `}</style>
        </section>
    )
}

export default UpcomingEvent
