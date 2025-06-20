import React, { useState } from 'react';
import { Card, Button, Alert, Badge } from 'react-bootstrap';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Outil de migration spécifique pour Sophie Madet
 * Migre le contact depuis l'ancien format vers contacts_unified
 */
const SophieMadetMigration = () => {
  const { currentOrganization } = useOrganization();
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [migrationLog, setMigrationLog] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setMigrationLog(prev => [...prev, { timestamp, message, type }]);
    console.log(`[Sophie Migration ${type}] ${message}`);
  };

  const sophieOriginalData = {
    id: "QxkEAuYVM3mFrZWDFm95",
    type: "mixte",
    migrationStatus: "partially-migrated", 
    structureId: "85011847200016",
    prenom: "Sophie",
    nom: "Madet",
    fonction: "Présidente",
    email: "",
    mailDirect: "",
    telephone: "",
    telDirect: "",
    mobile: "",
    adresse: "",
    ville: "",
    codePostal: "",
    pays: "France",
    organizationId: "9LjkCJG04pEzbABdHkSf",
    concertsIds: ["con-1749569483128-xw9cfj"]
  };

  const migrateSophie = async () => {
    setMigrating(true);
    setError(null);
    setResults(null);
    setMigrationLog([]);

    try {
      addLog('🚀 Début de la migration de Sophie Madet');
      
      if (!currentOrganization?.id) {
        throw new Error('Aucune organisation sélectionnée');
      }

      // 1. Vérifier si Sophie existe déjà dans contacts_unified
      addLog('🔍 Vérification si Sophie existe déjà dans contacts_unified...');
      
      const unifiedQuery = query(
        collection(db, 'contacts_unified'),
        where('organizationId', '==', currentOrganization.id)
      );
      
      const unifiedSnapshot = await getDocs(unifiedQuery);
      let sophieExistsInUnified = false;
      let existingDoc = null;
      
      unifiedSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Vérifier si Sophie existe comme personne libre
        if (data.personne && data.personne.nom === 'Madet' && data.personne.prenom === 'Sophie') {
          sophieExistsInUnified = true;
          existingDoc = { id: doc.id, ...data };
          addLog('✅ Sophie trouvée comme personne libre dans contacts_unified');
        }
        
        // Vérifier si Sophie existe dans les personnes d'une structure
        if (data.personnes) {
          data.personnes.forEach(p => {
            if (p.nom === 'Madet' && p.prenom === 'Sophie') {
              sophieExistsInUnified = true;
              existingDoc = { id: doc.id, ...data };
              addLog('✅ Sophie trouvée comme personne associée dans contacts_unified');
            }
          });
        }
      });
      
      if (sophieExistsInUnified) {
        addLog('⚠️ Sophie existe déjà dans contacts_unified. Migration non nécessaire.', 'warning');
        setResults({
          success: true,
          message: 'Sophie Madet existe déjà dans le système unifié',
          existingContact: existingDoc
        });
        return;
      }

      // 2. Récupérer les données complètes de Sophie depuis l'ancienne collection
      addLog('📖 Récupération des données complètes de Sophie...');
      
      const sophieDocRef = doc(db, 'contacts', sophieOriginalData.id);
      const sophieDoc = await getDoc(sophieDocRef);
      
      let completeData = sophieOriginalData;
      if (sophieDoc.exists()) {
        completeData = { ...sophieOriginalData, ...sophieDoc.data() };
        addLog('✅ Données complètes récupérées depuis la collection contacts');
      } else {
        addLog('⚠️ Contact non trouvé dans collection contacts, utilisation des données de debug', 'warning');
      }

      // 3. Vérifier si la structure associée existe dans contacts_unified
      addLog('🔍 Vérification de la structure associée...');
      
      let associatedStructure = null;
      if (completeData.structureId) {
        // Chercher la structure dans contacts_unified
        const structureQuery = query(
          collection(db, 'contacts_unified'),
          where('organizationId', '==', currentOrganization.id),
          where('entityType', '==', 'structure')
        );
        
        const structureSnapshot = await getDocs(structureQuery);
        
        structureSnapshot.forEach(doc => {
          const data = doc.data();
          // Vérifier si l'ID de structure correspond (peut être dans metadata)
          if (data.metadata && data.metadata.originalStructureId === completeData.structureId) {
            associatedStructure = { id: doc.id, ...data };
            addLog('✅ Structure associée trouvée dans contacts_unified');
          }
        });
      }

      // 4. Créer Sophie selon le contexte (associée ou libre)
      if (associatedStructure && associatedStructure.personnes && associatedStructure.personnes.length < 3) {
        addLog('📝 Ajout de Sophie à la structure existante...');
        
        // Ajouter Sophie aux personnes de la structure
        const newPersonne = {
          id: completeData.id,
          civilite: completeData.civilite || '',
          prenom: completeData.prenom,
          nom: completeData.nom,
          fonction: completeData.fonction || '',
          email: completeData.email || completeData.mailDirect || '',
          telephone: completeData.telephone || completeData.telDirect || completeData.mobile || '',
          adresse: completeData.adresse || '',
          ville: completeData.ville || '',
          codePostal: completeData.codePostal || '',
          pays: completeData.pays || 'France'
        };
        
        const updatedPersonnes = [...(associatedStructure.personnes || []), newPersonne];
        
        const structureRef = doc(db, 'contacts_unified', associatedStructure.id);
        await updateDoc(structureRef, {
          personnes: updatedPersonnes,
          updatedAt: serverTimestamp()
        });
        
        addLog('✅ Sophie ajoutée à la structure avec succès');
        
      } else {
        addLog('📝 Création de Sophie comme personne libre...');
        
        // Créer Sophie comme personne libre
        const sophieUnifiedData = {
          entityType: 'personne_libre',
          organizationId: currentOrganization.id,
          
          personne: {
            civilite: completeData.civilite || '',
            prenom: completeData.prenom,
            nom: completeData.nom,
            fonction: completeData.fonction || '',
            email: completeData.email || completeData.mailDirect || '',
            telephone: completeData.telephone || completeData.telDirect || completeData.mobile || '',
            adresse: completeData.adresse || '',
            ville: completeData.ville || '',
            codePostal: completeData.codePostal || '',
            pays: completeData.pays || 'France'
          },
          
          // Métadonnées de migration
          migrationVersion: 'unified-v1',
          migrationDate: serverTimestamp(),
          migrationNote: 'Migrée depuis contact mixte partially-migrated',
          
          // Préserver les relations métier
          concertsIds: completeData.concertsIds || [],
          lieuxIds: completeData.lieuxIds || [],
          artistesIds: completeData.artistesIds || [],
          
          // Métadonnées temporelles
          createdAt: completeData.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'contacts_unified'), sophieUnifiedData);
        addLog(`✅ Sophie créée comme personne libre: ${docRef.id}`);
      }

      // 5. Marquer l'ancien contact comme complètement migré
      addLog('📝 Marquage de l\'ancien contact comme migré...');
      
      if (sophieDoc.exists()) {
        await updateDoc(sophieDocRef, {
          migrationStatus: 'fully-migrated',
          migrationVersion: 'unified-v1',
          migrationDate: serverTimestamp(),
          migrationNote: 'Migré vers contacts_unified - Sophie Madet'
        });
        addLog('✅ Ancien contact marqué comme migré');
      }

      // 6. Résultats finaux
      addLog('🎉 Migration de Sophie Madet terminée avec succès !');
      
      setResults({
        success: true,
        message: 'Sophie Madet a été migrée avec succès vers le système unifié',
        details: {
          contactId: completeData.id,
          migrated: true,
          associatedToStructure: !!associatedStructure
        }
      });

    } catch (error) {
      console.error('Erreur lors de la migration:', error);
      setError(`Erreur: ${error.message}`);
      addLog(`❌ Erreur: ${error.message}`, 'error');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <Card.Title>
          <i className="bi bi-person-check me-2"></i>
          Migration Sophie Madet
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <p>
            Cet outil migre spécifiquement le contact <strong>Sophie Madet</strong> 
            depuis l'ancien format vers le système unifié <code>contacts_unified</code>.
          </p>
          <p className="text-muted small">
            Contact ID: <code>QxkEAuYVM3mFrZWDFm95</code><br/>
            Statut actuel: <Badge bg="warning">partially-migrated</Badge><br/>
            Type: <Badge bg="info">mixte</Badge>
          </p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {results && (
          <Alert variant={results.success ? "success" : "danger"} className="mb-3">
            <i className={`bi ${results.success ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
            {results.message}
            {results.details && (
              <div className="mt-2 small">
                <div>Contact ID: <code>{results.details.contactId}</code></div>
                <div>Associée à structure: {results.details.associatedToStructure ? '✅' : '❌'}</div>
              </div>
            )}
          </Alert>
        )}

        <div className="d-flex gap-2 mb-3">
          <Button 
            variant="primary" 
            onClick={migrateSophie}
            disabled={migrating || !currentOrganization}
          >
            {migrating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Migration en cours...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-right-circle me-2"></i>
                Migrer Sophie Madet
              </>
            )}
          </Button>
        </div>

        {/* Log de migration */}
        {migrationLog.length > 0 && (
          <div className="mt-4">
            <h6>Log de migration:</h6>
            <div className="bg-light p-3 rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {migrationLog.map((log, index) => (
                <div key={index} className={`small mb-1 ${
                  log.type === 'error' ? 'text-danger' : 
                  log.type === 'warning' ? 'text-warning' : 
                  log.type === 'success' ? 'text-success' : 'text-muted'
                }`}>
                  <span className="text-muted">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default SophieMadetMigration;