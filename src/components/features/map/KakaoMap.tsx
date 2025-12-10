'use client'

import { MapPin } from 'lucide-react'

export function KakaoMap() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-500">지도를 준비 중입니다</p>
        <p className="text-xs text-gray-400 mt-1">곧 카카오맵이 표시됩니다</p>
      </div>
    </div>
  )
}
