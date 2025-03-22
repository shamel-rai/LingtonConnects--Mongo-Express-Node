const express = require("express");
const router = express.Router();
const { createRoadmap, getAllRoadmaps, getRoadmapByID } = require("../Controller/RoadmapController");
const { auth } = require("../Middleware/Authentication")

// Optional POST route for manually adding new roadmaps via API
router.route("/roadmaps").post(auth, createRoadmap)

// GET all roadmaps
router.route("/roadmaps/all").get(auth, getAllRoadmaps)

// GET one roadmap by Mongo _id
router.route("/roadmaps/:id").get(auth, getRoadmapByID)

module.exports = router;
