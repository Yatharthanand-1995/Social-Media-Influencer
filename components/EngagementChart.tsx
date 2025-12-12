'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface EngagementChartProps {
  data: Array<{
    platform: string
    engagement: number
  }>
}

export default function EngagementChart({ data }: EngagementChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="platform" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="engagement" fill="#3B82F6" />
      </BarChart>
    </ResponsiveContainer>
  )
}
