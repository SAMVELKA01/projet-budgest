import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";
import Transaction from "@/lib/models/Transaction";
import Budget from "@/lib/models/Budget";
import Categorie from "@/lib/models/Categorie";
import Objectif from "@/lib/models/Objectif";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const { name, devise } = await req.json();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { name, devise },
      { new: true }
    );

    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    return NextResponse.json({ message: "Profil mis à jour", user: { name: user.name, devise: user.devise } });
  } catch (err) {
    console.error("Erreur API users/profile:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();
    const userId = session.user.id;

    await Promise.all([
      Transaction.deleteMany({ userId }),
      Budget.deleteMany({ userId }),
      Categorie.deleteMany({ userId }),
      Objectif.deleteMany({ userId }),
    ]);
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ message: "Compte supprimé" });
  } catch (err) {
    console.error("Erreur API users/profile:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}