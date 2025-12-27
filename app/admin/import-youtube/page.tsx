'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Youtube, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

type ImportStatus = 'idle' | 'loading' | 'success' | 'error'

interface ImportResult {
  influencer?: any
  message?: string
  error?: string
}

export default function ImportYouTubePage() {
  const [channelInput, setChannelInput] = useState('')
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setResult(null)

    try {
      const response = await fetch('/api/youtube/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelInput: channelInput.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setResult(data)
        setChannelInput('')
      } else {
        setStatus('error')
        setResult({ error: data.error || 'Failed to import channel' })
      }
    } catch (error) {
      setStatus('error')
      setResult({ error: 'Network error. Please check your API key and try again.' })
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Youtube className="h-8 w-8 text-red-600" />
            Import YouTube Channel
          </h1>
          <p className="mt-2 text-gray-600">
            Enter a YouTube channel handle or ID to automatically import influencer data
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleImport} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Channel Handle or ID
              </label>
              <input
                type="text"
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                placeholder="@mkbhd or UCBJycsmduvYEL83R_U4JriQ"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={status === 'loading'}
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Examples: @mkbhd, @mrbeast, or channel ID like UCBJycsmduvYEL83R_U4JriQ
              </p>
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || !channelInput.trim()}
              className="w-full rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Importing Channel Data...</span>
                </>
              ) : (
                <>
                  <Youtube className="h-5 w-5" />
                  <span>Import Channel</span>
                </>
              )}
            </button>
          </form>

          {status === 'success' && result?.influencer && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">Successfully Imported!</h3>
                  <p className="mt-1 text-sm text-green-700">{result.message}</p>

                  <div className="mt-4 rounded-lg border border-green-300 bg-white p-4">
                    <div className="flex items-start gap-4">
                      {result.influencer.profileImageUrl && (
                        <img
                          src={result.influencer.profileImageUrl}
                          alt={result.influencer.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{result.influencer.name}</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {result.influencer.niche.map((tag: string) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {result.influencer.socialAccounts[0] && (
                          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Subscribers</div>
                              <div className="font-semibold text-gray-900">
                                {formatNumber(result.influencer.socialAccounts[0].followersCount)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Avg Views</div>
                              <div className="font-semibold text-gray-900">
                                {formatNumber(result.influencer.socialAccounts[0].avgViews)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Engagement</div>
                              <div className="font-semibold text-gray-900">
                                {result.influencer.socialAccounts[0].engagementRate}%
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/influencer/${result.influencer.id}`}
                      className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => {
                        setStatus('idle')
                        setResult(null)
                      }}
                      className="inline-flex items-center rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50"
                    >
                      Import Another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && result?.error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">Import Failed</h3>
                  <p className="mt-1 text-sm text-red-700">{result.error}</p>
                  <button
                    onClick={() => {
                      setStatus('idle')
                      setResult(null)
                    }}
                    className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How to find YouTube channels:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                <strong>By Handle:</strong> Use the @ handle visible on their channel (e.g., @mkbhd)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                <strong>By Channel ID:</strong> Visit the channel page, copy the ID from the URL
                (e.g., youtube.com/channel/<strong>UCBJycsmduvYEL83R_U4JriQ</strong>)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>
                <strong>What gets imported:</strong> Subscriber count, video count, average views,
                engagement rate, recent video performance, estimated pricing
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">API Usage Notes:</h3>
          <p className="text-sm text-yellow-800">
            YouTube API has a daily quota of 10,000 units. Each channel import uses approximately
            100-200 units. You can import around 50-100 channels per day. Demographic data is
            estimated based on niche since detailed audience demographics require channel owner
            authorization.
          </p>
        </div>
      </div>
    </div>
  )
}
