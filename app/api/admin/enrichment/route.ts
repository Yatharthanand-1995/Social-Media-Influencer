import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DataEnrichmentService } from '@/lib/services/data-enrichment-service'

/**
 * Admin API: Manual Data Enrichment
 *
 * Allows admins to manually trigger enrichment operations
 *
 * GET /api/admin/enrichment - Get enrichment statistics
 * POST /api/admin/enrichment - Trigger enrichment
 */

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const enrichmentService = new DataEnrichmentService()

    // Get enrichment statistics
    const stats = await enrichmentService.getEnrichmentStatistics()

    return NextResponse.json({
      success: true,
      statistics: stats,
    })
  } catch (error) {
    console.error('Error getting enrichment stats:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get statistics',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      operation = 'enrich_stale',
      influencerId,
      batchSize = 10,
      hoursThreshold = 24,
    } = body

    const enrichmentService = new DataEnrichmentService()

    let result: any

    switch (operation) {
      case 'enrich_single':
        // Enrich a specific influencer
        if (!influencerId) {
          return NextResponse.json(
            { error: 'influencerId is required for enrich_single operation' },
            { status: 400 }
          )
        }
        result = await enrichmentService.enrichInfluencer(influencerId)
        break

      case 'enrich_all':
        // Enrich all influencers (heavy operation)
        result = await enrichmentService.enrichAllInfluencers(batchSize)
        break

      case 'enrich_stale':
        // Enrich only influencers with stale data
        result = await enrichmentService.enrichStaleInfluencers(hoursThreshold)
        break

      case 'snapshots':
        // Create performance snapshots for all accounts
        result = await enrichmentService.createAllPerformanceSnapshots()
        break

      default:
        return NextResponse.json(
          {
            error: `Unknown operation: ${operation}. Valid operations: enrich_single, enrich_all, enrich_stale, snapshots`,
          },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      operation,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error during enrichment:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Enrichment failed',
      },
      { status: 500 }
    )
  }
}
