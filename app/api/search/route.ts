import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const platform = searchParams.get('platform')
    const niche = searchParams.get('niche')
    const minFollowers = searchParams.get('minFollowers')
    const maxFollowers = searchParams.get('maxFollowers')
    const minEngagement = searchParams.get('minEngagement')
    const maxEngagement = searchParams.get('maxEngagement')
    const location = searchParams.get('location')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: Prisma.InfluencerWhereInput = {}

    if (platform) {
      where.socialAccounts = {
        some: {
          platform: platform as any,
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

        const avgEngagement =
          influencer.socialAccounts.reduce(
            (sum, account) => sum + account.engagementRate,
            0
          ) / influencer.socialAccounts.length

        let matches = true

        if (minFollowers && totalFollowers < parseInt(minFollowers)) {
          matches = false
        }
        if (maxFollowers && totalFollowers > parseInt(maxFollowers)) {
          matches = false
        }
        if (minEngagement && avgEngagement < parseFloat(minEngagement)) {
          matches = false
        }
        if (maxEngagement && avgEngagement > parseFloat(maxEngagement)) {
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
    console.error('Error searching influencers:', error)
    return NextResponse.json(
      { error: 'Failed to search influencers' },
      { status: 500 }
    )
  }
}
