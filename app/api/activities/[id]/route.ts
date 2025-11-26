import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        projects: { include: { project: { select: { id: true, name: true } } } },
        assignedPersons: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    })

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 })
    }

    return NextResponse.json(activity)
  } catch (error) {
    console.error("Error fetching activity:", error)
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {          
    const resolvedParams = await params;
    const id = resolvedParams.id    
    const body = await request.json()    
    let { description, type, status, dueDate, completionDate, projectIds, personIds } = body    

    // Ensure projectIds and personIds are arrays
    projectIds = Array.isArray(projectIds) ? projectIds : projectIds ? [projectIds] : []
    personIds = Array.isArray(personIds) ? personIds : personIds ? [personIds] : []

    // Delete existing relationships
    await prisma.activityProject.deleteMany({ where: { activityId: id } })
    await prisma.activityPerson.deleteMany({ where: { activityId: id } })

    // Update activity using a transaction to ensure data consistency
    const activity = await prisma.$transaction(async (prisma) => {
      // First, update the basic activity data
      const updatedActivity = await prisma.activity.update({
        where: { id },
        data: {
          description,
          type,
          status,
          dueDate: new Date(dueDate),
          completionDate: completionDate ? new Date(completionDate) : null,
        },
      })

      // Then update project relationships
      if (projectIds.length > 0) {
        await prisma.activityProject.createMany({
          data: projectIds.map((projectId: string) => ({
            activityId: id,
            projectId,
          })),
        })
      }

      // Then update person relationships
      if (personIds.length > 0) {
        await prisma.activityPerson.createMany({
          data: personIds.map((userId: string) => ({
            activityId: id,
            userId,
          })),
        })
      }

      // Finally, fetch the complete updated activity with all relationships
      return prisma.activity.findUnique({
        where: { id },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          projects: { include: { project: { select: { id: true, name: true } } } },
          assignedPersons: { include: { user: { select: { id: true, name: true, email: true } } } },
        },
      })      
    })    
    return NextResponse.json(activity)
  } catch (error) {
    console.error("Error updating activity:", error)
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    await prisma.activity.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting activity:", error)
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 })
  }
}
