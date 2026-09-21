import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import Transaction from "@/lib/models/Transaction";
import Categorie from "@/lib/models/Categorie";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(req.url);
    const categorieId = searchParams.get("categorieId");
    const category = searchParams.get("category"); // legacy, gardé en fallback
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");

    const filter: Record<string, string> = { userId: session.user.id };
    if (categorieId) filter.categorieId = categorieId;
    else if (category) filter.category = category;
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(limit)
      .populate("categorieId", "name icon colorHex");

    const result = transactions.map((t) => {
      const obj = t.toObject();
      if (obj.categorieId && typeof obj.categorieId === "object") {
        const populated = obj.categorieId as unknown as { _id: unknown; name: string; icon: string; colorHex: string };
        obj.category = populated.name;
        obj.categoryIcon = populated.icon;
        obj.categoryColor = populated.colorHex;
        obj.categorieId = populated._id;
      }
      return obj;
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const { name, amount, type, categorieId, method, date, recurrent } = await req.json();

    if (!name || !amount || !type || !categorieId) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const categorie = await Categorie.findOne({ _id: categorieId, userId: session.user.id });
    if (!categorie) {
      return NextResponse.json({ error: "Catégorie introuvable" }, { status: 400 });
    }

    const transaction = await Transaction.create({
      userId: session.user.id,
      name,
      amount: type === "depense" ? -Math.abs(amount) : Math.abs(amount),
      type,
      categorieId: categorie._id,
      category: categorie.name,
      method: method || "Carte Débit",
      date: date ? new Date(date) : new Date(),
      recurrent: recurrent || false,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
