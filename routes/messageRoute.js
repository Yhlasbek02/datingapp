import express from "express";
import checkUserAuth from "../middlewares/auth-middlewares.js";
import { addMessage, getMessages } from "../controllers/messageController.js";

const router = express.Router();

// router.use('/', checkUserAuth);
// router.use('/:chatId', checkUserAuth);
router.post('/', addMessage);
router.get('/:chatId', getMessages);

export default router;
