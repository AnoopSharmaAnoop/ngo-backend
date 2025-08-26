// Server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Models
import Member from "./models/member.js";
import Event from "./models/event.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ===== ROUTES =====

// Root endpoint
app.get("/", (req, res) => {
  res.send("✅ NGO Backend running! Use /api/students or /api/events");
});

/* ===================== MEMBERS ===================== */

// Get all members
app.get("/api/students", async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new member
app.post("/api/students", async (req, res) => {
  try {
    const { name, position, description, achievements, image } = req.body;

    if (!name || !position) {
      return res.status(400).json({ error: "Name and position are required" });
    }

    const newMember = new Member({ name, position, description, achievements, image });
    const savedMember = await newMember.save();
    res.status(201).json(savedMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update member
app.put("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, description, achievements, image } = req.body;

    const updatedMember = await Member.findByIdAndUpdate(
      id,
      { name, position, description, achievements, image },
      { new: true }
    );

    if (!updatedMember) return res.status(404).json({ error: "Member not found" });
    res.json(updatedMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete member
app.delete("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findByIdAndDelete(id);
    if (!member) return res.status(404).json({ error: "Member not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================== EVENTS ===================== */

// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new event
app.post("/api/events", async (req, res) => {
  try {
    const { title, description, date, time, location, volunteersNeeded, category } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ error: "Title, date, and time are required" });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      time,
      location,
      volunteersNeeded,
      category,
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update event
app.put("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, location, volunteersNeeded, category } = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { title, description, date, time, location, volunteersNeeded, category },
      { new: true }
    );

    if (!updatedEvent) return res.status(404).json({ error: "Event not found" });
    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete event
app.delete("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
