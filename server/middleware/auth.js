import User from "../model/User.model.js";
import jwt from 'jsonwebtoken';

const protectRoute = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }
        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        // Use 'decoded.userId' only if that's your payload field
        const user = await User.findById(decoded.userId || decoded._id).select("-password");
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized user" });
        }

        // Attach user to request object
        req.user = user;
        req.userId = user._id;
        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        return res.status(401).json({
            success: false,
            message: error.message.includes("jwt expired")
                ? "Token expired"
                : "Invalid or expired token"
        });
    }
};

export default protectRoute;
