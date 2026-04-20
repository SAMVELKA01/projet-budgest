import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import Objectif from "@/lib/models/Objectif";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const objectif = await Objectif.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      body,
      { new: true }
    );
    if (!objectif) return NextResponse.json({ error: "Objectif introuvable" }, { status: 404 });
    return NextResponse.json(objectif);
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
    const objectif = await Objectif.findOneAndDelete({ _id: id, userId: session.user.id });
    if (!objectif) return NextResponse.json({ error: "Objectif introuvable" }, { status: 404 });
    return NextResponse.json({ message: "Objectif supprimé" });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}