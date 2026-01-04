import mongoose from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const like = await Like.aggregate([
        {
            $match: {
                video: videoId
            }
        }
    ])
    if (!like?.length) {
        const newLike = await Like.create({
            likedBy: new mongoose.Types.ObjectId(req.user?._id),
            video: new mongoose.Types.ObjectId(videoId),
        });
        return res.status(200).json(
            new ApiResponse(
                200,
                newLike,
                "Like added successfully"
            )
        );
    } else {
        const updatedLike = await Like.findByIdAndDelete(like[0]?._id);
        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Like removed successfully"
            )
        );
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const like = await Like.aggregate([
        {
            $match: {
                comment: commentId
            }
        }
    ])
    if (!like?.length) {
        const newLike = await Like.create({
            likedBy: new mongoose.Types.ObjectId(req.user?._id),
            comment: new mongoose.Types.ObjectId(commentId),
        });
        return res.status(200).json(
            new ApiResponse(
                200,
                newLike,
                "Like added successfully"
            )
        );
    } else {
        const updatedLike = await Like.findByIdAndDelete(like[0]?._id);
        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Like removed successfully"
            )
        );
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const like = await Like.aggregate([
        {
            $match: {
                tweet: tweetId
            }
        }
    ])
    if (!like?.length) {
        const newLike = await Like.create({
            likedBy: new mongoose.Types.ObjectId(req.user?._id),
            tweet: new mongoose.Types.ObjectId(tweetId),
        });
        return res.status(200).json(
            new ApiResponse(
                200,
                newLike,
                "Like added successfully"
            )
        );
    } else {
        const updatedLike = await Like.findByIdAndDelete(like[0]?._id);
        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Like removed successfully"
            )
        );
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const user = req.user;
    const videos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            description: 1,
                            thumbnail: 1,
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$video"
        },
        {
            $replaceRoot: {
                newRoot: "$video"
            }
        }
    ])
    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Videos fetched successfully"
        )
    );
})

export {
    getLikedVideos, toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike
}
