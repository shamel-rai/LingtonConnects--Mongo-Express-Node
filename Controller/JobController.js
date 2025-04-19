const Job = require('../Models/JobModels');

// GET /api/jobs
exports.getJobs = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.type && req.query.type !== 'All Jobs') {
            filter.type = req.query.type;
        }
        const jobs = await Job.find(filter).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (err) {
        next(err);
    }
};

// GET /api/jobs/:id
exports.getJobById = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.status(200).json(job);
    } catch (err) {
        next(err);
    }
};

// POST /api/jobs
exports.createJob = async (req, res, next) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).json(job);
    } catch (err) {
        next(err);
    }
};

// PATCH /api/jobs/:id/save
exports.toggleSaveJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        job.saved = !job.saved;
        await job.save();
        res.status(200).json(job);
    } catch (err) {
        next(err);
    }
};

exports.deleteJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        await job.remove();
        res.status(200).json({ message: 'Job removed' });
    } catch (err) {
        next(err);
    }
};