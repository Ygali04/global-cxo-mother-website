"use client"
import Link from "next/link"
import Arrow from "@/components/common/Arrow"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { motion } from "framer-motion"

const Banner = () => {
    return (
        <section className="hero-section" style={{ minHeight: "clamp(760px, 100vh, 1040px)", position: "relative", overflow: "hidden", marginTop: "0" }}>
            {/* Mobile gradient blobs - hidden on desktop, animated on mobile */}
            <div className="mobile-blobs">
                <div className="mobile-blob mobile-blob--1"></div>
                <div className="mobile-blob mobile-blob--2"></div>
                <div className="mobile-blob mobile-blob--3"></div>
                <div className="mobile-blob mobile-blob--4"></div>
            </div>

            <div className="orbit-scene" aria-hidden="true">
                <div className="orbit-core"></div>
                <div className="orbit-ring orbit-ring-one">
                    <span className="planet planet-one"></span>
                </div>
                <div className="orbit-ring orbit-ring-two orbit-reverse">
                    <span className="planet planet-two"></span>
                </div>
                <div className="orbit-ring orbit-ring-three">
                    <span className="planet planet-three"></span>
                </div>
            </div>
            <AuroraBackground className="hero-aurora-wrap" style={{ minHeight: "clamp(760px, 100vh, 1040px)", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <motion.div
                    initial={{ opacity: 0.0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    className="container hero-container" style={{ position: "relative", zIndex: 2 }}
                >
                    <div className="row justify-content-center text-center">
                        <div className="col-lg-10 col-md-10">
                            <div className="hero-content-wrap">
                                <span className="hero-subtitle" style={{
                                    background: "var(--tg-color-gradient)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "2.5px",
                                    fontSize: "12px",
                                    marginBottom: "18px",
                                    display: "inline-block",
                                    padding: "6px 16px",
                                    borderRadius: "20px",
                                    border: "1px solid rgba(10, 60, 194, 0.15)"
                                }}>
                                    ONE GLOBAL ECOSYSTEM
                                </span>
                                <h1 className="hero-title" style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: "1.2", fontWeight: 800, color: "var(--tg-heading-color)", marginBottom: "20px", marginInline: "auto", maxWidth: "800px", textTransform: "none" }}>
                                    <span className="hero-title-line-one">Where CXO Conversations Turn</span>
                                    <span className="hero-title-line-two">Into <span className="hero-title-gradient">Enterprise Outcomes</span></span>
                                </h1>
                                <p className="hero-desc" style={{ fontSize: "16px", color: "var(--tg-body-color)", lineHeight: 1.7, marginBottom: "36px", marginInline: "auto", maxWidth: "600px" }}>
                                    Global CXO Circle is a CXO-led platform that enables structured access to enterprise leaders, advisory engagement, and outcome-driven relationships across a global ecosystem.
                                </p>
                                
                                <div className="hero-btn-group">
                                    <Link href="/apply" className="tg-btn tg-btn-seven hero-btn-main" style={{ padding: "14px 30px", fontSize: "14px", color: "#fff", border: "none" }}>
                                        Request Access <Arrow />
                                    </Link>
                                    <Link href="/circles" className="tg-btn tg-btn-seven hero-btn-main" style={{ padding: "14px 30px", fontSize: "14px", color: "#fff", border: "none" }}>
                                        Explore Circles
                                    </Link>
                                </div>
                                
                                <div className="mt-5" style={{ maxWidth: "680px", marginInline: "auto" }}>
                                    <div className="stats-band">
                                        <div className="stats-item">
                                            <h3 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "2px", background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>500+</h3>
                                            <span style={{ fontSize: "11px", color: "var(--tg-body-color)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 500 }}>CXOs</span>
                                        </div>
                                        <div className="stats-divider d-none d-sm-block"></div>
                                        <div className="stats-item">
                                            <h3 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "2px", background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>40+</h3>
                                            <span style={{ fontSize: "11px", color: "var(--tg-body-color)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 500 }}>Countries</span>
                                        </div>
                                        <div className="stats-divider d-none d-md-block"></div>
                                        <div className="stats-item">
                                            <h3 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "2px", background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: "1.4" }}>Invite-Only</h3>
                                            <span style={{ fontSize: "11px", color: "var(--tg-body-color)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 500 }}>Network</span>
                                        </div>
                                        <div className="stats-divider d-none d-sm-block"></div>
                                        <div className="stats-item">
                                            <h3 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "2px", background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: "1.4" }}>Enterprise-Grade</h3>
                                            <span style={{ fontSize: "11px", color: "var(--tg-body-color)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 500 }}>Engagements</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AuroraBackground>

            {/* Scroll indicator */}
            <div
                onClick={() => {
                    const hero = document.querySelector('.hero-section');
                    if (hero && hero.nextElementSibling) {
                        (hero.nextElementSibling as HTMLElement).scrollIntoView({ behavior: 'smooth' });
                    }
                }}
                style={{
                    position: "absolute",
                    bottom: "32px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    zIndex: 10,
                    opacity: 0.4,
                }}
            >
                <span style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "var(--tg-body-color)",
                }}>Scroll to explore</span>
                <div className="scroll-arrow-bounce" style={{ color: "var(--tg-body-color)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            
            <style jsx>{`
                .hero-section {
                    margin-top: 0;
                    min-height: clamp(760px, 100vh, 1040px);
                }
                .orbit-scene {
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                    pointer-events: none;
                    opacity: 0.52;
                }
                .orbit-core {
                    position: absolute;
                    left: 50%;
                    top: 56%;
                    width: 96px;
                    height: 96px;
                    transform: translate(-50%, -50%);
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(120, 150, 235, 0.22) 0%, rgba(120, 150, 235, 0.08) 45%, rgba(120, 150, 235, 0) 75%);
                    filter: blur(0.2px);
                }
                .orbit-ring {
                    position: absolute;
                    left: 50%;
                    top: 56%;
                    width: var(--orbit-size);
                    height: var(--orbit-size);
                    margin-left: calc(var(--orbit-size) / -2);
                    margin-top: calc(var(--orbit-size) / -2);
                    border-radius: 50%;
                    border: 2px solid var(--orbit-border);
                    animation: orbit-spin var(--orbit-duration) linear infinite;
                    box-shadow:
                        inset 0 0 0 1px rgba(255,255,255,0.05),
                        0 0 24px rgba(10, 60, 194, 0.10);
                }
                .orbit-reverse {
                    animation-name: orbit-spin-reverse;
                }
                .orbit-ring-one {
                    --orbit-size: 400px;
                    --orbit-duration: 22s;
                    --orbit-border: rgba(11, 26, 74, 0.20);
                }
                .orbit-ring-two {
                    --orbit-size: 560px;
                    --orbit-duration: 30s;
                    --orbit-border: rgba(10, 60, 194, 0.22);
                }
                .orbit-ring-three {
                    --orbit-size: 720px;
                    --orbit-duration: 42s;
                    --orbit-border: rgba(159, 181, 237, 0.32);
                }
                .planet {
                    position: absolute;
                    left: 50%;
                    top: -10px;
                    transform: translateX(-50%);
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    box-shadow: 0 0 0 3px rgba(255,255,255,0.14), 0 0 18px rgba(10, 60, 194, 0.25);
                }
                .planet::after {
                    content: "";
                    position: absolute;
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    right: -14px;
                    top: 16px;
                    background: rgba(255,255,255,0.45);
                }
                .planet-one {
                    background: linear-gradient(145deg, #0B1A4A, #0A3CC2);
                }
                .planet-two {
                    background: linear-gradient(145deg, #0A3CC2, #9FB5ED);
                }
                .planet-three {
                    background: linear-gradient(145deg, #9FB5ED, #0B1A4A);
                }
                .scroll-arrow-bounce {
                    animation: scroll-bounce 2s ease-in-out infinite;
                }
                @keyframes scroll-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(6px); }
                }
                @keyframes orbit-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes orbit-spin-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                .hero-btn-group {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: clamp(10px, 1.4vw, 16px);
                    flex-wrap: wrap;
                }
                .hero-btn-main {
                    background: var(--tg-color-gradient) !important;
                    background-image: var(--tg-color-gradient) !important;
                    background-color: transparent !important;
                }
                .hero-btn-main::before {
                    background: var(--tg-color-gradient) !important;
                }
                .hero-btn-main:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(10, 60, 194, 0.24);
                }
                .hero-btn-outline:hover {
                    background: var(--tg-theme-primary) !important;
                    color: #fff !important;
                }
                .stats-band {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    align-items: center;
                    gap: 0;
                    background: rgba(255,255,255,0.7);
                    backdrop-filter: blur(12px);
                    border-radius: 16px;
                    padding: clamp(16px, 2vw, 20px) clamp(16px, 3vw, 32px);
                    border: 1px solid rgba(0,0,0,0.06);
                    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                }
                .stats-item {
                    flex: 1;
                    text-align: center;
                    padding: 4px clamp(8px, 1.5vw, 16px);
                    min-width: 0;
                }
                .stats-divider {
                    width: 1px;
                    height: clamp(28px, 3vw, 36px);
                    background: rgba(0,0,0,0.08);
                }

                .hero-content-wrap {
                    width: 100%;
                    max-width: 920px;
                    margin-inline: auto;
                }

                .hero-subtitle {
                    font-size: clamp(10px, 0.9vw, 12px) !important;
                    padding: clamp(5px, 0.7vw, 6px) clamp(12px, 1.5vw, 16px) !important;
                    letter-spacing: clamp(1.6px, 0.25vw, 2.5px) !important;
                }

                .hero-title {
                    font-size: clamp(30px, 4.2vw, 54px) !important;
                    max-width: min(100%, 860px) !important;
                    margin-bottom: clamp(16px, 2vw, 22px) !important;
                }
                .hero-title-line-one,
                .hero-title-line-two {
                    display: block;
                    white-space: nowrap;
                }
                .hero-title-line-two {
                    margin-top: 2px;
                }
                .hero-title-gradient {
                    background: var(--tg-color-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-desc {
                    font-size: clamp(15px, 1.35vw, 17px) !important;
                    max-width: min(100%, 640px) !important;
                    margin-bottom: clamp(28px, 3vw, 40px) !important;
                }

                .hero-btn-main {
                    padding: clamp(11px, 1.2vw, 14px) clamp(20px, 2.4vw, 30px) !important;
                    font-size: clamp(12px, 0.95vw, 14px) !important;
                }

                .mt-5 {
                    margin-top: clamp(1.25rem, 3vw, 3rem) !important;
                }
                
                /* Mobile Responsive Styles */
                @media (max-width: 991px) {
                    .hero-section {
                        margin-top: 0 !important;
                    }
                    .orbit-scene {
                        opacity: 0.48;
                    }
                    .orbit-core {
                        top: 52%;
                        width: 76px;
                        height: 76px;
                    }
                    .orbit-ring-one {
                        --orbit-size: 340px;
                    }
                    .orbit-ring-two {
                        --orbit-size: 460px;
                    }
                    .orbit-ring-three {
                        --orbit-size: 600px;
                    }
                }
                @media (max-width: 768px) {
                    .hero-section {
                        min-height: 100vh !important;
                        margin-top: 0 !important;
                        background: linear-gradient(160deg, #f0f4ff 0%, #f5f7ff 50%, #f0f2ff 100%);
                    }
                    .orbit-scene {
                        display: block;
                        opacity: 0.3;
                    }
                    .orbit-core {
                        top: 50%;
                        width: 60px;
                        height: 60px;
                    }
                    .orbit-ring {
                        top: 50%;
                    }
                    .orbit-ring-one {
                        --orbit-size: 260px;
                    }
                    .orbit-ring-two {
                        --orbit-size: 360px;
                    }
                    .orbit-ring-three {
                        --orbit-size: 480px;
                    }
                    .planet {
                        width: 9px;
                        height: 9px;
                        box-shadow: 0 0 0 2px rgba(255,255,255,0.14), 0 0 14px rgba(10, 60, 194, 0.22);
                    }
                    .hero-aurora-wrap {
                        min-height: 100vh !important;
                        padding-top: 48px !important;
                        padding-bottom: 32px !important;
                        background: transparent !important;
                    }
                    .hero-content-wrap {
                        padding: 0 6px;
                    }
                     .hero-subtitle {
                        font-size: 10px !important;
                        letter-spacing: 2px !important;
                        margin-bottom: 14px !important;
                        padding: 5px 14px !important;
                        border: 1px solid rgba(10, 60, 194, 0.2) !important;
                        color: #0A3CC2 !important; /* Fallback */
                     }
                     @supports (background-clip: text) or (-webkit-background-clip: text) {
                        .hero-subtitle {
                           background: var(--tg-color-gradient) !important;
                           -webkit-background-clip: text !important;
                           background-clip: text !important;
                           -webkit-text-fill-color: transparent !important;
                        }
                     }
                    .hero-title {
                        font-size: 30px !important;
                        text-align: center !important;
                        max-width: 100% !important;
                        line-height: 1.2 !important;
                        margin-bottom: 16px !important;
                        color: #0f172a !important;
                     }
                     .hero-title .hero-title-gradient {
                        display: inline-block;
                        margin-top: 2px !important;
                        background: var(--tg-color-gradient) !important;
                        -webkit-background-clip: text !important;
                        background-clip: text !important;
                        -webkit-text-fill-color: transparent !important;
                     }
                    .hero-title-line-one,
                    .hero-title-line-two {
                        white-space: normal;
                    }
                    .hero-desc {
                        font-size: 15px !important;
                        margin-bottom: 28px !important;
                        text-align: center !important;
                        color: #475569 !important;
                        line-height: 1.65 !important;
                        padding: 0 8px;
                    }
                    .hero-btn-group {
                        flex-direction: row !important;
                        flex-wrap: nowrap;
                        width: auto;
                        gap: 12px;
                        justify-content: center;
                    }
                    .hero-btn-main {
                        width: auto !important;
                        padding: 12px 22px !important;
                        font-size: 13px !important;
                        white-space: nowrap;
                        border-radius: 10px !important;
                        box-shadow: 0 4px 15px rgba(10, 60, 194, 0.25) !important;
                    }
                    .stats-band {
                        padding: 16px 14px;
                        gap: 0;
                        flex-wrap: nowrap !important;
                        background: rgba(255,255,255,0.85) !important;
                        border: 1px solid rgba(10, 60, 194, 0.08) !important;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.06) !important;
                        border-radius: 14px !important;
                    }
                    .stats-item {
                        flex: 1 1 0 !important;
                        padding: 4px 8px;
                        min-width: 0;
                    }
                    .stats-item h3 {
                        font-size: 20px !important;
                    }
                    .stats-item span {
                        font-size: 9px !important;
                        letter-spacing: 0.5px !important;
                    }
                    .stats-divider {
                        display: block !important;
                        height: 28px;
                        background: rgba(0,0,0,0.06) !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .hero-aurora-wrap {
                        padding-top: 42px !important;
                        padding-bottom: 28px !important;
                    }
                     .hero-title {
                        font-size: 26px !important;
                     }
                     .hero-title .hero-title-gradient {
                        font-size: 28px !important;
                     }
                    .hero-desc {
                        font-size: 14px !important;
                    }
                    .hero-btn-main {
                        padding: 11px 18px !important;
                        font-size: 12px !important;
                    }
                    .stats-band {
                        flex-wrap: wrap !important;
                        gap: 8px 0 !important;
                        padding: 14px 12px !important;
                    }
                    .stats-item {
                        flex: 0 0 50% !important;
                        padding: 6px 4px !important;
                    }
                    .stats-item h3 {
                        font-size: 18px !important;
                    }
                    .stats-divider {
                        display: none !important;
                    }
                }
                
                @media (max-width: 360px) {
                    .hero-aurora-wrap {
                        padding-top: 36px !important;
                    }
                     .hero-title {
                        font-size: 24px !important;
                     }
                     .hero-title .hero-title-gradient {
                        font-size: 26px !important;
                     }
                    .hero-btn-group {
                        flex-direction: column !important;
                        gap: 10px !important;
                    }
                    .hero-btn-main {
                        width: 100% !important;
                        text-align: center;
                        justify-content: center;
                    }
                }
            `}</style>
        </section>
    )
}

export default Banner
