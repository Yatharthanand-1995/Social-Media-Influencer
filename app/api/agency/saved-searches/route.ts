import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createSavedSearchSchema } from '@/lib/validations/agency'
import { ZodError } from 'zod'

/**
 * GET /api/agency/saved-searches
 *
 * Get all saved searches for the authenticated agency
 *
 * @requires Authentication - User must be logged in with agencyId
 * @query clientId - Optional filter by client
 * @returns Array of saved searches
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
      agencyId: session.user.agencyId,
    }

    if (clientId) {
      where.clientId = clientId
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      savedSearches,
      count: savedSearches.length,
    })
  } catch (error) {
    console.error('[GET /api/agency/saved-searches] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/agency/saved-searches
 *
 * Create a new saved search
 *
 * @requires Authentication
 * @body CreateSavedSearchInput
 * @returns Created saved search
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
    const validatedData = createSavedSearchSchema.parse(body)

    // If clientId provided, verify it belongs to agency
    if (validatedData.clientId) {
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
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        agencyId: session.user.agencyId,
        clientId: validatedData.clientId || null,
        name: validatedData.name,
        searchCriteria: validatedData.searchCriteria as any,
      },
    })

    return NextResponse.json({
      success: true,
      savedSearch,
      message: 'Saved search created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/agency/saved-searches] Error:', error)

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
