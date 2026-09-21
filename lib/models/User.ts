import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  devise: string;
  active: boolean;
  resetTokenHash?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  devise: { type: String, default: "EUR" },
  active: { type: Boolean, default: true },
  resetTokenHash: { type: String, select: false },
  resetTokenExpiry: { type: Date, select: false },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);