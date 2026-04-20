import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import Categorie from "@/lib/models/Categorie";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const categories = await Categorie.find({ userId: session.user.id }).sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const { name, icon, colorHex, budget } = await req.json();

    if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

    const existing = await Categorie.findOne({ userId: session.user.id, name });
    if (existing) return NextResponse.json({ error: "Catégorie déjà existante" }, { status: 409 });

    const categorie = await Categorie.create({
      userId: session.user.id,
      name,
      icon: icon || "🏷️",
      colorHex: colorHex || "#3B82F6",
      budget: budget || 0,
    });

    return NextResponse.json(categorie, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}