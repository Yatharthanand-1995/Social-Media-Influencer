'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, Save, Youtube } from 'lucide-react'

const PLATFORMS = ['instagram', 'youtube', 'tiktok', 'twitter']
const NICHES = ['fashion', 'tech', 'fitness', 'lifestyle', 'beauty', 'food', 'travel', 'gaming']
const CONTENT_TYPES = ['post', 'story', 'reel', 'video', 'tweet']

type SocialAccount = {
  platform: string
  handle: string
  followersCount: number
  avgViews: number
  avgLikes: number
  avgComments: number
  engagementRate: number
  audienceDemographics?: {
    ageGroup: Record<string, number>
    genderSplit: Record<string, number>
    topCountries: string[]
    interests: string[]
  }
  pricing: Array<{
    contentType: string
    priceMin: number
    priceMax: number
    currency: string
  }>
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    primaryPlatform: 'instagram' as any,
    niche: [] as string[],
    location: '',
    profileImageUrl: '',
  })

  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    {
      platform: 'instagram',
      handle: '',
      followersCount: 0,
      avgViews: 0,
      avgLikes: 0,
      avgComments: 0,
      engagementRate: 0,
      pricing: [{ contentType: 'post', priceMin: 0, priceMax: 0, currency: 'USD' }],
    },
  ])

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleNiche = (niche: string) => {
    setFormData((prev) => ({
      ...prev,
      niche: prev.niche.includes(niche)
        ? prev.niche.filter((n) => n !== niche)
        : [...prev.niche, niche],
    }))
  }

  const addSocialAccount = () => {
    setSocialAccounts((prev) => [
      ...prev,
      {
        platform: 'instagram',
        handle: '',
        followersCount: 0,
        avgViews: 0,
        avgLikes: 0,
        avgComments: 0,
        engagementRate: 0,
        pricing: [{ contentType: 'post', priceMin: 0, priceMax: 0, currency: 'USD' }],
      },
    ])
  }

  const removeSocialAccount = (index: number) => {
    setSocialAccounts((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSocialAccount = (index: number, key: string, value: any) => {
    setSocialAccounts((prev) =>
      prev.map((account, i) => (i === index ? { ...account, [key]: value } : account))
    )
  }

  const addPricing = (accountIndex: number) => {
    setSocialAccounts((prev) =>
      prev.map((account, i) =>
        i === accountIndex
          ? {
              ...account,
              pricing: [
                ...account.pricing,
                { contentType: 'post', priceMin: 0, priceMax: 0, currency: 'USD' },
              ],
            }
          : account
      )
    )
  }

  const removePricing = (accountIndex: number, pricingIndex: number) => {
    setSocialAccounts((prev) =>
      prev.map((account, i) =>
        i === accountIndex
          ? {
              ...account,
              pricing: account.pricing.filter((_, j) => j !== pricingIndex),
            }
          : account
      )
    )
  }

  const updatePricing = (accountIndex: number, pricingIndex: number, key: string, value: any) => {
    setSocialAccounts((prev) =>
      prev.map((account, i) =>
        i === accountIndex
          ? {
              ...account,
              pricing: account.pricing.map((price, j) =>
                j === pricingIndex ? { ...price, [key]: value } : price
              ),
            }
          : account
      )
    )
  }

  const calculateEngagement = (index: number) => {
    const account = socialAccounts[index]
    if (account.followersCount > 0) {
      const engagement =
        ((account.avgLikes + account.avgComments) / account.followersCount) * 100
      updateSocialAccount(index, 'engagementRate', parseFloat(engagement.toFixed(2)))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/influencers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          socialAccounts,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage({ type: 'success', text: 'Influencer added successfully!' })
        setTimeout(() => {
          router.push(`/influencer/${data.id}`)
        }, 1500)
      } else {
        setMessage({ type: 'error', text: 'Failed to add influencer. Please try again.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Influencer</h1>
          <p className="mt-2 text-gray-600">
            Manually add influencer data to the platform
          </p>
        </div>

        <div className="mb-6 rounded-lg border-2 border-red-200 bg-red-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Youtube className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Quick Import from YouTube</h3>
                <p className="text-sm text-red-700">
                  Automatically fetch real YouTuber data using the YouTube API
                </p>
              </div>
            </div>
            <Link
              href="/admin/import-youtube"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              Import YouTube Channel
            </Link>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-lg p-4 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Sarah Chen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Platform *
                </label>
                <select
                  required
                  value={formData.primaryPlatform}
                  onChange={(e) => updateFormData('primaryPlatform', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niche (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {NICHES.map((niche) => (
                    <button
                      key={niche}
                      type="button"
                      onClick={() => toggleNiche(niche)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        formData.niche.includes(niche)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {niche.charAt(0).toUpperCase() + niche.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Los Angeles, CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image URL
                </label>
                <input
                  type="url"
                  value={formData.profileImageUrl}
                  onChange={(e) => updateFormData('profileImageUrl', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Social Media Accounts</h2>
              <button
                type="button"
                onClick={addSocialAccount}
                className="flex items-center space-x-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Add Account</span>
              </button>
            </div>

            {socialAccounts.map((account, accountIndex) => (
              <div
                key={accountIndex}
                className="mb-6 rounded-lg border border-gray-200 p-4 last:mb-0"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Account {accountIndex + 1}</h3>
                  {socialAccounts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSocialAccount(accountIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform *
                    </label>
                    <select
                      required
                      value={account.platform}
                      onChange={(e) => updateSocialAccount(accountIndex, 'platform', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {PLATFORMS.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Handle *
                    </label>
                    <input
                      type="text"
                      required
                      value={account.handle}
                      onChange={(e) => updateSocialAccount(accountIndex, 'handle', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Followers *
                    </label>
                    <input
                      type="number"
                      required
                      value={account.followersCount}
                      onChange={(e) =>
                        updateSocialAccount(accountIndex, 'followersCount', parseInt(e.target.value) || 0)
                      }
                      onBlur={() => calculateEngagement(accountIndex)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avg Views
                    </label>
                    <input
                      type="number"
                      value={account.avgViews}
                      onChange={(e) =>
                        updateSocialAccount(accountIndex, 'avgViews', parseInt(e.target.value) || 0)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avg Likes *
                    </label>
                    <input
                      type="number"
                      required
                      value={account.avgLikes}
                      onChange={(e) =>
                        updateSocialAccount(accountIndex, 'avgLikes', parseInt(e.target.value) || 0)
                      }
                      onBlur={() => calculateEngagement(accountIndex)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avg Comments *
                    </label>
                    <input
                      type="number"
                      required
                      value={account.avgComments}
                      onChange={(e) =>
                        updateSocialAccount(accountIndex, 'avgComments', parseInt(e.target.value) || 0)
                      }
                      onBlur={() => calculateEngagement(accountIndex)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Engagement Rate (auto-calculated)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={account.engagementRate}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">Pricing</h4>
                    <button
                      type="button"
                      onClick={() => addPricing(accountIndex)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add pricing
                    </button>
                  </div>

                  {account.pricing.map((price, pricingIndex) => (
                    <div key={pricingIndex} className="mb-2 flex items-center space-x-2">
                      <select
                        value={price.contentType}
                        onChange={(e) =>
                          updatePricing(accountIndex, pricingIndex, 'contentType', e.target.value)
                        }
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {CONTENT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Min price"
                        value={price.priceMin}
                        onChange={(e) =>
                          updatePricing(accountIndex, pricingIndex, 'priceMin', parseFloat(e.target.value) || 0)
                        }
                        className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Max price"
                        value={price.priceMax}
                        onChange={(e) =>
                          updatePricing(accountIndex, pricingIndex, 'priceMax', parseFloat(e.target.value) || 0)
                        }
                        className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {account.pricing.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePricing(accountIndex, pricingIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/discover')}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Influencer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
