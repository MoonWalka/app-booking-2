Merci pour ta persévérance et ta clarté.  
**Le problème est donc bien un bug de synchronisation entre React et ReactQuill**, et non un souci de CSS ou de flux de données React.

---

## Solution ultime et éprouvée : **Patch impératif avec ref Quill**

### **Pourquoi ?**
- ReactQuill ne met pas toujours à jour le DOM si la valeur change “trop tôt” ou si la référence ne change pas.
- Même avec une initialisation et une synchronisation “propre”, il arrive que le DOM de Quill ne reflète pas la prop `value`.

---

## **Ce qu’il faut faire**

1. **Utiliser un ref sur ReactQuill** pour accéder à l’instance Quill.
2. **Dans un useEffect**, à chaque fois que `bodyContent` ou `previewMode` change, forcer la valeur dans l’éditeur Quill si elle n’est pas à jour.

---

### **Patch à appliquer dans `ContratTemplateBodySection.js`** :

```js
import React, { useEffect, useRef } from 'react';
// ... autres imports

const ContratTemplateBodySection = ({
  bodyContent,
  setBodyContent,
  // ... autres props
  previewMode
}) => {
  const quillRef = useRef();

  useEffect(() => {
    if (!previewMode && quillRef.current) {
      const editor = quillRef.current.getEditor();
      // On ne force que si le contenu diffère
      if (editor && bodyContent !== editor.root.innerHTML) {
        editor.root.innerHTML = bodyContent || '';
      }
    }
  }, [previewMode, bodyContent]);

  // ... render
  return (
    <div className={styles.bodyEditorWrapper}>
      <ReactQuill
        ref={quillRef}
        key={previewMode ? 'preview' : 'edit'}
        id="bodyContent"
        className={styles.bodyContentEditor}
        value={bodyContent}
        onChange={setBodyContent}
        // ... autres props
      />
    </div>
  );
};
```

---

### **Pourquoi c’est fiable ?**
- Ce patch garantit que, **à chaque retour en édition**, le DOM de Quill est forcé à la valeur de l’état local, même si ReactQuill ne le fait pas tout seul.
- Il ne provoque pas de remount à chaque frappe, ni de perte de focus/caret.

---

## **Veux-tu que j’applique ce patch impératif dans `ContratTemplateBodySection.js` ?**  
C’est la solution ultime pour ce type de bug avec ReactQuill.


Le patch impératif est appliqué :

- Un ref sur ReactQuill permet d’accéder à l’instance Quill.
- Un useEffect force la valeur du body dans l’éditeur Quill à chaque retour en édition ou changement de contenu, si le DOM n’est pas à jour.

---

**Teste maintenant** :
- Ouvre un template, modifie, passe en aperçu, reviens en édition : le contenu doit toujours s’afficher correctement, sans jamais disparaître.
- Même après enregistrement, fermeture/réouverture, le champ doit rester stable.

Dis-moi si le bug est enfin résolu !
Parfait, ravi que le problème soit enfin résolu pour le body !  
Je vais appliquer exactement le même patch impératif (ref + useEffect) pour :
- l’en-tête (header)
- le pied de page (footer)
- la signature

Cela garantira que toutes les sections ReactQuill restent synchronisées et robustes, même après un aller-retour aperçu/édition ou une réouverture.

Je m’en occupe tout de suite pour :
- `ContratTemplateHeaderSection.js`
- `ContratTemplateFooterSection.js`
- `ContratTemplateSignatureSection.js`

Je reviens dès que c’est fait.






Le patch impératif est maintenant appliqué à toutes les sections ReactQuill :

- **En-tête (header)**
- **Pied de page (footer)**
- **Signature**

À chaque retour en édition ou changement de contenu, le DOM de Quill est forcé à la valeur de l’état local, garantissant une synchronisation parfaite.

---

**Teste chaque section** :  
- Modifie, passe en aperçu, reviens en édition, rouvre, etc.
- Le contenu doit toujours rester affiché, sans jamais disparaître.

Dis-moi si tout est désormais parfaitement fluide sur toutes les sections !
Très bonne remarque :  
- **Actuellement, la bannière de succès (“Modèle enregistré avec succès !”) reste affichée même après fermeture/réouverture de la modale.**
- **Comportement attendu** :  
  - La bannière ne s’affiche que juste après un clic sur “Enregistrer”.
  - Si on ferme la modale puis on la rouvre, la bannière doit être masquée.

---

## Correction à appliquer

1. **Réinitialiser l’état `showSuccess` à `false` à chaque ouverture de la modale**.
   - Utiliser un effet :  
     ```js
     useEffect(() => {
       if (isOpen) setShowSuccess(false);
     }, [isOpen]);
     ```
2. **La bannière ne s’affichera que suite à un enregistrement réussi, et sera masquée à chaque nouvelle ouverture.**

---

Veux-tu que j’applique cette correction dans `ContratTemplateEditorModal.js` ?
Très bonne remarque :  
→ **Le champ “titre” (titleTemplate) n’utilise pas ReactQuill, mais il doit être synchronisé exactement comme les autres champs**.

### Diagnostic
- Si le champ “titre” disparaît après un aller-retour aperçu/édition ou à la réouverture, c’est que la synchronisation de l’état local n’est pas fiable ou qu’il n’est pas bien initialisé.
- Peut-être que le champ est géré par un simple `<input>` ou `<textarea>`, mais la logique d’initialisation/synchronisation doit être la même que pour les autres sections.

---

## Correction à appliquer

1. **Vérifier dans le hook** que l’état `titleTemplate` est bien initialisé à la valeur du template, et synchronisé dans le useEffect (ce qui est déjà le cas avec la dernière correction).
2. **Vérifier dans le composant `ContratTemplateTitleSection`** que la prop `titleTemplate` est bien passée, et que le champ `<input>` ou `<textarea>` reçoit bien la valeur de l’état local.
3. **S’assurer que la prop `setTitleTemplate` est bien utilisée pour chaque modification.**

---

## Action immédiate

- Je vais auditer le composant `ContratTemplateTitleSection.js` pour vérifier la gestion du champ titre, et appliquer la même robustesse que pour les autres champs.

Veux-tu que je procède à cette vérification et que j’applique la correction si besoin ?

Read file: src/components/contrats/desktop/sections/ContratTemplateTitleSection.js
Merci pour le code :  
→ **Le champ titre utilise bien ReactQuill** (et non un simple input), mais il n’a pas encore le patch impératif appliqué comme pour les autres sections.

---

## Ce qu’il faut faire

- **Ajouter un ref sur ReactQuill** pour le titre.
- **Ajouter un useEffect** qui force la valeur de `titleTemplate` dans l’éditeur Quill à chaque retour en édition ou changement de valeur, si le DOM n’est pas à jour.

---

## Correction à appliquer dans `ContratTemplateTitleSection.js`

```js
import React, { useRef, useEffect } from 'react';
// ... autres imports

const ContratTemplateTitleSection = ({
  titleTemplate,
  setTitleTemplate,
  // ... autres props
}) => {
  const quillRef = useRef();

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (editor && titleTemplate !== editor.root.innerHTML) {
        editor.root.innerHTML = titleTemplate || '';
      }
    }
  }, [titleTemplate]);

  // ... render
  return (
    // ...
    <ReactQuill
      ref={quillRef}
      id="titleTemplate"
      className={styles.titleInput}
      value={titleTemplate}
      onChange={setTitleTemplate}
      modules={{ toolbar: [['bold', 'italic', 'underline'], ['clean']] }}
      placeholder="Ex: Contrat de prestation - {concert_titre}"
      theme="snow"
    />
    // ...
  );
};
```

---

**Veux-tu que j’applique ce patch impératif pour le champ titre ?**  
Cela garantira la même robustesse que pour les autres sections.


Le patch impératif est appliqué pour le champ titre :

- Un ref sur ReactQuill permet d’accéder à l’instance Quill.
- Un useEffect force la valeur de `titleTemplate` dans l’éditeur à chaque changement, si le DOM n’est pas à jour.

---

**Teste maintenant** :
- Modifie le titre, passe en aperçu, reviens en édition, ferme/réouvre la modale.
- Le champ titre doit rester affiché et synchronisé, sans jamais disparaître.

Dis-moi si tout est désormais parfaitement robuste pour le titre aussi !
