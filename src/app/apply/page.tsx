"use client"
import React, { useState } from "react"
import HeaderFive from "@/layouts/headers/HeaderFive"
import FooterThree from "@/layouts/footers/FooterThree"

const ApplyPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        company: "",
        linkedin: "",
        interest: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Application submitted successfully. We will review and get back to you.");
        setFormData({ name: "", role: "", company: "", linkedin: "", interest: "" });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <>
            <HeaderFive />
            <main className="main-area fix" style={{ paddingTop: "120px", paddingBottom: "120px", backgroundColor: "#f8f9fa" }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="row align-items-center bg-white" style={{ borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}>
                                {/* Left Side: Trust Stats */}
                                <div className="col-lg-5 p-0" style={{ height: "100%", background: "var(--tg-theme-primary)", color: "#fff", padding: "60px 40px" }}>
                                    <div style={{ padding: "60px 40px" }}>
                                        <h2 style={{ fontSize: "36px", fontWeight: 700, color: "#fff", marginBottom: "24px" }}>Request Membership</h2>
                                        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", marginBottom: "40px", lineHeight: 1.6 }}>
                                            Global CXO Circle is a highly curated ecosystem for executive leaders. Apply to join our next cohort.
                                        </p>
                                        
                                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                            <div>
                                                <h3 style={{ fontSize: "32px", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>40+</h3>
                                                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>Countries Represented</p>
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: "32px", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>7</h3>
                                                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>Specialized Circles</p>
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: "32px", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>100%</h3>
                                                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>Curated Engagement</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Right Side: Form */}
                                <div className="col-lg-7">
                                    <div style={{ padding: "60px 40px" }}>
                                        <form onSubmit={handleSubmit}>
                                            <div className="row">
                                                <div className="col-12 mb-4">
                                                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--tg-heading-color)", marginBottom: "8px" }}>Full Name *</label>
                                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#F9FAFB", fontSize: "15px" }} />
                                                </div>
                                                <div className="col-12 mb-4">
                                                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--tg-heading-color)", marginBottom: "8px" }}>Company *</label>
                                                    <input type="text" name="company" value={formData.company} onChange={handleChange} required style={{ width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#F9FAFB", fontSize: "15px" }} />
                                                </div>
                                                <div className="col-12 mb-4">
                                                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--tg-heading-color)", marginBottom: "8px" }}>Role / Title *</label>
                                                    <input type="text" name="role" value={formData.role} onChange={handleChange} required style={{ width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#F9FAFB", fontSize: "15px" }} />
                                                </div>
                                                <div className="col-12 mb-4">
                                                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--tg-heading-color)", marginBottom: "8px" }}>LinkedIn Profile URL *</label>
                                                    <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} required style={{ width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#F9FAFB", fontSize: "15px" }} />
                                                </div>
                                                <div className="col-12 mb-5">
                                                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--tg-heading-color)", marginBottom: "8px" }}>Area of Interest *</label>
                                                    <select name="interest" value={formData.interest} onChange={handleChange} required style={{ width: "100%", padding: "14px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#F9FAFB", fontSize: "15px" }}>
                                                        <option value="">Select a Circle...</option>
                                                        <option value="cio">Global CIO Circle</option>
                                                        <option value="cto">Global CTO Circle</option>
                                                        <option value="ciso">Global CISO Circle</option>
                                                        <option value="cfo">Global CFO Circle</option>
                                                        <option value="cro">Global CRO Circle</option>
                                                        <option value="ceo">Global CEO Circle</option>
                                                        <option value="founder">Global Founder Circle</option>
                                                        <option value="partner">Partnership Inquiry</option>
                                                    </select>
                                                </div>
                                                <div className="col-12">
                                                    <button type="submit" style={{ width: "100%", padding: "16px", background: "var(--tg-theme-primary)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>
                                                        Submit Application
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <FooterThree />
        </>
    )
}

export default ApplyPage
