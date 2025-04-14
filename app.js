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
const roadmapRoutes = require("./Routes/RoadmapRoutes");
const messageRoutes = require("./Routes/MessageRoutes");
const studyBuddyRoutes = require("./Routes/StudyBuddyRoutes");
const notificationRoutes = require("./Routes/NotificationRoutes");
const khaltiRoutes = require('./Routes/KhaltiRoutes')
const app = express();


const allowedOrigins = [
  "http://192.168.101.6:8081",
  "http://192.168.101.6",
  "http://100.64.204.241:8081",
  "http://localhost:8081",
  "http://192.168.101.6:3001",
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

// Register your routes
app.use("/api/v1", authRoutes);
app.use("/api/v1", hompageRoutes);
app.use("/api/v1/users", profileRoute);
app.use("/api/v1", postRoute);
app.use("/api/v1", roadmapRoutes);
app.use("/api/v1", messageRoutes);
app.use("/api/v1", studyBuddyRoutes);
app.use("/api/v1", notificationRoutes);
app.use("/api/v1", khaltiRoutes);

module.exports = app;
