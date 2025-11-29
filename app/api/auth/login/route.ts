import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Verify password
    const hashedInputPassword = hashPassword(password)
    if (user.hashedPassword !== hashedInputPassword) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Create session token
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64")

    const response = {
      userId: user.id,
      email: user.email,
      name: user.name,
      token,
    }

    // Set secure HTTP-only cookie
    const res = NextResponse.json(response)
    res.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return res
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { message: "Login failed" },
      { status: 500 }
    )
  }
}
