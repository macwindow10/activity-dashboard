import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// GET all activities with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const projectIds = searchParams.getAll("projectIds[]")
    const personIds = searchParams.getAll("personIds[]")
    const status = searchParams.get("status")

    const where: any = {}

    if (dateFrom || dateTo) {
      where.dueDate = {}
      if (dateFrom) where.dueDate.gte = new Date(dateFrom)
      if (dateTo) where.dueDate.lte = new Date(dateTo)
    }

    if (projectIds.length > 0) {
      where.projects = {
        some: {
          projectId: { in: projectIds },
        },
      }
    }

    if (personIds.length > 0) {
      where.assignedPersons = {
        some: {
          userId: { in: personIds },
        },
      }
    }

    if (status && status !== "all") {
      where.status = status
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        projects: { include: { project: { select: { id: true, name: true } } } },
        assignedPersons: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { dueDate: "asc" },
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch activities",
        message: "Database tables may not be set up. Please run: npm run seed",
      },
      { status: 500 },
    )
  }
}

// POST create new activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, type, status, dueDate, projectIds, personIds, createdById } = body

    if (!description || !type || !status || !dueDate || !createdById) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const activity = await prisma.activity.create({
      data: {
        description,
        type,
        status,
        dueDate: new Date(dueDate),
        createdById,
        projects: {
          createMany: {
            data: projectIds?.map((projectId: string) => ({ projectId })) || [],
          },
        },
        assignedPersons: {
          createMany: {
            data: personIds?.map((userId: string) => ({ userId })) || [],
          },
        },
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        projects: { include: { project: { select: { id: true, name: true } } } },
        assignedPersons: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error("Error creating activity:", error)
    return NextResponse.json(
      { error: "Failed to create activity", details: error },
      { status: 500 },
    )
  }
}

// PUT update activity
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Activity ID is required" }, { status: 400 })
    }

    // First, get the existing activity to handle relationships
    const existingActivity = await prisma.activity.findUnique({
      where: { id },
      include: {
        projects: true,
        assignedPersons: true,
      },
    })

    if (!existingActivity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 })
    }

    // Prepare the data for update
    const { projectIds, personIds, ...activityData } = updateData

    // Update the activity
    const updatedActivity = await prisma.$transaction(async (prisma) => {
      // Update basic activity data
      const activity = await prisma.activity.update({
        where: { id },
        data: {
          ...activityData,
          dueDate: activityData.dueDate ? new Date(activityData.dueDate) : undefined,
        },
      })

      // Update project relationships if projectIds are provided
      if (projectIds) {
        // Delete existing project relationships
        await prisma.activityProject.deleteMany({
          where: { activityId: id },
        })

        // Create new project relationships
        if (projectIds.length > 0) {
          await prisma.activityProject.createMany({
            data: projectIds.map((projectId: string) => ({
              activityId: id,
              projectId,
            })),
          })
        }
      }

      // Update person relationships if personIds are provided
      if (personIds) {
        // Delete existing person relationships
        await prisma.activityPerson.deleteMany({
          where: { activityId: id },
        })

        // Create new person relationships
        if (personIds.length > 0) {
          await prisma.activityPerson.createMany({
            data: personIds.map((userId: string) => ({
              activityId: id,
              userId,
            })),
          })
        }
      }

      // Return the updated activity with all relationships
      return await prisma.activity.findUnique({
        where: { id },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          projects: { include: { project: { select: { id: true, name: true } } } },
          assignedPersons: { include: { user: { select: { id: true, name: true, email: true } } } },
        },
      })
    })

    return NextResponse.json(updatedActivity)
  } catch (error) {
    console.error("Error updating activity:", error)
    return NextResponse.json(
      { error: "Failed to update activity", details: error },
      { status: 500 },
    )
  }
}
