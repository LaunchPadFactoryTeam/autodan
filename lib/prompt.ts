/** The instruction the client keeps in his notes and pastes into any assistant, followed by his ad (note technique, option C). */
export const LLM_PROMPT = `Reformate l'annonce ci-dessous au format clé : valeur, une clé par ligne,
dans cet ordre exact et sans rien ajouter :

brandName, model, subtitle, year, month, price, km, fuel, gearbox, power,
color, seats, intro, highlights, equipment.interieur, equipment.exterieur,
equipment.conduite, equipment.securite, description

Règles :
- price et km en chiffres seuls, sans espace, sans € ni km
- power en chiffres seuls (chevaux DIN)
- highlights et equipment.* en listes à tirets, un élément par ligne
- intro : une seule phrase, 120 caractères maximum
- description : le texte de vente, sans la liste des équipements
- n'invente aucune information : si elle est absente, omets la clé

Annonce :
[coller ici]`;

export const PASTE_EXAMPLE = `brandName : Ford
model : Fiesta
subtitle : 1.0 EcoBoost Hybrid 125 ch
year : 2020
month : 12
price : 13900
km : 48000
fuel : Essence micro-hybride (mHEV)
gearbox : Manuelle 6 rapports
power : 125
color : Gris magnétique métallisé
seats : 5
intro : Première main, suivi d'entretien complet, révision et contrôle technique de 2026.
highlights :
- Première main
- Révision complète 04/2026
equipment.interieur :
- Apple CarPlay / Android Auto
- Climatisation automatique
equipment.securite :
- ABS, ESP
description :
Très belle Ford Fiesta de décembre 2020 dans un excellent état général.`;
