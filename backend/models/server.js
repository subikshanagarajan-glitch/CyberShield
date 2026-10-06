require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Alert = require("./models/Alert");

const app = express();

app.use(cors());
app.use(express.json());

// Store failed login attempts
const failedAttempts = {};

// Home
app.get("/", (req, res) => {
  res.json({
    message: "CyberShield Backend is running",
    status: "OK"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "CyberShield API is working",
    status: "healthy"
  });
});

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        message: "Username already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username: username,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Registration failed"
    });
  }
});

// LOGIN WITH BRUTE-FORCE DETECTION
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    const user = await User.findOne({ username });

    // Invalid username
    if (!user) {
      return handleFailedLogin(username, ipAddress, res);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    // Wrong password
    if (!passwordMatch) {
      return handleFailedLogin(username, ipAddress, res);
    }

    // Successful login - reset failed attempts
    const key = `${username}_${ipAddress}`;
    delete failedAttempts[key];

    res.json({
      message: "Login successful",
      username: user.username
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Login failed"
    });
  }
});

// Handle failed login attempts
async function handleFailedLogin(username, ipAddress, res) {

  const key = `${username}_${ipAddress}`;
  const currentTime = Date.now();

  if (!failedAttempts[key]) {
    failedAttempts[key] = [];
  }

  // Keep only attempts from the last 1 minute
  failedAttempts[key] = failedAttempts[key].filter(
    (time) => currentTime - time < 60000
  );

  // Add current failed attempt
  failedAttempts[key].push(currentTime);

  const attempts = failedAttempts[key].length;

  console.log(
    `Failed login: ${username} | IP: ${ipAddress} | Attempts: ${attempts}`
  );

  // Detect brute-force attack after 5 failures
  if (attempts >= 5) {

    try {
      const alert = new Alert({
        username: username || "Unknown",
        ipAddress: ipAddress,
        alertType: "Brute-Force Attack",
        failedAttempts: attempts,
        message: `Possible brute-force attack detected. ${attempts} failed login attempts within 1 minute.`
      });

      await alert.save();

      console.log("🚨 BRUTE-FORCE ATTACK DETECTED");
      console.log("🚨 Security alert saved to MongoDB");

      // Reset attempts after creating alert
      delete failedAttempts[key];

      return res.status(429).json({
        message: "Brute-force attack detected",
        alert: true
      });

    } catch (error) {
      console.log("Alert saving failed:", error.message);
    }
  }

  return res.status(401).json({
    message: "Invalid username or password",
    failedAttempts: attempts
  });
}

// Get security alerts
app.get("/api/alerts", async (req, res) => {
  try {
    const alerts = await Alert.find()
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(alerts);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Unable to retrieve alerts"
    });
  }
});

// Connect MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`CyberShield backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed");
    console.log(error.message);
  });