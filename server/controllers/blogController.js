import { Blog } from "../models/Blog.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createBlog = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            prepTime,
            cookingTime,
            ingredients,
            image,
            servings,
            instructions,
            nutrition
        } = req.body;


        if (!title || !description || !category) {
            throw new ApiError(400, "Required fields are missing");
        }

         // Validate that ingredients and instructions are arrays
        if (!Array.isArray(ingredients) || !Array.isArray(instructions)) {
            return res.status(400).json({ error: 'Ingredients and instructions must be arrays' });
        }
  
        // Validate numerical fields are numbers
        if (isNaN(prepTime) || isNaN(cookTime) || isNaN(servings)) {
            return res.status(400).json({ error: 'Prep time, cook time, and servings must be valid numbers' });
        }

        const blog = await Blog.create({
            title,
            description,
            image,
            category,
            prepTime,
            cookingTime,
            servings: Number(servings),
            ingredients: JSON.parse(ingredients),
            instructions: JSON.parse(instructions),
            nutrition: JSON.parse(nutrition),
            author: req.user._id
        });

        return res.status(201).json(
            new ApiResponse(201, blog, "Blog created successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, category } = req.query;
        const query = category ? { category } : {};

        const blogs = await Blog.find(query)
            .populate("author", "username avatar")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Blog.countDocuments(query);

        return res.status(200).json(
            new ApiResponse(200, {
                blogs,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            })
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const getFeaturedBlogs = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const blogs = await Blog.aggregate([
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
            new ApiResponse(200, blogs, "Featured blogs fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const toggleBlogLike = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.user._id;

        const blog = await Blog.findById(blogId);

        if (!blog) {
            throw new ApiError(404, "Blog not found");
        }

        const isLiked = blog.likes.includes(userId);
        const isDisliked = blog.dislikes.includes(userId);

        if (isLiked) {
            blog.likes.pull(userId);
        } else {
            blog.likes.push(userId);
            if (isDisliked) {
                blog.dislikes.pull(userId);
            }
        }

        await blog.save();

        return res.status(200).json(
            new ApiResponse(200, blog, "Blog like toggled successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const saveBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.user._id;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            throw new ApiError(404, "Blog not found");
        }

        const user = await User.findById(userId);
        const isSaved = user.savedBlogs.includes(blogId);

        if (isSaved) {
            user.savedBlogs.pull(blogId);
        } else {
            user.savedBlogs.push(blogId);
        }

        await user.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                { saved: !isSaved },
                `Blog ${!isSaved ? 'saved' : 'unsaved'} successfully`
            )
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const getBlog = async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id)
        .populate('author', 'username avatar')
        .populate('comments.user', 'name avatar');
  
      if (!blog) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
  
      res.json(blog);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
  
export const updateBlog = async (req, res) => {
    try {
      const { 
        title, 
        description, 
        ingredients, 
        cookingSteps, 
        duration, 
        content, 
        coverImage 
      } = req.body;
  
      // Find blog and check ownership
      const blog = await Blog.findById(req.params.id);
      
      if (!blog) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
  
      // Check if the user is the author
      if (blog.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to update this blog post' });
      }
  
      // Update the blog post
      const updatedBlog = await BlogRecipe.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          ingredients,
          cookingSteps,
          duration,
          content,
          image:coverImage
        },
        { new: true } // Return the updated document
      ).populate('author', 'name avatar');
  
      res.json(updatedBlog);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
  
export const deleteBlog = async (req, res) => {
    try {
      // Find blog and check ownership
      const blog = await Blog.findById(req.params.id);
      
      if (!blog) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
  
      // Check if the user is the author
      if (blog.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to delete this blog post' });
      }
  
      // Delete the blog post
      await Blog.findByIdAndDelete(req.params.id);
  
      res.json({ message: 'Blog post deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

export const incrementBlogViews = async (req, res) => {
    try {
        const { blogId } = req.params;

        const blog = await Blog.findByIdAndUpdate(
            blogId,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!blog) {
            throw new ApiError(404, "Blog not found");
        }

        return res.status(200).json(
            new ApiResponse(200, blog, "Blog views incremented successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};