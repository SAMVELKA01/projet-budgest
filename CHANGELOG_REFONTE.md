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
  (0.24.x, legacy). Modèle utilisé : `gemini-3.6-flash` (tier gratuit — voir
  Phase 6 pour pourquoi ce n'est pas `gemini-2.5-flash`, initialement choisi).
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

## Phase 6 — Validation finale

### ⚠️ Constat bloquant, indépendant du code

**La base MongoDB configurée dans `.env.local` (`MONGODB_URI`) est injoignable.**
En testant l'app avec `pnpm dev`, toute requête touchant la base échoue avec
`querySrv ENOTFOUND _mongodb._tcp.cluster0.q47fnqq.mongodb.net`. Vérification
DNS faite (`nslookup`) : ce cluster n'existe simplement plus (le domaine
`mongodb.net` racine résout bien, tout comme `cloud.mongodb.com` — seul ce
cluster spécifique renvoie *Non-existent domain*), très probablement un
cluster Atlas gratuit expiré/supprimé pour inactivité. **Ce n'est pas lié à
la refonte** : le code n'y peut rien, c'est une action à faire de ton côté
sur MongoDB Atlas (recréer un cluster ou récupérer l'ancien, puis mettre à
jour `MONGODB_URI`). Sans ça, aucune fonctionnalité liée aux données ne peut
fonctionner (inscription, connexion, transactions, etc.), quelle que soit la
qualité du code.

### Comment j'ai quand même validé le code en conditions réelles

Pour ne pas me contenter de "ça build", j'ai lancé une MongoDB locale
temporaire et jetable (`mongodb-memory-server`, dans un dossier `/tmp`
séparé du projet, jamais ajoutée aux dépendances), et un second serveur
`pnpm dev` sur le port 3001 pointé dessus via une variable d'environnement
passée en ligne de commande — **`.env.local` n'a jamais été modifié**. J'ai
ensuite testé, en conditions réelles (`curl`, pas de simulation) :

- Inscription, connexion (flow CSRF + credentials complet), session
- Création/lecture/modification/suppression : catégories, transactions,
  budgets, objectifs
- Isolation des données entre utilisateurs (un utilisateur ne peut ni lire
  ni modifier les données d'un autre — testé explicitement, 404 correct)
- Dashboard stats et endpoint `/api/stats` (granularité jour/semaine/mois)
- Panel admin : stats globales, liste/recherche/filtres utilisateurs,
  changement de rôle, activation/désactivation, reset de mot de passe par
  un admin, garde-fou anti-auto-verrouillage
- Mot de passe oublié de bout en bout : demande → email (log console) →
  lien avec token → réinitialisation → ancien mot de passe rejeté, nouveau
  accepté
- Suppression de compte (cascade des données, session coupée)
- Assistant IA : chat, suggestions, prévisions — avec la vraie clé Gemini
  déjà présente dans `.env.local`

Cette MongoDB de test et le serveur sur le port 3001 ont été arrêtés et
tous les fichiers temporaires supprimés une fois les tests terminés.

### Bugs trouvés et corrigés grâce à ces tests réels (pas visibles par build/lint)

1. **Nom de modèle Gemini obsolète.** Le premier appel IA réel a échoué :
   l'API Gemini elle-même a répondu que `gemini-2.5-flash` "is no longer
   available to new users" et a explicitement recommandé
   `models/gemini-3.6-flash`. Corrigé dans `lib/ai/gemini.ts` en suivant
   cette indication de l'API elle-même. Après correction, chat/suggestions/
   prévisions fonctionnent ; j'ai aussi involontairement déclenché un vrai
   `429` (quota gratuit dépassé après plusieurs appels rapprochés), qui a
   confirmé que la gestion d'erreur de quota fonctionne correctement
   (message clair en français, pas de crash).
2. **Lien de réinitialisation invisible dans les emails "console".**
   `lib/email/index.ts` dépouillait tout le HTML (y compris les `href`)
   avant de logger l'email — le seul contenu actionnable d'un email de
   reset de mot de passe disparaissait. Corrigé : les liens sont extraits
   avant le nettoyage HTML et affichés séparément dans le log.
3. **Compte désactivé/supprimé restait utilisable via une session déjà
   ouverte (faille de sécurité réelle).** En testant le scénario "un admin
   désactive un utilisateur pendant qu'il est connecté", j'ai découvert
   qu'avec la stratégie JWT, la session existante restait pleinement
   valide (au lieu de bloquer *les futures connexions seulement*, comme prévu) —
   confirmé en créant des données avec la session d'un compte que je venais
   de supprimer. Root cause : NextAuth n'appelle pas le callback `jwt` à
   chaque lecture de session, seulement à la connexion (vérifié en ajoutant
   des logs temporaires, retirés depuis). Corrigé en ajoutant la
   revalidation contre la base directement dans `proxy.ts`, qui lui
   s'exécute sur chaque requête protégée (pages **et** API — le matcher
   inclut maintenant `/api/:path*`, en excluant `/api/auth/*` pour ne pas
   interférer avec NextAuth). Un compte désactivé ou supprimé perd
   maintenant l'accès à la requête suivante, pas seulement à l'expiration
   du JWT (jusqu'à 30 jours par défaut). Revérifié après coup : compte actif
   toujours fonctionnel, compte désactivé immédiatement rejeté (401 en API,
   redirection `/login` sur les pages), garde-fou anti-auto-désactivation
   toujours actif.

### Build, lint, démarrage

- `pnpm build` : ✅ compile et type-check sans erreur
- `pnpm lint` : ✅ 0 erreur, 0 warning
- `pnpm dev` : ✅ démarre sans erreur, pages publiques et redirections des
  pages protégées vérifiées par requêtes HTTP réelles

## Phase 4 (v2) — Refonte du design suite au retour utilisateur

L'identité "banque privée" (bleu marine + laiton, serif Newsreader, coins
peu arrondis, décrite plus haut) n'a **pas convenu** : jugée illisible et pas
du tout dans l'esprit recherché. L'utilisateur a fourni deux images de
référence (maquettes d'app fintech mobile, une claire une sombre) demandant
un style "exactement" identique, en violet plutôt que les couleurs des
images. Nouvelle identité, appliquée à toute l'app y compris la landing :

- **Palette** : violet `#6C5DD3` comme couleur de marque/accent (boutons,
  liens, états actifs), encre quasi-noire `#15131F` pour la sidebar et le
  texte, fond très clair `#F7F7FC`. Mode sombre aligné sur l'image de
  référence sombre (fond quasi-noir `#121018`, cartes `#1C1A28`).
- **Typographie** : une seule famille, Plus Jakarta Sans (géométrique,
  arrondie), pour titres et corps de texte — abandon du couple serif/mono
  précédent.
- **Rayons de bordure** : très généreux (14 à 28px selon la taille), plus
  proches de l'esthétique "app mobile" que du style "document financier"
  précédent.
- **Landing page refaite entièrement** (Hero, Navbar, Features, Pricing,
  Testimonials, FAQ, Footer) : abandon du concept éditorial "relevé
  bancaire" au profit d'une landing SaaS moderne classique (bandeau violet,
  carte d'aperçu du dashboard flottante, badges d'icônes colorés). Passage
  d'un style à base de `style={{ }}` inline vers des classes Tailwind
  standard, cohérent avec le reste de l'app.
- **Palettes de catégories/objectifs** : repassées à des couleurs vives
  (violet, teal, ambre, rose, bleu, vert...) plutôt que les tons sourds de
  la V1 "banque privée".
- **Cartes sans bordure** : deuxième retour ("les cartes et les bordures ne
  sont pas comme sur l'image") — remplacé `border border-border` par
  `shadow-sm` sur la quasi-totalité des cartes de contenu (~36 occurrences
  sur 10 fichiers), pour un rendu "élevé par l'ombre" plutôt que "délimité
  par un trait", conforme aux maquettes de référence. Bordures conservées
  uniquement sur les petits éléments de contrôle (barre de recherche,
  interrupteur d'onglets) où elles restent pertinentes.
- Bug corrigé au passage : `app/(dashboard)/admin/page.tsx` utilisait des
  classes `bg-light`/`bg-light/50`, un token de couleur qui n'a jamais existé
  dans le thème — ces éléments n'avaient donc aucun fond. Remplacées par
  `bg-neutral`/`bg-neutral-dark`.

### Bug de résilience corrigé : connexion MongoDB qui reste bloquée

En diagnostiquant une erreur `MongooseServerSelectionError` (IP non
autorisée dans MongoDB Atlas — un réglage à faire côté utilisateur, hors de
portée du code), un vrai bug a été trouvé dans `lib/db/mongoose.ts` : une
fois la première tentative de connexion échouée, la promesse rejetée restait
mise en cache indéfiniment (`cached.promise`), donc **toutes** les requêtes
suivantes rejouaient la même erreur — même après correction du problème côté
Atlas — jusqu'à un redémarrage complet du serveur. Corrigé en réinitialisant
`cached.promise` à `null` en cas d'échec, pour que l'appel suivant retente
une vraie connexion au lieu de rejouer l'échec en cache.

## Phase 7 — Refonte design "Bento Neutre" (2026-09-22)

Nouvelle demande explicite de l'utilisateur : abandon complet de l'identité
violet/serif (V1 "banque privée" puis V2 "fintech mobile violette", décrites
plus haut) au profit d'un système **"Bento Neutre"** — noir/blanc comme
seule couleur de marque, fond neutre chaud, cartes définies par une bordure
fine plutôt qu'une ombre, une seule police sans-serif géométrique, couleurs
vives réservées strictement aux données. Direction fournie avec un jeu de
tokens exact (hex précis) et trois captures de dashboards de référence
(style "bento" : cards blanches sur fond beige/gris clair, icônes discrètes,
chiffres héros en gras). Travail exécuté en autonomie complète, page par
page, sans validation intermédiaire.

### Fondations (`app/globals.css`, `app/layout.tsx`)

- Jeu de tokens `@theme` entièrement redéfini :
  - `--color-app` (nouveau) : fond de page neutre chaud, distinct du fond
    des cards. `--color-neutral`/`--color-neutral-dark` deviennent le rôle
    "bg-card-alt" (inputs, cercles d'icônes, pistes de barres de
    progression, survols) plutôt que le fond de page — `bg-neutral` sur les
    wrappers de section pleine page a été renommé en `bg-app` (3 endroits :
    layout dashboard, Hero, Pricing, FAQ) pour séparer proprement les deux
    rôles qui étaient confondus dans l'ancien système.
  - `--color-primary`/`--color-secondary` pointent maintenant vers la même
    encre noire (`#13141A` clair / `#F5F5F2` sombre) — **plus aucune
    couleur violette de marque**. Comme `text-secondary`/`bg-secondary`
    n'étaient utilisés dans le code existant QUE comme accent de marque
    générique (jamais comme "texte secondaire" sémantique), ce simple
    changement de valeur de token a corrigé automatiquement ~70 usages
    (liens, focus, badges, icônes) sans avoir à renommer une seule classe.
  - `--color-inverse` (nouveau) : blanc en clair / encre en sombre — le texte
    qui doit rester lisible sur un bouton ou bandeau `bg-primary`, qui lui
    s'inverse avec le thème. **Bug corrigé au passage** : l'ancien système
    n'avait pas cette notion et utilisait du texte blanc en dur sur les
    boutons `bg-primary` — en mode sombre, `bg-primary` devient clair, donc
    ce texte blanc serait devenu illisible (blanc sur blanc). Toutes les
    occurrences (`bg-primary text-white` / `bg-secondary text-white`, ~60
    dans les 8 pages du dashboard + Sidebar + ConfirmModal) ont été migrées
    vers `text-inverse`.
  - Nouvelles couleurs de données : `--color-info` (bleu, IA), `--color-violet`
    (violet, catégories — usage ponctuel uniquement désormais), en plus de
    `--color-success`/`--color-danger`/`--color-warning` recolorées vers la
    palette "Bento Neutre" exacte (vert `#4CAF7D`, rouge `#E15B5B`, orange
    `#E8A33D`).
  - `--color-sidebar` (existait mais n'était pas utilisé) : maintenant
    réellement appliqué à la sidebar (voir plus bas).
  - Rayons ajustés : `--radius-xl` (boutons) passé de 18px à 12px comme
    demandé ; `--radius-2xl` (cards) laissé à 22px, déjà dans la fourchette
    20-24px demandée.
  - Mode sombre : même mécanisme que l'existant (overrides `[data-theme="dark"] .classe { ... !important }`,
    car les tokens Tailwind v4 de ce projet sont inlinés à la compilation et
    non exposés comme variables CSS réassignables à la volée) mais entièrement
    recalculé pour les nouvelles valeurs, plus les nouveaux sélecteurs
    `.bg-app`, `.bg-sidebar`, `.bg-primary`, `.text-inverse`/`.bg-inverse`.
- Police : `Plus_Jakarta_Sans` remplacée par `Geist` (`next/font/google`),
  seule famille pour titres et corps de texte.
- `ThemeContext` : ajout de la détection de préférence système
  (`prefers-color-scheme`) quand aucun choix n'est enregistré en
  localStorage, au lieu de toujours forcer le clair — clair reste le
  défaut si le système ne préfère pas le sombre, conforme à la consigne.
- Nouveau composant `components/ui/ThemeToggle.tsx`, ajouté dans
  `DashboardHeader` (desktop) ; le sélecteur clair/sombre déjà présent dans
  Paramètres reste fonctionnel et partage le même contexte.

### Sidebar & Header (`components/layout/Sidebar.tsx`, `DashboardHeader.tsx`)

- Fond de la sidebar (desktop, barre mobile, tiroir mobile) : `bg-primary`
  (encre pleine, ne s'inversait jamais avec le thème) → `bg-sidebar` (blanc
  en clair / noir profond en sombre, comme spécifié).
- Item de navigation actif : bloc violet plein + texte blanc → fond discret
  `bg-neutral` + texte/icône `text-primary` + petite pastille verticale
  `bg-primary` à gauche (repère visuel sans bloc plein).
- Avatar utilisateur, logo, bouton "Nouvelle transaction" : recolorés en
  `bg-primary`/`text-inverse`.

### Landing page (`components/layout/*.tsx`, `app/not-found.tsx`)

- Navbar, Hero, Features, Pricing, Testimonials, FAQ, Footer : tous les
  accents violets (`bg-secondary`, `text-secondary`, badges `bg-secondary/10`)
  recolorés en noir/blanc (`bg-primary`/`text-inverse`) ou en couleur de
  donnée dédiée (`text-info` pour les mentions IA).
- Cards de la grille "Fonctionnalités" et "Témoignages" : cercles d'icônes
  colorés (violet/teal/ambre en 15% d'opacité) → cercles neutres `bg-white`
  sur fond `bg-neutral`, avec l'icône elle-même colorée seulement quand un
  sens réel existe (IA = bleu, objectifs = vert).
- Footer : ancien bandeau plein `bg-primary` (toujours sombre, quel que soit
  le thème, avec texte blanc en dur) remplacé par un footer neutre
  (`bg-white`, texte `text-primary`/`text-tertiary`) qui suit le thème
  correctement — l'ancien bandeau aurait cassé en mode sombre (`bg-primary`
  devient clair, le texte blanc en dur serait devenu illisible).
- `app/not-found.tsx` : ce fichier utilisait encore un **style inline
  totalement différent** de l'app (`background: "#0B1F3A"`, police
  `var(--font-manrope)` qui n'existe même plus depuis la V2), reste de la
  toute première identité "banque privée". Réécrit avec les classes
  Tailwind du système actuel.
- Panneau de gauche des pages `/login`, `/register`, `/forgot-password`,
  `/reset-password` : `bg-secondary` (violet) → `bg-primary`, textes
  `text-white` → `text-inverse` (nécessaire pour rester lisible si l'app
  bascule en sombre, où `bg-primary` s'inverse en clair).
- `/register` : ajout d'une barre de force du mot de passe (4 segments,
  couleur selon le nombre de critères remplis — longueur, majuscule,
  chiffre, caractère spécial), demandée dans le brief.

### Dashboard — toutes les pages

Traitement systématique appliqué à `dashboard`, `transactions`, `budgets`,
`categories`, `objectifs`, `statistiques`, `assistant`, `admin`,
`admin/users`, `parametres` :

- Cards : `bg-white shadow-sm rounded-2xl` (ombre, pas de bordure) →
  `bg-white border border-border rounded-2xl` (bordure fine, quasi pas
  d'ombre en clair) — conforme à la consigne explicite sur le mode clair.
  Les cards interactives (catégories, objectifs) gardent un léger
  `hover:shadow-lg` en plus de la bordure, pour le retour visuel au survol.
- Cards métriques : icônes déplacées de cercles teintés par couleur
  (`bg-success/10`, `bg-secondary/10`, `bg-teal/10`, `bg-[#EC4899]/10`...)
  vers des cercles neutres uniques `bg-neutral`, l'icône elle-même gardant
  sa couleur sémantique quand elle en a une (vert = revenu, rouge = dépense,
  orange = alerte) — conforme à "supprime les cercles de fond colorés
  pleins qui cassent la cohérence". Chiffres héros passés en
  `tabular-nums`, taille augmentée (`text-3xl`/`text-4xl`), labels remontés
  en caption uppercase `text-[11px] tracking-wider`.
- Boutons d'action principale ("Ajouter une transaction", "Nouveau
  budget", "Nouvelle catégorie", "Nouvel objectif") : déjà en `bg-primary`
  dans le code existant (jamais violets à cette échelle précise), mais le
  texte est passé de `text-white` à `text-inverse` pour rester lisible en
  mode sombre.
- Inputs de formulaire (modales "Nouvelle transaction"/"Nouveau
  budget"/etc.) : `border border-border` + `focus:border-secondary` (violet)
  → `bg-neutral` sans bordure lourde + `focus:ring-2 focus:ring-primary`,
  conforme à la consigne "inputs en bg-card-alt sans bordure lourde, focus
  visible net".
- Graphiques : couleurs codées en dur (`#22C55E`, `#EF4444`, `#15131F`,
  `#EDEDF7`, ancien vert/rouge/encre/bordure) remplacées par la nouvelle
  palette de données (`#4CAF7D`, `#E15B5B`, `#13141A`). Légendes converties
  en pills (`bg-neutral` + point de couleur + libellé) sur Tableau de bord,
  Statistiques et Assistant IA (prévisions), conforme à "légendes en
  pills".
- Bandeau Assistant IA (Tableau de bord) : contraste fort `bg-primary`
  conservé tel que demandé ("conserve le principe d'un bloc à fort
  contraste"), texte passé en `text-inverse` pour la même raison que
  partout ailleurs.
- Assistant IA (page) : suggestions cliquables passées en pills
  (`rounded-full`), icônes Sparkles/Lightbulb/TrendingUp recolorées en
  bleu (`text-info`, couleur dédiée IA) au lieu du violet générique. Le
  rendu d'un mini-graphique *dans une réponse de chat* n'a pas été
  implémenté : l'API `/api/ai/chat` actuelle renvoie du texte libre, pas de
  données structurées de graphique — ce serait un ajout fonctionnel côté
  IA/API, hors du périmètre d'une refonte purement design. Le point est
  documenté ci-dessous dans les tâches restantes.
- Palettes de couleurs "au choix" (sélecteur de couleur catégorie/objectif,
  couleur rapide à la création) : conservées comme fonctionnalité
  (l'utilisateur choisit la couleur de SA catégorie, ce n'est pas une
  couleur de marque) mais réordonnées pour ne plus proposer le violet
  `#6C5DD3` en première position par défaut.
- Titres de page (`h1`) : taille remontée de `text-2xl` (24px, sous la
  fourchette demandée) à 28px, poids `font-bold` → `font-semibold`,
  conforme à "H1 de page 28-32px semi-bold".
- Badges de rôle admin (`admin/users`) : recolorés en violet (`--color-violet`,
  seul usage légitime restant pour "accent secondaire ponctuel") plutôt
  qu'en gris neutre, pour rester visuellement distinguable du badge de
  statut actif/inactif (vert/rouge) juste à côté.

### Vérification

- `pnpm build` : compile et type-check sans erreur.
- `pnpm lint` : 0 erreur, 0 warning.
- Serveur `pnpm dev` déjà actif réutilisé (hot-reload Turbopack) : pages
  publiques (`/`, `/login`, `/register`, `/forgot-password`) vérifiées à
  200, redirections protégées (`/dashboard`, `/admin`) vérifiées à 307,
  page 404 personnalisée vérifiée. HTML et CSS compilés inspectés
  directement (`curl`) pour confirmer l'absence de toute trace de
  `#6C5DD3` (violet) ou de la police Jakarta, et la présence des nouveaux
  tokens (`bg-app`, encre `#13141A`, règles `[data-theme="dark"]`).
- Aucun outil de capture d'écran natif n'étant disponible dans cet
  environnement (pas de navigateur MCP connecté), Playwright + Chromium
  ont été installés ponctuellement (non ajoutés aux dépendances du projet)
  pour une vérification visuelle réelle, en plus de la vérification
  fonctionnelle ci-dessus.
- **Bug réel trouvé grâce à cette vérification visuelle, invisible au
  build/lint** : tous les titres s'affichaient dans une police à
  empattements (serif) au lieu de Geist. Cause : la classe de police
  next/font était posée sur `<body>` (`app/layout.tsx`) alors que les
  tokens `--font-sans`/`--font-heading` sont consommés au niveau
  `<html>`/`:root` — un ancêtre de `<body>` ne peut pas lire une variable
  CSS définie sur un descendant. `font-family: var(--font-heading)`
  devenait donc invalide au niveau `<html>`, et le navigateur retombait
  sur sa police par défaut (serif), héritée par toute la page. Corrigé en
  déplaçant `className={geist.variable}` de `<body>` vers `<html>`.
  Revérifié avec un script de diagnostic (lecture de la police réellement
  calculée par le navigateur sur plusieurs éléments) : Geist s'applique
  maintenant correctement partout.
- Vérification visuelle complète : compte de test créé
  (`qa-test-bento@example.invalid`), connexion réelle, captures d'écran de
  la landing page, connexion, inscription, tableau de bord, transactions,
  budgets, objectifs, statistiques, catégories, assistant IA et paramètres
  — en mode clair et en mode sombre. Rendu conforme au design system sur
  toutes les pages testées (bento neutre, pas de violet résiduel, pas de
  serif, texte lisible dans les deux modes). Compte de test supprimé après
  vérification (`DELETE /api/users/profile`), aucune donnée de test
  laissée en base.
