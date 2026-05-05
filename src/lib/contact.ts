import nodemailer from 'nodemailer'

export interface ContactPayload {
   name: string
   email: string
   message: string
}

export interface ContactResult {
   success: boolean
   error?: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const fallbackWeb3FormsAccessKey = 'e2f3426f-24fd-472c-b564-50bac442e030'

function escapeHtml(input: string): string {
   return input
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
}

export function validateContactPayload(payload: ContactPayload): ContactResult {
   const name = payload.name.trim()
   const email = payload.email.trim()
   const message = payload.message.trim()

   if (!name || !email || !message) {
      return { success: false, error: 'Missing required fields' }
   }

   if (name.length < 2) {
      return { success: false, error: 'Please enter a valid name.' }
   }

   if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' }
   }

   if (message.length < 20) {
      return { success: false, error: 'Message must be at least 20 characters long.' }
   }

   return { success: true }
}

export async function sendContactEmail(payload: ContactPayload): Promise<ContactResult> {
   const validation = validateContactPayload(payload)
   if (!validation.success) {
      return validation
   }

   const emailUser = process.env.EMAIL_USER
   const emailPass = process.env.EMAIL_PASS
   const emailTo = process.env.EMAIL_TO
   const web3FormsAccessKey = process.env.WEB3FORMS_ACCESS_KEY ?? fallbackWeb3FormsAccessKey

   const name = payload.name.trim()
   const email = payload.email.trim()
   const messageText = payload.message.trim()

   if (!emailUser || !emailPass || !emailTo) {
      try {
         const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               access_key: web3FormsAccessKey,
               name,
               email,
               message: messageText,
               subject: `New message from ${name}`,
            }),
         })

         const data = (await response.json()) as { success?: boolean; message?: string }

         if (response.ok && data.success) {
            return { success: true }
         }

         return {
            success: false,
            error: data.message || 'Failed to send message.',
         }
      } catch {
         return {
            success: false,
            error: 'Email service is temporarily unavailable. Please try again shortly.',
         }
      }
   }

   const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
         user: emailUser,
         pass: emailPass,
      },
   })

   try {
      await transporter.sendMail({
         from: `"Contact Form" <${emailUser}>`,
         to: emailTo,
         subject: `New message from ${name}`,
         html: `
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong><br>${escapeHtml(messageText).replaceAll('\n', '<br>')}</p>
    `,
      })

      return { success: true }
   } catch (err: unknown) {
      console.error('Email send error:', err)
      let errorMessage = 'Failed to send email.'
      if (err instanceof Error && err.message) {
         errorMessage = err.message
      }

      return { success: false, error: errorMessage }
   }
}
