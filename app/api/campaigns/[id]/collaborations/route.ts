import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const campaignIdSchema = z.object({
  id: z.string().uuid('Invalid campaign ID'),
})

const createCollaborationSchema = z.object({
  influencerId: z.string().uuid('Invalid influencer ID'),
  agreedPrice: z.number().positive('Price must be positive'),
  contentType: z.enum(['post', 'story', 'reel', 'video', 'short', 'tweet']),
  deliverables: z.string().min(1, 'Deliverables description is required'),
  status: z.enum(['proposed', 'negotiating', 'agreed', 'in_progress', 'completed', 'cancelled']).default('proposed'),
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
    const { id: campaignId } = campaignIdSchema.parse({ id: resolvedParams.id })

    // Verify ownership
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        client: {
          agencyId: session.user.agencyId,
        },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found or access denied' }, { status: 404 })
    }

    const collaborations = await prisma.campaignCollaboration.findMany({
      where: { campaignId },
      include: {
        influencer: {
          include: {
            socialAccounts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, collaborations, count: collaborations.length })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error fetching collaborations:', error)
    return NextResponse.json({ error: 'Failed to fetch collaborations' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id: campaignId } = campaignIdSchema.parse({ id: resolvedParams.id })

    // Verify ownership
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        client: {
          agencyId: session.user.agencyId,
        },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found or access denied' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = createCollaborationSchema.parse(body)

    // Check if influencer exists
    const influencer = await prisma.influencer.findUnique({
      where: { id: validatedData.influencerId },
    })

    if (!influencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    // Check if collaboration already exists
    const existingCollaboration = await prisma.campaignCollaboration.findFirst({
      where: {
        campaignId,
        influencerId: validatedData.influencerId,
      },
    })

    if (existingCollaboration) {
      return NextResponse.json(
        { error: 'This influencer is already added to the campaign' },
        { status: 400 }
      )
    }

    const collaboration = await prisma.campaignCollaboration.create({
      data: {
        campaignId,
        influencerId: validatedData.influencerId,
        agreedPrice: validatedData.agreedPrice,
        contentType: validatedData.contentType,
        deliverables: validatedData.deliverables,
        status: validatedData.status,
      },
      include: {
        influencer: {
          include: {
            socialAccounts: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, collaboration }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating collaboration:', error)
    return NextResponse.json({ error: 'Failed to create collaboration' }, { status: 500 })
  }
}
