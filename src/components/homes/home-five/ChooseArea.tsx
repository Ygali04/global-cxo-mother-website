"use client"
import React from "react"
import AnimateOnScroll from "@/components/ui/AnimateOnScroll"

const framework_data = [
    { title: "Circle", desc: "A trusted community of executive leaders united by function and purpose.", icon: "flaticon-partner", watermark: "C" },
    { title: "Global", desc: "A worldwide ecosystem driving impact across 40+ countries and sectors.", icon: "flaticon-target", watermark: "O" },
    { title: "Cross-functional", desc: "Intersecting perspectives across CXO roles that create aligned outcomes.", icon: "flaticon-statistics", watermark: "X" },
    { title: "Connection", desc: "Entry points that unify individual circles into one cohesive ecosystem.", icon: "flaticon-handshake", watermark: "●" },
];

const ChooseArea = () => {
    return (
        <section id="cxo-concept" style={{
            backgroundColor: "#ffffff",
            padding: "120px 0",
            position: "relative",
            overflow: "hidden",
        }}>
            <div className="container">
                <AnimateOnScroll>
                    <div className="row justify-content-center text-center mb-60">
                        <div className="col-lg-8">
                            <span style={{
                                color: "var(--tg-theme-accent)",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "2px",
                                fontSize: "12px",
                                marginBottom: "12px",
                                display: "inline-block",
                            }}>
                                THE CXO FRAMEWORK
                            </span>
                            <h2 style={{
                                fontSize: "clamp(28px, 3.5vw, 42px)",
                                fontWeight: 700,
                                color: "var(--tg-heading-color)",
                                marginBottom: "20px"
                            }}>
                                Alignment Happens at the <br className="d-none d-md-block" />
                                <span style={{
                                    background: "var(--tg-color-gradient)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    display: "inline-block"
                                }}>Intersection.</span>
                            </h2>
                            
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginBottom: "60px" }}>
                                <div style={{ height: "1px", width: "100px", background: "linear-gradient(90deg, transparent, var(--tg-theme-primary))", opacity: 0.5 }}></div>
                                <p style={{
                                    fontSize: "20px",
                                    color: "var(--tg-theme-accent)",
                                    fontStyle: "italic",
                                    fontWeight: 500,
                                    margin: 0
                                }}>
                                    &ldquo;The &lsquo;X&rsquo; is implied through connection.&rdquo;
                                </p>
                                <div style={{ height: "1px", width: "100px", background: "linear-gradient(270deg, transparent, var(--tg-theme-magenta))", opacity: 0.5 }}></div>
                            </div>
                        </div>
                    </div>
                </AnimateOnScroll>

                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="row">
                            {framework_data.map((item, i) => (
                                <div key={i} className="col-md-6 mb-4">
                                    <AnimateOnScroll delay={i * 0.1} direction={i % 2 === 0 ? "left" : "right"}>
                                        <div className="cxo-card" style={{
                                            background: "#fff",
                                            border: "1px solid rgba(0,0,0,0.06)",
                                            borderRadius: "16px",
                                            padding: "36px",
                                            height: "100%",
                                            transition: "all 0.4s ease",
                                            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                                            position: "relative",
                                            overflow: "hidden"
                                        }}>
                                            <div style={{
                                                position: "absolute",
                                                top: item.watermark === "●" ? "-20px" : "-10px",
                                                right: item.watermark === "●" ? "-20px" : "10px",
                                                fontSize: item.watermark === "●" ? "140px" : "120px",
                                                fontWeight: 800,
                                                lineHeight: 1,
                                                color: "var(--tg-theme-magenta)",
                                                opacity: 0.03,
                                                zIndex: 0,
                                                userSelect: "none",
                                                fontFamily: "sans-serif"
                                            }}>
                                                {item.watermark}
                                            </div>
                                            
                                            <div style={{
                                                width: "48px",
                                                height: "48px",
                                                background: "var(--tg-color-gradient)",
                                                color: "#fff",
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "20px",
                                                marginBottom: "32px",
                                                transition: "transform 0.4s ease",
                                                position: "relative",
                                                zIndex: 1,
                                                boxShadow: "0 4px 12px rgba(123, 31, 255, 0.2)"
                                            }} className="cxo-icon">
                                                <i className={item.icon}></i>
                                            </div>
                                            <h3 style={{ fontSize: "22px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "16px", position: "relative", zIndex: 1 }}>
                                                {item.title}
                                            </h3>
                                            <p style={{ fontSize: "16px", color: "var(--tg-body-color)", lineHeight: 1.6, margin: 0, position: "relative", zIndex: 1 }}>
                                                {item.desc}
                                            </p>
                                        </div>
                                    </AnimateOnScroll>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
            .cxo-card:hover {
               transform: translateY(-4px);
               box-shadow: 0 12px 40px rgba(11,26,74,0.12) !important;
               border-color: var(--tg-theme-primary) !important;
            }
            .cxo-card:hover .cxo-icon {
               transform: scale(1.1);
            }
         `}</style>
        </section>
    )
}

export default ChooseArea
