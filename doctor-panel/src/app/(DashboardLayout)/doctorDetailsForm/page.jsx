'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Upload,
  User,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  GraduationCap,
  Briefcase,
  Languages,
  Shield,
} from 'lucide-react';

const UpdateDoctorProfile = ({ doctorId }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    DOB: '',
    email: '',
    mobileNo: '',
    countryCallingCode: '',
    aboutDoctor: '',
    profileImageUrl: '',
    languages: [],
    specialization: [],
    degrees: [],
    experience: '',
    hospitalAffiliations: [],
    location: '',
    consultationFee: '',
    availableTimeSlots: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const response = await axios.get(`/doctor/profile`);
        setFormData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch doctor profile');
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [doctorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, field) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, [field]: value.split(',') }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('profileImage', file);

    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      const response = await axios.post('/api/v1/doctor/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        router.push('/doctor/profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-400 border-blue-700/30 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-300 font-medium">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="bg-gray-800 border border-red-500/20 text-gray-100 p-8 rounded-xl shadow-lg max-w-md">
          <h2 className="text-xl font-bold mb-3 text-red-400">Error</h2>
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
    <div className="bg-gray-900 text-gray-100 min-h-screen p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Update Your Profile</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <User className="mr-2" size={20} /> Personal Details
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
                <input
                  type="text"
                  name="middleName"
                  placeholder="Middle Name"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="date"
                  name="DOB"
                  value={formData.DOB}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Mail className="mr-2" size={20} /> Contact Details
              </h2>
              <div className="space-y-3">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
                <input
                  type="tel"
                  name="mobileNo"
                  placeholder="Mobile Number"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
                <input
                  type="text"
                  name="countryCallingCode"
                  placeholder="Country Calling Code"
                  value={formData.countryCallingCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>

            {/* Professional Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <GraduationCap className="mr-2" size={20} /> Professional Details
              </h2>
              <div className="space-y-3">
                <textarea
                  name="aboutDoctor"
                  placeholder="About Doctor"
                  value={formData.aboutDoctor}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
                <input
                  type="text"
                  name="languages"
                  placeholder="Languages (comma separated)"
                  value={formData.languages.join(',')}
                  onChange={(e) => handleArrayChange(e, 'languages')}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
                <input
                  type="text"
                  name="specialization"
                  placeholder="Specialization (comma separated)"
                  value={formData.specialization.join(',')}
                  onChange={(e) => handleArrayChange(e, 'specialization')}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
                <input
                  type="number"
                  name="experience"
                  placeholder="Years of Experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>

            {/* Hospital Affiliations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Briefcase className="mr-2" size={20} /> Hospital Affiliations
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  name="hospitalAffiliations"
                  placeholder="Hospital Affiliations (comma separated)"
                  value={formData.hospitalAffiliations.join(',')}
                  onChange={(e) => handleArrayChange(e, 'hospitalAffiliations')}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>

            {/* Location and Consultation Fee */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <MapPin className="mr-2" size={20} /> Location & Fees
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
                <input
                  type="number"
                  name="consultationFee"
                  placeholder="Consultation Fee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>

            {/* Profile Image */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Upload className="mr-2" size={20} /> Profile Image
              </h2>
              <div className="space-y-3">
                <input
                  type="file"
                  name="profileImage"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 shadow-md shadow-blue-800/20"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateDoctorProfile;
