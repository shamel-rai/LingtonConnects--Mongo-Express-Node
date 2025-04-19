const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    locations: {
        type: String
    },
    type: {
        type: String
    },
    salary: {
        type: String
    },
    posted: {
        type: String
    },
    description: {
        type: String
    },
    responsibilities: [{
        type: String
    }],
    requirements: [{
        type: String
    }],
    benefits: [{
        type: String
    }],

    email: {
        type: String
    },
    saved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;