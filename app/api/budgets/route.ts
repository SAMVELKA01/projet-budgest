import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import Budget from "@/lib/models/Budget";
import Categorie from "@/lib/models/Categorie";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(req.url);
    const mois = searchParams.get("mois") || new Date().getMonth() + 1;
    const annee = searchParams.get("annee") || new Date().getFullYear();

    const budgets = await Budget.find({
      userId: session.user.id,
      mois: Number(mois),
      annee: Number(annee),
    });

    return NextResponse.json(budgets);
  } catch (err) {
    console.error("Erreur API budgets:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const { categorieId, allocated, mois, annee, alertAt } = await req.json();

    if (!categorieId || !allocated) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const categorie = await Categorie.findOne({ _id: categorieId, userId: session.user.id });
    if (!categorie) {
      return NextResponse.json({ error: "Catégorie introuvable" }, { status: 400 });
    }

    const resolvedMois = mois || new Date().getMonth() + 1;
    const resolvedAnnee = annee || new Date().getFullYear();

    const existing = await Budget.findOne({
      userId: session.user.id,
      categorieId,
      mois: resolvedMois,
      annee: resolvedAnnee,
    });

    if (existing) {
      return NextResponse.json({ error: "Budget déjà existant pour cette catégorie" }, { status: 409 });
    }

    const budget = await Budget.create({
      userId: session.user.id,
      categorieId: categorie._id,
      category: categorie.name,
      allocated,
      mois: resolvedMois,
      annee: resolvedAnnee,
      alertAt: alertAt || 80,
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (err) {
    console.error("Erreur API budgets:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
