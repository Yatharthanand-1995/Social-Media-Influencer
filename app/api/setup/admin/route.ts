import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@influencermatch.com' },
    })

    if (existingAdmin) {
      return NextResponse.json(
        {
          message: 'Admin user already exists',
          credentials: {
            email: 'admin@influencermatch.com',
            password: 'admin123',
            role: 'ADMIN',
          },
        },
        { status: 200 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@influencermatch.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    // Also create an agency admin user
    const existingAgencyAdmin = await prisma.user.findUnique({
      where: { email: 'agency@influencermatch.com' },
    })

    if (!existingAgencyAdmin) {
      // First create an agency
      const agency = await prisma.agency.create({
        data: {
          name: 'Demo Marketing Agency',
          contactEmail: 'agency@influencermatch.com',
          subscriptionTier: 'free',
        },
      })

      // Create agency user
      await prisma.user.create({
        data: {
          email: 'agency@influencermatch.com',
          name: 'Agency Admin',
          password: hashedPassword,
          role: 'BRAND',
          agencyId: agency.id,
        },
      })
    }

    return NextResponse.json(
      {
        message: 'Admin users created successfully!',
        credentials: [
          {
            email: 'admin@influencermatch.com',
            password: 'admin123',
            role: 'ADMIN',
            note: 'Super admin account',
          },
          {
            email: 'agency@influencermatch.com',
            password: 'admin123',
            role: 'BRAND',
            agency: 'Demo Marketing Agency',
            note: 'Agency account with full features',
          },
        ],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating admin users:', error)
    return NextResponse.json(
      {
        error: 'Failed to create admin users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
