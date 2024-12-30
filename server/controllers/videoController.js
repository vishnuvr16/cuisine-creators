import { Video } from "../models/Video.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getAllVideos = async (req, res) => {
    try {
        const { page = 1, limit = 10, category } = req.query;
        const query = category ? { category } : {};

        const videos = await Video.find(query)
            .populate("author", "username avatar")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Video.countDocuments(query);

        return res.status(200).json(
            new ApiResponse(200, {
                videos,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            })
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const getTrendingVideos = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const videos = await Video.aggregate([
            {
                $addFields: {
                    score: {
                    $add: [
                        { $multiply: [{ $size: "$likes" }, 2] },
                        "$views",
                        {
                        $divide: [
                            1,
                            {
                            $add: [
                                1,
                                {
                                $divide: [
                                    { $subtract: [new Date(), "$createdAt"] },
                                    1000 * 60 * 60 * 24
                                ]
                                }
                            ]
                            }
                        ]
                        }
                    ]
                    }
                }
            },
            { $sort: { score: -1 } },
            { $limit: parseInt(limit) }
        ]);

        return res.status(200).json(
            new ApiResponse(200, videos, "Trending videos fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const uploadVideo = async (req, res) => {
    try {
        const { title, description, category, ingredients,videoUrl,thumbnailUrl } = req.body;

        if (!title || !description || !category || !ingredients || !videoUrl) {
            throw new ApiError(400, "All fields are required");
        }

        // Convert ingredients string to array of objects
        const ingredientsArray = ingredients.split(',').map(ingredient => ({
            name: ingredient.trim(),
            quantity: '',
            unit: ''
        }));

        const newVideo = await Video.create({
            title,
            description,
            category,
            ingredients: ingredientsArray,
            video:videoUrl,
            thumbnail:thumbnailUrl,
            author: req.user._id
        });

        return res.status(201).json(
            new ApiResponse(201, newVideo, "Video uploaded successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const toggleVideoLike = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.user._id;

        const video = await Video.findById(videoId);

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        const isLiked = video.likes.includes(userId);
        const isDisliked = video.dislikes.includes(userId);

        if (isLiked) {
            video.likes.pull(userId);
        } else {
            video.likes.push(userId);
            if (isDisliked) {
                video.dislikes.pull(userId);
            }
        }

        await video.save();

        return res.status(200).json(
            new ApiResponse(200, video, "Video like toggled successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const incrementViews = async (req, res) => {
    try {
        const { videoId } = req.params;

        const video = await Video.findByIdAndUpdate(
            videoId,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        return res.status(200).json(
            new ApiResponse(200, video, "Video views incremented successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const getRelatedVideos = async (req, res) => {
    try {
        const { id } = req.params;
        const video = await Video.findById(id);

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        const relatedVideos = await Video.find({
            _id: { $ne: id },
            $or: [
                { category: video.category },
                { ingredients: { $in: video.ingredients } }
            ]
        })
        .limit(10)
        .populate("owner", "username avatar");

        return res.status(200).json(
            new ApiResponse(200, relatedVideos, "Related videos fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const getVideo = async (req, res) => {
    try {
      const video = await Video.findById(req.params.id)
        .populate('author', 'name avatar')
        .populate('likes', 'name avatar');
  
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
  
      res.json(video);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

export const deleteVideo = async (req, res) => {
    try {
      const video = await Video.findById(req.params.id);
  
      // Check if video exists
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
  
      // Check if user is the author
      if (video.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to delete this video' });
      }
  
      await video.remove();
      res.json({ message: 'Video deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
