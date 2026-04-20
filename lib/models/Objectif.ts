import mongoose, { Schema, Document } from "mongoose";

export interface IObjectif extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  emoji: string;
  target: number;
  saved: number;
  deadline: Date;
  colorHex: string;
}

const ObjectifSchema = new Schema<IObjectif>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  emoji: { type: String, default: "🎯" },
  target: { type: Number, required: true },
  saved: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  colorHex: { type: String, default: "#3B82F6" },
}, { timestamps: true });

export default mongoose.models.Objectif || mongoose.model<IObjectif>("Objectif", ObjectifSchema);