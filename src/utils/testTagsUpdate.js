/**
 * Script de test pour déboguer le problème de mise à jour des tags
 */

import { structuresService } from '../services/contacts/structuresService';
import { prepareDataForValidation } from './firebaseDataUtils';

export async function testTagsUpdate(structureId, newTags, userId) {
  console.log('🧪 Test de mise à jour des tags');
  console.log('Structure ID:', structureId);
  console.log('Nouveaux tags:', newTags);
  
  try {
    // 1. Récupérer la structure actuelle
    console.log('\n1️⃣ Récupération de la structure...');
    const structureResult = await structuresService.getStructure(structureId);
    
    if (!structureResult.success) {
      console.error('❌ Erreur récupération structure:', structureResult.error);
      return;
    }
    
    const currentData = structureResult.data;
    console.log('✅ Structure récupérée:', {
      id: currentData.id,
      raisonSociale: currentData.raisonSociale,
      tags: currentData.tags,
      periodeActivite: currentData.periodeActivite
    });
    
    // 2. Préparer les données pour voir ce qui pose problème
    console.log('\n2️⃣ Préparation des données pour validation...');
    const dataForValidation = prepareDataForValidation({
      ...currentData,
      tags: newTags
    });
    
    console.log('📋 Données préparées:', {
      tags: dataForValidation.tags,
      periodeActivite: dataForValidation.periodeActivite,
      // Afficher le type des dates si elles existent
      periodeActiviteTypes: dataForValidation.periodeActivite ? {
        dateDebut: typeof dataForValidation.periodeActivite.dateDebut,
        dateFin: typeof dataForValidation.periodeActivite.dateFin,
        dateBouclage: typeof dataForValidation.periodeActivite.dateBouclage
      } : null
    });
    
    // 3. Tenter la mise à jour
    console.log('\n3️⃣ Tentative de mise à jour...');
    const updateResult = await structuresService.updateStructure(
      structureId,
      { tags: newTags },
      userId
    );
    
    if (updateResult.success) {
      console.log('✅ Mise à jour réussie');
      
      // 4. Vérifier la structure après mise à jour
      console.log('\n4️⃣ Vérification après mise à jour...');
      const updatedResult = await structuresService.getStructure(structureId);
      
      if (updatedResult.success) {
        console.log('✅ Structure après mise à jour:', {
          id: updatedResult.data.id,
          tags: updatedResult.data.tags,
          tagsCount: updatedResult.data.tags?.length || 0
        });
      }
    } else {
      console.error('❌ Erreur mise à jour:', updateResult.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur dans le test:', error);
  }
}

// Fonction pour tester directement dans la console
window.testTagsUpdate = testTagsUpdate;