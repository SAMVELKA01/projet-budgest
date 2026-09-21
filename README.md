# BudGest

Application de gestion de budget personnel — Next.js (App Router), MongoDB,
NextAuth, assistant IA (Gemini).

## Stack

- Next.js 16 (App Router, Turbopack)
- MongoDB / Mongoose
- NextAuth (Auth.js) v5 — sessions JWT, authentification par identifiants
- Tailwind CSS v4
- IA : Gemini (`@google/genai`), couche d'abstraction dans `lib/ai/`

## Démarrage

```bash
pnpm install
cp .env.example .env.local   # puis renseigner les variables
pnpm dev
```

Voir `.env.example` pour la liste des variables d'environnement requises.

## Scripts

```bash
pnpm dev      # serveur de développement
pnpm build    # build de production
pnpm start    # démarre le build de production
pnpm lint     # ESLint
```

Scripts ponctuels (via `pnpm dlx tsx <fichier>`) :

- `scripts/seed-admin.ts` — crée ou promeut un compte administrateur à
  partir de `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
- `scripts/migrate-categories.ts` — migration historique (rattache les
  transactions/budgets en texte libre à de vraies catégories).

## Structure

- `app/(auth)` — connexion, inscription, mot de passe oublié
- `app/(dashboard)` — application principale (transactions, budgets,
  catégories, objectifs, statistiques, assistant IA, paramètres, admin)
- `app/api` — routes API (toutes scopées par utilisateur connecté)
- `lib/ai` — couche d'abstraction IA (fournisseur remplaçable)
- `lib/auth` — configuration NextAuth
- `lib/models` — schémas Mongoose

Voir `CHANGELOG_REFONTE.md` pour l'historique détaillé de la refonte.
