import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname
    const token = req.nextauth.token

    // Admin routes - require ADMIN role
    if (path.startsWith("/admin")) {
      if (token?.role !== UserRole.ADMIN) {
        return NextResponse.redirect(
          new URL("/auth/error?error=AccessDenied", req.url)
        )
      }
    }

    // Brand routes - require BRAND role
    if (path.startsWith("/brand")) {
      if (token?.role !== UserRole.BRAND) {
        return NextResponse.redirect(
          new URL("/auth/error?error=AccessDenied", req.url)
        )
      }
    }

    // API routes protection - POST, PUT, DELETE require ADMIN
    if (path.startsWith("/api/influencers") && req.method !== "GET") {
      if (token?.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        )
      }
    }

    if (path.startsWith("/api/youtube/import")) {
      if (token?.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        )
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Public routes that don't require authentication
        const publicRoutes = [
          "/",
          "/discover",
          "/recommendations",
          "/influencer",
          "/auth/login",
          "/auth/register",
          "/auth/error",
        ]

        // Check if the path is public
        const isPublicRoute = publicRoutes.some((route) => path.startsWith(route))

        // Allow all auth API routes
        if (path.startsWith("/api/auth")) {
          return true
        }

        // Allow GET requests to /api/influencers (public read)
        if (path.startsWith("/api/influencers") && req.method === "GET") {
          return true
        }

        // Allow public API routes
        if (
          path.startsWith("/api/search") ||
          path.startsWith("/api/recommend")
        ) {
          return true
        }

        // Allow other public routes
        if (isPublicRoute) {
          return true
        }

        // For protected routes, require authentication
        return !!token
      },
    },
    pages: {
      signIn: "/auth/login",
      error: "/auth/error",
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
