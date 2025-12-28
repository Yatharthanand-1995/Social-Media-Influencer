'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

interface Client {
  id: string
  name: string
  industry: string
}

export default function NewCampaignPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingClients, setLoadingClients] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    goal: '',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'planning' as 'planning' | 'active' | 'paused' | 'completed' | 'cancelled',
    targetReach: '',
    targetEngagement: '',
    targetConversions: '',
  })

  useEffect(() => {
    if (status === 'authenticated') {
      fetchClients()
    }
  }, [status])

  const fetchClients = async () => {
    try {
      setLoadingClients(true)
      const response = await fetch('/api/agency/clients')

      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }

      const data = await response.json()
      setClients(data.clients || [])
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError('Failed to load clients. Please refresh the page.')
    } finally {
      setLoadingClients(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Build target metrics object
      const targetMetrics: any = {}
      if (formData.targetReach) targetMetrics.reach = parseInt(formData.targetReach)
      if (formData.targetEngagement) targetMetrics.engagement = parseInt(formData.targetEngagement)
      if (formData.targetConversions) targetMetrics.conversions = parseInt(formData.targetConversions)

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: formData.clientId,
          name: formData.name,
          goal: formData.goal,
          budget: parseFloat(formData.budget),
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          status: formData.status,
          targetMetrics,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create campaign')
      }

      // Redirect to the new campaign page
      router.push(`/campaigns/${data.campaign.id}`)
    } catch (err) {
      console.error('Error creating campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
      setLoading(false)
    }
  }

  if (status === 'loading' || loadingClients) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session?.user.agencyId) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/campaigns"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
          <p className="mt-2 text-gray-600">Set up a new influencer marketing campaign</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Client Selection */}
            <div className="mb-6">
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                id="clientId"
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.industry})
                  </option>
                ))}
              </select>
              {clients.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  No clients found. <Link href="/agency/clients/new" className="text-blue-600 hover:underline">Create a client first</Link>
                </p>
              )}
            </div>

            {/* Campaign Name */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Summer Product Launch 2024"
                maxLength={100}
              />
            </div>

            {/* Campaign Goal */}
            <div className="mb-6">
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Goal <span className="text-red-500">*</span>
              </label>
              <textarea
                id="goal"
                required
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the campaign objectives and key messages..."
                maxLength={500}
              />
              <p className="mt-2 text-sm text-gray-500">{formData.goal.length}/500 characters</p>
            </div>

            {/* Budget */}
            <div className="mb-6">
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="budget"
                required
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10000"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status */}
            <div className="mb-6">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Target Metrics */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Target Metrics (Optional)</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="targetReach" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Reach
                  </label>
                  <input
                    type="number"
                    id="targetReach"
                    min="0"
                    value={formData.targetReach}
                    onChange={(e) => setFormData({ ...formData, targetReach: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100000"
                  />
                </div>

                <div>
                  <label htmlFor="targetEngagement" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Engagement
                  </label>
                  <input
                    type="number"
                    id="targetEngagement"
                    min="0"
                    value={formData.targetEngagement}
                    onChange={(e) => setFormData({ ...formData, targetEngagement: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label htmlFor="targetConversions" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Conversions
                  </label>
                  <input
                    type="number"
                    id="targetConversions"
                    min="0"
                    value={formData.targetConversions}
                    onChange={(e) => setFormData({ ...formData, targetConversions: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Link
                href="/campaigns"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || clients.length === 0}
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Create Campaign
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
