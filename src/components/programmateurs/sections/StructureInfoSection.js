import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Dropdown } from 'react-bootstrap';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseInit';
import styles from './StructureInfoSection.module.css';

/**
 * StructureInfoSection - Section contenant les informations sur la structure du programmateur
 */
const StructureInfoSection = ({ 
  formik, 
  touched, 
  errors, 
  isReadOnly = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState(null);

  // Rechercher une structure existante
  const searchStructure = async () => {
    if (!searchTerm.trim() || searchTerm.length < 2) return;
    
    setSearching(true);
    try {
      const structuresRef = collection(db, 'structures');
      const q = query(
        structuresRef,
        where('nom', '>=', searchTerm),
        where('nom', '<=', searchTerm + '\uf8ff'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche de structures:', error);
    } finally {
      setSearching(false);
    }
  };

  // Gérer le timing de recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchStructure();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Charger les données d'une structure si un ID est déjà présent
  useEffect(() => {
    const loadStructure = async () => {
      if (formik.values.structureId) {
        try {
          const structureDoc = await getDoc(doc(db, 'structures', formik.values.structureId));
          if (structureDoc.exists()) {
            const structureData = structureDoc.data();
            setSelectedStructure({
              id: structureDoc.id,
              ...structureData
            });
            
            // Mettre à jour le champ de recherche
            setSearchTerm(structureData.nom || structureData.raisonSociale || '');
          }
        } catch (error) {
          console.error('Erreur lors du chargement de la structure:', error);
        }
      }
    };
    
    loadStructure();
  }, [formik.values.structureId]);

  // Sélectionner une structure dans la liste de recherche
  const handleSelectStructure = (structure) => {
    setSelectedStructure(structure);
    setShowResults(false);
    setSearchTerm(structure.nom || structure.raisonSociale || '');
    
    // Mettre à jour les données du formulaire
    formik.setFieldValue('structure.nom', structure.nom || structure.raisonSociale || '');
    formik.setFieldValue('structure.type', structure.type || '');
    formik.setFieldValue('structure.adresse', structure.adresse || '');
    formik.setFieldValue('structure.codePostal', structure.codePostal || '');
    formik.setFieldValue('structure.ville', structure.ville || '');
    formik.setFieldValue('structure.siret', structure.siret || '');
    formik.setFieldValue('structure.ape', structure.ape || '');
    
    // Stocker l'ID de la structure pour l'association
    formik.setFieldValue('structureId', structure.id);
  };

  // Effacer la structure sélectionnée
  const handleClearStructure = () => {
    setSelectedStructure(null);
    setSearchTerm('');
    formik.setFieldValue('structureId', '');
  };

  return (
    <div className={styles.structureInfoSection}>
      <h4 className={styles.sectionTitle}>Informations sur la structure</h4>
      
      {!isReadOnly && (
        <div className={styles.structureSearch}>
          <Form.Group className="mb-3">
            <Form.Label>Rechercher une structure existante</Form.Label>
            <div className={styles.searchContainer}>
              <Form.Control
                type="text"
                placeholder="Nom de la structure"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                disabled={isReadOnly}
                className={styles.searchInput}
              />
              {selectedStructure && (
                <Button 
                  variant="outline-secondary"
                  size="sm"
                  className={styles.clearButton}
                  onClick={handleClearStructure}
                >
                  <i className="bi bi-x-lg"></i>
                </Button>
              )}
            </div>
            
            {showResults && (
              <Dropdown.Menu show={true} className={styles.resultsDropdown}>
                {searching ? (
                  <div className={styles.loadingResults}>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Recherche en cours...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(structure => (
                    <Dropdown.Item 
                      key={structure.id}
                      onClick={() => handleSelectStructure(structure)}
                      className={styles.resultItem}
                    >
                      <div className={styles.structureName}>{structure.nom || structure.raisonSociale}</div>
                      {structure.ville && (
                        <div className={styles.structureLocation}>
                          <i className="bi bi-geo-alt me-1"></i>
                          {structure.ville}
                        </div>
                      )}
                    </Dropdown.Item>
                  ))
                ) : (
                  <div className={styles.noResults}>
                    Aucune structure trouvée
                    <div className={styles.createNew}>
                      <a href="/structures/nouvelle" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-plus-lg me-1"></i>
                        Créer une nouvelle structure
                      </a>
                    </div>
                  </div>
                )}
              </Dropdown.Menu>
            )}
            
            {selectedStructure && (
              <div className={styles.selectedStructureInfo}>
                <i className="bi bi-link-45deg me-1"></i>
                Structure associée: 
                <strong className="ms-1">
                  {selectedStructure.nom || selectedStructure.raisonSociale}
                </strong>
              </div>
            )}
          </Form.Group>
        </div>
      )}
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureName">Raison sociale *</Form.Label>
            <Form.Control
              id="structureName"
              name="structure.nom"
              type="text"
              value={formik.values.structure.nom}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={touched?.structure?.nom && errors?.structure?.nom}
              disabled={isReadOnly || selectedStructure !== null}
              placeholder="Nom de la structure"
              className={styles.formInput}
            />
            <Form.Control.Feedback type="invalid">
              {errors?.structure?.nom}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureType">Type de structure</Form.Label>
            <Form.Select
              id="structureType"
              name="structure.type"
              value={formik.values.structure.type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isReadOnly || selectedStructure !== null}
              className={styles.formInput}
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
            <Form.Label htmlFor="structureAddress">Adresse</Form.Label>
            <Form.Control
              id="structureAddress"
              name="structure.adresse"
              type="text"
              value={formik.values.structure.adresse}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isReadOnly || selectedStructure !== null}
              placeholder="Adresse de la structure"
              className={styles.formInput}
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structurePostalCode">Code postal</Form.Label>
            <Form.Control
              id="structurePostalCode"
              name="structure.codePostal"
              type="text"
              value={formik.values.structure.codePostal}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isReadOnly || selectedStructure !== null}
              placeholder="Code postal"
              className={styles.formInput}
            />
          </Form.Group>
        </Col>
        
        <Col md={8}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureCity">Ville</Form.Label>
            <Form.Control
              id="structureCity"
              name="structure.ville"
              type="text"
              value={formik.values.structure.ville}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isReadOnly || selectedStructure !== null}
              placeholder="Ville"
              className={styles.formInput}
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
              name="structure.siret"
              type="text"
              value={formik.values.structure.siret}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isReadOnly || selectedStructure !== null}
              placeholder="Numéro SIRET"
              className={styles.formInput}
            />
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureApe">Code APE</Form.Label>
            <Form.Control
              id="structureApe"
              name="structure.ape"
              type="text"
              value={formik.values.structure.ape}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isReadOnly || selectedStructure !== null}
              placeholder="Code APE/NAF"
              className={styles.formInput}
            />
          </Form.Group>
        </Col>
      </Row>
      
      {/* Champ caché pour stocker l'ID de structure */}
      <input 
        type="hidden" 
        name="structureId" 
        value={formik.values.structureId || ''}
      />
    </div>
  );
};

export default StructureInfoSection;
