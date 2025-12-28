/**
 * Test Script: Data Enrichment Pipeline
 *
 * This script tests the data enrichment services:
 * 1. Authenticity scoring
 * 2. Performance tracking
 * 3. Content analysis
 *
 * Run with: npx tsx scripts/test-enrichment.ts
 */

import { prisma } from '../lib/prisma'
import { DataEnrichmentService } from '../lib/services/data-enrichment-service'
import { AuthenticityService } from '../lib/services/authenticity-service'
import { PerformanceTrackingService } from '../lib/services/performance-tracking-service'
import { ContentAnalysisService } from '../lib/services/content-analysis-service'

async function main() {
  console.log('='.repeat(60))
  console.log('DATA ENRICHMENT PIPELINE TEST')
  console.log('='.repeat(60))

  // Get first influencer to test with
  const influencer = await prisma.influencer.findFirst({
    include: {
      socialAccounts: {
        include: {
          performanceSnapshots: true,
        },
      },
    },
  })

  if (!influencer) {
    console.error('No influencers found in database. Please add some influencers first.')
    return
  }

  console.log(`\nTesting with influencer: ${influencer.name} (ID: ${influencer.id})`)
  console.log(`Social accounts: ${influencer.socialAccounts.length}`)

  // Test 1: Authenticity Service
  console.log('\n' + '-'.repeat(60))
  console.log('TEST 1: Authenticity Service')
  console.log('-'.repeat(60))

  try {
    const authenticityService = new AuthenticityService()
    const authenticityScore = await authenticityService.calculateAuthenticityScore(influencer.id)

    console.log('✓ Authenticity score calculated successfully')
    console.log(`  Overall Score: ${authenticityScore.overallAuthenticityScore}/100`)
    console.log(`  Follower Quality: ${authenticityScore.followerQualityScore}/100`)
    console.log(`  Engagement Authenticity: ${authenticityScore.engagementAuthenticityScore}/100`)
    console.log(`  Risk Level: ${authenticityScore.riskLevel}`)
    console.log(`  Verified: ${authenticityScore.isVerified}`)
    console.log(`  Suspicious Followers: ${authenticityScore.suspiciousFollowersPercent.toFixed(1)}%`)

    await authenticityService.saveAuthenticityData(influencer.id, authenticityScore)
    console.log('✓ Authenticity data saved to database')
  } catch (error) {
    console.error('✗ Authenticity test failed:', error)
  }

  // Test 2: Performance Tracking Service
  console.log('\n' + '-'.repeat(60))
  console.log('TEST 2: Performance Tracking Service')
  console.log('-'.repeat(60))

  try {
    const performanceService = new PerformanceTrackingService()

    for (const account of influencer.socialAccounts) {
      console.log(`\n  Account: ${account.platform} (@${account.handle})`)

      // Create snapshot
      await performanceService.createSnapshot(account.id)
      console.log('  ✓ Performance snapshot created')

      // Get growth trend
      const growthTrend = await performanceService.getGrowthTrend(account.id, 30)
      console.log(`  Growth Trend (30 days): ${growthTrend.trend}`)
      console.log(`  Follower Growth: ${growthTrend.followerGrowth} (${growthTrend.followerGrowthPercent.toFixed(2)}%)`)

      // Calculate average growth
      if (account.performanceSnapshots.length >= 7) {
        const growthMetrics = await performanceService.calculateAverageGrowth(account.id)
        console.log(`  Growth Velocity: ${growthMetrics.growthVelocity}`)
        console.log(`  Monthly Growth Rate: ${growthMetrics.monthlyAverageGrowth.toFixed(2)}%`)
        console.log(`  Consistency: ${growthMetrics.consistency.toFixed(0)}/100`)

        // Predict future growth
        const prediction = await performanceService.predictFutureGrowth(account.id)
        console.log(`  Predicted Followers (30 days): ${prediction.predictedFollowersIn30Days}`)
        console.log(`  Prediction Confidence: ${prediction.confidence}%`)
      } else {
        console.log('  ⚠ Not enough historical data for growth analysis (need 7+ snapshots)')
      }
    }
  } catch (error) {
    console.error('✗ Performance tracking test failed:', error)
  }

  // Test 3: Content Analysis Service
  console.log('\n' + '-'.repeat(60))
  console.log('TEST 3: Content Analysis Service')
  console.log('-'.repeat(60))

  try {
    const contentService = new ContentAnalysisService()

    for (const account of influencer.socialAccounts) {
      console.log(`\n  Account: ${account.platform} (@${account.handle})`)

      const contentAnalysis = await contentService.analyzeContentPerformance(account.id)
      console.log(`  ✓ Content analysis completed`)
      console.log(`  Best Performing Type: ${contentAnalysis.bestPerformingType}`)
      console.log(`  Avg Posts Per Week: ${contentAnalysis.avgPostsPerWeek.toFixed(1)}`)
      console.log(`  Posting Consistency: ${contentAnalysis.postingConsistency}/100`)
      console.log(`  Optimal Days: ${contentAnalysis.optimalPostingDays.join(', ')}`)
      console.log(`  Optimal Hours: ${contentAnalysis.optimalPostingHours.join(', ')}`)
      console.log(`  Peak Engagement: ${contentAnalysis.peakEngagementTime}`)
      console.log(`  Top Topics: ${contentAnalysis.topTopics.slice(0, 3).join(', ')}`)
      console.log(`  Top Hashtags: ${contentAnalysis.topHashtags.slice(0, 5).join(', ')}`)

      await contentService.saveContentAnalysis(account.id, contentAnalysis)
      console.log('  ✓ Content analysis saved to database')
    }
  } catch (error) {
    console.error('✗ Content analysis test failed:', error)
  }

  // Test 4: Full Enrichment Pipeline
  console.log('\n' + '-'.repeat(60))
  console.log('TEST 4: Full Enrichment Pipeline')
  console.log('-'.repeat(60))

  try {
    const enrichmentService = new DataEnrichmentService()

    const result = await enrichmentService.enrichInfluencer(influencer.id)

    console.log('✓ Full enrichment completed')
    console.log(`  Success: ${result.success}`)
    console.log(`  Authenticity: ${result.enrichments.authenticity ? '✓' : '✗'}`)
    console.log(`  Performance: ${result.enrichments.performance ? '✓' : '✗'}`)
    console.log(`  Content Analysis: ${result.enrichments.contentAnalysis ? '✓' : '✗'}`)

    if (result.errors.length > 0) {
      console.log('  Errors:')
      result.errors.forEach((error) => console.log(`    - ${error}`))
    }

    // Get enrichment status
    const status = await enrichmentService.getEnrichmentStatus(influencer.id)
    console.log('\n  Enrichment Status:')
    console.log(`    Has Authenticity: ${status.hasAuthenticity}`)
    console.log(`    Has Performance Data: ${status.hasPerformanceData}`)
    console.log(`    Has Content Analysis: ${status.hasContentAnalysis}`)
    if (status.lastAuthenticityUpdate) {
      console.log(`    Last Authenticity Update: ${status.lastAuthenticityUpdate.toISOString()}`)
    }
  } catch (error) {
    console.error('✗ Full enrichment test failed:', error)
  }

  // Test 5: Statistics
  console.log('\n' + '-'.repeat(60))
  console.log('TEST 5: Enrichment Statistics')
  console.log('-'.repeat(60))

  try {
    const enrichmentService = new DataEnrichmentService()
    const stats = await enrichmentService.getEnrichmentStatistics()

    console.log(`Total Influencers: ${stats.total}`)
    console.log(`With Authenticity Data: ${stats.withAuthenticity} (${((stats.withAuthenticity / stats.total) * 100).toFixed(1)}%)`)
    console.log(`With Performance Data: ${stats.withPerformanceData} (${((stats.withPerformanceData / stats.total) * 100).toFixed(1)}%)`)
    console.log(`With Content Analysis: ${stats.withContentAnalysis} (${((stats.withContentAnalysis / stats.total) * 100).toFixed(1)}%)`)
    console.log(`Fully Enriched: ${stats.fullyEnriched} (${((stats.fullyEnriched / stats.total) * 100).toFixed(1)}%)`)
    console.log(`Needs Enrichment: ${stats.needsEnrichment}`)
  } catch (error) {
    console.error('✗ Statistics test failed:', error)
  }

  console.log('\n' + '='.repeat(60))
  console.log('TEST COMPLETE')
  console.log('='.repeat(60))
}

main()
  .catch((error) => {
    console.error('Test script failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
