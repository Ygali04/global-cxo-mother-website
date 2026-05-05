'use client'
import React, { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import HCaptcha from '@hcaptcha/react-hcaptcha'

const WEB3FORMS_ACCESS_KEY =
   process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ??
   'e2f3426f-24fd-472c-b564-50bac442e030'

const ContactForm = () => {
   const formRef = useRef<HTMLFormElement>(null)
   const [loading, setLoading] = useState(false)
   const [captchaToken, setCaptchaToken] = useState<string>('')
   const captchaRef = useRef<HCaptcha>(null)

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!e.currentTarget.checkValidity()) {
         e.currentTarget.reportValidity()
         return
      }
      
      const formData = new FormData(e.currentTarget)
      
      // Simple bot check: if the honeypot field is filled, it's a bot
      if (formData.get("botcheck")) {
         toast.success('Your message has been sent successfully!', { position: "bottom-right" })
         formRef.current?.reset()
         return
      }
      const name = formData.get("name")?.toString().trim() || ""
      const email = formData.get("email")?.toString().trim() || ""
      const message = formData.get("message")?.toString().trim() || ""

      if (name.length < 2) {
         toast.warning("Please enter a valid name (at least 2 characters).", { position: "bottom-right" })
         return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
         toast.warning("Please enter a valid email address.", { position: "bottom-right" })
         return
      }

      if (message.length < 20) {
         toast.warning("Your message must be at least 20 characters long.", { position: "bottom-right" })
         return
      }

      if (!captchaToken) {
         toast.warning("Please complete the captcha.", { position: "bottom-right" })
         return
      }

      setLoading(true)
      formData.set('name', name)
      formData.set('email', email)
      formData.set('message', message)
      formData.set('access_key', WEB3FORMS_ACCESS_KEY)
      formData.set('h-captcha-response', captchaToken)

      try {
         const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData,
         })

         const data = (await response.json()) as { success?: boolean; message?: string }
         
         if (data.success) {
            toast.success('Your message has been sent successfully!', { position: "bottom-right" })
            formRef.current?.reset()
            setCaptchaToken('')
            captchaRef.current?.resetCaptcha()
         } else {
            toast.error(data.message || 'Failed to send message.', { position: "bottom-right" })
         }
      } catch {
         toast.error('An error occurred. Please try again.', { position: "bottom-right" })
      }
      
      setLoading(false)
   }

   return (
      <form ref={formRef} onSubmit={handleSubmit} className="contact__form">
         <div className="row">
            <div className="col-md-6">
               <div className="form-grp">
                  <input type="text" name="name" placeholder="Your Name" minLength={2} required />
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-grp">
                  <input type="email" name="email" placeholder="Your Email" required />
               </div>
            </div>
         </div>
         <div className="form-grp">
            <textarea name="message" placeholder="Your Message" minLength={20} required></textarea>
         </div>
         <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />
         <div style={{ marginBottom: '20px' }}>
            <HCaptcha
               ref={captchaRef}
               sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2"
               onVerify={(token) => setCaptchaToken(token)}
            />
         </div>
         <button type="submit" className="tg-btn tg-btn-seven" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
         </button>
      </form>
   )
}

export default ContactForm
