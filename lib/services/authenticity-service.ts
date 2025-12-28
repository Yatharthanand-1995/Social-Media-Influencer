import { prisma } from '@/lib/prisma'

/**
 * Authenticity Service
 *
 * Calculates and manages influencer authenticity scores based on:
 * - Follower quality analysis
 * - Engagement pattern consistency
 * - Growth velocity patterns
 * - Verification status
 */

export interface AuthenticityScore {
  overallAuthenticityScore: number
  followerQualityScore: number
  engagementAuthenticityScore: number
  suspiciousFollowersPercent: number
  botLikesPercent: number
  engagementDropOffRate: number
  isVerified: boolean
  verificationBadges: Record<string, boolean>
  riskLevel: 'low' | 'medium' | 'high'
  riskFactors: string[]
}

export interface FakeFollowerAnalysis {
  suspiciousFollowersPercent: number
  indicators: {
    suddenSpikes: boolean
    unusualEngagementRatio: boolean
    inconsistentGrowth: boolean
  }
}

export interface EngagementAnalysis {
  botLikesPercent: number
  engagementDropOffRate: number
  isConsistent: boolean
  patterns: {
    timeConsistency: boolean
    ratioConsistency: boolean
  }
}

export class AuthenticityService {
  /**
   * Calculate overall authenticity score (0-100) for an influencer
   * Analyzes all social accounts and returns aggregated score
   */
  async calculateAuthenticityScore(influencerId: string): Promise<AuthenticityScore> {
    const influencer = await prisma.influencer.findUnique({
      where: { id: influencerId },
      include: {
        socialAccounts: {
          include: {
            performanceSnapshots: {
              orderBy: { snapshotDate: 'desc' },
              take: 30,
            },
          },
        },
      },
    })

    if (!influencer) {
      throw new Error('Influencer not found')
    }

    let totalFollowerQuality = 0
    let totalEngagementAuth = 0
    let accountCount = 0
    let totalSuspiciousFollowers = 0
    let totalBotLikes = 0
    let totalEngagementDropOff = 0
    const verificationBadges: Record<string, boolean> = {}
    const riskFactors: string[] = []

    for (const account of influencer.socialAccounts) {
      accountCount++

      // Follower quality score (0-100)
      const followerQuality = await this.calculateFollowerQuality(
        account.id,
        account.followersCount,
        account.performanceSnapshots
      )
      totalFollowerQuality += followerQuality.score

      // Engagement authenticity score (0-100)
      const engagementAuth = await this.calculateEngagementAuthenticity(
        account.followersCount,
        account.avgLikes,
        account.avgComments,
        account.engagementRate
      )
      totalEngagementAuth += engagementAuth.score

      // Aggregate metrics
      totalSuspiciousFollowers += followerQuality.suspiciousPercent
      totalBotLikes += engagementAuth.botPercent
      totalEngagementDropOff += engagementAuth.dropOffRate

      // Track verification - in production, would check platform APIs
      verificationBadges[account.platform] = this.checkPlatformVerification(account)

      // Collect risk factors
      if (followerQuality.suspiciousPercent > 20) {
        riskFactors.push(`High suspicious followers on ${account.platform}`)
      }
      if (engagementAuth.botPercent > 15) {
        riskFactors.push(`Bot-like engagement detected on ${account.platform}`)
      }
    }

    const followerQualityScore = Math.round(totalFollowerQuality / accountCount)
    const engagementAuthenticityScore = Math.round(totalEngagementAuth / accountCount)
    const suspiciousFollowersPercent = totalSuspiciousFollowers / accountCount
    const botLikesPercent = totalBotLikes / accountCount
    const engagementDropOffRate = totalEngagementDropOff / accountCount

    // Overall score: 60% follower quality + 40% engagement authenticity
    const overallAuthenticityScore = Math.round(
      followerQualityScore * 0.6 + engagementAuthenticityScore * 0.4
    )

    // Determine risk level
    const riskLevel = this.determineRiskLevel(
      overallAuthenticityScore,
      suspiciousFollowersPercent,
      botLikesPercent
    )

    const isVerified = Object.values(verificationBadges).some((v) => v === true)

    return {
      overallAuthenticityScore,
      followerQualityScore,
      engagementAuthenticityScore,
      suspiciousFollowersPercent,
      botLikesPercent,
      engagementDropOffRate,
      isVerified,
      verificationBadges,
      riskLevel,
      riskFactors,
    }
  }

  /**
   * Calculate follower quality based on growth patterns
   */
  private async calculateFollowerQuality(
    socialAccountId: string,
    currentFollowers: number,
    snapshots: any[]
  ): Promise<{ score: number; suspiciousPercent: number }> {
    let score = 100
    let suspiciousPercent = 0

    if (snapshots.length < 3) {
      // Not enough data, return conservative score
      return { score: 70, suspiciousPercent: 5 }
    }

    // Analyze growth patterns
    const growthRates: number[] = []
    for (let i = 1; i < snapshots.length; i++) {
      const growth = snapshots[i - 1].followersGrowth
      const followers = snapshots[i].followersCount
      if (followers > 0) {
        const growthRate = (growth / followers) * 100
        growthRates.push(growthRate)
      }
    }

    // Check for sudden spikes (> 30% growth in single period)
    const hasSuddenSpikes = growthRates.some((rate) => Math.abs(rate) > 30)
    if (hasSuddenSpikes) {
      score -= 25
      suspiciousPercent += 15
    }

    // Check for inconsistent growth (high variance)
    if (growthRates.length > 0) {
      const mean = growthRates.reduce((a, b) => a + b, 0) / growthRates.length
      const variance =
        growthRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) /
        growthRates.length
      const stdDev = Math.sqrt(variance)

      if (stdDev > 15) {
        score -= 15
        suspiciousPercent += 10
      }
    }

    // Check for follower-to-engagement ratio
    // Will be enhanced in engagement authenticity calculation

    return {
      score: Math.max(0, Math.min(100, score)),
      suspiciousPercent: Math.min(100, suspiciousPercent),
    }
  }

  /**
   * Calculate engagement authenticity based on patterns
   */
  private async calculateEngagementAuthenticity(
    followersCount: number,
    avgLikes: number,
    avgComments: number,
    engagementRate: number
  ): Promise<{ score: number; botPercent: number; dropOffRate: number }> {
    let score = 100
    let botPercent = 0
    let dropOffRate = 0

    // Expected engagement rate ranges by follower count
    let expectedEngagementMin = 1.0
    let expectedEngagementMax = 5.0

    if (followersCount < 10000) {
      expectedEngagementMin = 3.0
      expectedEngagementMax = 8.0
    } else if (followersCount < 100000) {
      expectedEngagementMin = 2.0
      expectedEngagementMax = 6.0
    } else if (followersCount < 1000000) {
      expectedEngagementMin = 1.0
      expectedEngagementMax = 4.0
    } else {
      expectedEngagementMin = 0.5
      expectedEngagementMax = 3.0
    }

    // Check if engagement is suspiciously low
    if (engagementRate < expectedEngagementMin) {
      score -= 30
      dropOffRate = ((expectedEngagementMin - engagementRate) / expectedEngagementMin) * 100
    }

    // Check if engagement is suspiciously high (possible bots)
    if (engagementRate > expectedEngagementMax * 1.5) {
      score -= 20
      botPercent += 15
    }

    // Analyze likes-to-comments ratio
    const likesToCommentsRatio = avgLikes > 0 ? avgComments / avgLikes : 0
    const expectedRatio = 0.05 // Typical 5% comment rate

    // Too few comments relative to likes (bot likes)
    if (likesToCommentsRatio < expectedRatio * 0.3) {
      score -= 15
      botPercent += 10
    }

    // Too many comments relative to likes (suspicious)
    if (likesToCommentsRatio > expectedRatio * 3) {
      score -= 10
      botPercent += 5
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      botPercent: Math.min(100, botPercent),
      dropOffRate: Math.min(100, dropOffRate),
    }
  }

  /**
   * Check platform verification status
   * In production, this would call platform APIs
   */
  private checkPlatformVerification(account: any): boolean {
    // Placeholder - would integrate with platform APIs
    // For now, assume larger accounts (> 100k) might be verified
    return account.followersCount > 100000
  }

  /**
   * Determine risk level based on scores
   */
  private determineRiskLevel(
    overallScore: number,
    suspiciousFollowers: number,
    botLikes: number
  ): 'low' | 'medium' | 'high' {
    if (overallScore >= 80 && suspiciousFollowers < 10 && botLikes < 10) {
      return 'low'
    }
    if (overallScore >= 60 && suspiciousFollowers < 25 && botLikes < 20) {
      return 'medium'
    }
    return 'high'
  }

  /**
   * Store authenticity data in database
   */
  async saveAuthenticityData(
    influencerId: string,
    data: AuthenticityScore
  ): Promise<void> {
    await prisma.influencerAuthenticity.upsert({
      where: { influencerId },
      create: {
        influencerId,
        ...data,
      },
      update: {
        ...data,
        updatedAt: new Date(),
      },
    })
  }

  /**
   * Detect fake followers for a specific social account
   */
  async detectFakeFollowers(socialAccountId: string): Promise<FakeFollowerAnalysis> {
    const snapshots = await prisma.performanceSnapshot.findMany({
      where: { socialAccountId },
      orderBy: { snapshotDate: 'desc' },
      take: 30,
    })

    const indicators = {
      suddenSpikes: false,
      unusualEngagementRatio: false,
      inconsistentGrowth: false,
    }

    let suspiciousFollowersPercent = 0

    if (snapshots.length >= 3) {
      // Check for sudden spikes
      const growthRates = snapshots.map((s) => {
        const rate = s.followersCount > 0 ? (s.followersGrowth / s.followersCount) * 100 : 0
        return rate
      })

      indicators.suddenSpikes = growthRates.some((rate) => Math.abs(rate) > 30)
      if (indicators.suddenSpikes) suspiciousFollowersPercent += 20

      // Check growth consistency
      const mean = growthRates.reduce((a, b) => a + b, 0) / growthRates.length
      const variance =
        growthRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) /
        growthRates.length
      const stdDev = Math.sqrt(variance)

      indicators.inconsistentGrowth = stdDev > 15
      if (indicators.inconsistentGrowth) suspiciousFollowersPercent += 15
    }

    return {
      suspiciousFollowersPercent: Math.min(100, suspiciousFollowersPercent),
      indicators,
    }
  }

  /**
   * Analyze engagement patterns for bot-like behavior
   */
  async analyzeEngagementPatterns(socialAccountId: string): Promise<EngagementAnalysis> {
    const account = await prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
    })

    if (!account) {
      throw new Error('Social account not found')
    }

    const likesToCommentsRatio = account.avgLikes > 0 ? account.avgComments / account.avgLikes : 0
    const expectedRatio = 0.05

    const patterns = {
      timeConsistency: true, // Would need timestamp data
      ratioConsistency: Math.abs(likesToCommentsRatio - expectedRatio) / expectedRatio < 0.5,
    }

    let botLikesPercent = 0
    if (likesToCommentsRatio < expectedRatio * 0.3) {
      botLikesPercent = 15
    }

    const isConsistent = patterns.timeConsistency && patterns.ratioConsistency

    return {
      botLikesPercent,
      engagementDropOffRate: 0, // Would calculate from historical data
      isConsistent,
      patterns,
    }
  }
}
