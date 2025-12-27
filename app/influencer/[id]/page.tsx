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
      socialAccounts: {
        include: {
          audienceDemographics: true,
          pricing: true,
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
              <h1 className="text-3xl font-bold text-gray-900">{influencer.name}</h1>
              {influencer.location && (
                <div className="mt-2 flex items-center text-gray-600">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>{influencer.location}</span>
                </div>
              )}
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
