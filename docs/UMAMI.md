# Umami — statistiques sans cookie

Umami répond aux trois questions de la note : **combien de visiteurs**, **quelles fiches sont regardées**,
**combien de contacts en sortent**. Sans cookie, donc sans bandeau de consentement. Offre gratuite d'Umami
Cloud (hébergement UE) largement suffisante.

## 1. Activer la mesure

1. Créez un compte sur [cloud.umami.is](https://cloud.umami.is) → *Add website* → nom « Autodan », domaine
   du site.
2. Copiez le **Website ID** (Settings → Tracking code, `data-website-id="…"`).
3. Vercel → *Environment Variables* : `NEXT_PUBLIC_UMAMI_WEBSITE_ID = <Website ID>`, puis redéployez.

Le script n'est chargé que sur le site public (jamais sur /gestion).

## 2. Les évènements déjà en place

| Évènement | Déclenché par | Propriétés |
|---|---|---|
| `Appeler` | chaque lien téléphone (en-tête, accueil, fiche, barre mobile, contact, pied de page) | `emplacement`, `vehicule` sur les fiches |
| `E-mail` | chaque lien e-mail | `emplacement`, `vehicule` |
| `Formulaire envoyé` | envoi réussi du formulaire de contact ou d'une question sur une fiche | `type`, `vehicule` |

C'est ce qui permet de mesurer des **contacts** et pas seulement des visites.

## 3. Afficher les chiffres dans le backoffice (onglet Statistiques)

Au choix, ou les deux :

- **Chiffres intégrés** (visiteurs, appels, formulaires, fiches les plus vues) : Umami Cloud → *Settings →
  API keys → Create key*, puis `UMAMI_API_KEY = <clé>` sur Vercel.
- **Tableau de bord complet** : Umami → website → *Edit → Share URL → Enable*, copiez l'URL et mettez-la dans
  `UMAMI_SHARE_URL`. Le backoffice l'affiche et propose un lien pour l'ouvrir.

Umami auto-hébergé : renseignez aussi `NEXT_PUBLIC_UMAMI_SCRIPT_URL` (adresse de `script.js`) et
`UMAMI_API_URL` (`https://votre-umami/api`) ; `UMAMI_API_KEY` est alors un jeton Bearer.

## Si le trafic décolle

Cloudflare Web Analytics est gratuit sans plafond : même classement des pages les plus vues, bascule en un
quart d'heure (remplacer le script dans `app/(site)/layout.tsx`).
