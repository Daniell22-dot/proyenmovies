const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/authRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// --- Infrastructure: Rate Limiting ---

// Global API Limiter: 100 requests per 15 mins
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true, 
  legacyHeaders: false,
});

// Strict Auth Limiter: 10 attempts per 15 mins
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts, please wait 15 minutes.' }
});

// --- Middleware ---
app.use(globalLimiter);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 }, // Increased to 100MB for movies
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Static files
app.use('/uploads', express.static('uploads'));

// --- API Versioning (v1) ---
const apiV1 = express.Router();

apiV1.use('/auth', authLimiter, authRoutes);
apiV1.use('/media', mediaRoutes);
apiV1.use('/purchases', purchaseRoutes);
apiV1.use('/dashboard', dashboardRoutes);
apiV1.use('/subscriptions', subscriptionRoutes);
apiV1.use('/recommendations', recommendationRoutes);

// Apply v1 router
app.use('/api/v1', apiV1);

// Health check (v1 and global)
const healthCheck = (req, res) => {
  res.json({ status: 'ok', version: 'v1.0.0', timestamp: new Date() });
};
app.get('/api/health', healthCheck);
apiV1.get('/health', healthCheck);

// --- Socket.io connection logic ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-live', (movieId) => {
    socket.join(`movie-${movieId}`);
    const count = io.sockets.adapter.rooms.get(`movie-${movieId}`)?.size || 0;
    io.to(`movie-${movieId}`).emit('viewer-count', count);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`ProyenMovies API v1 running on http://localhost:${PORT}`);
  console.log(`Endpoints available at http://localhost:${PORT}/api/v1`);
});