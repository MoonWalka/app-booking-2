# Exemple de Composant Générique : LegalInfoSection

*Document créé le: 4 mai 2025*

Ce document fournit un exemple concret d'un composant générique `LegalInfoSection` qui pourrait remplacer les composants similaires identifiés dans l'audit des composants (`ProgrammateurLegalSection` et `EntrepriseLegalSection`).

## Problématique

L'audit des composants similaires a identifié plusieurs composants qui gèrent des informations légales mais avec des structures de données et des approches différentes :

1. `ProgrammateurLegalSection.js` qui :
   - Utilise `formData.structure.raisonSociale` en mode édition (données imbriquées)
   - Utilise `programmateur.structure` en mode visualisation (données plates)
   - Gère à la fois le mode édition et visualisation

2. `EntrepriseLegalSection.js` qui :
   - Utilise `formData.siret` (accès direct)
   - Ne gère que le mode édition

## Solution proposée : Un composant générique

Le composant générique `LegalInfoSection` proposé ci-dessous utilise un système de mapping de champs pour s'adapter à différentes structures de données, tout en présentant une interface cohérente.

### Code du composant générique

```jsx
import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Composant générique pour afficher/éditer des informations légales
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.data - Données à afficher/éditer
 * @param {Function} props.onChange - Fonction appelée lors du changement des données
 * @param {boolean} props.isEditing - Mode édition (true) ou visualisation (false)
 * @param {Function} props.formatValue - Fonction pour formater les valeurs en mode visualisation
 * @param {Object} props.fieldMapping - Mapping des champs (nom standard -> chemin dans data)
 * @param {Object} props.labels - Labels personnalisés pour les champs
 * @param {Object} props.errors - Erreurs de validation par champ
 * @param {string} props.className - Classes CSS additionnelles
 * @param {boolean} props.notificationVisible - Afficher une notification de succès
 * @param {string} props.notificationText - Texte de la notification
 */
const LegalInfoSection = ({ 
  data = {},
  onChange = () => {},
  isEditing = false,
  formatValue = val => val || 'Non spécifié',
  fieldMapping = {
    companyName: 'raisonSociale',
    type: 'type',
    address: 'adresse',
    zipCode: 'codePostal',
    city: 'ville',
    country: 'pays',
    siret: 'siret',
    vat: 'tva'
  },
  labels = {
    companyName: 'Raison sociale',
    type: 'Type de structure',
    address: 'Adresse',
    zipCode: 'Code postal',
    city: 'Ville',
    country: 'Pays',
    siret: 'SIRET',
    vat: 'TVA Intracommunautaire'
  },
  errors = {},
  className = '',
  notificationVisible = false,
  notificationText = 'Informations enregistrées avec succès'
}) => {
  // Helper pour accéder aux données avec un chemin (ex: "structure.raisonSociale")
  const getNestedValue = (obj, path) => {
    if (!path) return undefined;
    const pathParts = path.split('.');
    let value = obj;
    
    for (const part of pathParts) {
      if (value === undefined || value === null) return undefined;
      value = value[part];
    }
    
    return value;
  };
  
  // Helper pour mettre à jour les données avec un chemin
  const handleNestedChange = (e) => {
    const { name, value } = e.target;
    onChange({ target: { name, value }});
  };
  
  // Options pour les types de structure
  const structureTypes = [
    { value: '', label: 'Sélectionner un type' },
    { value: 'association', label: 'Association' },
    { value: 'sarl', label: 'SARL' },
    { value: 'eurl', label: 'EURL' },
    { value: 'sas', label: 'SAS' },
    { value: 'collectivite', label: 'Collectivité territoriale' },
    { value: 'autre', label: 'Autre' }
  ];
  
  return (
    <div className={`legal-info-section ${className}`}>
      {notificationVisible && (
        <div className="alert alert-success mb-3" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          {notificationText}
        </div>
      )}
      
      {isEditing ? (
        // Mode édition
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor={`input-${fieldMapping.companyName}`}>
                  {labels.companyName}
                </Form.Label>
                <Form.Control
                  id={`input-${fieldMapping.companyName}`}
                  name={fieldMapping.companyName}
                  type="text"
                  value={getNestedValue(data, fieldMapping.companyName) || ''}
                  onChange={handleNestedChange}
                  placeholder={labels.companyName}
                  isInvalid={!!errors[fieldMapping.companyName]}
                />
                {errors[fieldMapping.companyName] && (
                  <Form.Control.Feedback type="invalid">
                    {errors[fieldMapping.companyName]}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor={`input-${fieldMapping.type}`}>
                  {labels.type}
                </Form.Label>
                <Form.Select
                  id={`input-${fieldMapping.type}`}
                  name={fieldMapping.type}
                  value={getNestedValue(data, fieldMapping.type) || ''}
                  onChange={handleNestedChange}
                  isInvalid={!!errors[fieldMapping.type]}
                >
                  {structureTypes.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
                {errors[fieldMapping.type] && (
                  <Form.Control.Feedback type="invalid">
                    {errors[fieldMapping.type]}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor={`input-${fieldMapping.address}`}>
                  {labels.address}
                </Form.Label>
                <Form.Control
                  id={`input-${fieldMapping.address}`}
                  name={fieldMapping.address}
                  type="text"
                  value={getNestedValue(data, fieldMapping.address) || ''}
                  onChange={handleNestedChange}
                  placeholder={labels.address}
                  isInvalid={!!errors[fieldMapping.address]}
                />
                {errors[fieldMapping.address] && (
                  <Form.Control.Feedback type="invalid">
                    {errors[fieldMapping.address]}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor={`input-${fieldMapping.zipCode}`}>
                  {labels.zipCode}
                </Form.Label>
                <Form.Control
                  id={`input-${fieldMapping.zipCode}`}
                  name={fieldMapping.zipCode}
                  type="text"
                  value={getNestedValue(data, fieldMapping.zipCode) || ''}
                  onChange={handleNestedChange}
                  placeholder={labels.zipCode}
                  isInvalid={!!errors[fieldMapping.zipCode]}
                />
                {errors[fieldMapping.zipCode] && (
                  <Form.Control.Feedback type="invalid">
                    {errors[fieldMapping.zipCode]}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor={`input-${fieldMapping.city}`}>
                  {labels.city}
                </Form.Label>
                <Form.Control
                  id={`input-${fieldMapping.city}`}
                  name={fieldMapping.city}
                  type="text"
                  value={getNestedValue(data, fieldMapping.city) || ''}
                  onChange={handleNestedChange}
                  placeholder={labels.city}
                  isInvalid={!!errors[fieldMapping.city]}
                />
                {errors[fieldMapping.city] && (
                  <Form.Control.Feedback type="invalid">
                    {errors[fieldMapping.city]}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor={`input-${fieldMapping.country}`}>
                  {labels.country}
                </Form.Label>
                <Form.Control
                  id={`input-${fieldMapping.country}`}
                  name={fieldMapping.country}
                  type="text"
                  value={getNestedValue(data, fieldMapping.country) || 'France'}
                  onChange={handleNestedChange}
                  placeholder={labels.country}
                  isInvalid={!!errors[fieldMapping.country]}
                />
                {errors[fieldMapping.country] && (
                  <Form.Control.Feedback type="invalid">
                    {errors[fieldMapping.country]}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor={`input-${fieldMapping.siret}`}>
                  {labels.siret}
                </Form.Label>
                <Form.Control
                  id={`input-${fieldMapping.siret}`}
                  name={fieldMapping.siret}
                  type="text"
                  value={getNestedValue(data, fieldMapping.siret) || ''}
                  onChange={handleNestedChange}
                  placeholder={labels.siret}
                  isInvalid={!!errors[fieldMapping.siret]}
                />
                {errors[fieldMapping.siret] && (
                  <Form.Control.Feedback type="invalid">
                    {errors[fieldMapping.siret]}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor={`input-${fieldMapping.vat}`}>
                  {labels.vat}
                </Form.Label>
                <Form.Control
                  id={`input-${fieldMapping.vat}`}
                  name={fieldMapping.vat}
                  type="text"
                  value={getNestedValue(data, fieldMapping.vat) || ''}
                  onChange={handleNestedChange}
                  placeholder={labels.vat}
                  isInvalid={!!errors[fieldMapping.vat]}
                />
                {errors[fieldMapping.vat] && (
                  <Form.Control.Feedback type="invalid">
                    {errors[fieldMapping.vat]}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Form>
      ) : (
        // Mode visualisation
        <div className="info-grid">
          <div className="info-group">
            <p className="info-label">{labels.companyName}</p>
            <p className="info-value">
              {formatValue(getNestedValue(data, fieldMapping.companyName))}
            </p>
          </div>
          <div className="info-group">
            <p className="info-label">{labels.type}</p>
            <p className="info-value">
              {formatValue(getNestedValue(data, fieldMapping.type))}
            </p>
          </div>
          <div className="info-group">
            <p className="info-label">{labels.address}</p>
            <p className="info-value">
              {formatValue(getNestedValue(data, fieldMapping.address))}
            </p>
          </div>
          <div className="info-group">
            <p className="info-label">{labels.zipCode}</p>
            <p className="info-value">
              {formatValue(getNestedValue(data, fieldMapping.zipCode))}
            </p>
          </div>
          <div className="info-group">
            <p className="info-label">{labels.city}</p>
            <p className="info-value">
              {formatValue(getNestedValue(data, fieldMapping.city))}
            </p>
          </div>
          <div className="info-group">
            <p className="info-label">{labels.country}</p>
            <p className="info-value">
              {formatValue(getNestedValue(data, fieldMapping.country) || 'France')}
            </p>
          </div>
          <div className="info-group">
            <p className="info-label">{labels.siret}</p>
            <p className="info-value">
              {formatValue(getNestedValue(data, fieldMapping.siret))}
            </p>
          </div>
          <div className="info-group">
            <p className="info-label">{labels.vat}</p>
            <p className="info-value">
              {formatValue(getNestedValue(data, fieldMapping.vat))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

LegalInfoSection.propTypes = {
  data: PropTypes.object,
  onChange: PropTypes.func,
  isEditing: PropTypes.bool,
  formatValue: PropTypes.func,
  fieldMapping: PropTypes.object,
  labels: PropTypes.object,
  errors: PropTypes.object,
  className: PropTypes.string,
  notificationVisible: PropTypes.bool,
  notificationText: PropTypes.string
};

export default LegalInfoSection;
```

## Exemples d'utilisation

### Exemple 1: Utilisation dans ProgrammateurLegalSection

```jsx
import React from 'react';
import LegalInfoSection from '@/components/common/LegalInfoSection';
import styles from './ProgrammateurLegalSection.module.css';

const ProgrammateurLegalSection = ({ 
  programmateur = {}, 
  formData = {}, 
  handleChange = () => {}, 
  isEditing = false,
  formatValue = (val) => val,
  structureCreated = false
}) => {
  // Mapping pour un accès via structure imbriquée (formData.structure.*)
  const fieldMapping = {
    companyName: 'structure.raisonSociale',
    type: 'structure.type',
    address: 'structure.adresse',
    zipCode: 'structure.codePostal',
    city: 'structure.ville',
    country: 'structure.pays',
    siret: 'structure.siret',
    vat: 'structure.tva'
  };

  // Mapping pour le mode visualisation avec structure plate
  const viewModeMapping = isEditing ? fieldMapping : {
    companyName: 'structure',
    type: 'structureType',
    address: 'structureAdresse',
    zipCode: 'structureCodePostal',
    city: 'structureVille',
    country: 'structurePays',
    siret: 'structureSiret',
    vat: 'structureTva'
  };
  
  return (
    <LegalInfoSection
      data={isEditing ? formData : programmateur}
      onChange={handleChange}
      isEditing={isEditing}
      formatValue={formatValue}
      fieldMapping={viewModeMapping}
      className={styles.sectionContent}
      notificationVisible={structureCreated}
      notificationText="Structure créée et associée avec succès ! Ces informations sont maintenant disponibles dans l'espace Structures."
    />
  );
};

export default ProgrammateurLegalSection;
```

### Exemple 2: Utilisation dans EntrepriseLegalSection

```jsx
import React from 'react';
import LegalInfoSection from '@/components/common/LegalInfoSection';
import styles from './EntrepriseLegalSection.module.css';

const EntrepriseLegalSection = ({ formData = {}, handleChange = () => {} }) => {
  // Mapping pour un accès direct (formData.*)
  const fieldMapping = {
    companyName: 'raisonSociale',
    type: 'type',
    address: 'adresse',
    zipCode: 'codePostal',
    city: 'ville',
    country: 'pays',
    siret: 'siret',
    vat: 'tva'
  };
  
  // Labels personnalisés
  const labels = {
    companyName: 'Nom de l\'entreprise',
    type: 'Type d\'organisation',
    siret: 'SIRET',
    vat: 'Code TVA'
    // Autres labels par défaut
  };
  
  return (
    <LegalInfoSection
      data={formData}
      onChange={handleChange}
      isEditing={true}
      fieldMapping={fieldMapping}
      labels={labels}
      className={styles.sectionContent}
    />
  );
};

export default EntrepriseLegalSection;
```

## Avantages de cette approche

1. **Flexibilité** : Le composant s'adapte à différentes structures de données grâce au système de mapping.
2. **Réutilisabilité** : Un seul composant remplace plusieurs implémentations similaires.
3. **Cohérence** : Interface utilisateur cohérente à travers l'application.
4. **Maintenabilité** : Un seul composant à maintenir au lieu de plusieurs.
5. **Extensibilité** : Facile à étendre avec de nouvelles fonctionnalités comme la validation des champs.

## Intégration avec la standardisation des modèles

Cette approche est compatible avec le document `STANDARDISATION_MODELES.md` car :

- Elle peut fonctionner avec toute structure de données via le système de mapping
- Elle permet une migration progressive vers les nouveaux modèles standardisés
- Elle peut être utilisée avec des adaptateurs pour maintenir la compatibilité avec le code existant

---

*Ce document sert d'exemple pour la création de composants génériques réutilisables.*