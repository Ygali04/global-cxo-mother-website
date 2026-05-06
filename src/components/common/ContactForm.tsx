import { sendContactEmail } from "@/app/action/sendContactEmail"

async function submitContactForm(formData: FormData): Promise<void> {
   "use server"
   await sendContactEmail(formData)
}

const ContactForm = () => {
   return (
      <form action={submitContactForm} className="contact__form">
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
         <button type="submit" className="btn">
            Send Message
         </button>
      </form>
   )
}

export default ContactForm
