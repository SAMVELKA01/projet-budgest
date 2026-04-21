import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const { currentPassword, newPassword } = await req.json();

    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(session.user.id, { password: hashed });

    return NextResponse.json({ message: "Mot de passe modifié avec succès" });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}