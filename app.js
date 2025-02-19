/* Updated app.js */
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const authRoutes = require("./Routes/AuthenticationRoutes");
const hompageRoutes = require("./Routes/HomePageRoute");
const profileRoute = require("./Routes/UserRoutes");
const postRoute = require("./Routes/PostRoutes")
const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  "http://192.168.101.8:8081",
  "http://192.168.101.8",
  "http://100.64.204.241:8081",
  "http://localhost:8081", // Allow localhost for debugging
  "http://192.168.101.8:3001", // Ensure React Native Expo is allowed
  "http://100.64.204.241:3001",
];

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Routes
app.use("/api/v1", authRoutes);
app.use("/api/v1", hompageRoutes);
app.use("/api/v1", profileRoute);
app.use("/api/v1", postRoute);

module.exports = app;
