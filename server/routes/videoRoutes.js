import { Router } from "express";
import {
    getAllVideos,
    getTrendingVideos,
    uploadVideo,
    toggleVideoLike,
    incrementViews,
    getRelatedVideos,
    getVideo,
    deleteVideo
} from "../controllers/videoController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllVideos);
router.route("/trending").get(getTrendingVideos);
router.route("/:id/related").get(getRelatedVideos);
router.route("/:videoId/views").post(incrementViews);

// Protected routes
router.route("/upload").post(
    verifyJWT,
    uploadVideo
);

router.route("/:id").get(getVideo);
router.route("/:videoId").delete(deleteVideo);

router.route("/:videoId/toggle-like").post(verifyJWT, toggleVideoLike);

export default router;