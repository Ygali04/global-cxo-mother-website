"use client"
import React, { useState } from "react"
import Link from "next/link"
import AnimateOnScroll from "@/components/ui/AnimateOnScroll"

const faqs = [
    {
        question: "Who can join the Global CXO Circle?",
        answer: "Sitting CIOs, CTOs, CDOs, and equivalent senior technology leaders from organizations with over $1B revenue. Membership is complimentary and invitation-only.",
    },
    {
        question: "Is the circle vendor-neutral?",
        answer: "Yes. We maintain strict vendor neutrality with zero pay-to-play policies. Vendor presence is limited to sponsor lounges, ensuring peer-to-peer sessions remain unbiased.",
    },
    {
        question: "How often are events held?",
        answer: "We host our flagship summit annually, plus quarterly virtual roundtables and regional meetups. Special forums and retreats are organized based on member interest and current industry needs.",
    },
    {
        question: "Can analysts and press attend?",
        answer: "Select sessions are open to accredited analysts and journalists on request. However, our core peer-to-peer sessions remain exclusive to ensure confidential discussions.",
    },
    {
        question: "Is there a virtual-only option?",
        answer: "Yes — quarterly roundtables and select keynotes are streamed live to members. We also offer virtual networking sessions and special briefings for remote participation.",
    },
]

const FAQAccordion = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="section-py-130" style={{ backgroundColor: "#eef2fb", paddingTop: "90px" }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <AnimateOnScroll>
                            <div className="text-center" style={{ marginBottom: "36px" }}>
                                <span style={{
                                    background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                    fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", fontSize: "12px",
                                    marginBottom: "6px", display: "inline-block",
                                }}>
                                    FAQ
                                </span>
                                <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 700, color: "var(--tg-heading-color)" }}>
                                    Frequently Asked Questions
                                </h2>
                            </div>
                        </AnimateOnScroll>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {faqs.map((faq, i) => {
                                const open = openIndex === i
                                return (
                                    <AnimateOnScroll key={i} delay={0.05 * i}>
                                        <div style={{
                                            border: "1px solid var(--tg-border-1)", borderRadius: "12px", overflow: "hidden",
                                            background: open ? "#fff" : "#fff", boxShadow: open ? "0 4px 18px rgba(11,26,74,0.05)" : "none",
                                            transition: "all 0.3s ease",
                                        }}>
                                            <button
                                                onClick={() => toggleAccordion(i)}
                                                aria-expanded={open}
                                                style={{
                                                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                                                    gap: "16px", padding: "22px 26px", background: "transparent", border: "none",
                                                    cursor: "pointer", textAlign: "left",
                                                }}
                                            >
                                                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--tg-heading-color)" }}>
                                                    {faq.question}
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
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </AnimateOnScroll>
                                )
                            })}
                        </div>

                        <AnimateOnScroll delay={0.1}>
                            <div className="text-center" style={{ marginTop: "48px" }}>
                                <p style={{ fontSize: "16px", color: "var(--tg-body-color)", marginBottom: "20px" }}>
                                    Got more questions? We&apos;re here to help.
                                </p>
                                <Link href="/contact" className="faq-contact-btn" style={{
                                    display: "inline-flex", alignItems: "center", gap: "8px",
                                    background: "var(--tg-color-gradient)", color: "#fff", padding: "15px 34px",
                                    borderRadius: "100px", fontWeight: 700, fontSize: "15px", textDecoration: "none",
                                    boxShadow: "0 10px 30px rgba(10,60,194,0.2)", transition: "all 0.3s ease",
                                }}>
                                    Get in Touch <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </AnimateOnScroll>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .faq-contact-btn:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.08);
                    box-shadow: 0 14px 34px rgba(10,60,194,0.28);
                }
            `}</style>
        </section>
    )
}

export default FAQAccordion
