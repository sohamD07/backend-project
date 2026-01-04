import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = -1, userId } = req.query
    const ALLOWED_SORT_FIELDS = ["createdAt", "duration", "views"];

    const sortField = ALLOWED_SORT_FIELDS.includes(sortBy)
        ? sortBy
        : "createdAt";

    const sortOrder = Number(sortType) === 1 ? 1 : -1;

    // 🔎 Build match stage dynamically
    const matchStage = {
        isPublished: true
    };

    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if (userId) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    // 🧠 Aggregation pipeline
    const aggregate = Video.aggregate([
        { $match: matchStage },
        { $sort: { [sortField]: sortOrder } }
    ]);

    // 📄 Pagination
    const result = await Video.aggregatePaginate(aggregate, {
        page: Number(page),
        limit: Number(limit)
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Videos fetched successfully"
        )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if (!title || !description) {
        throw new ApiError(400, "All fields are required");
    }
    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required");
    }
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    console.log(videoFile);
    if (!videoFile) {
        throw new ApiError(400, "Failed to upload video file to cloudinary");
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
        throw new ApiError(400, "Failed to upload thumbnail file to cloudinary");
    }
    const video = await Video.create({
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
        title,
        description,
        duration: videoFile?.duration,
        owner: new mongoose.Types.ObjectId(req.user?._id)
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video published successfully"
            )
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "videoId is required");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "Video not exists");
    }
    video.views++;
    video.save();
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video details fetched successfully"
            )
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    //TODO: update video details like title, description, thumbnail
    if (!videoId) {
        throw new ApiError(400, "videoId is required");
    }
    const thumbnailLocalPath = req.file?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail file is required");
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
        throw new ApiError(400, "Failed to upload image to cloudinary");
    }
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail?.url,
                title,
                description
            }
        },
        {
            new: true
        }
    )
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video thumbnail updated successfully"
            )
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "videoId is required");
    }
    const video = await Video.findByIdAndDelete(videoId);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Video deleted successfully"
            )
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "videoId is required");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save();
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video updated successfully"
            )
        )
})

export {
    deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo
}
