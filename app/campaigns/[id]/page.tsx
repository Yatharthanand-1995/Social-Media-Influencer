'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Plus, Users, DollarSign, Calendar, Target, TrendingUp } from 'lucide-react'
import InfluencerAvatar from '@/components/InfluencerAvatar'

interface Campaign {
  id: string
  name: string
  goal: string
  budget: number
  startDate: string
  endDate: string
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
  targetMetrics: any
  client: {
    id: string
    name: string
    industry: string
    logo: string | null
  }
  collaborations: Array<{
    id: string
    agreedPrice: number
    contentType: string
    deliverables: string
    status: string
    actualReach: number | null
    actualEngagement: number | null
    actualROI: number | null
    influencer: {
      id: string
      name: string
      profileImageUrl: string | null
      primaryPlatform: string
      niche: string[]
      socialAccounts: Array<{
        platform: string
        followersCount: number
        engagementRate: number
      }>
    }
  }>
  createdAt: string
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [campaignId, setCampaignId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then((resolved) => {
      setCampaignId(resolved.id)
    })
  }, [params])

  useEffect(() => {
    if (status === 'authenticated' && campaignId) {
      fetchCampaign()
    }
  }, [status, campaignId])

  const fetchCampaign = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch campaign')
      }

      const data = await response.json()
      setCampaign(data.campaign)
    } catch (err) {
      console.error('Error fetching campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${campaign?.name}"? This will remove all collaborations.`)) {
      return
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete campaign')
      }

      router.push('/campaigns')
    } catch (err) {
      console.error('Error deleting campaign:', err)
      alert('Failed to delete campaign. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'planning':
        return 'bg-blue-100 text-blue-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCollaborationStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'agreed':
        return 'bg-purple-100 text-purple-800'
      case 'negotiating':
        return 'bg-yellow-100 text-yellow-800'
      case 'proposed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session?.user.agencyId) {
    router.push('/auth/login')
    return null
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Campaign not found'}</p>
          <Link href="/campaigns" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Back to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const totalSpent = campaign.collaborations.reduce((sum, c) => sum + c.agreedPrice, 0)
  const totalActualReach = campaign.collaborations.reduce((sum, c) => sum + (c.actualReach || 0), 0)
  const totalActualEngagement = campaign.collaborations.reduce((sum, c) => sum + (c.actualEngagement || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/campaigns" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {campaign.client.logo ? (
                <img
                  src={campaign.client.logo}
                  alt={`${campaign.client.name} logo`}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              )}

              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">
                  Client: <Link href={`/agency/clients/${campaign.client.id}`} className="font-medium text-blue-600 hover:underline">{campaign.client.name}</Link> • {campaign.client.industry}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete campaign"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">${campaign.budget.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Spent: ${totalSpent.toLocaleString()} ({((totalSpent / campaign.budget) * 100).toFixed(0)}%)
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Duration</p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {Math.ceil((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Influencers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{campaign.collaborations.length}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {campaign.collaborations.filter(c => c.status === 'completed').length} completed
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reach</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalActualReach > 0 ? formatFollowers(totalActualReach) : '-'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {totalActualEngagement > 0 ? `${formatFollowers(totalActualEngagement)} engagement` : 'No data yet'}
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Goal */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            Campaign Goal
          </h2>
          <p className="text-gray-700">{campaign.goal}</p>

          {campaign.targetMetrics && Object.keys(campaign.targetMetrics).length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Target Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                {campaign.targetMetrics.reach && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Target Reach</p>
                    <p className="text-lg font-bold text-blue-600">{formatFollowers(campaign.targetMetrics.reach)}</p>
                  </div>
                )}
                {campaign.targetMetrics.engagement && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Target Engagement</p>
                    <p className="text-lg font-bold text-green-600">{formatFollowers(campaign.targetMetrics.engagement)}</p>
                  </div>
                )}
                {campaign.targetMetrics.conversions && (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Target Conversions</p>
                    <p className="text-lg font-bold text-purple-600">{formatFollowers(campaign.targetMetrics.conversions)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Influencer Collaborations */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Influencer Collaborations</h2>
            <Link
              href={`/campaigns/${campaignId}/add-influencers`}
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Influencers
            </Link>
          </div>

          {campaign.collaborations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No influencers yet</h3>
              <p className="text-gray-600 mb-6">Start building your campaign by adding influencers</p>
              <Link
                href={`/campaigns/${campaignId}/add-influencers`}
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Influencer
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaign.collaborations.map((collab) => {
                const primaryAccount = collab.influencer.socialAccounts.find(
                  (acc) => acc.platform === collab.influencer.primaryPlatform
                )

                return (
                  <div key={collab.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <InfluencerAvatar
                          profileImageUrl={collab.influencer.profileImageUrl}
                          name={collab.influencer.name}
                          size="md"
                        />

                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Link
                              href={`/influencer/${collab.influencer.id}`}
                              className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {collab.influencer.name}
                            </Link>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCollaborationStatusColor(collab.status)}`}>
                              {collab.status.replace('_', ' ').charAt(0).toUpperCase() + collab.status.slice(1).replace('_', ' ')}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span className="capitalize">{collab.influencer.primaryPlatform}</span>
                            {primaryAccount && (
                              <>
                                <span>•</span>
                                <span>{formatFollowers(primaryAccount.followersCount)} followers</span>
                                <span>•</span>
                                <span>{primaryAccount.engagementRate.toFixed(2)}% engagement</span>
                              </>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 mt-2">
                            {collab.influencer.niche.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-600">Agreed Price</p>
                              <p className="text-sm font-semibold text-gray-900">${collab.agreedPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Content Type</p>
                              <p className="text-sm font-medium text-gray-900 capitalize">{collab.contentType}</p>
                            </div>
                            {collab.actualReach && (
                              <div>
                                <p className="text-xs text-gray-600">Actual Reach</p>
                                <p className="text-sm font-semibold text-green-600">{formatFollowers(collab.actualReach)}</p>
                              </div>
                            )}
                            {collab.actualROI && (
                              <div>
                                <p className="text-xs text-gray-600">ROI</p>
                                <p className="text-sm font-semibold text-green-600">{collab.actualROI.toFixed(1)}x</p>
                              </div>
                            )}
                          </div>

                          <div className="mt-2">
                            <p className="text-xs text-gray-600">Deliverables</p>
                            <p className="text-sm text-gray-700 mt-1">{collab.deliverables}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
