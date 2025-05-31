// Utilitaire pour ajouter des coordonnées aux lieux existants
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Service de géocodage utilisant LocationIQ (gratuit jusqu'à 10000 requêtes/jour)
 */
class GeocodingService {
  constructor() {
    // Clé API publique LocationIQ (limitée mais gratuite)
    this.apiKey = 'pk.locationiq.com_demo_key'; // Clé de démo, remplacer par une vraie clé
    this.baseUrl = 'https://us1.locationiq.com/v1/search.php';
  }

  async geocodeAddress(address, city, postalCode, country = 'France') {
    try {
      const query = [address, postalCode, city, country].filter(Boolean).join(', ');
      
      const response = await fetch(
        `${this.baseUrl}?key=${this.apiKey}&q=${encodeURIComponent(query)}&format=json&limit=1`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur géocodage: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          display_name: data[0].display_name
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors du géocodage:', error);
      return null;
    }
  }
}

/**
 * Ajoute des coordonnées aux lieux qui n'en ont pas
 */
export const addCoordinatesToLieux = async () => {
  const geocodingService = new GeocodingService();
  
  try {
    console.log('🗺️  Démarrage de l\'ajout de coordonnées aux lieux...');
    
    // Récupérer tous les lieux
    const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
    const lieux = [];
    
    lieuxSnapshot.forEach(doc => {
      const data = doc.data();
      lieux.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log(`📍 ${lieux.length} lieux trouvés`);
    
    // Filtrer les lieux sans coordonnées
    const lieuxSansCoordonnees = lieux.filter(lieu => !lieu.latitude || !lieu.longitude);
    
    console.log(`🔍 ${lieuxSansCoordonnees.length} lieux sans coordonnées trouvés`);
    
    if (lieuxSansCoordonnees.length === 0) {
      console.log('✅ Tous les lieux ont déjà des coordonnées');
      return;
    }
    
    // Traiter chaque lieu
    let successCount = 0;
    let errorCount = 0;
    
    for (const lieu of lieuxSansCoordonnees) {
      try {
        console.log(`📍 Géocodage de: ${lieu.nom} - ${lieu.adresse}, ${lieu.ville}`);
        
        // Géocoder l'adresse
        const coordinates = await geocodingService.geocodeAddress(
          lieu.adresse,
          lieu.ville,
          lieu.codePostal,
          lieu.pays
        );
        
        if (coordinates) {
          // Mettre à jour le lieu dans Firestore
          const lieuRef = doc(db, 'lieux', lieu.id);
          await updateDoc(lieuRef, {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            updatedAt: new Date().toISOString(),
            geoCodedAt: new Date().toISOString() // Marquer quand le géocodage a été fait
          });
          
          console.log(`✅ Coordonnées ajoutées pour ${lieu.nom}: ${coordinates.latitude}, ${coordinates.longitude}`);
          successCount++;
        } else {
          console.log(`❌ Impossible de géocoder: ${lieu.nom}`);
          errorCount++;
        }
        
        // Délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erreur pour ${lieu.nom}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Résumé:`);
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📍 Total traité: ${successCount + errorCount}`);
    
  } catch (error) {
    console.error('Erreur générale:', error);
  }
};

/**
 * Ajoute des coordonnées de test (Paris) à tous les lieux sans coordonnées
 * Utile pour tester l'affichage des cartes
 */
export const addTestCoordinatesToLieux = async () => {
  try {
    console.log('🧪 Ajout de coordonnées de test aux lieux...');
    
    // Récupérer tous les lieux
    const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
    const lieux = [];
    
    lieuxSnapshot.forEach(doc => {
      const data = doc.data();
      lieux.push({
        id: doc.id,
        ...data
      });
    });
    
    // Filtrer les lieux sans coordonnées
    const lieuxSansCoordonnees = lieux.filter(lieu => !lieu.latitude || !lieu.longitude);
    
    console.log(`🔍 ${lieuxSansCoordonnees.length} lieux sans coordonnées trouvés`);
    
    if (lieuxSansCoordonnees.length === 0) {
      console.log('✅ Tous les lieux ont déjà des coordonnées');
      return;
    }
    
    // Coordonnées de test (Paris, avec de petites variations)
    const baseLatitude = 48.8566;
    const baseLongitude = 2.3522;
    
    let count = 0;
    for (const lieu of lieuxSansCoordonnees) {
      try {
        // Ajouter une petite variation pour éviter que tous les lieux soient au même endroit
        const latitude = baseLatitude + (Math.random() - 0.5) * 0.1;
        const longitude = baseLongitude + (Math.random() - 0.5) * 0.1;
        
        const lieuRef = doc(db, 'lieux', lieu.id);
        await updateDoc(lieuRef, {
          latitude: latitude,
          longitude: longitude,
          updatedAt: new Date().toISOString(),
          testCoordinates: true // Marquer que ce sont des coordonnées de test
        });
        
        console.log(`✅ Coordonnées de test ajoutées pour ${lieu.nom}: ${latitude}, ${longitude}`);
        count++;
        
      } catch (error) {
        console.error(`❌ Erreur pour ${lieu.nom}:`, error);
      }
    }
    
    console.log(`\n📊 ${count} lieux mis à jour avec des coordonnées de test`);
    
  } catch (error) {
    console.error('Erreur générale:', error);
  }
};

export default { addCoordinatesToLieux, addTestCoordinatesToLieux };