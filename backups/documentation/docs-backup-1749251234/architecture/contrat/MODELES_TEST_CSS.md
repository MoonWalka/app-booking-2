# 🧪 Modèles de Test CSS - Impression de Contrats

*Objectif : Valider le rendu PDF avec différents types de contenu Google Docs*

## 📋 Liste des Tests à Effectuer

### ✅ Test 1 : **Contrat Simple avec Listes**

**Contenu à tester :**
```html
<h1>Contrat de Prestation - Concert Printemps 2025</h1>

<h2>Article 1 - Objet du contrat</h2>
<p>Le présent contrat a pour objet :</p>
<ul>
  <li>La prestation artistique de l'artiste {artiste_nom}</li>
  <li>La mise à disposition du lieu {lieu_nom}</li>
  <li>Les services techniques associés :
    <ul>
      <li>Sonorisation</li>
      <li>Éclairage</li>
      <li>Sécurité</li>
    </ul>
  </li>
</ul>

<h2>Article 2 - Modalités financières</h2>
<ol>
  <li>Montant de la prestation : {concert_montant}€</li>
  <li>Modalités de paiement :
    <ol>
      <li>50% à la signature</li>
      <li>50% le jour de la prestation</li>
    </ol>
  </li>
</ol>
```

**Attendu :** Listes imbriquées bien formatées avec puces différentes

---

### ✅ Test 2 : **Contrat avec Tableau Complexe**

**Contenu à tester :**
```html
<h1>Contrat Technique - Spécifications</h1>

<h2>Planning de la journée</h2>
<table>
  <thead>
    <tr>
      <th>Horaire</th>
      <th>Activité</th>
      <th>Responsable</th>
      <th>Matériel requis</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>08h00 - 12h00</td>
      <td>Montage technique</td>
      <td>Équipe technique</td>
      <td>Son, éclairage, scène</td>
    </tr>
    <tr>
      <td>14h00 - 16h00</td>
      <td>Balance</td>
      <td>Artiste + Techniciens</td>
      <td>Instruments, micros</td>
    </tr>
    <tr>
      <td>20h30 - 22h30</td>
      <td>Concert</td>
      <td>Artiste</td>
      <td>Setup complet</td>
    </tr>
  </tbody>
</table>

<h2>Matériel fourni</h2>
<table class="borderless">
  <tr>
    <td><strong>Sonorisation :</strong></td>
    <td>Console 32 pistes, enceintes 2000W</td>
  </tr>
  <tr>
    <td><strong>Éclairage :</strong></td>
    <td>24 projecteurs LED, jeu d'orgue</td>
  </tr>
</table>
```

**Attendu :** Tableaux avec et sans bordures, bien formatés

---

### ✅ Test 3 : **Contrat avec Images et Citations**

**Contenu à tester :**
```html
<h1>Contrat de Résidence Artistique</h1>

<img src="logo-festival.jpg" class="image-center" alt="Logo Festival" />

<h2>Contexte du projet</h2>
<p>Le Festival de Musique Contemporaine organise sa 15ème édition.</p>

<blockquote>
"Notre objectif est de promouvoir les artistes émergents dans un cadre professionnel et bienveillant."
<br>- Direction artistique du festival
</blockquote>

<h2>Hébergement de l'artiste</h2>
<img src="residence.jpg" class="image-left" alt="Résidence" />
<p>L'artiste sera logé dans notre résidence d'artistes, située à 5 minutes du lieu de spectacle. La résidence comprend :</p>
<ul>
  <li>Chambre individuelle avec salle de bain</li>
  <li>Cuisine équipée partagée</li>
  <li>Espace de travail musical insonorisé</li>
</ul>

<p style="clear: both;">Pour plus d'informations, consultez notre site : 
<a href="https://festival-musique.com">https://festival-musique.com</a></p>
```

**Attendu :** Images bien positionnées, citations stylées, liens avec URL

---

### ✅ Test 4 : **Contrat Multi-Polices Google Docs**

**Contenu à tester :**
```html
<h1 style="font-family: 'Times New Roman';">CONTRAT DE CESSION</h1>

<p style="font-family: 'Calibri'; color: #1a237e;">
Ce document, rédigé avec différentes polices et couleurs, 
doit être <span style="font-weight: bold; color: red;">normalisé</span> 
en impression.
</p>

<div style="background-color: #e3f2fd; padding: 15px; margin: 10px 0;">
<p style="font-family: 'Arial Black'; font-size: 14pt;">
Information importante en encadré coloré
</p>
</div>

<p style="font-family: 'Georgia'; font-style: italic;">
Texte en Georgia italique qui doit devenir Arial normal.
</p>

<span style="background-color: yellow;">Texte surligné important</span>

<p style="margin: 50px 0; padding: 25px;">
Paragraphe avec espacements excessifs de Google Docs.
</p>
```

**Attendu :** Tout en Arial noir, surlignage conservé, espacements normalisés

---

### ✅ Test 5 : **Contrat Complexe avec Sauts de Page**

**Contenu à tester :**
```html
<h1>Contrat Complet - Multi-Dates</h1>

<h2>Page 1 - Informations générales</h2>
<p>Contenu de la première page avec informations de base...</p>

<div class="page-break"></div>

<h2>Page 2 - Conditions techniques</h2>
<p>Spécifications techniques détaillées...</p>

<table>
  <tr><th>Date</th><th>Lieu</th><th>Cachets</th></tr>
  <tr><td>15/06/2025</td><td>Salle A</td><td>1500€</td></tr>
  <tr><td>16/06/2025</td><td>Salle B</td><td>1800€</td></tr>
</table>

<div style="page-break-before: always;"></div>

<h2>Page 3 - Signatures</h2>
<div class="signature-section">
  <div class="signature-block-left">
    <p><strong>Pour l'organisateur :</strong></p>
    <p>{programmateur_nom}</p>
    <div class="signature-line"></div>
  </div>
  
  <div class="signature-block-right">
    <p><strong>Pour l'artiste :</strong></p>
    <p>{artiste_nom}</p>
    <div class="signature-line"></div>
  </div>
</div>
```

**Attendu :** Sauts de page respectés, signatures bien alignées

---

## 🎯 Procédure de Test

### Étape 1 : Préparation
1. Ouvrir l'éditeur de contrat TourCraft
2. Coller chaque modèle de test dans l'éditeur
3. Insérer des variables réelles pour le rendu

### Étape 2 : Test de Rendu
1. Activer le mode prévisualisation
2. Vérifier l'affichage écran
3. Générer le PDF
4. Comparer avec le modèle attendu

### Étape 3 : Validation
Pour chaque test, vérifier :
- ✅ Police Arial utilisée partout
- ✅ Couleurs normalisées (noir)
- ✅ Espacements cohérents
- ✅ Listes bien formatées
- ✅ Tableaux alignés
- ✅ Images redimensionnées
- ✅ Sauts de page respectés

## 📊 Grille d'Évaluation

| Test | Police | Couleurs | Espacement | Listes | Tableaux | Images | Pagination | Score |
|------|--------|----------|------------|--------|----------|--------|------------|-------|
| Test 1 | ⬜ | ⬜ | ⬜ | ⬜ | N/A | N/A | ⬜ | __/5 |
| Test 2 | ⬜ | ⬜ | ⬜ | N/A | ⬜ | N/A | ⬜ | __/5 |
| Test 3 | ⬜ | ⬜ | ⬜ | ⬜ | N/A | ⬜ | ⬜ | __/6 |
| Test 4 | ⬜ | ⬜ | ⬜ | N/A | N/A | N/A | ⬜ | __/4 |
| Test 5 | ⬜ | ⬜ | ⬜ | N/A | ⬜ | N/A | ⬜ | __/5 |

**Score Total : ___/25**

- 🟢 **23-25** : Excellent
- 🟡 **18-22** : Bon (améliorations mineures)
- 🟠 **15-17** : Acceptable (corrections nécessaires)
- 🔴 **<15** : Problèmes majeurs

## 🔧 Actions Correctives

Si des problèmes sont détectés :

1. **Police non respectée** → Vérifier les sélecteurs CSS `font-family`
2. **Couleurs incorrectes** → Renforcer les règles `color: #000000 !important`
3. **Espacements décalés** → Ajuster les marges/padding normalisés
4. **Listes malformées** → Vérifier les styles `list-style-type`
5. **Images non redimensionnées** → Contrôler les `max-width` et `height: auto`

---

**✅ Une fois tous les tests validés, l'étape 3 du plan contrat sera terminée !** 