import mongoose, { Schema, Document } from "mongoose";

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  allocated: number;
  mois: number;
  annee: number;
  alertAt: number;
}

const BudgetSchema = new Schema<IBudget>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  allocated: { type: Number, required: true },
  mois: { type: Number, required: true },
  annee: { type: Number, required: true },
  alertAt: { type: Number, default: 80 },
}, { timestamps: true });

export default mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);