import React, { useState } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import styles from './MigrateContractVariables.module.css';

/**
 * Outil de migration des variables dans les modèles de contrat
 * Convertit les anciennes variables vers le nouveau format
 */
const MigrateContractVariables = () => {
  const { currentOrganization } = useOrganization();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationLog, setMigrationLog] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);

  // Mapping des anciennes variables vers les nouvelles
  const variableMapping = {
    // Variables programmateur vers organisateur (si c'est la partie A)
    '{programmateur_structure}': '{organisateur_raison_sociale}',
    '[programmateur_structure]': '{organisateur_raison_sociale}',
    '{programmateur_adresse}': '{organisateur_adresse}',
    '[programmateur_adresse]': '{organisateur_adresse}',
    '{programmateur_siret}': '{organisateur_siret}',
    '[programmateur_siret]': '{organisateur_siret}',
    '{programmateur_email}': '{organisateur_email}',
    '[programmateur_email]': '{organisateur_email}',
    '{programmateur_telephone}': '{organisateur_telephone}',
    '[programmateur_telephone]': '{organisateur_telephone}',
    '{programmateur_numero_intracommunautaire}': '{organisateur_numero_tva}',
    '[programmateur_numero_intracommunautaire]': '{organisateur_numero_tva}',
    '{programmateur_representant}': '{organisateur_signataire}',
    '[programmateur_representant]': '{organisateur_signataire}',
    '{programmateur_qualite_representant}': '{organisateur_qualite}',
    '[programmateur_qualite_representant]': '{organisateur_qualite}',
    
    // Variables entreprise vers producteur (si c'est la partie B)
    '{nom_entreprise}': '{producteur_raison_sociale}',
    '[nom_entreprise]': '{producteur_raison_sociale}',
    '{adresse_entreprise}': '{producteur_adresse}',
    '[adresse_entreprise]': '{producteur_adresse}',
    '{siret_entreprise}': '{producteur_siret}',
    '[siret_entreprise]': '{producteur_siret}',
    '{telephone_entreprise}': '{producteur_telephone}',
    '[telephone_entreprise]': '{producteur_telephone}',
    '{email_entreprise}': '{producteur_email}',
    '[email_entreprise]': '{producteur_email}',
    '{representant_entreprise}': '{producteur_signataire}',
    '[representant_entreprise]': '{producteur_signataire}',
    '{fonction_representant}': '{producteur_qualite}',
    '[fonction_representant]': '{producteur_qualite}',
    
    // Variables de montant
    '{montant_cache}': '{total_ttc}',
    '[montant_cache]': '{total_ttc}',
    '{montant_cache_lettres}': '{total_ttc_lettres}',
    '[montant_cache_lettres]': '{total_ttc_lettres}',
    '{concert_montant}': '{total_ttc}',
    '[concert_montant]': '{total_ttc}',
    '{concert_montant_lettres}': '{total_ttc_lettres}',
    '[concert_montant_lettres]': '{total_ttc_lettres}',
    
    // Variables de paiement
    '{mode_paiement}': '{mode_reglement}',
    '[mode_paiement]': '{mode_reglement}',
    
    // Conversion des crochets vers accolades pour toutes les variables
    '[contact_nom]': '{contact_nom}',
    '[contact_prenom]': '{contact_prenom}',
    '[contact_structure]': '{contact_structure}',
    '[contact_email]': '{contact_email}',
    '[contact_telephone]': '{contact_telephone}',
    '[contact_adresse]': '{contact_adresse}',
    '[contact_siret]': '{contact_siret}',
    '[artiste_nom]': '{artiste_nom}',
    '[artiste_genre]': '{artiste_genre}',
    '[concert_titre]': '{concert_titre}',
    '[concert_date]': '{concert_date}',
    '[concert_heure]': '{concert_heure}',
    '[lieu_nom]': '{lieu_nom}',
    '[lieu_adresse]': '{lieu_adresse}',
    '[lieu_ville]': '{lieu_ville}',
    '[lieu_code_postal]': '{lieu_code_postal}',
    '[structure_nom]': '{structure_nom}',
    '[structure_siret]': '{structure_siret}',
    '[date_jour]': '{date_jour}',
    '[date_mois]': '{date_mois}',
    '[date_annee]': '{date_annee}',
    '[date_complete]': '{date_complete}',
    '[SAUT_DE_PAGE]': '{SAUT_DE_PAGE}',
  };

  // Charger les templates
  const loadTemplates = async () => {
    try {
      const templatesSnapshot = await getDocs(collection(db, 'contratTemplates'));
      const loadedTemplates = [];
      
      templatesSnapshot.forEach((doc) => {
        const data = doc.data();
        // Filtrer par organisation si nécessaire
        if (!data.organizationId || data.organizationId === currentOrganization?.id) {
          loadedTemplates.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      setTemplates(loadedTemplates);
      addLog(`${loadedTemplates.length} modèles de contrat chargés`);
    } catch (error) {
      addLog(`Erreur lors du chargement des templates: ${error.message}`, 'error');
    }
  };

  // Ajouter un message au log
  const addLog = (message, type = 'info') => {
    setMigrationLog(prev => [...prev, { message, type, timestamp: new Date() }]);
  };

  // Fonction pour migrer les variables dans un texte
  const migrateVariables = (content) => {
    if (!content) return content;
    
    let migratedContent = content;
    let changeCount = 0;
    
    // Appliquer chaque mapping
    Object.entries(variableMapping).forEach(([oldVar, newVar]) => {
      const regex = new RegExp(oldVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = migratedContent.match(regex);
      if (matches) {
        changeCount += matches.length;
        migratedContent = migratedContent.replace(regex, newVar);
      }
    });
    
    return { migratedContent, changeCount };
  };

  // Prévisualiser les changements
  const previewChanges = () => {
    setPreviewMode(true);
    setMigrationLog([]);
    
    selectedTemplates.forEach(templateId => {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;
      
      addLog(`\n=== Aperçu pour: ${template.name} ===`);
      
      // Migrer chaque partie du template
      const sections = ['bodyContent', 'headerContent', 'footerContent', 'signatureTemplate'];
      let totalChanges = 0;
      
      sections.forEach(section => {
        if (template[section]) {
          const { changeCount } = migrateVariables(template[section]);
          if (changeCount > 0) {
            totalChanges += changeCount;
            addLog(`- ${section}: ${changeCount} variable(s) à migrer`);
          }
        }
      });
      
      if (totalChanges === 0) {
        addLog(`- Aucune variable à migrer`, 'success');
      } else {
        addLog(`- Total: ${totalChanges} variable(s) à migrer`, 'warning');
      }
    });
  };

  // Effectuer la migration
  const performMigration = async () => {
    if (selectedTemplates.length === 0) {
      addLog('Aucun modèle sélectionné', 'error');
      return;
    }

    setIsMigrating(true);
    setMigrationLog([]);
    setPreviewMode(false);
    
    let successCount = 0;
    let errorCount = 0;

    for (const templateId of selectedTemplates) {
      const template = templates.find(t => t.id === templateId);
      if (!template) continue;
      
      try {
        addLog(`Migration de: ${template.name}...`);
        
        const updatedData = {
          updatedAt: serverTimestamp()
        };
        
        // Migrer chaque section
        let totalChanges = 0;
        
        if (template.bodyContent) {
          const { migratedContent, changeCount } = migrateVariables(template.bodyContent);
          if (changeCount > 0) {
            updatedData.bodyContent = migratedContent;
            totalChanges += changeCount;
          }
        }
        
        if (template.headerContent) {
          const { migratedContent, changeCount } = migrateVariables(template.headerContent);
          if (changeCount > 0) {
            updatedData.headerContent = migratedContent;
            totalChanges += changeCount;
          }
        }
        
        if (template.footerContent) {
          const { migratedContent, changeCount } = migrateVariables(template.footerContent);
          if (changeCount > 0) {
            updatedData.footerContent = migratedContent;
            totalChanges += changeCount;
          }
        }
        
        if (template.signatureTemplate) {
          const { migratedContent, changeCount } = migrateVariables(template.signatureTemplate);
          if (changeCount > 0) {
            updatedData.signatureTemplate = migratedContent;
            totalChanges += changeCount;
          }
        }
        
        // Mettre à jour si des changements ont été effectués
        if (totalChanges > 0) {
          await updateDoc(doc(db, 'contratTemplates', templateId), updatedData);
          addLog(`✅ ${template.name}: ${totalChanges} variable(s) migrée(s)`, 'success');
          successCount++;
        } else {
          addLog(`✅ ${template.name}: Aucune variable à migrer`, 'success');
        }
        
      } catch (error) {
        addLog(`❌ Erreur pour ${template.name}: ${error.message}`, 'error');
        errorCount++;
      }
    }
    
    addLog(`\n=== Migration terminée ===`);
    addLog(`✅ Succès: ${successCount} modèle(s)`, 'success');
    if (errorCount > 0) {
      addLog(`❌ Erreurs: ${errorCount} modèle(s)`, 'error');
    }
    
    setIsMigrating(false);
    // Recharger les templates
    await loadTemplates();
  };

  // Sélectionner/désélectionner un template
  const toggleTemplateSelection = (templateId) => {
    setSelectedTemplates(prev => {
      if (prev.includes(templateId)) {
        return prev.filter(id => id !== templateId);
      } else {
        return [...prev, templateId];
      }
    });
  };

  // Sélectionner tous les templates
  const selectAllTemplates = () => {
    setSelectedTemplates(templates.map(t => t.id));
  };

  // Désélectionner tous les templates
  const deselectAllTemplates = () => {
    setSelectedTemplates([]);
  };

  return (
    <div className={styles.container}>
      <h3>Migration des variables dans les modèles de contrat</h3>
      <p className={styles.description}>
        Cet outil permet de convertir automatiquement les anciennes variables 
        (programmateur_*, entreprise_*, etc.) vers le nouveau format 
        (organisateur_*, producteur_*, etc.) dans vos modèles existants.
      </p>

      <div className={styles.actions}>
        <button
          onClick={loadTemplates}
          disabled={isMigrating}
          className="btn btn-primary"
        >
          Charger les modèles
        </button>
      </div>

      {templates.length > 0 && (
        <>
          <div className={styles.templateList}>
            <h4>Sélectionnez les modèles à migrer:</h4>
            <div className={styles.selectActions}>
              <button onClick={selectAllTemplates} className="btn btn-sm btn-outline-primary">
                Tout sélectionner
              </button>
              <button onClick={deselectAllTemplates} className="btn btn-sm btn-outline-secondary">
                Tout désélectionner
              </button>
            </div>
            
            {templates.map(template => (
              <div key={template.id} className={styles.templateItem}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedTemplates.includes(template.id)}
                    onChange={() => toggleTemplateSelection(template.id)}
                    disabled={isMigrating}
                  />
                  <span className={styles.templateName}>{template.name}</span>
                  <span className={styles.templateType}>({template.templateType || 'cession'})</span>
                </label>
              </div>
            ))}
          </div>

          <div className={styles.migrationActions}>
            <button
              onClick={previewChanges}
              disabled={isMigrating || selectedTemplates.length === 0}
              className="btn btn-outline-info"
            >
              Aperçu des changements
            </button>
            <button
              onClick={performMigration}
              disabled={isMigrating || selectedTemplates.length === 0}
              className="btn btn-success"
            >
              {isMigrating ? 'Migration en cours...' : 'Lancer la migration'}
            </button>
          </div>
        </>
      )}

      {migrationLog.length > 0 && (
        <div className={styles.log}>
          <h4>{previewMode ? 'Aperçu des changements' : 'Journal de migration'}</h4>
          {migrationLog.map((entry, index) => (
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
        <h4>Variables qui seront migrées:</h4>
        <ul>
          <li><strong>Programmateur → Organisateur</strong>: Pour la partie A (acheteur)</li>
          <li><strong>Entreprise → Producteur</strong>: Pour la partie B (votre société)</li>
          <li><strong>[variable] → {'{variable}'}</strong>: Conversion des crochets en accolades</li>
          <li><strong>montant_cache → total_ttc</strong>: Nouveau système de facturation</li>
        </ul>
        <p className={styles.warning}>
          ⚠️ Cette opération est irréversible. Il est recommandé de faire une sauvegarde 
          de vos modèles avant de lancer la migration.
        </p>
      </div>
    </div>
  );
};

export default MigrateContractVariables;