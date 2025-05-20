import express from 'express';
import { checkAuth, login, signup, updateProfile } from '../controllers/user.controller.js';
import protectRoute from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post('/signup', signup); // removed protectRoute
userRouter.post('/login', login);   // removed protectRoute
userRouter.put('/update-profile', protectRoute, upload.single("profilePic"), updateProfile);
userRouter.get('/check', protectRoute, checkAuth);

export default userRouter;