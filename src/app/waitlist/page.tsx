"use client"

import { useState, useRef, type ReactNode } from "react"
import Link from "next/link"
import { motion, useInView, useScroll, useTransform } from "framer-motion"

const WEB3FORMS_ACCESS_KEY = "e2f3426f-24fd-472c-b564-50bac442e030"

function FadeUp({ children, delay = 0, style = {} }: { children: ReactNode; delay?: number; style?: React.CSSProperties }) {
   const ref = useRef(null)
   const inView = useInView(ref, { once: true, margin: "-60px" })
   return (
      <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}}
         transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0, 1] }} style={style}>
         {children}
      </motion.div>
   )
}

function ScaleIn({ children, delay = 0, style = {} }: { children: ReactNode; delay?: number; style?: React.CSSProperties }) {
   const ref = useRef(null)
   const inView = useInView(ref, { once: true, margin: "-40px" })
   return (
      <motion.div ref={ref} initial={{ opacity: 0, scale: 0.92 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
         transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0, 1] }} style={style}>
         {children}
      </motion.div>
   )
}

const inputStyle: React.CSSProperties = {
   width: "100%",
   borderRadius: "12px",
   border: "1px solid #e5e7eb",
   background: "#fff",
   padding: "14px 16px",
   fontSize: "14px",
   color: "#111827",
   outline: "none",
   transition: "all 0.2s ease",
   boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
}

const btnStyle: React.CSSProperties = {
   borderRadius: "12px",
   background: "var(--tg-color-gradient)",
   padding: "14px 24px",
   fontSize: "14px",
   fontWeight: 600,
   color: "#fff",
   border: "none",
   cursor: "pointer",
   boxShadow: "0 8px 24px rgba(10,60,194,0.25)",
   transition: "all 0.2s ease",
   whiteSpace: "nowrap",
}

function WaitlistForm({ variant = "default" }: { variant?: "default" | "hero" }) {
   const [name, setName] = useState("")
   const [email, setEmail] = useState("")
   const [linkedin, setLinkedin] = useState("")
   const [tier, setTier] = useState("cxo")
   const [submitting, setSubmitting] = useState(false)
   const [submitted, setSubmitted] = useState(false)
   const [error, setError] = useState<string | null>(null)

   const canSubmit = name.trim() && email.trim() && email.includes("@") && linkedin.trim()

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!canSubmit) return
      setSubmitting(true)
      try {
         const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               access_key: WEB3FORMS_ACCESS_KEY,
               name: name.trim(),
               email: email.trim(),
               linkedin: linkedin.trim(),
               tier,
               subject: `Waitlist Request from ${name.trim()} (${tier.toUpperCase()})`,
            }),
         })
         const data = (await res.json()) as { success?: boolean; message?: string }
         if (res.ok && data.success) {
            setSubmitted(true)
         } else {
            setError(data.message || "Something went wrong.")
         }
      } catch {
         setError("Service is temporarily unavailable. Please try again shortly.")
      } finally {
         setSubmitting(false)
      }
   }

   if (submitted) {
      return (
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ borderRadius: "16px", border: "1px solid #a7f3d0", background: "#ecfdf5", padding: "32px", textAlign: "center" }}>
            <div style={{ margin: "0 auto 12px", width: "48px", height: "48px", borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>
               <svg style={{ width: "24px", height: "24px", color: "#059669" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}>You&apos;re on the list</h3>
            <p style={{ marginTop: "4px", fontSize: "14px", color: "#6b7280" }}>We&apos;ll be in touch. CXO executives are prioritized.</p>
         </motion.div>
      )
   }

   if (error) {
      return (
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ borderRadius: "16px", border: "1px solid #fde68a", background: "#fffbeb", padding: "32px", textAlign: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}>Something went wrong</h3>
            <p style={{ marginTop: "4px", fontSize: "14px", color: "#6b7280" }}>{error}</p>
         </motion.div>
      )
   }

   if (variant === "hero") {
      return (
         <form onSubmit={handleSubmit} className="waitlist-hero-form">
            <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            <input type="email" placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <input type="url" placeholder="LinkedIn URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} style={inputStyle} />
            <select value={tier} onChange={(e) => setTier(e.target.value)} style={{ ...inputStyle, maxWidth: "130px" }}>
               <option value="cxo">CxO</option>
               <option value="startup">Startup</option>
               <option value="vc">VC</option>
            </select>
            <motion.button type="submit" disabled={!canSubmit || submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
               style={{ ...btnStyle, opacity: (!canSubmit || submitting) ? 0.4 : 1 }}>
               {submitting ? "..." : "Join Waitlist"}
            </motion.button>
         </form>
      )
   }

   return (
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
         <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
         <input type="email" placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
         <input type="url" placeholder="LinkedIn profile URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} style={inputStyle} />
         <select value={tier} onChange={(e) => setTier(e.target.value)} style={inputStyle}>
            <option value="cxo">CxO Executive</option>
            <option value="startup">Startup Founder</option>
            <option value="vc">Venture Capital</option>
         </select>
         <motion.button type="submit" disabled={!canSubmit || submitting} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            style={{ ...btnStyle, width: "100%", opacity: (!canSubmit || submitting) ? 0.4 : 1 }}>
            {submitting ? "Submitting..." : "Request Early Access"}
         </motion.button>
      </form>
   )
}

export default function WaitlistPage() {
   const heroRef = useRef(null)
   const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
   const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
   const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.97])

   return (
      <div style={{ minHeight: "100vh", background: "#fff", color: "#111827", overflowX: "hidden" }}>
         {/* Nav */}
         <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            style={{
               position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between",
               borderBottom: "1px solid #f3f4f6", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)",
               padding: "16px 24px",
            }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
               <img src="/cxo-circle-logo.png" alt="Global CXO Circle" style={{ height: "32px", width: "32px" }} />
               <span style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.01em", color: "#111827" }}>Global CXO Circle</span>
            </Link>
            <Link href="/" style={{ fontSize: "14px", color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }}>Home</Link>
         </motion.nav>

         {/* Hero */}
         <motion.section ref={heroRef} style={{ opacity: heroOpacity, scale: heroScale, position: "relative", maxWidth: "960px", margin: "0 auto", padding: "96px 24px 128px" }}>
            <div style={{
               position: "absolute", top: "-128px", left: "50%", transform: "translateX(-50%)",
               height: "500px", width: "700px", borderRadius: "50%",
               background: "linear-gradient(to bottom right, #dbeafe, #eef2ff, transparent)",
               filter: "blur(48px)", opacity: 0.6, pointerEvents: "none",
            }} />
            <div style={{ position: "relative", textAlign: "center" }}>
               <FadeUp>
                  <div style={{
                     display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "9999px",
                     border: "1px solid #bfdbfe", background: "#eff6ff", padding: "6px 16px", marginBottom: "24px",
                  }}>
                     <span className="waitlist-pulse" style={{ height: "6px", width: "6px", borderRadius: "50%", background: "#3b82f6" }} />
                     <span style={{ fontSize: "12px", fontWeight: 500, color: "#1d4ed8", letterSpacing: "0.05em" }}>Invite-Only Network</span>
                  </div>
               </FadeUp>
               <FadeUp delay={0.1}>
                  <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.02em", color: "#111827" }}>
                     From conversations
                     <br />
                     <span style={{ background: "linear-gradient(to right, #2563eb, #4f46e5, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        to enterprise outcomes
                     </span>
                  </h1>
               </FadeUp>
               <FadeUp delay={0.2}>
                  <p style={{ maxWidth: "560px", margin: "24px auto 0", fontSize: "18px", lineHeight: 1.7, color: "#6b7280" }}>
                     The CXO-led platform where enterprise technology leaders and startups
                     build advisory relationships that convert into real deals.
                  </p>
               </FadeUp>
               <FadeUp delay={0.3}>
                  <div style={{ maxWidth: "720px", margin: "40px auto 0" }}>
                     <WaitlistForm variant="hero" />
                     <p style={{ marginTop: "12px", textAlign: "center", fontSize: "12px", color: "#9ca3af" }}>CXO executives are prioritized. No spam, ever.</p>
                  </div>
               </FadeUp>
            </div>
         </motion.section>

         {/* Stats */}
         <section style={{ maxWidth: "768px", margin: "0 auto", padding: "0 24px 128px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "48px", flexWrap: "wrap" }}>
               {[
                  { label: "Enterprise CXOs", value: "500+" },
                  { label: "Startups", value: "60+" },
                  { label: "Advisory Hours", value: "1,200+" },
               ].map((stat, i) => (
                  <ScaleIn key={stat.label} delay={i * 0.1}>
                     <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#111827" }}>{stat.value}</p>
                        <p style={{ marginTop: "4px", fontSize: "11px", fontWeight: 500, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>{stat.label}</p>
                     </div>
                  </ScaleIn>
               ))}
            </div>
         </section>

         {/* Logo Carousel */}
         <section style={{ paddingBottom: "96px", overflow: "hidden" }}>
            <FadeUp>
               <p style={{ textAlign: "center", fontSize: "11px", fontWeight: 500, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "32px" }}>
                  Leaders from these organizations have joined the network
               </p>
            </FadeUp>
            <div style={{ position: "relative" }}>
               <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "96px", background: "linear-gradient(to right, #fff, transparent)", zIndex: 10 }} />
               <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "96px", background: "linear-gradient(to left, #fff, transparent)", zIndex: 10 }} />
               <div className="waitlist-logo-scroll" style={{ display: "flex", width: "max-content" }}>
                  {[...Array(2)].map((_, setIdx) => (
                     <div key={setIdx} style={{ display: "flex", alignItems: "center", gap: "48px", padding: "0 24px" }}>
                        {[
                           { name: "AWS", domain: "aws.amazon.com" },
                           { name: "Accenture", domain: "accenture.com" },
                           { name: "BCG", domain: "bcg.com" },
                           { name: "General Motors", domain: "gm.com" },
                           { name: "Philips", domain: "philips.com" },
                           { name: "Oracle", domain: "oracle.com" },
                           { name: "J&J", domain: "jnj.com" },
                           { name: "KPMG", domain: "kpmg.com" },
                           { name: "SABIC", domain: "sabic.com" },
                           { name: "NTT", domain: "ntt.com" },
                           { name: "Rakuten", domain: "rakuten.com" },
                           { name: "Saint-Gobain", domain: "saint-gobain.com" },
                           { name: "Sequoia", domain: "sequoiacap.com" },
                           { name: "Accel", domain: "accel.com" },
                           { name: "Whatfix", domain: "whatfix.com" },
                           { name: "Zuora", domain: "zuora.com" },
                           { name: "LSEG", domain: "lseg.com" },
                           { name: "Klaviyo", domain: "klaviyo.com" },
                           { name: "Sprinto", domain: "sprinto.com" },
                           { name: "CloudSEK", domain: "cloudsek.com" },
                           { name: "Atomicwork", domain: "atomicwork.com" },
                           { name: "Rocketlane", domain: "rocketlane.com" },
                        ].map((co) => (
                           <a key={`${setIdx}-${co.name}`} href={`https://${co.domain}`} target="_blank" rel="noopener noreferrer">
                              <img
                                 src={`https://img.logo.dev/${co.domain}?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ&size=60&format=png`}
                                 alt={co.name}
                                 title={co.name}
                                 className="waitlist-logo-img"
                                 style={{ height: "40px", width: "auto", objectFit: "contain", filter: "grayscale(1)", opacity: 0.6, transition: "all 0.3s ease", cursor: "pointer" }}
                                 loading="lazy"
                              />
                           </a>
                        ))}
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* How It Works */}
         <section style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px 128px" }}>
            <FadeUp>
               <div style={{ textAlign: "center", marginBottom: "64px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>How It Works</p>
                  <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#111827" }}>Two engines of enterprise value</h2>
                  <p style={{ marginTop: "12px", fontSize: "16px", color: "#6b7280", maxWidth: "480px", margin: "12px auto 0" }}>Structured programs that convert relationships into measurable outcomes.</p>
               </div>
            </FadeUp>
            <div className="waitlist-grid-2">
               <FadeUp delay={0.1}>
                  <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                     className="waitlist-program-card"
                     style={{
                        borderRadius: "24px", border: "1px solid #e5e7eb", background: "#fff", padding: "32px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "all 0.3s ease", height: "100%",
                     }}>
                     <div style={{
                        marginBottom: "24px", display: "inline-flex", height: "48px", width: "48px",
                        alignItems: "center", justifyContent: "center", borderRadius: "16px",
                        background: "#eff6ff", color: "#2563eb",
                     }}>
                        <svg style={{ height: "24px", width: "24px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                     </div>
                     <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>Advisory Circle Program</h3>
                     <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#6b7280", marginBottom: "20px" }}>
                        Structured access to enterprise CXOs for validation, go-to-market strategy, and enterprise readiness. Build your custom advisory circle.
                     </p>
                     <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {["CXO Matching", "Session Tracking", "Hour Management"].map((tag) => (
                           <span key={tag} style={{ borderRadius: "8px", background: "#f3f4f6", padding: "4px 12px", fontSize: "12px", fontWeight: 500, color: "#4b5563" }}>{tag}</span>
                        ))}
                     </div>
                  </motion.div>
               </FadeUp>
               <FadeUp delay={0.2}>
                  <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                     className="waitlist-program-card"
                     style={{
                        borderRadius: "24px", border: "1px solid #e5e7eb", background: "#fff", padding: "32px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "all 0.3s ease", height: "100%",
                     }}>
                     <div style={{
                        marginBottom: "24px", display: "inline-flex", height: "48px", width: "48px",
                        alignItems: "center", justifyContent: "center", borderRadius: "16px",
                        background: "#eef2ff", color: "#4f46e5",
                     }}>
                        <svg style={{ height: "24px", width: "24px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                     </div>
                     <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>Introductions & Deal Flow</h3>
                     <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#6b7280", marginBottom: "20px" }}>
                        CXO-endorsed warm introductions and structured deal conversion. From qualified referrals to closed enterprise contracts.
                     </p>
                     <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {["Warm Intros", "Deal Attribution", "Boomerang AI"].map((tag) => (
                           <span key={tag} style={{ borderRadius: "8px", background: "#f3f4f6", padding: "4px 12px", fontSize: "12px", fontWeight: 500, color: "#4b5563" }}>{tag}</span>
                        ))}
                     </div>
                  </motion.div>
               </FadeUp>
            </div>
         </section>

         {/* Member Tiers */}
         <section style={{ background: "#f9fafb", padding: "128px 0" }}>
            <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px" }}>
               <FadeUp>
                  <div style={{ textAlign: "center", marginBottom: "64px" }}>
                     <p style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>The Network</p>
                     <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#111827" }}>Built for enterprise leaders</h2>
                  </div>
               </FadeUp>
               <div className="waitlist-grid-4">
                  {[
                     { tier: "CXO", desc: "CIO, CTO, CISO, CRO, CFO", color: "#3b82f6" },
                     { tier: "CXO-1", desc: "SVP, VP, Directors", color: "#6366f1" },
                     { tier: "Startups", desc: "Founders & leadership teams", color: "#06b6d4" },
                     { tier: "Venture", desc: "VC firms & strategic partners", color: "#10b981" },
                  ].map((t, i) => (
                     <ScaleIn key={t.tier} delay={i * 0.08} style={{ height: "100%" }}>
                        <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
                           style={{
                              height: "100%", borderRadius: "16px", border: "1px solid #e5e7eb",
                              background: "#fff", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                              transition: "box-shadow 0.2s ease",
                           }}>
                           <div style={{ marginBottom: "16px", height: "8px", width: "32px", borderRadius: "9999px", background: t.color }} />
                           <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>{t.tier}</h3>
                           <p style={{ marginTop: "4px", fontSize: "14px", color: "#6b7280" }}>{t.desc}</p>
                        </motion.div>
                     </ScaleIn>
                  ))}
               </div>
            </div>
         </section>

         {/* Quote */}
         <section style={{ padding: "128px 0" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px" }}>
               <FadeUp>
                  <div style={{ textAlign: "center" }}>
                     <div style={{ margin: "0 auto 24px", height: "1px", width: "48px", background: "linear-gradient(to right, transparent, #60a5fa, transparent)" }} />
                     <p style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 500, lineHeight: 1.6, color: "#374151" }}>
                        The best enterprise deals start with a conversation between the right people.
                        <span style={{ color: "#9ca3af" }}> We make sure that conversation happens.</span>
                     </p>
                     <div style={{ margin: "24px auto 0", height: "1px", width: "48px", background: "linear-gradient(to right, transparent, #60a5fa, transparent)" }} />
                  </div>
               </FadeUp>
            </div>
         </section>

         {/* Bottom CTA */}
         <section style={{ background: "#f9fafb", padding: "128px 0" }}>
            <div style={{ maxWidth: "560px", margin: "0 auto", padding: "0 24px" }}>
               <FadeUp>
                  <div style={{ textAlign: "center", marginBottom: "32px" }}>
                     <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#111827" }}>Ready to join?</h2>
                     <p style={{ marginTop: "8px", fontSize: "14px", color: "#6b7280" }}>CXO executives are prioritized for early access.</p>
                  </div>
               </FadeUp>
               <FadeUp delay={0.1}>
                  <WaitlistForm />
                  <p style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "#9ca3af" }}>
                     By joining, you agree to our <Link href="/terms-of-service" style={{ textDecoration: "underline", color: "inherit" }}>Terms</Link> and <Link href="/privacy-policy" style={{ textDecoration: "underline", color: "inherit" }}>Privacy Policy</Link>.
                  </p>
               </FadeUp>
            </div>
         </section>

         {/* Footer */}
         <footer style={{ borderTop: "1px solid #f3f4f6", padding: "32px 0", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "#9ca3af" }}>&copy; {new Date().getFullYear()} Global CXO Circle. All rights reserved.</p>
         </footer>

         <style jsx>{`
            @keyframes scroll {
               0% { transform: translateX(0); }
               100% { transform: translateX(-50%); }
            }
            @keyframes pulse {
               0%, 100% { opacity: 1; }
               50% { opacity: 0.5; }
            }
            .waitlist-pulse {
               animation: pulse 2s ease-in-out infinite;
            }
            .waitlist-logo-scroll {
               animation: scroll 45s linear infinite;
            }
            .waitlist-logo-scroll:hover {
               animation-play-state: paused;
            }
            .waitlist-logo-img:hover {
               filter: grayscale(0) !important;
               opacity: 1 !important;
            }
            .waitlist-hero-form {
               display: flex;
               gap: 12px;
               flex-wrap: wrap;
               justify-content: center;
            }
            .waitlist-hero-form input,
            .waitlist-hero-form select {
               flex: 1 1 200px;
               min-width: 0;
            }
            .waitlist-hero-form select {
               flex: 0 0 130px;
            }
            .waitlist-hero-form button {
               flex: 0 0 auto;
            }
            .waitlist-grid-2 {
               display: grid;
               grid-template-columns: 1fr 1fr;
               gap: 24px;
            }
            .waitlist-grid-4 {
               display: grid;
               grid-template-columns: repeat(4, 1fr);
               gap: 16px;
            }
            .waitlist-program-card:hover {
               box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
               border-color: #bfdbfe !important;
            }
            @media (max-width: 768px) {
               .waitlist-grid-2 {
                  grid-template-columns: 1fr;
               }
               .waitlist-grid-4 {
                  grid-template-columns: 1fr 1fr;
               }
               .waitlist-hero-form {
                  flex-direction: column;
               }
               .waitlist-hero-form input,
               .waitlist-hero-form select {
                  flex: 1 1 auto;
               }
               .waitlist-hero-form select {
                  flex: 1 1 auto;
                  max-width: none !important;
               }
            }
            @media (max-width: 480px) {
               .waitlist-grid-4 {
                  grid-template-columns: 1fr;
               }
            }
         `}</style>
      </div>
   )
}
