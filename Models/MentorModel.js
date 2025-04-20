// models/MentorModel.js
const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    expertise: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    availability: {
        type: String
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isMentor: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("Mentor", mentorSchema);
