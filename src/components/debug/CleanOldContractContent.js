import React, { useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import styles from './MigrateContractVariables.module.css';

/**
 * Outil pour nettoyer les anciens contrats qui ont un contratContenu
 * avec des variables non remplacées
 */
const CleanOldContractContent = () => {
  const { currentOrganization } = useOrganization();
  const [isProcessing, setIsProcessing] = useState(false);
  const [log, setLog] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [selectedContracts, setSelectedContracts] = useState([]);

  const addLog = (message, type = 'info') => {
    setLog(prev => [...prev, { message, type, timestamp: new Date() }]);
  };

  // Charger les contrats avec contratContenu
  const loadContracts = async () => {
    try {
      addLog('Chargement des contrats...');
      const contractsSnapshot = await getDocs(collection(db, 'contrats'));
      const loadedContracts = [];
      
      contractsSnapshot.forEach((doc) => {
        const data = doc.data();
        // Filtrer les contrats qui ont un contratContenu
        if (data.contratContenu) {
          // Vérifier si le contenu contient des variables non remplacées
          const hasOldVariables = data.contratContenu.includes('{structure_') || 
                                 data.contratContenu.includes('{programmateur_') ||
                                 data.contratContenu.includes('[structure_') ||
                                 data.contratContenu.includes('[programmateur_');
          
          if (hasOldVariables) {
            loadedContracts.push({
              id: doc.id,
              dateId: data.dateId,
              status: data.status,
              createdAt: data.createdAt,
              hasTemplateSnapshot: !!data.templateSnapshot,
              hasModeles: !!(data.contratModeles && data.contratModeles.length > 0),
              organizationId: data.organizationId
            });
          }
        }
      });
      
      setContracts(loadedContracts);
      addLog(`${loadedContracts.length} contrats avec anciennes variables trouvés`, 'success');
    } catch (error) {
      addLog(`Erreur lors du chargement: ${error.message}`, 'error');
    }
  };

  // Nettoyer les contrats sélectionnés
  const cleanContracts = async () => {
    if (selectedContracts.length === 0) {
      addLog('Aucun contrat sélectionné', 'error');
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const contractId of selectedContracts) {
      try {
        addLog(`Nettoyage du contrat ${contractId}...`);
        
        // Supprimer le champ contratContenu
        await updateDoc(doc(db, 'contrats', contractId), {
          contratContenu: deleteField(),
          updatedAt: new Date()
        });
        
        successCount++;
        addLog(`✅ Contrat ${contractId} nettoyé`, 'success');
      } catch (error) {
        errorCount++;
        addLog(`❌ Erreur pour ${contractId}: ${error.message}`, 'error');
      }
    }

    addLog(`\n=== Nettoyage terminé ===`);
    addLog(`✅ Succès: ${successCount} contrat(s)`, 'success');
    if (errorCount > 0) {
      addLog(`❌ Erreurs: ${errorCount} contrat(s)`, 'error');
    }

    setIsProcessing(false);
    // Recharger la liste
    await loadContracts();
  };

  const toggleContractSelection = (contractId) => {
    setSelectedContracts(prev => {
      if (prev.includes(contractId)) {
        return prev.filter(id => id !== contractId);
      } else {
        return [...prev, contractId];
      }
    });
  };

  const selectAllContracts = () => {
    setSelectedContracts(contracts.map(c => c.id));
  };

  const deselectAllContracts = () => {
    setSelectedContracts([]);
  };

  return (
    <div className={styles.container}>
      <h3>Nettoyage des anciens contrats</h3>
      <p className={styles.description}>
        Cet outil supprime le champ `contratContenu` des anciens contrats qui contiennent
        des variables non remplacées. Après nettoyage, le contrat utilisera le nouveau
        système de génération dynamique.
      </p>

      <div className={styles.actions}>
        <button
          onClick={loadContracts}
          disabled={isProcessing}
          className="btn btn-primary"
        >
          Charger les contrats à nettoyer
        </button>
      </div>

      {contracts.length > 0 && (
        <>
          <div className={styles.templateList}>
            <h4>Contrats avec anciennes variables ({contracts.length})</h4>
            <div className={styles.selectActions}>
              <button onClick={selectAllContracts} className="btn btn-sm btn-outline-primary">
                Tout sélectionner
              </button>
              <button onClick={deselectAllContracts} className="btn btn-sm btn-outline-secondary">
                Tout désélectionner
              </button>
            </div>
            
            {contracts.map(contract => (
              <div key={contract.id} className={styles.templateItem}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedContracts.includes(contract.id)}
                    onChange={() => toggleContractSelection(contract.id)}
                    disabled={isProcessing}
                  />
                  <span className={styles.templateName}>
                    Contrat {contract.id.substring(0, 8)}...
                  </span>
                  <span className={styles.templateType}>
                    (Date: {contract.dateId ? contract.dateId.substring(0, 8) + '...' : 'N/A'})
                  </span>
                  {contract.hasTemplateSnapshot && (
                    <span className="badge bg-info ms-2">A un template snapshot</span>
                  )}
                </label>
              </div>
            ))}
          </div>

          <div className={styles.migrationActions}>
            <button
              onClick={cleanContracts}
              disabled={isProcessing || selectedContracts.length === 0}
              className="btn btn-success"
            >
              {isProcessing ? 'Nettoyage en cours...' : 'Nettoyer les contrats sélectionnés'}
            </button>
          </div>
        </>
      )}

      {log.length > 0 && (
        <div className={styles.log}>
          <h4>Journal</h4>
          {log.map((entry, index) => (
            <div 
              key={index} 
              className={`${styles.logEntry} ${styles[entry.type]}`}
            >
              <span className={styles.timestamp}>
                {entry.timestamp.toLocaleTimeString()}
              </span>
              <span className={styles.message}>{entry.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.info}>
        <h4>Information importante</h4>
        <p>
          Cette action supprime le contenu HTML sauvegardé avec les anciennes variables.
          Après nettoyage, le contrat utilisera automatiquement le nouveau système
          qui génère le contenu à partir du template avec les variables correctement remplacées.
        </p>
        <p className={styles.warning}>
          ⚠️ Cette opération est irréversible. Le contenu sera régénéré à partir
          du template et des données du formulaire.
        </p>
      </div>
    </div>
  );
};

export default CleanOldContractContent;