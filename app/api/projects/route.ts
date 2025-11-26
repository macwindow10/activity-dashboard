import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      include: { assignees: { include: { user: { select: { id: true, name: true, email: true } } } } },
    })
    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
        message: "Database tables may not be set up. Please run: npm run seed",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, ownerId } = body

    const project = await prisma.project.create({
      data: { name, description, ownerId },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
