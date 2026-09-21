import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import Transaction from "@/lib/models/Transaction";
import Categorie from "@/lib/models/Categorie";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const { id } = await params;
    const body = await req.json();

    if (body.categorieId) {
      const categorie = await Categorie.findOne({ _id: body.categorieId, userId: session.user.id });
      if (!categorie) {
        return NextResponse.json({ error: "Catégorie introuvable" }, { status: 400 });
      }
      body.category = categorie.name;
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      body,
      { new: true }
    );

    if (!transaction) return NextResponse.json({ error: "Transaction introuvable" }, { status: 404 });
    return NextResponse.json(transaction);
  } catch (err) {
    console.error("Erreur API transactions/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const { id } = await params;
    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!transaction) return NextResponse.json({ error: "Transaction introuvable" }, { status: 404 });
    return NextResponse.json({ message: "Transaction supprimée" });
  } catch (err) {
    console.error("Erreur API transactions/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}