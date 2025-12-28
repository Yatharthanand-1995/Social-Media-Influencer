import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { searchInfluencersSchema } from '@/lib/validations/search'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Convert search params to object for validation
    const params = {
      platform: searchParams.get('platform') || undefined,
      niche: searchParams.get('niche') || undefined,
      minFollowers: searchParams.get('minFollowers') || undefined,
      maxFollowers: searchParams.get('maxFollowers') || undefined,
      minEngagement: searchParams.get('minEngagement') || undefined,
      maxEngagement: searchParams.get('maxEngagement') || undefined,
      location: searchParams.get('location') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      cursor: searchParams.get('cursor') || undefined,
      limit: searchParams.get('limit') || '20',
    }

    // Validate search parameters
    const validatedParams = searchInfluencersSchema.parse(params)

    const { platform, niche, minFollowers, maxFollowers, minEngagement, maxEngagement, location, sortBy, sortOrder } = validatedParams

    const where: Prisma.InfluencerWhereInput = {}

    if (platform) {
      // Convert to lowercase to match Prisma enum (instagram, youtube, etc.)
      const platformLower = platform.toLowerCase()
      where.socialAccounts = {
        some: {
          platform: platformLower as any,
        },
      }
    }

    if (niche) {
      where.niche = {
        has: niche,
      }
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      }
    }

    let influencers = await prisma.influencer.findMany({
      where,
      include: {
        socialAccounts: {
          include: {
            audienceDemographics: true,
            pricing: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder as 'asc' | 'desc',
      },
    })

    if (minFollowers || maxFollowers || minEngagement || maxEngagement) {
      influencers = influencers.filter((influencer) => {
        const totalFollowers = influencer.socialAccounts.reduce(
          (sum, account) => sum + account.followersCount,
          0
        )

        const avgEngagement = influencer.socialAccounts.length > 0
          ? influencer.socialAccounts.reduce(
              (sum, account) => sum + account.engagementRate,
              0
            ) / influencer.socialAccounts.length
          : 0

        let matches = true

        if (minFollowers && totalFollowers < minFollowers) {
          matches = false
        }
        if (maxFollowers && totalFollowers > maxFollowers) {
          matches = false
        }
        if (minEngagement && avgEngagement < minEngagement) {
          matches = false
        }
        if (maxEngagement && avgEngagement > maxEngagement) {
          matches = false
        }

        return matches
      })
    }

    if (sortBy === 'followers') {
      influencers.sort((a, b) => {
        const aFollowers = a.socialAccounts.reduce(
          (sum, acc) => sum + acc.followersCount,
          0
        )
        const bFollowers = b.socialAccounts.reduce(
          (sum, acc) => sum + acc.followersCount,
          0
        )
        return sortOrder === 'desc' ? bFollowers - aFollowers : aFollowers - bFollowers
      })
    } else if (sortBy === 'engagement') {
      influencers.sort((a, b) => {
        const aEngagement =
          a.socialAccounts.reduce((sum, acc) => sum + acc.engagementRate, 0) /
          a.socialAccounts.length
        const bEngagement =
          b.socialAccounts.reduce((sum, acc) => sum + acc.engagementRate, 0) /
          b.socialAccounts.length
        return sortOrder === 'desc' ? bEngagement - aEngagement : aEngagement - bEngagement
      })
    }

    return NextResponse.json({
      influencers,
      count: influencers.length,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    console.error('Error searching influencers:', error)
    return NextResponse.json(
      { error: 'Failed to search influencers' },
      { status: 500 }
    )
  }
}
