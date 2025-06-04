import React, { useState } from 'react';
import { 
  collection, 
  query, 
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import Button from '@components/ui/Button';

/**
 * Composant d'audit complet du module structures
 */
const StructuresAuditDebug = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const auditStructures = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const report = {
        totalStructures: 0,
        validStructures: [],
        corruptedStructures: [],
        emptyStructures: [],
        orphanedStructures: [],
        duplicateStructures: [],
        errors: []
      };

      // Fonction pour formater les dates Firebase
      const formatFirebaseDate = (date) => {
        if (!date) return 'N/A';
        if (date && typeof date === 'object' && date.seconds) {
          return new Date(date.seconds * 1000).toLocaleDateString('fr-FR');
        }
        if (date instanceof Date) {
          return date.toLocaleDateString('fr-FR');
        }
        if (typeof date === 'string') {
          try {
            return new Date(date).toLocaleDateString('fr-FR');
          } catch {
            return date;
          }
        }
        return 'N/A';
      };

      // Récupérer TOUTES les structures sans limite
      console.log('🔍 Récupération de toutes les structures...');
      const structuresQuery = query(collection(db, 'structures'), orderBy('__name__'));
      const structuresSnapshot = await getDocs(structuresQuery);
      
      report.totalStructures = structuresSnapshot.size;
      console.log(`📊 Total structures trouvées: ${report.totalStructures}`);

      // Analyser chaque structure
      const structureNames = new Map(); // Pour détecter les doublons
      
      structuresSnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const structure = {
          id: docSnapshot.id,
          ...data,
          // Formater les dates
          createdAt: formatFirebaseDate(data.createdAt),
          dateCreation: formatFirebaseDate(data.dateCreation),
          updatedAt: formatFirebaseDate(data.updatedAt),
          dateModification: formatFirebaseDate(data.dateModification)
        };

        // Critères de validation
        const hasName = !!(structure.nom || structure.raisonSociale);
        const hasType = !!structure.type;
        const hasValidFields = hasName && hasType;
        const hasRequiredData = hasName || structure.contactIds?.length > 0 || structure.contactsAssocies?.length > 0;

        // Classification des structures
        if (!hasRequiredData) {
          report.emptyStructures.push({
            ...structure,
            issues: [
              !hasName && 'Aucun nom/raison sociale',
              !structure.contactIds?.length && !structure.contactsAssocies?.length && 'Aucun contact associé'
            ].filter(Boolean)
          });
        } else if (!hasValidFields) {
          report.corruptedStructures.push({
            ...structure,
            issues: [
              !hasName && 'Nom/raison sociale manquant',
              !hasType && 'Type manquant'
            ].filter(Boolean)
          });
        } else {
          report.validStructures.push(structure);
        }

        // Détecter les doublons par nom
        const structureName = (structure.nom || structure.raisonSociale || '').toLowerCase();
        if (structureName && structureNames.has(structureName)) {
          const existingId = structureNames.get(structureName);
          report.duplicateStructures.push({
            name: structureName,
            structures: [existingId, structure.id]
          });
        } else if (structureName) {
          structureNames.set(structureName, structure.id);
        }

        // Détecter les structures orphelines (avec contacts associés mais aucune autre donnée utile)
        if ((structure.contactIds?.length > 0 || structure.contactsAssocies?.length > 0) && 
            !hasName && !structure.ville && !structure.adresse) {
          report.orphanedStructures.push({
            ...structure,
            associatedContacts: structure.contactIds || structure.contactsAssocies || []
          });
        }
      });

      setResults(report);
    } catch (error) {
      setResults({
        error: `Erreur fatale: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteStructure = async (structureId) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la structure ${structureId} ?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'structures', structureId));
      alert('Structure supprimée avec succès !');
      auditStructures(); // Relancer l'audit
    } catch (error) {
      alert(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  const cleanupStructure = async (structure) => {
    if (!window.confirm(`Nettoyer la structure ${structure.id} (supprimer les références aux contacts) ?`)) {
      return;
    }

    try {
      await updateDoc(doc(db, 'structures', structure.id), {
        contactIds: [],
        contactsAssocies: []
      });
      alert('Structure nettoyée avec succès !');
      auditStructures(); // Relancer l'audit
    } catch (error) {
      alert(`Erreur lors du nettoyage: ${error.message}`);
    }
  };

  const massDeleteEmptyStructures = async () => {
    if (!results || !results.emptyStructures.length) return;

    if (!window.confirm(`Supprimer toutes les ${results.emptyStructures.length} structures vides ?`)) {
      return;
    }

    let deletedCount = 0;
    let errorCount = 0;

    for (const structure of results.emptyStructures) {
      try {
        await deleteDoc(doc(db, 'structures', structure.id));
        deletedCount++;
      } catch (error) {
        console.error(`Erreur suppression ${structure.id}:`, error);
        errorCount++;
      }
    }

    alert(`Suppression terminée: ${deletedCount} structures supprimées, ${errorCount} erreurs`);
    auditStructures(); // Relancer l'audit
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔍 Audit Complet des Structures</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <Button 
          onClick={auditStructures}
          disabled={loading}
          style={{ marginRight: '10px' }}
        >
          {loading ? 'Audit en cours...' : '🔍 Auditer Toutes les Structures'}
        </Button>
        
        {results && results.emptyStructures && results.emptyStructures.length > 0 && (
          <Button 
            onClick={massDeleteEmptyStructures}
            style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', marginLeft: '10px' }}
          >
            🗑️ Supprimer Toutes les Structures Vides
          </Button>
        )}
      </div>

      {results && (
        <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
          <h3>📊 Résultats de l'Audit</h3>
          
          {results.error ? (
            <div style={{ color: 'red' }}>❌ {results.error}</div>
          ) : (
            <>
              {/* Résumé */}
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f4fd', borderRadius: '5px' }}>
                <h4>📋 Résumé</h4>
                <div><strong>Total structures dans la DB:</strong> {results.totalStructures}</div>
                <div><strong>✅ Structures valides:</strong> {results.validStructures.length}</div>
                <div><strong>⚠️ Structures corrompues:</strong> {results.corruptedStructures.length}</div>
                <div><strong>🗑️ Structures vides:</strong> {results.emptyStructures.length}</div>
                <div><strong>👻 Structures orphelines:</strong> {results.orphanedStructures.length}</div>
                <div><strong>🔄 Doublons détectés:</strong> {results.duplicateStructures.length}</div>
              </div>

              {/* Structures vides */}
              {results.emptyStructures.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4>🗑️ Structures Vides ({results.emptyStructures.length})</h4>
                  <p style={{ color: '#666', fontSize: '14px' }}>Ces structures n'ont ni nom ni contacts associés</p>
                  {results.emptyStructures.map(structure => (
                    <div key={structure.id} style={{ backgroundColor: 'white', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                      <div><strong>ID:</strong> {structure.id}</div>
                      <div><strong>Problèmes:</strong> {structure.issues.join(', ')}</div>
                      <div><strong>Dates:</strong> Créé: {structure.createdAt}, Modifié: {structure.updatedAt}</div>
                      <button
                        onClick={() => deleteStructure(structure.id)}
                        style={{ 
                          backgroundColor: '#dc3545', 
                          color: 'white', 
                          padding: '5px 10px', 
                          border: 'none', 
                          borderRadius: '3px',
                          fontSize: '12px',
                          marginTop: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Structures orphelines */}
              {results.orphanedStructures.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4>👻 Structures Orphelines ({results.orphanedStructures.length})</h4>
                  <p style={{ color: '#666', fontSize: '14px' }}>Ces structures ont des contacts associés mais pas de données utiles</p>
                  {results.orphanedStructures.map(structure => (
                    <div key={structure.id} style={{ backgroundColor: '#fff3cd', padding: '10px', marginBottom: '10px', border: '1px solid #ffeaa7', borderRadius: '5px' }}>
                      <div><strong>ID:</strong> {structure.id}</div>
                      <div><strong>Contacts associés:</strong> {JSON.stringify(structure.associatedContacts)}</div>
                      <div><strong>Type:</strong> {structure.type || 'N/A'}</div>
                      <div><strong>Dates:</strong> Créé: {structure.createdAt}, Modifié: {structure.updatedAt}</div>
                      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => cleanupStructure(structure)}
                          style={{ 
                            backgroundColor: '#ffc107', 
                            color: 'black', 
                            padding: '5px 10px', 
                            border: 'none', 
                            borderRadius: '3px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          🧹 Nettoyer les références
                        </button>
                        <button
                          onClick={() => deleteStructure(structure.id)}
                          style={{ 
                            backgroundColor: '#dc3545', 
                            color: 'white', 
                            padding: '5px 10px', 
                            border: 'none', 
                            borderRadius: '3px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Structures corrompues */}
              {results.corruptedStructures.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4>⚠️ Structures Corrompues ({results.corruptedStructures.length})</h4>
                  <p style={{ color: '#666', fontSize: '14px' }}>Ces structures ont des données incomplètes</p>
                  {results.corruptedStructures.map(structure => (
                    <div key={structure.id} style={{ backgroundColor: '#f8d7da', padding: '10px', marginBottom: '10px', border: '1px solid #f1aeb5', borderRadius: '5px' }}>
                      <div><strong>ID:</strong> {structure.id}</div>
                      <div><strong>Nom/Raison sociale:</strong> {structure.nom || structure.raisonSociale || 'N/A'}</div>
                      <div><strong>Type:</strong> {structure.type || 'N/A'}</div>
                      <div><strong>Problèmes:</strong> {structure.issues.join(', ')}</div>
                      <div><strong>Contacts:</strong> {JSON.stringify(structure.contactIds || structure.contactsAssocies || [])}</div>
                      <button
                        onClick={() => deleteStructure(structure.id)}
                        style={{ 
                          backgroundColor: '#dc3545', 
                          color: 'white', 
                          padding: '5px 10px', 
                          border: 'none', 
                          borderRadius: '3px',
                          fontSize: '12px',
                          marginTop: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Structures valides */}
              {results.validStructures.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4>✅ Structures Valides ({results.validStructures.length})</h4>
                  <p style={{ color: '#666', fontSize: '14px' }}>Ces structures semblent correctes</p>
                  {results.validStructures.map(structure => (
                    <div key={structure.id} style={{ backgroundColor: '#d4edda', padding: '10px', marginBottom: '10px', border: '1px solid #c3e6cb', borderRadius: '5px' }}>
                      <div><strong>Nom:</strong> {structure.nom || structure.raisonSociale}</div>
                      <div><strong>Type:</strong> {structure.type}</div>
                      <div><strong>Ville:</strong> {structure.ville || 'N/A'}</div>
                      <div><strong>Contacts:</strong> {(structure.contactIds || structure.contactsAssocies || []).length}</div>
                      <a 
                        href={`/structures/${structure.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          backgroundColor: '#007bff', 
                          color: 'white', 
                          padding: '5px 10px', 
                          textDecoration: 'none', 
                          borderRadius: '3px',
                          fontSize: '12px',
                          display: 'inline-block',
                          marginTop: '5px'
                        }}
                      >
                        🔗 Voir dans l'app
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Doublons */}
              {results.duplicateStructures.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4>🔄 Doublons Détectés ({results.duplicateStructures.length})</h4>
                  {results.duplicateStructures.map((duplicate, index) => (
                    <div key={index} style={{ backgroundColor: '#fff3cd', padding: '10px', marginBottom: '10px', border: '1px solid #ffeaa7', borderRadius: '5px' }}>
                      <div><strong>Nom:</strong> {duplicate.name}</div>
                      <div><strong>IDs:</strong> {duplicate.structures.join(', ')}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StructuresAuditDebug; 