import mongoose, { Schema, Document } from "mongoose";

export interface ICategorie extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  icon: string;
  colorHex: string;
  budget: number;
}

const CategorieSchema = new Schema<ICategorie>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  icon: { type: String, default: "🏷️" },
  colorHex: { type: String, default: "#3B82F6" },
  budget: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Categorie || mongoose.model<ICategorie>("Categorie", CategorieSchema);