"use client"
import React, { useState, type CSSProperties } from "react"
import HeaderFive from "@/layouts/headers/HeaderFive"
import FooterThree from "@/layouts/footers/FooterThree"
import AnimateOnScroll from "@/components/ui/AnimateOnScroll"

const WEB3FORMS_ACCESS_KEY = "e2f3426f-24fd-472c-b564-50bac442e030"
const CALENDLY_URL = "https://calendly.com/leningali/30min"

const labelStyle: CSSProperties = { display: "block", fontSize: "13px", fontWeight: 600, color: "var(--tg-heading-color)", marginBottom: "5px" }
const inputStyle: CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: "10px", border: "1px solid var(--tg-border-1)",
    background: "#fff", fontSize: "15px", color: "var(--tg-heading-color)",
    boxShadow: "0 2px 8px rgba(11,26,74,0.04)", transition: "all 0.3s ease",
}
const Required = () => <span style={{ color: "#DC2626" }}> *</span>

const ContactPage = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [company, setCompany] = useState("")
    const [message, setMessage] = useState("")
    const [fieldErrors, setFieldErrors] = useState<{ name?: boolean; email?: boolean; message?: boolean }>({})
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
    const [errorMsg, setErrorMsg] = useState("")

    const validate = () => {
        const errors: typeof fieldErrors = {}
        if (!name.trim()) errors.name = true
        if (!email.trim() || !email.includes("@")) errors.email = true
        if (!message.trim()) errors.message = true
        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setStatus("sending")
        setErrorMsg("")
        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    access_key: WEB3FORMS_ACCESS_KEY,
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim() || "Not provided",
                    company: company.trim() || "Not provided",
                    message: message.trim(),
                    subject: `New Contact Form Inquiry from ${name.trim()}`,
                }),
            })
            const data = (await res.json()) as { success?: boolean; message?: string }
            if (res.ok && data.success) {
                setStatus("success")
            } else {
                setStatus("error")
                setErrorMsg(data.message || "Failed to send message.")
            }
        } catch {
            setStatus("error")
            setErrorMsg("Email service is temporarily unavailable. Please try again shortly.")
        }
    }

    const errorStyle: CSSProperties = { borderColor: "#DC2626", boxShadow: "0 0 0 3px rgba(220,38,38,0.1)" }
    const clearError = (key: keyof typeof fieldErrors) => {
        if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: false }))
    }

    return (
        <>
            <HeaderFive />
            <main className="main-area fix">
                {/* Hero */}
                <section style={{ paddingTop: "120px", paddingBottom: "70px", backgroundColor: "#f8f9fa" }}>
                    <div className="container">
                        <div className="row justify-content-center text-center">
                            <div className="col-lg-8">
                                <AnimateOnScroll>
                                    <span style={{
                                        background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                        fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", fontSize: "12px",
                                        marginBottom: "16px", display: "inline-block",
                                    }}>
                                        Get In Touch
                                    </span>
                                    <h1 style={{ fontSize: "clamp(32px, 4.2vw, 48px)", fontWeight: 800, color: "var(--tg-heading-color)", marginBottom: "16px", lineHeight: 1.15 }}>
                                        Let&apos;s Start a Conversation
                                    </h1>
                                    <p style={{ fontSize: "16.5px", color: "var(--tg-body-color)", lineHeight: 1.7, maxWidth: "620px", margin: "0 auto" }}>
                                        Whether you&apos;re looking to join a Leadership Circle, explore partnership opportunities,
                                        or initiate a strategic conversation, we&apos;re ready to connect.
                                    </p>
                                </AnimateOnScroll>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Form + Info */}
                <section style={{ backgroundColor: "#fff", padding: "90px 0 110px" }}>
                    <div className="container">
                        <div className="row gutter-y-30 align-items-start">
                            {/* Left: Form */}
                            <div className="col-lg-7">
                                <AnimateOnScroll direction="left">
                                    <div style={{
                                        background: "#fff", borderRadius: "18px", padding: "clamp(26px, 3.6vw, 38px)",
                                        border: "1px solid var(--tg-border-1)", boxShadow: "0 10px 40px rgba(11,26,74,0.06)",
                                    }}>
                                        <h2 style={{ fontSize: "21px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "18px" }}>
                                            Send us a Message
                                        </h2>

                                        {status === "success" ? (
                                            <div style={{ borderRadius: "14px", border: "1px solid #a7f3d0", background: "#ecfdf5", padding: "32px", textAlign: "center" }}>
                                                <div style={{ margin: "0 auto 16px", display: "flex", height: "48px", width: "48px", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "#d1fae5" }}>
                                                    <svg style={{ height: "24px", width: "24px", color: "#059669" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "4px" }}>Message sent</h3>
                                                <p style={{ fontSize: "16px", color: "var(--tg-body-color)", margin: 0 }}>Thanks for reaching out — our team will be in touch shortly.</p>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit} noValidate>
                                                <div className="row gutter-y-14">
                                                    <div className="col-12">
                                                        <label style={labelStyle}>Full Name<Required /></label>
                                                        <input type="text" value={name}
                                                            onChange={(e) => { setName(e.target.value); clearError("name") }}
                                                            placeholder="Your full name" className="contact-input"
                                                            style={{ ...inputStyle, ...(fieldErrors.name ? errorStyle : {}) }} />
                                                    </div>
                                                    <div className="col-12">
                                                        <label style={labelStyle}>Email Address<Required /></label>
                                                        <input type="email" value={email}
                                                            onChange={(e) => { setEmail(e.target.value); clearError("email") }}
                                                            placeholder="your.email@company.com" className="contact-input"
                                                            style={{ ...inputStyle, ...(fieldErrors.email ? errorStyle : {}) }} />
                                                    </div>
                                                    <div className="col-12">
                                                        <label style={labelStyle}>Phone Number</label>
                                                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                                                            placeholder="+1 (555) 123-4567" className="contact-input" style={inputStyle} />
                                                    </div>
                                                    <div className="col-12">
                                                        <label style={labelStyle}>Company</label>
                                                        <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                                                            placeholder="Your company name" className="contact-input" style={inputStyle} />
                                                    </div>
                                                    <div className="col-12">
                                                        <label style={labelStyle}>Message<Required /></label>
                                                        <textarea rows={6} value={message}
                                                            onChange={(e) => { setMessage(e.target.value); clearError("message") }}
                                                            placeholder="Tell us about your interest in joining Global CXO Circle..." className="contact-input"
                                                            style={{ ...inputStyle, resize: "vertical", ...(fieldErrors.message ? errorStyle : {}) }} />
                                                    </div>
                                                    <div className="col-12">
                                                        <button type="submit" disabled={status === "sending"} className="contact-submit-btn" style={{
                                                            width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px",
                                                            background: "var(--tg-color-gradient)", color: "#fff", border: "none", padding: "16px 24px",
                                                            borderRadius: "10px", fontWeight: 700, fontSize: "15px",
                                                            cursor: status === "sending" ? "not-allowed" : "pointer", opacity: status === "sending" ? 0.7 : 1,
                                                            transition: "all 0.3s ease",
                                                        }}>
                                                            {status === "sending" ? "Sending..." : "Send Message"} <i className="flaticon-paper-plane" style={{ fontSize: "15px" }}></i>
                                                        </button>
                                                        {(fieldErrors.name || fieldErrors.email || fieldErrors.message) && (
                                                            <p style={{ marginTop: "12px", textAlign: "center", fontSize: "13px", color: "#DC2626" }}>
                                                                Please fill in all required fields marked with *.
                                                            </p>
                                                        )}
                                                        {status === "error" && (
                                                            <p style={{ marginTop: "12px", textAlign: "center", fontSize: "13px", color: "#DC2626" }}>{errorMsg}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </AnimateOnScroll>
                            </div>

                            {/* Right: Info */}
                            <div className="col-lg-5">
                                <AnimateOnScroll direction="right" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                    {/* Contact Details */}
                                    <div style={{ background: "rgba(10,60,194,0.05)", border: "1px solid rgba(10,60,194,0.12)", borderRadius: "18px", padding: "30px" }}>
                                        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "22px" }}>Contact Details</h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                                <div style={{ width: "42px", height: "42px", flexShrink: 0, borderRadius: "50%", background: "var(--tg-color-gradient)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>
                                                    <i className="flaticon-envelope"></i>
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "3px" }}>Email</h4>
                                                    <a href="mailto:hello@globalcxocircle.com" style={{ fontSize: "14.5px", color: "var(--tg-theme-primary)", fontWeight: 600, textDecoration: "none" }}>
                                                        hello@globalcxocircle.com
                                                    </a>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                                <div style={{ width: "42px", height: "42px", flexShrink: 0, borderRadius: "50%", background: "var(--tg-color-gradient)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>
                                                    <i className="flaticon-placeholder"></i>
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "3px" }}>Headquarters</h4>
                                                    <p style={{ fontSize: "14.5px", color: "var(--tg-body-color)", margin: 0, lineHeight: 1.5 }}>
                                                        San Francisco, CA<br />Operating worldwide across 40+ countries.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Discovery Call */}
                                    <div style={{ background: "#fff", border: "1px solid var(--tg-border-1)", borderRadius: "18px", padding: "30px", textAlign: "center", boxShadow: "0 4px 18px rgba(11,26,74,0.05)" }}>
                                        <div style={{ width: "52px", height: "52px", margin: "0 auto 16px", borderRadius: "50%", background: "rgba(10,60,194,0.08)", color: "var(--tg-theme-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                                            <i className="flaticon-phone-call"></i>
                                        </div>
                                        <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "8px" }}>Book a Discovery Call</h3>
                                        <p style={{ fontSize: "14px", color: "var(--tg-body-color)", lineHeight: 1.6, marginBottom: "22px" }}>
                                            Schedule a 15-minute call to discuss your interest in joining our community.
                                        </p>
                                        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="schedule-call-btn" style={{
                                            display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--tg-color-gradient)", color: "#fff",
                                            padding: "13px 30px", borderRadius: "100px", fontWeight: 700, fontSize: "14.5px", textDecoration: "none", transition: "all 0.3s ease",
                                        }}>
                                            Schedule Call <span aria-hidden="true">→</span>
                                        </a>
                                    </div>

                                    {/* Response Time */}
                                    <div style={{ background: "rgba(10,60,194,0.05)", border: "1px solid rgba(10,60,194,0.12)", borderRadius: "18px", padding: "24px" }}>
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                            <div style={{ color: "var(--tg-theme-primary)", fontSize: "18px", marginTop: "1px", flexShrink: 0 }}>
                                                <i className="flaticon-clock"></i>
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "4px" }}>Response Time</h4>
                                                <p style={{ fontSize: "13.5px", color: "var(--tg-body-color)", margin: 0, lineHeight: 1.6 }}>
                                                    We typically respond to inquiries within 48 hours during business days.
                                                    For urgent matters, use the Discovery Call option above to connect directly.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </AnimateOnScroll>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <FooterThree />

            <style jsx global>{`
                .contact-input::placeholder { color: #9aa0ad; opacity: 1; }
                .contact-input:focus {
                    outline: none;
                    border-color: var(--tg-theme-primary) !important;
                    box-shadow: 0 4px 16px rgba(10,60,194,0.12), 0 0 0 3px rgba(10,60,194,0.1) !important;
                }
                .contact-submit-btn:not(:disabled):hover {
                    filter: brightness(1.08);
                    box-shadow: 0 8px 24px rgba(10,60,194,0.25);
                    transform: translateY(-1px);
                }
                .schedule-call-btn:hover {
                    filter: brightness(1.08);
                    box-shadow: 0 8px 22px rgba(10,60,194,0.25);
                    transform: translateY(-1px);
                }
                .gutter-y-14 { --bs-gutter-y: 14px; }
            `}</style>
        </>
    )
}

export default ContactPage
