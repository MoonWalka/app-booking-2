import React, { useState } from 'react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Composant de débogage pour vérifier l'état de migration des structures
 */
function CheckStructureMigration() {
  const [structureId, setStructureId] = useState('structure_1750614430892_trixam2ig');
  const [report, setReport] = useState(null);
  const [bulkReport, setBulkReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' ou 'all'
  const [filter, setFilter] = useState('all'); // 'all', 'migrated', 'notMigrated', 'duplicated', 'orphan'
  const { currentOrganization } = useOrganization();

  const checkMigrationStatus = async () => {
    if (!currentOrganization?.id) {
      alert('Veuillez sélectionner une organisation');
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    const migrationReport = {
      structureId,
      timestamp: new Date().toISOString(),
      organizationId: currentOrganization.id,
      status: 'UNKNOWN',
      inContactsUnified: false,
      inStructures: false,
      liaisons: [],
      recommendations: []
    };

    try {
      console.log(`🔍 Vérification de la structure: ${structureId}`);

      // 1. Vérifier dans contacts_unified
      console.log('📋 Vérification dans contacts_unified...');
      try {
        const unifiedDoc = await getDoc(doc(db, 'contacts_unified', structureId));
        if (unifiedDoc.exists()) {
          const data = unifiedDoc.data();
          migrationReport.inContactsUnified = true;
          migrationReport.unifiedData = {
            exists: true,
            entityType: data.entityType,
            nom: data.structure?.raisonSociale || data.structureRaisonSociale,
            personnesCount: data.personnes?.length || 0,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          };
          console.log('✅ Trouvé dans contacts_unified:', migrationReport.unifiedData);
        } else {
          console.log('❌ Non trouvé dans contacts_unified');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification dans contacts_unified:', error);
      }

      // 2. Vérifier dans structures (nouveau modèle)
      console.log('📋 Vérification dans structures...');
      try {
        const structureDoc = await getDoc(doc(db, 'structures', structureId));
        if (structureDoc.exists()) {
          const data = structureDoc.data();
          migrationReport.inStructures = true;
          migrationReport.structureData = {
            exists: true,
            raisonSociale: data.raisonSociale,
            type: data.type,
            email: data.email,
            organizationId: data.organizationId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          };
          console.log('✅ Trouvé dans structures:', migrationReport.structureData);
        } else {
          console.log('❌ Non trouvé dans structures');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification dans structures:', error);
      }

      // 3. Vérifier les liaisons
      console.log('📋 Recherche des liaisons...');
      try {
        const liaisonsQuery = query(
          collection(db, 'liaisons'),
          where('structureId', '==', structureId),
          where('organizationId', '==', currentOrganization.id)
        );
        const liaisonsSnapshot = await getDocs(liaisonsQuery);
        
        for (const liaisonDoc of liaisonsSnapshot.docs) {
          const liaisonData = liaisonDoc.data();
          // Récupérer les infos de la personne
          let personneInfo = { id: liaisonData.personneId, nom: 'Personne non trouvée' };
          try {
            const personneDoc = await getDoc(doc(db, 'personnes', liaisonData.personneId));
            if (personneDoc.exists()) {
              const pData = personneDoc.data();
              personneInfo = {
                id: personneDoc.id,
                nom: `${pData.prenom || ''} ${pData.nom || ''}`.trim() || 'Sans nom',
                email: pData.email
              };
            }
          } catch (err) {
            console.error('Erreur récupération personne:', err);
          }

          migrationReport.liaisons.push({
            id: liaisonDoc.id,
            personneId: liaisonData.personneId,
            personneNom: personneInfo.nom,
            fonction: liaisonData.fonction,
            actif: liaisonData.actif,
            createdAt: liaisonData.createdAt
          });
        }
        console.log(`✅ ${migrationReport.liaisons.length} liaisons trouvées`);
      } catch (error) {
        console.error('Erreur lors de la recherche des liaisons:', error);
      }

      // 4. Déterminer le statut
      if (migrationReport.inStructures && !migrationReport.inContactsUnified) {
        migrationReport.status = 'MIGRATED';
        migrationReport.recommendations.push('✅ Structure complètement migrée vers le nouveau modèle');
      } else if (migrationReport.inStructures && migrationReport.inContactsUnified) {
        migrationReport.status = 'DUPLICATED';
        migrationReport.recommendations.push('⚠️ Structure existe dans les deux collections');
        migrationReport.recommendations.push('Action: Supprimer de contacts_unified');
      } else if (!migrationReport.inStructures && migrationReport.inContactsUnified) {
        migrationReport.status = 'NOT_MIGRATED';
        migrationReport.recommendations.push('❌ Structure non migrée vers le nouveau modèle');
        migrationReport.recommendations.push('Action: Migrer vers la collection structures');
        if (migrationReport.liaisons.length > 0) {
          migrationReport.recommendations.push('⚠️ ATTENTION: Des liaisons existent pour une structure non migrée!');
        }
      } else {
        migrationReport.status = 'NOT_FOUND';
        migrationReport.recommendations.push('❌ Structure introuvable dans toutes les collections');
        if (migrationReport.liaisons.length > 0) {
          migrationReport.recommendations.push('⚠️ ATTENTION: Des liaisons orphelines existent!');
        }
      }

      migrationReport.executionTime = Date.now() - startTime;
      setReport(migrationReport);
      console.log('📊 Rapport complet:', migrationReport);

    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      migrationReport.error = error.message;
      setReport(migrationReport);
    } finally {
      setLoading(false);
    }
  };

  const checkAllStructures = async () => {
    if (!currentOrganization?.id) {
      alert('Veuillez sélectionner une organisation');
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    const results = {
      timestamp: new Date().toISOString(),
      organizationId: currentOrganization.id,
      totalChecked: 0,
      migrated: [],
      notMigrated: [],
      duplicated: [],
      withOrphanLiaisons: []
    };

    try {
      console.log('🔍 Recherche de toutes les structures...');

      // 1. Récupérer toutes les structures de contacts_unified de type structure
      const unifiedQuery = query(
        collection(db, 'contacts_unified'),
        where('organizationId', '==', currentOrganization.id),
        where('entityType', '==', 'structure')
      );
      const unifiedSnapshot = await getDocs(unifiedQuery);
      console.log(`📋 ${unifiedSnapshot.size} structures trouvées dans contacts_unified`);

      // 2. Récupérer toutes les structures du nouveau modèle
      const structuresQuery = query(
        collection(db, 'structures'),
        where('organizationId', '==', currentOrganization.id)
      );
      const structuresSnapshot = await getDocs(structuresQuery);
      console.log(`📋 ${structuresSnapshot.size} structures trouvées dans structures`);

      // 3. Analyser chaque structure de contacts_unified
      for (const unifiedDoc of unifiedSnapshot.docs) {
        const structureId = unifiedDoc.id;
        const unifiedData = unifiedDoc.data();
        results.totalChecked++;

        // Vérifier si elle existe dans le nouveau modèle
        const structureDoc = await getDoc(doc(db, 'structures', structureId));
        
        // Vérifier les liaisons
        const liaisonsQuery = query(
          collection(db, 'liaisons'),
          where('structureId', '==', structureId),
          where('organizationId', '==', currentOrganization.id)
        );
        const liaisonsSnapshot = await getDocs(liaisonsQuery);

        const structureInfo = {
          id: structureId,
          nom: unifiedData.structure?.raisonSociale || unifiedData.structureRaisonSociale || 'Sans nom',
          inUnified: true,
          inStructures: structureDoc.exists(),
          liaisonsCount: liaisonsSnapshot.size,
          personnesCount: unifiedData.personnes?.length || 0
        };

        if (structureDoc.exists() && unifiedDoc.exists()) {
          results.duplicated.push(structureInfo);
        } else if (!structureDoc.exists()) {
          results.notMigrated.push(structureInfo);
          if (liaisonsSnapshot.size > 0) {
            results.withOrphanLiaisons.push({
              ...structureInfo,
              orphanLiaisons: liaisonsSnapshot.size
            });
          }
        }
      }

      // 4. Vérifier les structures qui existent seulement dans le nouveau modèle
      for (const structureDoc of structuresSnapshot.docs) {
        const structureId = structureDoc.id;
        const structureData = structureDoc.data();
        
        // Vérifier si elle n'existe pas dans unified
        const unifiedDoc = await getDoc(doc(db, 'contacts_unified', structureId));
        if (!unifiedDoc.exists()) {
          results.migrated.push({
            id: structureId,
            nom: structureData.raisonSociale || 'Sans nom',
            inUnified: false,
            inStructures: true
          });
        }
      }

      results.executionTime = Date.now() - startTime;
      setBulkReport(results);
      console.log('📊 Analyse complète:', results);

    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>🔍 Vérification de l'état de migration des structures</h2>
      
      {/* Sélecteur de mode */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <label style={{ marginRight: '20px' }}>
          <input
            type="radio"
            value="single"
            checked={mode === 'single'}
            onChange={(e) => setMode(e.target.value)}
            style={{ marginRight: '5px' }}
          />
          Vérifier une structure spécifique
        </label>
        <label>
          <input
            type="radio"
            value="all"
            checked={mode === 'all'}
            onChange={(e) => setMode(e.target.value)}
            style={{ marginRight: '5px' }}
          />
          Analyser toutes les structures de l'organisation
        </label>
      </div>

      {mode === 'single' && (
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={structureId}
            onChange={(e) => setStructureId(e.target.value)}
            placeholder="ID de la structure"
            style={{ 
              width: '400px', 
              padding: '10px', 
              marginRight: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button 
            onClick={checkMigrationStatus}
            disabled={loading || !structureId}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </div>
      )}

      {mode === 'all' && (
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={checkAllStructures}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Analyse en cours...' : 'Analyser toutes les structures'}
          </button>
        </div>
      )}

      {/* Rapport pour l'analyse globale */}
      {bulkReport && mode === 'all' && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3>📊 Rapport d'analyse globale</h3>
          
          {/* Filtres de vue */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setFilter('all')}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === 'all' ? '#007bff' : '#f8f9fa',
                color: filter === 'all' ? 'white' : '#6c757d',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Tout voir
            </button>
            <button 
              onClick={() => setFilter('migrated')}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === 'migrated' ? '#28a745' : '#f8f9fa',
                color: filter === 'migrated' ? 'white' : '#6c757d',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ✅ Migrées ({bulkReport.migrated.length})
            </button>
            <button 
              onClick={() => setFilter('notMigrated')}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === 'notMigrated' ? '#dc3545' : '#f8f9fa',
                color: filter === 'notMigrated' ? 'white' : '#6c757d',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ❌ Non migrées ({bulkReport.notMigrated.length})
            </button>
            <button 
              onClick={() => setFilter('duplicated')}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === 'duplicated' ? '#ffc107' : '#f8f9fa',
                color: filter === 'duplicated' ? 'white' : '#6c757d',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ⚠️ Dupliquées ({bulkReport.duplicated.length})
            </button>
            <button 
              onClick={() => setFilter('orphan')}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === 'orphan' ? '#dc3545' : '#f8f9fa',
                color: filter === 'orphan' ? 'white' : '#6c757d',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ⚠️ Liaisons orphelines ({bulkReport.withOrphanLiaisons.length})
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>{bulkReport.totalChecked}</h4>
              <p style={{ margin: 0, color: '#6c757d' }}>Structures analysées</p>
            </div>
            <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '4px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#155724' }}>{bulkReport.migrated.length}</h4>
              <p style={{ margin: 0, color: '#155724' }}>Migrées ✅</p>
            </div>
            <div style={{ backgroundColor: '#f8d7da', padding: '15px', borderRadius: '4px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#721c24' }}>{bulkReport.notMigrated.length}</h4>
              <p style={{ margin: 0, color: '#721c24' }}>Non migrées ❌</p>
            </div>
            <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '4px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#856404' }}>{bulkReport.duplicated.length}</h4>
              <p style={{ margin: 0, color: '#856404' }}>Dupliquées ⚠️</p>
            </div>
          </div>

          {bulkReport.withOrphanLiaisons.length > 0 && (filter === 'all' || filter === 'orphan') && (
            <div style={{ backgroundColor: '#f8d7da', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
              <h4 style={{ color: '#721c24' }}>⚠️ Structures avec liaisons orphelines ({bulkReport.withOrphanLiaisons.length})</h4>
              <p>Ces structures ont des liaisons mais n'existent pas dans le nouveau modèle !</p>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {bulkReport.withOrphanLiaisons.map((structure, idx) => (
                  <div key={idx} style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
                    <strong>{structure.nom}</strong>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                      ID: {structure.id} | {structure.orphanLiaisons} liaisons orphelines
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bulkReport.notMigrated.length > 0 && (filter === 'all' || filter === 'notMigrated') && (
            <div style={{ marginBottom: '20px' }}>
              <h4>Structures non migrées ({bulkReport.notMigrated.length})</h4>
              <button 
                onClick={() => {
                  const ids = bulkReport.notMigrated.map(s => s.id).join('\n');
                  navigator.clipboard.writeText(ids);
                  alert('IDs copiés dans le presse-papier !');
                }}
                style={{
                  marginBottom: '10px',
                  padding: '5px 10px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                📋 Copier les IDs
              </button>
              <div style={{ maxHeight: '300px', overflowY: 'auto', backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
                {bulkReport.notMigrated.map((structure, idx) => (
                  <div key={idx} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                    <strong>{structure.nom}</strong>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                      ID: {structure.id} | {structure.personnesCount} personnes | {structure.liaisonsCount} liaisons
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bulkReport.duplicated.length > 0 && (filter === 'all' || filter === 'duplicated') && (
            <div style={{ marginBottom: '20px' }}>
              <h4>Structures dupliquées ({bulkReport.duplicated.length})</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
                {bulkReport.duplicated.map((structure, idx) => (
                  <div key={idx} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                    <strong>{structure.nom}</strong>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>ID: {structure.id}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bulkReport.migrated.length > 0 && (filter === 'all' || filter === 'migrated') && (
            <div style={{ marginBottom: '20px' }}>
              <h4>✅ Structures correctement migrées ({bulkReport.migrated.length})</h4>
              <div style={{ maxHeight: '300px', overflowY: 'auto', backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
                {bulkReport.migrated.map((structure, idx) => (
                  <div key={idx} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                    <strong>{structure.nom}</strong>
                    <div style={{ fontSize: '0.9rem', color: '#28a745' }}>
                      ID: {structure.id} | ✅ Migré correctement
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '4px' }}>
            <h4>Recommandations</h4>
            <ul>
              {bulkReport.notMigrated.length > 0 && (
                <li>Migrer les {bulkReport.notMigrated.length} structures non migrées vers le nouveau modèle</li>
              )}
              {bulkReport.withOrphanLiaisons.length > 0 && (
                <li>⚠️ Corriger en priorité les {bulkReport.withOrphanLiaisons.length} structures avec liaisons orphelines</li>
              )}
              {bulkReport.duplicated.length > 0 && (
                <li>Nettoyer les {bulkReport.duplicated.length} structures dupliquées en supprimant de contacts_unified</li>
              )}
            </ul>
          </div>

          <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
            <p>Temps d'exécution: {bulkReport.executionTime}ms</p>
            <p>Timestamp: {bulkReport.timestamp}</p>
          </div>
        </div>
      )}

      {/* Rapport pour l'analyse individuelle */}
      {report && mode === 'single' && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3>📊 Rapport de migration</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Statut:</strong> 
            <span style={{ 
              marginLeft: '10px',
              padding: '5px 10px',
              borderRadius: '4px',
              backgroundColor: report.status === 'MIGRATED' ? '#28a745' : 
                             report.status === 'NOT_MIGRATED' ? '#dc3545' : 
                             report.status === 'DUPLICATED' ? '#ffc107' : '#6c757d',
              color: 'white'
            }}>
              {report.status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <h4>Collection contacts_unified</h4>
              {report.inContactsUnified ? (
                <div style={{ backgroundColor: '#e7f3ff', padding: '10px', borderRadius: '4px' }}>
                  <p>✅ Document trouvé</p>
                  {report.unifiedData && (
                    <>
                      <p><strong>Type:</strong> {report.unifiedData.entityType}</p>
                      <p><strong>Nom:</strong> {report.unifiedData.nom}</p>
                      <p><strong>Personnes:</strong> {report.unifiedData.personnesCount}</p>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px' }}>
                  <p>❌ Document non trouvé</p>
                </div>
              )}
            </div>

            <div>
              <h4>Collection structures</h4>
              {report.inStructures ? (
                <div style={{ backgroundColor: '#d4edda', padding: '10px', borderRadius: '4px' }}>
                  <p>✅ Document trouvé</p>
                  {report.structureData && (
                    <>
                      <p><strong>Raison sociale:</strong> {report.structureData.raisonSociale}</p>
                      <p><strong>Type:</strong> {report.structureData.type}</p>
                      <p><strong>Email:</strong> {report.structureData.email}</p>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>
                  <p>❌ Document non trouvé</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>Liaisons ({report.liaisons.length})</h4>
            {report.liaisons.length > 0 ? (
              <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
                {report.liaisons.map((liaison, index) => (
                  <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                    <p><strong>Personne:</strong> {liaison.personneNom}</p>
                    <p><strong>Fonction:</strong> {liaison.fonction || 'Non définie'}</p>
                    <p><strong>Actif:</strong> {liaison.actif ? 'Oui' : 'Non'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Aucune liaison trouvée</p>
            )}
          </div>

          <div>
            <h4>Recommandations</h4>
            <ul>
              {report.recommendations.map((rec, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>{rec}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
            <p>Temps d'exécution: {report.executionTime}ms</p>
            <p>Timestamp: {report.timestamp}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckStructureMigration;