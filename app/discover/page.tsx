'use client'

import { useState, useEffect } from 'react'
import InfluencerCard from '@/components/InfluencerCard'
import { Search, SlidersHorizontal, X } from 'lucide-react'

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

type Influencer = any

export default function DiscoverPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
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
  })

  useEffect(() => {
    fetchInfluencers()
  }, [filters])

  const fetchInfluencers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value)
        }
      })

      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()
      setInfluencers(data.influencers || [])
    } catch (error) {
      console.error('Error fetching influencers:', error)
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
    })
  }

  const activeFilterCount = Object.values(filters).filter(
    (v) => v && v !== 'createdAt' && v !== 'desc'
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
            {loading ? (
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
                  {influencers.map((influencer: Influencer) => (
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
