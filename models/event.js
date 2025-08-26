import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: String,
  volunteersNeeded: Number,
  category: String,
});

export default mongoose.model("Event", eventSchema);
