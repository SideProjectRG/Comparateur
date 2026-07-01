# RunGuide Import Specification V1

## Objectif

Tous les flux d'affiliation (Awin, TradeDoubler, CJ, Amazon, Rakuten...) doivent être convertis vers le format RunGuide.

Le moteur du site ne lit jamais directement un flux partenaire.

Il lit uniquement le format RunGuide.

---

# Étapes d'import

1. Télécharger le flux

↓

2. Lire les colonnes

↓

3. Mapper les colonnes vers Database V1

↓

4. Nettoyer les données

↓

5. Dédupliquer les produits

↓

6. Fusionner les marchands

↓

7. Exporter vers la base RunGuide

---

# Exemple

Flux Awin

Product Name
↓

model

Merchant

↓

retailer

Sale Price

↓

price

Image URL

↓

images

Tracking URL

↓

affiliate_url

---

# Règles

Une chaussure = une seule fiche RunGuide.

Plusieurs marchands peuvent vendre la même chaussure.

Chaque marchand possède :

- prix
- disponibilité
- lien affilié
- date de mise à jour