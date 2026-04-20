import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import Transaction from "@/lib/models/Transaction";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");

    const filter: any = { userId: session.user.id };
    if (category) filter.category = category;
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(limit);

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const { name, amount, type, category, method, date, recurrent } = await req.json();

    if (!name || !amount || !type || !category) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const transaction = await Transaction.create({
      userId: session.user.id,
      name,
      amount: type === "depense" ? -Math.abs(amount) : Math.abs(amount),
      type,
      category,
      method: method || "Carte Débit",
      date: date ? new Date(date) : new Date(),
      recurrent: recurrent || false,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}