# Audit des Restes de l'Ancien Système dans nouvelle-interface
**Date : 9 juillet 2025**

## Contexte
Cet audit identifie les éléments de l'ancien système (présent dans `main`) qui sont encore présents dans la branche `nouvelle-interface`. L'objectif est de nettoyer complètement la nouvelle interface de toute trace de l'ancien système.

## 1. Terminologie "concert" → "date" (251 références restantes)

### Fichiers CSS avec l'ancienne terminologie
```
src/styles/components/concerts.css
src/styles/pages/concerts.css
src/styles/base/colors.css (variables --tc-color-concert)
```

### Pages utilisant encore "concert"
- `ContratGenerationPage.js` : `const [concert, setDate] = useState(null)`
- `PreContratGenerationPage.js` : `const [concert, setDate] = useState(null)`  
- `ContratGenerationNewPage.js` : Utilise `concert` dans les props
- `FactureDetailsPage.js` : Utilise `concert` dans un objet
- `DateDetailsPage.js` : Commentaires avec "concert"

### Hooks avec références "concert"
- `useContratActions.js` : `concert` comme paramètre
- `usePdfPreview.js` : Vérifie `data.concert`
- `useFormValidationData.js` : `const [concert, setDate] = useState(null)`
- `contractVariables.js` : Variables de template avec "concert"

### Composants avec références "concert"
- `ContratGenerator.js` : `concert` dans les props
- `ContratGeneratorNew.js` : `concert` dans les props
- `ContratPDFWrapper.js` : Utilise `concert` dans les props
- `BrevoTemplateCustomizer.js` : Templates avec "concert"

### Services et utilitaires
- `brevoTemplateService.js` : Variables de template "concert"
- `templateVariables.js` : Définitions de variables "concert"
- `firebaseDataUtils.js` : Références dans les commentaires

## 2. Terminologie "organization" → "entreprise" (58 références restantes)

### Pages avec "organization"
- `PreContratFormResponsePage.js` : `const [organizationName, setOrganizationName]`
- `DateDetailsPage.js` : Commentaires

### Composants debug
- `BrevoKeyRecovery.js` : `organization: orgBrevoConfig`
- `EntrepriseContextDiagnostic.js` : `const organizationContext`

### Hooks
- `useFormTokenValidation.js` : `organizationData: null`

### CSS
- `Sidebar.module.css` : Classes `.organizationSelector`
- `contacts.css` : `.tc-contact-organization`

### Tests
- `contactCreationFromForms.test.js` : `mockOrganization`
- `brevoEmailIntegration.test.js` : Import de ParametresEmail (qui n'existe plus)

## 3. Composants de l'ancien système encore référencés

### Import fantôme
- `brevoEmailIntegration.test.js` : Importe `ParametresEmail` qui n'existe plus

### Variables de contexte obsolètes
- Références à `parametres` dans plusieurs fichiers
- Utilisation de `organizationContext` au lieu de `entrepriseContext`

## 4. Statistiques

- **251 références à "concert"** dans le code
- **58 références à "organization"** 
- **2 fichiers CSS** avec terminologie "concerts"
- **1 test** qui importe un composant supprimé

## 5. Plan de nettoyage recommandé

### Phase 1 : Renommage automatique (rechercher/remplacer)
1. `concert` → `date` dans toutes les variables
2. `Concert` → `Date` dans les noms de composants
3. `organization` → `entreprise`
4. `Organization` → `Entreprise`

### Phase 2 : Nettoyage manuel
1. Supprimer les fichiers CSS concerts
2. Mettre à jour les variables CSS dans colors.css
3. Corriger les imports dans les tests
4. Réviser les commentaires et documentation

### Phase 3 : Validation
1. Vérifier que tous les tests passent
2. Faire un build de production
3. Tester les fonctionnalités principales

## 6. Fichiers prioritaires à modifier

### Haute priorité (impact fonctionnel)
1. **Pages de génération de contrats** : Remplacer `concert` par `date`
2. **Hooks de contrats** : Mettre à jour les paramètres
3. **Services Brevo** : Actualiser les variables de template
4. **Tests** : Corriger les imports cassés

### Moyenne priorité (cohérence)
1. **Composants PDF** : Harmoniser la terminologie
2. **Variables CSS** : Renommer les variables de couleur
3. **Commentaires** : Mettre à jour la documentation

### Basse priorité (cosmétique)
1. **Fichiers de debug** : Peuvent être supprimés après validation
2. **CSS orphelins** : À supprimer

## Conclusion

La migration vers le nouveau système n'est pas complète. Il reste **309 références** à l'ancienne terminologie qui doivent être mises à jour pour assurer la cohérence et la maintenabilité du code. Un effort systématique de rechercher/remplacer suivi d'une révision manuelle est nécessaire.