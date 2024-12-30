import React, { useState } from 'react';
import { ChefHat, Utensils, Timer, Computer } from 'lucide-react';
import img from "../assets/img2.jpg"
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative min-h-screen pt-10 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content Section */}
          <div className="lg:w-1/2 space-y-8 animate-fade-in-up">
            <div className="inline-block">
              <span className="bg-orange-100 text-orange-800 text-sm font-medium px-4 py-1 rounded-full">
                🎉 Join 10,000+ food lovers
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Create, Share & 
              <span className="text-orange-600"> Discover</span>
              <br />
              Culinary Magic
            </h1>

            <p className="text-xl text-gray-600 max-w-xl">
              Transform your kitchen into a creative studio. Join our vibrant community
              of food enthusiasts and explore AI-powered cooking innovations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="group relative px-8 py-4 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span className="flex items-center justify-center gap-2">
                  <Link to="/videos" >Start Creating</Link>
                  <ChefHat className="w-5 h-5 transition-transform group-hover:rotate-12" />
                </span>
              </button>
              
              <button className="group px-8 py-4 border-2 border-orange-600 text-orange-600 rounded-full hover:bg-orange-50 transition-all duration-300">
                <span className="flex items-center justify-center gap-2">
                  <Link to="/aiReceipe">Try with AI</Link>
                  <span className="animate-bounce"><Computer /></span>
                </span>
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8">
              <div className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors duration-300">
                <Utensils className="w-5 h-5 text-orange-600" />
                <span>1000+ Recipes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors duration-300">
                <Timer className="w-5 h-5 text-orange-600" />
                <span>Quick & Easy</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors duration-300">
                <ChefHat className="w-5 h-5 text-orange-600" />
                <span>Pro Tips</span>
              </div>
            </div>
          </div>

          {/* Right Image Section */}
          <div className="lg:w-1/2 relative animate-fade-in">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <img 
                src={img}
                alt="Cooking" 
                className="relative rounded-lg shadow-2xl transform transition duration-500 hover:scale-105"
              />
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white p-3 rounded-lg shadow-lg animate-float">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-6 h-6 text-orange-600" />
                  <span className="text-sm font-medium">Pro Chef Tips</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-lg shadow-lg animate-float delay-700">
                <div className="flex items-center gap-2">
                  <Timer className="w-6 h-6 text-orange-600" />
                  <span className="text-sm font-medium">Quick Recipes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;