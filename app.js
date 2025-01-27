/* Updated app.js */
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const authRoutes = require("./Routes/AuthenticationRoutes");
const hompageRoutes = require("./Routes/HomePageRoute");

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  "http://192.168.101.5:8081",
  "http://192.168.101.5",
  "http://100.64.204.241:8081",
];

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Routes
app.use("/api/v1", authRoutes);
app.use("/api/v1", hompageRoutes);

module.exports = app;
