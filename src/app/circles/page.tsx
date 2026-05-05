"use client"
import React from "react"
import HeaderFive from "@/layouts/headers/HeaderFive"
import FooterThree from "@/layouts/footers/FooterThree"
import Link from "next/link"

const circles_data = [
    { id: 1, title: "Global CIO Circle", desc: "Chief Information Officers driving digital transformation and enterprise IT strategy.", icon: "flaticon-database", focus: ["Digital Transformation", "IT Architecture", "Enterprise Systems"] },
    { id: 2, title: "Global CTO Circle", desc: "Chief Technology Officers building scalable, future-proof product ecosystems.", icon: "flaticon-mobile-app", focus: ["Product Strategy", "Engineering Excellence", "Emerging Tech"] },
    { id: 3, title: "Global CISO Circle", desc: "Chief Information Security Officers safeguarding data and managing enterprise risk.", icon: "flaticon-protection", focus: ["Cybersecurity", "Risk Management", "Compliance"] },
    { id: 4, title: "Global CFO Circle", desc: "Chief Financial Officers orchestrating capital allocation and financial growth.", icon: "flaticon-calculator", focus: ["Capital Allocation", "Financial Strategy", "M&A"] },
    { id: 5, title: "Global CRO Circle", desc: "Chief Revenue Officers scaling revenue engines and market expansion.", icon: "flaticon-growth", focus: ["Revenue Operations", "Go-to-Market Strategy", "Sales Scaling"] },
    { id: 6, title: "Global CEO Circle", desc: "Chief Executive Officers defining vision, culture, and ultimate enterprise value.", icon: "flaticon-briefcase", focus: ["Corporate Strategy", "Organizational Culture", "Board Relations"] },
    { id: 7, title: "Global Founder Circle", desc: "Founders and Entrepreneurs building the next generation of category leaders.", icon: "flaticon-startup", focus: ["Venture Building", "Fundraising", "Early-Stage Scaling"] },
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
                                    borderRadius: "16px",
                                    border: "1px solid var(--tg-border-1)",
                                    boxShadow: "0 4px 20px rgba(11,26,74,0.03)",
                                    height: "100%",
                                    transition: "all 0.3s ease",
                                    display: "flex",
                                    flexDirection: "column"
                                }}>
                                    <div style={{
                                        width: "60px",
                                        height: "60px",
                                        background: "var(--tg-color-gradient)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        borderRadius: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "30px",
                                        marginBottom: "24px"
                                    }}>
                                        <i className={item.icon}></i>
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
                                                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--tg-theme-primary)" }}></span>
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
                        transform: translateY(-5px);
                        box-shadow: 0 15px 40px rgba(11,26,74,0.08) !important;
                        border-color: var(--tg-theme-primary) !important;
                    }
                `}</style>
            </main>
            <FooterThree />
        </>
    )
}

export default CirclesPage
