const Roadmap = require("../models/Roadmap");

// (Optional) Create a new roadmap via POST
exports.createRoadmap = async (req, res) => {
    try {
        const { title, description, section } = req.body;
        const roadmap = new Roadmap({ title, description, section });
        await roadmap.save();
        return res.status(201).json(roadmap);
    } catch (error) {
        console.error("Error creating roadmap:", error);
        return res.status(500).json({ message: "Server error while creating the roadmap" });
    }
};

// GET all roadmaps
exports.getAllRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find();
        return res.status(200).json(roadmaps);
    } catch (error) {
        console.error("Error fetching roadmaps:", error);
        return res.status(500).json({ error: "Server error while fetching roadmaps" });
    }
};

// GET one roadmap by _id
exports.getRoadmapByID = async (req, res) => {
    try {
        const { id } = req.params; // Mongoose default _id
        const roadmap = await Roadmap.findById(id);
        if (!roadmap) {
            return res.status(404).json({ error: "Roadmap not found" });
        }
        return res.status(200).json(roadmap);
    } catch (error) {
        console.error("Error fetching roadmap:", error);
        return res.status(500).json({ error: "Server error while fetching the roadmap" });
    }
};
