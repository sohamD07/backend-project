import mongoose from "mongoose"
import { Like } from "../models/like.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Video } from "../models/video.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const videosResult = await Video.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $group : {
                _id : null,
                totalViews : {
                    $sum : "$views"
                }
            }
        }
    ]);
    const totalViews = videosResult[0]?.totalViews || 0;

    const subscriptionResult = await Subscription.aggregate([
        {
            $match : {
                channel : new mongoose.Types.ObjectId(req.user?._id)
            }
        }
    ]);
    const totalSubscriptions = subscriptionResult?.length || 0;

    const videoCountResult = await Video.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(req.user?._id)
            }
        }
    ]);
    const totalVideos = videoCountResult?.length || 0;

    const likeResult = await Like.aggregate([
        {
            $match : {
                likedBy : new mongoose.Types.ObjectId(req.user?._id),
                video : {
                    $ne : null
                }
            }
        }
    ]);
    const totalLikes = likeResult?.length || 0;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                "total_view" : totalViews,
                "total_videos" : totalVideos,
                "total_subscriptions" : totalSubscriptions,
                "total_likes" : totalLikes
            },
            "Dashboard stats fetched successfully"
        )
    );

}) 

const getChannelVideos = asyncHandler(async (req, res) => {
    const user = req.user;
    const { page = 1, limit = 10 } = req.query
    const aggregate = Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(user?._id)
            }
        }
    ]);

    const videos = await Video.aggregatePaginate(aggregate, {
        page: Number(page),
        limit: Number(limit)
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Videos fetched successfully"
        )
    );
})

export {
    getChannelStats,
    getChannelVideos
}
