'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, TrendingUp, List, Plus, Search, BarChart } from 'lucide-react'

interface Client {
  id: string
  name: string
  industry: string
  logo: string | null
  _count: {
    campaigns: number
    savedLists: number
  }
  campaigns: Array<{
    id: string
    name: string
    status: string
    budget: number
  }>
}

interface DashboardStats {
  totalClients: number
  activeCampaigns: number
  totalLists: number
  totalInfluencers: number
}

export default function AgencyDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeCampaigns: 0,
    totalLists: 0,
    totalInfluencers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated' && !session.user.agencyId) {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status, session, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/agency/clients')

      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }

      const data = await response.json()
      setClients(data.clients || [])

      // Calculate stats
      const totalClients = data.clients.length
      const activeCampaigns = data.clients.reduce(
        (sum: number, client: Client) =>
          sum + client.campaigns.filter(c => c.status === 'active').length,
        0
      )
      const totalLists = data.clients.reduce(
        (sum: number, client: Client) => sum + client._count.savedLists,
        0
      )

      setStats({
        totalClients,
        activeCampaigns,
        totalLists,
        totalInfluencers: 0, // TODO: Calculate from lists
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agency Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your clients, campaigns, and influencer collaborations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalClients}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeCampaigns}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Influencer Lists</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLists}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <List className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {clients.reduce((sum, client) => sum + client._count.campaigns, 0)}
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <BarChart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/agency/clients/new"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition flex items-center space-x-4"
            >
              <div className="bg-blue-100 rounded-full p-3">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Add New Client</p>
                <p className="text-sm text-gray-600">Create a new client profile</p>
              </div>
            </Link>

            <Link
              href="/discover"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition flex items-center space-x-4"
            >
              <div className="bg-green-100 rounded-full p-3">
                <Search className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Discover Influencers</p>
                <p className="text-sm text-gray-600">Find the perfect match</p>
              </div>
            </Link>

            <Link
              href="/campaigns/new"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition flex items-center space-x-4"
            >
              <div className="bg-purple-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Create Campaign</p>
                <p className="text-sm text-gray-600">Launch a new campaign</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Clients Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Clients</h2>
            <Link
              href="/agency/clients"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All →
            </Link>
          </div>

          {clients.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first client
              </p>
              <Link
                href="/agency/clients/new"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Client
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.slice(0, 6).map((client) => (
                <Link
                  key={client.id}
                  href={`/agency/clients/${client.id}`}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {client.name}
                      </h3>
                      <p className="text-sm text-gray-600">{client.industry}</p>
                    </div>
                    {client.logo && (
                      <img
                        src={client.logo}
                        alt={`${client.name} logo`}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Campaigns</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {client._count.campaigns}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lists</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {client._count.savedLists}
                      </p>
                    </div>
                  </div>

                  {client.campaigns.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-600 mb-2">Latest Campaign</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {client.campaigns[0].name}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          client.campaigns[0].status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : client.campaigns[0].status === 'planning'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.campaigns[0].status}
                        </span>
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
