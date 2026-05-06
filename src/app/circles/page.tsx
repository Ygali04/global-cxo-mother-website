"use client"
import React from "react"
import HeaderFive from "@/layouts/headers/HeaderFive"
import FooterThree from "@/layouts/footers/FooterThree"
import Link from "next/link"
import Image from "next/image"

const circles_data = [
    { id: 1, title: "Global CIO Circle", desc: "Chief Information Officers driving digital transformation and enterprise IT strategy.", logo: "/logos/cio.png", badge: "CIO", focus: ["Digital Transformation", "IT Architecture", "Enterprise Systems"] },
    { id: 2, title: "Global CTO Circle", desc: "Chief Technology Officers building scalable, future-proof product ecosystems.", logo: "/logos/cto.png", badge: "CTO", focus: ["Product Strategy", "Engineering Excellence", "Emerging Tech"] },
    { id: 3, title: "Global CISO Circle", desc: "Chief Information Security Officers safeguarding data and managing enterprise risk.", logo: "/logos/ciso.png", badge: "CISO", focus: ["Cybersecurity", "Risk Management", "Compliance"] },
    { id: 4, title: "Global CFO Circle", desc: "Chief Financial Officers orchestrating capital allocation and financial growth.", logo: "/logos/cfo.png", badge: "CFO", focus: ["Capital Allocation", "Financial Strategy", "M&A"] },
    { id: 5, title: "Global CRO Circle", desc: "Chief Revenue Officers scaling revenue engines and market expansion.", logo: "/logos/cro-v3.png", badge: "CRO", focus: ["Revenue Operations", "Go-to-Market Strategy", "Sales Scaling"] },
    { id: 6, title: "Global CEO Circle", desc: "Chief Executive Officers defining vision, culture, and ultimate enterprise value.", logo: "/logos/ceo.png", badge: "CEO", focus: ["Corporate Strategy", "Organizational Culture", "Board Relations"] },
    { id: 7, title: "Global Startup Circle", desc: "Founders and Entrepreneurs building the next generation of category leaders.", logo: "/logos/startup.png", badge: "F", focus: ["Venture Building", "Fundraising", "Early-Stage Scaling"] },
];

const CirclesPage = () => {
    return (
        <>
            <HeaderFive />
            <main className="main-area fix" style={{ paddingTop: "120px", paddingBottom: "120px", backgroundColor: "#f8f9fa" }}>
                <div className="container">
                    <div className="row justify-content-center text-center mb-60">
                        <div className="col-lg-8">
                            <span style={{
                                background: "var(--tg-color-gradient)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "2px",
                                fontSize: "12px",
                                marginBottom: "12px",
                                display: "inline-block",
                            }}>
                                LEADERSHIP CIRCLES
                            </span>
                            <h2 style={{
                                fontSize: "clamp(36px, 4vw, 48px)",
                                fontWeight: 700,
                                color: "var(--tg-heading-color)",
                                marginBottom: "20px"
                            }}>
                                Specialized. Curated. Connected.
                            </h2>
                            <p style={{ fontSize: "18px", color: "var(--tg-body-color)", maxWidth: "600px", margin: "0 auto" }}>
                                Explore our 7 specialized executive circles. Each circle operates as a tight-knit community while remaining connected to the broader global ecosystem.
                            </p>
                        </div>
                    </div>

                    <div className="row gutter-y-30 justify-content-center">
                        {circles_data.map((item) => (
                            <div key={item.id} className="col-lg-4 col-md-6">
                                <div className="circle-detail-card" style={{
                                    background: "#fff",
                                    padding: "40px",
                                    borderRadius: "18px",
                                    border: "1px solid var(--tg-border-1)",
                                    boxShadow: "0 6px 28px rgba(11,26,74,0.06)",
                                    height: "100%",
                                    transition: "all 0.3s ease",
                                    display: "flex",
                                    flexDirection: "column",
                                    position: "relative",
                                    overflow: "hidden"
                                }}>
                                    <div className="circle-top-accent"></div>
                                    <div className="circle-logo-shell">
                                        {item.logo ? (
                                            <Image src={item.logo} alt={item.title} width={90} height={90} className="circle-logo-img" />
                                        ) : (
                                            <div className="circle-logo-fallback">{item.badge}</div>
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: "22px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "12px" }}>
                                        {item.title}
                                    </h3>
                                    <p style={{ fontSize: "15px", color: "var(--tg-body-color)", lineHeight: 1.6, marginBottom: "24px", flex: 1 }}>
                                        {item.desc}
                                    </p>

                                    <div>
                                        <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#888", marginBottom: "12px", fontWeight: 600 }}>Core Focus Areas</h4>
                                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                            {item.focus.map((focusItem, idx) => (
                                                <li key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--tg-heading-color)", marginBottom: "8px", fontWeight: 500 }}>
                                                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--tg-color-gradient)" }}></span>
                                                    {focusItem}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-60">
                        <Link href="/apply" style={{
                            display: "inline-block",
                            background: "var(--tg-color-gradient)",
                            color: "#fff",
                            padding: "16px 36px",
                            borderRadius: "8px",
                            fontWeight: 700,
                            fontSize: "16px",
                            textDecoration: "none",
                            boxShadow: "0 10px 30px rgba(0,71,255,0.2)",
                            transition: "all 0.3s ease"
                        }}>
                            Apply for Membership
                        </Link>
                    </div>
                </div>
                <style jsx>{`
                    .circle-detail-card:hover {
                        transform: translateY(-6px);
                        box-shadow: 0 18px 45px rgba(11,26,74,0.12) !important;
                        border-color: var(--tg-theme-primary) !important;
                    }
                    .circle-top-accent {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: var(--tg-color-gradient);
                    }
                    .circle-logo-shell {
                        width: 102px;
                        height: 102px;
                        border-radius: 24px;
                        margin-bottom: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: linear-gradient(145deg, rgba(245,248,255,1), rgba(235,241,255,0.88));
                        border: 1px solid rgba(11,26,74,0.08);
                        box-shadow: 0 8px 26px rgba(11,26,74,0.08);
                        transition: transform 0.3s ease;
                    }
                    .circle-logo-img {
                        width: 90px;
                        height: 90px;
                        object-fit: contain;
                        border-radius: 18px;
                    }
                    .circle-logo-fallback {
                        width: 78px;
                        height: 78px;
                        border-radius: 18px;
                        background: var(--tg-color-gradient);
                        color: #fff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        font-weight: 800;
                        letter-spacing: 0.5px;
                    }
                    .circle-detail-card:hover .circle-logo-shell {
                        transform: scale(1.05);
                    }
                `}</style>
            </main>
            <FooterThree />
        </>
    )
}

export default CirclesPage
