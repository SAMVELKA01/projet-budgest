import { NextResponse } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    // Mot de passe temporaire aléatoire, à communiquer manuellement à
    // l'utilisateur (pas de service d'email fiable garanti dans cet
    // environnement) ; il pourra le changer depuis Paramètres.
    const tempPassword = crypto.randomBytes(9).toString("base64url");
    user.password = await bcrypt.hash(tempPassword, 12);
    await user.save();

    return NextResponse.json({ tempPassword });
  } catch (err) {
    console.error("Erreur API admin/users/[id]/reset-password:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
