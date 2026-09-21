import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const { name, role, active } = await req.json();

    if (id === session.user.id && (role === "user" || active === false)) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas retirer vos propres droits admin ou désactiver votre propre compte" },
        { status: 400 },
      );
    }

    await connectDB();

    const update: Record<string, unknown> = {};
    if (typeof name === "string" && name.trim()) update.name = name.trim();
    if (role === "user" || role === "admin") update.role = role;
    if (typeof active === "boolean") update.active = active;

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select(
      "-password -resetTokenHash -resetTokenExpiry",
    );
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    return NextResponse.json(user);
  } catch (err) {
    console.error("Erreur API admin/users/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
