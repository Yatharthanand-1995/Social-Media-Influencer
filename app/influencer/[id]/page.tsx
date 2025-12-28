import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MapPin, Users, TrendingUp, Instagram, Youtube, Twitter, DollarSign } from 'lucide-react'
import EngagementChart from '@/components/EngagementChart'
import AudienceCharts from '@/components/AudienceCharts'
import InfluencerAvatar from '@/components/InfluencerAvatar'

async function getInfluencer(id: string) {
  const influencer = await prisma.influencer.findUnique({
    where: { id },
    include: {
      // Enrichment data
      authenticity: true,
      campaignHistory: {
        orderBy: { campaignDate: 'desc' },
        take: 10,
      },
      // Social accounts with enrichment
      socialAccounts: {
        include: {
          audienceDemographics: true,
          pricing: true,
          performanceSnapshots: {
            orderBy: { snapshotDate: 'desc' },
            take: 90, // Last 90 days
          },
          contentAnalysis: true,
          platformMetrics: true,
        },
      },
    },
  })

  return influencer
}

export default async function InfluencerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const influencer = await getInfluencer(id)

  if (!influencer) {
    notFound()
  }

  const totalFollowers = influencer.socialAccounts.reduce(
    (sum, account) => sum + account.followersCount,
    0
  )

  const avgEngagement = influencer.socialAccounts.length > 0
    ? influencer.socialAccounts.reduce((sum, account) => sum + account.engagementRate, 0) /
      influencer.socialAccounts.length
    : 0

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-5 w-5" />
      case 'youtube':
        return <Youtube className="h-5 w-5" />
      case 'twitter':
        return <Twitter className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const primaryAccount = influencer.socialAccounts.find(
    (acc) => acc.platform === influencer.primaryPlatform
  )
  const demographics = primaryAccount?.audienceDemographics

  const ageData = demographics
    ? Object.entries(demographics.ageGroup as Record<string, number>).map(([age, value]) => ({
        name: age,
        value,
      }))
    : []

  const genderData = demographics
    ? Object.entries(demographics.genderSplit as Record<string, number>).map(([gender, value]) => ({
        name: gender.charAt(0).toUpperCase() + gender.slice(1),
        value,
      }))
    : []

  const engagementData = influencer.socialAccounts.map((account) => ({
    platform: account.platform.charAt(0).toUpperCase() + account.platform.slice(1),
    engagement: parseFloat(account.engagementRate.toFixed(2)),
  }))

  // Authenticity helpers
  const getAuthenticityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getRiskLevelColor = (risk: string) => {
    if (risk === 'low') return 'text-green-700 bg-green-100'
    if (risk === 'medium') return 'text-yellow-700 bg-yellow-100'
    return 'text-red-700 bg-red-100'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex items-start space-x-6">
            <InfluencerAvatar
              profileImageUrl={influencer.profileImageUrl}
              name={influencer.name}
              size="lg"
            />

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">{influencer.name}</h1>
                  {influencer.location && (
                    <div className="mt-2 flex items-center text-gray-600">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span>{influencer.location}</span>
                    </div>
                  )}
                </div>

                {/* Verification & Authenticity Badge */}
                {influencer.authenticity && (
                  <div className="flex flex-col items-end space-y-2">
                    {influencer.authenticity.isVerified && (
                      <div className="flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                        <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </div>
                    )}
                    <div className={`rounded-lg border px-3 py-1 text-sm font-semibold ${getAuthenticityColor(influencer.authenticity.overallAuthenticityScore)}`}>
                      {influencer.authenticity.overallAuthenticityScore}% Authentic
                    </div>
                  </div>
                )}
              </div>

              {influencer.bio && <p className="mt-4 text-gray-700">{influencer.bio}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                {influencer.niche.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
              <Users className="mx-auto h-8 w-8 text-blue-600" />
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {formatFollowers(totalFollowers)}
              </div>
              <div className="text-sm text-gray-600">Total Followers</div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
              <TrendingUp className="mx-auto h-8 w-8 text-green-600" />
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {avgEngagement.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">Avg Engagement Rate</div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
              <DollarSign className="mx-auto h-8 w-8 text-yellow-600" />
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {influencer.socialAccounts.length}
              </div>
              <div className="text-sm text-gray-600">Active Platforms</div>
            </div>
          </div>
        </div>

        {/* Authenticity & Quality Panel */}
        {influencer.authenticity && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Authenticity & Quality Metrics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${getAuthenticityColor(influencer.authenticity.overallAuthenticityScore)}`}>
                  {influencer.authenticity.overallAuthenticityScore}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-900">Overall Score</p>
                <p className="text-xs text-gray-600">Authenticity Rating</p>
              </div>

              <div className="text-center">
                <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${getAuthenticityColor(influencer.authenticity.followerQualityScore)}`}>
                  {influencer.authenticity.followerQualityScore}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-900">Follower Quality</p>
                <p className="text-xs text-gray-600">Real vs Fake Ratio</p>
              </div>

              <div className="text-center">
                <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${getAuthenticityColor(influencer.authenticity.engagementAuthenticityScore)}`}>
                  {influencer.authenticity.engagementAuthenticityScore}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-900">Engagement Quality</p>
                <p className="text-xs text-gray-600">Genuine Interactions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Suspicious Followers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {influencer.authenticity.suspiciousFollowersPercent.toFixed(1)}%
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Bot-like Engagement</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {influencer.authenticity.botLikesPercent.toFixed(1)}%
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Risk Level</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getRiskLevelColor(influencer.authenticity.riskLevel)}`}>
                  {influencer.authenticity.riskLevel.toUpperCase()}
                </span>
              </div>
            </div>

            {influencer.authenticity.riskFactors.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Risk Factors Detected:</p>
                <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                  {influencer.authenticity.riskFactors.map((factor, idx) => (
                    <li key={idx}>{factor}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-4 text-xs text-gray-500">
              Last checked: {new Date(influencer.authenticity.lastChecked).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Social Media Accounts</h2>
            <div className="space-y-4">
              {influencer.socialAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center space-x-3">
                    {getPlatformIcon(account.platform)}
                    <div>
                      <div className="font-medium text-gray-900">{account.handle}</div>
                      <div className="text-sm text-gray-600">
                        {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatFollowers(account.followersCount)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {account.engagementRate.toFixed(2)}% engagement
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Engagement by Platform</h2>
            <EngagementChart data={engagementData} />
          </div>
        </div>

        {demographics && (
          <div className="mt-8">
            <AudienceCharts ageData={ageData} genderData={genderData} />
          </div>
        )}

        {/* Performance History */}
        {primaryAccount?.performanceSnapshots && primaryAccount.performanceSnapshots.length > 0 && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Performance History (Last 90 Days)</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Current Followers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatFollowers(primaryAccount.performanceSnapshots[0].followersCount)}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Follower Growth</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {primaryAccount.performanceSnapshots[0].followersGrowth > 0 ? '+' : ''}
                  {formatFollowers(primaryAccount.performanceSnapshots[0].followersGrowth)}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Avg Engagement Rate</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {primaryAccount.performanceSnapshots[0].engagementRate.toFixed(2)}%
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Posts (Period)</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {primaryAccount.performanceSnapshots[0].postsThisPeriod}
                </p>
              </div>
            </div>

            {/* Simple trend visualization */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Growth Trend</h3>
              <div className="space-y-3">
                {primaryAccount.performanceSnapshots.slice(0, 10).reverse().map((snapshot, idx) => {
                  const growthPercent = snapshot.followersGrowth > 0
                    ? ((snapshot.followersGrowth / snapshot.followersCount) * 100).toFixed(1)
                    : '0.0'

                  return (
                    <div key={snapshot.id} className="flex items-center space-x-4">
                      <div className="w-24 text-sm text-gray-600">
                        {new Date(snapshot.snapshotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div
                          className={`h-full rounded-full ${snapshot.followersGrowth > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(Math.abs(parseFloat(growthPercent)) * 10, 100)}%` }}
                        />
                      </div>
                      <div className="w-20 text-right">
                        <span className={`text-sm font-medium ${snapshot.followersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {snapshot.followersGrowth > 0 ? '+' : ''}{growthPercent}%
                        </span>
                      </div>
                      <div className="w-24 text-right text-sm text-gray-600">
                        {formatFollowers(snapshot.followersCount)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Engagement Trend */}
            <div className="border-t mt-6 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Engagement Rate Trend</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {primaryAccount.performanceSnapshots.slice(0, 10).reverse().map((snapshot) => {
                  const height = Math.max((snapshot.engagementRate / 10) * 100, 10) // Scale to max 10% engagement

                  return (
                    <div key={snapshot.id} className="flex flex-col items-center">
                      <div className="h-24 w-full flex items-end">
                        <div
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${Math.min(height, 100)}%` }}
                          title={`${snapshot.engagementRate.toFixed(2)}%`}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        {new Date(snapshot.snapshotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content Analysis Insights */}
        {primaryAccount?.contentAnalysis && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Content Insights & Strategy</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Best Content Type</p>
                <p className="text-xl font-bold text-blue-600 mt-1 capitalize">
                  {primaryAccount.contentAnalysis.bestPerformingType}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Posting Frequency</p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {primaryAccount.contentAnalysis.avgPostsPerWeek.toFixed(1)}/week
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Consistency Score</p>
                <p className="text-xl font-bold text-purple-600 mt-1">
                  {(primaryAccount.contentAnalysis.postingConsistency * 100).toFixed(0)}%
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Avg Caption Length</p>
                <p className="text-xl font-bold text-orange-600 mt-1">
                  {primaryAccount.contentAnalysis.captionAvgLength} chars
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
              {/* Optimal Posting Times */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Optimal Posting Days</h3>
                <div className="flex flex-wrap gap-2">
                  {primaryAccount.contentAnalysis.optimalPostingDays.map((day) => (
                    <span
                      key={day}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                    >
                      {day}
                    </span>
                  ))}
                </div>

                <h3 className="text-sm font-semibold text-gray-900 mb-3 mt-4">Optimal Posting Hours</h3>
                <div className="flex flex-wrap gap-2">
                  {primaryAccount.contentAnalysis.optimalPostingHours.map((hour) => (
                    <span
                      key={hour}
                      className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                    >
                      {hour}:00
                    </span>
                  ))}
                </div>
              </div>

              {/* Content Type Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Content Type Performance</h3>
                <div className="space-y-3">
                  {Object.entries(primaryAccount.contentAnalysis.contentTypeBreakdown as Record<string, any>).map(([type, data]: [string, any]) => (
                    <div key={type}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                        <span className="text-sm text-gray-600">{data.count} posts</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full"
                          style={{ width: `${Math.min((data.avgEngagement / 10) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Avg engagement: {data.avgEngagement.toFixed(2)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Topics & Hashtags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t mt-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {primaryAccount.contentAnalysis.topTopics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Hashtags</h3>
                <div className="flex flex-wrap gap-2">
                  {primaryAccount.contentAnalysis.topHashtags.map((hashtag) => (
                    <span
                      key={hashtag}
                      className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-800"
                    >
                      #{hashtag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs text-gray-500">
              Last analyzed: {new Date(primaryAccount.contentAnalysis.analyzedAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Campaign Track Record */}
        {influencer.campaignHistory && influencer.campaignHistory.length > 0 && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Campaign Track Record</h2>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Campaigns</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {influencer.campaignHistory.length}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">On-Time Delivery</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {((influencer.campaignHistory.filter(c => c.deliveredOnTime).length / influencer.campaignHistory.length) * 100).toFixed(0)}%
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Avg Quality Rating</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {(influencer.campaignHistory.reduce((sum, c) => sum + (c.qualityRating || 0), 0) / influencer.campaignHistory.filter(c => c.qualityRating).length).toFixed(1)}/5
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Avg ROI</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {(influencer.campaignHistory.reduce((sum, c) => sum + (c.roi || 0), 0) / influencer.campaignHistory.filter(c => c.roi).length).toFixed(1)}x
                </p>
              </div>
            </div>

            {/* Campaign List */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Collaborations</h3>
              <div className="space-y-4">
                {influencer.campaignHistory.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-900">{campaign.brandName}</h4>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {campaign.campaignType}
                          </span>
                          <span className="text-sm text-gray-600">{campaign.industry}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(campaign.campaignDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {campaign.deliveredOnTime && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            ✓ On Time
                          </span>
                        )}
                        {campaign.qualityRating && (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            ⭐ {campaign.qualityRating}/5
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-gray-600">Reach</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatFollowers(campaign.reach)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Engagement</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatFollowers(campaign.engagement)}
                        </p>
                      </div>
                      {campaign.conversions && (
                        <div>
                          <p className="text-xs text-gray-600">Conversions</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatFollowers(campaign.conversions)}
                          </p>
                        </div>
                      )}
                      {campaign.roi && (
                        <div>
                          <p className="text-xs text-gray-600">ROI</p>
                          <p className="text-sm font-semibold text-green-600">
                            {campaign.roi.toFixed(1)}x
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Budget */}
                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Budget: <span className="font-semibold text-gray-900">
                          ${campaign.paidAmount.toLocaleString()} {campaign.currency}
                        </span>
                      </p>
                      {campaign.professionalismScore && (
                        <p className="text-sm text-gray-600">
                          Professionalism: <span className="font-semibold text-gray-900">
                            {campaign.professionalismScore}/10
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {influencer.campaignHistory.length > 5 && (
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Showing 5 of {influencer.campaignHistory.length} campaigns
                </p>
              )}
            </div>
          </div>
        )}

        {demographics && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Audience Insights</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Top Countries</h3>
                <div className="flex flex-wrap gap-2">
                  {demographics.topCountries.map((country) => (
                    <span
                      key={country}
                      className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    >
                      {country}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {demographics.interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 text-left text-sm font-semibold text-gray-900">Platform</th>
                  <th className="py-3 text-left text-sm font-semibold text-gray-900">
                    Content Type
                  </th>
                  <th className="py-3 text-left text-sm font-semibold text-gray-900">Price Range</th>
                </tr>
              </thead>
              <tbody>
                {influencer.socialAccounts.map((account) =>
                  account.pricing.map((price) => (
                    <tr key={price.id} className="border-b border-gray-100">
                      <td className="py-3 text-sm text-gray-900">
                        {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        {price.contentType.charAt(0).toUpperCase() + price.contentType.slice(1)}
                      </td>
                      <td className="py-3 text-sm font-medium text-gray-900">
                        ${price.priceMin.toLocaleString()}
                        {price.priceMax && ` - $${price.priceMax.toLocaleString()}`}
                        <span className="ml-1 text-xs text-gray-500">{price.currency}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
