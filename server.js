import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Member from "./models/Member.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

// ===== ROUTES =====

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

    const newMember = new Member({
      name,
      position,
      description,
      achievements,
      image, // ✅ frontend sends image URL here
    });

    await newMember.save();
    res.status(201).json(newMember);
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

    if (!updatedMember)
      return res.status(404).json({ error: "Member not found" });

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

// Root endpoint
app.get("/", (req, res) => {
  res.send("✅ NGO Members Backend is running! Use /api/students to get data.");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
