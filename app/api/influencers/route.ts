import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const influencers = await prisma.influencer.findMany({
      include: {
        socialAccounts: {
          include: {
            audienceDemographics: true,
            pricing: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(influencers)
  } catch (error) {
    console.error('Error fetching influencers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch influencers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const influencer = await prisma.influencer.create({
      data: {
        name: body.name,
        bio: body.bio,
        primaryPlatform: body.primaryPlatform,
        niche: body.niche,
        location: body.location,
        profileImageUrl: body.profileImageUrl,
        socialAccounts: {
          create: body.socialAccounts?.map((account: any) => ({
            platform: account.platform,
            handle: account.handle,
            followersCount: account.followersCount,
            avgViews: account.avgViews,
            avgLikes: account.avgLikes,
            avgComments: account.avgComments,
            engagementRate: account.engagementRate,
            audienceDemographics: account.audienceDemographics ? {
              create: {
                ageGroup: account.audienceDemographics.ageGroup,
                genderSplit: account.audienceDemographics.genderSplit,
                topCountries: account.audienceDemographics.topCountries,
                interests: account.audienceDemographics.interests,
              },
            } : undefined,
            pricing: account.pricing ? {
              create: account.pricing.map((price: any) => ({
                contentType: price.contentType,
                priceMin: price.priceMin,
                priceMax: price.priceMax,
                currency: price.currency || 'USD',
              })),
            } : undefined,
          })),
        },
      },
      include: {
        socialAccounts: {
          include: {
            audienceDemographics: true,
            pricing: true,
          },
        },
      },
    })

    return NextResponse.json(influencer, { status: 201 })
  } catch (error) {
    console.error('Error creating influencer:', error)
    return NextResponse.json(
      { error: 'Failed to create influencer' },
      { status: 500 }
    )
  }
}
