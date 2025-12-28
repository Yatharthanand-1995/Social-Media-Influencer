import { prisma } from '@/lib/prisma'

/**
 * Performance Tracking Service
 *
 * Manages historical performance data for influencers:
 * - Creates periodic snapshots of metrics
 * - Calculates growth trends
 * - Analyzes performance patterns
 * - Predicts future growth
 */

export interface GrowthTrend {
  period: string
  followerGrowth: number
  followerGrowthPercent: number
  engagementGrowth: number
  averagePostsPerDay: number
  trend: 'rising' | 'stable' | 'declining'
}

export interface GrowthMetrics {
  dailyAverageGrowth: number
  weeklyAverageGrowth: number
  monthlyAverageGrowth: number
  growthVelocity: 'rapid' | 'moderate' | 'slow' | 'stagnant' | 'declining'
  consistency: number // 0-100
}

export interface GrowthPrediction {
  predictedFollowersIn30Days: number
  predictedFollowersIn90Days: number
  confidence: number // 0-100
  trend: 'rising' | 'stable' | 'declining'
}

export class PerformanceTrackingService {
  /**
   * Create a performance snapshot for a social account
   * Should be called daily/weekly to track historical data
   */
  async createSnapshot(socialAccountId: string): Promise<void> {
    const account = await prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
      include: {
        performanceSnapshots: {
          orderBy: { snapshotDate: 'desc' },
          take: 1,
        },
      },
    })

    if (!account) {
      throw new Error('Social account not found')
    }

    // Calculate growth since last snapshot
    let followersGrowth = 0
    if (account.performanceSnapshots.length > 0) {
      const lastSnapshot = account.performanceSnapshots[0]
      followersGrowth = account.followersCount - lastSnapshot.followersCount
    }

    // Create snapshot
    await prisma.performanceSnapshot.create({
      data: {
        socialAccountId: account.id,
        snapshotDate: new Date(),
        followersCount: account.followersCount,
        followersGrowth,
        engagementRate: account.engagementRate,
        avgLikes: account.avgLikes,
        avgComments: account.avgComments,
        avgViews: account.avgViews,
        avgShares: null, // Would come from API
        postsCount: 0, // Would come from API
        postsThisPeriod: 0, // Would calculate from API data
      },
    })
  }

  /**
   * Get growth trend over specified number of days
   */
  async getGrowthTrend(socialAccountId: string, days: number = 30): Promise<GrowthTrend> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const snapshots = await prisma.performanceSnapshot.findMany({
      where: {
        socialAccountId,
        snapshotDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { snapshotDate: 'asc' },
    })

    if (snapshots.length < 2) {
      return {
        period: `${days} days`,
        followerGrowth: 0,
        followerGrowthPercent: 0,
        engagementGrowth: 0,
        averagePostsPerDay: 0,
        trend: 'stable',
      }
    }

    const firstSnapshot = snapshots[0]
    const lastSnapshot = snapshots[snapshots.length - 1]

    const followerGrowth = lastSnapshot.followersCount - firstSnapshot.followersCount
    const followerGrowthPercent =
      firstSnapshot.followersCount > 0
        ? (followerGrowth / firstSnapshot.followersCount) * 100
        : 0

    const engagementGrowth = lastSnapshot.engagementRate - firstSnapshot.engagementRate

    const totalPosts = snapshots.reduce((sum, s) => sum + s.postsThisPeriod, 0)
    const averagePostsPerDay = totalPosts / days

    // Determine trend
    let trend: 'rising' | 'stable' | 'declining' = 'stable'
    if (followerGrowthPercent > 5 && engagementGrowth > 0.5) {
      trend = 'rising'
    } else if (followerGrowthPercent < -2 || engagementGrowth < -0.5) {
      trend = 'declining'
    }

    return {
      period: `${days} days`,
      followerGrowth,
      followerGrowthPercent,
      engagementGrowth,
      averagePostsPerDay,
      trend,
    }
  }

  /**
   * Calculate average growth rates across different time periods
   */
  async calculateAverageGrowth(socialAccountId: string): Promise<GrowthMetrics> {
    const snapshots = await prisma.performanceSnapshot.findMany({
      where: { socialAccountId },
      orderBy: { snapshotDate: 'desc' },
      take: 90, // Last 90 days
    })

    if (snapshots.length < 7) {
      return {
        dailyAverageGrowth: 0,
        weeklyAverageGrowth: 0,
        monthlyAverageGrowth: 0,
        growthVelocity: 'stagnant',
        consistency: 0,
      }
    }

    // Calculate daily growth rates
    const dailyGrowthRates: number[] = []
    for (let i = 1; i < snapshots.length; i++) {
      const growth = snapshots[i - 1].followersCount - snapshots[i].followersCount
      const base = snapshots[i].followersCount
      if (base > 0) {
        dailyGrowthRates.push((growth / base) * 100)
      }
    }

    const dailyAverageGrowth =
      dailyGrowthRates.reduce((sum, rate) => sum + rate, 0) / dailyGrowthRates.length

    // Weekly average (7-day periods)
    const weeklyAverageGrowth = dailyAverageGrowth * 7

    // Monthly average (30-day periods)
    const monthlyAverageGrowth = dailyAverageGrowth * 30

    // Calculate consistency (inverse of variance)
    const mean = dailyAverageGrowth
    const variance =
      dailyGrowthRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) /
      dailyGrowthRates.length
    const stdDev = Math.sqrt(variance)
    const consistency = Math.max(0, Math.min(100, 100 - stdDev * 10))

    // Determine growth velocity
    let growthVelocity: GrowthMetrics['growthVelocity'] = 'stagnant'
    if (monthlyAverageGrowth > 20) {
      growthVelocity = 'rapid'
    } else if (monthlyAverageGrowth > 10) {
      growthVelocity = 'moderate'
    } else if (monthlyAverageGrowth > 2) {
      growthVelocity = 'slow'
    } else if (monthlyAverageGrowth < -2) {
      growthVelocity = 'declining'
    }

    return {
      dailyAverageGrowth,
      weeklyAverageGrowth,
      monthlyAverageGrowth,
      growthVelocity,
      consistency,
    }
  }

  /**
   * Predict future growth based on historical patterns
   * Uses linear regression on recent trends
   */
  async predictFutureGrowth(socialAccountId: string): Promise<GrowthPrediction> {
    const snapshots = await prisma.performanceSnapshot.findMany({
      where: { socialAccountId },
      orderBy: { snapshotDate: 'desc' },
      take: 30, // Use last 30 days for prediction
    })

    if (snapshots.length < 7) {
      return {
        predictedFollowersIn30Days: 0,
        predictedFollowersIn90Days: 0,
        confidence: 0,
        trend: 'stable',
      }
    }

    // Reverse to chronological order
    const chronologicalSnapshots = snapshots.reverse()

    // Simple linear regression
    const n = chronologicalSnapshots.length
    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumXX = 0

    chronologicalSnapshots.forEach((snapshot, index) => {
      const x = index
      const y = snapshot.followersCount
      sumX += x
      sumY += y
      sumXY += x * y
      sumXX += x * x
    })

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Predict future followers
    const currentFollowers = chronologicalSnapshots[n - 1].followersCount
    const predictedFollowersIn30Days = Math.round(slope * (n + 30) + intercept)
    const predictedFollowersIn90Days = Math.round(slope * (n + 90) + intercept)

    // Calculate confidence based on R² (coefficient of determination)
    const yMean = sumY / n
    let ssTot = 0
    let ssRes = 0

    chronologicalSnapshots.forEach((snapshot, index) => {
      const y = snapshot.followersCount
      const yPred = slope * index + intercept
      ssTot += Math.pow(y - yMean, 2)
      ssRes += Math.pow(y - yPred, 2)
    })

    const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0
    const confidence = Math.round(Math.max(0, Math.min(100, rSquared * 100)))

    // Determine trend
    let trend: 'rising' | 'stable' | 'declining' = 'stable'
    const growthRate = ((predictedFollowersIn30Days - currentFollowers) / currentFollowers) * 100
    if (growthRate > 5) {
      trend = 'rising'
    } else if (growthRate < -2) {
      trend = 'declining'
    }

    return {
      predictedFollowersIn30Days: Math.max(0, predictedFollowersIn30Days),
      predictedFollowersIn90Days: Math.max(0, predictedFollowersIn90Days),
      confidence,
      trend,
    }
  }

  /**
   * Create snapshots for all social accounts
   * Should be run daily as a cron job
   */
  async createAllSnapshots(): Promise<{ created: number; errors: number }> {
    const accounts = await prisma.socialAccount.findMany({
      select: { id: true },
    })

    let created = 0
    let errors = 0

    for (const account of accounts) {
      try {
        await this.createSnapshot(account.id)
        created++
      } catch (error) {
        console.error(`Failed to create snapshot for account ${account.id}:`, error)
        errors++
      }
    }

    return { created, errors }
  }

  /**
   * Get performance history for visualization
   */
  async getPerformanceHistory(
    socialAccountId: string,
    days: number = 90
  ): Promise<{
    dates: string[]
    followers: number[]
    engagement: number[]
  }> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const snapshots = await prisma.performanceSnapshot.findMany({
      where: {
        socialAccountId,
        snapshotDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { snapshotDate: 'asc' },
    })

    return {
      dates: snapshots.map((s) => s.snapshotDate.toISOString()),
      followers: snapshots.map((s) => s.followersCount),
      engagement: snapshots.map((s) => s.engagementRate),
    }
  }
}
