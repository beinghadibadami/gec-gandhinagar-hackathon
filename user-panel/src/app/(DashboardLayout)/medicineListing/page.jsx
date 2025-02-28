"use client"

import { useState, useEffect } from "react"
import { Search, MapPin } from "lucide-react"
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"

const mapContainerStyle = {
  width: "100%",
  height: "400px",
}

const MedicineFinder = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [filteredMedicines, setFilteredMedicines] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [nearestShops, setNearestShops] = useState([])
  const [center, setCenter] = useState({ lat: 0, lng: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          setError("Unable to retrieve your location")
        },
      )
    } else {
      setError("Geolocation is not supported by your browser")
    }
  }, [])

  useEffect(() => {
    const fetchMedicines = async () => {
      if (searchTerm.length < 2) {
        setFilteredMedicines([])
        setShowDropdown(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/medicines?search=${searchTerm}`)
        if (!response.ok) throw new Error("Failed to fetch medicines")
        const data = await response.json()
        setFilteredMedicines(data)
        setShowDropdown(true)
      } catch (err) {
        setError("Error fetching medicines: " + err.message)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(() => {
      fetchMedicines()
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchTerm])

  const handleSearch = async (medicine) => {
    setSelectedMedicine(medicine)
    setSearchTerm(medicine.name)
    setShowDropdown(false)

    try {
      const response = await fetch(`/api/nearest-shops?medicine=${medicine.id}&lat=${center.lat}&lng=${center.lng}`)
      if (!response.ok) throw new Error("Failed to fetch nearest shops")
      const data = await response.json()
      setNearestShops(data)
    } catch (err) {
      setError("Error fetching nearest shops: " + err.message)
    }
  }

  return (
    <div className="min-h-screen text-gray-100 bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 text-center sm:text-left text-blue-400">Medicine Finder</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Search and Medicine Info */}
          <div className="lg:w-1/3">
            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 sticky top-4">
              <div className="p-6">
                {/* Search Bar */}
                <div className="relative mb-6">
                  <input
                    type="text"
                    placeholder="Search for a medicine..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
                  />
                  <Search className="absolute right-3 top-2.5 text-gray-400" />
                </div>

                {/* Dropdown for search results */}
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                    {filteredMedicines.map((medicine) => (
                      <div
                        key={medicine.id}
                        className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleSearch(medicine)}
                      >
                        <div className="font-medium">{medicine.name}</div>
                        <div className="text-sm text-gray-400">{medicine.description}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Medicine Info */}
                {selectedMedicine && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-300 mb-2">{selectedMedicine.name}</h3>
                      <p className="text-sm text-gray-400">{selectedMedicine.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nearest Shops and Map */}
          <div className="lg:w-2/3">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
              <h2 className="text-xl font-bold flex items-center mb-6">
                <MapPin size={20} className="mr-2 text-blue-400" />
                Nearest Shops
              </h2>

              {nearestShops.length > 0 ? (
                <div className="grid gap-4 mb-6">
                  {nearestShops.map((shop) => (
                    <div
                      key={shop.id}
                      className="p-4 rounded-lg bg-gray-800/40 border border-gray-700 hover:border-blue-600 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{shop.name}</h3>
                          <span className="text-xs px-2 py-1 rounded-full inline-block mt-1 bg-blue-900/20 text-blue-400">
                            {shop.distance.toFixed(1)} km away
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2 text-gray-500" />
                          <span>{shop.address}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 bg-gray-800/20 rounded-lg border border-gray-800 mb-6">
                  <MapPin size={40} className="mx-auto mb-2 opacity-30" />
                  <p>Search for a medicine to find nearest shops</p>
                </div>
              )}

              {/* Google Map */}
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={13}>
                  {nearestShops.map((shop) => (
                    <Marker key={shop.id} position={{ lat: shop.lat, lng: shop.lng }} title={shop.name} />
                  ))}
                </GoogleMap>
              </LoadScript>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicineFinder;

