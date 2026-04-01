import mongoose from "mongoose";

const waterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    default: 0 // total glasses
  },
  date: {
    type: String // YYYY-MM-DD
  }
}, { timestamps: true });

export default mongoose.model("Water", waterSchema);