import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Set Axios Base URL
const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

// Create Context
const AuthContext = createContext();

// AuthProvider Component
const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Function to Check Authentication
    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/user/check");
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                logout();
            }
            toast.error(error.response?.data?.message || "Authentication failed.");
        }
    };

    // Function to handle Login
    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/user/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.userData);
                setToken(data.token);
                localStorage.setItem("token", data.token);
                axios.defaults.headers.common["Authorization"] = "Bearer " + data.token;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed.");
        }
    };

    // Function to handle Logout
    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        delete axios.defaults.headers.common["Authorization"];
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
        toast.success("Logged out successfully");
    };

    // Function to update Profile
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/user/update-profile", body);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Profile update failed.");
        }
    };

    // Function to connect Socket
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;

        const newSocket = io(backendUrl, {
            query: { userId: userData._id }
        });

        setSocket(newSocket);

        // Update online users list
        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });
    };

    // useEffect to handle authentication and socket connection
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = "Bearer " + token;
            checkAuth();
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [token]);

    // Value to be shared in context
    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        setToken,
        setAuthUser
    };

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>;
};

export { AuthProvider, AuthContext };
