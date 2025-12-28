import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const listIdSchema = z.object({
  id: z.string().uuid('Invalid list ID'),
})

const updateListSchema = z.object({
  name: z.string().min(1, 'List name is required').max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  tags: z.array(z.string()).optional(),
})

const addInfluencerSchema = z.object({
  influencerId: z.string().uuid('Invalid influencer ID'),
  notes: z.string().max(500).optional().nullable(),
  status: z.enum(['prospect', 'contacted', 'negotiating', 'agreed', 'declined']).default('prospect'),
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
    const { id } = listIdSchema.parse({ id: resolvedParams.id })

    const list = await prisma.influencerList.findFirst({
      where: {
        id,
        client: {
          agencyId: session.user.agencyId,
        },
      },
      include: {
        client: true,
        influencers: {
          include: {
            influencer: {
              include: {
                socialAccounts: true,
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
      },
    })

    if (!list) {
      return NextResponse.json({ error: 'List not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ success: true, list })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error fetching list:', error)
    return NextResponse.json({ error: 'Failed to fetch list' }, { status: 500 })
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
    const { id } = listIdSchema.parse({ id: resolvedParams.id })

    // Verify ownership
    const existingList = await prisma.influencerList.findFirst({
      where: {
        id,
        client: {
          agencyId: session.user.agencyId,
        },
      },
    })

    if (!existingList) {
      return NextResponse.json({ error: 'List not found or access denied' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateListSchema.parse(body)

    const list = await prisma.influencerList.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.tags && { tags: validatedData.tags }),
      },
      include: {
        client: true,
        _count: {
          select: {
            influencers: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, list })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating list:', error)
    return NextResponse.json({ error: 'Failed to update list' }, { status: 500 })
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
    const { id } = listIdSchema.parse({ id: resolvedParams.id })

    // Verify ownership
    const existingList = await prisma.influencerList.findFirst({
      where: {
        id,
        client: {
          agencyId: session.user.agencyId,
        },
      },
      include: {
        _count: {
          select: {
            influencers: true,
          },
        },
      },
    })

    if (!existingList) {
      return NextResponse.json({ error: 'List not found or access denied' }, { status: 404 })
    }

    await prisma.influencerList.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: `List deleted successfully (${existingList._count.influencers} influencers removed)`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error deleting list:', error)
    return NextResponse.json({ error: 'Failed to delete list' }, { status: 500 })
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
    const { id: listId } = listIdSchema.parse({ id: resolvedParams.id })

    // Verify ownership
    const list = await prisma.influencerList.findFirst({
      where: {
        id: listId,
        client: {
          agencyId: session.user.agencyId,
        },
      },
    })

    if (!list) {
      return NextResponse.json({ error: 'List not found or access denied' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = addInfluencerSchema.parse(body)

    // Check if influencer exists
    const influencer = await prisma.influencer.findUnique({
      where: { id: validatedData.influencerId },
    })

    if (!influencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    // Check if already in list
    const existingItem = await prisma.influencerListItem.findUnique({
      where: {
        listId_influencerId: {
          listId,
          influencerId: validatedData.influencerId,
        },
      },
    })

    if (existingItem) {
      return NextResponse.json({ error: 'Influencer already in list' }, { status: 400 })
    }

    const item = await prisma.influencerListItem.create({
      data: {
        listId,
        influencerId: validatedData.influencerId,
        notes: validatedData.notes,
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

    return NextResponse.json({ success: true, item }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error adding influencer to list:', error)
    return NextResponse.json({ error: 'Failed to add influencer' }, { status: 500 })
  }
}
