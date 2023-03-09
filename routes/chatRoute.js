import express from "express";
import { createChat, userChats, findChat } from "../controllers/chatController.js";
import checkUserAuth from "../middlewares/auth-middlewares.js";

const router = express.Router();

// router.use("/", checkUserAuth);
// router.use("/:userId", checkUserAuth);
// router.use("/find/:firstId/:secondId", checkUserAuth);

router.post("/", createChat);
router.get("/:userId", userChats)
router.get("/find/:firstId/:secondId", findChat)

export default router;