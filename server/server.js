const express = require("express"); // Server entry point - Reload Triggered
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const path = require("path");

// --- Security Imports ---
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const hpp = require("hpp");
const mongoSanitize = require("mongo-sanitize");

dotenv.config();

// Routes
const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const bannerRoutes = require("./routes/banners");

const app = express();
const PORT = process.env.PORT || 5000;

// --- Enterprise Security Headers ---
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: [
//           "'self'",
//           "'unsafe-inline'",
//           "'unsafe-eval'", // often needed for ads
//           "https://pagead2.googlesyndication.com",
//           "https://www.google-analytics.com",
//           "https://pl28421962.effectivegatecpm.com",
//           "https://tpc.googlesyndication.com",
//           "https://www.highperformanceformat.com", // New from user image
//           "https://preferencenail.com", // New from user image
//         ],
//         styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
//         fontSrc: ["'self'", "https://fonts.gstatic.com"],
//         imgSrc: ["'self'", "data:", "https:", "http:"], // Allow external images for dynamic content
//         frameSrc: [
//           "'self'",
//           "https://www.youtube.com",
//           "https://googleads.g.doubleclick.net",
//           "https://tpc.googlesyndication.com",
//           "https://www.highperformanceformat.com", // New
//         ],
//         connectSrc: [
//           "'self'",
//           "https://pagead2.googlesyndication.com",
//           "https://realizationnewestfangs.com",
//           "https://ep1.adtrafficquality.google",
//           "https://wayfarerorthodox.com", // New ad domain
//         ],
//         objectSrc: ["'none'"],
//         upgradeInsecureRequests: [],
//       },
//     },
//     // Disable cross-origin-embedder-policy to allow external ads/images if causing issues,
//     // but enabling it is more secure. For ads, we often need to relax it.
//     crossOriginEmbedderPolicy: false,
//   })
// );

// DDoS / Brute Force Prevention
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

const authLimiter = rateLimit({
  max: 10,
  windowMs: 15 * 60 * 1000,
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

// Payload & Cookie Parsing
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Sanitization
app.use((req, res, next) => {
  req.body = mongoSanitize(req.body);
  req.query = mongoSanitize(req.query);
  req.params = mongoSanitize(req.params);
  next();
});

app.use(xss());

app.use(
  hpp({
    whitelist: ["category", "sub_category", "date"],
  })
);

// Gzip
app.use(compression());

// Strict CORS
app.use(
  cors({
    origin: "https://govtlinks.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400,
  })
);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/api/ping", (req, res) => {
  res.send("API is running...");
});

require("./ping.js");
app.use("/api/banners", bannerRoutes);
app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Secure Error Handler (No stack traces in production)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log internally
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { error: err.message }), // Hide error in prod
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(path.join(__dirname, "../client/dist"), {
      maxAge: "7d",
      immutable: true,
    })
  );

  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
