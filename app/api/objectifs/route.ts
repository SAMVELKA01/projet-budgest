import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import Objectif from "@/lib/models/Objectif";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const objectifs = await Objectif.find({ userId: session.user.id }).sort({ deadline: 1 });

    return NextResponse.json(objectifs);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const { title, emoji, target, saved, deadline, colorHex } = await req.json();

    if (!title || !target || !deadline) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const objectif = await Objectif.create({
      userId: session.user.id,
      title,
      emoji: emoji || "🎯",
      target,
      saved: saved || 0,
      deadline: new Date(deadline),
      colorHex: colorHex || "#3B82F6",
    });

    return NextResponse.json(objectif, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}