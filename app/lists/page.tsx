'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { List, Plus, Search, Trash2, Users, Tag } from 'lucide-react'

interface InfluencerList {
  id: string
  name: string
  description: string | null
  tags: string[]
  client: {
    id: string
    name: string
  }
  _count: {
    influencers: number
  }
  createdAt: string
}

export default function ListsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lists, setLists] = useState<InfluencerList[]>([])
  const [filteredLists, setFilteredLists] = useState<InfluencerList[]>([])
  const [searchQuery, setSearchQuery] = useState('')
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
      fetchLists()
    }
  }, [status, session, router])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLists(lists)
    } else {
      const filtered = lists.filter(
        (list) =>
          list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          list.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          list.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredLists(filtered)
    }
  }, [searchQuery, lists])

  const fetchLists = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/lists')

      if (!response.ok) {
        throw new Error('Failed to fetch lists')
      }

      const data = await response.json()
      setLists(data.lists || [])
      setFilteredLists(data.lists || [])
    } catch (err) {
      console.error('Error fetching lists:', err)
      setError(err instanceof Error ? err.message : 'Failed to load lists')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (listId: string, listName: string) => {
    if (!confirm(`Are you sure you want to delete "${listName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete list')
      }

      setLists(lists.filter((l) => l.id !== listId))
      alert('List deleted successfully')
    } catch (err) {
      console.error('Error deleting list:', err)
      alert('Failed to delete list. Please try again.')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lists...</p>
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
            onClick={fetchLists}
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Influencer Lists</h1>
              <p className="mt-2 text-gray-600">Organize and manage your influencer prospects</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search lists by name, client, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lists Grid */}
        {filteredLists.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No lists found' : 'No lists yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Lists are created automatically when you add influencers to campaigns'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLists.map((list) => (
              <div
                key={list.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <Link
                    href={`/lists/${list.id}`}
                    className="flex-1 text-xl font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {list.name}
                  </Link>
                  <button
                    onClick={() => handleDelete(list.id, list.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition ml-2"
                    title="Delete list"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Client: <span className="font-medium text-gray-900">{list.client.name}</span>
                </p>

                {list.description && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{list.description}</p>
                )}

                {list.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {list.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span className="text-sm">
                      {list._count.influencers} influencer{list._count.influencers !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <Link
                    href={`/lists/${list.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View Details →
                  </Link>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Created {new Date(list.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
