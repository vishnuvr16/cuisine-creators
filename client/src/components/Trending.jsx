import React, { useState, useEffect } from 'react';
import { ChevronRight, BookOpen, Play, Heart, Clock, Share2, Bookmark, AlertCircle } from 'lucide-react';
import { Link } from "react-router-dom";
import SummaryApi from '../common';

const Alert = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-blue-50 text-blue-900",
    destructive: "bg-red-50 text-red-900"
  };

  return (
    <div className={`p-4 rounded-lg flex items-center gap-2 ${variants[variant]}`}>
      {children}
    </div>
  );
};


const Trending = () => {
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLatestVideos();
  }, []);

  const fetchLatestVideos = async () => {
    try {
      const response = await fetch(SummaryApi.trendingVideos.url,{
        method: SummaryApi.trendingVideos.method,
        credentials: 'include'
      }); 
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      const data = await response.json();
      setVideos(data.data.slice(0, 3));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertCircle>
              {error}
            </AlertCircle>
          </Alert>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Trending Videos</h2>
            <p className="text-gray-600">Watch our most popular cooking guides</p>
          </div>
          <Link
            to="/videos"
            className="group flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
          >
            <span className="text-orange-600">View All</span>
            <ChevronRight className="w-5 h-5 text-orange-600 transform group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {videos?.map((video) => (
            <Link to={`/videos/${video._id}`}>
              <div
              key={video.id}
              className="group relative cursor-pointer rounded-xl overflow-hidden shadow-lg transform hover:-translate-y-1 transition-all duration-500"
              onMouseEnter={() => setHoveredVideo(video.id)}
              onMouseLeave={() => setHoveredVideo(null)}
            >
              <img
                src={video.thumbnail || '/api/placeholder/400/320'} // Fallback to placeholder if no thumbnail
                alt={video.title}
                className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              
              <div className="absolute top-4 right-4">
                <span className="bg-black/70 text-white px-2 py-1 rounded-md text-sm">
                  {video.duration || video.category}
                </span>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 p-6 w-full">
                  <h3 className="text-white text-xl font-semibold mb-3">{video.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-white text-sm flex items-center">
                        <Play className="w-4 h-4 mr-1" /> {video.views || 148} views
                      </span>
                      <button className="flex items-center text-white text-sm hover:text-orange-500 transition-colors duration-300">
                        <Heart className={`w-4 h-4 mr-1 ${hoveredVideo === video.id ? 'animate-pulse' : ''}`} />
                        {video.likes.length}
                      </button>
                    </div>
                    <button className="text-white hover:text-orange-500 transition-colors duration-300">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                  <Play className="w-8 h-8 text-white transform translate-x-0.5" />
                </div>
              </div>
            </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Trending;