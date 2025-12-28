import { prisma } from '@/lib/prisma'
import { AuthenticityService } from './authenticity-service'
import { PerformanceTrackingService } from './performance-tracking-service'
import { ContentAnalysisService } from './content-analysis-service'

/**
 * Data Enrichment Service
 *
 * Orchestrates all data enrichment operations:
 * - Coordinates authenticity, performance, and content analysis
 * - Manages batch enrichment operations
 * - Handles error recovery and logging
 */

export interface EnrichmentResult {
  influencerId: string
  influencerName: string
  success: boolean
  errors: string[]
  enrichments: {
    authenticity: boolean
    performance: boolean
    contentAnalysis: boolean
  }
}

export interface BatchEnrichmentResult {
  total: number
  successful: number
  failed: number
  results: EnrichmentResult[]
}

export class DataEnrichmentService {
  private authenticityService: AuthenticityService
  private performanceService: PerformanceTrackingService
  private contentService: ContentAnalysisService

  constructor() {
    this.authenticityService = new AuthenticityService()
    this.performanceService = new PerformanceTrackingService()
    this.contentService = new ContentAnalysisService()
  }

  /**
   * Enrich a single influencer with all available data
   */
  async enrichInfluencer(influencerId: string): Promise<EnrichmentResult> {
    const influencer = await prisma.influencer.findUnique({
      where: { id: influencerId },
      include: {
        socialAccounts: true,
      },
    })

    if (!influencer) {
      return {
        influencerId,
        influencerName: 'Unknown',
        success: false,
        errors: ['Influencer not found'],
        enrichments: {
          authenticity: false,
          performance: false,
          contentAnalysis: false,
        },
      }
    }

    const result: EnrichmentResult = {
      influencerId,
      influencerName: influencer.name,
      success: true,
      errors: [],
      enrichments: {
        authenticity: false,
        performance: false,
        contentAnalysis: false,
      },
    }

    // 1. Calculate and save authenticity score
    try {
      const authenticityScore = await this.authenticityService.calculateAuthenticityScore(
        influencerId
      )
      await this.authenticityService.saveAuthenticityData(influencerId, authenticityScore)
      result.enrichments.authenticity = true
    } catch (error) {
      result.errors.push(`Authenticity: ${error instanceof Error ? error.message : String(error)}`)
      result.success = false
    }

    // 2. Create performance snapshots for all social accounts
    try {
      for (const account of influencer.socialAccounts) {
        await this.performanceService.createSnapshot(account.id)
      }
      result.enrichments.performance = true
    } catch (error) {
      result.errors.push(`Performance: ${error instanceof Error ? error.message : String(error)}`)
      result.success = false
    }

    // 3. Analyze content for all social accounts
    try {
      for (const account of influencer.socialAccounts) {
        const contentAnalysis = await this.contentService.analyzeContentPerformance(account.id)
        await this.contentService.saveContentAnalysis(account.id, contentAnalysis)
      }
      result.enrichments.contentAnalysis = true
    } catch (error) {
      result.errors.push(`Content: ${error instanceof Error ? error.message : String(error)}`)
      result.success = false
    }

    return result
  }

  /**
   * Enrich all influencers in the database
   * Runs in batches to avoid overwhelming the system
   */
  async enrichAllInfluencers(
    batchSize: number = 10,
    delayMs: number = 1000
  ): Promise<BatchEnrichmentResult> {
    const influencers = await prisma.influencer.findMany({
      select: { id: true },
    })

    const results: EnrichmentResult[] = []
    let successful = 0
    let failed = 0

    console.log(`Starting enrichment for ${influencers.length} influencers...`)

    for (let i = 0; i < influencers.length; i += batchSize) {
      const batch = influencers.slice(i, i + batchSize)
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(influencers.length / batchSize)}...`
      )

      const batchResults = await Promise.allSettled(
        batch.map((inf) => this.enrichInfluencer(inf.id))
      )

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
          if (result.value.success) {
            successful++
          } else {
            failed++
          }
        } else {
          failed++
          results.push({
            influencerId: 'unknown',
            influencerName: 'Unknown',
            success: false,
            errors: [result.reason?.message || 'Unknown error'],
            enrichments: {
              authenticity: false,
              performance: false,
              contentAnalysis: false,
            },
          })
        }
      }

      // Delay between batches to avoid rate limiting
      if (i + batchSize < influencers.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }

    console.log(
      `Enrichment complete: ${successful} successful, ${failed} failed out of ${influencers.length} total`
    )

    return {
      total: influencers.length,
      successful,
      failed,
      results,
    }
  }

  /**
   * Enrich only influencers that haven't been enriched recently
   * @param hoursThreshold Only enrich if last update was more than X hours ago
   */
  async enrichStaleInfluencers(hoursThreshold: number = 24): Promise<BatchEnrichmentResult> {
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - hoursThreshold)

    // Find influencers with stale or missing authenticity data
    const staleInfluencers = await prisma.influencer.findMany({
      where: {
        OR: [
          {
            authenticity: null,
          },
          {
            authenticity: {
              updatedAt: {
                lt: cutoffDate,
              },
            },
          },
        ],
      },
      select: { id: true },
    })

    console.log(`Found ${staleInfluencers.length} influencers with stale data`)

    if (staleInfluencers.length === 0) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        results: [],
      }
    }

    const results: EnrichmentResult[] = []
    let successful = 0
    let failed = 0

    for (const influencer of staleInfluencers) {
      const result = await this.enrichInfluencer(influencer.id)
      results.push(result)

      if (result.success) {
        successful++
      } else {
        failed++
      }

      // Small delay between enrichments
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    return {
      total: staleInfluencers.length,
      successful,
      failed,
      results,
    }
  }

  /**
   * Create performance snapshots for all social accounts
   * Lightweight operation that runs daily
   */
  async createAllPerformanceSnapshots(): Promise<{ created: number; errors: number }> {
    return await this.performanceService.createAllSnapshots()
  }

  /**
   * Get enrichment status for an influencer
   */
  async getEnrichmentStatus(influencerId: string): Promise<{
    hasAuthenticity: boolean
    hasPerformanceData: boolean
    hasContentAnalysis: boolean
    lastAuthenticityUpdate: Date | null
    lastPerformanceSnapshot: Date | null
    lastContentAnalysis: Date | null
  }> {
    const influencer = await prisma.influencer.findUnique({
      where: { id: influencerId },
      include: {
        authenticity: {
          select: { updatedAt: true },
        },
        socialAccounts: {
          include: {
            performanceSnapshots: {
              orderBy: { snapshotDate: 'desc' },
              take: 1,
            },
            contentAnalysis: {
              select: { updatedAt: true },
            },
          },
        },
      },
    })

    if (!influencer) {
      return {
        hasAuthenticity: false,
        hasPerformanceData: false,
        hasContentAnalysis: false,
        lastAuthenticityUpdate: null,
        lastPerformanceSnapshot: null,
        lastContentAnalysis: null,
      }
    }

    const hasPerformanceData = influencer.socialAccounts.some(
      (acc) => acc.performanceSnapshots.length > 0
    )
    const hasContentAnalysis = influencer.socialAccounts.some((acc) => acc.contentAnalysis !== null)

    const lastPerformanceSnapshot =
      influencer.socialAccounts
        .flatMap((acc) => acc.performanceSnapshots)
        .map((snap) => snap.snapshotDate)
        .sort((a, b) => b.getTime() - a.getTime())[0] || null

    const lastContentAnalysis =
      influencer.socialAccounts
        .map((acc) => acc.contentAnalysis?.updatedAt)
        .filter((date): date is Date => date !== null && date !== undefined)
        .sort((a, b) => b.getTime() - a.getTime())[0] || null

    return {
      hasAuthenticity: influencer.authenticity !== null,
      hasPerformanceData,
      hasContentAnalysis,
      lastAuthenticityUpdate: influencer.authenticity?.updatedAt || null,
      lastPerformanceSnapshot,
      lastContentAnalysis,
    }
  }

  /**
   * Get enrichment statistics for all influencers
   */
  async getEnrichmentStatistics(): Promise<{
    total: number
    withAuthenticity: number
    withPerformanceData: number
    withContentAnalysis: number
    fullyEnriched: number
    needsEnrichment: number
  }> {
    const total = await prisma.influencer.count()

    const withAuthenticity = await prisma.influencer.count({
      where: {
        authenticity: {
          isNot: null,
        },
      },
    })

    const socialAccountsWithSnapshots = await prisma.performanceSnapshot.groupBy({
      by: ['socialAccountId'],
    })
    const accountIdsWithSnapshots = new Set(socialAccountsWithSnapshots.map((s) => s.socialAccountId))

    const socialAccountsWithAnalysis = await prisma.contentAnalysis.findMany({
      select: { socialAccountId: true },
    })
    const accountIdsWithAnalysis = new Set(socialAccountsWithAnalysis.map((a) => a.socialAccountId))

    const influencersWithPerformance = await prisma.influencer.count({
      where: {
        socialAccounts: {
          some: {
            id: {
              in: Array.from(accountIdsWithSnapshots),
            },
          },
        },
      },
    })

    const influencersWithContent = await prisma.influencer.count({
      where: {
        socialAccounts: {
          some: {
            id: {
              in: Array.from(accountIdsWithAnalysis),
            },
          },
        },
      },
    })

    // Fully enriched = has all three types of data
    const fullyEnriched = await prisma.influencer.count({
      where: {
        AND: [
          {
            authenticity: {
              isNot: null,
            },
          },
          {
            socialAccounts: {
              some: {
                id: {
                  in: Array.from(accountIdsWithSnapshots),
                },
              },
            },
          },
          {
            socialAccounts: {
              some: {
                id: {
                  in: Array.from(accountIdsWithAnalysis),
                },
              },
            },
          },
        ],
      },
    })

    const needsEnrichment = total - fullyEnriched

    return {
      total,
      withAuthenticity,
      withPerformanceData: influencersWithPerformance,
      withContentAnalysis: influencersWithContent,
      fullyEnriched,
      needsEnrichment,
    }
  }
}
