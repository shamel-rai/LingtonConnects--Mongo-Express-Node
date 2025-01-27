const mongoose = require("mongoose");

const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  expiredAt: {
    type: Date,
    required: true,
  },
});

// Add a TTL index to automatically remove expired tokens
blacklistedTokenSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

const BlackList = mongoose.model("Blacklist", blacklistedTokenSchema);

module.exports = BlackList;
