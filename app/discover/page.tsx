'use client'

import { useState, useEffect } from 'react'
import InfluencerCard from '@/components/InfluencerCard'
import { Search, SlidersHorizontal, X, AlertCircle } from 'lucide-react'

const PLATFORMS = ['instagram', 'youtube', 'tiktok', 'twitter']
const NICHES = ['fashion', 'tech', 'fitness', 'lifestyle', 'beauty', 'food', 'travel', 'gaming']
const FOLLOWER_RANGES = [
  { label: 'All', min: 0, max: null },
  { label: '10K - 50K', min: 10000, max: 50000 },
  { label: '50K - 100K', min: 50000, max: 100000 },
  { label: '100K - 500K', min: 100000, max: 500000 },
  { label: '500K - 1M', min: 500000, max: 1000000 },
  { label: '1M+', min: 1000000, max: null },
]

const ENGAGEMENT_RANGES = [
  { label: 'All', min: 0, max: null },
  { label: 'High (5%+)', min: 5, max: null },
  { label: 'Medium (2-5%)', min: 2, max: 5 },
  { label: 'Low (<2%)', min: 0, max: 2 },
]

interface Influencer {
  id: string
  name: string
  bio: string | null
  primaryPlatform: string
  niche: string[]
  location: string | null
  profileImageUrl: string | null
  socialAccounts: Array<{
    id: string
    platform: string
    handle: string
    followersCount: number
    engagementRate: number
    avgLikes: number
    avgComments: number
    avgViews: number | null
  }>
}

export default function DiscoverPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(true)

  const [filters, setFilters] = useState({
    platform: '',
    niche: '',
    minFollowers: '',
    maxFollowers: '',
    minEngagement: '',
    maxEngagement: '',
    location: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    // New enrichment-based filters
    minAuthenticityScore: '',
    verifiedOnly: false,
    growthTrend: '',
    riskLevelMax: '',
    hasHistoricalData: false,
  })

  useEffect(() => {
    fetchInfluencers()
  }, [filters])

  const fetchInfluencers = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== false) {
          params.append(key, String(value))
        }
      })

      const response = await fetch(`/api/search?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to fetch influencers')
      }

      const data = await response.json()
      setInfluencers(data.influencers || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Error fetching influencers:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      platform: '',
      niche: '',
      minFollowers: '',
      maxFollowers: '',
      minEngagement: '',
      maxEngagement: '',
      location: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      minAuthenticityScore: '',
      verifiedOnly: false,
      growthTrend: '',
      riskLevelMax: '',
      hasHistoricalData: false,
    })
  }

  const activeFilterCount = Object.entries(filters).filter(
    ([key, v]) => {
      if (key === 'sortBy' || key === 'sortOrder') return false
      if (typeof v === 'boolean') return v === true
      return v && v !== ''
    }
  ).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Discover Influencers</h1>
          <p className="mt-2 text-gray-600">
            Browse and filter through our curated list of social media influencers
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4" />
              <span>Clear all filters</span>
            </button>
          )}
        </div>

        <div className="flex gap-8">
          {showFilters && (
            <aside className="w-64 flex-shrink-0">
              <div className="sticky top-4 space-y-6 rounded-lg border border-gray-200 bg-white p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <select
                    value={filters.platform}
                    onChange={(e) => updateFilter('platform', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Platforms</option>
                    {PLATFORMS.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niche</label>
                  <select
                    value={filters.niche}
                    onChange={(e) => updateFilter('niche', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Niches</option>
                    {NICHES.map((niche) => (
                      <option key={niche} value={niche}>
                        {niche.charAt(0).toUpperCase() + niche.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Followers
                  </label>
                  <select
                    onChange={(e) => {
                      const range = FOLLOWER_RANGES[parseInt(e.target.value)]
                      updateFilter('minFollowers', range.min.toString())
                      updateFilter('maxFollowers', range.max?.toString() || '')
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {FOLLOWER_RANGES.map((range, index) => (
                      <option key={range.label} value={index}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engagement Rate
                  </label>
                  <select
                    onChange={(e) => {
                      const range = ENGAGEMENT_RANGES[parseInt(e.target.value)]
                      updateFilter('minEngagement', range.min.toString())
                      updateFilter('maxEngagement', range.max?.toString() || '')
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {ENGAGEMENT_RANGES.map((range, index) => (
                      <option key={range.label} value={index}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    placeholder="e.g., Los Angeles"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Advanced Filters</h3>
                </div>

                {/* Authenticity Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. Authenticity Score
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.minAuthenticityScore || 0}
                    onChange={(e) => updateFilter('minAuthenticityScore', e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>0</span>
                    <span className="font-medium text-blue-600">
                      {filters.minAuthenticityScore || 0}%
                    </span>
                    <span>100</span>
                  </div>
                </div>

                {/* Verified Only */}
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.verifiedOnly}
                      onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Verified accounts only</span>
                  </label>
                </div>

                {/* Growth Trend */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Growth Trend
                  </label>
                  <select
                    value={filters.growthTrend}
                    onChange={(e) => updateFilter('growthTrend', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Trends</option>
                    <option value="rising">Rising (5%+ growth)</option>
                    <option value="stable">Stable (0-5% growth)</option>
                    <option value="declining">Declining (&lt;0% growth)</option>
                  </select>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Risk Level
                  </label>
                  <select
                    value={filters.riskLevelMax}
                    onChange={(e) => updateFilter('riskLevelMax', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Risk Levels</option>
                    <option value="low">Low Risk Only</option>
                    <option value="medium">Low &amp; Medium</option>
                    <option value="high">All (Including High)</option>
                  </select>
                </div>

                {/* Has Historical Data */}
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasHistoricalData}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasHistoricalData: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Has performance history</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="createdAt">Newest</option>
                    <option value="followers">Most Followers</option>
                    <option value="engagement">Best Engagement</option>
                  </select>
                </div>
              </div>
            </aside>
          )}

          <main className="flex-1">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-medium text-red-900">Error loading influencers</h3>
                    <p className="mt-2 text-red-700">{error}</p>
                    <button
                      onClick={() => fetchInfluencers()}
                      className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-4 text-gray-600">Loading influencers...</p>
                </div>
              </div>
            ) : influencers.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No influencers found</h3>
                <p className="mt-2 text-gray-600">
                  Try adjusting your filters to see more results
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Found {influencers.length} influencer{influencers.length !== 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {influencers.map((influencer) => (
                    <InfluencerCard key={influencer.id} influencer={influencer} />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
