import React, { useState } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

/**
 * Outil de migration automatique des entités vers le format contact unifié
 */
const ContactMigrationTool = () => {
  const { currentOrganization } = useOrganization();
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [migrationLog, setMigrationLog] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setMigrationLog(prev => [...prev, { timestamp, message, type }]);
    console.log(`[Migration ${type}] ${message}`);
  };

  const getCollectionName = (baseCollection) => {
    return currentOrganization?.id ? `${baseCollection}_org_${currentOrganization.id}` : baseCollection;
  };

  // Migration automatique simplifiée
  const performMigration = async () => {
    setMigrating(true);
    setError(null);
    setResults(null);
    setMigrationLog([]);

    try {
      addLog('🚀 Début de la migration automatique');
      
      const migrations = [];
      
      // Rechercher dans les deux collections possibles
      const orgContactsCollection = getCollectionName('contacts');
      const globalContactsCollection = 'contacts';
      
      let contactsSnapshot;
      let contactsCollection;
      
      // Essayer d'abord la collection organisationnelle
      addLog(`🔍 Collection contacts org: ${orgContactsCollection}`);
      contactsSnapshot = await getDocs(collection(db, orgContactsCollection));
      addLog(`📊 ${contactsSnapshot.size} contact(s) trouvé(s) dans org`);
      
      if (contactsSnapshot.empty) {
        // Essayer la collection globale
        addLog(`🔍 Collection contacts globale: ${globalContactsCollection}`);
        contactsSnapshot = await getDocs(collection(db, globalContactsCollection));
        addLog(`📊 ${contactsSnapshot.size} contact(s) trouvé(s) dans globale`);
        contactsCollection = globalContactsCollection;
      } else {
        contactsCollection = orgContactsCollection;
      }
      
      for (const contactDoc of contactsSnapshot.docs) {
        const contactData = contactDoc.data();
        const contactId = contactDoc.id;
        
        addLog(`👤 Analyse du contact: ${contactData.prenom || '[Sans prénom]'} ${contactData.nom || '[Sans nom]'} (ID: ${contactId})`);
        
        // Vérifier s'il a déjà été migré vers le format unifié avec une logique robuste
        const detectMigrationStatus = (data) => {
          // Vérifier la présence du marqueur de migration explicite
          if (data.migrationVersion === 'unified-v1') {
            return 'fully-migrated';
          }
          
          // Compter les sections présentes pour déterminer le niveau de migration
          const sectionChecks = {
            structure: !!(data.structureRaisonSociale || data.structureAdresse || data.structureEmail),
            personne1: !!(data.prenom && data.nom),
            personne2: !!(data.prenom2 || data.nom2 || data.civilite2),
            personne3: !!(data.prenom3 || data.nom3 || data.civilite3),
            diffusion: !!(data.nomFestival || data.periodeFestivalMois || data.bouclage),
            salle: !!(data.salleNom || data.salleAdresse || data.salleJauge1),
            qualifications: !!(data.tags || data.source || data.client !== undefined),
            metadata: !!(data.createdAt || data.updatedAt)
          };
          
          const presentSections = Object.values(sectionChecks).filter(Boolean).length;
          
          // Si moins de 3 sections présentes, probablement pas migré
          if (presentSections < 3) {
            return 'not-migrated';
          }
          
          // Si 3-5 sections présentes, partiellement migré
          if (presentSections < 6) {
            return 'partially-migrated';
          }
          
          // Si 6+ sections mais pas de marqueur, migration incomplète
          return 'legacy-migrated';
        };
        
        const migrationStatus = detectMigrationStatus(contactData);
        
        if (migrationStatus === 'fully-migrated') {
          addLog(`⏭️ Contact complètement migré: ${contactData.prenom || 'Structure'} ${contactData.nom || contactData.structureNom || contactId}`, 'info');
          continue;
        }
        
        if (migrationStatus === 'legacy-migrated') {
          addLog(`🔄 Contact partiellement migré (sera re-migré): ${contactData.prenom || 'Structure'} ${contactData.nom || contactData.structureNom || contactId}`, 'warning');
          // On continue la migration pour ajouter le marqueur et compléter les champs manquants
        }
        
        addLog(`📝 Statut migration: ${migrationStatus} - Procédure de migration...`);
        
        // Détecter le type de contact selon les nouvelles règles
        const hasPersonneData = (contactData.prenom?.trim() && contactData.nom?.trim());
        const hasStructureData = contactData.structureNom?.trim() || contactData.structureRaisonSociale?.trim();
        
        let contactType;
        if (hasStructureData && hasPersonneData) {
          contactType = 'structure+personne';
          addLog(`🏢👤 Contact mixte détecté: Structure "${contactData.structureNom}" + Personne "${contactData.prenom} ${contactData.nom}"`);
        } else if (hasStructureData) {
          contactType = 'structure';
          addLog(`🏢 Structure pure détectée: "${contactData.structureNom}"`);
        } else if (hasPersonneData) {
          contactType = 'personne';
          addLog(`👤 Personne pure détectée: "${contactData.prenom} ${contactData.nom}"`);
        } else {
          addLog(`❌ Contact sans données exploitables: ${contactId}`, 'warning');
          continue;
        }
        
        // Construire les métadonnées structure depuis les données existantes
        const structureData = {
          raisonSociale: contactData.structureNom || contactData.structureRaisonSociale || '',
          adresse: contactData.structureAdresse || '',
          codePostal: contactData.structureCodePostal || '',
          ville: contactData.structureVille || '',
          departement: contactData.structureDepartement || '',
          region: contactData.structureRegion || '',
          pays: contactData.structurePays || 'France',
          siteWeb: contactData.structureSiteWeb || '',
          telephone1: contactData.structureTelephone1 || '',
          telephone2: contactData.structureTelephone2 || '',
          mobile: contactData.structureMobile || '',
          fax: contactData.structureFax || '',
          email: contactData.structureEmail || ''
        };
        
        // Rechercher les entités liées
        const relatedData = {
          concerts: [],
          lieux: []
        };
        
        // Rechercher les concerts liés
        if (contactData.concertsIds && contactData.concertsIds.length > 0) {
          addLog(`🎵 Recherche de ${contactData.concertsIds.length} concert(s)...`);
          for (const dateId of contactData.concertsIds) {
            try {
              const dateDoc = await getDoc(doc(db, getCollectionName('concerts'), dateId));
              if (dateDoc.exists()) {
                relatedData.concerts.push(dateDoc.data());
                addLog(`✅ Date trouvé: ${dateDoc.data().title || dateId}`);
              }
            } catch (err) {
              addLog(`❌ Erreur date ${dateId}: ${err.message}`, 'error');
            }
          }
        }
        
        // Rechercher les lieux liés
        if (contactData.lieuxIds && contactData.lieuxIds.length > 0) {
          addLog(`📍 Recherche de ${contactData.lieuxIds.length} lieu(x)...`);
          for (const lieuId of contactData.lieuxIds) {
            try {
              const lieuDoc = await getDoc(doc(db, getCollectionName('lieux'), lieuId));
              if (lieuDoc.exists()) {
                relatedData.lieux.push(lieuDoc.data());
                addLog(`✅ Lieu trouvé: ${lieuDoc.data().nom || lieuId}`);
              }
            } catch (err) {
              addLog(`❌ Erreur lieu ${lieuId}: ${err.message}`, 'error');
            }
          }
        }
        
        // Construire les métadonnées unifiées des 8 sections
        const unifiedMetadata = {
          // Préserver l'ID de l'organisation
          organizationId: contactData.organizationId,
          
          // Métadonnées de base
          createdAt: contactData.createdAt || new Date(),
          updatedAt: new Date(),
          
          // Marqueur de migration pour éviter les re-migrations
          migrationVersion: 'unified-v1',
          migrationDate: new Date(),
          migrationStatus: migrationStatus,
          
          // Section 1: Structure (17 champs)
          structureRaisonSociale: structureData.raisonSociale,
          structureAdresse: structureData.adresse,
          structureSuiteAdresse1: contactData.structureSuiteAdresse1 || '',
          structureCodePostal: structureData.codePostal,
          structureVille: structureData.ville,
          structureDepartement: structureData.departement,
          structureRegion: structureData.region,
          structurePays: structureData.pays,
          structureSiteWeb: structureData.siteWeb,
          structureTelephone1: structureData.telephone1,
          structureTelephone2: structureData.telephone2,
          structureMobile: structureData.mobile,
          structureFax: structureData.fax,
          structureEmail: structureData.email,
          structureCommentaires1: contactData.structureCommentaires1 || '',
          structureCommentaires2: contactData.structureCommentaires2 || '',
          structureCommentaires3: contactData.structureCommentaires3 || '',
          structureCommentaires4: contactData.structureCommentaires4 || '',
          structureCommentaires5: contactData.structureCommentaires5 || '',
          structureCommentaires6: contactData.structureCommentaires6 || '',
          
          // Section 2: Personne 1 (22 champs)
          civilite: contactData.civilite || '',
          prenom: contactData.prenom || '',
          nom: contactData.nom || '',
          prenomNom: `${contactData.prenom || ''} ${contactData.nom || ''}`.trim(),
          fonction: contactData.fonction || '',
          telDirect: contactData.telephone || contactData.telDirect || '',
          telPerso: contactData.telPerso || '',
          mobile: contactData.mobile || '',
          mailDirect: contactData.email || contactData.mailDirect || '',
          mailPerso: contactData.mailPerso || '',
          fax: contactData.fax || '',
          site: contactData.site || '',
          adresse: contactData.adresse || '',
          suiteAdresse: contactData.suiteAdresse || '',
          codePostal: contactData.codePostal || '',
          ville: contactData.ville || '',
          departement: contactData.departement || '',
          region: contactData.region || '',
          pays: contactData.pays || 'France',
          commentaires1: contactData.commentaires || contactData.commentaires1 || '',
          commentaires2: contactData.commentaires2 || '',
          commentaires3: contactData.commentaires3 || '',
          
          // Section 3: Personne 2 (22 champs vides)
          civilite2: '', prenom2: '', nom2: '', prenomNom2: '', fonction2: '',
          telDirect2: '', telPerso2: '', mobile2: '', mailDirect2: '', mailPerso2: '',
          fax2: '', site2: '', adresse2: '', suiteAdresse2: '', codePostal2: '',
          ville2: '', departement2: '', region2: '', pays2: 'France',
          commentaires12: '', commentaires22: '', commentaires32: '',
          
          // Section 4: Personne 3 (22 champs vides)
          civilite3: '', prenom3: '', nom3: '', prenomNom3: '', fonction3: '',
          telDirect3: '', telPerso3: '', mobile3: '', mailDirect3: '', mailPerso3: '',
          fax3: '', site3: '', adresse3: '', suiteAdresse3: '', codePostal3: '',
          ville3: '', departement3: '', region3: '', pays3: 'France',
          commentaires13: '', commentaires23: '', commentaires33: '',
          
          // Section 5: Qualifications (5 champs)
          tags: contactData.tags || [],
          client: contactData.client || false,
          source: contactData.source || '',
          dateCreation: contactData.createdAt || contactData.dateCreation || new Date(),
          dateDerniereModif: new Date(),
          
          // Section 6: Diffusion (7 champs)
          nomFestival: relatedData.dates[0]?.title || relatedData.dates[0]?.nom || contactData.nomFestival || '',
          periodeFestivalMois: relatedData.dates[0]?.periodeMois || contactData.periodeFestivalMois || '',
          periodeFestivalComplete: relatedData.dates[0]?.periodeComplete || contactData.periodeFestivalComplete || '',
          bouclage: relatedData.dates[0]?.bouclage || contactData.bouclage || '',
          diffusionCommentaires1: contactData.diffusionCommentaires1 || '',
          diffusionCommentaires2: contactData.diffusionCommentaires2 || '',
          diffusionCommentaires3: contactData.diffusionCommentaires3 || '',
          
          // Section 7: Salle (16 champs)
          salleNom: relatedData.lieux[0]?.nom || contactData.salleNom || '',
          salleAdresse: relatedData.lieux[0]?.adresse || contactData.salleAdresse || '',
          salleSuiteAdresse: relatedData.lieux[0]?.suiteAdresse || contactData.salleSuiteAdresse || '',
          salleCodePostal: relatedData.lieux[0]?.codePostal || contactData.salleCodePostal || '',
          salleVille: relatedData.lieux[0]?.ville || contactData.salleVille || '',
          salleDepartement: relatedData.lieux[0]?.departement || contactData.salleDepartement || '',
          salleRegion: relatedData.lieux[0]?.region || contactData.salleRegion || '',
          sallePays: relatedData.lieux[0]?.pays || contactData.sallePays || 'France',
          salleTelephone: relatedData.lieux[0]?.telephone || contactData.salleTelephone || '',
          salleJauge1: relatedData.lieux[0]?.jauge1 || contactData.salleJauge1 || '',
          salleJauge2: relatedData.lieux[0]?.jauge2 || contactData.salleJauge2 || '',
          salleJauge3: relatedData.lieux[0]?.jauge3 || contactData.salleJauge3 || '',
          salleOuverture: relatedData.lieux[0]?.ouverture || contactData.salleOuverture || '',
          salleProfondeur: relatedData.lieux[0]?.profondeur || contactData.salleProfondeur || '',
          salleHauteur: relatedData.lieux[0]?.hauteur || contactData.salleHauteur || ''
        };
        
        // Effectuer la migration
        addLog(`🔄 Migration du contact ${contactId}...`);
        
        const contactRef = doc(db, contactsCollection, contactId);
        await updateDoc(contactRef, unifiedMetadata);
        
        migrations.push({
          contactId,
          contactType,
          contactName: hasPersonneData ? `${contactData.prenom} ${contactData.nom}` : 'Personne non définie',
          structureName: hasStructureData ? structureData.raisonSociale : 'Structure non définie',
          relatedEntities: {
            concerts: relatedData.concerts.length,
            lieux: relatedData.lieux.length
          },
          migratedSections: {
            structure: hasStructureData,
            personne1: hasPersonneData,
            personne2: false,
            personne3: false,
            qualifications: true,
            diffusion: relatedData.concerts.length > 0,
            salle: relatedData.lieux.length > 0
          }
        });
        
        const migrationSummary = hasPersonneData && hasStructureData 
          ? `${contactData.prenom} ${contactData.nom} + ${structureData.raisonSociale}`
          : hasPersonneData 
            ? `${contactData.prenom} ${contactData.nom}`
            : structureData.raisonSociale;
            
        addLog(`✅ Migration réussie pour ${migrationSummary} (Type: ${contactType})`, 'success');
      }
      
      addLog(`🎉 Migration terminée ! ${migrations.length} contact(s) migré(s)`, 'success');
      setResults(migrations);
      
    } catch (err) {
      console.error('❌ Erreur migration:', err);
      addLog(`❌ Erreur: ${err.message}`, 'error');
      setError(err.message);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: '20px' }}>
          <h2>🔄 Migration automatique vers contacts unifiés</h2>
          <p>
            Cet outil migre automatiquement les contacts avec structureId vers le format unifié
            en consolidant toutes les métadonnées.
          </p>
          
          {currentOrganization?.id && (
            <p><strong>Organisation:</strong> {currentOrganization.name} (ID: {currentOrganization.id})</p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Button 
            onClick={performMigration} 
            disabled={migrating}
            variant="primary"
          >
            {migrating ? 'Migration en cours...' : 'Démarrer la migration automatique'}
          </Button>
        </div>

        {error && (
          <Alert type="error" style={{ marginBottom: '20px' }}>
            <strong>Erreur:</strong> {error}
          </Alert>
        )}

        {/* Log de migration */}
        {migrationLog.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3>📋 Journal de migration</h3>
            <div style={{ 
              background: '#f8f9fa', 
              border: '1px solid #dee2e6', 
              borderRadius: '5px', 
              padding: '15px',
              maxHeight: '400px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '14px'
            }}>
              {migrationLog.map((log, index) => (
                <div key={index} style={{ 
                  marginBottom: '5px',
                  color: log.type === 'error' ? '#dc3545' : 
                        log.type === 'warning' ? '#fd7e14' : 
                        log.type === 'success' ? '#28a745' : '#6c757d'
                }}>
                  <span style={{ color: '#6c757d' }}>[{log.timestamp}]</span> {log.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Résultats de migration */}
        {results && results.length > 0 && (
          <div>
            <h3>✅ Résultats de migration ({results.length} contact(s))</h3>
            
            {results.map((migration, index) => (
              <div key={index} style={{ 
                marginBottom: '20px', 
                border: '1px solid #28a745', 
                borderRadius: '5px',
                padding: '15px',
                background: '#f8fff9'
              }}>
                <h4>
                  {migration.contactType === 'structure+personne' ? '🏢👤' : 
                   migration.contactType === 'structure' ? '🏢' : '👤'} 
                  {migration.contactType === 'structure+personne' 
                    ? `${migration.contactName} + ${migration.structureName}`
                    : migration.contactType === 'structure' 
                      ? migration.structureName
                      : migration.contactName}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                  <div><strong>Contact ID:</strong> {migration.contactId}</div>
                  <div><strong>Type détecté:</strong> {migration.contactType}</div>
                  <div><strong>Dates liés:</strong> {migration.relatedEntities.concerts}</div>
                  <div><strong>Lieux liés:</strong> {migration.relatedEntities.lieux}</div>
                </div>
                
                <div style={{ marginTop: '15px' }}>
                  <strong>Sections migrées:</strong>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '5px' }}>
                    {Object.entries(migration.migratedSections).map(([section, migrated]) => (
                      <span key={section} style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: migrated ? '#d4edda' : '#f8d7da',
                        color: migrated ? '#155724' : '#721c24',
                        border: `1px solid ${migrated ? '#c3e6cb' : '#f5c6cb'}`
                      }}>
                        {section}: {migrated ? '✅' : '❌'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '20px', padding: '15px', background: '#e9ecef', borderRadius: '5px' }}>
          <h4>ℹ️ Migration vers modèle unifié (8 sections)</h4>
          <ul>
            <li><strong>Analyse TOUS les contacts</strong> (structures, personnes, mixtes)</li>
            <li><strong>Détecte le type</strong> selon les nouvelles règles (structure + personne)</li>
            <li><strong>Crée les 8 sections complètes</strong> pour chaque contact</li>
            <li><strong>Migre les entités liées</strong> (concerts → diffusion, lieux → salle)</li>
            <li><strong>Préserve toutes les données existantes</strong></li>
            <li><strong>Interface adaptative</strong> : 2 vues pour les contacts mixtes</li>
          </ul>
          
          <div style={{ marginTop: '15px', fontSize: '14px' }}>
            <strong>Types détectés :</strong><br/>
            🏢 <strong>Structure pure</strong> : Seulement structureNom rempli<br/>
            👤 <strong>Personne pure</strong> : Seulement prenom + nom remplis<br/>
            🏢👤 <strong>Structure + Personne</strong> : Les deux remplis = 2 fiches distinctes
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContactMigrationTool;