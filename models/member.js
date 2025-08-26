import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  description: { type: String },
  achievements: { type: String },
  image: { type: String }
});

const Member = mongoose.model("Member", memberSchema);

export default Member;
