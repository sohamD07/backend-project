import mongoose from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!channelId?.trim()) {
        throw new ApiError(400, "channelId is required");
    }

    const user = req.user;
    const subscription = await Subscription.find({
        channel: new mongoose.Types.ObjectId(channelId),
        subscriber: user?._id
    });

    if (!subscription?.length) {
        const updatedSubscription = await Subscription.create({
            channel: new mongoose.Types.ObjectId(channelId),
            subscriber: user?._id
        });
        if (!updatedSubscription) {
            throw new ApiError(500, "Something went wrong while subscribing channel");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedSubscription,
                    "Channel subscribed successfully"
                )
            )
    } else {
        const updatedSubscription = await Subscription.findByIdAndDelete(subscription[0]?._id);
        console.log(subscription);
        console.log(updatedSubscription);
        
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Channel unsubscribed successfully"
                )
            )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId?.trim()) {
        throw new ApiError(400, "channelId is required");
    }

    const subscription = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                subscriber_id: {
                    $first: "$subscribers._id"
                },
                subscriber_name : {
                    $first: "$subscribers.username"
                }
            }
        },
        {
            $project: {
                subscriber_id: 1,
                subscriber_name : 1
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscription,
                "Subscriber fetched successfully"
            )
        )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId?.trim()) {
        throw new ApiError(400, "subscriberId is required");
    }

    const subscription = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels"
            }
        },
        {
            $addFields: {
                channel_id: {
                    $first: "$channels._id"
                },
                channel_name: {
                    $first: "$channels.username"
                },
            }
        },
        {
            $project: {
                channel_id: 1,
                channel_name :1
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscription,
                "Channel subscribed by user fetched successfully"
            )
        )

})

export {
    getSubscribedChannels, getUserChannelSubscribers, toggleSubscription
}
