// Script de test pour vérifier la solution des cartes
import { collection, getDocs, doc, updateDoc, limit, query } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Teste la solution en ajoutant des coordonnées à un lieu
 */
export const testMapFix = async () => {
  try {
    console.log('🔧 Test de la solution des cartes...');
    
    // Récupérer le premier lieu sans coordonnées
    const lieuxSnapshot = await getDocs(query(collection(db, 'lieux'), limit(5)));
    let lieuToUpdate = null;
    
    lieuxSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.latitude || !data.longitude) {
        lieuToUpdate = { id: doc.id, ...data };
        return; // Sort de la boucle
      }
    });
    
    if (!lieuToUpdate) {
      console.log('✅ Tous les lieux ont déjà des coordonnées');
      return;
    }
    
    console.log(`📍 Ajout de coordonnées de test au lieu: ${lieuToUpdate.nom}`);
    
    // Coordonnées de Paris avec une petite variation
    const latitude = 48.8566 + (Math.random() - 0.5) * 0.1;
    const longitude = 2.3522 + (Math.random() - 0.5) * 0.1;
    
    // Mettre à jour le lieu
    const lieuRef = doc(db, 'lieux', lieuToUpdate.id);
    await updateDoc(lieuRef, {
      latitude: latitude,
      longitude: longitude,
      updatedAt: new Date().toISOString(),
      testCoordinates: true,
      testMapFixApplied: new Date().toISOString()
    });
    
    console.log(`✅ Coordonnées ajoutées: ${latitude}, ${longitude}`);
    console.log(`🗺️ Maintenant, allez à /lieux/${lieuToUpdate.id} pour voir la carte !`);
    
    return {
      success: true,
      lieuId: lieuToUpdate.id,
      lieuNom: lieuToUpdate.nom,
      coordinates: { latitude, longitude }
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fonction pour nettoyer les coordonnées de test
export const cleanTestCoordinates = async () => {
  try {
    console.log('🧹 Nettoyage des coordonnées de test...');
    
    const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
    const promises = [];
    
    lieuxSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.testCoordinates) {
        const lieuRef = doc(db, 'lieux', doc.id);
        promises.push(updateDoc(lieuRef, {
          latitude: null,
          longitude: null,
          testCoordinates: false,
          updatedAt: new Date().toISOString()
        }));
      }
    });
    
    await Promise.all(promises);
    console.log(`✅ ${promises.length} lieux nettoyés`);
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
};

export default { testMapFix, cleanTestCoordinates };