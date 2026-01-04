import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/get_channels/:subscriberId").get(getSubscribedChannels)
router.route("/toggle_channel/:channelId").post(toggleSubscription);

router.route("/get_subscribers/:channelId").get(getUserChannelSubscribers);

export default router