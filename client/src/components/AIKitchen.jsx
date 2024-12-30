import React from 'react';
import img from "../assets/kitchen-image.png";

const AIKitchen = () => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 text-white space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">AI-Powered Recipe Generation</h2>
              <p className="text-lg">
                Turn your available ingredients into delicious recipes with our AI kitchen assistant.
              </p>
              <button className="bg-white text-orange-600 px-8 py-3 rounded-full hover:bg-gray-100 transition-colors">
                Try AI Kitchen
              </button>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
              <img 
                src={img} 
                alt="AI Kitchen" 
                className="rounded-lg shadow-xl h-40 object-cover w-3/4 md:w-3/4 transition-transform transform hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIKitchen;
