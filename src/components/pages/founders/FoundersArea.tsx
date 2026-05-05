"use client"
import Image from "next/image"
import Link from "next/link"
import Arrow from "@/components/common/Arrow"

const value_props = [
    {
        icon: "flaticon-handshake",
        title: "Hands-On Partnership",
        desc: "We don't just invest — we embed ourselves into your journey. Strategy, product, GTM — we're in the trenches with you.",
        color: "#0A3CC2",
    },
    {
        icon: "flaticon-partner",
        title: "Network That Opens Doors",
        desc: "Access a curated network of operators, investors, and domain experts that accelerates your path to market leadership.",
        color: "#1565C0",
    },
    {
        icon: "flaticon-growth",
        title: "Breakthrough to Scale",
        desc: "Our framework is designed to take you from breakthrough to scale — with structured capital and operational firepower.",
        color: "#2E7D32",
    },
];

const FoundersArea = () => {
    return (
        <>
            {/* Hero Section */}
            <section className="page-hero-section" style={{
                backgroundColor: "#F4F6F8",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Animated gradient orbs */}
                <div style={{
                    position: "absolute", top: "-20%", right: "-10%",
                    width: "600px", height: "600px",
                    background: "radial-gradient(circle, rgba(0,71,255,0.15) 0%, transparent 70%)",
                    borderRadius: "50%", pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", bottom: "-30%", left: "-5%",
                    width: "400px", height: "400px",
                    background: "radial-gradient(circle, rgba(0,71,255,0.08) 0%, transparent 70%)",
                    borderRadius: "50%", pointerEvents: "none",
                }} />

                <div className="container" style={{ position: "relative", zIndex: 2 }}>
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-50 mb-lg-0">
                            <span style={{
                                color: "var(--tg-theme-primary)", fontWeight: 600,
                                textTransform: "uppercase", letterSpacing: "3px",
                                fontSize: "13px", display: "inline-block", marginBottom: "20px",
                            }}>For Founders</span>
                            <h1 style={{
                                fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800,
                                color: "#1A1A1A", letterSpacing: "-1.5px", lineHeight: 1.1,
                                marginBottom: "28px",
                            }}>
                                Build With Those Who&apos;ve Been{" "}
                                <span style={{ color: "var(--tg-theme-primary)" }}>in the Arena</span>
                            </h1>
                            <p style={{
                                fontSize: "18px", color: "#555",
                                lineHeight: 1.75, marginBottom: "36px", maxWidth: "520px",
                            }}>
                                At 100exNextGen, we don&apos;t just write cheques — we roll up our sleeves alongside you. If you&apos;re a founder who believes your company can define a category, reshape an industry, or solve a problem the world hasn&apos;t caught up to yet, this is your circle.
                            </p>
                            <Link href="/#contact" className="tg-btn tg-btn-seven">
                                Apply Now <Arrow />
                            </Link>
                        </div>
                        <div className="col-lg-6">
                            <div style={{ position: "relative" }}>
                                <div className="founders-hero-img" style={{
                                    position: "relative", width: "100%",
                                    overflow: "hidden",
                                    boxShadow: "0 40px 80px rgba(0,0,0,0.1)",
                                }}>
                                    <Image
                                        src="/founders-hero.jpg"
                                        alt="Founders collaborating"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        style={{ objectFit: "cover" }}
                                        priority
                                    />
                                    <div style={{
                                        position: "absolute", inset: 0,
                                        background: "linear-gradient(to top, rgba(10,15,28,0.5), transparent 60%)",
                                    }} />
                                </div>
                                {/* Floating badge */}
                                <div style={{
                                    position: "absolute", bottom: "30px", left: "-20px",
                                    background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)",
                                    padding: "20px 28px", borderRadius: "16px",
                                    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                                    display: "flex", alignItems: "center", gap: "14px", zIndex: 3,
                                }}>
                                    <div style={{
                                        width: "48px", height: "48px", background: "rgba(0,71,255,0.1)",
                                        borderRadius: "50%", display: "flex", alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                        <i className="flaticon-startup" style={{ color: "var(--tg-theme-primary)", fontSize: "22px" }}></i>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: "24px", fontWeight: 800, color: "#1A1A1A", display: "block", lineHeight: 1 }}>100x</span>
                                        <span style={{ fontSize: "11px", color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Growth Potential</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Proposition Section */}
            <section style={{ backgroundColor: "#fff", padding: "100px 0", position: "relative" }}>
                <div className="container">
                    <div className="row justify-content-center" style={{ marginBottom: "60px" }}>
                        <div className="col-lg-7 text-center">
                            <span style={{
                                color: "var(--tg-theme-primary)", fontWeight: 600,
                                textTransform: "uppercase", letterSpacing: "2px",
                                fontSize: "13px", display: "inline-block", marginBottom: "12px",
                            }}>What You Get</span>
                            <h2 style={{
                                fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800,
                                color: "#1A1A1A", marginBottom: "16px", letterSpacing: "-0.5px",
                            }}>More Than Capital</h2>
                            <p style={{ fontSize: "17px", color: "#666", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto" }}>
                                We offer more than capital: you get a hands-on partner obsessed with your growth, a network that opens doors others can&apos;t, and a framework designed to take you from breakthrough to scale.
                            </p>
                        </div>
                    </div>

                    <div className="row gutter-y-30 justify-content-center">
                        {value_props.map((item, i) => (
                            <div key={i} className="col-lg-4 col-md-6">
                                <div className="founders-value-card" style={{
                                    background: "#fff", padding: "44px 32px", borderRadius: "20px",
                                    border: "1px solid #eee", height: "100%",
                                    transition: "all 0.35s ease", position: "relative", overflow: "hidden",
                                }}>
                                    <div style={{
                                        position: "absolute", top: 0, left: 0, right: 0,
                                        height: "4px", background: item.color, borderRadius: "20px 20px 0 0",
                                    }} />
                                    <div style={{
                                        width: "64px", height: "64px", background: `${item.color}12`,
                                        borderRadius: "16px", display: "flex", alignItems: "center",
                                        justifyContent: "center", marginBottom: "24px",
                                        fontSize: "28px", color: item.color,
                                    }}>
                                        <i className={item.icon}></i>
                                    </div>
                                    <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1A1A1A", marginBottom: "12px" }}>
                                        {item.title}
                                    </h3>
                                    <p style={{ fontSize: "15px", color: "#666", lineHeight: 1.7, margin: 0 }}>
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Full Narrative Section */}
            <section className="page-narrative-section section-py-130" style={{ backgroundColor: "#FFFFFF", position: "relative", overflow: "hidden" }}>
                {/* Subtle Dotted Grid Background */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                    opacity: 0.6,
                    zIndex: 1,
                }} />

                <div className="container" style={{ position: "relative", zIndex: 3 }}>
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-40 mb-lg-0 order-lg-1 order-2">
                            {/* Image with curved shape */}
                            <div className="narrative-img-box" style={{ position: "relative" }}>
                                <div className="narrative-image-wrapper" style={{
                                    position: "relative",
                                    width: "100%",
                                    overflow: "hidden",
                                    boxShadow: "0 30px 60px rgba(0,0,0,0.1)",
                                    zIndex: 2,
                                }}>
                                    <Image
                                        src="/two-focused-business-men-meeting-working-outdoor-cafe.jpg"
                                        alt="Founders Narrative"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        style={{ objectFit: "cover" }}
                                    />
                                    <div style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: "linear-gradient(to top, rgba(0,0,0,0.2), transparent 50%)"
                                    }} />
                                </div>

                                {/* Decorative Circle Behind */}
                                <div style={{
                                    position: "absolute", bottom: "-20px", left: "-20px",
                                    width: "150px", height: "150px",
                                    borderRadius: "50%",
                                    background: "rgba(0,71,255,0.08)",
                                    zIndex: 1,
                                }} />
                            </div>
                        </div>

                        <div className="col-lg-6 order-lg-2 order-1">
                            <div className="narrative-text-box">
                                <span style={{ color: "var(--tg-theme-primary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", fontSize: "13px", marginBottom: "12px", display: "inline-block" }}>Our Vision</span>
                                <h3 style={{
                                    fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 700, color: "#1A1A1A",
                                    marginBottom: "24px", lineHeight: 1.3, letterSpacing: "-0.5px"
                                }}>
                                    The next generation of iconic companies is being built right now.
                                </h3>
                                <p style={{ fontSize: "17px", color: "#666", lineHeight: 1.8, marginBottom: "24px" }}>
                                    At 100exNextGen, we don&apos;t just write cheques — we roll up our sleeves alongside you. If you&apos;re a founder who believes your company can define a category, reshape an industry, or solve a problem the world hasn&apos;t caught up to yet, this is your circle.
                                </p>
                                <p style={{ fontSize: "17px", color: "#666", lineHeight: 1.8, marginBottom: "32px" }}>
                                    We offer more than capital: you get a hands-on partner obsessed with your growth, a network that opens doors others can&apos;t, and a framework designed to take you from breakthrough to scale. Come build yours with us.
                                </p>
                                <Link href="/#contact" className="tg-btn tg-btn-seven">
                                    Tell Us About Your Company <Arrow />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Case Studies Section */}
            <section style={{ backgroundColor: "#fff", padding: "100px 0" }}>
                <div className="container">
                    <div className="row justify-content-center" style={{ marginBottom: "50px" }}>
                        <div className="col-lg-8 text-center">
                            <span style={{
                                color: "var(--tg-theme-primary)", fontWeight: 600,
                                textTransform: "uppercase", letterSpacing: "2px",
                                fontSize: "13px", display: "inline-block", marginBottom: "12px",
                            }}>Success Stories</span>
                            <h2 style={{
                                fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700,
                                color: "#1A1A1A", letterSpacing: "-0.5px",
                            }}>Case Studies</h2>
                        </div>
                    </div>

                    <div className="row justify-content-center gutter-y-30">
                        <div className="col-lg-5 col-md-6">
                            <div className="case-study-card" style={{
                                background: "#fff", padding: "40px", borderRadius: "20px",
                                border: "1px solid #eee", height: "100%",
                                transition: "all 0.35s ease",
                            }}>
                                <div style={{
                                    width: "56px", height: "56px", background: "rgba(0,71,255,0.1)",
                                    borderRadius: "16px", display: "flex", alignItems: "center",
                                    justifyContent: "center", marginBottom: "24px",
                                    color: "var(--tg-theme-primary)", fontSize: "26px",
                                }}>
                                    <i className="flaticon-investment"></i>
                                </div>
                                <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#1A1A1A", marginBottom: "16px" }}>
                                    Strategic Capital Deployment
                                </h3>
                                <p style={{ fontSize: "16px", color: "#555", lineHeight: 1.7, marginBottom: 0 }}>
                                    Helped startup stage companies (in Singapore, India) and growth stage companies (in India and overseas) to secure equity and debt funding, across multiple sectors. Small ticket funding to moderate size funding was done successfully.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-5 col-md-6">
                            <div className="case-study-card" style={{
                                background: "#fff", padding: "40px", borderRadius: "20px",
                                border: "1px solid #eee", height: "100%",
                                transition: "all 0.35s ease",
                            }}>
                                <div style={{
                                    width: "56px", height: "56px", background: "rgba(46,125,50,0.1)",
                                    borderRadius: "16px", display: "flex", alignItems: "center",
                                    justifyContent: "center", marginBottom: "24px",
                                    color: "#2E7D32", fontSize: "26px",
                                }}>
                                    <i className="flaticon-diamond"></i>
                                </div>
                                <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#1A1A1A", marginBottom: "16px" }}>
                                    Synergy Creation
                                </h3>
                                <p style={{ fontSize: "16px", color: "#555", lineHeight: 1.7, marginBottom: 0 }}>
                                    Ability to connect the dots in allied areas of core offerings of customers, created new GTM channels and increased revenue flows. The vertical elevation sector (lifts, elevators) well connected to real estate and infrastructure sectors in addition to technology transfer avenues from other countries.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                backgroundColor: "#F4F6F8",
                padding: "80px 0", textAlign: "center",
            }}>
                <div className="container">
                    <h2 style={{
                        fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800,
                        color: "#1A1A1A", marginBottom: "16px", letterSpacing: "-0.5px",
                    }}>Ready to Build Something Iconic?</h2>
                    <p style={{
                        fontSize: "18px", color: "#555", marginBottom: "36px",
                        maxWidth: "500px", margin: "0 auto 36px",
                    }}>
                        Come build the next generation of category-defining companies with us.
                    </p>
                    <Link href="/#contact" className="tg-btn tg-btn-seven">
                        Get In Touch <Arrow />
                    </Link>
                </div>
            </section>

            <style jsx>{`
                .founders-hero-img {
                    height: 480px;
                    border-radius: 24px;
                }
                .page-hero-section {
                    padding: 140px 0 100px;
                }
                .page-narrative-section {
                    padding: 120px 0;
                }
                .narrative-img-box {
                    padding-right: 30px;
                }
                .narrative-text-box {
                    padding-left: 10px;
                    padding-right: 10px;
                }
                .narrative-image-wrapper {
                    height: 500px;
                    border-radius: 200px 0 200px 200px;
                }
                
                @media (max-width: 991px) {
                    .founders-hero-img {
                        height: 380px;
                        border-radius: 12px;
                    }
                    .page-hero-section {
                        padding: 120px 0 60px;
                    }
                    .page-narrative-section {
                        padding: 80px 0;
                    }
                    .narrative-image-wrapper {
                        height: 350px;
                        border-radius: 24px 0 24px 24px;
                    }
                    .narrative-img-box {
                        padding-right: 0;
                        margin-top: 40px;
                    }
                    .narrative-text-box {
                        padding-left: 0;
                        padding-right: 0;
                    }
                }
                @media (max-width: 767px) {
                    .founders-hero-img {
                        height: 320px;
                    }
                    .page-hero-section {
                        padding: 100px 0 50px;
                    }
                    .narrative-image-wrapper {
                        height: 300px;
                    }
                }
                .founders-value-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08);
                    border-color: transparent !important;
                }
                .case-study-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
                    border-color: transparent !important;
                }
            `}</style>
        </>
    );
};

export default FoundersArea;
