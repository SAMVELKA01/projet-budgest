import { connectDB } from "@/lib/db/mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: "✅ MongoDB connecté avec succès" });
  } catch (error) {
    return NextResponse.json({ status: "❌ Erreur de connexion", error: String(error) }, { status: 500 });
  }
}