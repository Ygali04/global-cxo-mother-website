"use client"
import React, { useState } from "react"
import Link from "next/link"
import HeaderFive from "@/layouts/headers/HeaderFive"
import FooterThree from "@/layouts/footers/FooterThree"
import AnimateOnScroll from "@/components/ui/AnimateOnScroll"

type Plan = {
    id: string
    icon: string
    name: string
    desc: string
    price: string
    priceSuffix?: string
    priceNote: string
    features: string[]
    cta: string
    ctaHref: string
    featured?: boolean
}

const plans: Plan[] = [
    {
        id: "startup",
        icon: "flaticon-startup",
        name: "Startup Membership",
        desc: "For high-growth startups seeking structured CxO advisory, enterprise introductions, and mentorship from world-class technology leaders.",
        price: "$10,000",
        priceSuffix: "+ 0.25% equity",
        priceNote: "per program cycle",
        features: [
            "10 hours of dedicated CxO advisory time",
            "Matched with relevant CIOs, CTOs, and CISOs",
            "Structured session cadence with action items",
            "Warm introductions to enterprise buyers",
            "Private event invitations and roundtables",
            "Startup profile on the GCIO platform",
        ],
        cta: "Apply for Startup Membership",
        ctaHref: "/waitlist",
        featured: true,
    },
    {
        id: "cxo",
        icon: "flaticon-briefcase",
        name: "CxO Membership",
        desc: "For CIOs, CTOs, CISOs, and senior technology executives who want to give back through advisory, expand their network, and earn consulting income.",
        price: "$500 – $2,000",
        priceSuffix: "/hr",
        priceNote: "consulting rates",
        features: [
            "Advisory sessions with curated startups",
            "Set your own consulting rate",
            "Flexible scheduling via the GCIO platform",
            "Session prep materials and context briefs",
            "Private CxO peer-network access",
            "Exclusive fireside chats and summits",
        ],
        cta: "Apply for CxO Membership",
        ctaHref: "/waitlist",
    },
    {
        id: "vc",
        icon: "flaticon-growth",
        name: "VC / Investor",
        desc: "For venture capitalists and investors seeking deal flow, co-investment opportunities, and relationships with enterprise technology leaders.",
        price: "Complimentary",
        priceNote: "by invitation",
        features: [
            "Access to GCIO startup portfolio",
            "Co-investment opportunity alerts",
            "CxO introductions for due diligence",
            "Investor-only roundtable events",
            "Network intelligence and trend reports",
            "Complimentary — invitation only",
        ],
        cta: "Request an Invitation",
        ctaHref: "/waitlist",
    },
]

const faqs = [
    {
        q: "What does the 0.25% equity commitment mean?",
        a: "Startup members contribute a small equity stake to align incentives with the advisory network. This ensures CxO advisors are invested in your success, not just billing hours.",
    },
    {
        q: "What happens after the 10 included hours?",
        a: "Additional advisory hours are billed at the CxO's published consulting rate ($500–$2,000/hr depending on the advisor). You'll see cost estimates before requesting extra sessions.",
    },
    {
        q: "How are CxO consulting rates determined?",
        a: "Each CxO sets their own rate within the $500–$2,000/hr range based on their experience, specialization, and availability. The first hour of any new advisory relationship is non-billable to ensure mutual fit.",
    },
    {
        q: "Is the VC membership really free?",
        a: "Yes. VC and investor memberships are complimentary and by invitation only. We value the capital and market perspective investors bring to our ecosystem.",
    },
]

const Check = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const PricingPage = () => {
    const [openFaq, setOpenFaq] = useState<number>(0)

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
                                        fontWeight: 700, textTransform: "uppercase",
                                        letterSpacing: "2px", fontSize: "12px", marginBottom: "16px", display: "inline-block",
                                    }}>
                                        Membership Pricing
                                    </span>
                                    <h1 style={{
                                        fontSize: "clamp(36px, 4.5vw, 52px)", fontWeight: 800, color: "var(--tg-heading-color)",
                                        marginBottom: "20px", lineHeight: 1.15,
                                    }}>
                                        Transparent Pricing for{" "}
                                        <span style={{
                                            background: "var(--tg-color-gradient)",
                                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                        }}>
                                            Every Member
                                        </span>
                                    </h1>
                                    <p style={{
                                        fontSize: "17px", color: "var(--tg-body-color)", lineHeight: 1.7,
                                        maxWidth: "660px", margin: "0 auto",
                                    }}>
                                        Whether you&apos;re a startup seeking enterprise mentorship, a CxO sharing your expertise,
                                        or an investor looking for deal flow — there&apos;s a place for you in the Global CIO Circle.
                                    </p>
                                </AnimateOnScroll>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing cards */}
                <section style={{ backgroundColor: "#f8f9fa", paddingBottom: "130px", paddingTop: "20px" }}>
                    <div className="container">
                        <div className="row gutter-y-30 justify-content-center">
                            {plans.map((plan, i) => (
                                <div key={plan.id} className="col-lg-4 col-md-6">
                                    <AnimateOnScroll delay={0.1 * i} className="h-100">
                                        <div className={`pricing-card${plan.featured ? " pricing-card--featured" : ""}`} style={{
                                            background: "#fff",
                                            borderRadius: "16px",
                                            padding: "36px 32px",
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            border: plan.featured ? "2px solid var(--tg-theme-primary)" : "1px solid var(--tg-border-1)",
                                            boxShadow: plan.featured ? "0 16px 48px rgba(11,26,74,0.14)" : "0 1px 3px rgba(11,26,74,0.06)",
                                            position: "relative",
                                            transition: "all 0.3s ease",
                                        }}>
                                            {plan.featured && (
                                                <span style={{
                                                    position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)",
                                                    background: "var(--tg-color-gradient)", color: "#fff", fontSize: "11px", fontWeight: 700,
                                                    textTransform: "uppercase", letterSpacing: "1px", padding: "6px 18px", borderRadius: "20px",
                                                    whiteSpace: "nowrap", boxShadow: "0 6px 18px rgba(10,60,194,0.28)",
                                                }}>
                                                    Most Popular
                                                </span>
                                            )}

                                            <div style={{ marginBottom: "20px", color: "var(--tg-theme-primary)", fontSize: "34px", lineHeight: 1 }}>
                                                <i className={plan.icon}></i>
                                            </div>
                                            <h3 style={{ fontSize: "22px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "12px" }}>
                                                {plan.name}
                                            </h3>
                                            <p style={{ fontSize: "14px", color: "var(--tg-body-color)", lineHeight: 1.65, marginBottom: "24px" }}>
                                                {plan.desc}
                                            </p>

                                            <div style={{ marginBottom: "28px" }}>
                                                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                                    <span style={{ fontSize: "34px", fontWeight: 800, color: "var(--tg-heading-color)", lineHeight: 1.1 }}>
                                                        {plan.price}
                                                    </span>
                                                    {plan.priceSuffix && (
                                                        <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--tg-body-color)" }}>
                                                            {plan.priceSuffix}
                                                        </span>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: "13px", color: "#8a90a0", marginTop: "6px", display: "inline-block" }}>
                                                    {plan.priceNote}
                                                </span>
                                            </div>

                                            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px 0", flexGrow: 1 }}>
                                                {plan.features.map((f, idx) => (
                                                    <li key={idx} style={{
                                                        display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "14px",
                                                        fontSize: "14.5px", color: "var(--tg-heading-color)", lineHeight: 1.5,
                                                    }}>
                                                        <span style={{ color: "var(--tg-theme-primary)" }}><Check /></span>
                                                        <span>{f}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <Link href={plan.ctaHref} className={`pricing-btn${plan.featured ? " pricing-btn--primary" : ""}`} style={{
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                                textAlign: "center", padding: "15px 24px", borderRadius: "8px",
                                                fontWeight: 700, fontSize: "15px", textDecoration: "none",
                                                transition: "all 0.3s ease",
                                                ...(plan.featured
                                                    ? { background: "var(--tg-color-gradient)", color: "#fff", border: "1px solid transparent" }
                                                    : { background: "#fff", color: "var(--tg-heading-color)", border: "1px solid var(--tg-border-1)" }),
                                            }}>
                                                {plan.cta} <span aria-hidden="true">→</span>
                                            </Link>
                                        </div>
                                    </AnimateOnScroll>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="section-py-130" style={{ backgroundColor: "#fff", paddingTop: "100px", paddingBottom: "50px" }}>
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <AnimateOnScroll>
                                    <h2 style={{
                                        fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 700, color: "var(--tg-heading-color)",
                                        textAlign: "center", marginBottom: "48px",
                                    }}>
                                        Frequently Asked Questions
                                    </h2>
                                </AnimateOnScroll>

                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {faqs.map((faq, i) => {
                                        const open = openFaq === i
                                        return (
                                            <AnimateOnScroll key={i} delay={0.05 * i}>
                                                <div style={{
                                                    border: "1px solid var(--tg-border-1)", borderRadius: "12px", overflow: "hidden",
                                                    background: open ? "#f7f8fc" : "#fff", transition: "background 0.3s ease",
                                                }}>
                                                    <button
                                                        onClick={() => setOpenFaq(open ? -1 : i)}
                                                        aria-expanded={open}
                                                        style={{
                                                            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                                                            gap: "16px", padding: "22px 26px", background: "transparent", border: "none",
                                                            cursor: "pointer", textAlign: "left",
                                                        }}
                                                    >
                                                        <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--tg-heading-color)" }}>
                                                            {faq.q}
                                                        </span>
                                                        <span style={{
                                                            flexShrink: 0, width: "26px", height: "26px", borderRadius: "50%",
                                                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
                                                            background: open ? "var(--tg-color-gradient)" : "rgba(10,60,194,0.08)",
                                                            color: open ? "#fff" : "var(--tg-theme-primary)",
                                                            transform: open ? "rotate(45deg)" : "none", transition: "all 0.3s ease",
                                                        }}>
                                                            +
                                                        </span>
                                                    </button>
                                                    <div style={{
                                                        maxHeight: open ? "260px" : "0", overflow: "hidden",
                                                        transition: "max-height 0.35s ease",
                                                    }}>
                                                        <p style={{
                                                            fontSize: "15px", color: "var(--tg-body-color)", lineHeight: 1.7,
                                                            margin: 0, padding: "0 26px 24px",
                                                        }}>
                                                            {faq.a}
                                                        </p>
                                                    </div>
                                                </div>
                                            </AnimateOnScroll>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section style={{ paddingBottom: "80px", backgroundColor: "#fff" }}>
                    <div className="container">
                        <AnimateOnScroll>
                            <div style={{
                                background: "linear-gradient(150deg, #0B1A4A 0%, #0A3CC2 100%)",
                                borderRadius: "20px", padding: "clamp(32px, 3vw, 44px) 32px", textAlign: "center",
                                position: "relative", overflow: "hidden",
                            }}>
                                <div style={{
                                    position: "absolute", bottom: "-100px", left: "-60px", width: "360px", height: "360px",
                                    borderRadius: "50%", background: "radial-gradient(circle, rgba(179,0,185,0.3) 0%, rgba(179,0,185,0) 70%)",
                                }} />
                                <div style={{ position: "relative", zIndex: 2 }}>
                                    <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 800, color: "#fff", marginBottom: "12px" }}>
                                        Ready to Get Started?
                                    </h2>
                                    <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", maxWidth: "520px", margin: "0 auto 28px" }}>
                                        Submit your interest and our team will review your application within 48 hours.
                                    </p>
                                    <Link href="/waitlist" className="cta-apply-btn" style={{
                                        display: "inline-flex", alignItems: "center", gap: "8px",
                                        background: "#fff", color: "var(--tg-theme-primary)", padding: "14px 34px",
                                        borderRadius: "8px", fontWeight: 700, fontSize: "15px", textDecoration: "none",
                                        transition: "all 0.3s ease",
                                    }}>
                                        Apply Now <span aria-hidden="true">→</span>
                                    </Link>
                                </div>
                            </div>
                        </AnimateOnScroll>
                    </div>
                </section>
            </main>
            <FooterThree />

            <style jsx>{`
                .pricing-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 18px 45px rgba(11,26,74,0.12) !important;
                }
                .pricing-card--featured:hover {
                    box-shadow: 0 22px 55px rgba(11,26,74,0.2) !important;
                }
                .pricing-btn--primary:hover {
                    filter: brightness(1.08);
                    box-shadow: 0 8px 24px rgba(10,60,194,0.28);
                    transform: translateY(-2px);
                }
                .pricing-btn:not(.pricing-btn--primary):hover {
                    border-color: var(--tg-theme-primary) !important;
                    color: var(--tg-theme-primary) !important;
                }
                .cta-apply-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
            `}</style>
        </>
    )
}

export default PricingPage
