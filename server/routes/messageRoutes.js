import express from 'express';
import { getMessage, getUsersForSidebar, markMessageSeen, sendMessage } from '../controllers/message.controller.js';
import protectRoute from '../middleware/auth.js';
import { upload } from "../middleware/multer.js";



const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);

messageRouter.get("/:id", protectRoute, getMessage);

messageRouter.put("/mark/:id", markMessageSeen);


messageRouter.post("/send/:id", protectRoute, upload.single("image"), sendMessage)

export default messageRouter;