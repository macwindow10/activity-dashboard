import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("authToken")?.value

    if (!token) {
      return NextResponse.json(null, { status: 401 })
    }

    // Decode token to get userId
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8")
      const [userId] = decoded.split(":")

      // In a real app, you'd verify the token and fetch user from database
      // For now, return basic session info
      return NextResponse.json({
        userId,
        token,
      })
    } catch {
      return NextResponse.json(null, { status: 401 })
    }
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json(null, { status: 500 })
  }
}
