import React from 'react';
import { ChevronDown } from 'lucide-react';

const VideoInfo = ({ videoData, showInfo, toggleInfo }) => {
  return (
    <div
      className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white rounded-lg shadow-lg w-11/12 max-w-md sm:max-w-lg md:max-w-xl transition-all duration-300 ${
        showInfo ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex justify-between items-center px-4 py-3">
        <h2 className="text-xl font-semibold text-orange-500">{videoData.title}</h2>
        <button
          onClick={toggleInfo}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <ChevronDown
            className={`w-5 h-5 text-white transform ${showInfo ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>
      </div>
      <div className="px-4 py-3">
        <p className="text-gray-300 text-sm">
          <span className="font-medium">Category:</span> {videoData.category}
        </p>
        <p className="text-gray-300 text-sm mt-1">{videoData.description}</p>
        {/* {videoData.ingredients && (
          <div className="text-white/90 text-sm mt-2">
            <h3 className="font-medium">Ingredients:</h3>
            <ul className="list-disc ml-4">
              {videoData.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default VideoInfo;