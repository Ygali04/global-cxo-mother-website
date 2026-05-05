"use client"
import React, { useRef, useState } from "react"
import Link from "next/link"
import Arrow from "@/components/common/Arrow"
import { toast } from "react-toastify"

const WEB3FORMS_ACCESS_KEY =
   process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ??
   'e2f3426f-24fd-472c-b564-50bac442e030'

const FAq = () => {
   const formRef = useRef<HTMLFormElement>(null)
   const [loading, setLoading] = useState(false)

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!e.currentTarget.checkValidity()) {
         e.currentTarget.reportValidity()
         return
      }

      const formData = new FormData(e.currentTarget)
      const name = formData.get('name')?.toString().trim() || ''
      const email = formData.get('email')?.toString().trim() || ''
      const role = formData.get('role')?.toString().trim() || ''
      const message = formData.get('message')?.toString().trim() || ''

      if (name.length < 2) {
         toast.warning('Please enter a valid name (at least 2 characters).', { position: 'bottom-right' })
         return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
         toast.warning('Please enter a valid email address.', { position: 'bottom-right' })
         return
      }

      if (!role) {
         toast.warning('Please select who you are.', { position: 'bottom-right' })
         return
      }

      if (message.length < 20) {
         toast.warning('Your message must be at least 20 characters long.', { position: 'bottom-right' })
         return
      }

      setLoading(true)

      try {
         formData.set('name', name)
         formData.set('email', email)
         formData.set('message', `I am a: ${role}\n\n${message}`)
         formData.set('access_key', WEB3FORMS_ACCESS_KEY)

         const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData,
         })

         const result = (await response.json()) as { success?: boolean; message?: string }

         if (result.success) {
            toast.success('Your message has been sent successfully!', { position: 'bottom-right' })
            formRef.current?.reset()
         } else {
            toast.error(result.message || 'Failed to send message.', { position: 'bottom-right' })
         }
      } catch {
         toast.error('An error occurred. Please try again.', { position: 'bottom-right' })
      }

      setLoading(false)
   }

   return (
      <section id="contact" className="section-py-130" style={{ backgroundColor: "#FAFAFA" }}>
         <div className="container">
            <div className="row">
               <div className="col-lg-5 mb-40 mb-lg-0">
                  <div>
                     <span style={{ background: "var(--tg-color-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", fontSize: "13px", marginBottom: "12px", display: "inline-block" }}>Contact Us</span>
                     <h2 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 700, color: "#1A1A1A", marginBottom: "20px", letterSpacing: "-0.5px", lineHeight: 1.15 }}>Get in Touch</h2>
                     <p style={{ fontSize: "17px", color: "#555", lineHeight: 1.7, marginBottom: "36px" }}>
                        Whether you&apos;re a founder, investor, or strategic partner—let&apos;s start a conversation.
                     </p>
                     <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {[
                           { icon: "✉️", label: "EMAIL", value: "ram@100exnextgen.com" },
                           { icon: "📞", label: "PHONE", value: "+91 98458 45616" },
                           { icon: "📍", label: "LOCATION", value: "Bangalore, India" },
                        ].map((item, i) => (
                           <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                              <div style={{ width: "48px", height: "48px", background: "#fff", border: "1px solid #eee", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{item.icon}</div>
                              <div>
                                 <span style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "2px" }}>{item.label}</span>
                                 <span style={{ fontSize: "15px", color: "#333", fontWeight: 600 }}>{item.value}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="col-lg-7">
                  <form ref={formRef} onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: "16px", padding: "36px", border: "1px solid #eee", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                     <div className="row">
                        <div className="col-md-6 mb-20">
                           <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Name</label>
                           <input type="text" name="name" placeholder="Your name" minLength={2} required style={{ width: "100%", padding: "14px 18px", border: "1px solid #eee", borderRadius: "10px", fontSize: "15px", outline: "none", transition: "border 0.3s", background: "#FAFAFA" }} />
                        </div>
                        <div className="col-md-6 mb-20">
                           <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Email</label>
                           <input type="email" name="email" placeholder="Your email" required style={{ width: "100%", padding: "14px 18px", border: "1px solid #eee", borderRadius: "10px", fontSize: "15px", outline: "none", transition: "border 0.3s", background: "#FAFAFA" }} />
                        </div>
                        <div className="col-12 mb-20">
                           <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>I am a</label>
                           <div style={{ position: "relative" }}>
                              <select name="role" required defaultValue="" style={{ width: "100%", padding: "14px 18px", border: "1px solid #eee", borderRadius: "10px", fontSize: "15px", outline: "none", appearance: "none", background: "#FAFAFA", cursor: "pointer", color: "#666" }}>
                                 <option value="" disabled>Select one</option>
                                 <option value="Founder">Founder</option>
                                 <option value="Investor">Investor</option>
                                 <option value="Strategic Partner">Strategic Partner</option>
                                 <option value="Advisor">Advisor</option>
                                 <option value="Industry Expert">Industry Expert</option>
                                 <option value="Media / Press">Media / Press</option>
                                 <option value="Other">Other</option>
                              </select>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                 <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                           </div>
                        </div>
                        <div className="col-12 mb-20">
                           <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Message</label>
                           <textarea name="message" placeholder="Tell us about your project or vision..." minLength={20} required rows={4} style={{ width: "100%", padding: "14px 18px", border: "1px solid #eee", borderRadius: "10px", fontSize: "15px", outline: "none", resize: "vertical", transition: "border 0.3s", background: "#FAFAFA" }} />
                        </div>
                        <div className="col-12">
                           <button type="submit" className="tg-btn tg-btn-seven" disabled={loading} style={{ cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                              {loading ? 'Sending...' : 'Send Message'} {!loading && <Arrow />}
                           </button>
                        </div>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </section>
   )
}

export default FAq
