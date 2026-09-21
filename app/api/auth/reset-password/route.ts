import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Mot de passe trop court (8 caractères min)" }, { status: 400 });
    }

    await connectDB();

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetTokenHash = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error("Erreur API auth/reset-password:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
