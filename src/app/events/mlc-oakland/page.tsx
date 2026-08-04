"use client"
import React from "react"
import Header from "@/layouts/headers/Header"
import Footer from "@/layouts/footers/Footer"
import Image from "next/image"

// ponytail: single hardcoded event page. Make /events a list + data file only when there's a 2nd event.
// Direct registration URL (was a bit.ly short link, whose interstitial showed a
// confusing "redirect in 8 seconds" page before landing here).
const REGISTER_URL = "https://withjoy.com/GCxO-July182026/registration"

const perks = [
    "Private Club level access",
    "Restaurant-style hospitality",
    "Food, beer & wine included",
    "Premium balcony seating",
    "Legends meet & greet + trophy photo",
]

const agenda = [
    { time: "2:45 PM", title: "Arrival, Parking & Check-In", desc: "Gates open. Collect VIP credentials & wristbands." },
    { time: "3:00 PM", title: "Pre-Event VIP Reception", desc: "Food, beer & wine. Restaurant-style hospitality, Private Club Level. Startup introductions & curated 1:1s with CXOs." },
    { time: "4:30 PM", title: "T20 Final — Private Balcony Seating", desc: "TVs + glass windows overlooking the field. Premium seating." },
    { time: "Post-Match", title: "Legends Meet & Greet + Trophy Photo", desc: "Connect with legends, photos, celebrate the finale." },
]

const RegisterBtn = ({ style }: { style?: React.CSSProperties }) => (
    <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer"
        className="tg-btn tg-btn-seven"
        style={{ background: "var(--tg-color-gradient)", color: "#fff", border: "none", padding: "14px 34px", fontSize: "15px", ...style }}>
        Register Now
    </a>
)

const page = () => {
    return (
        <>
            <Header />
            <main className="main-area fix">
                <section style={{ padding: "140px 0 60px", background: "linear-gradient(160deg, #f0f4ff 0%, #f5f7ff 50%, #eef1ff 100%)" }}>
                    <div className="container">
                        <div className="row align-items-center" style={{ rowGap: "40px" }}>
                            <div className="col-lg-6">
                                <span style={{
                                    background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                    fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", fontSize: "12px",
                                    display: "inline-block", padding: "6px 16px", borderRadius: "20px", border: "1px solid rgba(10,60,194,0.15)", marginBottom: "20px"
                                }}>
                                    VIP Experience · CXO Networking
                                </span>
                                <h1 style={{ fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 800, lineHeight: 1.15, color: "var(--tg-heading-color)", marginBottom: "18px" }}>
                                    Major League Cricket — <span style={{ background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Season 04 Final</span>
                                </h1>
                                <p style={{ fontSize: "17px", color: "var(--tg-body-color)", lineHeight: 1.7, marginBottom: "24px", maxWidth: "560px" }}>
                                    Join 200+ CXOs and 100+ startups for the T20 Cricket VIP Experience — restaurant-style
                                    hospitality, private balcony seating, and curated 1:1s with enterprise leaders at the season finale.
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "30px" }}>
                                    <div style={{ fontSize: "16px", color: "var(--tg-heading-color)", fontWeight: 600 }}>📅 Saturday, 18 July 2026 · 4:30 PM</div>
                                    <div style={{ fontSize: "16px", color: "var(--tg-heading-color)", fontWeight: 600 }}>📍 The Oakland Coliseum</div>
                                </div>
                                <RegisterBtn />
                            </div>
                            <div className="col-lg-6">
                                <Image src="/events/mlc_main_banner.webp"
                                    alt="MLC T20 Cricket Finals — Platinum Sponsors Atomicwork, DevRev & Mactores. Saturday, 18 July 2026 at 4:30 PM, The Oakland Coliseum. 100+ Enterprise CXOs confirmed."
                                    width={1366} height={768} priority
                                    style={{ width: "100%", height: "auto", borderRadius: "16px", boxShadow: "0 20px 60px rgba(11,26,74,0.18)", display: "block" }} />
                            </div>
                        </div>
                    </div>
                </section>

                <section style={{ padding: "60px 0" }}>
                    <div className="container">
                        <div className="row" style={{ rowGap: "40px" }}>
                            <div className="col-lg-5">
                                <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "24px", color: "var(--tg-heading-color)" }}>What&apos;s included</h2>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                                    {perks.map((p) => (
                                        <li key={p} style={{ display: "flex", gap: "12px", alignItems: "flex-start", fontSize: "16px", color: "var(--tg-body-color)" }}>
                                            <span style={{ color: "#0A3CC2", fontWeight: 800 }}>✓</span> {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="col-lg-7">
                                <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "24px", color: "var(--tg-heading-color)" }}>Agenda</h2>
                                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                                    {agenda.map((a) => (
                                        <div key={a.time} style={{ display: "flex", gap: "18px", background: "#fff", border: "1px solid var(--tg-border-1)", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 4px 18px rgba(11,26,74,0.05)" }}>
                                            <div style={{ minWidth: "90px", fontWeight: 800, color: "#0A3CC2", fontSize: "15px" }}>{a.time}</div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "4px" }}>{a.title}</div>
                                                <div style={{ fontSize: "14px", color: "var(--tg-body-color)", lineHeight: 1.6 }}>{a.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="text-center" style={{ marginTop: "64px" }}>
                            <Image src="/events/sponsors.webp"
                                alt="Startup sponsors (Atomicwork, DevRev, Mactores, Linen, Manifestit, NopalCyber, Trupeer, CurieTech AI, Hivel) and 40+ confirmed enterprise CXOs, plus the T20 Cricket VIP Experience agenda"
                                width={1366} height={768}
                                style={{ width: "100%", maxWidth: "1140px", height: "auto", borderRadius: "16px", boxShadow: "0 16px 50px rgba(11,26,74,0.14)", display: "inline-block" }} />
                        </div>

                        <div className="text-center" style={{ marginTop: "50px" }}>
                            <RegisterBtn />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}

export default page
