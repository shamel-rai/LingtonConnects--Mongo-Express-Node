const StudyBuddy = require("../Models/StudyBuddyModel");
const User = require("../Models/UserModel"); // Import the User model

exports.createStudyBuddy = async (req, res) => {
    try {
        const { name, course, interest, bio, availability, profilePicture } = req.body;

        // Validate required fields
        if (!name || !course || !interest) {
            return res.status(400).json({ message: "Name, Course, and Interests are required." });
        }

        // Use the user's profile picture if not provided explicitly
        let finalProfilePicture = profilePicture;
        if (!finalProfilePicture) {
            const user = await User.findById(req.user.id);
            finalProfilePicture = user ? user.profilePicture : "";
        }

        const newBuddy = new StudyBuddy({
            name,
            course,
            interest,
            bio,
            availability,
            profilePicture: finalProfilePicture,
            owner: req.user.id
        });

        const savedBuddy = await newBuddy.save();

        res.status(201).json({
            message: "Study buddy profile created successfully",
            data: savedBuddy
        });
    } catch (error) {
        console.error("Error creating profile: ", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getStudyBuddies = async (req, res) => {
    try {
        // Populate the owner field to include the user's profilePicture in case it's not set on the buddy record
        const buddies = await StudyBuddy.find().populate('owner', 'profilePicture');
        res.status(200).json({
            message: "Study buddy profiles retrieved successfully.",
            data: buddies,
        });
    } catch (error) {
        console.error("Error fetching profiles: ", error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateStudyBuddy = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the study buddy profile by id
        const buddy = await StudyBuddy.findById(id);
        if (!buddy) {
            return res.status(404).json({ message: "Study buddy not found!" });
        }

        // Only allow the owner to update their profile
        if (buddy.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not allowed to update this profile." });
        }

        // Retrieve the provided profilePicture or use the user's own image if absent
        const { profilePicture } = req.body;
        let finalProfilePicture = profilePicture;
        if (!finalProfilePicture) {
            const user = await User.findById(req.user.id);
            finalProfilePicture = user ? user.profilePicture : buddy.profilePicture;
        }

        const updateData = {
            ...req.body,
            profilePicture: finalProfilePicture
        };

        const updatedBuddy = await StudyBuddy.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({
            message: "Study buddy profile updated successfully.",
            data: updatedBuddy
        });
    } catch (error) {
        console.error("Error updating the profile: ", error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteStudyBuddy = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the study buddy profile by id
        const buddy = await StudyBuddy.findById(id);
        if (!buddy) {
            return res.status(404).json({ message: "Study buddy not found!" });
        }

        // Only allow the owner to delete their profile
        if (buddy.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not allowed to delete this profile." });
        }

        const deletedBuddy = await StudyBuddy.findByIdAndDelete(id);

        res.status(200).json({
            message: "Study buddy profile has been deleted.",
            data: deletedBuddy
        });
    } catch (error) {
        console.error("Error deleting profile: ", error);
        res.status(500).json({ message: error.message });
    }
};
