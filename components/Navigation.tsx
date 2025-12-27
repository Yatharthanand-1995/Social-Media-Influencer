'use client'

import Link from 'next/link'
import { Search, TrendingUp, Users, LogOut, User, Settings } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Navigation() {
  const { data: session, status } = useSession({
    required: false,
    onUnauthenticated() {
      // Silent - user is not authenticated, that's fine
    },
  })
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="border-b bg-white" role="navigation" aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
              aria-label="InfluencerMatch home"
            >
              <TrendingUp className="h-8 w-8 text-blue-600" aria-hidden="true" />
              <span className="text-xl font-bold text-gray-900">InfluencerMatch</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8" role="menubar">
            <Link
              href="/discover"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1"
              role="menuitem"
              aria-label="Discover influencers"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Discover</span>
            </Link>
            <Link
              href="/recommendations"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1"
              role="menuitem"
              aria-label="Get AI-powered recommendations"
            >
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              <span>Get Recommendations</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1"
              role="menuitem"
              aria-label="Admin panel"
            >
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>Admin</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setUserMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  aria-label="User menu"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span>{session.user.name || session.user.email}</span>
                </button>

                {userMenuOpen && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    ></div>

                    {/* Dropdown menu */}
                    <div
                      className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-20"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          <div className="font-medium">{session.user.name}</div>
                          <div className="text-xs text-gray-500">{session.user.email}</div>
                          <div className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            {session.user.role}
                          </div>
                        </div>

                        {session.user.role === 'BRAND' && (
                          <Link
                            href="/brand/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                            role="menuitem"
                          >
                            <div className="flex items-center">
                              <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                              Dashboard
                            </div>
                          </Link>
                        )}

                        {session.user.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                            role="menuitem"
                          >
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                              Admin Panel
                            </div>
                          </Link>
                        )}

                        <button
                          onClick={handleSignOut}
                          className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                          role="menuitem"
                          aria-label="Sign out of your account"
                        >
                          <div className="flex items-center">
                            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                            Sign out
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Sign in to your account"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Create a new account"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
