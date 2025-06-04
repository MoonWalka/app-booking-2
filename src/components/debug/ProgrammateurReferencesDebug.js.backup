import React, { useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc 
} from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import Button from '@components/ui/Button';

/**
 * Composant de debug pour identifier les références d'un programmateur
 */
const ProgrammateurReferencesDebug = () => {
  const [programmateurId, setProgrammateurId] = useState('wH1GzFXf6W0GIFczbQyG');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkReferences = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const report = {
        programmateur: null,
        structures: [],
        concerts: [],
        lieux: [],
        errors: []
      };

      // Fonction pour formater les dates Firebase
      const formatFirebaseDate = (date) => {
        if (!date) return 'N/A';
        
        // Si c'est un objet Timestamp Firebase
        if (date && typeof date === 'object' && date.seconds) {
          return new Date(date.seconds * 1000).toLocaleDateString('fr-FR');
        }
        
        // Si c'est déjà une Date
        if (date instanceof Date) {
          return date.toLocaleDateString('fr-FR');
        }
        
        // Si c'est une chaîne
        if (typeof date === 'string') {
          try {
            return new Date(date).toLocaleDateString('fr-FR');
          } catch {
            return date;
          }
        }
        
        return 'N/A';
      };

      // 1. Vérifier l'existence du programmateur
      try {
        const progDoc = await getDoc(doc(db, 'programmateurs', programmateurId));
        if (progDoc.exists()) {
          report.programmateur = {
            id: progDoc.id,
            ...progDoc.data()
          };
        }
      } catch (error) {
        report.errors.push(`Erreur programmateur: ${error.message}`);
      }

      // 2. Chercher les structures qui référencent ce programmateur
      try {
        // Recherche par programmateurIds
        const structuresQuery1 = query(
          collection(db, 'structures'),
          where('programmateurIds', 'array-contains', programmateurId)
        );
        const structuresSnapshot1 = await getDocs(structuresQuery1);
        
        structuresSnapshot1.forEach(docSnapshot => {
          const data = docSnapshot.data();
          report.structures.push({
            id: docSnapshot.id,
            type: 'programmateurIds',
            ...data,
            // Convertir les dates pour éviter les erreurs d'affichage
            createdAt: formatFirebaseDate(data.createdAt),
            dateCreation: formatFirebaseDate(data.dateCreation),
            updatedAt: formatFirebaseDate(data.updatedAt),
            dateModification: formatFirebaseDate(data.dateModification)
          });
        });

        // Recherche par programmateursAssocies (ancien format)
        const structuresQuery2 = query(
          collection(db, 'structures'),
          where('programmateursAssocies', 'array-contains', programmateurId)
        );
        const structuresSnapshot2 = await getDocs(structuresQuery2);
        
        structuresSnapshot2.forEach(docSnapshot => {
          const data = docSnapshot.data();
          report.structures.push({
            id: docSnapshot.id,
            type: 'programmateursAssocies',
            ...data,
            // Convertir les dates pour éviter les erreurs d'affichage
            createdAt: formatFirebaseDate(data.createdAt),
            dateCreation: formatFirebaseDate(data.dateCreation),
            updatedAt: formatFirebaseDate(data.updatedAt),
            dateModification: formatFirebaseDate(data.dateModification)
          });
        });
      } catch (error) {
        report.errors.push(`Erreur structures: ${error.message}`);
      }

      // 3. Chercher les concerts
      try {
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('programmateurId', '==', programmateurId)
        );
        const concertsSnapshot = await getDocs(concertsQuery);
        
        concertsSnapshot.forEach(docSnapshot => {
          report.concerts.push({
            id: docSnapshot.id,
            ...docSnapshot.data()
          });
        });
      } catch (error) {
        report.errors.push(`Erreur concerts: ${error.message}`);
      }

      // 4. Chercher les lieux
      try {
        const lieuxQuery = query(
          collection(db, 'lieux'),
          where('programmateurId', '==', programmateurId)
        );
        const lieuxSnapshot = await getDocs(lieuxQuery);
        
        lieuxSnapshot.forEach(docSnapshot => {
          report.lieux.push({
            id: docSnapshot.id,
            ...docSnapshot.data()
          });
        });
      } catch (error) {
        report.errors.push(`Erreur lieux: ${error.message}`);
      }

      setResults(report);
    } catch (error) {
      setResults({
        error: `Erreur fatale: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCleanupScript = () => {
    if (!results || !results.structures) return '';

    let script = '// Script de nettoyage des références orphelines\n';
    script += 'import { updateDoc, doc, arrayRemove } from "@/services/firebase-service";\n';
    script += 'import { db } from "@/services/firebase-service";\n\n';

    results.structures.forEach(structure => {
      const field = structure.type === 'programmateurIds' ? 'programmateurIds' : 'programmateursAssocies';
      script += `// Structure: ${structure.raisonSociale || 'N/A'} (${structure.id})\n`;
      script += `await updateDoc(doc(db, 'structures', '${structure.id}'), {\n`;
      script += `  ${field}: arrayRemove('${programmateurId}')\n`;
      script += `});\n\n`;
    });

    return script;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔍 Debug Références Programmateur</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          ID Programmateur:
          <input 
            type="text" 
            value={programmateurId}
            onChange={(e) => setProgrammateurId(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
          />
        </label>
        <Button 
          onClick={checkReferences}
          disabled={loading}
          style={{ marginLeft: '10px' }}
        >
          {loading ? 'Recherche...' : 'Analyser'}
        </Button>
      </div>

      {results && (
        <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
          <h3>📊 Résultats</h3>
          
          {results.error ? (
            <div style={{ color: 'red' }}>❌ {results.error}</div>
          ) : (
            <>
              {/* Programmateur */}
              <div style={{ marginBottom: '15px' }}>
                <h4>👤 Programmateur</h4>
                {results.programmateur ? (
                  <div style={{ backgroundColor: 'white', padding: '10px', marginLeft: '20px' }}>
                    <div><strong>Nom:</strong> {results.programmateur.prenom} {results.programmateur.nom}</div>
                    <div><strong>Email:</strong> {results.programmateur.email}</div>
                    <div><strong>Structure ID:</strong> {results.programmateur.structureId || 'Aucune'}</div>
                  </div>
                ) : (
                  <div style={{ color: 'red', marginLeft: '20px' }}>❌ Programmateur introuvable</div>
                )}
              </div>

              {/* Structures */}
              <div style={{ marginBottom: '15px' }}>
                <h4>🏢 Structures ({results.structures.length})</h4>
                {results.structures.length > 0 ? (
                  results.structures.map(structure => (
                    <div key={structure.id} style={{ backgroundColor: 'white', padding: '10px', marginLeft: '20px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                      <div><strong>ID:</strong> {structure.id}</div>
                      <div><strong>Raison sociale:</strong> {structure.raisonSociale || 'N/A'}</div>
                      <div><strong>Nom:</strong> {structure.nom || 'N/A'}</div>
                      <div><strong>Type:</strong> {structure.type || 'N/A'}</div>
                      <div><strong>Ville:</strong> {structure.ville || 'N/A'}</div>
                      <div><strong>Champ de référence:</strong> {structure.type}</div>
                      <div><strong>Programmateurs:</strong> {JSON.stringify(structure.programmateurIds || structure.programmateursAssocies || [])}</div>
                      <div><strong>Date création:</strong> {structure.createdAt || structure.dateCreation || 'N/A'}</div>
                      <div><strong>Date modification:</strong> {structure.updatedAt || structure.dateModification || 'N/A'}</div>
                      
                      {/* Liens d'action */}
                      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
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
                            fontSize: '12px'
                          }}
                        >
                          🔗 Voir dans l'app
                        </a>
                        <button
                          onClick={async () => {
                            try {
                              const { updateDoc, doc, arrayRemove } = await import('@/services/firebase-service');
                              const { db } = await import('@/services/firebase-service');
                              
                              const field = structure.type === 'programmateurIds' ? 'programmateurIds' : 'programmateursAssocies';
                              await updateDoc(doc(db, 'structures', structure.id), {
                                [field]: arrayRemove(programmateurId)
                              });
                              
                              alert('Référence supprimée avec succès ! Vous pouvez maintenant supprimer le programmateur.');
                              checkReferences(); // Relancer l'analyse
                            } catch (error) {
                              alert(`Erreur lors de la suppression de la référence: ${error.message}`);
                            }
                          }}
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
                          🗑️ Nettoyer cette référence
                        </button>
                      </div>
                      
                      {/* Diagnostic de visibilité */}
                      <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '3px' }}>
                        <strong>💡 Pourquoi cette structure n'est pas visible :</strong>
                        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                          {(!structure.nom && !structure.raisonSociale) && <li>❌ Aucun nom ou raison sociale défini</li>}
                          {!structure.type && <li>❌ Type de structure manquant</li>}
                          {(!structure.createdAt && !structure.dateCreation) && <li>❌ Date de création manquante</li>}
                          <li>📄 Peut être dans une page suivante (pagination par 20)</li>
                          <li>🔤 Peut être masquée par le tri alphabétique</li>
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'green', marginLeft: '20px' }}>✅ Aucune structure ne référence ce programmateur</div>
                )}
              </div>

              {/* Concerts */}
              <div style={{ marginBottom: '15px' }}>
                <h4>🎵 Concerts ({results.concerts.length})</h4>
                {results.concerts.length > 0 ? (
                  results.concerts.map(concert => (
                    <div key={concert.id} style={{ backgroundColor: 'white', padding: '10px', marginLeft: '20px', marginBottom: '10px' }}>
                      <div><strong>Titre:</strong> {concert.titre || 'N/A'}</div>
                      <div><strong>Date:</strong> {concert.date ? new Date(concert.date.seconds * 1000).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'green', marginLeft: '20px' }}>✅ Aucun concert ne référence ce programmateur</div>
                )}
              </div>

              {/* Lieux */}
              <div style={{ marginBottom: '15px' }}>
                <h4>📍 Lieux ({results.lieux.length})</h4>
                {results.lieux.length > 0 ? (
                  results.lieux.map(lieu => (
                    <div key={lieu.id} style={{ backgroundColor: 'white', padding: '10px', marginLeft: '20px', marginBottom: '10px' }}>
                      <div><strong>Nom:</strong> {lieu.nom || 'N/A'}</div>
                      <div><strong>Ville:</strong> {lieu.ville || 'N/A'}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'green', marginLeft: '20px' }}>✅ Aucun lieu ne référence ce programmateur</div>
                )}
              </div>

              {/* Erreurs */}
              {results.errors.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h4>⚠️ Erreurs</h4>
                  {results.errors.map((error, index) => (
                    <div key={index} style={{ color: 'red', marginLeft: '20px' }}>{error}</div>
                  ))}
                </div>
              )}

              {/* Script de nettoyage */}
              {results.structures.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h4>🧹 Script de nettoyage</h4>
                  <textarea 
                    readOnly
                    value={generateCleanupScript()}
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ccc',
                      padding: '10px'
                    }}
                  />
                </div>
              )}

              {/* Résumé */}
              <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f4fd', borderRadius: '5px' }}>
                <h4>📋 Résumé</h4>
                <div>Total des références qui empêchent la suppression: <strong>{results.structures.length + results.concerts.length + results.lieux.length}</strong></div>
                {(results.structures.length + results.concerts.length + results.lieux.length) === 0 ? (
                  <div style={{ color: 'green', fontWeight: 'bold' }}>✅ Ce programmateur peut être supprimé en toute sécurité !</div>
                ) : (
                  <div style={{ color: 'orange', fontWeight: 'bold' }}>⚠️ Ce programmateur a des références qui empêchent sa suppression.</div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgrammateurReferencesDebug; 