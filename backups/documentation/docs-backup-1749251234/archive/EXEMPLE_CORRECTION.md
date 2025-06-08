# Exemple de correction d'un composant

*Document créé le: 4 mai 2025*

Ce document fournit un exemple concret de correction pour le composant `ProgrammateurLegalSection.js`, illustrant comment appliquer les principes définis dans notre standardisation des modèles de données.

## Composant actuel

Le composant actuel souffre d'incohérences dans l'accès aux données entre le mode édition et le mode visualisation :

```jsx
// Mode édition - Utilise une structure imbriquée
<Form.Control
  id="structureRaisonSociale"
  name="structure.raisonSociale"
  value={formData?.structure?.raisonSociale || ''}
  onChange={handleChange}
/>

// Mode visualisation - Utilise une structure plate
<p className={styles.fieldValue}>
  {formatValue(programmateur?.structure)}
</p>
```

## Composant refactorisé

Voici comment refactoriser ce composant selon nos standards :

```jsx
import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import styles from './ProgrammateurLegalSection.module.css';

const ProgrammateurLegalSection = ({ 
  programmateur = {}, 
  formData = {}, 
  handleChange = () => {}, 
  isEditing = false,
  formatValue = (val) => val,
  structureCreated = false
}) => {
  return (
    <div className={styles.sectionContent}>
      {structureCreated && (
        <div className="alert alert-success mb-3" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          Structure créée et associée avec succès ! Ces informations sont maintenant disponibles dans l'espace Structures.
        </div>
      )}
      
      {isEditing ? (
        // Mode édition
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="structureRaisonSociale">Raison sociale</Form.Label>
                <Form.Control
                  id="structureRaisonSociale"
                  name="structureCache.raisonSociale"
                  type="text"
                  value={formData?.structureCache?.raisonSociale || ''}
                  onChange={handleChange}
                  placeholder="Nom de l'organisation"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="structureType">Type de structure</Form.Label>
                <Form.Select
                  id="structureType"
                  name="structureCache.type"
                  value={formData?.structureCache?.type || ''}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner un type</option>
                  <option value="association">Association</option>
                  <option value="sarl">SARL</option>
                  <option value="eurl">EURL</option>
                  <option value="sas">SAS</option>
                  <option value="collectivite">Collectivité territoriale</option>
                  <option value="autre">Autre</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="structureAdresse">Adresse</Form.Label>
                <Form.Control
                  id="structureAdresse"
                  name="structureCache.adresse"
                  type="text"
                  value={formData?.structureCache?.adresse || ''}
                  onChange={handleChange}
                  placeholder="Adresse complète"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="structureCodePostal">Code postal</Form.Label>
                <Form.Control
                  id="structureCodePostal"
                  name="structureCache.codePostal"
                  type="text"
                  value={formData?.structureCache?.codePostal || ''}
                  onChange={handleChange}
                  placeholder="Code postal"
                />
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="structureVille">Ville</Form.Label>
                <Form.Control
                  id="structureVille"
                  name="structureCache.ville"
                  type="text"
                  value={formData?.structureCache?.ville || ''}
                  onChange={handleChange}
                  placeholder="Ville"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="structurePays">Pays</Form.Label>
                <Form.Control
                  id="structurePays"
                  name="structureCache.pays"
                  type="text"
                  value={formData?.structureCache?.pays || 'France'}
                  onChange={handleChange}
                  placeholder="Pays"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="structureSiret">SIRET</Form.Label>
                <Form.Control
                  id="structureSiret"
                  name="structureCache.siret"
                  type="text"
                  value={formData?.structureCache?.siret || ''}
                  onChange={handleChange}
                  placeholder="Numéro SIRET"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="structureTva">TVA Intracommunautaire</Form.Label>
                <Form.Control
                  id="structureTva"
                  name="structureCache.tva"
                  type="text"
                  value={formData?.structureCache?.tva || ''}
                  onChange={handleChange}
                  placeholder="Numéro de TVA"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      ) : (
        // Mode visualisation - utilise le même chemin d'accès que le mode édition
        <div className={styles.infoGrid}>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>Raison sociale</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.raisonSociale)}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>Type de structure</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.type)}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>Adresse</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.adresse)}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>Code postal</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.codePostal)}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>Ville</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.ville)}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>Pays</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.pays || 'France')}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>SIRET</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.siret)}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.cardLabel}>TVA Intracommunautaire</p>
            <p className={styles.fieldValue}>{formatValue(programmateur?.structureCache?.tva)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammateurLegalSection;
```

## Changements apportés

1. **Standardisation de la structure de données** :
   - Utilisation de `structureCache` au lieu de `structure` pour contenir les données de la structure
   - Toutes les propriétés structure sont regroupées sous cet objet

2. **Cohérence entre mode édition et visualisation** :
   - Les chemins d'accès aux données sont identiques dans les deux modes
   - Par exemple : `formData?.structureCache?.raisonSociale` et `programmateur?.structureCache?.raisonSociale`

3. **En quoi cela respecte nos principes** :
   - **Cohérence** : Même chemin d'accès partout
   - **Prévisibilité** : Structure claire avec séparation entre relation (ID) et données mises en cache
   - **Maintenabilité** : Facilite la migration vers TypeScript et les validations Yup

## Modifications nécessaires dans les hooks

Pour que ce composant fonctionne correctement, les hooks associés devront également être adaptés :

```javascript
// Dans useProgrammateur.js ou similaire

const useProgrammateur = (id) => {
  // ... logique existante

  // Transformation des données pour respecter le nouveau format
  const transformData = (rawData) => {
    if (!rawData) return null;
    
    return {
      ...rawData,
      // Créer ou mettre à jour le structureCache à partir des données plates
      structureCache: {
        raisonSociale: rawData.structure || '',
        type: rawData.structureType || '',
        adresse: rawData.structureAdresse || '',
        codePostal: rawData.structureCodePostal || '',
        ville: rawData.structureVille || '',
        pays: rawData.structurePays || '',
        siret: rawData.structureSiret || '',
        tva: rawData.structureTva || '',
      }
    };
  };

  // Retourner les données transformées
  return {
    programmateur: data ? transformData(data) : null,
    // ... autres valeurs retournées
  };
};
```

## Impact sur les autres composants

Ce changement nécessitera des modifications similaires dans :

1. `ProgrammateurStructuresSection.js`
2. Tous les autres composants qui accèdent aux données de structure depuis un programmateur

## Migration progressive

La migration peut être effectuée progressivement :

1. D'abord, adapter les composants pour utiliser les chemins standards
2. Ensuite, mettre à jour les services et les hooks pour transformer les données
3. Finalement, mettre à jour le schéma de données dans Firebase (opération plus complexe)

---

*Ce document sert d'exemple pour la standardisation des composants.*