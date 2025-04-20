
const Mentor = require('../Models/MentorModel');


exports.getAllMentors = async (req, res) => {
    try {
        const docs = await Mentor.find()
            .populate('owner', '_id profilePicture')
            .lean();

        const list = docs.map(m => ({
            ...m,
            editable: m.owner && m.owner._id.toString() === req.user.id,
        }));

        return res.json({ success: true, data: list });
    } catch (err) {
        console.error('🔥 getAllMentors error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};


exports.createMentor = async (req, res) => {
    try {
        const exists = await Mentor.findOne({ owner: req.user.id });
        if (exists) {
            return res
                .status(409)
                .json({ success: false, message: 'Profile already exists' });
        }

        const mentor = await Mentor.create({
            owner: req.user.id,
            name: req.body.name,
            expertise: req.body.expertise,
            bio: req.body.bio,
            availability: req.body.availability,
            isAvailable: req.body.isAvailable,
            isMentor: req.body.isMentor,
            profilePicture: req.body.profilePicture,
        });

        const full = await Mentor.findById(mentor._id)
            .populate('owner', '_id profilePicture')
            .lean();
        full.editable = full.owner._id.toString() === req.user.id;

        return res.status(201).json({ success: true, data: full });
    } catch (err) {
        console.error('🔥 createMentor error:', err);
        return res.status(400).json({ success: false, message: err.message });
    }
};


exports.updateMentor = async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.id);
        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        if (mentor.owner.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updates = {
            name: req.body.name,
            expertise: req.body.expertise,
            bio: req.body.bio,
            availability: req.body.availability,
            isAvailable: req.body.isAvailable,
            isMentor: req.body.isMentor,
            profilePicture: req.body.profilePicture,
        };

        await Mentor.findByIdAndUpdate(req.params.id, { $set: updates }, {
            new: true,
            runValidators: true,
        });

        const full = await Mentor.findById(req.params.id)
            .populate('owner', '_id profilePicture')
            .lean();
        full.editable = full.owner._id.toString() === req.user.id;

        return res.json({ success: true, data: full });
    } catch (err) {
        console.error('🔥 updateMentor error:', err);
        return res.status(400).json({ success: false, message: err.message });
    }
};


exports.deleteMentor = async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.id);
        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        if (mentor.owner.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await Mentor.findByIdAndDelete(req.params.id);

        return res.json({ success: true, message: 'Profile deleted' });
    } catch (err) {
        console.error('👎 deleteMentor error:', err);
        return res
            .status(500)
            .json({ success: false, message: 'Server error deleting profile' });
    }
};
