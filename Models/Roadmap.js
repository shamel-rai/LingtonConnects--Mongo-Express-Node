const mongoose = require("mongoose");

// A topic in a section
const TopicSchema = new mongoose.Schema({
    title: { type: String, required: true },
}, { _id: false });

// A section in a roadmap
const SectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    topics: {
        type: [TopicSchema],
        default: [],
    },
}, { _id: false });

// Roadmap schema
const RoadmapSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    section: {
        type: [SectionSchema],
        default: [],
    },
}, { timestamps: true });

module.exports = mongoose.model("Roadmap", RoadmapSchema);
