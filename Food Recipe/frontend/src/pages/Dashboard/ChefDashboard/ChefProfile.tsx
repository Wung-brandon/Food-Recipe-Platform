import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../../../Layout/DashboardLayout';
import axios from 'axios';

// Define verification status badges
const VerificationBadge = ({ status }) => {
  if (status === 'verified' || status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Verified
      </span>
    );
  } else if (status === 'pending' || status === 'PENDING') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Pending Verification
      </span>
    );
  } else if (status === 'rejected' || status === 'REJECTED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Verification Rejected
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Not Submitted
      </span>
    );
  }
};

const ChefProfilePage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const BaseUrl = "http://127.0.0.1:8000/";
  
  // State for profile data
  const [profileData, setProfileData] = useState({
    id: null,
    verification_status: '',
    years_of_experience: '',
    specialization: '',
    certification: '',
    certification_number: '',
    issuing_authority: '',
    identity_proof: null,
    food_safety_certification: null,
    has_accepted_terms: false,
    verification_date: null
  });
  
  // State for general user profile data
  const [userProfile, setUserProfile] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    profile_picture: null,
    phone_number: ''
  });
  
  // State for UI handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // States for file uploads
  const [profilePicture, setProfilePicture] = useState(null);
  const [identityProof, setIdentityProof] = useState(null);
  const [foodSafetyCert, setFoodSafetyCert] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  
  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      
      try {
        // Make sure we have a valid profileId
        let profileId = id;
        
        // If id is not provided in URL or is undefined, use the logged in user's ID
        if (!profileId && user && user.id) {
          profileId = user.id;
        }
        
        if (!profileId) {
          throw new Error("User ID is not available");
        }
        
        // Fetch chef profile
        const response = await axios.get(`${BaseUrl}api/auth/chef/profile/${profileId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setProfileData(response.data);
        
        // Also fetch basic user profile info
        const userResponse = await axios.get(`${BaseUrl}api/auth/user/profile/${profileId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setUserProfile(userResponse.data);
        
        // Set profile picture preview if exists
        if (userResponse.data.profile_picture) {
          setProfilePicturePreview(`${BaseUrl}${userResponse.data.profile_picture}`);
        }
        
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [id, user]);
  
  // Handle form input changes
  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setProfileData({
      ...profileData,
      [name]: newValue
    });
  };
  
  // Handle user profile input changes
  const handleUserProfileChange = (e) => {
    const { name, value } = e.target;
    
    setUserProfile({
      ...userProfile,
      [name]: value
    });
  };
  
  // Handle profile picture upload
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      
      // Create URL preview for the file
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (typeof fileReader.result === 'string') {
          setProfilePicturePreview(fileReader.result);
        }
      };
      fileReader.readAsDataURL(file);
    }
  };
  
  // Handle identity proof upload
  const handleIdentityProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdentityProof(file);
    }
  };
  
  // Handle food safety certification upload
  const handleFoodSafetyCertChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoodSafetyCert(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Ensure we have a valid profileId
      let profileId = profileData.id;
      if (!profileId && user && user.id) {
        profileId = user.id;
      }
      
      if (!profileId) {
        throw new Error("Profile ID is not available");
      }
      
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add chef profile data
      Object.keys(profileData).forEach(key => {
        if (key !== 'identity_proof' && key !== 'food_safety_certification' && profileData[key] !== null) {
          formData.append(key, profileData[key]);
        }
      });
      
      // Add user profile data
      Object.keys(userProfile).forEach(key => {
        if (key !== 'profile_picture' && userProfile[key] !== null) {
          formData.append(key, userProfile[key]);
        }
      });
      
      // Add file uploads if they exist
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }
      
      if (identityProof) {
        formData.append('identity_proof', identityProof);
      }
      
      if (foodSafetyCert) {
        formData.append('food_safety_certification', foodSafetyCert);
      }
      
      // Submit the form data
      const response = await axios.put(`${BaseUrl}api/auth/chef/profile/${profileId}/`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Also update user profile if profile picture changed
      if (profilePicture) {
        const userFormData = new FormData();
        userFormData.append('profile_picture', profilePicture);
        
        // Add other user profile fields
        Object.keys(userProfile).forEach(key => {
          if (key !== 'profile_picture' && userProfile[key] !== null) {
            userFormData.append(key, userProfile[key]);
          }
        });
        
        const userResponse = await axios.put(`${BaseUrl}api/auth/user/profile/${profileId}/`, userFormData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setUserProfile(userResponse.data);
      }
      
      // Update the local state with the response data
      setProfileData(response.data);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMessage(
        err.response?.data?.message || 
        "Failed to update profile. Please try again later."
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    
    // Reset profile picture preview if it was changed
    if (userProfile.profile_picture && !profilePicture) {
      setProfilePicturePreview(`${BaseUrl}${userProfile.profile_picture}`);
    }
  };
  
  if (isLoading) {
    return (
      <DashboardLayout title="Chef Profile">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout title="Chef Profile">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4">
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Chef Profile">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-8 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end">
            <div className="relative">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white overflow-hidden bg-amber-100">
                {profilePicturePreview ? (
                  <img 
                    src={profilePicturePreview} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-amber-700 font-bold text-4xl">
                    {userProfile.first_name?.charAt(0) || userProfile.username?.charAt(0) || 'C'}
                  </div>
                )}
              </div>
              {isEditing && (
                <label 
                  htmlFor="profile-picture-upload" 
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer"
                >
                  <input 
                    type="file" 
                    id="profile-picture-upload" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleProfilePictureChange}
                  />
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              )}
            </div>
            <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                {userProfile.first_name || userProfile.username || 'Chef'}{' '}
                {userProfile.last_name || ''}
              </h1>
              <div className="mt-1 text-amber-100 flex flex-wrap justify-center md:justify-start items-center gap-2">
                <VerificationBadge status={profileData.verification_status} />
                {profileData.specialization && (
                  <span className="text-sm">
                    Specializes in {profileData.specialization}
                  </span>
                )}
                {profileData.years_of_experience && (
                  <span className="text-sm">
                    {profileData.years_of_experience} Years Experience
                  </span>
                )}
              </div>
            </div>
            <div className="mt-6 md:mt-0 md:ml-auto">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-amber-600 hover:bg-amber-50 px-4 py-2 rounded-md shadow-sm font-medium"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-white text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-md shadow-sm font-medium"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="profile-form"
                    className={`bg-amber-600 text-white hover:bg-amber-700 px-4 py-2 rounded-md shadow-sm font-medium ${
                      isSaving ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 mt-4 rounded">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 mt-4 rounded">
            {errorMessage}
          </div>
        )}

        {/* Profile Content */}
        <div className="px-6 py-6">
          <form id="profile-form" onSubmit={handleSubmit}>
            {isEditing ? (
              <div className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={userProfile.first_name || ''}
                        onChange={handleUserProfileChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={userProfile.last_name || ''}
                        onChange={handleUserProfileChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={userProfile.email || ''}
                        onChange={handleUserProfileChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        id="phone_number"
                        name="phone_number"
                        value={userProfile.phone_number || ''}
                        onChange={handleUserProfileChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={userProfile.bio || ''}
                        onChange={handleUserProfileChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring-amber-500"
                        placeholder="Tell us about yourself as a chef..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Chef Professional Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Professional Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="years_of_experience" className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        id="years_of_experience"
                        name="years_of_experience"
                        value={profileData.years_of_experience || ''}
                        onChange={handleProfileChange}
                        min="0"
                        max="70"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        id="specialization"
                        name="specialization"
                        value={profileData.specialization || ''}
                        onChange={handleProfileChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring-amber-500"
                        placeholder="e.g. Italian Cuisine, Pastry, Vegan"
                      />
                    </div>
                    <div>
                      <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-1">
                        Certification
                      </label>
                      <input
                        type="text"
                        id="certification"
                        name="certification"
                        value={profileData.certification || ''}
                        onChange={handleProfileChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring-amber-500"
                        placeholder="e.g. Certified Executive Chef"
                      />
                    </div>
                    <div>
                      <label htmlFor="certification_number" className="block text-sm font-medium text-gray-700 mb-1">
                        Certification Number
                      </label>
                      <input
                        type="text"
                        id="certification_number"
                        name="certification_number"
                        value={profileData.certification_number || ''}
                        onChange={handleProfileChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="issuing_authority" className="block text-sm font-medium text-gray-700 mb-1">
                        Issuing Authority
                      </label>
                      <input
                        type="text"
                        id="issuing_authority"
                        name="issuing_authority"
                        value={profileData.issuing_authority || ''}
                        onChange={handleProfileChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring-amber-500"
                        placeholder="e.g. American Culinary Federation"
                      />
                    </div>
                  </div>
                </div>

                {/* Verification Documents */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Verification Documents</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="identity_proof" className="block text-sm font-medium text-gray-700 mb-1">
                        Identity Proof
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          id="identity_proof"
                          name="identity_proof"
                          onChange={handleIdentityProofChange}
                          accept="image/*,.pdf"
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-medium
                            file:bg-amber-50 file:text-amber-700
                            hover:file:bg-amber-100"
                        />
                        {profileData.identity_proof && !identityProof && (
                          <span className="text-xs text-gray-500">
                            Current document: {typeof profileData.identity_proof === 'string' ? 
                              profileData.identity_proof.split('/').pop() : ''}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Upload a government-issued ID (passport, driver's license)
                      </p>
                    </div>

                    <div>
                      <label htmlFor="food_safety_certification" className="block text-sm font-medium text-gray-700 mb-1">
                        Food Safety Certification
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          id="food_safety_certification"
                          name="food_safety_certification"
                          onChange={handleFoodSafetyCertChange}
                          accept="image/*,.pdf"
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-medium
                            file:bg-amber-50 file:text-amber-700
                            hover:file:bg-amber-100"
                        />
                        {profileData.food_safety_certification && !foodSafetyCert && (
                          <span className="text-xs text-gray-500">
                            Current document: {profileData.food_safety_certification?.split('/').pop() || ''}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Upload your food safety or handling certification
                      </p>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="has_accepted_terms"
                        name="has_accepted_terms"
                        checked={profileData.has_accepted_terms || false}
                        onChange={handleProfileChange}
                        className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <label htmlFor="has_accepted_terms" className="ml-2 block text-sm text-gray-700">
                        I confirm that all information provided is accurate and I agree to the terms and conditions
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* View Mode - Display Profile Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Basic Information */}
                  <div className="col-span-2">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">About</h2>
                    <div className="prose max-w-none">
                      {userProfile.bio ? (
                        <p className="text-gray-700">{userProfile.bio}</p>
                      ) : (
                        <p className="text-gray-500 italic">No bio information added yet.</p>
                      )}
                    </div>

                    <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1 text-gray-900">{userProfile.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                        <p className="mt-1 text-gray-900">{userProfile.phone_number || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Chef Professional Information */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Professional Info</h2>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Years of Experience</dt>
                          <dd className="mt-1 text-gray-900">{profileData.years_of_experience || 'Not specified'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Specialization</dt>
                          <dd className="mt-1 text-gray-900">{profileData.specialization || 'Not specified'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Certification</dt>
                          <dd className="mt-1 text-gray-900">{profileData.certification || 'None'}</dd>
                        </div>
                        {profileData.certification && (
                          <>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Certification Number</dt>
                              <dd className="mt-1 text-gray-900">{profileData.certification_number || 'Not provided'}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Issuing Authority</dt>
                              <dd className="mt-1 text-gray-900">{profileData.issuing_authority || 'Not specified'}</dd>
                            </div>
                          </>
                        )}
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
                          <dd className="mt-1">
                            <VerificationBadge status={profileData.verification_status} />
                            {profileData.verification_date && (
                              <span className="text-xs text-gray-500 ml-2">
                                on {new Date(profileData.verification_date).toLocaleDateString()}
                              </span>
                            )}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChefProfilePage;