const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());

// Connect to MongoDB (make sure MongoDB is running locally)
mongoose
  .connect("mongodb://localhost:27017/stopwatch", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Mongoose schema and model for saved times
const timeSchema = new mongoose.Schema({
  time: String,
  saved: { type: Date, default: Date.now },
});

const Time = mongoose.model("Time", timeSchema);

// API route to save a time
app.post("/api/saveTime", async (req, res) => {
  const { time } = req.body;
  if (!time) return res.status(400).json({ error: "Missing time field" });

  try {
    const newTime = new Time({ time });
    await newTime.save();
    res.status(201).json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save time" });
  }
});

// API route to get all saved times
app.get("/api/getTimes", async (req, res) => {
  try {
    const times = await Time.find().sort({ saved: -1 });
    res.json(times);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve times" });
  }
});

// Serve static files (your index.html, css, js)
app.use(express.static(path.join(__dirname, ".")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
