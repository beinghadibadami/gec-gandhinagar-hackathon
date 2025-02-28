import type { NextApiRequest, NextApiResponse } from "next"

// This is a mock database. In a real application, you'd use a real database and a proper distance calculation.
const shopsDB = [
  { id: 1, name: "City Pharmacy", address: "123 Main St", lat: 40.7128, lng: -74.006 },
  { id: 2, name: "Health Hub", address: "456 Oak Ave", lat: 40.7282, lng: -73.9942 },
  { id: 3, name: "MediCare", address: "789 Pine Rd", lat: 40.7589, lng: -73.9851 },
  { id: 4, name: "QuickMeds", address: "321 Elm St", lat: 40.7549, lng: -73.984 },
  { id: 5, name: "Wellness Drugs", address: "654 Maple Ln", lat: 40.7489, lng: -73.968 },
]

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { medicine, lat, lng } = req.query

  if (typeof medicine !== "string" || typeof lat !== "string" || typeof lng !== "string") {
    return res.status(400).json({ error: "Invalid query parameters" })
  }

  const userLat = Number.parseFloat(lat)
  const userLng = Number.parseFloat(lng)

  const shopsWithDistance = shopsDB.map((shop) => ({
    ...shop,
    distance: calculateDistance(userLat, userLng, shop.lat, shop.lng),
  }))

  const nearestShops = shopsWithDistance.sort((a, b) => a.distance - b.distance).slice(0, 3)

  res.status(200).json(nearestShops)
}

