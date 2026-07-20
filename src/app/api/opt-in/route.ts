import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email } = await req.json()

    // 1. Server-side validation
    if (!firstName?.trim()) {
      return NextResponse.json({ success: false, error: "First name is required." }, { status: 400 })
    }
    if (!lastName?.trim()) {
      return NextResponse.json({ success: false, error: "Last name is required." }, { status: 400 })
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      return NextResponse.json({ success: false, error: "A valid email address is required." }, { status: 400 })
    }

    const scriptUrl = process.env.OPT_IN_SCRIPT_URL

    // If scriptUrl is not configured yet (e.g. in local development before env setup),
    // log it and return a mock success so developers can test the frontend UI.
    if (!scriptUrl) {
      console.warn(
        "⚠️ WARNING: process.env.OPT_IN_SCRIPT_URL is not set. Data was not sent to Google Sheets. " +
        `Submitting mock data: ${JSON.stringify({ firstName, lastName, email })}`
      )
      return NextResponse.json({
        success: true,
        message: "Development Mock: Success! (Configure OPT_IN_SCRIPT_URL to connect Google Sheets)"
      })
    }

    // 2. Forward the payload to Google Apps Script Web App
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Google Apps Script responded with error status ${response.status}: ${errorText}`)
      return NextResponse.json({ success: false, error: "Failed to save data to the sheet." }, { status: 502 })
    }

    const result = await response.json()
    if (result && result.success) {
      return NextResponse.json({ success: true })
    } else {
      console.error("Google Apps Script failed operation:", result)
      return NextResponse.json({ success: false, error: result?.error || "Error storing response." }, { status: 500 })
    }

  } catch (error) {
    console.error("Error in opt-in API Route Handler:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error." }, { status: 500 })
  }
}
