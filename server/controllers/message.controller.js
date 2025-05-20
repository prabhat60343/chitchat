import User from '../model/User.model.js';
import Message from '../model/Message.model.js';
import uploadOnCloudinary from '../lib/cloudinary.js';
import { io, userSocketMap } from '../server.js';



//get all users expect the logged in user
const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } })
            .select("-password");

        //count unseen messages
        const unseenMessages = {}
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({ senderId: user._id, receiverId: userId, seen: false })
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length
            }
        })
        await Promise.all(promises)
        res.status(200).json({ success: true, users: filteredUsers, unseenMessages });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// get all messages between two users
const getMessage = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [{ senderId: myId, receiverId: selectedUserId }, { senderId: selectedUserId, receiverId: myId }]
        })
        await Message.updateMany({ senderId: selectedUserId, receiverId: myId }, { seen: true });
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });

    }
}

// mark message as seen
const markMessageSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true });
        res.status(200).json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Send message to selected user
const sendMessage = async (req, res) => {
    try {

        const senderId = req.user._id;
        const receiverId = req.params.id;
        let text = req.body.text || req.body.message || "";
        let imageUrl = "";

        // Handle image upload from multipart/form-data (req.file) or base64 (req.body.image)
        if (req.file) {
            const uploadResponse = await uploadOnCloudinary(req.file.path);
            imageUrl = uploadResponse?.secure_url || "";
        } else if (req.body.image) {
            const uploadResponse = await uploadOnCloudinary(req.body.image);
            imageUrl = uploadResponse?.secure_url || "";
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        const receiverSocketId = userSocketMap?.[receiverId];
        if (receiverSocketId && typeof io !== "undefined") {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.status(200).json({ success: true, newMessage });
    } catch (error) {
        console.log("Send Message Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}




export { getUsersForSidebar, getMessage, markMessageSeen, sendMessage };
