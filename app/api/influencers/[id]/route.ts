import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateInfluencerSchema } from '@/lib/validations/influencer'
import { ZodError } from 'zod'
import { handlePrismaError, formatErrorResponse, NotFoundError, ValidationError } from '@/lib/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || typeof id !== 'string') {
      const error = new ValidationError('Invalid influencer ID')
      return NextResponse.json(formatErrorResponse(error), { status: error.statusCode })
    }

    const influencer = await prisma.influencer.findUnique({
      where: { id },
      include: {
        socialAccounts: {
          include: {
            audienceDemographics: true,
            pricing: true,
          },
        },
      },
    })

    if (!influencer) {
      const error = new NotFoundError('Influencer not found')
      return NextResponse.json(formatErrorResponse(error), { status: error.statusCode })
    }

    return NextResponse.json(influencer)
  } catch (error) {
    console.error('Error fetching influencer:', error)
    const appError = handlePrismaError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || typeof id !== 'string') {
      const error = new ValidationError('Invalid influencer ID')
      return NextResponse.json(formatErrorResponse(error), { status: error.statusCode })
    }

    const body = await request.json()

    // Validate request body
    const validatedData = updateInfluencerSchema.parse(body)

    const influencer = await prisma.influencer.update({
      where: { id },
      data: validatedData,
      include: {
        socialAccounts: {
          include: {
            audienceDemographics: true,
            pricing: true,
          },
        },
      },
    })

    return NextResponse.json(influencer)
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = new ValidationError('Validation error', error.issues)
      return NextResponse.json(formatErrorResponse(validationError), { status: validationError.statusCode })
    }

    console.error('Error updating influencer:', error)
    const appError = handlePrismaError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || typeof id !== 'string') {
      const error = new ValidationError('Invalid influencer ID')
      return NextResponse.json(formatErrorResponse(error), { status: error.statusCode })
    }

    await prisma.influencer.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Influencer deleted successfully' })
  } catch (error) {
    console.error('Error deleting influencer:', error)
    const appError = handlePrismaError(error)
    return NextResponse.json(formatErrorResponse(appError), { status: appError.statusCode })
  }
}
