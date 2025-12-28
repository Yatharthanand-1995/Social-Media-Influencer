import { NextRequest, NextResponse } from 'next/server'
import { DataEnrichmentService } from '@/lib/services/data-enrichment-service'

/**
 * Cron Job: Data Enrichment
 *
 * This endpoint is called by Vercel Cron to automatically enrich influencer data
 * Schedule: Daily at 2 AM UTC
 *
 * What it does:
 * 1. Creates daily performance snapshots for all influencers
 * 2. Enriches influencers with stale data (older than 24 hours)
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/enrichment",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */

export async function GET(request: NextRequest) {
  try {
    // Verify request is from Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[CRON] Starting data enrichment job...')

    const enrichmentService = new DataEnrichmentService()

    // Step 1: Create performance snapshots (lightweight, runs for all)
    console.log('[CRON] Creating performance snapshots...')
    const snapshotResult = await enrichmentService.createAllPerformanceSnapshots()
    console.log(`[CRON] Snapshots created: ${snapshotResult.created}, errors: ${snapshotResult.errors}`)

    // Step 2: Enrich influencers with stale data (heavy operation)
    console.log('[CRON] Enriching influencers with stale data...')
    const enrichmentResult = await enrichmentService.enrichStaleInfluencers(24)
    console.log(
      `[CRON] Enrichment complete: ${enrichmentResult.successful} successful, ${enrichmentResult.failed} failed out of ${enrichmentResult.total} total`
    )

    // Step 3: Get statistics
    const stats = await enrichmentService.getEnrichmentStatistics()
    console.log('[CRON] Enrichment statistics:', stats)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      snapshots: snapshotResult,
      enrichment: {
        total: enrichmentResult.total,
        successful: enrichmentResult.successful,
        failed: enrichmentResult.failed,
      },
      statistics: stats,
    })
  } catch (error) {
    console.error('[CRON] Enrichment job failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Allow POST as well for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
}
