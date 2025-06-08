# Composants PDF

## Introduction

Les composants PDF de TourCraft permettent de générer des documents professionnels au format PDF, tels que des contrats, des factures et des fiches techniques. Ils utilisent un système de templating pour injecter dynamiquement des données dans des mises en page prédéfinies.

## Principes de conception

- **Séparation du contenu et de la présentation** : Structure en composants pour faciliter les modifications de style
- **Cohérence visuelle** : Apparence uniforme entre les différents documents générés
- **Adaptabilité** : Support de différents formats de page et orientations
- **Performance** : Génération optimisée pour les documents volumineux

## Architecture des composants PDF

Les composants PDF sont organisés en trois niveaux :

1. **Composants de base** : Éléments fondamentaux de mise en page (PDFWrapper, PDFHeader, PDFFooter)
2. **Composants de structure** : Sections communes aux différents types de documents (TableauPrix, SignatureBlock)
3. **Documents spécifiques** : Implémentations complètes pour chaque type de document (ContratPDF, FacturePDF)

## Composants de base

### PDFWrapper

**But :** Composant racine pour tout document PDF, gérant le format de page et les métadonnées

**Props :**
- `children: ReactNode` - Contenu du document
- `pageSize: 'A4'|'Letter'|'Legal'` - Format de la page
- `orientation: 'portrait'|'landscape'` - Orientation de la page
- `margins: object` - Marges du document (top, right, bottom, left)
- `title: string` - Titre du document (métadonnée)
- `author: string` - Auteur du document (métadonnée)
- `subject: string` - Sujet du document (métadonnée)
- `keywords: string` - Mots-clés associés au document (métadonnée)

**Dépendances :**
- @react-pdf/renderer
- Styles CSS spécifiques au PDF

**Exemple d'utilisation :**

```jsx
import { PDFWrapper } from '../components/pdf/PDFWrapper';
import { PDFHeader } from '../components/pdf/sections/PDFHeader';
import { PDFFooter } from '../components/pdf/sections/PDFFooter';

function SimplePDF({ title, content, entrepriseInfo }) {
  return (
    <PDFWrapper 
      pageSize="A4"
      orientation="portrait"
      title={title}
      author={entrepriseInfo.nom}
    >
      <PDFHeader 
        logo={entrepriseInfo.logo}
        title={title}
      />
      
      <div className="pdf-content">
        {content}
      </div>
      
      <PDFFooter 
        entrepriseInfo={entrepriseInfo}
      />
    </PDFWrapper>
  );
}
```

### PDFHeader

**But :** En-tête standardisé pour les documents PDF

**Props :**
- `logo: string` - URL du logo de l'entreprise
- `title: string` - Titre du document
- `subtitle: string` - Sous-titre optionnel
- `showDate: boolean` - Afficher la date de génération
- `dateFormat: string` - Format de la date
- `customDate: Date` - Date personnalisée (si différente de la date actuelle)
- `customContent: ReactNode` - Contenu personnalisé à ajouter dans l'en-tête

**Dépendances :**
- @react-pdf/renderer
- utils/formatters.js
- Styles CSS spécifiques au PDF

**Exemple d'utilisation :**

```jsx
import { PDFHeader } from '../components/pdf/sections/PDFHeader';

function ContratHeader({ contrat, entrepriseInfo }) {
  return (
    <PDFHeader 
      logo={entrepriseInfo.logo}
      title="CONTRAT D'ENGAGEMENT"
      subtitle={`Réf: ${contrat.reference}`}
      showDate={true}
      dateFormat="dd/MM/yyyy"
      customDate={contrat.dateCreation}
    />
  );
}
```

### PDFFooter

**But :** Pied de page standardisé pour les documents PDF

**Props :**
- `entrepriseInfo: object` - Informations sur l'entreprise
- `showPageNumbers: boolean` - Afficher les numéros de page
- `showLegalInfo: boolean` - Afficher les informations légales
- `customText: string` - Texte personnalisé
- `variant: 'standard'|'compact'|'minimal'` - Style du pied de page

**Dépendances :**
- @react-pdf/renderer
- Styles CSS spécifiques au PDF

**Exemple d'utilisation :**

```jsx
import { PDFFooter } from '../components/pdf/sections/PDFFooter';

function DocumentFooter({ entrepriseInfo, isContract }) {
  return (
    <PDFFooter 
      entrepriseInfo={entrepriseInfo}
      showPageNumbers={true}
      showLegalInfo={isContract}
      variant={isContract ? 'standard' : 'compact'}
    />
  );
}
```

## Composants de structure

### PDFSection

**But :** Section du document avec titre et contenu

**Props :**
- `title: string` - Titre de la section
- `children: ReactNode` - Contenu de la section
- `numbered: boolean` - Numéroter automatiquement la section
- `level: 1|2|3` - Niveau hiérarchique de la section
- `breakBefore: boolean` - Forcer un saut de page avant la section

**Dépendances :**
- @react-pdf/renderer
- Styles CSS spécifiques au PDF

**Exemple d'utilisation :**

```jsx
import { PDFSection } from '../components/pdf/sections/PDFSection';

function ContratClauses({ clauses }) {
  return (
    <>
      <PDFSection 
        title="Obligations de l'organisateur" 
        numbered
        level={1}
      >
        {clauses.organisateur.map((clause, index) => (
          <PDFClause 
            key={index}
            text={clause.texte}
            numbered
          />
        ))}
      </PDFSection>
      
      <PDFSection 
        title="Obligations de l'artiste" 
        numbered
        level={1}
      >
        {clauses.artiste.map((clause, index) => (
          <PDFClause 
            key={index}
            text={clause.texte}
            numbered
          />
        ))}
      </PDFSection>
    </>
  );
}
```

### PDFTable

**But :** Tableau formaté pour les documents PDF

**Props :**
- `headers: Array<{label: string, width: number, align?: string}>` - Configuration des en-têtes
- `data: Array<object>` - Données du tableau
- `caption: string` - Légende du tableau
- `alternateRowColors: boolean` - Alterner les couleurs de fond des lignes
- `bordered: boolean` - Ajouter des bordures au tableau
- `customRenderers: object` - Fonctions de rendu personnalisées par colonne

**Dépendances :**
- @react-pdf/renderer
- Styles CSS spécifiques au PDF

**Exemple d'utilisation :**

```jsx
import { PDFTable } from '../components/pdf/sections/PDFTable';

function FactureDetails({ prestations, formatMontant }) {
  const headers = [
    { label: 'Description', width: 50, align: 'left' },
    { label: 'Quantité', width: 15, align: 'center' },
    { label: 'Prix unitaire', width: 15, align: 'right' },
    { label: 'Total', width: 20, align: 'right' }
  ];
  
  const customRenderers = {
    'prix_unitaire': (value) => formatMontant(value),
    'total': (value) => formatMontant(value)
  };
  
  return (
    <PDFTable 
      headers={headers}
      data={prestations}
      caption="Détail des prestations"
      alternateRowColors
      bordered
      customRenderers={customRenderers}
    />
  );
}
```

### SignatureBlock

**But :** Bloc de signature pour contrats et documents officiels

**Props :**
- `parties: Array<{title: string, name: string, role?: string, company?: string}>` - Parties signataires
- `dateText: string` - Texte précédant la date
- `signatureText: string` - Texte précédant les signatures
- `showDateFields: boolean` - Ajouter des champs pour la date de signature
- `layout: 'horizontal'|'vertical'` - Disposition des blocs de signature

**Dépendances :**
- @react-pdf/renderer
- Styles CSS spécifiques au PDF

**Exemple d'utilisation :**

```jsx
import { SignatureBlock } from '../components/pdf/sections/SignatureBlock';

function ContratSignatures({ contrat }) {
  const parties = [
    {
      title: "L'ORGANISATEUR",
      name: contrat.programmateur.nom,
      role: contrat.programmateur.fonction,
      company: contrat.programmateur.structure
    },
    {
      title: "L'ARTISTE",
      name: contrat.artiste.nom,
      role: "Représentant légal",
      company: contrat.artiste.structure
    }
  ];
  
  return (
    <SignatureBlock 
      parties={parties}
      dateText="Fait à _______________, le"
      signatureText="Lu et approuvé, signature"
      showDateFields={true}
      layout="horizontal"
    />
  );
}
```

## Documents spécifiques

### ContratPDF

**But :** Génération de contrats d'engagement ou de cession

**Props :**
- `contrat: object` - Données du contrat
- `entrepriseInfo: object` - Informations sur l'entreprise
- `artiste: object` - Informations sur l'artiste
- `programmateur: object` - Informations sur le programmateur
- `lieu: object` - Informations sur le lieu
- `template: object` - Structure du template à utiliser
- `variables: object` - Variables à injecter dans le template
- `showSignatures: boolean` - Afficher les blocs de signature
- `draft: boolean` - Afficher un filigrane "BROUILLON"

**Dépendances :**
- components/pdf/PDFWrapper.js
- components/pdf/sections/* (PDFHeader, PDFFooter, PDFSection, etc.)
- utils/variableSubstitution.js
- Styles CSS spécifiques au PDF

**Exemple d'utilisation :**

```jsx
import { ContratPDF } from '../components/pdf/ContratPDF';

function GeneratedContrat({ contratData, templateData }) {
  return (
    <ContratPDF 
      contrat={contratData.contrat}
      entrepriseInfo={contratData.entrepriseInfo}
      artiste={contratData.artiste}
      programmateur={contratData.programmateur}
      lieu={contratData.lieu}
      template={templateData}
      variables={contratData.variables}
      showSignatures={true}
      draft={contratData.statut === 'brouillon'}
    />
  );
}
```

### FacturePDF

**But :** Génération de factures et devis

**Props :**
- `facture: object` - Données de la facture
- `entrepriseInfo: object` - Informations sur l'entreprise émettrice
- `client: object` - Informations sur le client
- `prestations: Array` - Liste des prestations facturées
- `type: 'facture'|'devis'|'acompte'|'solde'` - Type de document
- `showTVA: boolean` - Afficher les informations de TVA
- `mentions: string` - Mentions légales supplémentaires
- `paymentInfo: object` - Informations de paiement

**Dépendances :**
- components/pdf/PDFWrapper.js
- components/pdf/sections/* (PDFHeader, PDFFooter, PDFTable, etc.)
- utils/formatters.js
- Styles CSS spécifiques au PDF

**Exemple d'utilisation :**

```jsx
import { FacturePDF } from '../components/pdf/FacturePDF';

function GeneratedFacture({ factureData }) {
  return (
    <FacturePDF 
      facture={factureData.facture}
      entrepriseInfo={factureData.entrepriseInfo}
      client={factureData.client}
      prestations={factureData.prestations}
      type="facture"
      showTVA={factureData.entrepriseInfo.assujetti_tva}
      mentions={factureData.mentions_legales}
      paymentInfo={{
        methode: "Virement bancaire",
        delai: "30 jours",
        coordonnees: factureData.entrepriseInfo.coordonnees_bancaires
      }}
    />
  );
}
```

### FicheTechniquePDF

**But :** Génération de fiches techniques pour les concerts

**Props :**
- `concert: object` - Données du concert
- `artiste: object` - Informations sur l'artiste
- `lieu: object` - Informations sur le lieu
- `equipement: object` - Liste des équipements techniques
- `planScene: string` - URL de l'image du plan de scène
- `contacts: Array` - Contacts techniques
- `horaires: Array` - Planning de la journée
- `logo: string` - URL du logo à afficher

**Dépendances :**
- components/pdf/PDFWrapper.js
- components/pdf/sections/* (PDFHeader, PDFFooter, PDFSection, etc.)
- Styles CSS spécifiques au PDF

**Exemple d'utilisation :**

```jsx
import { FicheTechniquePDF } from '../components/pdf/FicheTechniquePDF';

function GeneratedFicheTechnique({ concertData, artisteData }) {
  return (
    <FicheTechniquePDF 
      concert={concertData}
      artiste={artisteData}
      lieu={concertData.lieu}
      equipement={artisteData.equipement}
      planScene={artisteData.planScene}
      contacts={[
        { nom: "Jean Technicien", role: "Ingénieur son", telephone: "06XXXXXXXX" },
        { nom: "Marie Lumière", role: "Éclairagiste", telephone: "07XXXXXXXX" }
      ]}
      horaires={[
        { heure: "14:00", description: "Installation" },
        { heure: "16:00", description: "Balance" },
        { heure: "20:00", description: "Concert" }
      ]}
      logo={artisteData.logo}
    />
  );
}
```

## Système de Template

### TemplateEngine

**But :** Moteur de rendu pour les templates de documents

**Méthodes principales :**
- `parseTemplate(templateText: string, variables: object)` - Analyse et remplace les variables dans un template
- `renderStructuredTemplate(template: object, variables: object)` - Rend un template structuré
- `getTemplateVariables(template: string|object)` - Extrait les variables utilisées dans un template

**Fonctionnalités :**
- Substitution de variables avec syntaxe {{variable}}
- Conditions avec syntaxe {{#if variable}}...{{/if}}
- Boucles avec syntaxe {{#each items}}...{{/each}}
- Formatage de valeurs avec syntaxe {{variable|format}}

**Exemple d'utilisation :**

```jsx
import { TemplateEngine } from '../components/pdf/utils/TemplateEngine';

function renderContractSection(template, variables) {
  const engine = new TemplateEngine();
  const parsedContent = engine.parseTemplate(template.content, variables);
  
  return <div dangerouslySetInnerHTML={{ __html: parsedContent }} />;
}
```

### TemplateManager

**But :** Gestion des templates de documents (stockage, récupération, édition)

**Méthodes principales :**
- `getTemplates(type: string)` - Récupère les templates disponibles par type
- `getTemplateById(id: string)` - Récupère un template par son ID
- `saveTemplate(template: object)` - Enregistre un template
- `deleteTemplate(id: string)` - Supprime un template
- `duplicateTemplate(id: string, newName: string)` - Duplique un template existant

**Exemple d'utilisation :**

```jsx
import { useTemplateManager } from '../hooks/pdf/useTemplateManager';

function TemplateSelector({ type, onSelect }) {
  const { templates, loading, error } = useTemplateManager(type);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <Select 
      label="Sélectionnez un template"
      options={templates.map(t => ({ value: t.id, label: t.name }))}
      onChange={(e) => onSelect(e.target.value)}
    />
  );
}
```

## Utilitaires

### PdfPreview

**But :** Aperçu en temps réel des documents PDF générés

**Props :**
- `document: ReactNode` - Document PDF à prévisualiser (composant React-PDF)
- `scale: number` - Facteur de zoom
- `width: string|number` - Largeur du prévisualisateur
- `height: string|number` - Hauteur du prévisualisateur
- `toolbar: boolean` - Afficher une barre d'outils (zoom, téléchargement)
- `onLoadSuccess: (pdf) => void` - Callback après chargement réussi

**Dépendances :**
- @react-pdf/renderer
- react-pdf
- Modules CSS

**Exemple d'utilisation :**

```jsx
import { PdfPreview } from '../components/pdf/utils/PdfPreview';
import { ContratPDF } from '../components/pdf/ContratPDF';

function ContratGenerator({ contratData }) {
  const pdfDocument = (
    <ContratPDF 
      contrat={contratData.contrat}
      entrepriseInfo={contratData.entrepriseInfo}
      artiste={contratData.artiste}
      programmateur={contratData.programmateur}
      lieu={contratData.lieu}
      template={contratData.template}
      variables={contratData.variables}
    />
  );
  
  return (
    <div className="pdf-generator">
      <h2>Aperçu du contrat</h2>
      <PdfPreview 
        document={pdfDocument}
        width="100%"
        height="600px"
        toolbar
      />
    </div>
  );
}
```

### PdfGenerator

**But :** Service pour générer des PDF côté client ou serveur

**Méthodes principales :**
- `generatePdf(component: ReactNode)` - Génère un PDF à partir d'un composant React
- `savePdf(pdfBlob: Blob, filename: string)` - Enregistre un PDF sur l'appareil de l'utilisateur
- `uploadPdf(pdfBlob: Blob, path: string)` - Téléverse un PDF vers le stockage
- `mergePdfs(pdfBlobs: Array<Blob>)` - Fusionne plusieurs PDF en un seul

**Exemple d'utilisation :**

```jsx
import { usePdfGenerator } from '../hooks/pdf/usePdfGenerator';
import { ContratPDF } from '../components/pdf/ContratPDF';

function GeneratePdfButton({ contratData, templateData }) {
  const { generatePdf, savePdf, isGenerating } = usePdfGenerator();
  
  const handleGenerate = async () => {
    const pdfDocument = (
      <ContratPDF 
        contrat={contratData.contrat}
        entrepriseInfo={contratData.entrepriseInfo}
        artiste={contratData.artiste}
        programmateur={contratData.programmateur}
        lieu={contratData.lieu}
        template={templateData}
        variables={contratData.variables}
      />
    );
    
    const pdfBlob = await generatePdf(pdfDocument);
    savePdf(pdfBlob, `Contrat_${contratData.contrat.reference}.pdf`);
  };
  
  return (
    <Button 
      variant="primary"
      onClick={handleGenerate}
      loading={isGenerating}
    >
      Générer le PDF
    </Button>
  );
}
```

## Bonnes pratiques

### Gestion des styles

Pour garantir une apparence cohérente des documents PDF, utilisez un système de styles centralisé :

```jsx
// styles/pdfStyles.js
import { StyleSheet } from '@react-pdf/renderer';

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333'
  },
  section: {
    marginBottom: 10
  },
  // Autres styles...
});
```

### Tests des composants PDF

Testez les composants PDF pour garantir une génération correcte dans tous les cas :

```jsx
// __tests__/pdf/ContratPDF.test.js
import React from 'react';
import renderer from 'react-test-renderer';
import { ContratPDF } from '../../components/pdf/ContratPDF';

describe('ContratPDF Component', () => {
  const mockData = {
    // Données de test...
  };
  
  test('renders correctly with all props', () => {
    const tree = renderer
      .create(
        <ContratPDF 
          contrat={mockData.contrat}
          entrepriseInfo={mockData.entrepriseInfo}
          artiste={mockData.artiste}
          programmateur={mockData.programmateur}
          lieu={mockData.lieu}
          template={mockData.template}
          variables={mockData.variables}
        />
      )
      .toJSON();
      
    expect(tree).toMatchSnapshot();
  });
  
  test('handles missing optional props', () => {
    // Test avec propriétés optionnelles manquantes...
  });
  
  test('draft mode displays watermark', () => {
    // Test du mode brouillon...
  });
});
```

## Navigation
- [Vue d'ensemble des composants](COMPONENTS.md)
- [Composants UI](UI_COMPONENTS.md)
- [Composants communs](COMMON_COMPONENTS.md)
- [Composants de formulaire](FORM_COMPONENTS.md)
- [Composants de mise en page](LAYOUT_COMPONENTS.md)
- [Retour à la documentation principale](../README.md)