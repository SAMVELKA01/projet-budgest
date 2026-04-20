import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import Categorie from "@/lib/models/Categorie";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const body = await req.json();
    const categorie = await Categorie.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      body,
      { new: true }
    );

    if (!categorie) return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });

    return NextResponse.json(categorie);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const categorie = await Categorie.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!categorie) return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });

    return NextResponse.json({ message: "Catégorie supprimée" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}