'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, TrendingUp, DollarSign, Users, Target, CheckCircle2 } from 'lucide-react'

const INDUSTRIES = ['fashion', 'tech', 'fitness', 'lifestyle', 'beauty', 'food', 'travel', 'gaming']
const PLATFORMS = ['instagram', 'youtube', 'tiktok', 'twitter']
const AGE_GROUPS = ['18-24', '25-34', '35-44', '45+']
const CONTENT_TYPES = ['post', 'story', 'reel', 'video', 'tweet']
const LOCATIONS = ['US', 'UK', 'CA', 'AU', 'IN', 'DE', 'FR', 'BR']

type RecommendationResult = any

export default function RecommendationsPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RecommendationResult[]>([])
  const [formData, setFormData] = useState({
    industry: [] as string[],
    campaignGoal: 'awareness' as 'awareness' | 'sales' | 'engagement',
    ageGroups: [] as string[],
    genderMale: 33,
    genderFemale: 33,
    genderOther: 34,
    locations: [] as string[],
    budgetMin: 1000,
    budgetMax: 10000,
    platforms: [] as string[],
    contentType: 'post' as string,
  })

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter((i) => i !== item)
    }
    return [...array, item]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: formData.industry,
          campaignGoal: formData.campaignGoal,
          targetAudience: {
            ageGroups: formData.ageGroups,
            gender: {
              male: formData.genderMale,
              female: formData.genderFemale,
              other: formData.genderOther,
            },
            locations: formData.locations,
          },
          budget: {
            min: formData.budgetMin,
            max: formData.budgetMax,
          },
          platforms: formData.platforms,
          contentType: formData.contentType,
        }),
      })

      const data = await response.json()
      setResults(data.recommendations || [])
    } catch (error) {
      console.error('Error getting recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getCPEColor = (cpe: number) => {
    if (cpe < 0.1) return 'text-green-600 bg-green-50'
    if (cpe < 0.5) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            AI-Powered Recommendations
          </h1>
          <p className="mt-2 text-gray-600">
            Tell us about your campaign, and we'll match you with the perfect influencers
          </p>
        </div>

        {results.length === 0 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Details</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry / Niche *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map((industry) => (
                      <button
                        key={industry}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            industry: toggleArrayItem(prev.industry, industry),
                          }))
                        }
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          formData.industry.includes(industry)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {industry.charAt(0).toUpperCase() + industry.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Goal *
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['awareness', 'sales', 'engagement'].map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, campaignGoal: goal as any }))
                        }
                        className={`rounded-lg border-2 p-4 text-center transition ${
                          formData.campaignGoal === goal
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {goal.charAt(0).toUpperCase() + goal.slice(1)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Age Groups *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AGE_GROUPS.map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            ageGroups: toggleArrayItem(prev.ageGroups, age),
                          }))
                        }
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          formData.ageGroups.includes(age)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Locations *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            locations: toggleArrayItem(prev.locations, loc),
                          }))
                        }
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          formData.locations.includes(loc)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Minimum</label>
                      <input
                        type="number"
                        value={formData.budgetMin}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, budgetMin: parseInt(e.target.value) }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                        min="500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Maximum</label>
                      <input
                        type="number"
                        value={formData.budgetMax}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, budgetMax: parseInt(e.target.value) }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                        min="500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Platforms *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            platforms: toggleArrayItem(prev.platforms, platform),
                          }))
                        }
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          formData.platforms.includes(platform)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type *
                  </label>
                  <select
                    value={formData.contentType}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contentType: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  >
                    {CONTENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                formData.industry.length === 0 ||
                formData.ageGroups.length === 0 ||
                formData.locations.length === 0 ||
                formData.platforms.length === 0
              }
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Finding Matches...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Get Recommendations</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Top Matches</h2>
                <p className="text-gray-600">Found {results.length} perfect influencers for your campaign</p>
              </div>
              <button
                onClick={() => setResults([])}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                New Search
              </button>
            </div>

            <div className="space-y-6">
              {results.map((result, index) => (
                <div
                  key={result.influencer.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-200">
                          {result.influencer.profileImageUrl ? (
                            <img
                              src={result.influencer.profileImageUrl}
                              alt={result.influencer.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(result.influencer.name)}&size=160&background=3b82f6&color=ffffff&bold=true`
                              }}
                            />
                          ) : (
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(result.influencer.name)}&size=160&background=3b82f6&color=ffffff&bold=true`}
                              alt={result.influencer.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {result.influencer.name}
                          </h3>
                          {result.influencer.location && (
                            <p className="text-sm text-gray-600">{result.influencer.location}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-blue-600">{result.score}%</div>
                          <div className="text-sm text-gray-600">Match Score</div>
                        </div>
                      </div>

                      <p className="mt-2 text-gray-700">{result.explanation}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {result.matchReasons.map((reason: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm text-green-700"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {reason}
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 grid grid-cols-4 gap-4 border-t border-gray-100 pt-4">
                        <div className="text-center">
                          <TrendingUp className="mx-auto h-5 w-5 text-gray-400 mb-1" />
                          <div className="text-lg font-bold text-gray-900">
                            {formatNumber(result.roiMetrics.predictedReach)}
                          </div>
                          <div className="text-xs text-gray-600">Predicted Reach</div>
                        </div>
                        <div className="text-center">
                          <DollarSign className="mx-auto h-5 w-5 text-gray-400 mb-1" />
                          <div
                            className={`text-lg font-bold rounded px-2 ${getCPEColor(
                              result.roiMetrics.costPerEngagement
                            )}`}
                          >
                            ${result.roiMetrics.costPerEngagement.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600">Cost/Engagement</div>
                        </div>
                        <div className="text-center">
                          <Users className="mx-auto h-5 w-5 text-gray-400 mb-1" />
                          <div className="text-lg font-bold text-gray-900">
                            {formatNumber(result.roiMetrics.expectedImpressions)}
                          </div>
                          <div className="text-xs text-gray-600">Impressions</div>
                        </div>
                        <div className="text-center">
                          <Target className="mx-auto h-5 w-5 text-gray-400 mb-1" />
                          <div className="text-lg font-bold text-gray-900">
                            {result.roiMetrics.estimatedROI}%
                          </div>
                          <div className="text-xs text-gray-600">Est. ROI</div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Link
                          href={`/influencer/${result.influencer.id}`}
                          className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                        >
                          View Full Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
