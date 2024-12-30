import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

export const registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if ( !email || !username || !password || !avatarLocalPath) {
            throw new ApiError(400, "All fields are required");
        }

        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            throw new ApiError(409, "User with email or username already exists");
        }

        const user = await User.create({
            email,
            password,
            username: username.toLowerCase()
        });

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            throw new ApiError(400, "username or email is required");
        }

        const user = await User.findOne({
           email
        });

        if (!user) {
            throw new ApiError(404, "User does not exist");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200, 
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken
                    },
                    "User logged in successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new: true
            }
        );

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out"));
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            throw new ApiError(400, "At least one field is required");
        }

        const user = await User.findById(req.user?._id);
        
        if (username) {
            user.username = username;
        }

        await user.save();

        return res
            .status(200)
            .json(new ApiResponse(200, user, "Profile updated successfully"));
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password -refreshToken");

        return res
            .status(200)
            .json(new ApiResponse(200, user, "User profile fetched successfully"));
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user?._id)
            .select("-password -refreshToken");

        return res
            .status(200)
            .json(new ApiResponse(200, user, "User profile fetched successfully"));
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error");
    }
};