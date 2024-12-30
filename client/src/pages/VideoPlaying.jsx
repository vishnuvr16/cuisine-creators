import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, Maximize, ThumbsUp, ThumbsDown , ThumbsUpIcon } from 'lucide-react';
import { format } from "timeago.js";
import { useSelector } from 'react-redux';
import SummaryApi from '../common';

const VideoPlayer = () => {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [author, setAuthor] = useState(null);
  const {user} = useSelector(state=>state.auth);

  const videoRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        
        // Fetch video data
        const response = await fetch(`${SummaryApi.defaultUrl}/api/videos/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch video');
        const data = await response.json();
        setVideoData(data);
        setIsLiked(data.likes.includes(user._id));

        // Increment views
        await fetch(`${SummaryApi.defaultUrl}/api/videos/${id}/views`, {
          method: 'POST',
          credentials: 'include'
        });

        // Fetch author details
        const authorResponse = await fetch(`${SummaryApi.defaultUrl}/api/users/${data.author._id}`, {
          method: "get",
          credentials: 'include'
        });
        
        if (authorResponse.ok) {
          const authorData = await authorResponse.json();
          setAuthor(authorData.data);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [id]);

  const handleLike = async () => {
    try {
      const response = await fetch(`${SummaryApi.defaultUrl}/api/videos/${id}/toggle-like`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const updatedVideo = await response.json();
        setVideoData(updatedVideo.data);
        setIsLiked(!isLiked);
      }
    } catch (err) {
      console.error('Error liking video:', err);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

  const toggleMute = () => {
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
  };

  const handleProgressBarClick = (e) => {
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  if (loading) return <div className="pt-16 text-center">Loading...</div>;
  if (error) return <div className="pt-16 text-center text-red-500">{error}</div>;
  if (!videoData) return <div className="pt-16 text-center">Video not found</div>;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-black rounded-lg overflow-hidden">
          <div className="relative aspect-video">
            <video
              ref={videoRef}
              src={videoData.videoUrl}
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => setDuration(videoRef.current.duration)}
            />

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <button onClick={togglePlay}>
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                    </button>
                    <button onClick={toggleMute}>
                      {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <span className="text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  <button onClick={toggleFullscreen}>
                    <Maximize className="w-6 h-6" />
                  </button>
                </div>
                
                <div 
                  ref={progressBarRef}
                  className="w-full bg-gray-600 h-1 rounded-full cursor-pointer"
                  onClick={handleProgressBarClick}
                >
                  <div 
                    className="bg-orange-500 h-full rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="mt-6">
          <h1 className="text-2xl font-bold">{videoData.title}</h1>
          <p className="mt-2 text-gray-600">{videoData.description}</p>
          
          <div className="flex items-center justify-between mt-4">
            {author && (
              <div className="flex items-center space-x-4">
                <img src={author.avatar} alt={author.fullName} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-medium">{author.fullName}</p>
                  <p className="text-sm text-gray-500">{format(videoData.createdAt)}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
            <button 
          onClick={handleLike}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            isLiked ? 'bg-orange-100' : 'bg-gray-100'
          }`}
        >
          {isLiked ? (
            <ThumbsUpIcon className="w-5 h-5 text-orange-500" />
          ) : (
            <ThumbsUp className="w-5 h-5" />
          )}
          <span>{videoData.likes?.length || 0}</span>
        </button>
              <div className="text-sm text-gray-500">
                {videoData.views} views
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-medium mb-2">Ingredients:</h3>
            <p>{videoData.ingredients.join(', ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;