import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, ThumbsUp, Share2, Rewind, FastForward } from 'lucide-react';
import img from "../assets/download.png"
import SummaryApi from '../common';
const VideoPlayer = ({ videoData , handleLike }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [skipIndicator, setSkipIndicator] = useState({ show: false, direction: null, x: 0 });
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const containerRef = useRef(null);
  const skipTimerRef = useRef(null);
  const [channel,setChannel] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${SummaryApi.defaultUrl}/api/auth/${videoData.author}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setChannel(data);
        console.log("channel",channel)
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, [videoData]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && document.activeElement.tagName !== 'BUTTON') {
        e.preventDefault();
        togglePlay();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (skipTimerRef.current) {
        clearTimeout(skipTimerRef.current);
      }
    };
  }, []);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const showSkipAnimation = (direction, clickX) => {
    if (skipTimerRef.current) {
      clearTimeout(skipTimerRef.current);
    }

    // Calculate relative X position for the indicator
    const { left, width } = containerRef.current.getBoundingClientRect();
    const relativeX = ((clickX - left) / width) * 100;

    setSkipIndicator({
      show: true,
      direction,
      x: relativeX
    });

    skipTimerRef.current = setTimeout(() => {
      setSkipIndicator(prev => ({ ...prev, show: false }));
    }, 500);
  };

  const skipTime = (seconds, clickX) => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime + seconds;
      videoRef.current.currentTime = Math.min(Math.max(0, newTime), duration);
      showSkipAnimation(seconds > 0 ? 'forward' : 'backward', clickX);
    }
  };

  const handleDoubleClick = (e) => {
    const { left, right } = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX;
    const containerWidth = right - left;
    
    if (clickX - left < containerWidth / 3) {
      skipTime(-5, clickX);
    } else if (right - clickX < containerWidth / 3) {
      skipTime(5, clickX);
    }
  };

  const toggleMute = () => {
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setCurrentTime(videoRef.current.currentTime);
    setProgress(progress);
  };

  const handleProgressBarClick = (e) => {
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-black rounded-lg overflow-hidden">
        <div 
          ref={containerRef}
          className="relative aspect-video"
          onDoubleClick={handleDoubleClick}
        >
          <video
            ref={videoRef}
            src={videoData.videoUrl}
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => setDuration(videoRef.current.duration)}
            onEnded={handleVideoEnd}
          />
          
          {/* YouTube-style Skip Indicator */}
          {skipIndicator.show && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ 
                left: `${skipIndicator.x}%`,
                transform: `translate(-50%, -50%)`,
              }}
            >
              <div className="flex flex-col items-center justify-center">
                <div className={`
                  w-16 h-16 rounded-full bg-black/70 flex items-center justify-center
                  transform transition-transform duration-200 
                  ${skipIndicator.direction === 'forward' ? 'translate-x-4' : '-translate-x-4'}
                `}>
                  {skipIndicator.direction === 'forward' ? (
                    <FastForward className="w-8 h-8 text-white" />
                  ) : (
                    <Rewind className="w-8 h-8 text-white" />
                  )}
                </div>
                <div className="mt-2 bg-black/70 px-3 py-1 rounded-md">
                  <span className="text-white font-medium">
                    {skipIndicator.direction === 'forward' ? '+5' : '-5'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="hover:text-orange-500 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="hover:text-orange-500 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </button>
                  
                  <div className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
                
                <button 
                  onClick={toggleFullscreen}
                  className="hover:text-orange-500 transition-colors"
                >
                  <Maximize className="w-6 h-6" />
                </button>
              </div>
              
              <div 
                ref={progressBarRef}
                className="w-full bg-gray-600 h-1 rounded-full cursor-pointer"
                onClick={handleProgressBarClick}
              >
                <div 
                  className="bg-orange-500 h-full rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-gray-900">{videoData.title}</h1>
        <p className='text-md'>{videoData.description}</p>
        <p className='text-md'>Ingredients Used: {videoData.ingredients}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <img src={img} alt="Author" className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-medium text-gray-900">Vishnu</p>
              <p className="text-sm text-gray-500">10K subscribers</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button onClick={handleLike} className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
              <ThumbsUp className="w-5 h-5" />
              <span>{videoData.likes?.length || 0}</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;