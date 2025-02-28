'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Heart,
  Clock3,
  MessageCircle,
} from 'lucide-react';

const defaultDoctors = [
  {
    id: 1,
    name: 'Dr. Aditi Sharma',
    specialization: 'Cardiologist',
    experience: 10,
    rating: 4.8,
    patients: 2500,
    location: 'Central Hospital, Delhi',
    availability: 'Mon, Wed, Fri',
    image: 'https://via.placeholder.com/100',
    nextAvailable: 'Tomorrow, 10:00 AM',
    verified: true,
    consultationFee: '₹1,500',
  },
  {
    id: 2,
    name: 'Dr. Ravi Verma',
    specialization: 'Neurologist',
    experience: 8,
    rating: 4.6,
    patients: 1800,
    location: 'Metro Medical Center, Mumbai',
    availability: 'Tue, Thu, Sat',
    image: 'https://via.placeholder.com/100',
    nextAvailable: 'Today, 3:30 PM',
    verified: true,
    consultationFee: '₹1,800',
  },
  {
    id: 3,
    name: 'Dr. Sneha Kapoor',
    specialization: 'Dermatologist',
    experience: 5,
    rating: 4.7,
    patients: 1200,
    location: 'Skin & Care Clinic, Bangalore',
    availability: 'Mon, Tue, Thu',
    image: 'https://via.placeholder.com/100',
    nextAvailable: 'Friday, 11:15 AM',
    verified: true,
    consultationFee: '₹1,200',
  },
];

const DoctorListing = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const router = useRouter();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Simulating API call delay
        setTimeout(() => {
          // const response = await axios.get('/api/v1/doctor/getDoctors');
          setDoctors(defaultDoctors);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch doctors');
        setDoctors(defaultDoctors); // Use default data on error
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleDoctorClick = (doctorId) => {
    router.push(`/sessionBooking/${doctorId}`);
  };

  const specialties = ['All', 'Cardiologist', 'Neurologist', 'Dermatologist'];

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === 'All' || doctor.specialization === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  if (loading) {
    return (
      <div className="bg-gray-900 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-400 border-blue-700/30 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-300 font-medium">Finding the best doctors for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="bg-gray-800 border border-red-500/20 text-gray-100 p-8 rounded-xl shadow-lg max-w-md">
          <h2 className="text-xl font-bold mb-3 text-red-400">Unable to load doctors</h2>
          <p className="mb-6 text-gray-300">{error}</p>
          <button
            className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-red-500 hover:to-red-400 transition-all duration-300 shadow-md"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header with brand */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Heart className="text-blue-400" size={28} fill="#60a5fa" />
              <span className="text-2xl font-bold text-white">MediConnect</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-300 hover:text-white transition-colors">
                <MessageCircle size={20} />
              </button>
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                JP
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Find Your Specialist</h1>
          <p className="text-gray-400">
            Connect with top healthcare professionals for personalized care
          </p>
        </header>

        {/* Search and Filter Section */}
        <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by doctor name or specialty..."
                className="w-full pl-12 pr-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-shrink-0">
              <div className="flex items-center bg-gray-700/70 border border-gray-600 rounded-xl overflow-hidden">
                <div className="bg-gray-700 p-3 border-r border-gray-600">
                  <Filter size={20} className="text-blue-400" />
                </div>
                <select
                  className="bg-gray-700/70 text-gray-100 px-4 py-3 focus:outline-none appearance-none pr-8 min-w-32"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1rem',
                  }}
                >
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center">
          <div className="h-1 w-10 bg-blue-500 rounded mr-3"></div>
          <p className="text-gray-300 font-medium">
            {filteredDoctors.length} {filteredDoctors.length === 1 ? 'specialist' : 'specialists'}{' '}
            available
          </p>
        </div>

        {/* Doctor Cards */}
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-900/20 hover:shadow-xl transition-all duration-300 border border-gray-700/80"
              >
                <div className="p-6">
                  <div className="flex items-start mb-5">
                    <div className="relative mr-4">
                      <img
                        src={doctor.image || '/api/placeholder/100/100'}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-gray-700 shadow-md"
                      />
                      {doctor.verified && (
                        <div
                          className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1"
                          title="Verified Doctor"
                        >
                          <Shield size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">{doctor.name}</h2>
                      </div>
                      <div className="flex items-center mt-1 mb-1">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium">
                          {doctor.specialization}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 mt-2">
                        <div className="flex items-center">
                          <Star size={14} className="text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-300">{doctor.rating}</span>
                        </div>
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-gray-300">{doctor.experience} yrs exp.</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-gray-300">{doctor.patients}+ patients</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5 border-t border-gray-700/60 pt-4">
                    <div className="flex items-center text-gray-300">
                      <MapPin size={16} className="mr-2 flex-shrink-0 text-gray-400" />
                      <span className="text-sm truncate">{doctor.location}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Calendar size={16} className="mr-2 flex-shrink-0 text-gray-400" />
                      <span className="text-sm">{doctor.availability}</span>
                    </div>
                    <div className="flex items-center text-emerald-400">
                      <Clock size={16} className="mr-2 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        Next available: {doctor.nextAvailable}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-700/60 pt-4 mt-4">
                    <div className="text-gray-300">
                      <span className="text-blue-400 font-bold">{doctor.consultationFee}</span>
                      <span className="text-xs ml-1">per session</span>
                    </div>
                    <button
                      onClick={() => handleDoctorClick(doctor.id)}
                      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-2 px-5 rounded-lg transition-all duration-300 shadow-md shadow-blue-800/20"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 p-10 rounded-xl shadow-lg text-center border border-gray-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No specialists found</h3>
            <p className="text-gray-400 mb-6">
              We couldn't find any doctors matching your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('All');
              }}
              className="text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors duration-300 font-medium px-6 py-3 rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorListing;
