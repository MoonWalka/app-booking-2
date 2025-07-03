import React, { useState } from 'react';
import { Card, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { db, collection, getDocs, doc, updateDoc, writeBatch, serverTimestamp, query, where } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import styles from './ContactsFixTool.module.css';

/**
 * Outil pour corriger les contacts manquants
 * Permet d'assigner l'organizationId et de marquer les personnes comme libres
 */
const ContactsFixTool = () => {
  const { currentUser } = useAuth();
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [confirmFix, setConfirmFix] = useState(false);

  // Prévisualiser les corrections
  const previewFix = async () => {
    setLoading(true);
    setError(null);
    setPreview(null);
    
    try {
      const currentOrgId = currentOrganization?.id;
      if (!currentOrgId) {
        throw new Error('Aucune organisation sélectionnée');
      }

      // Récupérer toutes les données
      const structuresSnapshot = await getDocs(collection(db, 'structures'));
      const personnesSnapshot = await getDocs(collection(db, 'personnes'));
      const liaisonsSnapshot = await getDocs(collection(db, 'liaisons'));
      
      const structuresToFix = [];
      const personnesToFix = [];
      const personnesLibresToFix = [];
      
      // Analyser les structures
      structuresSnapshot.forEach(doc => {
        const data = doc.data();
        if (!data.organizationId) {
          structuresToFix.push({ id: doc.id, data });
        }
      });
      
      // Créer une map des liaisons actives
      const personnesAvecLiaison = new Set();
      liaisonsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.personneId && data.actif !== false) {
          personnesAvecLiaison.add(data.personneId);
        }
      });
      
      // Analyser les personnes
      personnesSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Personnes sans organizationId
        if (!data.organizationId) {
          personnesToFix.push({ id: doc.id, data });
        }
        
        // Personnes sans liaison qui ne sont pas marquées comme libres
        if (!personnesAvecLiaison.has(doc.id) && !data.isPersonneLibre && data.organizationId === currentOrgId) {
          personnesLibresToFix.push({ id: doc.id, data });
        }
      });
      
      setPreview({
        structuresToFix,
        personnesToFix,
        personnesLibresToFix,
        total: structuresToFix.length + personnesToFix.length + personnesLibresToFix.length
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les corrections
  const applyFix = async () => {
    if (!preview || !confirmFix) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const currentOrgId = currentOrganization?.id;
      if (!currentOrgId) {
        throw new Error('Aucune organisation sélectionnée');
      }

      let structuresFixed = 0;
      let personnesFixed = 0;
      let personnesLibresFixed = 0;

      // Corriger les structures
      if (preview.structuresToFix.length > 0) {
        for (let i = 0; i < preview.structuresToFix.length; i += 500) {
          const batch = writeBatch(db);
          const batchStructures = preview.structuresToFix.slice(i, i + 500);
          
          batchStructures.forEach(structure => {
            const structureRef = doc(db, 'structures', structure.id);
            batch.update(structureRef, {
              organizationId: currentOrgId,
              updatedAt: serverTimestamp(),
              updatedBy: currentUser.uid,
              _migrationNote: 'organizationId ajouté par ContactsFixTool'
            });
          });
          
          await batch.commit();
          structuresFixed += batchStructures.length;
        }
      }

      // Corriger les personnes sans organizationId
      if (preview.personnesToFix.length > 0) {
        // Récupérer les liaisons pour savoir qui marquer comme libre
        const liaisonsSnapshot = await getDocs(collection(db, 'liaisons'));
        const personnesAvecLiaison = new Set();
        
        liaisonsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.personneId && data.actif !== false) {
            personnesAvecLiaison.add(data.personneId);
          }
        });
        
        for (let i = 0; i < preview.personnesToFix.length; i += 500) {
          const batch = writeBatch(db);
          const batchPersonnes = preview.personnesToFix.slice(i, i + 500);
          
          batchPersonnes.forEach(personne => {
            const personneRef = doc(db, 'personnes', personne.id);
            const updates = {
              organizationId: currentOrgId,
              updatedAt: serverTimestamp(),
              updatedBy: currentUser.uid,
              _migrationNote: 'organizationId ajouté par ContactsFixTool'
            };
            
            // Si la personne n'a pas de liaison, la marquer comme libre
            if (!personnesAvecLiaison.has(personne.id)) {
              updates.isPersonneLibre = true;
              updates._migrationNote += ' + marquée comme personne libre';
            }
            
            batch.update(personneRef, updates);
          });
          
          await batch.commit();
          personnesFixed += batchPersonnes.length;
        }
      }

      // Marquer les personnes libres
      if (preview.personnesLibresToFix.length > 0) {
        for (let i = 0; i < preview.personnesLibresToFix.length; i += 500) {
          const batch = writeBatch(db);
          const batchPersonnes = preview.personnesLibresToFix.slice(i, i + 500);
          
          batchPersonnes.forEach(personne => {
            const personneRef = doc(db, 'personnes', personne.id);
            batch.update(personneRef, {
              isPersonneLibre: true,
              updatedAt: serverTimestamp(),
              updatedBy: currentUser.uid,
              _migrationNote: 'marquée comme personne libre par ContactsFixTool'
            });
          });
          
          await batch.commit();
          personnesLibresFixed += batchPersonnes.length;
        }
      }

      setResults({
        structuresFixed,
        personnesFixed,
        personnesLibresFixed,
        total: structuresFixed + personnesFixed + personnesLibresFixed
      });
      
      setPreview(null);
      setConfirmFix(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.card}>
      <Card.Header>
        <h4>🔧 Correction des contacts manquants</h4>
      </Card.Header>
      <Card.Body>
        <div className={styles.description}>
          <Alert variant="info">
            <strong>Cet outil va :</strong>
            <ol className="mb-0 mt-2">
              <li>Assigner l'organizationId actuel aux contacts qui n'en ont pas</li>
              <li>Marquer comme "personne libre" les personnes sans liaison active</li>
              <li>Rendre visibles les contacts actuellement invisibles</li>
            </ol>
          </Alert>
        </div>

        {!preview && !results && (
          <div className={styles.actions}>
            <Button 
              variant="primary" 
              onClick={previewFix}
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <i className="bi bi-search me-2"></i>
                  Analyser les contacts à corriger
                </>
              )}
            </Button>
          </div>
        )}

        {preview && (
          <div className={styles.preview}>
            <h5>📋 Prévisualisation des corrections</h5>
            
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{preview.structuresToFix.length}</div>
                <div className={styles.statLabel}>Structures sans organizationId</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{preview.personnesToFix.length}</div>
                <div className={styles.statLabel}>Personnes sans organizationId</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{preview.personnesLibresToFix.length}</div>
                <div className={styles.statLabel}>Personnes à marquer libres</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{preview.total}</div>
                <div className={styles.statLabel}>Total à corriger</div>
              </div>
            </div>

            {preview.total > 0 ? (
              <>
                <Alert variant="warning" className="mt-3">
                  <strong>⚠️ Attention :</strong> Cette action va modifier {preview.total} enregistrements dans la base de données.
                </Alert>

                <Form.Check 
                  type="checkbox"
                  id="confirm-fix"
                  label="Je confirme vouloir appliquer ces corrections"
                  checked={confirmFix}
                  onChange={(e) => setConfirmFix(e.target.checked)}
                  className="mb-3"
                />

                <div className={styles.actions}>
                  <Button 
                    variant="success" 
                    onClick={applyFix}
                    disabled={loading || !confirmFix}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Application en cours...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Appliquer les corrections
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setPreview(null);
                      setConfirmFix(false);
                    }}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                </div>
              </>
            ) : (
              <Alert variant="success" className="mt-3">
                <i className="bi bi-check-circle me-2"></i>
                Aucune correction nécessaire ! Tous les contacts sont correctement configurés.
              </Alert>
            )}
          </div>
        )}

        {results && (
          <div className={styles.results}>
            <Alert variant="success">
              <h5 className="alert-heading">
                <i className="bi bi-check-circle me-2"></i>
                Corrections appliquées avec succès !
              </h5>
              <hr />
              <ul className="mb-0">
                <li>Structures corrigées : {results.structuresFixed}</li>
                <li>Personnes corrigées : {results.personnesFixed}</li>
                <li>Personnes marquées libres : {results.personnesLibresFixed}</li>
                <li><strong>Total : {results.total} corrections</strong></li>
              </ul>
              <hr />
              <p className="mb-0">
                <strong>💡 Astuce :</strong> Rafraîchissez la page des contacts pour voir les changements.
              </p>
            </Alert>
            
            <Button 
              variant="primary" 
              onClick={() => {
                setResults(null);
                setPreview(null);
              }}
            >
              Relancer l'analyse
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="mt-3">
            <strong>Erreur :</strong> {error}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default ContactsFixTool;