// app/api/activities/[id]/status/route.ts
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('POST status');
    const resolvedParams = await params;    
    const resolvedJson = await request.json()
    // console.log('resolvedJson: ', resolvedJson);
    const { status, remarks, changedById } = resolvedJson
    console.log('status: ', status);
    console.log('remarks: ', remarks);
    console.log('changedById: ', changedById);
    if (!status || !changedById) {
      return NextResponse.json(
        { error: "Status and changedById are required" },
        { status: 400 }
      )
    }

    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update the activity status
      const updatedActivity = await prisma.activity.update({
        where: { id: resolvedParams.id },
        data: {
          status,
          ...(status === 'Completed' && { completionDate: new Date() })
        },
      })

      // Create the status history record
      await prisma.activityStatusHistory.create({
        data: {
          activityId: resolvedParams.id,
          status,
          remarks: remarks || null,
          changedById,
        },
      })

      return updatedActivity
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating activity status:", error)
    return NextResponse.json(
      { error: "Failed to update activity status" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const history = await prisma.activityStatusHistory.findMany({
      where: { activityId: params.id },
      include: {
        changedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { changedAt: 'desc' },
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error("Error fetching status history:", error)
    return NextResponse.json(
      { error: "Failed to fetch status history" },
      { status: 500 }
    )
  }
}