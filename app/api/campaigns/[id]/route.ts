import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const campaignIdSchema = z.object({
  id: z.string().uuid('Invalid campaign ID'),
})

const updateCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100).optional(),
  goal: z.string().min(1, 'Campaign goal is required').max(500).optional(),
  budget: z.number().positive('Budget must be positive').optional(),
  startDate: z.string().datetime('Invalid start date format').optional(),
  endDate: z.string().datetime('Invalid end date format').optional(),
  status: z.enum(['planning', 'active', 'paused', 'completed', 'cancelled']).optional(),
  targetMetrics: z.record(z.string(), z.any()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = campaignIdSchema.parse({ id: resolvedParams.id })

    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        client: {
          agencyId: session.user.agencyId,
        },
      },
      include: {
        client: true,
        collaborations: {
          include: {
            influencer: {
              include: {
                socialAccounts: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            collaborations: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error fetching campaign:', error)
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = campaignIdSchema.parse({ id: resolvedParams.id })

    // Verify ownership
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id,
        client: {
          agencyId: session.user.agencyId,
        },
      },
    })

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found or access denied' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateCampaignSchema.parse(body)

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.goal && { goal: validatedData.goal }),
        ...(validatedData.budget && { budget: validatedData.budget }),
        ...(validatedData.startDate && { startDate: new Date(validatedData.startDate) }),
        ...(validatedData.endDate && { endDate: new Date(validatedData.endDate) }),
        ...(validatedData.status && { status: validatedData.status }),
        ...(validatedData.targetMetrics && { targetMetrics: validatedData.targetMetrics as any }),
      },
      include: {
        client: true,
        _count: {
          select: {
            collaborations: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = campaignIdSchema.parse({ id: resolvedParams.id })

    // Verify ownership
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id,
        client: {
          agencyId: session.user.agencyId,
        },
      },
      include: {
        _count: {
          select: {
            collaborations: true,
          },
        },
      },
    })

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found or access denied' }, { status: 404 })
    }

    await prisma.campaign.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: `Campaign deleted successfully (${existingCampaign._count.collaborations} collaborations removed)`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error deleting campaign:', error)
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
  }
}
