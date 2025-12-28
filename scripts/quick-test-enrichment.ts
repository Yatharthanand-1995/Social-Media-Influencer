/**
 * Quick Test: Data Enrichment Services
 * Tests the enrichment pipeline with seeded data
 */

import { prisma } from '../lib/prisma'
import { DataEnrichmentService } from '../lib/services/data-enrichment-service'

async function main() {
  console.log('=' .repeat(60))
  console.log('QUICK ENRICHMENT TEST')
  console.log('='.repeat(60))

  // Get influencers
  const influencers = await prisma.influencer.findMany({
    include: {
      socialAccounts: true,
    },
    take: 2, // Test with first 2 influencers
  })

  if (influencers.length === 0) {
    console.error('\n❌ No influencers found. Please run seed script first.')
    return
  }

  console.log(`\n✓ Found ${influencers.length} influencers to test`)

  const enrichmentService = new DataEnrichmentService()

  // Test 1: Enrich single influencer
  console.log('\n' + '-'.repeat(60))
  console.log('TEST: Enriching influencers')
  console.log('-'.repeat(60))

  for (const influencer of influencers) {
    console.log(`\n${influencer.name}:`)
    try {
      const result = await enrichmentService.enrichInfluencer(influencer.id)

      console.log(`  Success: ${result.success}`)
      console.log(`  Authenticity: ${result.enrichments.authenticity ? '✓' : '✗'}`)
      console.log(`  Performance: ${result.enrichments.performance ? '✓' : '✗'}`)
      console.log(`  Content Analysis: ${result.enrichments.contentAnalysis ? '✓' : '✗'}`)

      if (result.errors.length > 0) {
        console.log(`  Errors:`)
        result.errors.forEach((error) => console.log(`    - ${error}`))
      }
    } catch (error) {
      console.error(`  ✗ Failed:`, error instanceof Error ? error.message : error)
    }
  }

  // Test 2: Get enrichment statistics
  console.log('\n' + '-'.repeat(60))
  console.log('TEST: Enrichment Statistics')
  console.log('-'.repeat(60))

  try {
    const stats = await enrichmentService.getEnrichmentStatistics()
    console.log(`Total Influencers: ${stats.total}`)
    console.log(`With Authenticity: ${stats.withAuthenticity}`)
    console.log(`With Performance Data: ${stats.withPerformanceData}`)
    console.log(`With Content Analysis: ${stats.withContentAnalysis}`)
    console.log(`Fully Enriched: ${stats.fullyEnriched}`)
  } catch (error) {
    console.error('✗ Stats failed:', error)
  }

  // Test 3: Check enrichment status for first influencer
  if (influencers.length > 0) {
    console.log('\n' + '-'.repeat(60))
    console.log(`TEST: Check Enrichment Status for ${influencers[0].name}`)
    console.log('-'.repeat(60))

    try {
      const status = await enrichmentService.getEnrichmentStatus(influencers[0].id)
      console.log(`Has Authenticity: ${status.hasAuthenticity}`)
      console.log(`Has Performance Data: ${status.hasPerformanceData}`)
      console.log(`Has Content Analysis: ${status.hasContentAnalysis}`)
      if (status.lastAuthenticityUpdate) {
        console.log(`Last Authenticity Update: ${status.lastAuthenticityUpdate.toISOString()}`)
      }
      if (status.lastPerformanceSnapshot) {
        console.log(`Last Performance Snapshot: ${status.lastPerformanceSnapshot.toISOString()}`)
      }
      if (status.lastContentAnalysis) {
        console.log(`Last Content Analysis: ${status.lastContentAnalysis.toISOString()}`)
      }
    } catch (error) {
      console.error('✗ Status check failed:', error)
    }
  }

  // Test 4: Verify database records
  console.log('\n' + '-'.repeat(60))
  console.log('TEST: Verify Database Records')
  console.log('-'.repeat(60))

  try {
    const authenticityCount = await prisma.influencerAuthenticity.count()
    const snapshotCount = await prisma.performanceSnapshot.count()
    const contentCount = await prisma.contentAnalysis.count()

    console.log(`Authenticity Records: ${authenticityCount}`)
    console.log(`Performance Snapshots: ${snapshotCount}`)
    console.log(`Content Analysis Records: ${contentCount}`)

    // Show a sample authenticity record
    if (authenticityCount > 0) {
      const sample = await prisma.influencerAuthenticity.findFirst({
        include: {
          influencer: {
            select: { name: true },
          },
        },
      })
      if (sample) {
        console.log(`\nSample Authenticity Record (${sample.influencer.name}):`)
        console.log(`  Overall Score: ${sample.overallAuthenticityScore}/100`)
        console.log(`  Risk Level: ${sample.riskLevel}`)
        console.log(`  Verified: ${sample.isVerified}`)
      }
    }
  } catch (error) {
    console.error('✗ Database verification failed:', error)
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ TESTING COMPLETE')
  console.log('='.repeat(60))
}

main()
  .catch((error) => {
    console.error('Test failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
