'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Award,
  Check,
  Star,
  MapPin,
  ChevronDown,
  Filter,
  X,
} from 'lucide-react';

const defaultDoctor = {
  name: 'John Doe',
  specialty: 'Cardiologist',
  experience: 15,
  contact: 'johndoe@example.com',
  avatar: '/api/placeholder/150/150',
  rating: 4.8,
  reviews: 127,
  location: 'Medical Center, New York',
  languages: ['English', 'Spanish'],
};

const defaultSessions = [
  {
    id: 1,
    title: 'Morning Consultation',
    date: '2025-02-25',
    time: '09:00 AM',
    duration: 30,
    available: true,
    type: 'In-person',
    price: 120,
  },
  {
    id: 2,
    title: 'Afternoon Checkup',
    date: '2025-02-25',
    time: '02:00 PM',
    duration: 45,
    available: false,
    type: 'In-person',
    price: 150,
  },
  {
    id: 3,
    title: 'Evening Therapy Session',
    date: '2025-02-25',
    time: '06:00 PM',
    duration: 60,
    available: true,
    type: 'In-person',
    price: 180,
  },
  {
    id: 4,
    title: 'Follow-up Session',
    date: '2025-02-26',
    time: '10:00 AM',
    duration: 30,
    available: true,
    type: 'Virtual',
    price: 100,
  },
  {
    id: 5,
    title: 'Telehealth Consultation',
    date: '2025-02-26',
    time: '03:30 PM',
    duration: 25,
    available: true,
    type: 'Virtual',
    price: 90,
  },
];

const SessionBooking = () => {
  const [doctor, setDoctor] = useState(defaultDoctor);
  const [sessions, setSessions] = useState(defaultSessions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filteredSessions, setFilteredSessions] = useState(sessions);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2025-02-25');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const { doctorId } = useParams();

  // Mock user ID (in a real app, this would come from auth context)
  const userId = 'user123';

  // Filter sessions when date changes
  useEffect(() => {
    setFilteredSessions(
      sessions.filter((session) => session.date === selectedDate || selectedDate === 'all'),
    );
  }, [selectedDate, sessions]);

  const handleSessionSelect = (session) => {
    if (!session.available) return;
    setSelectedSession(session);
    // Reset any previous booking errors when selecting a new session
    setBookingError(null);
  };

  const confirmBooking = async () => {
    if (!selectedSession) return;

    setBookingInProgress(true);
    setBookingError(null);

    try {
      // Prepare request payload
      const bookingData = {
        doctorId: doctorId || 'doctor123', // Use actual doctorId from params or fallback
        userId: userId,
        sessionId: selectedSession.id,
        date: selectedSession.date,
        time: selectedSession.time,
        duration: selectedSession.duration,
        sessionType: selectedSession.type,
      };

      // Call the API
      const response = await fetch('api/v1/doctor/sessionConfirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.status === 200) {
        // Update local state (mark session as booked)
        setSessions(
          sessions.map((session) =>
            session.id === selectedSession.id ? { ...session, available: false } : session,
          ),
        );

        // Show success modal
        setShowSuccessModal(true);
      } else {
        // Handle non-200 responses
        const data = await response.json();
        setBookingError(data.message || 'Failed to book appointment. Please try again.');
      }
    } catch (err) {
      // Handle network errors or exceptions
      setBookingError('Network error. Please check your connection and try again.');
      console.error('Booking error:', err);
    } finally {
      setBookingInProgress(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getUniqueSessionDates = () => {
    const uniqueDates = [...new Set(sessions.map((session) => session.date))];
    return uniqueDates;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-300">Loading appointment data...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-lg">
          <h3 className="text-xl font-semibold text-red-400 mb-2">Unable to load sessions</h3>
          <p className="text-gray-300">{error}</p>
          <button className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-white transition">
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen text-gray-100">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl p-8 max-w-md mx-4 border border-gray-700 shadow-2xl animate-fadeIn">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center">
                <Check size={32} className="text-green-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Appointment Confirmed!</h3>
            <p className="text-gray-400 text-center mb-6">
              Your appointment with Dr. {doctor.name} has been scheduled for{' '}
              {formatDate(selectedSession.date)} at {selectedSession.time}.
            </p>
            <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Session Type:</span>
                <span className="font-medium">{selectedSession.type}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Duration:</span>
                <span className="font-medium">{selectedSession.duration} minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Confirmation #:</span>
                <span className="font-medium">HLT-{Math.floor(Math.random() * 10000)}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                onClick={() => {
                  setShowSuccessModal(false);
                  setSelectedSession(null);
                }}
              >
                Close
              </button>
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition">
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 text-center sm:text-left text-blue-400">
          Health Connect
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Doctor Profile Card */}
          <div className="lg:w-1/3">
            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 sticky top-4">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <img
                      src={doctor.avatar}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-full bg-gray-800"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Dr. {doctor.name}</h2>
                    <p className="text-blue-400">{doctor.specialty}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex text-yellow-400">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} className="text-yellow-400/30" />
                  </div>
                  <span className="text-sm text-gray-400">
                    {doctor.rating} ({doctor.reviews} reviews)
                  </span>
                </div>

                <div className="space-y-4 border-t border-gray-800 pt-4">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <Award size={18} className="text-gray-500" />
                    <span>{doctor.experience} years of experience</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <MapPin size={18} className="text-gray-500" />
                    <span>{doctor.location}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <Mail size={18} className="text-gray-500" />
                    <span>{doctor.contact}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-300 mb-2">About Doctor</h3>
                    <p className="text-sm text-gray-400">
                      Dr. {doctor.name} is a highly qualified {doctor.specialty.toLowerCase()} with{' '}
                      {doctor.experience} years of clinical experience. Specializing in
                      cardiovascular care and preventive medicine with a patient-centered approach.
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-300 mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="lg:w-2/3">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
              {/* Tabs */}
              <div className="flex border-b border-gray-800 mb-6">
                <button
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'upcoming' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Upcoming Sessions
                  {activeTab === 'upcoming' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></span>
                  )}
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'history' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('history')}
                >
                  Session History
                  {activeTab === 'history' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></span>
                  )}
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <Calendar size={20} className="mr-2 text-blue-400" />
                  Available Sessions
                </h2>

                <div className="relative">
                  <button
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                    onClick={() => setFilterOpen(!filterOpen)}
                  >
                    <Filter size={16} />
                    <span>Filter by Date</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {filterOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10 py-1">
                      <button
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition ${
                          selectedDate === 'all' ? 'text-blue-400' : 'text-gray-300'
                        }`}
                        onClick={() => {
                          setSelectedDate('all');
                          setFilterOpen(false);
                        }}
                      >
                        All Dates
                      </button>
                      {getUniqueSessionDates().map((date) => (
                        <button
                          key={date}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition ${
                            selectedDate === date ? 'text-blue-400' : 'text-gray-300'
                          }`}
                          onClick={() => {
                            setSelectedDate(date);
                            setFilterOpen(false);
                          }}
                        >
                          {formatDate(date).split(',')[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date Pills */}
              <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {getUniqueSessionDates().map((date) => (
                  <button
                    key={date}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm transition ${
                      selectedDate === date
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    {formatDate(date).split(',')[0]}
                  </button>
                ))}
              </div>

              {/* Session Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-lg transition-all duration-200 border ${
                        selectedSession?.id === session.id
                          ? 'bg-blue-900/20 border-blue-700'
                          : session.available
                          ? 'bg-gray-800/40 border-gray-700 hover:border-blue-600'
                          : 'bg-gray-800/10 border-gray-800 opacity-50'
                      } ${session.available ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      onClick={() => handleSessionSelect(session)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{session.title}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                              session.type === 'Virtual'
                                ? 'bg-purple-900/20 text-purple-400'
                                : 'bg-green-900/20 text-green-400'
                            }`}
                          >
                            {session.type}
                          </span>
                        </div>
                        {selectedSession?.id === session.id && (
                          <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full flex items-center">
                            <Check size={12} className="mr-1" /> Selected
                          </span>
                        )}
                        {!session.available && (
                          <span className="bg-gray-700/30 text-gray-500 text-xs px-2 py-1 rounded-full">
                            Booked
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2 text-gray-500" />
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2 text-gray-500" />
                          <span>
                            {session.time} • {session.duration} min
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-800 flex justify-between items-center">
                          <span className="text-white font-medium">${session.price}</span>
                          {session.available && !selectedSession && (
                            <button className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full transition">
                              Select
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-10 text-gray-500 bg-gray-800/20 rounded-lg border border-gray-800">
                    <Calendar size={40} className="mx-auto mb-2 opacity-30" />
                    <p>No available sessions for the selected date</p>
                    <button
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white text-sm transition"
                      onClick={() => setSelectedDate('all')}
                    >
                      View All Dates
                    </button>
                  </div>
                )}
              </div>

              {/* Booking Section */}
              {selectedSession && (
                <div className="mt-6 border-t border-gray-800 pt-6">
                  {bookingError && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
                      <p className="text-red-400">{bookingError}</p>
                    </div>
                  )}

                  <div className="bg-gray-800/40 rounded-lg p-4 mb-6">
                    <h3 className="font-medium mb-4">Appointment Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Session Type:</span>
                        <span>{selectedSession.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Date & Time:</span>
                        <span>
                          {formatDate(selectedSession.date)}, {selectedSession.time}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span>{selectedSession.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Format:</span>
                        <span>{selectedSession.type}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-700 flex justify-between">
                        <span className="text-gray-400">Total:</span>
                        <span className="font-bold">${selectedSession.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <button
                      className="px-4 py-2 text-gray-400 hover:text-gray-300 transition"
                      onClick={() => {
                        setSelectedSession(null);
                        setBookingError(null);
                      }}
                      disabled={bookingInProgress}
                    >
                      <X size={16} className="inline mr-1" />
                      Cancel Selection
                    </button>
                    <button
                      className={`px-6 py-3 text-white rounded-lg transition flex items-center justify-center ${
                        bookingInProgress
                          ? 'bg-blue-700 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-500'
                      }`}
                      onClick={confirmBooking}
                      disabled={bookingInProgress}
                    >
                      {bookingInProgress ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-200 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check size={18} className="mr-2" />
                          Confirm Booking
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionBooking;
