// YouTube Data API v3 Integration

interface YouTubeChannelStats {
  channelId: string
  channelTitle: string
  channelHandle?: string
  customUrl?: string
  description: string
  thumbnailUrl: string
  subscriberCount: number
  videoCount: number
  viewCount: number
  country?: string
  keywords?: string[]
}

interface YouTubeVideoStats {
  videoId: string
  title: string
  viewCount: number
  likeCount: number
  commentCount: number
  publishedAt: string
}

export async function getChannelDataByHandle(handle: string): Promise<YouTubeChannelStats | null> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY not found in environment variables')
  }

  // Remove @ if present
  const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle

  try {
    // First, search for the channel by handle
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent('@' + cleanHandle)}&key=${apiKey}&maxResults=1`

    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (!searchData.items || searchData.items.length === 0) {
      return null
    }

    const channelId = searchData.items[0].id.channelId

    // Now get detailed channel stats
    return getChannelDataById(channelId)
  } catch (error) {
    console.error('Error fetching YouTube channel by handle:', error)
    return null
  }
}

export async function getChannelDataById(channelId: string): Promise<YouTubeChannelStats | null> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY not found in environment variables')
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const channel = data.items[0]
    const snippet = channel.snippet
    const statistics = channel.statistics
    const branding = channel.brandingSettings?.channel

    return {
      channelId: channel.id,
      channelTitle: snippet.title,
      channelHandle: branding?.customUrl || undefined,
      customUrl: branding?.customUrl || undefined,
      description: snippet.description,
      thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
      subscriberCount: parseInt(statistics.subscriberCount || '0'),
      videoCount: parseInt(statistics.videoCount || '0'),
      viewCount: parseInt(statistics.viewCount || '0'),
      country: snippet.country,
      keywords: branding?.keywords?.split(' ') || [],
    }
  } catch (error) {
    console.error('Error fetching YouTube channel data:', error)
    return null
  }
}

export async function getRecentVideos(channelId: string, maxResults: number = 10): Promise<YouTubeVideoStats[]> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY not found in environment variables')
  }

  try {
    // Get recent uploads
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=${maxResults}&key=${apiKey}`

    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (!searchData.items) {
      return []
    }

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',')

    // Get detailed video statistics
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${apiKey}`

    const statsResponse = await fetch(statsUrl)
    const statsData = await statsResponse.json()

    if (!statsData.items) {
      return []
    }

    return statsData.items.map((video: any) => ({
      videoId: video.id,
      title: video.snippet.title,
      viewCount: parseInt(video.statistics.viewCount || '0'),
      likeCount: parseInt(video.statistics.likeCount || '0'),
      commentCount: parseInt(video.statistics.commentCount || '0'),
      publishedAt: video.snippet.publishedAt,
    }))
  } catch (error) {
    console.error('Error fetching recent videos:', error)
    return []
  }
}

export function calculateEngagementRate(videos: YouTubeVideoStats[], subscriberCount: number): number {
  if (videos.length === 0 || subscriberCount === 0) {
    return 0
  }

  // Calculate average engagement per video
  const totalEngagement = videos.reduce((sum, video) => {
    return sum + video.likeCount + video.commentCount
  }, 0)

  const avgEngagementPerVideo = totalEngagement / videos.length
  const engagementRate = (avgEngagementPerVideo / subscriberCount) * 100

  return parseFloat(engagementRate.toFixed(2))
}

export function calculateAverageViews(videos: YouTubeVideoStats[]): number {
  if (videos.length === 0) {
    return 0
  }

  const totalViews = videos.reduce((sum, video) => sum + video.viewCount, 0)
  return Math.round(totalViews / videos.length)
}

export function inferNicheFromKeywords(keywords: string[], description: string): string[] {
  const niches = new Set<string>()
  const text = (keywords.join(' ') + ' ' + description).toLowerCase()

  const nicheKeywords: Record<string, string[]> = {
    tech: ['tech', 'technology', 'coding', 'programming', 'software', 'hardware', 'gadget', 'review'],
    gaming: ['gaming', 'game', 'gameplay', 'gamer', 'esports', 'playthrough', 'walkthrough'],
    fitness: ['fitness', 'workout', 'gym', 'health', 'exercise', 'training', 'bodybuilding'],
    beauty: ['beauty', 'makeup', 'skincare', 'cosmetic', 'hair', 'fashion'],
    fashion: ['fashion', 'style', 'outfit', 'clothing', 'trend', 'ootd'],
    food: ['food', 'cooking', 'recipe', 'chef', 'kitchen', 'baking', 'cuisine'],
    travel: ['travel', 'trip', 'destination', 'adventure', 'explore', 'tourism', 'vlog'],
    lifestyle: ['lifestyle', 'vlog', 'daily', 'life', 'routine', 'day in the life'],
  }

  for (const [niche, keywords] of Object.entries(nicheKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      niches.add(niche)
    }
  }

  return niches.size > 0 ? Array.from(niches) : ['lifestyle']
}

export async function getCompleteChannelData(channelIdOrHandle: string) {
  // Determine if it's a channel ID or handle
  const isHandle = channelIdOrHandle.startsWith('@') || !channelIdOrHandle.startsWith('UC')

  // Get channel data
  const channelData = isHandle
    ? await getChannelDataByHandle(channelIdOrHandle)
    : await getChannelDataById(channelIdOrHandle)

  if (!channelData) {
    return null
  }

  // Get recent videos for engagement calculation
  const recentVideos = await getRecentVideos(channelData.channelId, 10)

  // Calculate metrics
  const engagementRate = calculateEngagementRate(recentVideos, channelData.subscriberCount)
  const avgViews = calculateAverageViews(recentVideos)
  const avgLikes = recentVideos.length > 0
    ? Math.round(recentVideos.reduce((sum, v) => sum + v.likeCount, 0) / recentVideos.length)
    : 0
  const avgComments = recentVideos.length > 0
    ? Math.round(recentVideos.reduce((sum, v) => sum + v.commentCount, 0) / recentVideos.length)
    : 0

  // Infer niche
  const niche = inferNicheFromKeywords(channelData.keywords || [], channelData.description)

  return {
    channelData,
    metrics: {
      engagementRate,
      avgViews,
      avgLikes,
      avgComments,
    },
    niche,
    recentVideos,
  }
}
