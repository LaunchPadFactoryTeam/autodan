# Autodan — site vitrine + micro-backoffice

Site du concessionnaire Autodan (Nice), direction **C « Catalogue »**, avec un backoffice sans login pour
publier les véhicules. Next.js 16 (App Router), hébergement **Vercel** (offre gratuite), stockage **Vercel
Blob**, formulaire **Tally**, statistiques **Umami**. Coût visé : 0 €/mois.

Les maquettes et la note technique d'origine sont dans `project/` et `chats/` (voir `HANDOFF.md`).

## Ce qu'il y a dedans

**Site public** — `/`, `/voitures`, `/voitures/<slug>`, `/a-propos`, `/contact`

- Pages statiques régénérées à la demande (ISR) : chargement instantané, régénération dès qu'une fiche change.
- SEO : une vraie URL par véhicule, titres et descriptions générés depuis la fiche, canonical, Open Graph
  (photo du véhicule), `sitemap.xml` (avec images), `robots.txt`, JSON-LD `AutoDealer`, `Car` + `Offer`
  (prix, disponibilité, kilométrage…), `BreadcrumbList`, `ItemList`.
- GEO (moteurs de réponse IA) : `/llms.txt` résume l'entreprise et le stock à jour avec prix ; les crawlers
  IA sont autorisés sur les pages publiques ; contenus factuels et balisage sémantique.
- Mobile : menu repliable, filtres repliables, galerie au doigt, barre « Appeler / Poser une question » fixe
  sur les fiches, champs à 16 px (pas de zoom iOS). Polices auto-hébergées via `next/font`, images AVIF/WebP.
- Formulaires de contact et de question réellement envoyés : enregistrés dans le backoffice (+ alerte e-mail
  optionnelle via Resend).

**Backoffice** — `https://<site>/gestion/<ADMIN_TOKEN>` (pas de mot de passe : le lien est le secret)

- **Ajouter un véhicule** : deux portes, un seul écran de relecture.
  - Porte 1 « champ par champ » : le formulaire Tally intégré (ou le formulaire natif si Tally n'est pas relié).
  - Porte 2 « coller le contenu » : photos + bloc `clé : valeur` produit par un assistant à partir de
    l'annonce, avec la consigne à copier. Parseur tolérant (accents, « 13 900 € », puces, emoji, clés
    inconnues signalées) — testé sur l'annonce Fiesta (`npm test`).
  - Relecture obligatoire : chaque valeur est modifiable, champs vides surlignés, carburant et boîte recalés
    sur les valeurs des filtres, lignes non reconnues affichées. Rien n'est publié avant « Mettre en ligne ».
- **Stock** : prix et statut (En vente / Vendu / Masqué) modifiables en un geste, modifier, supprimer.
- **Messages** : demandes de contact et questions sur les fiches, avec boutons Appeler / SMS / e-mail.
- **Statistiques** : visiteurs, clics « Appeler », formulaires envoyés, fiches les plus vues (Umami).
- Photos redimensionnées dans le navigateur puis recompressées côté serveur (≈ 6 Mo → 400 Ko).

## Mise en ligne sur Vercel (≈ 15 min)

1. Poussez ce dépôt sur GitHub, puis sur [vercel.com](https://vercel.com) → *Add New → Project* → importez-le
   (framework détecté : Next.js, aucun réglage).
2. *Storage → Create → Blob* → connectez-le au projet (crée `BLOB_READ_WRITE_TOKEN`).
3. *Settings → Environment Variables* :
   - `NEXT_PUBLIC_SITE_URL` = l'adresse finale du site, ex. `https://autodan.fr`
   - `ADMIN_TOKEN` = une longue chaîne aléatoire (`openssl rand -hex 24`)
4. *Deployments → Redeploy*. Le lien du client est `https://<site>/gestion/<ADMIN_TOKEN>`.
5. Optionnel mais prévu : Tally (`docs/TALLY.md`), Umami (`docs/UMAMI.md`), alerte e-mail
   (`RESEND_API_KEY`, `NOTIFY_EMAIL`). Toutes les variables sont listées dans `.env.example`.
6. Domaine : *Settings → Domains*. Pensez à mettre à jour `NEXT_PUBLIC_SITE_URL`, puis déclarez le sitemap
   dans Google Search Console et créez/liez la fiche Google Business Profile (adresse identique au site).

**Côté client** : ouvrir le lien de gestion sur son téléphone → *Partager → Sur l'écran d'accueil*. Pour
couper l'accès (téléphone perdu…), changer `ADMIN_TOKEN` sur Vercel et redéployer : l'ancien lien meurt.

Avant de fermer le compte Webflow : `npm run assets:import` rapatrie le logo, les photos de la Dacia et la
photo du témoignage dans `public/images/webflow` (ou ré-importez les photos de la Dacia depuis le backoffice).

## Développement

```bash
npm install
ADMIN_TOKEN=un-secret-de-16-caracteres-min npm run dev   # http://localhost:3000/gestion/<ADMIN_TOKEN>
npm test        # parseur du collage + mapping Tally
npm run build
```

Sans `BLOB_READ_WRITE_TOKEN`, tout est enregistré dans `.data/` (ignoré par git) : pratique en local. Sur
Vercel, l'absence de Blob est signalée en rouge dans le backoffice.

## Où sont les choses

| | |
|---|---|
| `app/(site)/` | pages publiques · `app/site.css` le style de la direction C |
| `app/gestion/[token]/` · `components/admin/` | backoffice |
| `app/api/` | `contact`, `tally` (webhook), `admin/*` (cars, drafts, photos, messages) |
| `lib/site.ts` | coordonnées, services, textes « à propos », témoignage |
| `lib/parse-paste.ts` · `lib/tally.ts` | les deux portes d'entrée → une fiche |
| `lib/store.ts` | stockage (Blob en prod, `.data/` en local) |
| `lib/seo.ts` · `app/sitemap.ts` · `app/robots.ts` · `app/llms.txt/` | SEO / GEO |
| `lib/prompt.ts` | la consigne à donner à l'assistant (affichée dans le backoffice) |
