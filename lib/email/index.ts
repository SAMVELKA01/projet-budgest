/**
 * Couche d'envoi d'email minimale, avec un fournisseur remplaçable.
 * Aucun service d'email n'est configuré dans cet environnement : par défaut,
 * les emails sont simplement journalisés côté serveur (utile en dev/démo).
 * Pour brancher un vrai envoi en production, définir RESEND_API_KEY (API
 * HTTP de Resend, appelée directement en fetch — pas de SDK à installer).
 */

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

async function sendViaConsole({ to, subject, html }: SendEmailInput) {
  console.log(`\n--- [email] (RESEND_API_KEY non configurée, affichage console) ---`);
  console.log(`À : ${to}`);
  console.log(`Sujet : ${subject}`);
  console.log(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  console.log("--- fin email ---\n");
}

async function sendViaResend({ to, subject, html }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY!;
  const from = process.env.EMAIL_FROM || "BudGest <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Échec de l'envoi d'email (Resend) : ${res.status} ${body}`);
  }
}

export async function sendEmail(input: SendEmailInput) {
  if (process.env.RESEND_API_KEY) {
    return sendViaResend(input);
  }
  return sendViaConsole(input);
}
