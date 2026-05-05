"use client"
import Image from "next/image"
import Link from "next/link"
import Arrow from "@/components/common/Arrow"

const advisor_values = [
    {
        icon: "flaticon-growth",
        title: "Experience as Force Multiplier",
        desc: "Your decades of building and scaling become the secret weapon that compresses years of learning into months for the next generation of founders.",
        color: "#0A3CC2",
    },
    {
        icon: "flaticon-partner",
        title: "Network as Launchpad",
        desc: "Every introduction you make, every door you open, becomes a launchpad for breakthrough companies to reach escape velocity.",
        color: "#1565C0",
    },
    {
        icon: "flaticon-startup",
        title: "Conviction as Wind",
        desc: "Your belief in a founder's vision becomes the wind beneath their wings — fueling confidence, credibility, and momentum when it matters most.",
        color: "#2E7D32",
    },
];

const what_you_bring = [
    { title: "Domain Expertise", desc: "Deep knowledge in verticals like deep tech, infrastructure, fintech, or climate." },
    { title: "Operator Experience", desc: "You've built, scaled, or transformed organizations — and carry the battle scars to prove it." },
    { title: "Global Perspective", desc: "Cross-border insights that help founders navigate markets beyond their home turf." },
    { title: "Active Mentorship", desc: "Willingness to go beyond advice — engaging in structured mentoring relationships." },
];

const AdvisorsArea = () => {
    return (
        <>
            {/* Hero Section */}
            <section className="page-hero-section" style={{
                backgroundColor: "#F4F6F8",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{
                    position: "absolute", top: "-20%", left: "-10%",
                    width: "600px", height: "600px",
                    background: "radial-gradient(circle, rgba(0,71,255,0.12) 0%, transparent 70%)",
                    borderRadius: "50%", pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", bottom: "-25%", right: "-5%",
                    width: "450px", height: "450px",
                    background: "radial-gradient(circle, rgba(46,125,50,0.08) 0%, transparent 70%)",
                    borderRadius: "50%", pointerEvents: "none",
                }} />

                <div className="container" style={{ position: "relative", zIndex: 2 }}>
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-50 mb-lg-0">
                            <span style={{
                                color: "var(--tg-theme-primary)", fontWeight: 600,
                                textTransform: "uppercase", letterSpacing: "3px",
                                fontSize: "13px", display: "inline-block", marginBottom: "20px",
                            }}>For Advisors</span>
                            <h1 style={{
                                fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800,
                                color: "#1A1A1A", letterSpacing: "-1.5px", lineHeight: 1.1,
                                marginBottom: "28px",
                            }}>
                                Shape the Future{" "}
                                <span style={{ color: "var(--tg-theme-primary)" }}>You See Coming</span>
                            </h1>
                            <p style={{
                                fontSize: "18px", color: "#555",
                                lineHeight: 1.75, marginBottom: "36px", maxWidth: "520px",
                            }}>
                                The best advisors don&apos;t just counsel from the sidelines — they leave a fingerprint on history. At 100exNextGen, we invite seasoned leaders, domain experts, and industry pioneers to co-create the playbook for the next generation of exponential ventures.
                            </p>
                            <Link href="/#contact" className="tg-btn tg-btn-seven">
                                Join Our Advisory Board <Arrow />
                            </Link>
                        </div>
                        <div className="col-lg-6">
                            <div style={{ position: "relative" }}>
                                <div className="advisors-hero-img" style={{
                                    position: "relative", width: "100%",
                                    overflow: "hidden",
                                    boxShadow: "0 40px 80px rgba(0,0,0,0.1)",
                                }}>
                                    <Image
                                        src="/advisors-hero.png"
                                        alt="Advisory board meeting"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        style={{ objectFit: "cover" }}
                                        priority
                                        quality={85}
                                    />
                                    <div style={{
                                        position: "absolute", inset: 0,
                                        background: "linear-gradient(to top, rgba(10,15,28,0.5), transparent 60%)",
                                    }} />
                                </div>
                                {/* Floating badge */}
                                <div style={{
                                    position: "absolute", top: "30px", right: "-15px",
                                    background: "var(--tg-theme-primary)",
                                    padding: "14px 24px", borderRadius: "12px",
                                    boxShadow: "0 15px 40px rgba(0,71,255,0.35)",
                                    color: "#fff", zIndex: 3,
                                    fontSize: "14px", fontWeight: 700,
                                }}>
                                    Global Expertise
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Proposition Cards */}
            <section style={{ backgroundColor: "#fff", padding: "100px 0" }}>
                <div className="container">
                    <div className="row justify-content-center" style={{ marginBottom: "60px" }}>
                        <div className="col-lg-7 text-center">
                            <span style={{
                                color: "var(--tg-theme-primary)", fontWeight: 600,
                                textTransform: "uppercase", letterSpacing: "2px",
                                fontSize: "13px", display: "inline-block", marginBottom: "12px",
                            }}>Your Impact</span>
                            <h2 style={{
                                fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800,
                                color: "#1A1A1A", marginBottom: "16px", letterSpacing: "-0.5px",
                            }}>How You Shape the Future</h2>
                            <p style={{ fontSize: "17px", color: "#666", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto" }}>
                                Your experience becomes a force multiplier for visionary founders. Your network becomes a launchpad. And your conviction becomes the wind beneath breakthrough companies.
                            </p>
                        </div>
                    </div>

                    <div className="row gutter-y-30 justify-content-center">
                        {advisor_values.map((item, i) => (
                            <div key={i} className="col-lg-4 col-md-6">
                                <div className="advisor-value-card" style={{
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

            {/* Full Narrative + What You Bring */}
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
                                        src="/business-partners-making-negotiations-before-deal.jpg"
                                        alt="Ideal Advisor Profile"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        style={{ objectFit: "cover" }}
                                        quality={75}
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
                                <span style={{ color: "var(--tg-theme-primary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", fontSize: "13px", marginBottom: "12px", display: "inline-block" }}>Ideal Advisor Profile</span>
                                <h3 style={{
                                    fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 700, color: "#1A1A1A",
                                    marginBottom: "16px", lineHeight: 1.3, letterSpacing: "-0.5px"
                                }}>
                                    Pass the Torch While Holding the Flame
                                </h3>
                                <p style={{ fontSize: "17px", color: "#666", lineHeight: 1.8, marginBottom: "20px" }}>
                                    The best advisors don&apos;t just counsel from the sidelines — they leave a fingerprint on history. We invite you to co-create the playbook for the next generation of exponential ventures.
                                </p>

                                <div>
                                    {what_you_bring.map((item, i) => (
                                        <div key={i} className="advisor-profile-item" style={{
                                            display: "flex", alignItems: "flex-start", gap: "16px",
                                            marginBottom: "12px", background: "#fff", padding: "16px 20px",
                                            borderRadius: "16px", border: "1px solid #f0f0f0",
                                            boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                                            transition: "all 0.3s ease", borderLeft: "4px solid transparent"
                                        }}>
                                            <div style={{
                                                minWidth: "32px", height: "32px", background: "rgba(0,71,255,0.06)",
                                                borderRadius: "50%", display: "flex", alignItems: "center",
                                                justifyContent: "center", marginTop: "2px", flexShrink: 0,
                                            }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 14 11" fill="none">
                                                    <path d="M12.091 2L5.091 9L1.90918 5.81818" stroke="var(--tg-theme-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1A1A1A", marginBottom: "4px" }}>
                                                    {item.title}
                                                </h4>
                                                <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6, margin: 0 }}>
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Link href="/#contact" className="tg-btn tg-btn-seven" style={{ marginTop: "8px" }}>
                                    Connect With Us <Arrow />
                                </Link>
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
                    }}>Ready to Leave Your Fingerprint on History?</h2>
                    <p style={{
                        fontSize: "18px", color: "#555", marginBottom: "36px",
                        maxWidth: "500px", margin: "0 auto 36px",
                    }}>
                        Join our advisory board and co-create the playbook for the next generation.
                    </p>
                    <Link href="/#contact" className="tg-btn tg-btn-seven">
                        Get In Touch <Arrow />
                    </Link>
                </div>
            </section>

            <style jsx>{`
                .advisors-hero-img {
                    height: 480px;
                    border-radius: 24px;
                }
                @media (max-width: 991px) {
                    .advisors-hero-img {
                        height: 320px;
                    }
                }
                .advisor-value-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08);
                    border-color: transparent !important;
                }
                .advisor-profile-item:hover {
                    transform: translateX(5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.06) !important;
                    border-color: rgba(0,71,255,0.15) !important;
                    border-left-color: var(--tg-theme-primary) !important;
                }
                .narrative-image-wrapper {
                    height: 580px;
                    border-radius: 210px 0 210px 210px;
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
                @media (max-width: 991px) {
                    .advisors-hero-img {
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
                    .advisors-hero-img {
                        height: 320px;
                    }
                    .page-hero-section {
                        padding: 100px 0 50px;
                    }
                    .narrative-image-wrapper {
                        height: 300px;
                    }
                }
            `}</style>
        </>
    );
};

export default AdvisorsArea;
