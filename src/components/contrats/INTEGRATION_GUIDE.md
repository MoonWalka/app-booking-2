# Guide d'intégration de ContratPdfViewerWithControls

## 🎯 Objectif
Remplacer tous les aperçus de contrats simples par le nouveau composant avec contrôles de zoom, impression et téléchargement.

## ✅ Intégration déjà effectuée

### 1. ContratPdfViewer.js
**Fichier**: `/src/components/contrats/sections/ContratPdfViewer.js`
**Status**: ✅ Modifié

L'iframe simple a été remplacé par :
```javascript
<ContratPdfViewerWithControls
  pdfUrl={pdfPreviewUrl}
  height="750px"
/>
```

## 📋 Intégrations à faire

### 2. ContratRedactionPage.js (Aperçu HTML)
**Fichier**: `/src/pages/ContratRedactionPage.js`
**Ligne**: ~1096

Pour ajouter des contrôles d'impression/zoom à l'aperçu HTML :

```javascript
// Remplacer :
<div className={`${styles.previewDocument} ${styles.a4Preview}`} 
     dangerouslySetInnerHTML={{ __html: previewContent }} />

// Par :
<ContratPdfViewerWithControls
  pdfUrl={`data:text/html;charset=utf-8,${encodeURIComponent(previewContent)}`}
  height="100%"
/>
```

### 3. Pour les PDF générés avec Puppeteer

Quand vous avez une URL Firebase du PDF généré :

```javascript
// Exemple d'utilisation avec Firebase Storage
const pdfUrl = await getDownloadURL(storageRef);

<ContratPdfViewerWithControls
  pdfUrl={pdfUrl}
  height="750px"
/>
```

## 🔧 Props disponibles

```typescript
ContratPdfViewerWithControls.propTypes = {
  pdfUrl: string.isRequired,    // URL du PDF ou HTML
  width: string,                 // Largeur (défaut: "100%")
  height: string                 // Hauteur (défaut: "750px")
}
```

## 💡 Avantages

1. **Contrôles unifiés** : Même interface pour tous les aperçus
2. **Zoom** : 50% à 200% avec dropdown
3. **Impression** : Bouton direct sans ouvrir le PDF
4. **Téléchargement** : Sans regénération
5. **Compatibilité** : Fonctionne sur Safari et tous les navigateurs
6. **Style pro** : Interface sombre comme les viewers PDF natifs

## 🚀 Exemple complet

```javascript
import ContratPdfViewerWithControls from '@/components/contrats/ContratPdfViewerWithControls';

// Dans votre composant
function MonComposant() {
  const [pdfUrl, setPdfUrl] = useState(null);

  // Après génération du PDF
  const handlePdfGenerated = (url) => {
    setPdfUrl(url);
  };

  return (
    <div style={{ height: '800px' }}>
      {pdfUrl ? (
        <ContratPdfViewerWithControls
          pdfUrl={pdfUrl}
          height="100%"
        />
      ) : (
        <p>En attente du PDF...</p>
      )}
    </div>
  );
}
```

## 🎨 Personnalisation CSS

Le composant utilise `ContratPdfViewerWithControls.module.css`. Pour personnaliser :

1. Couleurs de la toolbar : `.toolbar`
2. Style des boutons : `.toolbar button`
3. Couleur de fond : `.container`

## ⚠️ Notes importantes

1. **CORS** : Assurez-vous que vos PDF sont hébergés sur le même domaine ou ont les headers CORS appropriés
2. **Taille** : Le composant s'adapte à son conteneur parent
3. **Performance** : Le zoom utilise CSS transform, donc très performant

## 📞 Support

En cas de problème, vérifiez :
1. L'URL du PDF est accessible
2. Les headers CORS sont corrects
3. Le conteneur parent a une hauteur définie