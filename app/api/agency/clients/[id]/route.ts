import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateClientSchema, clientIdSchema } from '@/lib/validations/agency'
import { ZodError } from 'zod'

/**
 * GET /api/agency/clients/[id]
 *
 * Get a specific client by ID
 *
 * @requires Authentication - User must be logged in with agencyId
 * @requires Authorization - Client must belong to user's agency
 * @param id - Client ID (UUID)
 * @returns Client object with campaigns and lists
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Await params (Next.js App Router requirement)
    const resolvedParams = await params

    // Validate client ID
    const { id } = clientIdSchema.parse({ id: resolvedParams.id })

    console.log(`[GET /api/agency/clients/${id}] Fetching client`)

    // Fetch client with authorization check
    const client = await prisma.client.findFirst({
      where: {
        id,
        agencyId: session.user.agencyId, // Ensure client belongs to user's agency
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
        campaigns: {
          select: {
            id: true,
            name: true,
            goal: true,
            budget: true,
            status: true,
            startDate: true,
            endDate: true,
            _count: {
              select: {
                collaborations: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        savedLists: {
          select: {
            id: true,
            name: true,
            description: true,
            tags: true,
            _count: {
              select: {
                influencers: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            campaigns: true,
            savedLists: true,
          },
        },
      },
    })

    // Check if client exists and belongs to agency
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found or access denied' },
        { status: 404 }
      )
    }

    console.log(`[GET /api/agency/clients/${id}] Client fetched successfully`)

    return NextResponse.json({
      success: true,
      client,
    })
  } catch (error) {
    const resolvedParams = await params
    console.error(`[GET /api/agency/clients/${resolvedParams.id}] Error:`, error)

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid client ID format', issues: error.issues },
        { status: 400 }
      )
    }

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
 * PATCH /api/agency/clients/[id]
 *
 * Update a specific client
 *
 * @requires Authentication - User must be logged in with agencyId
 * @requires Authorization - Client must belong to user's agency
 * @param id - Client ID (UUID)
 * @body UpdateClientInput - Partial client data to update
 * @returns Updated client object
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Await params (Next.js App Router requirement)
    const resolvedParams = await params

    // Validate client ID
    const { id } = clientIdSchema.parse({ id: resolvedParams.id })

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateClientSchema.parse(body)

    console.log(`[PATCH /api/agency/clients/${id}] Updating client`)

    // First, verify client exists and belongs to agency
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        agencyId: session.user.agencyId,
      },
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found or access denied' },
        { status: 404 }
      )
    }

    // Update client
    const client = await prisma.client.update({
      where: { id },
      data: {
        ...validatedData,
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            campaigns: true,
            savedLists: true,
          },
        },
      },
    })

    console.log(`[PATCH /api/agency/clients/${id}] Client updated successfully`)

    return NextResponse.json({
      success: true,
      client,
      message: 'Client updated successfully',
    })
  } catch (error) {
    const resolvedParams = await params
    console.error(`[PATCH /api/agency/clients/${resolvedParams.id}] Error:`, error)

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', issues: error.issues },
        { status: 400 }
      )
    }

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
 * DELETE /api/agency/clients/[id]
 *
 * Delete a specific client
 *
 * @requires Authentication - User must be logged in with agencyId
 * @requires Authorization - Client must belong to user's agency
 * @param id - Client ID (UUID)
 * @returns Success message
 *
 * @note This will CASCADE delete all related campaigns and lists
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Await params (Next.js App Router requirement)
    const resolvedParams = await params

    // Validate client ID
    const { id } = clientIdSchema.parse({ id: resolvedParams.id })

    console.log(`[DELETE /api/agency/clients/${id}] Deleting client`)

    // First, verify client exists and belongs to agency
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        agencyId: session.user.agencyId,
      },
      include: {
        _count: {
          select: {
            campaigns: true,
            savedLists: true,
          },
        },
      },
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found or access denied' },
        { status: 404 }
      )
    }

    // Delete client (CASCADE will delete campaigns and lists)
    await prisma.client.delete({
      where: { id },
    })

    console.log(`[DELETE /api/agency/clients/${id}] Client deleted successfully (${existingClient._count.campaigns} campaigns, ${existingClient._count.savedLists} lists)`)

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
      deleted: {
        client: existingClient.name,
        campaigns: existingClient._count.campaigns,
        savedLists: existingClient._count.savedLists,
      },
    })
  } catch (error) {
    const resolvedParams = await params
    console.error(`[DELETE /api/agency/clients/${resolvedParams.id}] Error:`, error)

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid client ID format', issues: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
