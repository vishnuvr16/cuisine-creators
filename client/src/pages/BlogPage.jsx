import React, { useState,useEffect } from 'react';
import { 
  Calendar, User, MessageCircle, Clock, Flame, Users,
  Heart, Share2, Twitter, Facebook, Printer,
  Star, BookmarkPlus, ThumbsUp, ChefHat, Scale,
  Plus, Minus, Clock3, 
  Share,
  ShareIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {useParams} from 'react-router-dom'
import SummaryApi from '../common';

const BlogPage = () => {
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState('overview');
  const [servings, setServings] = useState(4);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [blogData, setBlogData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user,setUser] = useState(null);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const response = await fetch(`${SummaryApi.defaultUrl}/api/blogs/${id}`, {
          method: 'GET',
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch blog data');
        }
        const data = await response.json();
        console.log("data_author", data.author);
        setBlogData(data);
  
      } catch (error) {
        throw new Error(`Error fetching blog data: ${error.message}`);
      }
    };
    fetchBlogData();
  }, [id]);


  const NavButton = ({ active, children, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full transition-all ${
        active 
          ? 'bg-red-50 text-red-600 font-medium' 
          : 'hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  const MetricCard = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm">
      <Icon className="w-6 h-6 text-gray-600" />
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {blogData && (<div className="relative h-[70vh] bg-black">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <img 
          src={blogData.image}
          alt={blogData.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 rounded-full bg-red-600 text-sm font-medium">
                {blogData.difficulty}
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">{blogData.title}</h1>
            <p className="text-gray-200 max-w-2xl mb-6">{blogData.description}</p>
           
              <div className="flex items-center gap-4">
              <img 
                src={blogData.author['avatar']}
                alt={blogData.author}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{blogData.author['name']}</p>
                <p className="text-sm text-gray-300">Professional Chef</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>)}

      {/* Main Content */}
      {blogData && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-4 gap-4 mb-8">
            <MetricCard 
              icon={Clock} 
              label="Prep Time" 
              value={`${blogData.prepTime} mins`}
            />
            <MetricCard 
              icon={Flame} 
              label="Cook Time" 
              value={`${blogData.cookTime} mins`}
            />
            <MetricCard 
              icon={Users} 
              label="Servings" 
              value={servings}
            />
            <MetricCard 
              icon={Scale} 
              label="Calories" 
              value={240}
            />
          </div>

          <div className="flex items-center gap-4 mb-8">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSaved(!saved)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                saved ? 'bg-red-50 text-red-600' : 'bg-gray-100'
              }`}
            >
              <BookmarkPlus className="w-5 h-5" />
              {saved ? 'Saved' : 'Save Recipe'}
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                liked ? 'bg-red-50 text-red-600' : 'bg-gray-100'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-600' : ''}`} />
              Like
            </motion.button>

            <div className="ml-auto flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ShareIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center gap-4 border-b mb-8">
            <NavButton 
              active={activeSection === 'overview'}
              onClick={() => setActiveSection('overview')}
            >
              Overview
            </NavButton>
            <NavButton 
              active={activeSection === 'ingredients'}
              onClick={() => setActiveSection('ingredients')}
            >
              Ingredients
            </NavButton>
            <NavButton 
              active={activeSection === 'instructions'}
              onClick={() => setActiveSection('instructions')}
            >
              Instructions
            </NavButton>
            <NavButton 
              active={activeSection === 'nutrition'}
              onClick={() => setActiveSection('nutrition')}
            >
              Nutrition
            </NavButton>
          </div>

          <AnimatePresence mode="wait">
            {/* Render content conditionally */}
            {activeSection === 'overview' && (
              <div>
                {/* ingredeitns */}
                <div className=''>
                  <h1 className='text-2xl text-red-500'>Ingredients</h1>
                  {blogData.ingredients}
                </div>
                <div className=''>
                  <h1 className='text-2xl text-red-500'>Instructions</h1>
                  {blogData.instructions}
                </div>
              </div>
            )}
            {activeSection === 'ingredients' && (
              <div>Ingredients Content</div>
            )}
            {activeSection === 'instructions' && (
              <div>Instructions Content</div>
            )}
            {activeSection === 'nutrition' && (
              <div>Nutrition Content</div>
            )}
          </AnimatePresence>
        </div>
      </div>
      )}
    </div>
  );
};

export default BlogPage;
