import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Increase JSON and URL-encoded payload size limits to prevent PayloadTooLargeError
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors());

app.use('/api/status', (req, res) => res.send('Server is running'));
app.use('/api/user', userRouter);
app.use('/api/message', messageRouter);

connectDB();

const io = new Server(server, { cors: { origin: '*' } });
const userSocketMap = {};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log('✅ User connected:', userId);

  if (userId) userSocketMap[userId] = socket.id;
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', userId);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export { io, userSocketMap };
