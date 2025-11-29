import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json()

    if (!email || !name || !password) {
      return NextResponse.json(
        { message: "Email, name, and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Create new user
    const hashedPassword = hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    })

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
    console.error("Signup error:", error)
    return NextResponse.json(
      { message: "Signup failed" },
      { status: 500 }
    )
  }
}
