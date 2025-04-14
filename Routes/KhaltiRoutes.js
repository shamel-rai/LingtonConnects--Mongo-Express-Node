// routes/khaltiRoutes.js
const express = require('express');
const router = express.Router();
const { initiatePayment, handleReturn } = require('../Controller/KhaltiController');

router.route('/initiate').post(initiatePayment);
// Route for handling the return callback from Khalti.
router.route('/khalti-return').get(handleReturn);

module.exports = router;
