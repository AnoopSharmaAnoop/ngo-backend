import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";

// Models
import Member from "./models/member.js";
import Event from "./models/event.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ MIDDLEWARE - EXACT ORDER MATTERS!
app.use(cors({
  origin: [
    "http://localhost:5173",    // local React dev
    "https://gyanpargas.com"    // your live frontend domain
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ CRITICAL: Add this line

// ✅ Request logger - BEFORE routes
app.use((req, res, next) => {
  console.log(`\n🌐 ${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  console.log(`🔗 From: ${req.headers.origin || 'Unknown'}`);
  next();
});

// ✅ Serve uploads folder statically
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// ✅ ROUTES

// Root endpoint
app.get("/", (req, res) => {
  res.send("✅ NGO Backend running! Use /api/students or /api/events");
});

// Get all members
app.get("/api/students", async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST route with GUARANTEED logging
app.post("/api/students", upload.single("image"), async (req, res) => {
  // ✅ These logs MUST appear if the route is hit
  console.log("\n" + "=".repeat(50));
  console.log("🚨 POST REQUEST RECEIVED!");
  console.log("🕐 Time:", new Date().toLocaleTimeString());
  console.log("🌍 URL:", req.url);
  console.log("📋 Method:", req.method);
  console.log("=" + "=".repeat(50));
  
  console.log("📦 req.body:", JSON.stringify(req.body, null, 2));
  console.log("📦 typeof req.body:", typeof req.body);
  console.log("📦 req.body keys:", req.body ? Object.keys(req.body) : "NULL/UNDEFINED");
  
  console.log("📎 req.file:", req.file ? "FILE EXISTS" : "NO FILE");
  if (req.file) {
    console.log("📎 File details:", {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      size: req.file.size
    });
  }
  
  console.log("🔍 FIELD ANALYSIS:");
  const { name, position, description, achievements } = req.body || {};
  console.log(`  📝 name: "${name}" (${typeof name})`);
  console.log(`  💼 position: "${position}" (${typeof position})`);
  console.log(`  📖 description: "${description}" (${typeof description})`);
  console.log(`  🏆 achievements: "${achievements}" (${typeof achievements})`);
  
  console.log("=" + "=".repeat(50));

  try {
    if (!name || !position) {
      console.log("❌ VALIDATION FAILED!");
      console.log("❌ Missing name:", !name);
      console.log("❌ Missing position:", !position);
      return res.status(400).json({ error: "Name and position are required" });
    }

    console.log("✅ Validation passed!");

    const newMember = new Member({
      name: name.trim(),
      position: position.trim(),
      description: description ? description.trim() : "",
      achievements: achievements ? achievements.trim() : "",
      image: req.file ? `${process.env.BASE_URL}/uploads/${req.file.filename}` : null,

    });

    const savedMember = await newMember.save();
    console.log("✅ Member saved with ID:", savedMember._id);
    res.status(201).json(savedMember);
  } catch (err) {
    console.log("❌ Server error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
// Update member (with file upload)
app.put("/api/students/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, description, achievements } = req.body;

    const updateData = {
      name,
      position,
      description,
      achievements,
    };

   if (req.file) {
  updateData.image = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
}

    const updatedMember = await Member.findByIdAndUpdate(id, updateData, {
      new: true,
    });

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

/* ===================== EVENTS ===================== */
// Your existing event routes remain unchanged...

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});