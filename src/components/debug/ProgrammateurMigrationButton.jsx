import React, { useState } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  writeBatch, 
  deleteDoc,
  db 
} from '@/services/firebase-service';

/**
 * Composant pour exécuter la migration Programmateur → Contact
 * Utilise l'authentification client-side de l'app
 */
const ProgrammateurMigrationButton = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState('');

  const addLog = (message, type = 'info') => {
    console.log(message);
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const migrateProgrammateurToContact = async () => {
    setIsRunning(true);
    setLogs([]);
    
    try {
      addLog('🚀 Début de la migration Programmateur → Contact', 'info');
      
      // Étape 1: Lire tous les programmateurs
      setProgress('Lecture des programmateurs...');
      addLog('📖 Lecture des programmateurs...');
      
      const programmateurSnapshot = await getDocs(collection(db, 'programmateurs'));
      
      if (programmateurSnapshot.empty) {
        addLog('⚠️ Aucun programmateur trouvé', 'warning');
        setIsRunning(false);
        return;
      }

      const programmateurs = [];
      const migrationMap = new Map();
      
      programmateurSnapshot.forEach(docSnap => {
        programmateurs.push({
          oldId: docSnap.id,
          data: docSnap.data()
        });
      });

      addLog(`📊 Trouvé ${programmateurs.length} programmateur(s)`, 'success');

      // Étape 2: Créer les contacts
      setProgress('Création des contacts...');
      addLog('📝 Création des contacts...');
      
      const batch = writeBatch(db);
      
      programmateurs.forEach(prog => {
        const newContactRef = doc(collection(db, 'contacts'));
        migrationMap.set(prog.oldId, newContactRef.id);
        
        const contactData = {
          ...prog.data,
          migratedAt: new Date(),
          migratedFrom: 'programmateurs'
        };
        
        batch.set(newContactRef, contactData);
        addLog(`  ✅ ${prog.data.nom || 'Sans nom'} (${prog.oldId} → ${newContactRef.id})`);
      });

      await batch.commit();
      addLog(`✅ ${programmateurs.length} contact(s) créé(s)`, 'success');

      // Étape 3: Mettre à jour les concerts
      setProgress('Mise à jour des concerts...');
      addLog('🔄 Mise à jour des références dans les concerts...');
      
      const concertSnapshot = await getDocs(collection(db, 'concerts'));
      let concertsUpdated = 0;
      
      if (!concertSnapshot.empty) {
        const concertBatch = writeBatch(db);
        
        concertSnapshot.forEach(docSnap => {
          const data = docSnap.data();
          let needsUpdate = false;
          const updates = {};
          
          if (data.programmateurId && migrationMap.has(data.programmateurId)) {
            updates.contactId = migrationMap.get(data.programmateurId);
            // Note: On ne peut pas supprimer un champ avec writeBatch, on le fera après
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            concertBatch.update(docSnap.ref, updates);
            concertsUpdated++;
          }
        });
        
        await concertBatch.commit();
        addLog(`✅ ${concertsUpdated} concert(s) mis à jour`, 'success');
      }

      // Étape 4: Mettre à jour les lieux
      setProgress('Mise à jour des lieux...');
      addLog('🔄 Mise à jour des références dans les lieux...');
      
      const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
      let lieuxUpdated = 0;
      
      if (!lieuxSnapshot.empty) {
        const lieuxBatch = writeBatch(db);
        
        lieuxSnapshot.forEach(docSnap => {
          const data = docSnap.data();
          let needsUpdate = false;
          const updates = {};
          
          if (data.programmateurIds && Array.isArray(data.programmateurIds)) {
            updates.contactIds = data.programmateurIds.map(id => 
              migrationMap.has(id) ? migrationMap.get(id) : id
            );
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            lieuxBatch.update(docSnap.ref, updates);
            lieuxUpdated++;
          }
        });
        
        await lieuxBatch.commit();
        addLog(`✅ ${lieuxUpdated} lieu(x) mis à jour`, 'success');
      }

      // Étape 5: Supprimer les anciens programmateurs
      setProgress('Suppression des anciens programmateurs...');
      addLog('🗑️ Suppression des anciens programmateurs...');
      
      for (const prog of programmateurs) {
        await deleteDoc(doc(db, 'programmateurs', prog.oldId));
      }
      
      addLog(`✅ ${programmateurs.length} programmateur(s) supprimé(s)`, 'success');

      // Résumé
      addLog('', 'info');
      addLog('🎉 MIGRATION TERMINÉE AVEC SUCCÈS !', 'success');
      addLog(`📊 Contacts créés: ${programmateurs.length}`, 'info');
      addLog(`🔄 Concerts mis à jour: ${concertsUpdated}`, 'info');
      addLog(`🏠 Lieux mis à jour: ${lieuxUpdated}`, 'info');
      
      setProgress('Migration terminée !');

    } catch (error) {
      addLog(`❌ Erreur: ${error.message}`, 'error');
      console.error('Erreur migration:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '3px solid #ff6b35', 
      borderRadius: '8px',
      margin: '20px',
      backgroundColor: '#fff3f0'
    }}>
      <h3 style={{ color: '#d32f2f', marginBottom: '15px' }}>
        🚨 MIGRATION PROGRAMMATEUR → CONTACT
      </h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={migrateProgrammateurToContact}
          disabled={isRunning}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: isRunning ? '#ccc' : '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? '🔄 Migration en cours...' : '🚀 LANCER LA MIGRATION'}
        </button>
      </div>

      {progress && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          <strong>📍 {progress}</strong>
        </div>
      )}

      {logs.length > 0 && (
        <div style={{ 
          maxHeight: '400px', 
          overflowY: 'auto',
          border: '1px solid #ddd',
          padding: '10px',
          backgroundColor: '#fafafa',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {logs.map((log, index) => (
            <div 
              key={index} 
              style={{ 
                color: log.type === 'error' ? '#d32f2f' : 
                       log.type === 'warning' ? '#f57c00' :
                       log.type === 'success' ? '#388e3c' : '#333',
                marginBottom: '2px'
              }}
            >
              <span style={{ color: '#666' }}>{log.timestamp}</span> - {log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgrammateurMigrationButton;