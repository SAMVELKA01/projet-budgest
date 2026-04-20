import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Mot de passe trop court" }, { status: 400 });
    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });
    return NextResponse.json({ message: "Compte créé", user: { id: user._id, name: user.name, email: user.email } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}