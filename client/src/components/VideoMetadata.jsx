import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Share2, Bookmark, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

const VideoMetadata = ({ videoData }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
  };
  
  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
  };

  return (
    <div className="max-w-full bg-white dark:bg-gray-200 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title and View Count */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {videoData.title}
        </h1>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {videoData.views} views • {videoData.uploadDate}
        </div>

        {/* Engagement Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 px-4 py-2 rounded-full ${
                  isLiked 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{videoData.likes.toLocaleString()}</span>
              </button>
              
              <button
                onClick={handleDislike}
                className={`flex items-center space-x-1 px-4 py-2 rounded-full ${
                  isDisliked 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <ThumbsDown className={`w-5 h-5 ${isDisliked ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>

            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                isSaved 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              <span>Save</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>{videoData.comments.toLocaleString()} comments</span>
          </div>
        </div>

        {/* Channel Info */}
        {/* <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={videoData?.channel?.avatar} 
                alt={videoData?.channel?.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {videoData?.channel?.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {videoData?.channel?.subscribers?.toLocaleString()} subscribers
                </p>
              </div>
            </div>
            <button className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200">
              Subscribe
            </button>
          </div>
        </div> */}

        {/* Description and Ingredients */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className={`space-y-4 ${!isDescriptionExpanded && 'max-h-32 overflow-hidden'}`}>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {videoData.description}
            </p>
            {videoData.ingredients}
            
            {/* {videoData.ingredients && (
              <div className="mt-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Ingredients</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {videoData.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            )} */}
          </div>
          
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="mt-2 flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <span>{isDescriptionExpanded ? 'Show less' : 'Show more'}</span>
            {isDescriptionExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoMetadata;