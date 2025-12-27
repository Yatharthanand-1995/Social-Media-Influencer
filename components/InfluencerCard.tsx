import Link from 'next/link'
import { MapPin, Users, TrendingUp } from 'lucide-react'
import { Instagram, Youtube, Twitter } from 'lucide-react'
import InfluencerAvatar from './InfluencerAvatar'

type SocialAccount = {
  platform: string
  followersCount: number
  engagementRate: number
}

type Influencer = {
  id: string
  name: string
  bio: string | null
  profileImageUrl: string | null
  primaryPlatform: string
  niche: string[]
  location: string | null
  socialAccounts: SocialAccount[]
}

export default function InfluencerCard({ influencer }: { influencer: Influencer }) {
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

  const getEngagementColor = (rate: number) => {
    if (rate >= 5) return 'text-green-600 bg-green-50'
    if (rate >= 2) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />
      case 'youtube':
        return <Youtube className="h-4 w-4" />
      case 'twitter':
        return <Twitter className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <Link href={`/influencer/${influencer.id}`}>
      <div className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
        <div className="flex items-start space-x-4">
          <InfluencerAvatar
            profileImageUrl={influencer.profileImageUrl}
            name={influencer.name}
            size="md"
          />

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
              {influencer.name}
            </h3>
            {influencer.location && (
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {influencer.location}
              </div>
            )}
          </div>
        </div>

        {influencer.bio && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">{influencer.bio}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {influencer.niche.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
            >
              {tag}
            </span>
          ))}
          {influencer.niche.length > 3 && (
            <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700">
              +{influencer.niche.length - 3}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center space-x-4">
          {influencer.socialAccounts.map((account) => (
            <div key={account.platform} className="flex items-center space-x-1 text-gray-600">
              {getPlatformIcon(account.platform)}
              <span className="text-sm font-medium">
                {formatFollowers(account.followersCount)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              {formatFollowers(totalFollowers)} total
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getEngagementColor(
                avgEngagement
              )}`}
            >
              {avgEngagement.toFixed(2)}% engagement
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
