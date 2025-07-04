/**
 * Script de migration FINAL pour terminer la migration contacts
 * Migre TOUT : contacts, références, associations
 */
import React, { useState } from 'react';
import { Button, Card, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  serverTimestamp,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import styles from './ContactsMigrationFinal.module.css';

function ContactsMigrationFinal() {
  const { currentOrganization } = useOrganization();
  const [migrationStatus, setMigrationStatus] = useState({
    phase: '',
    progress: 0,
    total: 0,
    errors: [],
    results: {
      structuresMigrated: 0,
      personnesMigrated: 0,
      liaisonsCreated: 0,
      referencesUpdated: 0,
      duplicatesSkipped: 0
    }
  });
  const [isRunning, setIsRunning] = useState(false);
  const [dryRun, setDryRun] = useState(true);

  /**
   * Phase 1 : Analyser ce qui reste à migrer
   */
  const analyzeData = async () => {
    const analysis = {
      oldContacts: { structures: [], personnes: [], unknown: [] },
      existingStructures: new Set(),
      existingPersonnes: new Set(),
      referencesToUpdate: {
        concerts: [],
        lieux: [],
        contrats: [],
        devis: []
      }
    };

    // 1. Charger les contacts de l'ancienne collection
    const oldContactsQuery = query(
      collection(db, 'contacts'),
      where('organizationId', '==', currentOrganization.id)
    );
    const oldContactsSnap = await getDocs(oldContactsQuery);
    
    oldContactsSnap.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      if (data.type === 'structure') {
        analysis.oldContacts.structures.push(data);
      } else if (data.type === 'personne' || data.nom || data.prenom) {
        analysis.oldContacts.personnes.push(data);
      } else {
        analysis.oldContacts.unknown.push(data);
      }
    });

    // 2. Charger les structures existantes pour éviter les doublons
    const structuresQuery = query(
      collection(db, 'structures'),
      where('organizationId', '==', currentOrganization.id)
    );
    const structuresSnap = await getDocs(structuresQuery);
    structuresSnap.forEach(doc => {
      const data = doc.data();
      const key = data.raisonSociale || data.nom;
      if (key) analysis.existingStructures.add(key.toLowerCase());
    });

    // 3. Charger les personnes existantes
    const personnesQuery = query(
      collection(db, 'personnes'),
      where('organizationId', '==', currentOrganization.id)
    );
    const personnesSnap = await getDocs(personnesQuery);
    personnesSnap.forEach(doc => {
      const data = doc.data();
      const key = `${data.prenom || ''} ${data.nom || ''}`.toLowerCase().trim();
      if (key) analysis.existingPersonnes.add(key);
    });

    // 4. Analyser les références dans les autres collections
    const collections = ['concerts', 'lieux', 'contrats', 'devis'];
    for (const collName of collections) {
      const q = query(
        collection(db, collName),
        where('organizationId', '==', currentOrganization.id)
      );
      const snap = await getDocs(q);
      
      snap.forEach(doc => {
        const data = doc.data();
        const hasOldRefs = data.contactId || data.contactIds || 
                          data.organisateurId || data.programmateurId ||
                          data.structureId; // Certains ont déjà structureId mais pointent vers l'ancienne collection
        
        if (hasOldRefs) {
          analysis.referencesToUpdate[collName].push({
            id: doc.id,
            data: data
          });
        }
      });
    }

    return analysis;
  };

  /**
   * Phase 2 : Migrer les structures
   */
  const migrateStructures = async (structures, existingStructures, isDryRun = true) => {
    const migrated = [];
    const skipped = [];
    const mapping = {}; // oldId -> newId

    for (const structure of structures) {
      const nom = structure.structureRaisonSociale || structure.nom || '';
      const key = nom.toLowerCase();

      // Vérifier si elle existe déjà
      if (existingStructures.has(key)) {
        skipped.push({ ...structure, reason: 'Existe déjà' });
        continue;
      }

      const newStructure = {
        // Identification
        raisonSociale: structure.structureRaisonSociale || structure.nom || '',
        nom: structure.structureRaisonSociale || structure.nom || '',
        type: structure.structureType || 'Autre',
        
        // Adresse
        adresse: structure.structureAdresse || structure.adresse || '',
        codePostal: structure.structureCodePostal || structure.codePostal || '',
        ville: structure.structureVille || structure.ville || '',
        pays: structure.structurePays || structure.pays || 'France',
        
        // Contact
        email: structure.structureEmail || structure.email || null,
        telephone1: structure.structureTelephone || structure.telephone || null,
        siteWeb: structure.structureSiteWeb || structure.siteWeb || null,
        
        // Légal
        siret: structure.structureSiret || null,
        numeroTva: structure.structureNumeroTva || null,
        licenceSpectacle: structure.structureLicence || null,
        
        // Métadonnées
        organizationId: currentOrganization.id,
        oldContactId: structure.id, // Pour tracer la migration
        migratedAt: serverTimestamp(),
        createdAt: structure.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Conserver les tags et autres données
        tags: structure.tags || [],
        commentaire: structure.commentaire || '',
        isClient: structure.isClient || false
      };

      if (!isDryRun) {
        const docRef = await addDoc(collection(db, 'structures'), newStructure);
        mapping[structure.id] = docRef.id;
        migrated.push({ ...newStructure, id: docRef.id, oldId: structure.id });
      } else {
        migrated.push({ ...newStructure, oldId: structure.id });
      }
    }

    return { migrated, skipped, mapping };
  };

  /**
   * Phase 3 : Migrer les personnes et créer les liaisons
   */
  const migratePersonnes = async (personnes, existingPersonnes, structureMapping, isDryRun = true) => {
    const migrated = [];
    const liaisons = [];
    const skipped = [];
    const mapping = {}; // oldId -> newId

    for (const personne of personnes) {
      const key = `${personne.prenom || ''} ${personne.nom || ''}`.toLowerCase().trim();

      // Vérifier si elle existe déjà
      if (existingPersonnes.has(key)) {
        skipped.push({ ...personne, reason: 'Existe déjà' });
        continue;
      }

      // Déterminer la structure liée
      let structureId = null;
      if (personne.structureId && structureMapping[personne.structureId]) {
        structureId = structureMapping[personne.structureId];
      }

      const newPersonne = {
        // Identification
        civilite: personne.civilite || personne.personneCivilite || null,
        nom: personne.nom || personne.personneNom || '',
        prenom: personne.prenom || personne.personnePrenom || '',
        
        // Contact
        email: personne.email || personne.personneEmail || null,
        telephone: personne.telephone || personne.personneTelephone || null,
        telephoneMobile: personne.telephoneMobile || personne.personneTelephoneMobile || null,
        
        // Fonction
        fonction: personne.fonction || personne.personneFonction || null,
        
        // Métadonnées
        organizationId: currentOrganization.id,
        oldContactId: personne.id,
        migratedAt: serverTimestamp(),
        createdAt: personne.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Conserver les tags et autres données
        tags: personne.tags || [],
        commentaire: personne.commentaire || ''
      };

      if (!isDryRun) {
        const docRef = await addDoc(collection(db, 'personnes'), newPersonne);
        mapping[personne.id] = docRef.id;
        migrated.push({ ...newPersonne, id: docRef.id, oldId: personne.id });

        // Créer la liaison si nécessaire
        if (structureId) {
          const liaison = {
            personneId: docRef.id,
            structureId: structureId,
            fonction: newPersonne.fonction,
            organizationId: currentOrganization.id,
            createdAt: serverTimestamp()
          };
          const liaisonRef = await addDoc(collection(db, 'liaisons'), liaison);
          liaisons.push({ ...liaison, id: liaisonRef.id });
        }
      } else {
        migrated.push({ ...newPersonne, oldId: personne.id });
        if (structureId) {
          liaisons.push({
            personneId: 'NEW_ID',
            structureId: structureId,
            fonction: newPersonne.fonction
          });
        }
      }
    }

    return { migrated, liaisons, skipped, mapping };
  };

  /**
   * Phase 4 : Mettre à jour les références
   */
  const updateReferences = async (references, structureMapping, personneMapping, isDryRun = true) => {
    const updated = {
      concerts: 0,
      lieux: 0,
      contrats: 0,
      devis: 0
    };

    const batch = writeBatch(db);
    let batchCount = 0;

    for (const [collName, items] of Object.entries(references)) {
      for (const item of items) {
        const updates = {};
        
        // Mapper les anciens IDs vers les nouveaux
        if (item.data.contactId) {
          const newId = structureMapping[item.data.contactId] || personneMapping[item.data.contactId];
          if (newId) {
            // Déterminer si c'est une structure ou une personne
            if (structureMapping[item.data.contactId]) {
              updates.structureId = newId;
              updates.oldContactId = item.data.contactId;
              // Supprimer l'ancien champ après migration
              updates.contactId = null;
            } else {
              updates.personneId = newId;
              updates.oldContactId = item.data.contactId;
              updates.contactId = null;
            }
          }
        }

        // Gérer les tableaux d'IDs
        if (item.data.contactIds && Array.isArray(item.data.contactIds)) {
          const newStructureIds = [];
          const newPersonneIds = [];
          
          item.data.contactIds.forEach(oldId => {
            if (structureMapping[oldId]) {
              newStructureIds.push(structureMapping[oldId]);
            } else if (personneMapping[oldId]) {
              newPersonneIds.push(personneMapping[oldId]);
            }
          });

          if (newStructureIds.length > 0) updates.structureIds = newStructureIds;
          if (newPersonneIds.length > 0) updates.personneIds = newPersonneIds;
          updates.oldContactIds = item.data.contactIds;
          updates.contactIds = null;
        }

        // Gérer les champs spécifiques
        if (item.data.organisateurId && structureMapping[item.data.organisateurId]) {
          updates.organisateurId = structureMapping[item.data.organisateurId];
        }
        if (item.data.programmateurId && structureMapping[item.data.programmateurId]) {
          updates.programmateurId = structureMapping[item.data.programmateurId];
        }

        if (Object.keys(updates).length > 0) {
          updates.migratedReferencesAt = serverTimestamp();
          
          if (!isDryRun) {
            batch.update(doc(db, collName, item.id), updates);
            batchCount++;
            
            // Commit par batch de 500
            if (batchCount >= 500) {
              await batch.commit();
              batchCount = 0;
            }
          }
          
          updated[collName]++;
        }
      }
    }

    // Commit final
    if (!isDryRun && batchCount > 0) {
      await batch.commit();
    }

    return updated;
  };

  /**
   * Exécuter la migration complète
   */
  const runMigration = async () => {
    if (!currentOrganization?.id) {
      alert('Aucune organisation sélectionnée');
      return;
    }

    setIsRunning(true);
    setMigrationStatus({
      phase: 'Analyse des données...',
      progress: 0,
      total: 100,
      errors: [],
      results: {
        structuresMigrated: 0,
        personnesMigrated: 0,
        liaisonsCreated: 0,
        referencesUpdated: 0,
        duplicatesSkipped: 0
      }
    });

    try {
      // Phase 1 : Analyse
      console.log('🔍 Phase 1 : Analyse des données...');
      const analysis = await analyzeData();
      
      const totalItems = 
        analysis.oldContacts.structures.length + 
        analysis.oldContacts.personnes.length +
        Object.values(analysis.referencesToUpdate).reduce((sum, arr) => sum + arr.length, 0);

      setMigrationStatus(prev => ({
        ...prev,
        phase: 'Analyse terminée',
        progress: 10,
        total: totalItems
      }));

      console.log('📊 Analyse:', {
        structures: analysis.oldContacts.structures.length,
        personnes: analysis.oldContacts.personnes.length,
        unknown: analysis.oldContacts.unknown.length,
        references: Object.entries(analysis.referencesToUpdate)
          .map(([k, v]) => `${k}: ${v.length}`)
          .join(', ')
      });

      // Phase 2 : Migration des structures
      console.log('🏢 Phase 2 : Migration des structures...');
      setMigrationStatus(prev => ({
        ...prev,
        phase: 'Migration des structures...',
        progress: 20
      }));

      const structuresResult = await migrateStructures(
        analysis.oldContacts.structures,
        analysis.existingStructures,
        dryRun
      );

      setMigrationStatus(prev => ({
        ...prev,
        progress: 40,
        results: {
          ...prev.results,
          structuresMigrated: structuresResult.migrated.length,
          duplicatesSkipped: prev.results.duplicatesSkipped + structuresResult.skipped.length
        }
      }));

      // Phase 3 : Migration des personnes
      console.log('👥 Phase 3 : Migration des personnes...');
      setMigrationStatus(prev => ({
        ...prev,
        phase: 'Migration des personnes...',
        progress: 50
      }));

      const personnesResult = await migratePersonnes(
        analysis.oldContacts.personnes,
        analysis.existingPersonnes,
        structuresResult.mapping,
        dryRun
      );

      setMigrationStatus(prev => ({
        ...prev,
        progress: 70,
        results: {
          ...prev.results,
          personnesMigrated: personnesResult.migrated.length,
          liaisonsCreated: personnesResult.liaisons.length,
          duplicatesSkipped: prev.results.duplicatesSkipped + personnesResult.skipped.length
        }
      }));

      // Phase 4 : Mise à jour des références
      console.log('🔗 Phase 4 : Mise à jour des références...');
      setMigrationStatus(prev => ({
        ...prev,
        phase: 'Mise à jour des références...',
        progress: 80
      }));

      const referencesResult = await updateReferences(
        analysis.referencesToUpdate,
        structuresResult.mapping,
        personnesResult.mapping,
        dryRun
      );

      const totalReferences = Object.values(referencesResult).reduce((sum, val) => sum + val, 0);

      setMigrationStatus(prev => ({
        ...prev,
        phase: dryRun ? 'Simulation terminée' : 'Migration terminée !',
        progress: 100,
        results: {
          ...prev.results,
          referencesUpdated: totalReferences
        }
      }));

      console.log('✅ Migration terminée:', {
        structures: structuresResult.migrated.length,
        personnes: personnesResult.migrated.length,
        liaisons: personnesResult.liaisons.length,
        références: totalReferences,
        doublons: structuresResult.skipped.length + personnesResult.skipped.length
      });

    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      setMigrationStatus(prev => ({
        ...prev,
        phase: 'Erreur',
        errors: [...prev.errors, error.message]
      }));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className={styles.container}>
      <Card.Header>
        <h3>🚀 Migration Finale des Contacts</h3>
        <p className="text-muted mb-0">
          Termine la migration contacts → structures/personnes/liaisons
        </p>
      </Card.Header>

      <Card.Body>
        <Alert variant="warning" className="mb-4">
          <h5>⚠️ Important</h5>
          <ul className="mb-0">
            <li>Cette migration va transférer TOUS les contacts vers le nouveau système</li>
            <li>Les références dans concerts, lieux, contrats et devis seront mises à jour</li>
            <li>Les doublons seront détectés et ignorés</li>
            <li>Faites d'abord une simulation (Dry Run) pour vérifier</li>
          </ul>
        </Alert>

        <div className="mb-4">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="dryRun"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              disabled={isRunning}
            />
            <label className="form-check-label" htmlFor="dryRun">
              Mode simulation (Dry Run) - Aucune modification ne sera effectuée
            </label>
          </div>
        </div>

        {migrationStatus.phase && (
          <div className="mb-4">
            <h5>{migrationStatus.phase}</h5>
            <ProgressBar 
              animated={isRunning}
              now={migrationStatus.progress} 
              label={`${migrationStatus.progress}%`}
            />
            
            {migrationStatus.results && (
              <div className="mt-3">
                <Badge bg="primary" className="me-2">
                  Structures: {migrationStatus.results.structuresMigrated}
                </Badge>
                <Badge bg="info" className="me-2">
                  Personnes: {migrationStatus.results.personnesMigrated}
                </Badge>
                <Badge bg="success" className="me-2">
                  Liaisons: {migrationStatus.results.liaisonsCreated}
                </Badge>
                <Badge bg="warning" className="me-2">
                  Références: {migrationStatus.results.referencesUpdated}
                </Badge>
                <Badge bg="secondary">
                  Doublons ignorés: {migrationStatus.results.duplicatesSkipped}
                </Badge>
              </div>
            )}
          </div>
        )}

        {migrationStatus.errors.length > 0 && (
          <Alert variant="danger">
            <h6>Erreurs rencontrées :</h6>
            <ul className="mb-0">
              {migrationStatus.errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        <div className="d-flex gap-3">
          <Button
            variant={dryRun ? 'warning' : 'danger'}
            size="lg"
            onClick={runMigration}
            disabled={isRunning || !currentOrganization}
          >
            {isRunning ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Migration en cours...
              </>
            ) : (
              <>
                {dryRun ? '🧪 Lancer la Simulation' : '🚀 Lancer la Migration Réelle'}
              </>
            )}
          </Button>

          {migrationStatus.progress === 100 && !dryRun && (
            <Alert variant="success" className="mb-0 flex-grow-1">
              ✅ Migration terminée avec succès !
            </Alert>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default ContactsMigrationFinal;