import React, { useState, useEffect } from 'react';
import { Settings, BookOpen, Play, Heart, Bookmark, Edit2, Camera, Clock, MessageSquare } from 'lucide-react';
import ProfileUpdateModal from '../components/ProfileUpdateModal';
import { useNavigate } from 'react-router-dom';
import profilePic from "../assets/download.png"
import SummaryApi from '../common';
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('videos');
  const [profile, setProfile] = useState(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [content, setContent] = useState({
    videos: [],
    blogs: [],
    liked: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const tabs = [
    { id: 'videos', label: 'My Videos', icon: Play },
    { id: 'blogs', label: 'My Blogs', icon: BookOpen },
    { id: 'liked', label: 'Liked', icon: Heart },
  ];

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${SummaryApi.defaultUrl}/api/profile`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load profile data');
      }
    };
    fetchProfile();
  }, []);

  // Fetch content based on active tab
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${SummaryApi.defaultUrl}/api/users/profile/content/${activeTab}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${activeTab} content`);
        }
        
        const data = await response.json();
        setContent(prev => ({ ...prev, [activeTab]: data }));
      } catch (err) {
        console.error(err);
        setError(`Failed to load ${activeTab}`);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [activeTab]);

  // Navigation handlers
  const handleContentClick = (item, type) => {
    if (type === 'videos') {
      navigate(`/videos/${item._id}`);
    } else if (type === 'blogs') {
      navigate(`/blogs/${item._id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto" />
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!profile) {
    return null;
  }

 

  const handleUpdateProfile = async (updatedData) => {
    try {
      const response = await fetch(`${SummaryApi.defaultUrl}/api/profile/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsProfileModalOpen(false);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile');
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0">
            <div className="relative">
              <img
                src={profilePic ? profilePic : profile.avatar}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
              />
              
              
            </div>

            <div className="md:ml-8 text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-gray-600">@{profile.username}</p>
                </div>
                <div className="hidden md:flex space-x-4">
                  <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700">
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>

              <ProfileUpdateModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                // onAvatarUpload={handleAvatarUpload}
              />

              <div className="mt-4 flex items-center justify-center md:justify-start space-x-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{content.videos?.length || 0}</div>
                  <div className="text-sm text-gray-600">Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{content.blogs?.length || 0}</div>
                  <div className="text-sm text-gray-600">Blogs</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profile.stats?.following || 0}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
              </div>

              <p className="mt-4 text-gray-700 max-w-2xl">{profile.bio || 'No bio available'}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b">
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 pb-4 px-1 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContentGrid 
          items={content[activeTab]} 
          type={activeTab} 
          onItemClick={handleContentClick}
        />
      </div>
    </div>
  );
};

const ContentGrid = ({ items, type, onItemClick }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No {type} found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => onItemClick(item, type)}
        >
          <div className="relative">
            <img 
              src={item.thumbnail || item.image || "/api/placeholder/400/225"} 
              alt={item.title || 'Content thumbnail'} 
              className="w-full h-48 object-cover"
            />
            {type === 'videos' && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-sm px-2 py-1 rounded">
                {item.duration || '10:00'}
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-2">{item.title || 'Untitled'}</h3>
            <p className='py-2'>{item.ingredients}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>{item.likes.length || 0} likes</span>
              </div>
              <span>{item.timeAgo || 'Recently'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfilePage;