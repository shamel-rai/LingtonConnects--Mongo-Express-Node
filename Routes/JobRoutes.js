const express = require('express');
const {
    getJobs,
    getJobById,
    createJob,
    toggleSaveJob,
    deleteJob
} = require('../Controller/JobController');

const router = express.Router();

router.route('/jobs')
    .get(getJobs)
    .post(createJob);

router.route('/jobs/:id')
    .get(getJobById)
    .delete(deleteJob);

router.route('jobs/:id/save')
    .patch(toggleSaveJob);

module.exports = router;
