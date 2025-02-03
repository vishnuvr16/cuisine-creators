import { Router } from "express";
import {
    createBlog,
    getAllBlogs,
    getFeaturedBlogs,
    toggleBlogLike,
    saveBlog,
    incrementBlogViews,
    getBlog
} from "../controllers/blogController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllBlogs);
router.route("/featured").get(getFeaturedBlogs);
router.route("/:id").get(getBlog);
router.route("/:blogId/views").post(incrementBlogViews);

// Protected routes
router.route("/create").post(
    verifyJWT,
    createBlog
);
router.route("/:blogId/toggle-like").post(verifyJWT, toggleBlogLike);
router.route("/:blogId/save").post(verifyJWT, saveBlog);

export default router;