const express = require("express");
const {
  refreshAccessToken,
  revokeRefreshToken,
} = require("../Controller/TokenController");

const router = express.Router();

router.route("/refresh-token").post(refreshAccessToken);
router.route("/revoke-token").post(revokeRefreshToken); // Fixed: Added leading '/'

module.exports = router;
