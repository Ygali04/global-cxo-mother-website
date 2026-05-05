"use client"
import React from "react"
import AnimateOnScroll from "@/components/ui/AnimateOnScroll"

const differentiators = [
    { num: "01", title: "CXO-Led Engagement Model", desc: "Driven by and for executive leaders, not managed from below.", icon: "flaticon-personal" },
    { num: "02", title: "Structured Advisory Interactions", desc: "Every engagement is intentional and outcome-oriented.", icon: "flaticon-idea" },
    { num: "03", title: "Warm, High-Trust Introductions", desc: "No cold outreach. Every introduction carries context and credibility.", icon: "flaticon-handshake" },
    { num: "04", title: "Cross-Functional Alignment", desc: "Bridging the silos between CTO, CIO, CFO, CISO, and CEO.", icon: "flaticon-partner" },
    { num: "05", title: "Outcome-Driven Ecosystem", desc: "Built to convert relationships into real enterprise results.", icon: "flaticon-achievement" },
];

const Estimate = () => {
    return (
        <section id="platform" className="section-py-130" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-5 mb-50 mb-lg-0">
                        <AnimateOnScroll direction="left">
                            <div style={{
                                paddingLeft: "30px",
                                borderImage: "var(--tg-color-gradient) 1", borderLeft: "4px solid",
                            }}>
                                <h2 style={{
                                    fontSize: "clamp(24px, 3.5vw, 32px)",
                                    fontWeight: 700,
                                    color: "var(--tg-heading-color)",
                                    lineHeight: 1.4,
                                    marginBottom: "20px"
                                }}>
                                    &ldquo;This is not a networking platform. This is a structured engagement ecosystem designed for outcomes.&rdquo;
                                </h2>
                                <p style={{
                                    fontSize: "16px",
                                    color: "var(--tg-body-color)",
                                    fontWeight: 600,
                                    margin: 0
                                }}>
                                    — Global CXO Circle
                                </p>
                            </div>
                        </AnimateOnScroll>
                    </div>
                    
                    <div className="col-lg-7">
                        <div className="diff-list" style={{ paddingLeft: "clamp(0px, 4vw, 40px)" }}>
                            {differentiators.map((item, i) => (
                                <AnimateOnScroll key={i} delay={i * 0.08} direction="right">
                                    <div className="diff-row" style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "24px",
                                        padding: "24px",
                                        borderBottom: i !== differentiators.length - 1 ? "1px solid var(--tg-border-1)" : "none",
                                        borderRadius: "12px",
                                        transition: "all 0.3s ease"
                                    }}>
                                        <div className="diff-num" style={{
                                            width: "48px",
                                            height: "48px",
                                            background: "var(--tg-color-gradient)", color: "#fff", borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "22px",
                                            fontWeight: "bold",
                                            flexShrink: 0,
                                            transition: "all 0.3s ease"
                                        }}>
                                            <i className={item.icon}></i>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: "18px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "6px" }}>
                                                {item.title}
                                            </h4>
                                            <p style={{ fontSize: "15px", color: "var(--tg-body-color)", margin: 0, lineHeight: 1.6 }}>
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                </AnimateOnScroll>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
            .diff-row:hover {
               background-color: #f7f8fc;
            }
            .diff-row:hover .diff-num {
               transform: scale(1.1);
               box-shadow: 0 4px 15px rgba(11,26,74,0.15);
            }
         `}</style>
        </section>
    )
}

export default Estimate
