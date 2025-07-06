import React, { useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  db
} from '@/services/firebase-service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

/**
 * Debugger spécifique pour analyser les relations d'une entité
 */
const EntityRelationsDebugger = () => {
  const [loading, setLoading] = useState(false);
  const [entityType, setEntityType] = useState('artistes');
  const [entityId, setEntityId] = useState('');
  const [results, setResults] = useState(null);
  
  const analyzeEntity = async () => {
    if (!entityId) {
      alert('Veuillez entrer un ID d\'entité');
      return;
    }
    
    setLoading(true);
    const analysisResults = {
      timestamp: new Date().toISOString(),
      entity: null,
      relatedEntities: {},
      issues: []
    };
    
    try {
      // 1. Charger l'entité principale
      console.log(`🔍 Chargement de ${entityType}/${entityId}...`);
      const entityDoc = await getDoc(doc(db, entityType, entityId));
      
      if (!entityDoc.exists()) {
        analysisResults.issues.push({
          type: 'entity_not_found',
          message: `L'entité ${entityType}/${entityId} n'existe pas`
        });
        setResults(analysisResults);
        setLoading(false);
        return;
      }
      
      analysisResults.entity = {
        id: entityId,
        type: entityType,
        data: entityDoc.data()
      };
      
      // 2. Analyser les relations selon le type d'entité
      if (entityType === 'artistes') {
        await analyzeArtisteRelations(analysisResults);
      } else if (entityType === 'concerts') {
        await analyzeDateRelations(analysisResults);
      } else if (entityType === 'lieux') {
        await analyzeLieuRelations(analysisResults);
      } else if (entityType === 'contacts') {
        await analyzeContactRelations(analysisResults);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      analysisResults.error = error.message;
    }
    
    setResults(analysisResults);
    setLoading(false);
  };
  
  // Analyser les relations d'un artiste
  const analyzeArtisteRelations = async (results) => {
    const artiste = results.entity.data;
    
    // 1. Dates liés via concertsIds
    if (artiste.concertsIds && artiste.concertsIds.length > 0) {
      console.log(`📋 L'artiste a ${artiste.concertsIds.length} concerts dans concertsIds`);
      results.relatedEntities.concertsFromIds = [];
      
      for (const dateId of artiste.concertsIds) {
        const dateDoc = await getDoc(doc(db, 'concerts', dateId));
        if (dateDoc.exists()) {
          const dateData = dateDoc.data();
          results.relatedEntities.concertsFromIds.push({
            id: dateId,
            exists: true,
            data: dateData,
            hasArtisteId: dateData.artisteId === results.entity.id,
            artisteId: dateData.artisteId
          });
        } else {
          results.relatedEntities.concertsFromIds.push({
            id: dateId,
            exists: false
          });
          results.issues.push({
            type: 'orphaned_relation',
            message: `Date ${dateId} dans concertsIds n'existe pas`
          });
        }
      }
    }
    
    // 2. Dates qui pointent vers cet artiste
    console.log(`🔍 Recherche des concerts qui pointent vers l'artiste...`);
    const concertsQuery = query(
      collection(db, 'dates'),
      where('artisteId', '==', results.entity.id)
    );
    const concertsSnapshot = await getDocs(concertsQuery);
    
    results.relatedEntities.concertsPointingToArtiste = [];
    concertsSnapshot.forEach(doc => {
      const dateData = doc.data();
      const isInArtisteDatesIds = artiste.concertsIds?.includes(doc.id);
      
      results.relatedEntities.concertsPointingToArtiste.push({
        id: doc.id,
        data: dateData,
        isInArtisteDatesIds
      });
      
      if (!isInArtisteDatesIds) {
        results.issues.push({
          type: 'missing_bidirectional',
          message: `Date ${doc.id} (${dateData.titre}) pointe vers l'artiste mais n'est pas dans concertsIds`,
          fix: {
            action: 'add_to_array',
            entity: 'artistes',
            entityId: results.entity.id,
            field: 'concertsIds',
            value: doc.id
          }
        });
      }
    });
  };
  
  // Analyser les relations d'un concert
  const analyzeDateRelations = async (results) => {
    const date = results.entity.data;
    
    // Vérifier l'artiste
    if (date.artisteId) {
      const artisteDoc = await getDoc(doc(db, 'artistes', date.artisteId));
      if (artisteDoc.exists()) {
        const artisteData = artisteDoc.data();
        const hasDateInList = artisteData.concertsIds?.includes(results.entity.id);
        
        results.relatedEntities.artiste = {
          id: date.artisteId,
          exists: true,
          data: artisteData,
          hasDateInList
        };
        
        if (!hasDateInList) {
          results.issues.push({
            type: 'missing_bidirectional',
            message: `L'artiste ${artisteData.nom} n'a pas ce date dans sa liste concertsIds`,
            fix: {
              action: 'add_to_array',
              entity: 'artistes',
              entityId: date.artisteId,
              field: 'concertsIds',
              value: results.entity.id
            }
          });
        }
      } else {
        results.relatedEntities.artiste = {
          id: date.artisteId,
          exists: false
        };
        results.issues.push({
          type: 'orphaned_relation',
          message: `Artiste ${date.artisteId} n'existe pas`
        });
      }
    }
    
    // Vérifier le lieu
    if (date.lieuId) {
      const lieuDoc = await getDoc(doc(db, 'lieux', date.lieuId));
      if (lieuDoc.exists()) {
        const lieuData = lieuDoc.data();
        const hasDateInList = lieuData.concertsIds?.includes(results.entity.id);
        
        results.relatedEntities.lieu = {
          id: date.lieuId,
          exists: true,
          data: lieuData,
          hasDateInList
        };
        
        if (!hasDateInList) {
          results.issues.push({
            type: 'missing_bidirectional',
            message: `Le lieu ${lieuData.nom} n'a pas ce date dans sa liste concertsIds`,
            fix: {
              action: 'add_to_array',
              entity: 'lieux',
              entityId: date.lieuId,
              field: 'concertsIds',
              value: results.entity.id
            }
          });
        }
      }
    }
  };
  
  // Analyser les relations d'un lieu
  const analyzeLieuRelations = async (results) => {
    const lieu = results.entity.data;
    
    // Dates liés
    if (lieu.concertsIds && lieu.concertsIds.length > 0) {
      results.relatedEntities.concerts = [];
      for (const dateId of lieu.concertsIds) {
        const dateDoc = await getDoc(doc(db, 'concerts', dateId));
        if (dateDoc.exists()) {
          const dateData = dateDoc.data();
          results.relatedEntities.concerts.push({
            id: dateId,
            exists: true,
            data: dateData,
            hasLieuId: dateData.lieuId === results.entity.id
          });
        }
      }
    }
  };
  
  // Analyser les relations d'un contact
  const analyzeContactRelations = async (results) => {
    const contact = results.entity.data;
    
    // Dates liés
    if (contact.concertsIds && contact.concertsIds.length > 0) {
      results.relatedEntities.concerts = [];
      for (const dateId of contact.concertsIds) {
        const dateDoc = await getDoc(doc(db, 'concerts', dateId));
        if (dateDoc.exists()) {
          const dateData = dateDoc.data();
          results.relatedEntities.concerts.push({
            id: dateId,
            exists: true,
            data: dateData,
            hasContactId: dateData.contactId === results.entity.id
          });
        }
      }
    }
  };
  
  return (
    <Card>
      <div className="card-header">
        <h3>🔗 Analyseur de Relations d'Entité</h3>
      </div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Type d'entité</label>
            <select 
              className="form-select"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
            >
              <option value="artistes">Artistes</option>
              <option value="concerts">Dates</option>
              <option value="lieux">Lieux</option>
              <option value="contacts">Contacts</option>
              <option value="structures">Structures</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">ID de l'entité</label>
            <input
              type="text"
              className="form-control"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="Ex: r8D62Utx..."
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">&nbsp;</label>
            <Button
              variant="primary"
              onClick={analyzeEntity}
              disabled={loading || !entityId}
              className="d-block w-100"
            >
              {loading ? 'Analyse en cours...' : 'Analyser'}
            </Button>
          </div>
        </div>
        
        {/* Exemples d'IDs */}
        <div className="alert alert-info">
          <strong>💡 IDs disponibles :</strong>
          <ul className="mb-0">
            <li>M'Dezoen (artiste) : <code>r8D62Utx...</code> (copiez l'ID complet depuis l'audit)</li>
            <li>Cliquez sur une entité dans l'audit système pour copier son ID</li>
          </ul>
        </div>
        
        {results && (
          <div className="mt-4">
            {/* Entité principale */}
            {results.entity && (
              <div className="card mb-3">
                <div className="card-header">
                  <h5>📋 {results.entity.type} : {results.entity.data.nom || results.entity.data.titre}</h5>
                </div>
                <div className="card-body">
                  <pre className="bg-light p-2" style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {JSON.stringify(results.entity.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Problèmes détectés */}
            {results.issues.length > 0 && (
              <div className="alert alert-warning">
                <h5>⚠️ Problèmes détectés : {results.issues.length}</h5>
                {results.issues.map((issue, idx) => (
                  <div key={idx} className="mb-2">
                    <strong>{issue.message}</strong>
                    {issue.fix && (
                      <div className="mt-1">
                        <small className="text-muted">
                          Fix: Ajouter <code>{issue.fix.value}</code> à <code>{issue.fix.entity}/{issue.fix.entityId}.{issue.fix.field}</code>
                        </small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Relations analysées */}
            {Object.entries(results.relatedEntities).map(([key, entities]) => (
              <div key={key} className="card mb-3">
                <div className="card-header">
                  <h6>{key}</h6>
                </div>
                <div className="card-body">
                  {Array.isArray(entities) ? (
                    <ul>
                      {entities.map((entity, idx) => (
                        <li key={idx}>
                          {entity.exists ? (
                            <>
                              <strong>{entity.data?.titre || entity.data?.nom || entity.id}</strong>
                              {entity.hasArtisteId !== undefined && (
                                <span className={entity.hasArtisteId ? 'text-success' : 'text-danger'}>
                                  {entity.hasArtisteId ? ' ✅ Relation bidirectionnelle OK' : ' ❌ Relation manquante'}
                                </span>
                              )}
                              {entity.isInArtisteDatesIds !== undefined && (
                                <span className={entity.isInArtisteDatesIds ? 'text-success' : 'text-danger'}>
                                  {entity.isInArtisteDatesIds ? ' ✅ Présent dans concertsIds' : ' ❌ Manquant dans concertsIds'}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-danger">❌ N'existe pas</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div>
                      {entities.exists ? (
                        <>
                          <strong>{entities.data?.nom || entities.id}</strong>
                          {entities.hasDateInList !== undefined && (
                            <span className={entities.hasDateInList ? 'text-success' : 'text-danger'}>
                              {entities.hasDateInList ? ' ✅ Relation bidirectionnelle OK' : ' ❌ Relation manquante'}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-danger">❌ N'existe pas</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default EntityRelationsDebugger;