// Routes/MentorRoutes.js
const express = require('express');
const router = express.Router();
const { auth } =
    require('../Middleware/Authentication');
const {
    getAllMentors,
    createMentor,
    updateMentor,
    deleteMentor
} = require('../Controller/MentorController');

router.route('/mentors')
    .get(auth, getAllMentors)
    .post(auth, createMentor);

router.route('/mentors/:id')
    .put(auth, updateMentor)
    .delete(auth, deleteMentor);

module.exports = router;
