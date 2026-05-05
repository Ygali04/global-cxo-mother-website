'use server'
import { sendContactEmail as sendContactEmailService } from '@/lib/contact'

interface EmailResult {
   success: boolean
   error?: string
}

export async function sendContactEmail(formData: FormData): Promise<EmailResult> {
   const user_name =
      (formData.get('user_name') as string | null) ??
      (formData.get('name') as string | null)
   const user_email =
      (formData.get('user_email') as string | null) ??
      (formData.get('email') as string | null)
   const message = formData.get('message') as string | null

   const result = await sendContactEmailService({
      name: user_name?.trim() ?? '',
      email: user_email?.trim() ?? '',
      message: message?.trim() ?? '',
   })

   return result
}

export async function handleContactFormAction(
   _unused: unknown,
   formData: FormData
): Promise<EmailResult> {
   return await sendContactEmail(formData)
}