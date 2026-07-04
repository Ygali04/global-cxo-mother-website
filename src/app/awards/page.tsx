"use client"
import React, { useState } from "react"
import Link from "next/link"
import HeaderFive from "@/layouts/headers/HeaderFive"
import FooterThree from "@/layouts/footers/FooterThree"
import AnimateOnScroll from "@/components/ui/AnimateOnScroll"
import awardsData, { Awardee } from "@/data/AwardsData"

function initialsOf(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
}

function Avatar({ src, name, size, square = false }: { src: string; name: string; size: number; square?: boolean }) {
    const [errored, setErrored] = useState(false)
    const radius = square ? "16px" : "50%"

    if (errored || !src) {
        return (
            <div style={{
                width: size, height: size, borderRadius: radius, flexShrink: 0,
                background: "var(--tg-color-gradient)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: Math.round(size * 0.3), letterSpacing: "0.5px",
            }}>
                {initialsOf(name)}
            </div>
        )
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={name}
            width={size}
            height={size}
            onError={() => setErrored(true)}
            style={{
                width: size, height: size, borderRadius: radius, objectFit: "cover", flexShrink: 0,
            }}
        />
    )
}

function PhotoCover({ src, name, height }: { src: string; name: string; height: number }) {
    const [errored, setErrored] = useState(false)

    if (errored || !src) {
        return (
            <div style={{
                width: "100%", height, background: "var(--tg-color-gradient)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: "34px", letterSpacing: "0.5px",
            }}>
                {initialsOf(name)}
            </div>
        )
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={name}
            onError={() => setErrored(true)}
            style={{ width: "100%", height, objectFit: "cover", objectPosition: "center top", display: "block", transition: "transform 0.4s ease" }}
        />
    )
}

/* Award medal / rosette badge */
const MedalBadge = ({ size = 30 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8.5 2.5 12 7l3.5-4.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="14" r="6" fill="#fff" fillOpacity="0.18" stroke="#fff" strokeWidth="1.6" />
        <path d="M12 11.2l.9 1.85 2.03.29-1.47 1.42.35 2.02L12 15.84l-1.81.94.35-2.02-1.47-1.42 2.03-.29L12 11.2Z" fill="#fff" />
    </svg>
)

const LinkedInIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.11 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.24h4V23h-4V8.24zM8.5 8.24h3.83v2.02h.05c.53-1 1.85-2.06 3.8-2.06 4.06 0 4.82 2.67 4.82 6.14V23h-4v-6.87c0-1.64-.03-3.75-2.29-3.75-2.29 0-2.64 1.79-2.64 3.63V23h-4V8.24z" />
    </svg>
)

const GOLD = "linear-gradient(135deg, #F4C430 0%, #D99A1C 100%)"

function groupByYear(awardees: Awardee[]): [number, Awardee[]][] {
    const map = new Map<number, Awardee[]>()
    for (const a of awardees) {
        if (!map.has(a.year)) map.set(a.year, [])
        map.get(a.year)!.push(a)
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0])
}

function AwardeeModal({ awardee, highlightsLabel, categoryLabel, onClose }: { awardee: Awardee; highlightsLabel: string; categoryLabel: string; onClose: () => void }) {
    return (
        <div onClick={onClose} style={{
            position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(11,26,74,0.6)", backdropFilter: "blur(5px)", padding: "24px",
        }}>
            <div onClick={(e) => e.stopPropagation()} className="award-modal" style={{
                background: "#fff", borderRadius: "22px", maxWidth: "1040px", width: "100%",
                maxHeight: "90vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(0,0,0,0.3)", position: "relative",
            }}>
                {/* Top bar */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "18px 26px", borderBottom: "1px solid #eef0f5",
                    background: "linear-gradient(90deg, rgba(10,60,194,0.04), rgba(179,0,185,0.04))",
                    position: "sticky", top: 0, zIndex: 3, borderRadius: "22px 22px 0 0",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                        <span style={{
                            width: "28px", height: "28px", borderRadius: "50%", background: GOLD,
                            display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            boxShadow: "0 3px 10px rgba(217,154,28,0.4)",
                        }}>
                            <MedalBadge size={17} />
                        </span>
                        <span style={{
                            fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.4px", fontSize: "11.5px",
                            color: "var(--tg-heading-color)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                            {categoryLabel} · {awardee.year}
                        </span>
                    </div>
                    <button onClick={onClose} aria-label="Close" style={{
                        width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                        border: "none", background: "#eef0f5", color: "var(--tg-heading-color)", fontSize: "18px",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        ×
                    </button>
                </div>

                <div className="award-modal-body" style={{ display: "flex", gap: "0", alignItems: "stretch" }}>
                    {/* Left: photo */}
                    <div className="award-modal-photo" style={{
                        flexShrink: 0, width: "340px", padding: "38px 32px",
                        background: "linear-gradient(160deg, #f5f8ff 0%, #eef2fb 100%)",
                        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                        borderRight: "1px solid #eef0f5",
                    }}>
                        <div style={{ position: "relative", marginBottom: "20px" }}>
                            <div style={{ borderRadius: "18px", overflow: "hidden", boxShadow: "0 14px 34px rgba(11,26,74,0.16)", border: "4px solid #fff" }}>
                                <Avatar src={awardee.photo} name={awardee.name} size={252} square />
                            </div>
                            <span style={{
                                position: "absolute", bottom: "12px", left: "12px",
                                background: "rgba(11,26,74,0.82)", color: "#fff", fontWeight: 700, fontSize: "12px",
                                padding: "5px 12px", borderRadius: "8px", letterSpacing: "0.5px",
                            }}>
                                {awardee.year}
                            </span>
                            <span style={{
                                position: "absolute", top: "-10px", right: "-10px",
                                width: "44px", height: "44px", borderRadius: "50%", background: GOLD,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 6px 16px rgba(217,154,28,0.45)", border: "3px solid #fff",
                            }}>
                                <MedalBadge size={22} />
                            </span>
                        </div>
                        <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "4px" }}>
                            {awardee.name}
                        </h3>
                        <p style={{ fontSize: "14px", color: "var(--tg-body-color)", margin: "0 0 4px", fontWeight: 600 }}>
                            {awardee.company}
                        </p>
                        <p style={{ fontSize: "12.5px", color: "#8a90a0", margin: 0 }}>
                            {categoryLabel} Recipient
                        </p>
                        {awardee.linkedin && (
                            <a href={awardee.linkedin} target="_blank" rel="noopener noreferrer" className="award-linkedin-btn" style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "20px",
                                background: "var(--tg-theme-primary)", color: "#fff", fontSize: "14px", fontWeight: 700,
                                textDecoration: "none", padding: "11px 24px", borderRadius: "10px",
                                boxShadow: "0 6px 16px rgba(10,60,194,0.25)", transition: "all 0.3s ease",
                            }}>
                                <LinkedInIcon /> View LinkedIn
                            </a>
                        )}
                    </div>

                    {/* Right: content */}
                    <div style={{ padding: "34px 34px 38px", flex: 1, minWidth: 0 }}>
                        <span style={{
                            background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", fontSize: "11.5px",
                            display: "inline-block", marginBottom: "10px",
                        }}>
                            {awardee.company}
                        </span>
                        <p style={{ fontSize: "15.5px", color: "var(--tg-heading-color)", lineHeight: 1.65, fontStyle: "italic", margin: "0 0 26px", paddingLeft: "14px", borderLeft: "3px solid", borderImage: "var(--tg-color-gradient) 1" }}>
                            &ldquo;{awardee.citation}&rdquo;
                        </p>

                        <div style={{ marginBottom: "28px" }}>
                            <h4 style={{ fontSize: "12.5px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--tg-heading-color)", fontWeight: 700, marginBottom: "16px", paddingLeft: "10px", borderLeft: "3px solid var(--tg-theme-primary)" }}>
                                Key Achievements
                            </h4>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                {awardee.achievements.map((a, i) => (
                                    <li key={i} style={{ display: "flex", gap: "11px", fontSize: "14.5px", color: "var(--tg-body-color)", lineHeight: 1.6, marginBottom: "13px" }}>
                                        <span style={{ flexShrink: 0, width: "7px", height: "7px", borderRadius: "50%", background: GOLD, marginTop: "7px" }} />
                                        {a}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontSize: "12.5px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--tg-heading-color)", fontWeight: 700, marginBottom: "16px", paddingLeft: "10px", borderLeft: "3px solid var(--tg-theme-primary)" }}>
                                {highlightsLabel}
                            </h4>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                {awardee.highlights.map((h, i) => (
                                    <li key={i} style={{ display: "flex", gap: "11px", fontSize: "14.5px", color: "var(--tg-body-color)", lineHeight: 1.6, marginBottom: "13px" }}>
                                        <span style={{ flexShrink: 0, width: "7px", height: "7px", borderRadius: "50%", background: GOLD, marginTop: "7px" }} />
                                        {h}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .award-linkedin-btn:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.08);
                    box-shadow: 0 10px 24px rgba(10,60,194,0.32);
                }
                @media (max-width: 640px) {
                    .award-modal-body {
                        flex-direction: column;
                    }
                    .award-modal-photo {
                        width: 100% !important;
                        border-right: none !important;
                        border-bottom: 1px solid #eef0f5;
                    }
                }
            `}</style>
        </div>
    )
}

const AwardsPage = () => {
    const [activeCategory, setActiveCategory] = useState(awardsData[0].slug)
    const [selected, setSelected] = useState<{ awardee: Awardee; highlightsLabel: string; categoryLabel: string } | null>(null)
    const [catMenuOpen, setCatMenuOpen] = useState(false)

    const category = awardsData.find((c) => c.slug === activeCategory)!

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
                                        Awards
                                    </span>
                                    <h1 style={{ fontSize: "clamp(38px, 5vw, 56px)", fontWeight: 800, color: "var(--tg-heading-color)", marginBottom: "18px", lineHeight: 1.12 }}>
                                        Honoring{" "}
                                        <span style={{ background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Excellence</span>
                                    </h1>
                                    <p style={{ fontSize: "17px", color: "var(--tg-body-color)", lineHeight: 1.7, maxWidth: "640px", margin: "0 auto" }}>
                                        Celebrating the leaders whose careers, innovations, and mentorship have shaped the technology
                                        industry and inspired the next generation of executives.
                                    </p>
                                </AnimateOnScroll>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Category tabs + grid */}
                <section style={{ backgroundColor: "#f8f9fa", padding: "20px 0 120px" }}>
                    <div className="container">
                        {/* Wide screens: inline pill toggle */}
                        <div className="d-flex justify-content-center awards-toggle-pills" style={{ marginBottom: "56px" }}>
                            <div className="awards-toggle" style={{
                                background: "#fff", borderRadius: "100px", padding: "6px",
                                boxShadow: "0 6px 24px rgba(11,26,74,0.08)", display: "flex", gap: "4px",
                                border: "1px solid var(--tg-border-1)",
                            }}>
                                {awardsData.map((c) => (
                                    <button
                                        key={c.slug}
                                        onClick={() => setActiveCategory(c.slug)}
                                        className="awards-toggle-btn"
                                        style={{
                                            border: "none", cursor: "pointer", padding: "9px 18px", borderRadius: "100px",
                                            fontWeight: 700, fontSize: "13px", transition: "all 0.3s ease", whiteSpace: "nowrap",
                                            background: activeCategory === c.slug ? "var(--tg-color-gradient)" : "transparent",
                                            color: activeCategory === c.slug ? "#fff" : "var(--tg-body-color)",
                                            boxShadow: activeCategory === c.slug ? "0 6px 18px rgba(10,60,194,0.28)" : "none",
                                        }}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Phones: dropdown select — click to reveal the category list */}
                        <div className="awards-toggle-select" style={{ position: "relative", maxWidth: "320px", margin: "0 auto 48px" }}>
                            <button
                                onClick={() => setCatMenuOpen((o) => !o)}
                                aria-haspopup="listbox"
                                aria-expanded={catMenuOpen}
                                style={{
                                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
                                    background: "#fff", border: "1px solid var(--tg-border-1)", borderRadius: "12px",
                                    padding: "13px 18px", cursor: "pointer", fontWeight: 700, fontSize: "14px",
                                    color: "var(--tg-heading-color)", boxShadow: "0 4px 18px rgba(11,26,74,0.06)",
                                }}
                            >
                                {category.label}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ transform: catMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.25s ease", color: "var(--tg-theme-primary)" }}>
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>

                            {catMenuOpen && (
                                <>
                                    <div onClick={() => setCatMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                                    <ul role="listbox" style={{
                                        position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 41,
                                        listStyle: "none", margin: 0, padding: "6px", background: "#fff",
                                        border: "1px solid var(--tg-border-1)", borderRadius: "12px",
                                        boxShadow: "0 14px 34px rgba(11,26,74,0.16)",
                                    }}>
                                        {awardsData.map((c) => {
                                            const active = activeCategory === c.slug
                                            return (
                                                <li key={c.slug} role="option" aria-selected={active}>
                                                    <button
                                                        onClick={() => { setActiveCategory(c.slug); setCatMenuOpen(false) }}
                                                        style={{
                                                            width: "100%", textAlign: "left", border: "none", cursor: "pointer",
                                                            padding: "11px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "14px",
                                                            background: active ? "var(--tg-color-gradient)" : "transparent",
                                                            color: active ? "#fff" : "var(--tg-body-color)",
                                                        }}
                                                    >
                                                        {c.label}
                                                    </button>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </>
                            )}
                        </div>

                        <AnimateOnScroll key={`head-${category.slug}`}>
                            <div className="row justify-content-center text-center" style={{ marginBottom: "36px" }}>
                                <div className="col-lg-7">
                                    <span style={{
                                        background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                        fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.4px", fontSize: "12px",
                                        marginBottom: "6px", display: "inline-block",
                                    }}>
                                        {category.tagline}
                                    </span>
                                    <h2 style={{ fontSize: "clamp(24px, 3vw, 30px)", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "0" }}>
                                        {category.label}
                                    </h2>
                                    <p style={{ fontSize: "15.5px", color: "var(--tg-body-color)", lineHeight: 1.7, margin: 0 }}>
                                        {category.description}
                                    </p>
                                </div>
                            </div>
                        </AnimateOnScroll>

                        {groupByYear(category.awardees).map(([year, awardees]) => (
                            <div key={`${category.slug}-${year}`} style={{ marginBottom: "20px" }}>
                                {/* Year header */}
                                <AnimateOnScroll>
                                    <div className="text-center" style={{ marginBottom: "50px" }}>
                                        <h3 style={{
                                            fontSize: "30px", fontWeight: 800, margin: "0 0 10px",
                                            background: GOLD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                            display: "inline-block",
                                        }}>
                                            {year}
                                        </h3>
                                        <div style={{ width: "70px", height: "3px", background: GOLD, borderRadius: "100px", margin: "0 auto" }} />
                                    </div>
                                </AnimateOnScroll>

                                <div className="row row-cols-2 row-cols-md-3 row-cols-lg-6 gutter-y-30 justify-content-center">
                                    {awardees.map((a, i) => (
                                        <div key={`${category.slug}-${a.name}`} className="col">
                                            <AnimateOnScroll delay={0.06 * (i % 4)} className="h-100">
                                                <button
                                                    onClick={() => setSelected({ awardee: a, highlightsLabel: category.highlightsLabel, categoryLabel: category.label })}
                                                    className="award-item"
                                                    style={{
                                                        background: "#fff", borderRadius: "12px", padding: "5px 5px 0", width: "100%", height: "100%",
                                                        border: "1px solid var(--tg-border-1)", boxShadow: "0 4px 20px rgba(11,26,74,0.06)",
                                                        textAlign: "center", cursor: "pointer", position: "relative",
                                                        display: "flex", flexDirection: "column",
                                                        transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
                                                    }}
                                                >
                                                    {/* photo — polaroid top, with seal straddling the seam */}
                                                    <div style={{ position: "relative" }}>
                                                        <div className="award-item-photo" style={{ borderRadius: "8px", overflow: "hidden" }}>
                                                            <PhotoCover src={a.photo} name={a.name} height={200} />
                                                        </div>
                                                        <span className="award-item-seal" style={{
                                                            position: "absolute", bottom: "0", left: "50%", transform: "translate(-50%, 50%)", zIndex: 3,
                                                            width: "40px", height: "40px", borderRadius: "50%", background: "var(--tg-color-gradient)",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            boxShadow: "0 8px 18px rgba(10,60,194,0.35)", border: "3px solid #fff",
                                                            transition: "transform 0.3s ease",
                                                        }}>
                                                            <i className={category.icon} style={{ fontSize: "18px", color: "#fff", lineHeight: 1 }} />
                                                        </span>
                                                    </div>

                                                    {/* caption */}
                                                    <div style={{ padding: "28px 8px 14px" }}>
                                                        <h3 className="award-item-name" style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "3px", lineHeight: 1.3, transition: "color 0.2s ease" }}>
                                                            {a.name}
                                                        </h3>
                                                        <p style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--tg-theme-primary)", margin: 0, lineHeight: 1.4 }}>
                                                            {a.company}
                                                        </p>
                                                    </div>
                                                </button>
                                            </AnimateOnScroll>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section style={{ paddingBottom: "100px", backgroundColor: "#f8f9fa" }}>
                    <div className="container">
                        <AnimateOnScroll>
                            <div style={{
                                background: "linear-gradient(150deg, #0B1A4A 0%, #0A3CC2 100%)",
                                borderRadius: "20px", padding: "clamp(32px, 3vw, 44px) 32px", textAlign: "center",
                                position: "relative", overflow: "hidden",
                            }}>
                                <div style={{
                                    position: "absolute", bottom: "-100px", left: "-60px", width: "360px", height: "360px",
                                    borderRadius: "50%", background: "radial-gradient(circle, rgba(179,0,185,0.3) 0%, rgba(179,0,185,0) 70%)",
                                }} />
                                <div style={{
                                    position: "absolute", top: "-80px", right: "-40px", width: "260px", height: "260px",
                                    borderRadius: "50%", background: "radial-gradient(circle, rgba(244,196,48,0.22) 0%, rgba(244,196,48,0) 70%)",
                                }} />
                                <div style={{ position: "relative", zIndex: 2 }}>
                                    <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 800, color: "#fff", marginBottom: "12px" }}>
                                        Know a Leader Who Deserves Recognition?
                                    </h2>
                                    <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", maxWidth: "560px", margin: "0 auto 28px" }}>
                                        Nominate exceptional technology leaders driving career-long excellence, breakthrough innovation, and lasting industry impact.
                                    </p>
                                    <Link href="/contact" className="nominate-btn" style={{
                                        display: "inline-flex", alignItems: "center", gap: "8px",
                                        background: "#fff", color: "var(--tg-theme-primary)", padding: "14px 34px",
                                        borderRadius: "8px", fontWeight: 700, fontSize: "15px", textDecoration: "none",
                                        transition: "all 0.3s ease",
                                    }}>
                                        Submit a Nomination <span aria-hidden="true">→</span>
                                    </Link>
                                </div>
                            </div>
                        </AnimateOnScroll>
                    </div>
                </section>
            </main>
            <FooterThree />

            {selected && (
                <AwardeeModal
                    awardee={selected.awardee}
                    highlightsLabel={selected.highlightsLabel}
                    categoryLabel={selected.categoryLabel}
                    onClose={() => setSelected(null)}
                />
            )}

            <style jsx>{`
                .award-item:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 22px 50px rgba(11,26,74,0.14) !important;
                    border-color: var(--tg-theme-primary) !important;
                }
                .award-item:hover .award-item-photo img {
                    transform: scale(1.06);
                }
                .award-item:hover .award-item-seal {
                    transform: translate(-50%, 50%) scale(1.12);
                }
                .award-item:hover .award-item-name {
                    color: var(--tg-theme-primary);
                }
                .nominate-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 32px rgba(0,0,0,0.22);
                }
                /* Wide screens use the inline pill toggle; phones use the dropdown select
                   (which reveals the category list on tap) so nothing overflows. */
                .awards-toggle-select {
                    display: none;
                }
                @media (max-width: 575px) {
                    .awards-toggle-pills {
                        display: none !important;
                    }
                    .awards-toggle-select {
                        display: block;
                    }
                }
            `}</style>
        </>
    )
}

export default AwardsPage
