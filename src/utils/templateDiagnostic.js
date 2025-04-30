// templateDiagnostic.js
// Un outil pour analyser et nettoyer les templates de contrat

import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebaseInit';

/**
 * Analyser tous les templates pour détecter les problèmes potentiels
 * Exécutez cette fonction dans la console pour un diagnostic complet
 */
export const analyzeTemplates = async () => {
  try {
    const templatesSnapshot = await getDocs(collection(db, 'contratTemplates'));
    
    console.log(`🔍 Analyse de ${templatesSnapshot.size} templates...`);
    console.log('-------------------------------------------------');
    
    templatesSnapshot.docs.forEach(templateDoc => {
      const templateData = templateDoc.data();
      const templateId = templateDoc.id;
      
      console.log(`\n📄 Template: ${templateId} - ${templateData.name || 'Sans nom'}`);
      
      // Vérifier si le template contient une dateTemplate explicite
      if ('dateTemplate' in templateData) {
        console.log(`⚠️ Contient dateTemplate: "${templateData.dateTemplate}"`);
      }
      
      // Vérifier s'il y a des dates hardcodées dans le contenu principal
      const bodyContent = templateData.bodyContent || '';
      const datePatterns = [
        /Fait à.*le/i,
        /En date du/i,
        /daté[e]? du/i,
        /\d{1,2}\/\d{1,2}\/\d{4}/,
        /new Date\(\)/
      ];
      
      const hasDateInBody = datePatterns.some(pattern => pattern.test(bodyContent));
      if (hasDateInBody) {
        console.log(`⚠️ Le contenu principal contient probablement une date hardcodée`);
        
        // Montrer les lignes susceptibles de contenir des dates
        const lines = bodyContent.split('\n');
        lines.forEach((line, index) => {
          if (datePatterns.some(pattern => pattern.test(line))) {
            console.log(`   Ligne ${index + 1}: "${line.trim()}"`);
          }
        });
      }
      
      // Vérifier si le template utilise correctement les variables de date
      const dateVariables = ['{date_jour}', '{date_mois}', '{date_annee}', '{date_complete}'];
      const usesDateVariables = dateVariables.some(variable => 
        bodyContent.includes(variable) || 
        (templateData.dateTemplate && templateData.dateTemplate.includes(variable))
      );
      
      if (usesDateVariables) {
        console.log(`✅ Utilise correctement les variables de date: ${
          dateVariables.filter(v => 
            bodyContent.includes(v) || 
            (templateData.dateTemplate && templateData.dateTemplate.includes(v))
          ).join(', ')
        }`);
      }
    });
    
    console.log("\n✅ Analyse terminée!");
  } catch (error) {
    console.error("❌ Erreur lors de l'analyse des templates:", error);
  }
};

/**
 * Nettoie tous les templates pour supprimer les dates hardcodées
 * ATTENTION: Cette fonction modifie votre base de données
 * Exécutez d'abord analyzeTemplates() pour identifier les problèmes
 */
export const cleanupAllTemplates = async () => {
  if (!confirm("⚠️ Cette opération va modifier vos templates de contrat en base de données. Continuer?")) {
    console.log("Opération annulée.");
    return;
  }
  
  try {
    const templatesSnapshot = await getDocs(collection(db, 'contratTemplates'));
    console.log(`🧹 Nettoyage de ${templatesSnapshot.size} templates...`);
    
    const batch = writeBatch(db);
    let count = 0;
    
    templatesSnapshot.docs.forEach(templateDoc => {
      const templateData = templateDoc.data();
      let needsUpdate = false;
      const updatedData = { ...templateData };
      
      // 1. S'assurer qu'il y a un titleTemplate
      if (!updatedData.titleTemplate) {
        updatedData.titleTemplate = `<h1>Contrat - {concert_titre}</h1>`;
        needsUpdate = true;
      }
      
      // 2. Supprimer dateTemplate si présent et migrer vers bodyContent
      if ('dateTemplate' in updatedData) {
        // Si le template a une section de date, l'intégrer au début du bodyContent
        if (updatedData.dateTemplate) {
          updatedData.bodyContent = updatedData.dateTemplate + '\n\n' + (updatedData.bodyContent || '');
        }
        delete updatedData.dateTemplate;
        needsUpdate = true;
      }
      
      // 3. S'assurer qu'il y a un template de signature
      if (!updatedData.signatureTemplate) {
        updatedData.signatureTemplate = `
          <div style="display: flex; justify-content: space-between; margin-top: 30px;">
            <div style="width: 45%;">
              <div style="margin-bottom: 50px;"><strong>Pour l'Organisateur:</strong></div>
              <div>{programmateur_nom}</div>
              <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
            </div>
            <div style="width: 45%;">
              <div style="margin-bottom: 50px;"><strong>Pour l'Artiste:</strong></div>
              <div>{artiste_nom}</div>
              <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
            </div>
          </div>
        `;
        needsUpdate = true;
      }
      
      // 4. Remplacer les dates hardcodées dans bodyContent
      const bodyContent = updatedData.bodyContent || '';
      const updatedBodyContent = bodyContent
        // Remplacer "Fait à [lieu], le [date]" par "Fait à {lieu_ville}, le {date_complete}"
        .replace(
          /Fait à (.*?), le .*?(?=<|$)/gi, 
          'Fait à {lieu_ville}, le {date_complete}'
        )
        // Remplacer "en date du [date]" par "en date du {date_complete}"
        .replace(
          /en date du .*?(?=<|$)/gi, 
          'en date du {date_complete}'
        )
        // Remplacer les dates au format JJ/MM/AAAA par {date_complete}
        .replace(
          /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, 
          '{date_complete}'
        );
      
      if (updatedBodyContent !== bodyContent) {
        updatedData.bodyContent = updatedBodyContent;
        needsUpdate = true;
      }
      
      // Appliquer les modifications si nécessaire
      if (needsUpdate) {
        batch.update(doc(db, 'contratTemplates', templateDoc.id), updatedData);
        count++;
      }
    });
    
    if (count > 0) {
      await batch.commit();
      console.log(`✅ ${count} templates nettoyés avec succès!`);
    } else {
      console.log("ℹ️ Aucun template ne nécessitait de nettoyage.");
    }
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage des templates:", error);
  }
};

// Exportez ces fonctions pour pouvoir les utiliser
export const diagnosticTools = {
  analyzeTemplates,
  cleanupAllTemplates
};