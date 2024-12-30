import React, { useState,useEffect } from 'react';
import { Play, Upload, Plus,Grid,List,Search, X } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {storage} from "../firebase";
import {format} from "timeago.js"
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SummaryApi from '../common';

const Videos = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [uploadProgress, setUploadProgress] = useState({ thumbnail: 0, video: 0 });
  const [isUploading, setIsUploading] = useState({ thumbnail: false, video: false });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    ingredients: '',
    thumbnail: null,
    videoUrl: null
  });

  const {isAuthenticated} = useSelector(state => state.auth);


  const filters = [
    { id: 'all', label: 'All Videos', icon: '🎥' },
    { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { id: 'lunch', label: 'Lunch', icon: '🥗' },
    { id: 'dinner', label: 'Dinner', icon: '🍽️' },
    { id: 'desserts', label: 'Desserts', icon: '🍰' },
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' }
  ];

//  ! file upload
    // Firebase upload function
    const handleFileUpload = async (file, type) => {
        if (!file) {
          console.log('No file selected');
          return;
        }
    
        console.log(`Starting ${type} upload:`, file.name); // Debug log
    
        try {
          setIsUploading(prev => ({ ...prev, [type]: true }));
    
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
              setUploadProgress(prev => ({
                ...prev,
                [type]: progress
              }));
            },
            (error) => {
              console.error(`${type} upload error:`, error);
              console.error('Error code:', error.code);
              console.error('Error message:', error.message);
              setError(`Error uploading ${type}: ${error.message}`);
              setIsUploading(prev => ({ ...prev, [type]: false }));
              setUploadProgress(prev => ({ ...prev, [type]: 0 }));
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(fileRef);
                console.log(`${type} upload completed. URL:`, downloadURL); 
    
                setFormData(prev => ({
                  ...prev,
                  [`${type}`]: downloadURL
                }));
              } catch (urlError) {
                console.error(`Error getting ${type} download URL:`, urlError);
                setError(`Error getting download URL for ${type}`);
              } finally {
                setIsUploading(prev => ({ ...prev, [type]: false }));
                setUploadProgress(prev => ({ ...prev, [type]: 0 }));
              }
            }
          );
        } catch (error) {
          console.error(`Error initiating ${type} upload:`, error);
          setError(`Error initiating ${type} upload`);
          setIsUploading(prev => ({ ...prev, [type]: false }));
          setUploadProgress(prev => ({ ...prev, [type]: 0 }));
        }
      };
    
    
//  ! input change
const handleInputChange = async (e) => {
  const { name, value, files } = e.target;

  if (files && files[0]) {
    console.log(`File selected for ${name}:`, files[0].name);

    if (name === 'thumbnail') {
      if (!files[0].type.startsWith('image/')) {
        alert('Please select an image file for the thumbnail');
        return;
      }
      await handleFileUpload(files[0], 'thumbnail');
    } else if (name === 'video') {
      if (!files[0].type.startsWith('video/')) {
        alert('Please select a video file');
        return;
      }
      await handleFileUpload(files[0], 'videoUrl');
    }
  } else if (name === 'category') {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
};

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return false;
    }
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return false;
    }
    if (!formData.videoUrl) {
      alert('Please upload a video');
      return false;
    }
    if (!formData.thumbnail) {
      alert('Please upload a thumbnail');
      return false;
    }
    if (!formData.category) {
      alert('Please select a category');
      return false;
    }
    if (!formData.ingredients.trim()) {
      alert('Please enter ingredients');
      return false;
    }
    return true;
  };
  
  

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
      }
    console.log(formData.videoUrl)
    try {

      const payload = {
        title: formData.title,
        description: formData.description,
        ingredients: formData.ingredients,
        video: formData.videoUrl,
        thumbnail: formData.thumbnail, 
        category: formData.category
      };


  
      const response = await fetch(SummaryApi.uploadVideo.url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(payload) 
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload video');
      }
  
      const data = await response.json();
      console.log('Video uploaded successfully:', data);
      setIsModalOpen(false);
      fetchVideos(); // Refresh the videos list
    } catch (error) {
      console.error('Error saving video:', error);
      alert(error.message);
    }
  };

  const UploadProgress = ({ progress, type }) => (
    <div className="mt-2">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Uploading {type}...</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-orange-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
     
      const url = selectedFilter === 'all' 
        ? SummaryApi.getVideos.url
        : `${SummaryApi.defaultUrl}/api/videos?category=${selectedFilter}`;
        
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      
      setVideos(data?.data?.videos || []);
    } catch (err) {
      setError('Failed to fetch videos. Please try again later.');
      console.error('Error fetching videos:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchVideos();
  }, [selectedFilter]); 

  const filteredVideos = videos
    .filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          video.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedFilter === 'all' || video.category === selectedFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Curlinary Videos</h1>
            
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 flex-grow md:max-w-2xl">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 rounded-lg border hover:bg-gray-50"
                >
                  {viewMode === 'grid' ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
                </button>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                
                {isAuthenticated ? (<button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>): (<></>)}
              </div>
            </div>
          </div>
          
          {/* Enhanced Filters */}
          <div className="mt-6 flex items-center space-x-4 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-6 py-3 rounded-full capitalize whitespace-nowrap flex items-center gap-2 transition-all ${
                  selectedFilter === filter.id
                    ? 'bg-orange-600 text-white scale-105 shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:scale-102'
                }`}
              >
                <span>{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl w-full max-w-2xl">
            {/* Modal Header - Same as before */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Upload New Video</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Thumbnail Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail
                    </label>
                    <div className="border-2 border-gray-200 border-dashed rounded-xl p-6 hover:border-orange-500 transition-colors">
                      {formData.thumbnail ? (
                        <div className="relative">
                          <img 
                            src={formData.thumbnail} 
                            alt="Thumbnail preview" 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
                          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                            <Plus className="w-6 h-6 text-orange-600" />
                          </div>
                          <div className="text-center">
                            <span className="text-sm font-medium text-orange-600">Click to upload</span>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                          </div>
                          <input
                            type="file"
                            name="thumbnail"
                            accept="image/*"
                            onChange={handleInputChange}
                            className="hidden"
                            disabled={isUploading.thumbnail}
                          />
                        </label>
                      )}
                      {isUploading.thumbnail && (
                        <UploadProgress progress={uploadProgress.thumbnail} type="thumbnail" />
                      )}
                    </div>
                  </div>

                  {/* Video Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video File
                    </label>
                    <div className="border-2 border-gray-200 border-dashed rounded-xl p-6 hover:border-orange-500 transition-colors">
                      {formData.videoUrl ? (
                        <div className="relative">
                          <video 
                            src={formData.videoUrl} 
                            className="w-full h-32 object-cover rounded-lg" 
                            controls
                          />
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, video: '' }))}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
                          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                            <Upload className="w-6 h-6 text-orange-600" />
                          </div>
                          <div className="text-center">
                            <span className="text-sm font-medium text-orange-600">Click to upload</span>
                            <p className="text-xs text-gray-500 mt-1">MP4, WebM up to 2GB</p>
                          </div>
                          <input
                            type="file"
                            name="video"
                            accept="video/*"
                            onChange={handleInputChange}
                            className="hidden"
                            disabled={isUploading.video}
                          />
                        </label>
                      )}
                      {isUploading.videoUrl && (
          <UploadProgress progress={uploadProgress.videoUrl} type="Video" />
        )}
                    </div>
                  </div>
                </div>

                {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter video title"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter video description"
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select category</option>
                  {filters.map((filter) => (
                    <option key={filter} value={filter}>
                      {filter.icon} {filter.label}
                      {/* {filter.charAt(0).toUpperCase() + filter.slice(1)} */}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ingredients */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ingredients
                </label>
                <input
                  type="text"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  placeholder="Enter receipe ingredients"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
                
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading.thumbnail || isUploading.video}
                className={`px-4 py-2 bg-orange-600 text-white rounded-lg transition-colors ${
                  (isUploading.thumbnail || isUploading.video)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-orange-700'
                }`}
              >
                Upload Video
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Filters */}
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b">
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-6 py-2 rounded-full capitalize whitespace-nowrap ${
                selectedFilter === filter
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div> */}

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
          }>
            {filteredVideos.map((video) => (
              <Link key={video._id} to={`/videos/${video._id}`} className="block group">
                <div className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                  viewMode === 'list' ? 'flex gap-4' : ''
                }`}>
                  <div className={`relative ${viewMode === 'list' ? 'w-64' : 'w-full'}`}>
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className={`w-full object-cover ${viewMode === 'list' ? 'h-full' : 'h-48'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-orange-600 p-4 rounded-full transform scale-0 group-hover:scale-100 transition-transform">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full">
                      {format(video.createdAt)}
                    </div>
                  </div>

                  <div className="p-4 flex-grow">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {video.title}
                      </h3>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full whitespace-nowrap">
                        {video.category}
                      </span>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{video.description}</p>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {video?.ingredients
                      }
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Videos;