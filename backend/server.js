const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const profileRoutes = require("./routes/profileRoutes");

dotenv.config();

const app = express();
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// CORS - allow frontend origin (configure via env)
const FRONTEND_ORIGIN = [
  process.env.FRONTEND_ORIGIN,
  "https://me-api-coral.vercel.app",
];
app.use(cors({
  origin: FRONTEND_ORIGIN,   
  methods: "GET,POST,PUT,DELETE",             
  credentials: true                           
}));


// Basic rate limit
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

// Health
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

// API routes
app.use("/", profileRoutes);

// Start
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI not set in .env");
  process.exit(1);
}
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // exit if DB fails
  });

