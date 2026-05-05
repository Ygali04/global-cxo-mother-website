"use client"
import Link from "next/link"
import Arrow from "@/components/common/Arrow"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { motion } from "framer-motion"

const Banner = () => {
    return (
        <section className="hero-section" style={{ minHeight: "100vh", position: "relative", overflow: "hidden", marginTop: "-90px" }}>
            {/* Mobile gradient blobs - hidden on desktop, animated on mobile */}
            <div className="mobile-blobs">
                <div className="mobile-blob mobile-blob--1"></div>
                <div className="mobile-blob mobile-blob--2"></div>
                <div className="mobile-blob mobile-blob--3"></div>
                <div className="mobile-blob mobile-blob--4"></div>
            </div>
            <AuroraBackground className="hero-aurora-wrap" style={{ minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                                    Where CXO Conversations Turn Into <span style={{ background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "block", marginTop: "4px" }}>Enterprise Outcomes</span>
                                </h1>
                                <p className="hero-desc" style={{ fontSize: "16px", color: "var(--tg-body-color)", lineHeight: 1.7, marginBottom: "36px", marginInline: "auto", maxWidth: "600px" }}>
                                    Global CXO Circle is a CXO-led platform that enables structured access to enterprise leaders, advisory engagement, and outcome-driven relationships across a global ecosystem.
                                </p>
                                
                                <div className="hero-btn-group">
                                    <Link href="/apply" className="tg-btn tg-btn-seven hero-btn-main" style={{ padding: "14px 30px", fontSize: "14px", background: "var(--tg-color-gradient)", color: "#fff", border: "none" }}>
                                        Request Access <Arrow />
                                    </Link>
                                    <Link href="/circles" className="tg-btn tg-btn-seven hero-btn-main" style={{ padding: "14px 30px", fontSize: "14px", background: "var(--tg-color-gradient)", color: "#fff", border: "none" }}>
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
                                            <h3 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "2px", color: "var(--tg-heading-color)", lineHeight: "1.4" }}>Invite-Only</h3>
                                            <span style={{ fontSize: "11px", color: "var(--tg-body-color)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 500 }}>Network</span>
                                        </div>
                                        <div className="stats-divider d-none d-sm-block"></div>
                                        <div className="stats-item">
                                            <h3 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "2px", color: "var(--tg-heading-color)", lineHeight: "1.4" }}>Enterprise-Grade</h3>
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
                    margin-top: -90px;
                }
                .scroll-arrow-bounce {
                    animation: scroll-bounce 2s ease-in-out infinite;
                }
                @keyframes scroll-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(6px); }
                }
                .hero-btn-group {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                }
                .hero-btn-main {
                    background: linear-gradient(90deg, #0A3CC2 0%, #B300B9 100%) !important;
                }
                .hero-btn-main::before {
                    background: linear-gradient(90deg, #7B1FFF 0%, #B300B9 100%) !important;
                }
                .hero-btn-main:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(123,31,255,0.3);
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
                    padding: 20px 32px;
                    border: 1px solid rgba(0,0,0,0.06);
                    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                }
                .stats-item {
                    flex: 1;
                    text-align: center;
                    padding: 4px 16px;
                }
                .stats-divider {
                    width: 1px;
                    height: 36px;
                    background: rgba(0,0,0,0.08);
                }
                
                /* Mobile Responsive Styles */
                @media (max-width: 991px) {
                    .hero-section {
                        margin-top: 0 !important;
                    }
                }
                @media (max-width: 768px) {
                    .hero-section {
                        min-height: 100vh !important;
                        margin-top: 0 !important;
                        background: linear-gradient(160deg, #f0f4ff 0%, #f5f7ff 50%, #f0f2ff 100%);
                    }
                    .hero-aurora-wrap {
                        min-height: 100vh !important;
                        padding-top: 80px !important;
                        padding-bottom: 40px !important;
                        background: transparent !important;
                    }
                    .hero-content-wrap {
                        padding: 0 4px;
                    }
                    .hero-subtitle {
                        font-size: 10px !important;
                        letter-spacing: 2px !important;
                        margin-bottom: 14px !important;
                        padding: 5px 14px !important;
                        border: 1px solid rgba(10, 60, 194, 0.2) !important;
                        background: linear-gradient(90deg, #0A3CC2, #B300B9) !important;
                        -webkit-background-clip: text !important;
                        -webkit-text-fill-color: transparent !important;
                    }
                    .hero-title {
                        font-size: 30px !important;
                        text-align: center !important;
                        max-width: 100% !important;
                        line-height: 1.2 !important;
                        margin-bottom: 16px !important;
                        color: #0f172a !important;
                        -webkit-text-fill-color: #0f172a !important;
                    }
                    .hero-title span {
                        font-size: 32px !important;
                        margin-top: 2px !important;
                        -webkit-text-fill-color: transparent !important;
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
                        padding: 18px 16px;
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
                    .hero-title {
                        font-size: 26px !important;
                    }
                    .hero-title span {
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
                        padding-top: 70px !important;
                    }
                    .hero-title {
                        font-size: 24px !important;
                    }
                    .hero-title span {
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
