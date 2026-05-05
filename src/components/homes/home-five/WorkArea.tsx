"use client"
import React from "react"
import AnimateOnScroll from "@/components/ui/AnimateOnScroll"

const WorkArea = () => {
    const steps = [
        { id: 1, title: "Access", desc: "Curated access to CXO leaders across functions", icon: "flaticon-personal" },
        { id: 2, title: "Advisory", desc: "Structured advisory sessions with senior executives", icon: "flaticon-idea" },
        { id: 3, title: "Introductions", desc: "Warm, high-trust enterprise introductions", icon: "flaticon-handshake" },
        { id: 4, title: "Deal Development", desc: "Build real opportunities through aligned relationships", icon: "flaticon-growth" },
        { id: 5, title: "Outcomes", desc: "Convert relationships into tangible enterprise results", icon: "flaticon-achievement" },
    ];

    return (
        <section className="section-py-130" style={{ backgroundColor: "#FFFFFF", position: "relative", overflow: "hidden" }}>
            <div className="container" style={{ position: "relative", zIndex: 3 }}>
                <AnimateOnScroll>
                    <div className="row justify-content-center mb-60">
                        <div className="col-lg-8 text-center">
                            <span style={{ background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", fontSize: "12px", marginBottom: "12px", display: "inline-block" }}>
                                THE PLATFORM MODEL
                            </span>
                            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "16px" }}>
                                From Access to Outcomes
                            </h2>
                            <p style={{ fontSize: "17px", color: "var(--tg-body-color)", fontStyle: "italic" }}>
                                Relationships are the starting point. Outcomes are the goal.
                            </p>
                        </div>
                    </div>
                </AnimateOnScroll>

                <div className="row justify-content-center position-relative">
                    {/* Background line for desktop */}
                    <div className="d-none d-lg-block" style={{
                        position: "absolute",
                        top: "28px",
                        left: "10%",
                        right: "10%",
                        height: "2px",
                        background: "var(--tg-border-1)",
                        zIndex: 1,
                        borderTop: "2px dashed var(--tg-border-1)"
                    }}></div>

                    {steps.map((step, idx) => (
                        <div key={step.id} className="col-lg col-md-6 col-sm-12" style={{ zIndex: 2 }}>
                            <AnimateOnScroll delay={idx * 0.1} direction="up">
                                <div className="mb-40 text-center">
                                    <div className="step-node" style={{
                                        width: "56px",
                                        height: "56px",
                                        background: "var(--tg-color-gradient)", color: "#fff", borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 16px",
                                        fontSize: "24px",
                                        fontWeight: "bold",
                                        position: "relative",
                                        transition: "transform 0.3s ease, box-shadow 0.3s ease"
                                    }}>
                                        <i className={step.icon}></i>
                                    </div>
                                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "8px" }}>
                                        {step.title}
                                    </h3>
                                    <p style={{ fontSize: "14px", color: "var(--tg-body-color)", lineHeight: 1.5, maxWidth: "160px", margin: "0 auto" }}>
                                        {step.desc}
                                    </p>
                                </div>
                            </AnimateOnScroll>
                        </div>
                    ))}
                </div>
            </div>
            
            <style jsx>{`
                .step-node:hover {
                    transform: scale(1.15);
                    box-shadow: 0 8px 24px rgba(10,60,194,0.25);
                }
            `}</style>
        </section>
    )
}

export default WorkArea
