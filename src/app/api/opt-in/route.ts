import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const scriptUrl =
      process.env.OPT_IN_SCRIPT_URL || process.env.NEXT_PUBLIC_OPT_IN_SCRIPT_URL

    if (!scriptUrl) {
      console.warn("⚠️ OPT_IN_SCRIPT_URL not set in server env. Using fallback/mock check.")
      
      // For local testing without a Google Sheet URL configured:
      if (body.email && body.email.trim().toLowerCase() === "test@duplicate.com") {
        return NextResponse.json(
          {
            success: false,
            duplicate: true,
            error: "This email address is already registered.",
          },
          { status: 400 }
        )
      }

      await new Promise((resolve) => setTimeout(resolve, 800))
      return NextResponse.json({ success: true })
    }

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(body),
      redirect: "follow",
    })

    const text = await response.text()
    let data: any
    try {
      data = JSON.parse(text)
    } catch {
      data = { success: response.ok, raw: text }
    }

    if (!response.ok || data.success === false || data.duplicate) {
      const isDuplicate =
        data.duplicate ||
        (typeof data.error === "string" && data.error.toLowerCase().includes("already"))
      return NextResponse.json(
        {
          success: false,
          duplicate: isDuplicate,
          error: isDuplicate
            ? "This email address is already registered."
            : data.error || "Failed to record response.",
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Server /api/opt-in error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error." },
      { status: 500 }
    )
  }
}
