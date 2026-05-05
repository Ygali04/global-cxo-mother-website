"use client"
import React, { useState } from "react"
import AnimateOnScroll from "@/components/ui/AnimateOnScroll"

const Cta = () => {
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        organization: "",
        email: "",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log(formData);
        alert("Thank you for your interest. We will be in touch shortly.");
        setFormData({ name: "", role: "", organization: "", email: "", message: "" });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <section id="contact" className="section-py-130" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="container">
                <div className="row align-items-center">
                    {/* Left Side: Info */}
                    <div className="col-lg-5 mb-50 mb-lg-0">
                        <AnimateOnScroll direction="left">
                            <div style={{ paddingRight: "clamp(0px, 4vw, 40px)" }}>
                                <span style={{
                                    background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 700, textTransform: "uppercase",
                                    letterSpacing: "2px",
                                    fontSize: "12px",
                                    marginBottom: "12px",
                                    display: "inline-block",
                                }}>
                                    GET IN TOUCH
                                </span>
                                <h2 style={{
                                    fontSize: "clamp(28px, 3.5vw, 42px)",
                                    fontWeight: 700,
                                    color: "var(--tg-heading-color)",
                                    marginBottom: "24px",
                                    lineHeight: 1.2
                                }}>
                                    Let&apos;s align on outcomes.
                                </h2>
                                <p style={{ fontSize: "16px", color: "var(--tg-body-color)", marginBottom: "40px", lineHeight: 1.6 }}>
                                    Whether you&apos;re looking to join a Leadership Circle, explore partnership opportunities, or initiate a strategic conversation, we&apos;re ready to connect.
                                </p>

                                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                    <AnimateOnScroll delay={0.1}>
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                            <div style={{
                                                width: "44px",
                                                height: "44px",
                                                background: "rgba(10,60,194,0.08)",
                                                color: "var(--tg-theme-primary)",
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "20px",
                                                flexShrink: 0
                                            }}>
                                                <i className="flaticon-placeholder"></i>
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>Global Headquarters</h4>
                                                <p style={{ fontSize: "15px", color: "var(--tg-body-color)", margin: 0 }}>
                                                    San Francisco, CA<br />
                                                    Operating worldwide across 40+ countries.
                                                </p>
                                            </div>
                                        </div>
                                    </AnimateOnScroll>
                                    <AnimateOnScroll delay={0.2}>
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                            <div style={{
                                                width: "44px",
                                                height: "44px",
                                                background: "rgba(10,60,194,0.08)",
                                                color: "var(--tg-theme-primary)",
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "20px",
                                                flexShrink: 0
                                            }}>
                                                <i className="flaticon-envelope"></i>
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>General Inquiries</h4>
                                                <a href="mailto:hello@globalcxocircle.com" style={{ fontSize: "15px", color: "var(--tg-theme-primary)", fontWeight: 600, textDecoration: "none" }}>
                                                    hello@globalcxocircle.com
                                                </a>
                                            </div>
                                        </div>
                                    </AnimateOnScroll>
                                </div>
                            </div>
                        </AnimateOnScroll>
                    </div>

                    {/* Right Side: Form */}
                    <div className="col-lg-7">
                        <AnimateOnScroll direction="right">
                            <div style={{
                                background: "#fff",
                                borderRadius: "16px",
                                padding: "40px",
                                boxShadow: "0 10px 40px rgba(11,26,74,0.06)",
                                border: "1px solid var(--tg-border-1)"
                            }}>
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--tg-heading-color)", marginBottom: "8px" }}>Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                style={{ width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#F9FAFB", fontSize: "15px", transition: "all 0.3s ease" }}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--tg-heading-color)", marginBottom: "8px" }}>Role / Title *</label>
                                            <input
                                                type="text"
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                required
                                                style={{ width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#F9FAFB", fontSize: "15px", transition: "all 0.3s ease" }}
                                                placeholder="Chief Executive Officer"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--tg-heading-color)", marginBottom: "8px" }}>Organization *</label>
                                            <input
                                                type="text"
                                                name="organization"
                                                value={formData.organization}
                                                onChange={handleChange}
                                                required
                                                style={{ width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#F9FAFB", fontSize: "15px", transition: "all 0.3s ease" }}
                                                placeholder="Your Company Name"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--tg-heading-color)", marginBottom: "8px" }}>Email Address *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                style={{ width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#F9FAFB", fontSize: "15px", transition: "all 0.3s ease" }}
                                                placeholder="john@company.com"
                                            />
                                        </div>
                                        <div className="col-12 mb-4">
                                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--tg-heading-color)", marginBottom: "8px" }}>Message</label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={4}
                                                style={{ width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#F9FAFB", fontSize: "15px", resize: "vertical", transition: "all 0.3s ease" }}
                                                placeholder="How can we align?"
                                            ></textarea>
                                        </div>
                                        <div className="col-12">
                                            <button type="submit" style={{
                                                background: "var(--tg-color-gradient)", color: "#fff", border: "none", padding: "16px 32px",
                                                borderRadius: "8px",
                                                fontWeight: 700,
                                                fontSize: "15px",
                                                width: "100%",
                                                cursor: "pointer",
                                                transition: "all 0.3s ease"
                                            }} className="contact-submit-btn">
                                                Submit Inquiry
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </AnimateOnScroll>
                    </div>
                </div>
            </div>
            <style jsx>{`
                input:focus, textarea:focus {
                    outline: none;
                    border-color: var(--tg-theme-primary) !important;
                    background: #fff !important;
                    box-shadow: 0 0 0 3px rgba(11,26,74,0.1);
                }
                .contact-submit-btn:hover {
                    filter: brightness(1.1);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(10,60,194,0.25);
                }
            `}</style>
        </section>
    )
}

export default Cta
