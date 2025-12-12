import Link from 'next/link'
import { Search, TrendingUp, Users } from 'lucide-react'

export default function Navigation() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">InfluencerMatch</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/discover"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
            >
              <Search className="h-4 w-4" />
              <span>Discover</span>
            </Link>
            <Link
              href="/recommendations"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Get Recommendations</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
            >
              <Users className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/discover"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              Find Influencers
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
