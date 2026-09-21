import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";
import { sendEmail } from "@/lib/email";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    // Toujours répondre pareil, que le compte existe ou non : on n'expose
    // jamais si un email est enregistré (évite l'énumération de comptes).
    if (user && user.active) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      user.resetTokenHash = tokenHash;
      user.resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await user.save();

      const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
      const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

      await sendEmail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe BudGest",
        html: `
          <p>Bonjour ${user.name},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe BudGest.</p>
          <p><a href="${resetUrl}">Cliquez ici pour choisir un nouveau mot de passe</a> (lien valable 30 minutes).</p>
          <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        `,
      });
    }

    return NextResponse.json({
      message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
    });
  } catch (err) {
    console.error("Erreur API auth/forgot-password:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
