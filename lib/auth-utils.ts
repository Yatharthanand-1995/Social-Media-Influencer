import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { UserRole } from "@prisma/client"
import { NextResponse } from "next/server"

/**
 * Get the current user session (server-side only)
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user ?? null
}

/**
 * Require authentication for an API route
 * Throws 401 if not authenticated
 * Returns the user session
 */
export async function requireAuth(allowedRoles?: UserRole[]) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    )
  }

  return session.user
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === role
}

/**
 * Check if user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(UserRole.ADMIN)
}

/**
 * Check if user is a brand
 */
export async function isBrand(): Promise<boolean> {
  return hasRole(UserRole.BRAND)
}

/**
 * Check if user is an influencer
 */
export async function isInfluencer(): Promise<boolean> {
  return hasRole(UserRole.INFLUENCER)
}
