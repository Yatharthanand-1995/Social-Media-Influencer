'use client'

import { useState } from 'react'

interface InfluencerAvatarProps {
  profileImageUrl?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export default function InfluencerAvatar({ profileImageUrl, name, size = 'lg' }: InfluencerAvatarProps) {
  const [imgSrc, setImgSrc] = useState(
    profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=3b82f6&color=ffffff&bold=true`
  )

  const handleError = () => {
    setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=3b82f6&color=ffffff&bold=true`)
  }

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  }

  return (
    <div className={`${sizeClasses[size]} flex-shrink-0 overflow-hidden rounded-full bg-gray-200`}>
      <img
        src={imgSrc}
        alt={name}
        className="h-full w-full object-cover"
        onError={handleError}
      />
    </div>
  )
}
