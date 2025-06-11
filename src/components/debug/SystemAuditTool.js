import React, { useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  limit,
  db
} from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { entityConfigurations } from '@/config/entityConfigurations';

/**
 * Outil d'audit complet du système pour analyser les entités et leurs relations
 */
const SystemAuditTool = () => {
  const { currentOrganization } = useOrganization();
  const [auditResults, setAuditResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Audit général du système
  const runSystemAudit = async () => {
    setLoading(true);
    const results = {
      timestamp: new Date().toISOString(),
      organizationId: currentOrganization?.id,
      entities: {},
      relations: {},
      issues: []
    };
    
    try {
      // 1. Auditer chaque type d'entité
      const entityTypes = ['artistes', 'concerts', 'lieux', 'contacts', 'structures'];
      
      for (const entityType of entityTypes) {
        console.log(`🔍 Audit de ${entityType}...`);
        
        // Récupérer la configuration (les clés sont au singulier dans entityConfigurations)
        const configKey = entityType.endsWith('s') ? entityType.slice(0, -1) : entityType;
        const config = entityConfigurations[configKey];
        results.entities[entityType] = {
          hasConfig: !!config,
          configKey: configKey,
          configFields: config ? Object.keys(config) : [],
          data: []
        };
        
        // Requête pour récupérer les entités de l'organisation
        const q = query(
          collection(db, entityType),
          where('organizationId', '==', currentOrganization.id),
          limit(100)
        );
        
        const snapshot = await getDocs(q);
        results.entities[entityType].count = snapshot.size;
        
        // Analyser chaque document
        const entityAnalysis = [];
        for (const doc of snapshot.docs) {
          const data = doc.data();
          const analysis = {
            id: doc.id,
            nom: data.nom || data.titre || data.raisonSociale || 'Sans nom',
            hasOrganizationId: !!data.organizationId,
            organizationIdMatches: data.organizationId === currentOrganization.id,
            fields: Object.keys(data),
            relations: {}
          };
          
          // Vérifier les relations
          if (entityType === 'concerts') {
            analysis.relations = {
              artisteId: data.artisteId || null,
              lieuId: data.lieuId || null,
              contactId: data.contactId || null,
              structureId: data.structureId || null
            };
          } else if (entityType === 'artistes') {
            analysis.relations = {
              concertsIds: data.concertsIds || [],
              contactsIds: data.contactsIds || []
            };
          } else if (entityType === 'lieux') {
            analysis.relations = {
              concertsIds: data.concertsIds || [],
              contactsIds: data.contactsIds || []
            };
          } else if (entityType === 'contacts') {
            analysis.relations = {
              concertsIds: data.concertsIds || [],
              lieuxIds: data.lieuxIds || [],
              artistesIds: data.artistesIds || [],
              structureId: data.structureId || null
            };
          }
          
          entityAnalysis.push(analysis);
        }
        
        results.entities[entityType].data = entityAnalysis;
      }
      
      // 2. Analyser les relations bidirectionnelles
      console.log('🔗 Analyse des relations bidirectionnelles...');
      results.relations = await analyzeRelations(results.entities);
      
      // 3. Identifier les problèmes
      console.log('⚠️ Identification des problèmes...');
      results.issues = identifyIssues(results);
      
    } catch (error) {
      console.error('Erreur lors de l\'audit:', error);
      results.error = error.message;
    }
    
    setAuditResults(results);
    setLoading(false);
  };
  
  // Analyser les relations entre entités
  const analyzeRelations = async (entities) => {
    const relations = {
      concertsArtistes: { valid: 0, orphaned: 0, mismatched: 0 },
      concertsLieux: { valid: 0, orphaned: 0, mismatched: 0 },
      concertsContacts: { valid: 0, orphaned: 0, mismatched: 0 },
      artistesConcerts: { valid: 0, orphaned: 0, mismatched: 0 },
      lieuxConcerts: { valid: 0, orphaned: 0, mismatched: 0 },
      contactsConcerts: { valid: 0, orphaned: 0, mismatched: 0 }
    };
    
    // Vérifier les relations concerts -> autres entités
    for (const concert of entities.concerts.data) {
      // Concert -> Artiste
      if (concert.relations.artisteId) {
        const artiste = entities.artistes.data.find(a => a.id === concert.relations.artisteId);
        if (artiste) {
          if (artiste.relations.concertsIds?.includes(concert.id)) {
            relations.concertsArtistes.valid++;
          } else {
            relations.concertsArtistes.mismatched++;
          }
        } else {
          relations.concertsArtistes.orphaned++;
        }
      }
      
      // Concert -> Lieu
      if (concert.relations.lieuId) {
        const lieu = entities.lieux.data.find(l => l.id === concert.relations.lieuId);
        if (lieu) {
          if (lieu.relations.concertsIds?.includes(concert.id)) {
            relations.concertsLieux.valid++;
          } else {
            relations.concertsLieux.mismatched++;
          }
        } else {
          relations.concertsLieux.orphaned++;
        }
      }
      
      // Concert -> Contact
      if (concert.relations.contactId) {
        const contact = entities.contacts.data.find(c => c.id === concert.relations.contactId);
        if (contact) {
          if (contact.relations.concertsIds?.includes(concert.id)) {
            relations.concertsContacts.valid++;
          } else {
            relations.concertsContacts.mismatched++;
          }
        } else {
          relations.concertsContacts.orphaned++;
        }
      }
    }
    
    // Vérifier les relations inverses
    for (const artiste of entities.artistes.data) {
      if (artiste.relations.concertsIds) {
        for (const concertId of artiste.relations.concertsIds) {
          const concert = entities.concerts.data.find(c => c.id === concertId);
          if (!concert || concert.relations.artisteId !== artiste.id) {
            relations.artistesConcerts.mismatched++;
          }
        }
      }
    }
    
    return relations;
  };
  
  // Identifier les problèmes
  const identifyIssues = (results) => {
    const issues = [];
    
    // Problèmes de relations
    Object.entries(results.relations).forEach(([relationType, stats]) => {
      if (stats.orphaned > 0) {
        issues.push({
          type: 'relation_orphaned',
          severity: 'high',
          message: `${stats.orphaned} relation(s) ${relationType} orpheline(s)`,
          details: stats
        });
      }
      if (stats.mismatched > 0) {
        issues.push({
          type: 'relation_mismatched',
          severity: 'medium',
          message: `${stats.mismatched} relation(s) ${relationType} non bidirectionnelle(s)`,
          details: stats
        });
      }
    });
    
    // Problèmes de configuration
    Object.entries(results.entities).forEach(([entityType, data]) => {
      if (!data.hasConfig) {
        issues.push({
          type: 'missing_config',
          severity: 'low',
          message: `Configuration manquante pour ${entityType}`,
          entityType
        });
      }
    });
    
    return issues;
  };
  
  // Charger les détails d'une entité spécifique
  const loadEntityDetails = async (entityType, entityId) => {
    setDetailsLoading(true);
    try {
      const docRef = doc(db, entityType, entityId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const details = {
          id: entityId,
          type: entityType,
          data,
          relatedEntities: {}
        };
        
        // Charger les entités liées
        if (entityType === 'artistes' && data.concertsIds?.length > 0) {
          details.relatedEntities.concerts = [];
          for (const concertId of data.concertsIds) {
            const concertDoc = await getDoc(doc(db, 'concerts', concertId));
            if (concertDoc.exists()) {
              details.relatedEntities.concerts.push({
                id: concertId,
                ...concertDoc.data()
              });
            }
          }
        }
        
        setSelectedEntity(details);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    }
    setDetailsLoading(false);
  };
  
  return (
    <div className="row">
      <div className="col-12">
        <Card>
          <div className="card-header">
            <h3>🔬 Audit Système Complet</h3>
          </div>
          <div className="card-body">
            <div className="alert alert-info mb-3">
              <strong>Organisation :</strong> {currentOrganization?.name || 'Aucune'}
              <br />
              <small>ID : {currentOrganization?.id || 'N/A'}</small>
            </div>
            
            <Button 
              variant="primary" 
              onClick={runSystemAudit}
              disabled={loading || !currentOrganization?.id}
              className="mb-3"
            >
              {loading ? 'Audit en cours...' : 'Lancer l\'audit complet'}
            </Button>
            
            {auditResults && (
              <>
                {/* Résumé des problèmes */}
                {auditResults.issues.length > 0 && (
                  <div className="alert alert-warning mb-4">
                    <h5>⚠️ Problèmes détectés : {auditResults.issues.length}</h5>
                    <ul className="mb-0">
                      {auditResults.issues.map((issue, idx) => (
                        <li key={idx} className={`text-${issue.severity === 'high' ? 'danger' : issue.severity === 'medium' ? 'warning' : 'info'}`}>
                          <strong>{issue.message}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Statistiques par entité */}
                <div className="row mb-4">
                  {Object.entries(auditResults.entities).map(([entityType, data]) => (
                    <div key={entityType} className="col-md-4 mb-3">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">{entityType.charAt(0).toUpperCase() + entityType.slice(1)}</h6>
                        </div>
                        <div className="card-body">
                          <p className="mb-1">Total : <strong>{data.count}</strong></p>
                          <p className="mb-1">Configuration : {data.hasConfig ? '✅' : '❌'}</p>
                          {data.data.length > 0 && (
                            <div className="mt-2">
                              <small className="text-muted">Exemples :</small>
                              <ul className="small mb-0">
                                {data.data.slice(0, 3).map(item => (
                                  <li key={item.id}>
                                    <button 
                                      className="link-button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        loadEntityDetails(entityType, item.id);
                                      }}
                                    >
                                      {item.nom}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Analyse des relations */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">🔗 Analyse des Relations</h5>
                  </div>
                  <div className="card-body">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Relation</th>
                          <th className="text-success">Valides</th>
                          <th className="text-warning">Non synchronisées</th>
                          <th className="text-danger">Orphelines</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(auditResults.relations).map(([relation, stats]) => (
                          <tr key={relation}>
                            <td>{relation}</td>
                            <td className="text-success">{stats.valid}</td>
                            <td className="text-warning">{stats.mismatched}</td>
                            <td className="text-danger">{stats.orphaned}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
      
      {/* Panneau de détails */}
      {selectedEntity && (
        <div className="col-12 mt-3">
          <Card>
            <div className="card-header">
              <h5>📋 Détails : {selectedEntity.data.nom || selectedEntity.data.titre}</h5>
            </div>
            <div className="card-body">
              {detailsLoading ? (
                <div className="text-center">Chargement...</div>
              ) : (
                <>
                  <h6>Données brutes :</h6>
                  <pre className="bg-light p-2" style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {JSON.stringify(selectedEntity.data, null, 2)}
                  </pre>
                  
                  {selectedEntity.relatedEntities.concerts && (
                    <>
                      <h6 className="mt-3">Concerts associés ({selectedEntity.relatedEntities.concerts.length}) :</h6>
                      {selectedEntity.relatedEntities.concerts.length > 0 ? (
                        <ul>
                          {selectedEntity.relatedEntities.concerts.map(concert => (
                            <li key={concert.id}>
                              {concert.titre || 'Sans titre'} - {concert.date}
                              {concert.artisteId !== selectedEntity.id && (
                                <span className="text-danger ms-2">
                                  ⚠️ Relation non bidirectionnelle
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted">Aucun concert trouvé</p>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SystemAuditTool;