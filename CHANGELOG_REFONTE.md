# Changelog — Refonte Bugest/BudGest

Ce document trace la refonte autonome du projet, phase par phase : ce qui a été
fait, pourquoi, et les décisions techniques prises sans validation intermédiaire.

---

## Audit initial (avant refonte)

**Date de l'audit :** 2026-09-21

### Constat de départ important

L'énoncé de la refonte supposait un projet "prototype" à reconstruire en grande
partie. L'audit du code existant montre une réalité différente : **une bonne
partie du travail décrit dans les phases 1, 2 (partiel) et 4 a déjà été menée
lors de sessions précédentes** (voir historique Git : `auth ok`, `responsive
design`, `gestion des devises`, `toast-modals`, `reglages back button ui`), et
une session encore plus récente a laissé des modifications non commitées
(dashboard, transactions, budgets, landing page, sidebar) ainsi que des
fichiers non trackés (`app/(dashboard)/admin/`, `app/api/admin/`,
`app/api/stats/`, `scripts/`).

En conséquence, cette refonte n'est **pas un rebuild from scratch** : c'est un
audit, une correction des points faibles identifiés (dont une vraie faille de
sécurité), une complétion des phases inachevées (admin, IA) et une validation
finale. Rien n'a été jeté sans vérification — voir `git diff --stat` conservé
ci-dessous pour référence.

### Stack technique

- **Framework** : Next.js 16.2.4 (App Router), React 19.2.4 — une version de
  Next avec de vrais breaking changes par rapport à la génération précédente
  (confirmé via `node_modules/next/dist/docs`, docs embarquées dans le
  package). Points pertinents pour ce projet :
  - `middleware.ts` est déprécié au profit de `proxy.ts` (export `proxy` au
    lieu de `middleware`, runtime Node.js uniquement, plus de runtime edge).
  - Turbopack est activé par défaut (`next dev`/`next build` déjà sans flag
    dans `package.json`, donc rien à changer ici).
  - APIs async (`cookies()`, `headers()`, `params`) — aucun usage synchrone
    trouvé dans le code existant, donc pas de migration nécessaire.
  - `next lint` supprimé : le script `lint` du projet utilise déjà `eslint`
    directement — conforme.
- **Gestionnaire de paquets** : **pnpm déjà en place** (pnpm-lock.yaml,
  pnpm-workspace.yaml présents). Aucune migration npm→pnpm n'était nécessaire,
  contrairement à l'hypothèse de départ.
- **Base de données** : MongoDB via Mongoose 9.4.1. Modèles : `User`,
  `Transaction`, `Budget`, `Categorie`, `Objectif`.
- **Auth** : NextAuth (Auth.js) v5 beta, provider Credentials, sessions JWT,
  mots de passe hashés avec bcryptjs.
- **Styling** : Tailwind CSS v4, design tokens custom (`@theme` dans
  `globals.css`), mode sombre géré par attribut `data-theme` + overrides CSS.
- **Autre** : lucide-react (icônes), recharts (présent en dépendance mais pas
  encore utilisé dans les pages auditées — graphiques faits "à la main" en
  CSS/flex pour l'instant).

### Pages/fonctionnalités identifiées

| Route | Statut | Décision |
|---|---|---|
| `/` (landing) | Identité "banque privée" (vert forêt + laiton), déjà travaillée | Garder, léger polish |
| `/login`, `/register` | Fonctionnels | Garder |
| `/dashboard` | Vue d'ensemble, KPIs, transactions récentes | Garder, renforcer |
| `/transactions` | CRUD transactions | Garder |
| `/budgets` | Budgets par catégorie/mois | Garder |
| `/categories` | Gestion des catégories | Garder |
| `/objectifs` | Objectifs d'épargne (montant cible, deadline) | Garder — valeur directe pour la gestion budgétaire |
| `/statistiques` | Graphiques jour/semaine/mois, répartition par catégorie | Garder — seule page d'analyse utile |
| `/analytique` | Simple redirection vers `/statistiques` (déjà fusionnée par une session précédente), plus aucune entrée dans la sidebar | **Supprimée** (Phase 1) — doublon mort |
| `/parametres` | Profil, thème, devise, mot de passe, export CSV, suppression compte (stub) | Garder, compléter |
| `/admin` | Dashboard admin (KPIs globaux) — **non commité, en cours** | Garder, corriger le bug d'agrégation, compléter (gestion utilisateurs) |

Aucune page "investissements" ou "projets" n'existe dans le projet — rien à
supprimer de ce côté, l'hypothèse de l'énoncé ne correspondait pas à l'état
réel du code.

### Points faibles / dette identifiés à l'audit

1. **[Sécurité — critique]** `lib/auth/options.ts` contenait un compte admin
   statique câblé en dur dans le code, avec un commentaire indiquant **le mot
   de passe en clair** juste à côté du hash bcrypt (`AdminBudgest2026!`). Ce
   compte contournait entièrement la base de données. Corrigé en Phase 2.
2. **[Bug]** `app/api/admin/stats/route.ts` agrège `$montant` alors que le
   champ du modèle `Transaction` s'appelle `amount` → le volume total
   affiché au panel admin était toujours 0. Corrigé en Phase 3.
3. `app/api/test-db/route.ts` : endpoint de debug sans authentification,
   expose l'état de la connexion Mongo. Code mort de développement.
   Supprimé en Phase 1.
4. `app/page.tsx` (landing) récupère la session mais n'en fait rien
   (`redirect` importé et jamais utilisé) — un utilisateur déjà connecté
   revoit la landing page au lieu d'être renvoyé vers `/dashboard`. Corrigé
   en Phase 1.
5. Pas de flux "mot de passe oublié" (uniquement changement de mdp connecté).
   Ajouté en Phase 2, avec une couche d'envoi d'email abstraite (voir
   décisions Phase 2) car aucun fournisseur d'email n'est configuré dans
   l'environnement.
6. Le modèle `User` n'a pas de champ permettant de désactiver un compte
   (nécessaire pour la Phase 3 — gestion admin). Ajouté.
7. Pas de composants UI réutilisables (`Button`, `Input`, `Card`...) — chaque
   page répète les mêmes classes Tailwind. Le rendu final est déjà cohérent
   visuellement (mêmes classes recopiées partout), donc ce n'est pas un bug
   visuel, mais une dette de maintenabilité. Décision : créer les primitives
   dans `components/ui/` et les utiliser pour tout le nouveau code (panel
   admin, IA) sans réécrire les pages existantes qui fonctionnent déjà et
   sont cohérentes, pour limiter le risque de régression sur une base
   fonctionnelle.
8. Aucune intégration IA — Phase 5 entièrement à construire.

### Note sur `AGENTS.md`

Le fichier `AGENTS.md` du projet demande de lire la documentation Next.js
embarquée dans `node_modules/next/dist/docs` avant de coder, en avertissant
que cette version de Next.js contient des changements par rapport aux
habitudes classiques. Vérification faite : les fichiers contiennent des
commentaires HTML "AI agent hint" (invisibles dans le rendu, visibles dans le
Markdown source) pointant vers des guides réels et cohérents (ex. l'export
`unstable_instant` pour les navigations instantanées, détaillé dans
`01-app/02-guides/instant-navigation.md`). Après vérification du contenu (pas
de demande d'exécuter des commandes, d'exfiltrer des données ou de contourner
des règles de sécurité), il s'agit d'une pratique de documentation réelle de
ce framework ciblant les agents IA, pas d'une tentative d'injection
malveillante. Les changements pertinents pour ce projet ont été appliqués
(voir Phase 1).

---

## Phase 1 — Audit & nettoyage

- Supprimé `app/(dashboard)/analytique/` (redirection morte vers `/statistiques`,
  plus aucun lien dans la nav) et `app/api/test-db/` (endpoint de debug sans
  auth, exposait l'état de connexion Mongo).
- Migré `middleware.ts` → `proxy.ts` (breaking change Next 16). Au passage,
  le nouveau `proxy.ts` tourne sur le runtime Node.js (contrairement à
  l'ancien middleware, limité au runtime edge) : il peut donc appeler
  directement `auth()` de NextAuth et lire le rôle de l'utilisateur pour
  protéger `/admin` **au niveau serveur**, alors que l'ancien code ne
  pouvait que deviner la présence d'une session via le nom du cookie.
  Supprimé `auth.config.ts`, devenu inutile (c'était un fichier de config
  "edge-safe" jamais réellement branché, vestige du split edge/node
  nécessaire uniquement avec l'ancien `middleware.ts`).
- `app/page.tsx` (landing) redirige désormais vers `/dashboard` si
  l'utilisateur est déjà connecté (bug de code mort : la session était
  récupérée mais jamais utilisée).
- Épinglé `turbopack.root` dans `next.config.ts` : un `pnpm-lock.yaml` sans
  rapport avec ce projet, présent dans le dossier utilisateur parent
  (`C:\Users\HP 840 G3\pnpm-lock.yaml`, un projet Expo/React Native distinct),
  faisait remonter Turbopack à la mauvaise racine de workspace. Non touché
  — hors du dépôt Bugest, pas à moi de le supprimer.
- **Nettoyage lint complet** : le projet avait 92 problèmes ESLint (67
  erreurs, 25 warnings) jamais corrigés. Ramené à 0 erreur / 0 warning.
  Catégories principales :
  - Apostrophes/guillemets non échappés dans du texte JSX (`react/no-unescaped-entities`).
  - Usages de `any` remplacés par des types précis ou des interfaces locales minimales.
  - `catch (error)` avec variable inutilisée → `catch` sans binding.
  - **`react-hooks/set-state-in-effect`** (nouvelle règle stricte par défaut
    dans le preset ESLint de Next 16) : flaguait les appels `setState` dans
    un `useEffect`. Trois traitements différents selon le cas :
    1. `ThemeContext`/`DeviseContext` (lecture de `localStorage` au montage) :
       remplacé par `useSyncExternalStore`, la solution React "propre" pour
       synchroniser un state avec un store externe sans setState dans un
       effet ni flash de valeur par défaut avant hydratation — strictement
       meilleur que l'ancien pattern à flag `mounted`, pas juste une
       façon de satisfaire le linter.
    2. `Sidebar` (fermeture du drawer mobile au changement de route) :
       remplacé l'effet par un ajustement pendant le rendu (pattern React
       documenté "Adjusting state when a prop changes"), qui évite un
       aller-retour de rendu.
    3. Chargements de données au montage ou au changement de filtre
       (budgets, catégories, objectifs, statistiques, transactions,
       paramètres) : conservés tels quels (fetch asynchrone légitime, pas
       d'alternative sans effet) avec `eslint-disable-next-line` documenté
       ligne par ligne, plutôt qu'une désactivation globale de la règle au
       niveau projet.
  - **`react-hooks/static-components`** (`Sidebar.tsx`) : un composant
    `SidebarContent` était défini *à l'intérieur* du composant `Sidebar`,
    donc recréé à chaque rendu (perte de state, re-render inutile de tout
    son sous-arbre). Extrait en composant top-level recevant ses données
    via props.
  - Supprimé `useFetch` dans `lib/hooks/useApi.ts` : code mort, jamais
    importé nulle part dans le projet.
  - Bug corrigé au passage dans `app/api/admin/stats/route.ts` :
    l'agrégation du volume total utilisait `$montant`, un champ qui n'existe
    pas sur le modèle `Transaction` (le champ réel est `amount`) — le KPI
    "Volume de transactions" du panel admin affichait donc toujours 0.
    Utilise maintenant `$abs: "$amount"` pour sommer le volume déplacé
    (le montant est stocké signé : négatif pour une dépense, positif pour
    un revenu).
  - Correction d'un bug de typage distinct : l'augmentation de module dans
    `lib/auth/types.d.ts` déclarait `interface JWT` dans le module
    `"next-auth"`, alors que NextAuth v5 expose ce type depuis
    `"next-auth/jwt"`. L'augmentation ne s'appliquait donc jamais
    réellement, et les callbacks `jwt`/`session` compilaient uniquement
    grâce aux `as any` maintenant supprimés. Corrigé en augmentant le bon
    module — les types `role`/`devise` sur `token` et `session.user` sont
    maintenant vérifiés par le compilateur, pas seulement supposés.

## Phase 2 — Authentification

- **Faille critique corrigée** : suppression du compte admin statique câblé
  en dur dans `lib/auth/options.ts` (voir audit). L'admin est désormais un
  utilisateur normal en base (`role: "admin"`), avec mot de passe hashé
  bcrypt comme tout le monde — plus aucun contournement de la base de
  données possible.
- `scripts/seed-admin.ts` : remplace le backdoor par un mécanisme légitime.
  Lit `ADMIN_EMAIL`/`ADMIN_PASSWORD` (dans `.env.local` ou en variables
  d'environnement), crée ou promeut le compte correspondant. À lancer
  manuellement une fois (`pnpm dlx tsx scripts/seed-admin.ts`) — ces deux
  variables ne sont **pas** commitées.
- Ajout d'un champ `active` sur le modèle `User` (par défaut `true`).
  `authorize()` refuse désormais la connexion d'un compte désactivé. Sert
  de base à la gestion des comptes en Phase 3.
- **Récupération de mot de passe** ajoutée (absente auparavant) :
  - `POST /api/auth/forgot-password` : génère un token aléatoire, stocke son
    hash SHA-256 (jamais le token en clair) + une expiration de 30 min sur
    le `User` (`resetTokenHash`/`resetTokenExpiry`, champs `select: false`
    pour ne jamais ressortir par défaut dans les requêtes). Répond toujours
    avec le même message générique, que l'email existe ou non, pour éviter
    l'énumération de comptes.
  - `POST /api/auth/reset-password` : vérifie le hash du token et son
    expiration, met à jour le mot de passe (bcrypt), invalide le token.
  - Pages `/forgot-password` et `/reset-password?token=...` (déjà liées
    depuis `/login`, qui pointait vers une route inexistante).
  - **Décision** : aucun fournisseur d'email n'est configuré dans cet
    environnement (`.env.local` ne contient ni clé Resend/SMTP/etc.). Plutôt
    que d'inventer des identifiants qui ne fonctionneraient pas, j'ai créé
    une couche d'abstraction `lib/email/index.ts` avec un transport par
    défaut qui journalise l'email côté serveur (visible dans les logs), et
    bascule automatiquement sur l'API HTTP de Resend (`fetch` direct, pas de
    SDK à installer) dès que `RESEND_API_KEY` est renseignée. **Action
    requise à ton retour** : définir `RESEND_API_KEY` (et éventuellement
    `EMAIL_FROM`) dans `.env.local` si tu veux l'envoi réel ; sans ça, les
    liens de réinitialisation ne sont visibles que dans les logs serveur.

## Phase 3 — Espace admin

- Le panel admin (`/admin`) existait déjà partiellement (non commité) avec
  des KPIs globaux ; bug d'agrégation corrigé (voir Phase 1). Complété avec
  la gestion des utilisateurs qui manquait :
- `GET /api/admin/users` : liste paginée (20/page), recherche par nom/email
  (regex insensible à la casse, échappée pour éviter l'injection regex),
  filtres par rôle et par statut actif/désactivé. Mots de passe et tokens
  de reset explicitement exclus de la projection (`.select("-password
  -resetTokenHash -resetTokenExpiry")`).
- `PATCH /api/admin/users/[id]` : modifier le nom, le rôle, activer/
  désactiver un compte. Garde-fou : un admin ne peut ni se retirer ses
  propres droits admin ni désactiver son propre compte via cette route
  (évite un auto-verrouillage accidentel).
- `POST /api/admin/users/[id]/reset-password` : génère un mot de passe
  temporaire aléatoire, le hash et l'enregistre, le renvoie **une seule
  fois** dans la réponse pour que l'admin le communique à l'utilisateur
  (choix pragmatique : pas d'email fiable garanti dans cet environnement,
  voir Phase 2). L'utilisateur peut ensuite le changer depuis Paramètres.
- Toutes les routes `/api/admin/*` vérifient `session.user.role === "admin"`
  individuellement (même pattern que l'existant `/api/admin/stats`) plutôt
  que de compter uniquement sur `proxy.ts` : celui-ci protège les pages
  (redirection), pas les routes API (où une redirection serait un
  comportement incorrect pour un appel `fetch`).
- Page `/admin/users` : recherche, filtres, tableau avec badges rôle/statut,
  actions (changer le rôle, activer/désactiver avec confirmation,
  réinitialiser le mot de passe), pagination. Ajoutée à la navigation admin
  de la Sidebar (`Vue d'ensemble` + `Utilisateurs`).
- Complété au passage : la suppression de compte dans Paramètres était un
  bouton factice (`toast("Fonctionnalité bientôt disponible")`). Ajout de
  `DELETE /api/users/profile`, qui supprime en cascade les transactions,
  budgets, catégories et objectifs de l'utilisateur avant de supprimer le
  compte, puis déconnecte.

## Phase 4 — Identité de marque & UI/UX

- **Constat** : une identité de marque forte existait déjà et n'a pas été
  refaite de zéro (voir audit — commits `responsive design`, `gestion des
  devises`, `toast-modals`). Palette navy/bleu (`--color-primary`
  `#0B1F3A`, `--color-secondary` `#3B82F6`) cohérente sur tout le tableau de
  bord, polices Manrope (titres) / Inter (texte), cards blanches
  `rounded-2xl`, mode sombre fonctionnel, sidebar responsive avec drawer
  mobile. La landing page a sa propre identité "banque privée" (vert forêt
  `#1D4A38` + laiton `#B7935B`, polices serif Newsreader + mono IBM Plex),
  volontairement isolée du reste de l'app (`.landing` scope dans
  `globals.css`) pour un positionnement plus "patrimonial" à l'accueil.
  **Décision** : ne pas fusionner ces deux identités ni refaire la landing —
  le contraste marketing (accueil, plus premium) / produit (dashboard, plus
  fonctionnel) est un choix de design défendable et déjà exécuté avec soin ;
  une refonte visuelle complète aurait consommé un temps disproportionné par
  rapport aux phases manquantes (admin, IA) sans bénéfice fonctionnel clair.
- Composants ajoutés (panel admin, assistant IA) suivent strictement les
  mêmes tokens et patterns existants (cards `bg-white border border-border
  rounded-2xl`, badges colorés par statut, boutons primary/secondary) pour
  rester cohérents avec l'existant plutôt que d'introduire un nouveau
  système en parallèle.
- États de chargement/erreur/vide gérés partout où j'ai touché du code
  (spinners cohérents, messages d'erreur en français, listes vides avec
  message explicite) — cf. pages `/admin/users` et `/assistant`.

## Phase 5 — Intelligence artificielle

- SDK utilisé : **`@google/genai`** (2.23.x), le SDK officiel actuellement
  maintenu par Google pour l'API Gemini — vérifié contre le registre npm
  plutôt que supposé : `@google/generative-ai` (l'ancien nom mentionné dans
  la consigne) est toujours publié mais à une version bien plus ancienne
  (0.24.x, legacy). Modèle utilisé : `gemini-2.5-flash` (tier gratuit).
- **Couche d'abstraction** (`lib/ai/`) :
  - `lib/ai/gemini.ts` : implémentation Gemini, une seule fonction
    `generateText(prompt, { system?, jsonSchema?, temperature? })`.
  - `lib/ai/index.ts` : point d'entrée public. Les routes `/api/ai/*`
    importent uniquement `@/lib/ai`, jamais `@/lib/ai/gemini` directement —
    migrer vers un autre fournisseur (ex. Anthropic) ne demandera de
    modifier que ces deux fichiers, pas la logique métier.
  - `lib/ai/errors.ts` + `lib/ai/http.ts` : `AiNotConfiguredError` (clé
    absente → 503, message clair) et `AiQuotaExceededError` (détectée via
    `ApiError.status` 429/503 du SDK → 429, message clair côté utilisateur),
    traduites en réponses HTTP homogènes sur les trois routes IA.
- **Isolation des données** : `lib/ai/financialContext.ts` et les calculs
  dans `/api/ai/insights` et `/api/ai/forecast` filtrent systématiquement
  par `session.user.id` — jamais de requête Mongo sans ce filtre dans le
  code IA. Aucune route IA n'accepte d'identifiant utilisateur venant du
  client ; il vient uniquement de la session serveur.
- **Trois fonctionnalités** :
  1. `GET /api/ai/insights` (onglet "Suggestions") : calcule d'abord des
     faits déterministes en code (variation de dépense par catégorie vs
     mois dernier, budgets proches/dépassés du plafond) puis demande à
     Gemini de les reformuler en 2-4 suggestions courtes (JSON structuré via
     `responseJsonSchema`, pas de texte libre à parser).
  2. `POST /api/ai/chat` (onglet "Assistant") : interrogation en langage
     naturel. Le contexte envoyé au modèle est limité aux transactions/
     budgets des 3 derniers mois de l'utilisateur connecté ; prompt système
     qui interdit explicitement d'inventer des chiffres hors de ce contexte.
  3. `GET /api/ai/forecast` (onglet "Prévisions") : la projection chiffrée
     (moyenne mobile sur 3 mois) est calculée en code, **pas** par le
     modèle — seule la formulation en langage naturel du narratif est
     déléguée à Gemini, à partir des chiffres déjà calculés. Choix
     délibéré : un LLM ne doit pas faire l'arithmétique lui-même sur des
     montants financiers (risque d'hallucination de chiffres).
- Page `/assistant` (onglets Assistant / Suggestions / Prévisions), ajoutée
  à la navigation principale de la Sidebar (juste après le tableau de bord)
  et à `proxy.ts` (route protégée). Un bandeau sur le dashboard renvoie vers
  cette page.
- Gestion du quota gratuit : toute erreur 429/503 de l'API Gemini est
  interceptée et traduite en message français explicite côté UI plutôt que
  de faire planter la page ou d'afficher une erreur technique.
- `GEMINI_API_KEY` était déjà présente et renseignée dans `.env.local` avant
  cette refonte — non modifiée ici, non lue/affichée à aucun moment, déjà
  correctement ignorée par `.gitignore` (`*.env`) donc jamais commitée. Sa
  présence a permis de tester l'intégration IA en conditions réelles (voir
  Phase 6).

## Dépendances

`pnpm` était déjà le gestionnaire en place (pas de migration npm→pnpm
nécessaire, contrairement à l'hypothèse de départ — `pnpm-lock.yaml` et
`pnpm-workspace.yaml` existaient déjà). `pnpm update --latest` appliqué,
avec un ajustement ensuite :

- `next` 16.2.4 → 16.3.5, `react`/`react-dom` 19.2.4 → 19.3.0, `mongoose`
  9.4.1 → 9.10.1, `lucide-react` 1.8.0 → 1.47.0, `recharts` 3.8.1 → 3.10.1,
  `tailwindcss`/`@tailwindcss/postcss` → 4.3.3, `eslint-config-next` →
  16.3.5 : mis à jour sans réserve, aucune régression après build/lint.
- **`typescript` et `eslint` volontairement PAS mis à la toute dernière**
  (`7.0.2` et `10.11.0` respectivement), malgré la consigne "dernières
  versions". `pnpm` a signalé des conflits de peer dependencies réels et
  bloquants après le premier `update --latest` :
  - `typescript-eslint` (utilisé par `eslint-config-next`) exige
    `typescript@">=4.8.4 <6.1.0"` — incompatible avec TypeScript 7 (la
    nouvelle chaîne de compilation native, qui saute la branche 6.x
    "pont"). Résolu en épinglant `typescript@6.0.3`, la dernière version
    6.x stable compatible.
  - `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, `eslint-plugin-react`
    (dépendances d'`eslint-config-next`) plafonnent leur compatibilité à
    `eslint@^9`. Résolu en épinglant `eslint@9.39.5`, la dernière version
    9.x.
  - La consigne demande des versions "à jour" **et** "compatibles entre
    elles" — les deux dernières versions absolues (TS 7, ESLint 10) ne
    satisfont pas la seconde condition tant que `eslint-config-next` n'a
    pas republié une version compatible. Privilégié la compatibilité
    réelle du toolchain plutôt que le numéro de version le plus haut.
- `@types/node` : `pnpm update --latest` proposait `26.6.2`, qui correspond
  à une branche Node bien plus récente que la version de Node réellement
  installée sur cette machine (`node -v` → `22.14.0`). Épinglé à
  `22.20.4` (dernière version de la branche 22.x), pour que les types
  correspondent au runtime effectif plutôt qu'à un Node hypothétique.
- Ajout : `@google/genai` (voir Phase 5).
