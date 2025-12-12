import Link from "next/link";
import { Search, TrendingUp, Target, BarChart3, Users, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Find the Perfect Influencer
            <span className="block text-blue-600">For Your Brand</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Connect with social media influencers who will give you the highest reach and returns.
            Our AI-powered platform matches your brand with influencers based on engagement, audience demographics, and ROI.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/discover"
              className="rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Discover Influencers
            </Link>
            <Link
              href="/recommendations"
              className="rounded-lg border-2 border-blue-600 px-6 py-3 text-base font-semibold text-blue-600 hover:bg-blue-50 transition"
            >
              Get Recommendations
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 p-4">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Search & Filter</h3>
              <p className="text-gray-600">
                Browse thousands of influencers across Instagram, YouTube, TikTok, and Twitter.
                Filter by niche, followers, engagement rate, and budget.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 p-4">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Matching</h3>
              <p className="text-gray-600">
                Our algorithm analyzes audience demographics, engagement quality, and platform performance
                to recommend the best influencers for your campaign.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 p-4">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Maximize ROI</h3>
              <p className="text-gray-600">
                See predicted reach, cost per engagement, and expected impressions.
                Make data-driven decisions for your influencer marketing campaigns.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <BarChart3 className="h-6 w-6 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Engagement Analytics</h3>
              <p className="text-gray-600">
                View detailed engagement rates, average likes, comments, and views for each influencer.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Users className="h-6 w-6 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Audience Demographics</h3>
              <p className="text-gray-600">
                Understand influencer audiences by age, gender, location, and interests.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <CheckCircle className="h-6 w-6 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparent Pricing</h3>
              <p className="text-gray-600">
                See pricing for posts, stories, reels, and videos upfront. No hidden costs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Target className="h-6 w-6 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Platform Support</h3>
              <p className="text-gray-600">
                Find influencers on Instagram, YouTube, TikTok, and Twitter all in one place.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <TrendingUp className="h-6 w-6 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Recommendations</h3>
              <p className="text-gray-600">
                Get AI-powered recommendations based on your brand's specific needs and goals.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Search className="h-6 w-6 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Filtering</h3>
              <p className="text-gray-600">
                Filter by niche, follower count, engagement rate, location, and budget range.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Perfect Influencer?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start exploring our database of influencers today
          </p>
          <Link
            href="/discover"
            className="inline-block rounded-lg bg-white px-8 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-gray-100 transition"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
