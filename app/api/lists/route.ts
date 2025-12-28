import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createListSchema } from '@/lib/validations/agency'
import { ZodError } from 'zod'

/**
 * GET /api/lists
 *
 * Get all influencer lists for the authenticated agency
 *
 * @requires Authentication
 * @query clientId - Optional filter by client
 * @returns Array of influencer lists
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.agencyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    const where: any = {
      client: {
        agencyId: session.user.agencyId,
      },
    }

    if (clientId) {
      where.clientId = clientId
    }

    const lists = await prisma.influencerList.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        influencers: {
          select: {
            id: true,
            influencerId: true,
            status: true,
            influencer: {
              select: {
                id: true,
                name: true,
                niche: true,
                primaryPlatform: true,
              },
            },
          },
        },
        _count: {
          select: {
            influencers: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      lists,
      count: lists.length,
    })
  } catch (error) {
    console.error('[GET /api/lists] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/lists
 *
 * Create a new influencer list
 *
 * @requires Authentication
 * @body CreateListInput
 * @returns Created list
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.agencyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createListSchema.parse(body)

    // Verify client belongs to agency
    const client = await prisma.client.findFirst({
      where: {
        id: validatedData.clientId,
        agencyId: session.user.agencyId,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    const list = await prisma.influencerList.create({
      data: {
        clientId: validatedData.clientId,
        name: validatedData.name,
        description: validatedData.description || null,
        tags: validatedData.tags,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      list,
      message: 'Influencer list created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/lists] Error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', issues: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
