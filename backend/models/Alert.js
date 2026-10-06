const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },

  ipAddress: {
    type: String,
    required: true
  },

  alertType: {
    type: String,
    default: "Brute-Force Attack"
  },

  failedAttempts: {
    type: Number,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Alert", alertSchema);