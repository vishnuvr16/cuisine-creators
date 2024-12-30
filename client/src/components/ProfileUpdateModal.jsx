import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, X, User, AtSign, MessageSquare } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {storage} from "../firebase";

const ProfileUpdateModal = ({ 
  isOpen, 
  onClose, 
  profile, 
  onUpdateProfile, 
  // onAvatarUpload 
}) => {
  const [editedProfile, setEditedProfile] = useState({
    name: profile?.name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    avatar: profile?.avatar || ''
  });
  const [loading, setLoading] = useState(false);
  const [isUploading,setIsUploading] = useState(false);
  const [uploadProgress,setUploadProgress] = useState(0);
  const [error,setError] = useState(false);
  const modalRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(()=>{},[editedProfile.avatar])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = async (e) => {
    console.log("avatar change")
    const {name,value,files} = e.target;
    if(files && files[0]){
      console.log(`File selected for ${name}:`, files[0].name);
      await handleFileUpload(files[0],'avatar');
    }
  };

  const handleFileUpload = async (file, type) => {
    console.log("upload started")
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log(`Starting ${type} upload:`, file.name); // Debug log

    try {
      setIsUploading(true);

      // Create storage reference
      const fileRef = ref(storage, `${type}s/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
      console.log('Storage reference created:', fileRef.fullPath); // Debug log

      // Create upload task
      const uploadTask = uploadBytesResumable(fileRef, file);

      // Monitor upload
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred * 100) / snapshot.totalBytes
          );
          console.log(`${type} upload progress:`, progress); // Debug log
          setUploadProgress(progress);
        },
        (error) => {
          // Handle upload errors
          console.error(`${type} upload error:`, error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          setError(`Error uploading ${type}: ${error.message}`);
          setIsUploading(false);
          setUploadProgress(0);
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(fileRef);
            console.log(`${type} upload completed. URL:`, downloadURL); // Debug log

            setEditedProfile(prev => ({
              ...prev,
              ['avatar']: downloadURL
            }));
          } catch (urlError) {
            console.error(`Error getting ${type} download URL:`, urlError);
            setError(`Error getting download URL for ${type}`);
          } finally {
            setIsUploading(false);
            setUploadProgress(0);
          }
        }
      );
    } catch (error) {
      console.error(`Error initiating ${type} upload:`, error);
      setError(`Error initiating ${type} upload`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = () => {
    onUpdateProfile(editedProfile);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-auto max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-6 text-white flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <p className="text-white/80 mt-1 text-sm">
            Customize your profile information
          </p>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto">
          <div className="px-6 py-8 md:px-8">
            <div className="flex flex-col items-center space-y-8 max-w-xl mx-auto">
              {/* Avatar Upload */}
              <div className="relative group">
                <div className={`relative rounded-full overflow-hidden w-36 h-36 ${loading ? 'opacity-50' : ''}`}>
                  <img
                    src={profile?.avatar || "/api/placeholder/150/150"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  id="avatar-upload"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={loading}
                />
                <label 
                  htmlFor="avatar-upload"
                  className="absolute bottom-2 right-2 bg-orange-500 text-white p-3 rounded-full shadow-lg 
                           hover:bg-orange-600 cursor-pointer transition-all transform 
                           group-hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-5 h-5" />
                </label>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="w-full space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editedProfile.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                             transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <AtSign className="w-4 h-4 mr-2 text-gray-400" />
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                    <input
                      type="text"
                      name="username"
                      value={editedProfile.username}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                               transition-all duration-200"
                      placeholder="Choose a username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={editedProfile.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none
                             focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                             transition-all duration-200"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-gray-100
                     transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600
                     transform hover:translate-y-[-1px] transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdateModal;