import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createInfluencerSchema } from '@/lib/validations/influencer'
import { ZodError } from 'zod'
import type { SocialAccountInput, PricingInput } from '@/types/influencer'

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

    // Validate request body
    const validatedData = createInfluencerSchema.parse(body)

    const influencer = await prisma.influencer.create({
      data: {
        name: validatedData.name,
        bio: validatedData.bio,
        primaryPlatform: validatedData.primaryPlatform,
        niche: validatedData.niche,
        location: validatedData.location,
        profileImageUrl: validatedData.profileImageUrl,
        socialAccounts: {
          create: body.socialAccounts?.map((account: SocialAccountInput) => ({
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
              create: account.pricing.map((price: PricingInput) => ({
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
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    console.error('Error creating influencer:', error)
    return NextResponse.json(
      { error: 'Failed to create influencer' },
      { status: 500 }
    )
  }
}
