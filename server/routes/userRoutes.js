import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    updateProfile,
    getUserProfile,
    getUser
} from "../controllers/userController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/register").post(
    registerUser
);

router.route("/login").post(loginUser);
router.route("/:id").get(getUser)
// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/profile").get(verifyJWT, getUserProfile);
router.route("/update-profile").patch(
    verifyJWT,
    updateProfile
);

export default router;