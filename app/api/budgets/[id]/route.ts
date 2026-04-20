import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import Budget from "@/lib/models/Budget";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const body = await req.json();
    const budget = await Budget.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      body,
      { new: true }
    );

    if (!budget) return NextResponse.json({ error: "Budget introuvable" }, { status: 404 });

    return NextResponse.json(budget);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const budget = await Budget.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!budget) return NextResponse.json({ error: "Budget introuvable" }, { status: 404 });

    return NextResponse.json({ message: "Budget supprimé" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}