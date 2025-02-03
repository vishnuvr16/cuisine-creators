import React, { useState, useEffect } from 'react';
import { 
  Clock, Heart, MessageSquare, Share2, User, ChevronRight,
  Coffee, Utensils, BookOpen, Lightbulb, Star, Filter,
  Search, TrendingUp, Calendar, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SummaryApi from '../common';

const Blogs = () => {
  const categories = [
    { name: 'All', icon: Filter },
    {name: 'lunch',icon: Coffee},
    { name: 'Healthy Eating', icon: Lightbulb },
    { name: 'Quick Recipes', icon: Utensils },
    { name: 'Veg Recipes', icon: BookOpen },
    { name: 'Non-veg', icon: Coffee },
    { name: 'Desserts', icon: Star }
  ];
  const {isAuthenticated} = useSelector(state => state.auth);

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchBlogs = async (pageNum = 1, category = selectedCategory) => {
    try {
      setLoading(true);
      const url = new URL(`${SummaryApi.defaultUrl}/api/blogs`);
      url.searchParams.append('page', pageNum);
      url.searchParams.append('limit', 6); // Adjust limit as needed
      if (category !== 'All') {
        url.searchParams.append('category', category);
      }
      console.log(url);
      const response = await fetch(url, { method: 'GET', credentials: 'include' });
  
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }
  
      const result = await response.json(); // Parse JSON here
  
      if (pageNum === 1) {
        setBlogs(result.data.blogs); // Access the blogs from the nested response
      } else {
        setBlogs(prev => [...prev, ...result.data.blogs]);
      }
      
      setHasMore(result.data.blogs.length > 0); // Handle empty results
      setError(null);
    } catch (err) {
      setError('Failed to load blogs. Please try again later.');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    setPage(1);
    fetchBlogs(1, selectedCategory);
  }, [selectedCategory]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBlogs(nextPage, selectedCategory);
  };

  const formatDate = (dateString) => {
    const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const BlogCard = ({ blog }) => (
    <Link to={`/blogs/${blog._id}`}>
      <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative">
          <img 
            src={blog.image || "/api/placeholder/400/250"} 
            alt={blog.title} 
            className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105" 
          />
          <div className="absolute top-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {blog.readTime || '5'} min
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-2 text-sm mb-3">
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
              {blog.category}
            </span>
            <span className="text-gray-400">{formatDate(blog.createdAt)}</span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
            {blog.title}
          </h3>
          
          <p className="mt-3 text-gray-600 line-clamp-2">
            {blog.description}
          </p>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
                <span>{blog.likes?.length || 0}</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span>{blog.comments?.length || 0}</span>
              </button>
              <button className="text-gray-500 hover:text-green-500 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            
            <ArrowUpRight className="w-5 h-5 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className={`sticky top-0 z-10 bg-white transition-shadow duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                Culinary Hub
              </h1>
              <p className="mt-2 text-gray-600">Discover cooking inspiration and stories from our community</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 rounded-full border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              
             {isAuthenticated? ( <Link 
                to="create" 
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-colors shadow-lg shadow-orange-100 hover:shadow-orange-200"
              >
                Create Blog
                <ArrowUpRight className="w-5 h-5" />
              </Link>):(<></>)}
            </div>
          </div>

          <div className="mt-6 flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(({ name, icon: Icon }) => (
              <button
                key={name}
                className={`px-6 py-2 rounded-full transition-all flex items-center gap-2 ${
                  selectedCategory === name 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
                onClick={() => handleCategoryClick(name)}
              >
                <Icon className="w-4 h-4" />
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="text-red-600 text-center mb-8 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs && blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
        
        {loading && (
          <div className="text-center mt-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
          </div>
        )}
        
        {!loading && hasMore && (
          <div className="mt-12 text-center">
            <button 
              onClick={handleLoadMore}
              className="bg-white text-orange-600 border-2 border-orange-600 px-8 py-3 rounded-full hover:bg-orange-50 transition-colors flex items-center gap-2 mx-auto"
            >
              Load More Articles
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;