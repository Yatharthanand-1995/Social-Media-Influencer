import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@influencermatch.com' },
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists!')
      console.log('📧 Email: admin@influencermatch.com')
      console.log('🔑 Password: admin123')
      console.log('👤 Role: ADMIN')
      return
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

    console.log('✅ Admin user created successfully!')
    console.log('\n📧 Email: admin@influencermatch.com')
    console.log('🔑 Password: admin123')
    console.log('👤 Role: ADMIN')
    console.log('\n✨ You can now login at http://localhost:3000/auth/login')

    // Also create an agency admin user
    const agencyAdmin = await prisma.user.findUnique({
      where: { email: 'agency@influencermatch.com' },
    })

    if (!agencyAdmin) {
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

      console.log('\n✅ Agency user created successfully!')
      console.log('\n📧 Email: agency@influencermatch.com')
      console.log('🔑 Password: admin123')
      console.log('👤 Role: BRAND (Agency)')
      console.log('🏢 Agency: Demo Marketing Agency')
    }
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
