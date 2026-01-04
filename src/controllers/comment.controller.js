import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    const aggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        }
    ]);

    const comments = await Comment.aggregatePaginate(aggregate, {
        page: Number(page),
        limit: Number(limit)
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            comments,
            "Comments fetched successfully"
        )
    );
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const user = req.user;
    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }
    const comment = await Comment.create({
        video: new mongoose.Types.ObjectId(videoId),
        content,
        owner: new mongoose.Types.ObjectId(user),
    })
    if (!comment) {
        throw new ApiError(500, "Failed to add comment");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "Comments added successfully"
        )
    );
})

const updateComment = asyncHandler(async (req, res) => {
    const {content} = req.body;
    const {commentId} = req.params;

    if(!content){
        throw new ApiError(400, "Comment content is required");
    }
    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        },
        {
            new : true
        }
    )
    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "Comments updated successfully"
        )
    );
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const comment = await Comment.findByIdAndDelete(commentId);
    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Comments deleted successfully"
        )
    );
})

export {
    addComment, deleteComment, getVideoComments, updateComment
};

