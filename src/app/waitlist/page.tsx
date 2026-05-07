"use client"

import { useState, useRef, type ReactNode } from "react"
import Link from "next/link"
import { motion, useInView, useScroll, useTransform } from "framer-motion"

const API_BASE_URL = "https://gcio-backend-production.up.railway.app/api"

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */
function FadeUp({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0, 1] }} className={className}>
      {children}
    </motion.div>
  )
}

function ScaleIn({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, scale: 0.92 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0, 1] }} className={className}>
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Waitlist form                                                       */
/* ------------------------------------------------------------------ */
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
      const res = await fetch(`${API_BASE_URL}/membership-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          linkedin: linkedin.trim(),
          company: "",
          role: "",
          tier,
          source: "waitlist",
        }),
      })
      const contentType = res.headers.get("content-type") ?? ""
      const parsed = contentType.includes("application/json") ? await res.json() : await res.text()
      if (res.ok) {
        setSubmitted(true)
      } else if (res.status === 409) {
        setError(typeof parsed === "object" && parsed?.detail ? String(parsed.detail) : "You are already on the waitlist.")
      } else {
        setError(typeof parsed === "object" && parsed?.detail ? String(parsed.detail) : "Something went wrong.")
      }
    } catch {
      setError("Service is temporarily unavailable. Please try again shortly.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">You&apos;re on the list</h3>
        <p className="mt-1 text-sm text-gray-500">We&apos;ll be in touch. CXO executives are prioritized.</p>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </motion.div>
    )
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"

  if (variant === "hero") {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} sm:flex-1`} />
        <input type="email" placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} sm:flex-1`} />
        <input type="url" placeholder="LinkedIn URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={`${inputClass} sm:flex-1`} />
        <select value={tier} onChange={(e) => setTier(e.target.value)} className={`${inputClass} sm:w-32`}>
          <option value="cxo">CxO</option>
          <option value="startup">Startup</option>
          <option value="vc">VC</option>
        </select>
        <motion.button type="submit" disabled={!canSubmit || submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-colors disabled:opacity-40 whitespace-nowrap">
          {submitting ? "..." : "Join Waitlist"}
        </motion.button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      <input type="email" placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      <input type="url" placeholder="LinkedIn profile URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={inputClass} />
      <select value={tier} onChange={(e) => setTier(e.target.value)} className={inputClass}>
        <option value="cxo">CxO Executive</option>
        <option value="startup">Startup Founder</option>
        <option value="vc">Venture Capital</option>
      </select>
      <motion.button type="submit" disabled={!canSubmit || submitting} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-colors disabled:opacity-40">
        {submitting ? "Submitting..." : "Request Early Access"}
      </motion.button>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */
export default function WaitlistPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.97])

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* ── Sticky nav ── */}
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-xl px-6 py-4 sm:px-12">
        <Link href="/" className="flex items-center gap-3">
          <img src="/cxo-circle-logo.png" alt="Global CXO Circle" className="h-8 w-8" />
          <span className="text-sm font-semibold tracking-tight text-gray-900">Global CXO Circle</span>
        </Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
      </motion.nav>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HERO                                                          */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <motion.section ref={heroRef} style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative mx-auto max-w-5xl px-6 pt-24 pb-32 sm:px-12 sm:pt-32">
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-gradient-to-br from-blue-100 via-indigo-50 to-transparent blur-3xl opacity-60" />

        <div className="relative text-center">
          <FadeUp>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-medium text-blue-700 tracking-wide">Invite-Only Network</span>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              From conversations
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                to enterprise outcomes
              </span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-500">
              The CXO-led platform where enterprise technology leaders and startups
              build advisory relationships that convert into real deals.
            </p>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className="mx-auto mt-10 max-w-3xl">
              <WaitlistForm variant="hero" />
              <p className="mt-3 text-center text-xs text-gray-400">CXO executives are prioritized. No spam, ever.</p>
            </div>
          </FadeUp>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* STATS                                                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-4xl px-6 pb-32 sm:px-12">
        <div className="flex items-center justify-center gap-6 sm:gap-12">
          {[
            { label: "Enterprise CXOs", value: "500+" },
            { label: "Startups", value: "60+" },
            { label: "Advisory Hours", value: "1,200+" },
          ].map((stat, i) => (
            <ScaleIn key={stat.label} delay={i * 0.1}>
              <div className="text-center">
                <p className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            </ScaleIn>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* LOGO CAROUSEL                                                 */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="pb-24 overflow-hidden">
        <FadeUp>
          <p className="text-center text-xs font-medium text-gray-400 uppercase tracking-widest mb-8">
            Leaders from these organizations have joined the network
          </p>
        </FadeUp>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
          <div className="flex animate-[scroll_45s_linear_infinite] hover:[animation-play-state:paused] w-max">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex items-center gap-12 px-6 sm:gap-16">
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
                      className="h-10 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 select-none cursor-pointer"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* PROGRAMS                                                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-6 pb-32 sm:px-12">
        <FadeUp>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Two engines of enterprise value</h2>
            <p className="mt-3 text-base text-gray-500 max-w-lg mx-auto">Structured programs that convert relationships into measurable outcomes.</p>
          </div>
        </FadeUp>

        <div className="grid gap-6 sm:grid-cols-2">
          <FadeUp delay={0.1} className="h-full">
            <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="h-full flex flex-col group rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Advisory Circle Program</h3>
              <p className="text-sm leading-relaxed text-gray-500 mb-5 flex-1">
                Structured access to enterprise CXOs for validation, go-to-market strategy, and enterprise readiness. Build your custom advisory circle.
              </p>
              <div className="flex flex-wrap gap-2">
                {["CXO Matching", "Session Tracking", "Hour Management"].map((tag) => (
                  <span key={tag} className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{tag}</span>
                ))}
              </div>
            </motion.div>
          </FadeUp>

          <FadeUp delay={0.2} className="h-full">
            <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="h-full flex flex-col group rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Introductions & Deal Flow</h3>
              <p className="text-sm leading-relaxed text-gray-500 mb-5 flex-1">
                CXO-endorsed warm introductions and structured deal conversion. From qualified referrals to closed enterprise contracts.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Warm Intros", "Deal Attribution", "Boomerang AI"].map((tag) => (
                  <span key={tag} className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{tag}</span>
                ))}
              </div>
            </motion.div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MEMBERS                                                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-50 py-32">
        <div className="mx-auto max-w-5xl px-6 sm:px-12">
          <FadeUp>
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">The Network</p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Built for enterprise leaders</h2>
            </div>
          </FadeUp>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { tier: "CXO", desc: "CIO, CTO, CISO, CRO, CFO", color: "bg-blue-500" },
              { tier: "CXO-1", desc: "SVP, VP, Directors", color: "bg-indigo-500" },
              { tier: "Startups", desc: "Founders & leadership teams", color: "bg-cyan-500" },
              { tier: "Venture", desc: "VC firms & strategic partners", color: "bg-emerald-500" },
            ].map((t, i) => (
              <ScaleIn key={t.tier} delay={i * 0.08} className="h-full">
                <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`mb-4 h-2 w-8 rounded-full ${t.color}`} />
                  <h3 className="text-base font-semibold text-gray-900">{t.tier}</h3>
                  <p className="mt-1 text-sm text-gray-500">{t.desc}</p>
                </motion.div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* QUOTE                                                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="py-32">
        <div className="mx-auto max-w-3xl px-6 sm:px-12">
          <FadeUp>
            <div className="text-center">
              <div className="mx-auto mb-6 h-px w-12 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
              <p className="text-2xl font-medium leading-relaxed text-gray-700 sm:text-3xl">
                The best enterprise deals start with a conversation between the right people.
                <span className="text-gray-400"> We make sure that conversation happens.</span>
              </p>
              <div className="mx-auto mt-6 h-px w-12 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* BOTTOM CTA                                                    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="bg-gray-50 py-32">
        <div className="mx-auto max-w-xl px-6 sm:px-12">
          <FadeUp>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Ready to join?</h2>
              <p className="mt-2 text-sm text-gray-500">CXO executives are prioritized for early access.</p>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <WaitlistForm />
            <p className="mt-4 text-center text-xs text-gray-400">
              By joining, you agree to our <Link href="/terms-of-service" className="underline hover:text-gray-600">Terms</Link> and <Link href="/privacy-policy" className="underline hover:text-gray-600">Privacy Policy</Link>.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Carousel keyframe */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <footer className="border-t border-gray-100 py-8 text-center">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Global CXO Circle. All rights reserved.</p>
      </footer>
    </div>
  )
}
