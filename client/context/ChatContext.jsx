import { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios, authUser } = useContext(AuthContext);

    // Fetch all users
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/message/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error("Failed to load users. Please try again.");
        }
    };

    // Fetch messages for selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/message/${userId}`);
            if (data.success) {
                setMessages(data.messages); // ✅ fix here
            }
        } catch (error) {
            toast.error("Failed to load messages. Please try again.");
        }
    };

    // Send message with optimistic UI
    const sendMessage = async (messageData) => {
        if (!selectedUser || !authUser) {
            toast.error("No user selected.");
            return;
        }

        const tempMessage = {
            ...messageData,
            senderId: authUser._id,               // ✅ fixed
            receiverId: selectedUser._id,         // ✅ added
            createdAt: new Date().toISOString(),
            seen: true,
            _id: Math.random().toString(36).substr(2, 9),
        };

        setMessages(prev => [...prev, tempMessage]);

        try {
            const { data } = await axios.post(`/api/message/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages(prev =>
                    prev.map(msg => (msg._id === tempMessage._id ? data.newMessage : msg))
                );
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to send message. Please try again.");
            setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        }
    };

    // Real-time updates
    const subscribeToMessages = () => {
        if (!socket || !authUser) return;

        socket.on("newMessage", (newMessage) => {
            const isRelatedToChat =
                selectedUser &&
                (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id);

            if (isRelatedToChat) {
                setMessages(prev => [...prev, newMessage]);
                axios.put(`/api/message/mark/${newMessage._id}`);
            } else {
                setUnseenMessages(prev => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
                }));
            }
        });
    };

    const unsubscribeFromMessages = () => {
        if (socket) socket.off("newMessage");
    };

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser]);

    const value = {
        messages,
        users,
        selectedUser,
        getMessages,
        getUsers,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export { ChatContext, ChatProvider };
