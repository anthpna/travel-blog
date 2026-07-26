# Leaflet / React-Leaflet

## Quy tắc bắt buộc

**Không bao giờ** import trực tiếp bất kỳ component nào từ `react-leaflet` hoặc `leaflet` ở cấp page/layout. Luôn dùng `next/dynamic` với `ssr: false`:

```typescript
const DestinationMap = dynamic(
  () => import('@/components/map/DestinationMap'),
  { ssr: false }
)
```

Lý do: `leaflet` truy cập `window` và `document` lúc import — sẽ crash khi Next.js render server-side.

## Leaflet CSS

Import CSS của Leaflet bên trong file component (không ở globals.css):

```typescript
// Trong DestinationMap.tsx
import 'leaflet/dist/leaflet.css'
```

## Marker icon fix

Leaflet bị lỗi icon khi bundle bởi Webpack. Fix cần thiết trong component:

```typescript
import L from 'leaflet'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})
```

Copy các file này vào `public/leaflet/` từ `node_modules/leaflet/dist/images/`.

## Hai vị trí dùng map

- `/destinations` — full page map, interactive
- `/about` — mini map 250px height, `dragging={false}` `zoomControl={false}` (không interactive)
