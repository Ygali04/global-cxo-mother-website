"use client"

import { useState, type FormEvent } from "react"

const WEB3FORMS_ACCESS_KEY = "e2f3426f-24fd-472c-b564-50bac442e030"

const ContactForm = () => {
   const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
   const [errorMsg, setErrorMsg] = useState("")

   async function handleSubmit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault()
      setStatus("sending")
      setErrorMsg("")

      const form = e.currentTarget
      const formData = new FormData(form)

      try {
         const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               access_key: WEB3FORMS_ACCESS_KEY,
               name: formData.get("user_name"),
               email: formData.get("user_email"),
               message: formData.get("message"),
               subject: `New message from ${formData.get("user_name")}`,
            }),
         })

         const data = (await res.json()) as { success?: boolean; message?: string }

         if (res.ok && data.success) {
            setStatus("success")
            form.reset()
         } else {
            setStatus("error")
            setErrorMsg(data.message || "Failed to send message.")
         }
      } catch {
         setStatus("error")
         setErrorMsg("Email service is temporarily unavailable. Please try again shortly.")
      }
   }

   return (
      <form onSubmit={handleSubmit} className="contact__form">
         <div className="form-grp">
            <label htmlFor="user_name">Your Name</label>
            <input id="user_name" name="user_name" type="text" placeholder="Enter your name" required />
         </div>
         <div className="form-grp">
            <label htmlFor="user_email">Your Email</label>
            <input id="user_email" name="user_email" type="email" placeholder="Enter your email" required />
         </div>
         <div className="form-grp">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" placeholder="Write your message" required />
         </div>
         <button type="submit" className="btn" disabled={status === "sending"}>
            {status === "sending" ? "Sending..." : "Send Message"}
         </button>
         {status === "success" && <p style={{ color: "green", marginTop: "1rem" }}>Message sent successfully!</p>}
         {status === "error" && <p style={{ color: "red", marginTop: "1rem" }}>{errorMsg}</p>}
      </form>
   )
}

export default ContactForm
