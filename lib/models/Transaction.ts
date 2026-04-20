import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  amount: number;
  type: "depense" | "revenu";
  category: string;
  method: string;
  date: Date;
  recurrent: boolean;
}

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["depense", "revenu"], required: true },
  category: { type: String, required: true },
  method: { type: String, default: "Carte Débit" },
  date: { type: Date, default: Date.now },
  recurrent: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);