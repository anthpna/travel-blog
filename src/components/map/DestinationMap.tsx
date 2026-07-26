'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icon bị vỡ khi bundle bằng webpack/Next.js
// Phải chạy ở module-level; an toàn vì component này luôn dynamic-import ssr:false
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl:       '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl:     '/leaflet/marker-shadow.png',
})

export interface DestinationPin {
  id: string
  nameVi: string
  nameEn?: string | null
  slug: string
  lat: number
  lng: number
  coverImage?: string | null
  _count: { posts: number }
}

// Auto-fit viewport để hiển thị tất cả markers — chỉ dùng khi có nhiều điểm
function FitBounds({ destinations }: { destinations: DestinationPin[] }) {
  const map = useMap()
  useEffect(() => {
    if (destinations.length < 2) return
    const bounds = destinations.map((d) => [d.lat, d.lng] as [number, number])
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 })
  }, [map, destinations])
  return null
}

interface Props {
  destinations: DestinationPin[]
  interactive?: boolean
  height?: string
  zoom?: number
}

export default function DestinationMap({
  destinations,
  interactive = true,
  height = '480px',
  zoom = 5,
}: Props) {
  const center: [number, number] =
    destinations.length === 1
      ? [destinations[0].lat, destinations[0].lng]
      : [16.05, 107.83] // Trung tâm Việt Nam

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%' }}
      dragging={interactive}
      zoomControl={interactive}
      scrollWheelZoom={false}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      keyboard={interactive}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {destinations.length > 1 && <FitBounds destinations={destinations} />}

      {destinations.map((dest) => (
        <Marker key={dest.id} position={[dest.lat, dest.lng]}>
          <Popup minWidth={180} maxWidth={220}>
            <div style={{ width: 190 }}>
              {dest.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={dest.coverImage}
                  alt={dest.nameVi}
                  style={{
                    width: '100%',
                    height: 90,
                    objectFit: 'cover',
                    borderRadius: 6,
                    marginBottom: 8,
                    display: 'block',
                  }}
                />
              )}
              <strong style={{ fontSize: 13, display: 'block', marginBottom: 3 }}>
                {dest.nameVi}
              </strong>
              <span style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                {dest._count.posts} bài viết
              </span>
              {interactive && (
                <a
                  href={`/destinations/${dest.slug}`}
                  style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
                >
                  Xem bài viết →
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
