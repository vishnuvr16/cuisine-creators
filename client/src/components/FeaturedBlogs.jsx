import React, { useState, useEffect } from 'react';
import { ChevronRight, BookOpen, Play, Heart, Clock, Share2, Bookmark, AlertCircle } from 'lucide-react';
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


const FeaturedBlogs = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedBlogs();
  }, []);

  const fetchFeaturedBlogs = async () => {
    try {
      const response = await fetch(SummaryApi.featuredBlogs.url,{
        method: SummaryApi.featuredBlogs.method,
        credentials: 'include'
      }); 
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }
      const data = await response.json();
      setBlogs(data.data.slice(0, 3)); 
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="h-72 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
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
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Blogs</h2>
            <p className="text-gray-600">Discover our hand-picked culinary stories</p>
          </div>
          <button className="group flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
            <span className="text-orange-600">View All</span>
            <ChevronRight className="w-5 h-5 text-orange-600 transform group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <div
              key={blog.id}
              className="group relative cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="relative">
                <img 
                  src={blog.image || '/api/placeholder/400/320'} 
                  alt={blog.title}
                  className="w-full h-72 object-cover transform group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {blog.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(blog.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}</span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                  {blog.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {blog.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">{blog.readTime || '5 min read'}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300">
                      <Bookmark className="w-5 h-5 text-gray-500 hover:text-orange-600" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300">
                      <Share2 className="w-5 h-5 text-gray-500 hover:text-orange-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBlogs;