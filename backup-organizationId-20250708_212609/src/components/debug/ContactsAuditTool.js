import React, { useState } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { db, collection, getDocs, query, where } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useEntreprise } from '@/context/EntrepriseContext';
import styles from './ContactsAuditTool.module.css';

/**
 * Outil d'audit pour diagnostiquer les contacts manquants
 * Intègre tous les scripts d'audit dans une interface utilisateur
 */
const ContactsAuditTool = () => {
  const { currentUser } = useAuth();
  const { currentEntreprise } = useEntreprise();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeAudit, setActiveAudit] = useState(null);

  // Audit du système relationnel
  const auditRelationalSystem = async () => {
    setLoading(true);
    setError(null);
    setActiveAudit('relational');
    
    try {
      const currentEntrepriseId = currentEntreprise?.id;
      if (!currentEntrepriseId) {
        throw new Error('Aucune organisation sélectionnée');
      }

      // Récupérer toutes les données
      const structuresQuery = query(collection(db, 'structures'), where('organizationId', '==', currentEntrepriseId));
      const personnesQuery = query(collection(db, 'personnes'), where('organizationId', '==', currentEntrepriseId));
      const liaisonsQuery = query(collection(db, 'liaisons'), where('organizationId', '==', currentEntrepriseId));
      
      const [structuresSnapshot, personnesSnapshot, liaisonsSnapshot] = await Promise.all([
        getDocs(structuresQuery),
        getDocs(personnesQuery),
        getDocs(liaisonsQuery)
      ]);

      // Analyser les liaisons
      const liaisonsByPersonne = new Map();
      const liaisonsByStructure = new Map();
      let liaisonsActives = 0;
      let liaisonsInactives = 0;
      
      liaisonsSnapshot.forEach(doc => {
        const liaison = doc.data();
        
        if (liaison.actif !== false) {
          liaisonsActives++;
        } else {
          liaisonsInactives++;
        }
        
        if (liaison.personneId) {
          if (!liaisonsByPersonne.has(liaison.personneId)) {
            liaisonsByPersonne.set(liaison.personneId, []);
          }
          liaisonsByPersonne.get(liaison.personneId).push({
            id: doc.id,
            structureId: liaison.structureId,
            actif: liaison.actif !== false,
            fonction: liaison.fonction
          });
        }
        
        if (liaison.structureId) {
          if (!liaisonsByStructure.has(liaison.structureId)) {
            liaisonsByStructure.set(liaison.structureId, []);
          }
          liaisonsByStructure.get(liaison.structureId).push({
            id: doc.id,
            personneId: liaison.personneId,
            actif: liaison.actif !== false
          });
        }
      });

      // Catégoriser les personnes
      const categories = {
        avecLiaisonsActives: [],
        avecSeulementLiaisonsInactives: [],
        sansLiaison: [],
        marqueeLibre: [],
        problematiques: []
      };
      
      personnesSnapshot.forEach(doc => {
        const personne = doc.data();
        const personneId = doc.id;
        const liaisons = liaisonsByPersonne.get(personneId) || [];
        const liaisonsActives = liaisons.filter(l => l.actif);
        
        const info = {
          id: personneId,
          nom: `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Sans nom',
          email: personne.email,
          isPersonneLibre: personne.isPersonneLibre,
          nbLiaisons: liaisons.length,
          nbLiaisonsActives: liaisonsActives.length
        };
        
        if (liaisonsActives.length > 0) {
          categories.avecLiaisonsActives.push(info);
        } else if (liaisons.length > 0) {
          categories.avecSeulementLiaisonsInactives.push(info);
        } else if (personne.isPersonneLibre) {
          categories.marqueeLibre.push(info);
        } else {
          categories.sansLiaison.push(info);
        }
        
        if (personne.isPersonneLibre && liaisonsActives.length > 0) {
          categories.problematiques.push({
            ...info,
            probleme: 'Marquée libre MAIS a des liaisons actives'
          });
        }
      });

      // Calculer les totaux visibles
      const contactsVisibles = structuresSnapshot.size + 
                              categories.avecLiaisonsActives.length + 
                              categories.marqueeLibre.length;
      
      const totalInvisibles = categories.avecSeulementLiaisonsInactives.length + 
                             categories.sansLiaison.length;

      setResults({
        type: 'relational',
        data: {
          totaux: {
            structures: structuresSnapshot.size,
            personnes: personnesSnapshot.size,
            liaisons: liaisonsSnapshot.size,
            liaisonsActives,
            liaisonsInactives
          },
          categories,
          visibilite: {
            contactsVisibles,
            totalInvisibles,
            structures: structuresSnapshot.size,
            personnesVisibles: categories.avecLiaisonsActives.length,
            personnesLibresVisibles: categories.marqueeLibre.length
          }
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Afficher tous les contacts bruts
  const showAllContactsRaw = async () => {
    setLoading(true);
    setError(null);
    setActiveAudit('raw');
    
    try {
      const currentEntrepriseId = currentEntreprise?.id;
      if (!currentEntrepriseId) {
        throw new Error('Aucune organisation sélectionnée');
      }

      // Charger TOUTES les données
      const [allStructures, allPersonnes, allLiaisons] = await Promise.all([
        getDocs(collection(db, 'structures')),
        getDocs(collection(db, 'personnes')),
        getDocs(collection(db, 'liaisons'))
      ]);

      // Analyser par organisation
      const stats = {
        structures: {},
        personnes: {},
        liaisons: {}
      };
      
      allStructures.forEach(doc => {
        const data = doc.data();
        const orgId = data.organizationId || 'SANS_ORGANISATION';
        stats.structures[orgId] = (stats.structures[orgId] || 0) + 1;
      });
      
      allPersonnes.forEach(doc => {
        const data = doc.data();
        const orgId = data.organizationId || 'SANS_ORGANISATION';
        stats.personnes[orgId] = (stats.personnes[orgId] || 0) + 1;
      });
      
      allLiaisons.forEach(doc => {
        const data = doc.data();
        const orgId = data.organizationId || 'SANS_ORGANISATION';
        stats.liaisons[orgId] = (stats.liaisons[orgId] || 0) + 1;
      });

      // Filtrer pour l'organisation actuelle
      const myStructures = [];
      const myPersonnes = [];
      const myLiaisons = [];
      
      allStructures.forEach(doc => {
        const data = doc.data();
        if (data.organizationId === currentEntrepriseId) {
          myStructures.push({ id: doc.id, ...data });
        }
      });
      
      allPersonnes.forEach(doc => {
        const data = doc.data();
        if (data.organizationId === currentEntrepriseId) {
          myPersonnes.push({ id: doc.id, ...data });
        }
      });
      
      allLiaisons.forEach(doc => {
        const data = doc.data();
        if (data.organizationId === currentEntrepriseId) {
          myLiaisons.push({ id: doc.id, ...data });
        }
      });

      // Créer une map des liaisons par personne
      const liaisonsByPerson = new Map();
      myLiaisons.forEach(l => {
        if (l.personneId) {
          if (!liaisonsByPerson.has(l.personneId)) {
            liaisonsByPerson.set(l.personneId, []);
          }
          liaisonsByPerson.get(l.personneId).push(l);
        }
      });

      // Analyser la visibilité
      let visibles = 0;
      let invisibles = 0;
      const personnesInvisibles = [];
      
      myPersonnes.forEach(p => {
        const liaisons = liaisonsByPerson.get(p.id) || [];
        const liaisonsActives = liaisons.filter(l => l.actif !== false);
        
        if (liaisonsActives.length > 0 || p.isPersonneLibre) {
          visibles++;
        } else {
          invisibles++;
          if (personnesInvisibles.length < 20) {
            personnesInvisibles.push({
              id: p.id,
              nom: `${p.prenom || ''} ${p.nom || ''}`.trim() || 'Sans nom',
              email: p.email,
              nbLiaisons: liaisons.length,
              nbLiaisonsActives: liaisonsActives.length,
              isPersonneLibre: p.isPersonneLibre || false
            });
          }
        }
      });

      setResults({
        type: 'raw',
        data: {
          totauxGlobaux: {
            structures: allStructures.size,
            personnes: allPersonnes.size,
            liaisons: allLiaisons.size
          },
          stats,
          monOrganisation: {
            id: currentEntrepriseId,
            structures: myStructures.length,
            personnes: myPersonnes.length,
            liaisons: myLiaisons.length,
            personnesVisibles: visibles,
            personnesInvisibles: invisibles,
            totalContactsAffiches: myStructures.length + visibles
          },
          exemples: {
            structures: myStructures.slice(0, 10),
            personnesInvisibles
          }
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Rechercher les contacts récemment déliés
  const findRecentlyUnlinked = async () => {
    setLoading(true);
    setError(null);
    setActiveAudit('unlinked');
    
    try {
      const currentEntrepriseId = currentEntreprise?.id;
      if (!currentEntrepriseId) {
        throw new Error('Aucune organisation sélectionnée');
      }

      const personnesQuery = query(collection(db, 'personnes'), where('organizationId', '==', currentEntrepriseId));
      const personnesSnapshot = await getDocs(personnesQuery);
      const liaisonsSnapshot = await getDocs(collection(db, 'liaisons'));
      
      // Créer une map des liaisons
      const liaisonsActives = new Map();
      const toutesLiaisons = new Map();
      
      liaisonsSnapshot.forEach(doc => {
        const liaison = doc.data();
        if (liaison.personneId) {
          if (!toutesLiaisons.has(liaison.personneId)) {
            toutesLiaisons.set(liaison.personneId, []);
          }
          toutesLiaisons.get(liaison.personneId).push({
            id: doc.id,
            ...liaison
          });
          
          if (liaison.actif !== false && liaison.organizationId === currentEntrepriseId) {
            if (!liaisonsActives.has(liaison.personneId)) {
              liaisonsActives.set(liaison.personneId, []);
            }
            liaisonsActives.get(liaison.personneId).push({
              id: doc.id,
              structureId: liaison.structureId,
              fonction: liaison.fonction
            });
          }
        }
      });

      // Analyser les personnes
      const categories = {
        avecLiaisonActive: [],
        sansLiaisonMaisLibre: [],
        sansLiaisonNonLibre: [],
        avecLiaisonInactive: []
      };
      
      personnesSnapshot.forEach(doc => {
        const personne = doc.data();
        const personneId = doc.id;
        const liaisonsActivesPersonne = liaisonsActives.get(personneId) || [];
        const toutesLiaisonsPersonne = toutesLiaisons.get(personneId) || [];
        
        const info = {
          id: personneId,
          nom: `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Sans nom',
          email: personne.email || '',
          isPersonneLibre: personne.isPersonneLibre,
          updatedAt: personne.updatedAt
        };
        
        if (liaisonsActivesPersonne.length > 0) {
          categories.avecLiaisonActive.push({
            ...info,
            liaisons: liaisonsActivesPersonne
          });
        } else if (personne.isPersonneLibre) {
          categories.sansLiaisonMaisLibre.push(info);
        } else if (toutesLiaisonsPersonne.some(l => l.actif === false)) {
          categories.avecLiaisonInactive.push({
            ...info,
            liaisonsInactives: toutesLiaisonsPersonne.filter(l => l.actif === false)
          });
        } else {
          categories.sansLiaisonNonLibre.push(info);
        }
      });

      const totalInvisibles = categories.avecLiaisonInactive.length + categories.sansLiaisonNonLibre.length;

      setResults({
        type: 'unlinked',
        data: {
          categories,
          totalInvisibles,
          visibles: {
            avecLiaison: categories.avecLiaisonActive.length,
            libres: categories.sansLiaisonMaisLibre.length
          }
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Rendu des résultats
  const renderResults = () => {
    if (!results) return null;

    if (results.type === 'relational') {
      const { data } = results;
      return (
        <div className={styles.results}>
          <h5>📊 Résultats de l'audit relationnel</h5>
          
          <div className={styles.section}>
            <h6>Totaux</h6>
            <ul>
              <li>Structures: {data.totaux.structures}</li>
              <li>Personnes: {data.totaux.personnes}</li>
              <li>Liaisons: {data.totaux.liaisons} ({data.totaux.liaisonsActives} actives, {data.totaux.liaisonsInactives} inactives)</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h6>Catégories de personnes</h6>
            <ul>
              <li>✅ Avec liaisons actives: {data.categories.avecLiaisonsActives.length}</li>
              <li>✅ Sans liaison mais marquées libres: {data.categories.marqueeLibre.length}</li>
              <li>❌ Avec seulement liaisons inactives: {data.categories.avecSeulementLiaisonsInactives.length}</li>
              <li>❌ Sans liaison et non marquées libres: {data.categories.sansLiaison.length}</li>
              <li>⚠️ Cas problématiques: {data.categories.problematiques.length}</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h6>Visibilité dans l'interface</h6>
            <Alert variant={data.visibilite.totalInvisibles > 0 ? 'warning' : 'success'}>
              <strong>Total contacts visibles: {data.visibilite.contactsVisibles}</strong>
              <ul className="mb-0 mt-2">
                <li>Structures: {data.visibilite.structures}</li>
                <li>Personnes dans structures: {data.visibilite.personnesVisibles}</li>
                <li>Personnes libres: {data.visibilite.personnesLibresVisibles}</li>
              </ul>
              {data.visibilite.totalInvisibles > 0 && (
                <div className="mt-3">
                  <strong>⚠️ Contacts invisibles: {data.visibilite.totalInvisibles}</strong>
                </div>
              )}
            </Alert>
          </div>

          {data.visibilite.totalInvisibles > 0 && (
            <div className={styles.section}>
              <h6>💡 Solution</h6>
              <p>Pour rendre les {data.visibilite.totalInvisibles} personnes invisibles à nouveau visibles :</p>
              <ol>
                <li>Marquer ces personnes comme "libres" (isPersonneLibre = true)</li>
                <li>OU réactiver leurs liaisons avec des structures</li>
                <li>OU modifier la logique d'affichage dans ContactsList.js</li>
              </ol>
            </div>
          )}
        </div>
      );
    }

    if (results.type === 'raw') {
      const { data } = results;
      return (
        <div className={styles.results}>
          <h5>📊 Tous les contacts bruts</h5>
          
          <div className={styles.section}>
            <h6>Totaux globaux (toutes organisations)</h6>
            <ul>
              <li>Total structures: {data.totauxGlobaux.structures}</li>
              <li>Total personnes: {data.totauxGlobaux.personnes}</li>
              <li>Total liaisons: {data.totauxGlobaux.liaisons}</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h6>Votre organisation ({data.monOrganisation.id})</h6>
            <ul>
              <li>Structures: {data.monOrganisation.structures}</li>
              <li>Personnes: {data.monOrganisation.personnes}</li>
              <li>Liaisons: {data.monOrganisation.liaisons}</li>
            </ul>
            <Alert variant={data.monOrganisation.personnesInvisibles > 0 ? 'warning' : 'success'}>
              <strong>Contacts affichés dans l'interface: {data.monOrganisation.totalContactsAffiches}</strong>
              <ul className="mb-0 mt-2">
                <li>Personnes visibles: {data.monOrganisation.personnesVisibles}</li>
                <li>Personnes invisibles: {data.monOrganisation.personnesInvisibles}</li>
              </ul>
            </Alert>
          </div>

          {data.exemples.personnesInvisibles.length > 0 && (
            <div className={styles.section}>
              <h6>❌ Exemples de personnes invisibles</h6>
              <div className={styles.scrollList}>
                {data.exemples.personnesInvisibles.map(p => (
                  <div key={p.id} className={styles.contactItem}>
                    <strong>{p.nom}</strong>
                    {p.email && <span> ({p.email})</span>}
                    <br />
                    <small>
                      Liaisons: {p.nbLiaisons} total, {p.nbLiaisonsActives} active(s) | 
                      Libre: {p.isPersonneLibre ? 'OUI' : 'NON'}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (results.type === 'unlinked') {
      const { data } = results;
      return (
        <div className={styles.results}>
          <h5>🔍 Contacts récemment déliés</h5>
          
          <div className={styles.section}>
            <h6>Résumé</h6>
            <ul>
              <li>✅ Personnes avec liaison active: {data.visibles.avecLiaison}</li>
              <li>✅ Personnes libres sans liaison: {data.visibles.libres}</li>
              <li>❌ Personnes avec liaison(s) inactive(s): {data.categories.avecLiaisonInactive.length}</li>
              <li>❌ Personnes sans liaison ni flag libre: {data.categories.sansLiaisonNonLibre.length}</li>
            </ul>
            
            {data.totalInvisibles > 0 && (
              <Alert variant="warning">
                <strong>⚠️ {data.totalInvisibles} personnes sont invisibles</strong>
              </Alert>
            )}
          </div>

          {data.categories.avecLiaisonInactive.length > 0 && (
            <div className={styles.section}>
              <h6>Personnes avec liaisons désactivées</h6>
              <div className={styles.scrollList}>
                {data.categories.avecLiaisonInactive.slice(0, 10).map(p => (
                  <div key={p.id} className={styles.contactItem}>
                    <strong>{p.nom}</strong>
                    {p.email && <span> ({p.email})</span>}
                    <br />
                    <small>
                      {p.liaisonsInactives.length} liaison(s) inactive(s)
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <Card className={styles.card}>
      <Card.Header>
        <h4>🔍 Audit des contacts manquants</h4>
      </Card.Header>
      <Card.Body>
        <div className={styles.description}>
          <p>Cet outil permet de diagnostiquer pourquoi certains contacts n'apparaissent pas dans la liste.</p>
        </div>

        <div className={styles.buttons}>
          <Button 
            variant="primary" 
            onClick={auditRelationalSystem}
            disabled={loading}
            className={styles.button}
          >
            📊 Audit du système relationnel
          </Button>
          
          <Button 
            variant="info" 
            onClick={showAllContactsRaw}
            disabled={loading}
            className={styles.button}
          >
            👁️ Voir tous les contacts bruts
          </Button>
          
          <Button 
            variant="warning" 
            onClick={findRecentlyUnlinked}
            disabled={loading}
            className={styles.button}
          >
            🔍 Chercher les contacts déliés
          </Button>
        </div>

        {loading && (
          <div className="text-center mt-4">
            <Spinner animation="border" />
            <p>Analyse en cours...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="mt-4">
            <strong>Erreur :</strong> {error}
          </Alert>
        )}

        {results && renderResults()}
      </Card.Body>
    </Card>
  );
};

export default ContactsAuditTool;