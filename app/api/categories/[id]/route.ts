import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import Categorie from "@/lib/models/Categorie";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const categorie = await Categorie.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      body,
      { new: true }
    );
    if (!categorie) return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });
    return NextResponse.json(categorie);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const categorie = await Categorie.findOneAndDelete({ _id: id, userId: session.user.id });
    if (!categorie) return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });
    return NextResponse.json({ message: "Catégorie supprimée" });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}