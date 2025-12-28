import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClientSchema } from '@/lib/validations/agency'
import { ZodError } from 'zod'

/**
 * GET /api/agency/clients
 *
 * Get all clients for the authenticated agency user
 *
 * @requires Authentication - User must be logged in with agencyId
 * @returns Array of clients belonging to the user's agency
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

    console.log(`[GET /api/agency/clients] Fetching clients for agency: ${session.user.agencyId}`)

    // Fetch all clients for this agency
    const clients = await prisma.client.findMany({
      where: {
        agencyId: session.user.agencyId,
      },
      include: {
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
            budget: true,
          },
        },
        savedLists: {
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`[GET /api/agency/clients] Found ${clients.length} clients`)

    return NextResponse.json({
      success: true,
      clients,
      count: clients.length,
    })
  } catch (error) {
    console.error('[GET /api/agency/clients] Error:', error)
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
 * POST /api/agency/clients
 *
 * Create a new client for the authenticated agency
 *
 * @requires Authentication - User must be logged in with agencyId
 * @body CreateClientInput - name, industry, logo (optional), notes (optional)
 * @returns Created client object
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
    const validatedData = createClientSchema.parse(body)

    console.log(`[POST /api/agency/clients] Creating client for agency: ${session.user.agencyId}`)

    // Create client
    const client = await prisma.client.create({
      data: {
        agencyId: session.user.agencyId,
        name: validatedData.name,
        industry: validatedData.industry,
        logo: validatedData.logo || null,
        notes: validatedData.notes || null,
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    console.log(`[POST /api/agency/clients] Client created successfully: ${client.id}`)

    return NextResponse.json({
      success: true,
      client,
      message: 'Client created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/agency/clients] Error:', error)

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
