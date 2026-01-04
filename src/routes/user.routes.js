import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh_token").post(refreshAccessToken);
router.route("/change_password").post(verifyJWT, changeCurrentPassword);
router.route("/update_account_details").post(verifyJWT, updateAccountDetails);
router.route("/update_user_avatar").post(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
);
router.route("/update_user_cover_image").post(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage);
router.route("/get_current_user").get(verifyJWT, getCurrentUser);
router.route("/get_user_channel_profile").get(verifyJWT, getUserChannelProfile);
router.route("/get_watch_history").get(verifyJWT, getWatchHistory);

export default router;