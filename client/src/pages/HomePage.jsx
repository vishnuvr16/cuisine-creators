import React, { useState } from 'react';
import HeroSection from '../components/HeroSection';
import Trending from '../components/Trending';
import FeaturedBlogs from '../components/FeaturedBlogs';
import AIKitchen from '../components/AIKitchen';
import Footer from '../components/Footer';

const HomePage = () => {
  const [showSignInModal, setShowSignInModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <HeroSection />

      {/* Trending Section */}
      <Trending />

      {/* Featured Blogs */}
      <FeaturedBlogs />

      {/* AI Kitchen Section */}
      <AIKitchen />

      {/* footer */}
      <Footer />
      
    </div>
  );
};

export default HomePage;