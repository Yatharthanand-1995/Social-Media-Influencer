import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCampaignSchema } from '@/lib/validations/agency'
import { ZodError } from 'zod'

/**
 * GET /api/campaigns
 *
 * Get all campaigns for the authenticated agency user
 * Optional query params: clientId, status
 *
 * @requires Authentication - User must be logged in with agencyId
 * @query clientId - Filter by specific client (optional)
 * @query status - Filter by campaign status (optional)
 * @returns Array of campaigns
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Authorization check - must have agency
    if (!session.user.agencyId) {
      return NextResponse.json(
        { error: 'Forbidden - No agency associated with this account' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')

    console.log(`[GET /api/campaigns] Fetching campaigns for agency: ${session.user.agencyId}`)

    // Build where clause
    const where: any = {
      client: {
        agencyId: session.user.agencyId, // Only campaigns from clients in this agency
      },
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (status) {
      where.status = status
    }

    // Fetch campaigns
    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            industry: true,
          },
        },
        collaborations: {
          select: {
            id: true,
            influencerId: true,
            agreedPrice: true,
            status: true,
            influencer: {
              select: {
                id: true,
                name: true,
                niche: true,
              },
            },
          },
        },
        _count: {
          select: {
            collaborations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`[GET /api/campaigns] Found ${campaigns.length} campaigns`)

    return NextResponse.json({
      success: true,
      campaigns,
      count: campaigns.length,
      filters: {
        clientId: clientId || null,
        status: status || null,
      },
    })
  } catch (error) {
    console.error('[GET /api/campaigns] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/campaigns
 *
 * Create a new campaign
 *
 * @requires Authentication - User must be logged in with agencyId
 * @requires Authorization - Client must belong to user's agency
 * @body CreateCampaignInput - Campaign data
 * @returns Created campaign object
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Authorization check - must have agency
    if (!session.user.agencyId) {
      return NextResponse.json(
        { error: 'Forbidden - No agency associated with this account' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createCampaignSchema.parse(body)

    console.log(`[POST /api/campaigns] Creating campaign for client: ${validatedData.clientId}`)

    // Verify client exists and belongs to user's agency
    const client = await prisma.client.findFirst({
      where: {
        id: validatedData.clientId,
        agencyId: session.user.agencyId,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found or access denied' },
        { status: 404 }
      )
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        clientId: validatedData.clientId,
        name: validatedData.name,
        goal: validatedData.goal,
        budget: validatedData.budget,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        status: validatedData.status,
        targetMetrics: validatedData.targetMetrics as any,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            industry: true,
          },
        },
      },
    })

    console.log(`[POST /api/campaigns] Campaign created successfully: ${campaign.id}`)

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Campaign created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/campaigns] Error:', error)

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          issues: error.issues,
        },
        { status: 400 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
