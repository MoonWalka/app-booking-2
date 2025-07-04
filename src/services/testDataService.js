/**
 * Service de génération de données de test pour faciliter les tests du workflow complet
 * Utilise Faker.js pour générer des données réalistes
 */
import { faker } from '@faker-js/faker/locale/fr';
import { collection, addDoc, doc, getDoc, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebase-service';
import { v4 as uuidv4 } from 'uuid';

// Configuration pour garantir des données françaises
faker.setLocale('fr');

class TestDataService {
  constructor() {
    this.testDataPrefix = '[TEST]';
    this.isTestEnvironment = process.env.NODE_ENV === 'development';
  }

  /**
   * Génère un programmateur (structure) de test
   */
  generateTestProgrammateur() {
    const companyName = faker.company.name();
    return {
      // Identifiants
      type: 'structure',
      structureRaisonSociale: `${this.testDataPrefix} ${companyName}`,
      nom: `${this.testDataPrefix} ${companyName}`,
      
      // Coordonnées
      structureAdresse: faker.location.streetAddress(),
      structureCodePostal: faker.location.zipCode('####0'),
      structureVille: faker.location.city(),
      structurePays: 'France',
      
      // Contact principal
      personneNom: faker.person.lastName(),
      personnePrenom: faker.person.firstName(),
      personneTelephone: faker.phone.number('06 ## ## ## ##'),
      personneEmail: faker.internet.email(),
      personneFonction: faker.helpers.arrayElement(['Directeur', 'Programmateur', 'Responsable culturel']),
      
      // Informations légales
      structureSiret: faker.string.numeric(14),
      structureNumeroTva: `FR${faker.string.numeric(11)}`,
      structureLicences: faker.helpers.arrayElement(['1-123456', '2-234567', '3-345678']),
      
      // Tags et métadonnées
      tags: ['test', 'programmateur'],
      isTest: true
    };
  }

  /**
   * Génère un lieu de test
   */
  generateTestLieu() {
    const venueName = faker.helpers.arrayElement(['Salle', 'Théâtre', 'Centre culturel', 'Espace']) + ' ' + faker.location.city();
    return {
      // Identifiants
      type: 'lieu',
      nom: `${this.testDataPrefix} ${venueName}`,
      
      // Localisation
      adresse: faker.location.streetAddress(),
      codePostal: faker.location.zipCode('####0'),
      ville: faker.location.city(),
      pays: 'France',
      latitude: faker.location.latitude({ min: 43, max: 50 }),
      longitude: faker.location.longitude({ min: -1, max: 7 }),
      
      // Caractéristiques
      capacite: faker.number.int({ min: 100, max: 2000 }),
      typesDeLieu: faker.helpers.arrayElements(['Salle de concert', 'Théâtre', 'Plein air', 'Bar'], { min: 1, max: 2 }),
      
      // Contact
      contactNom: faker.person.fullName(),
      contactTelephone: faker.phone.number('05 ## ## ## ##'),
      contactEmail: faker.internet.email(),
      
      // Équipements
      equipements: faker.helpers.arrayElements([
        'Sonorisation',
        'Éclairage',
        'Scène',
        'Loges',
        'Bar',
        'Parking',
        'Accessibilité PMR'
      ], { min: 3, max: 6 }),
      
      // Métadonnées
      tags: ['test', 'lieu'],
      isTest: true
    };
  }

  /**
   * Génère un artiste de test
   */
  generateTestArtiste() {
    const artistName = faker.person.fullName();
    const genre = faker.helpers.arrayElement(['Rock', 'Jazz', 'Pop', 'Électro', 'Chanson française', 'Classique']);
    const projetName = faker.helpers.arrayElement(['Nouvel Album', 'Tournée', 'Festival Tour', 'Concert Acoustique']) + ' ' + new Date().getFullYear();
    
    return {
      nom: `${this.testDataPrefix} ${artistName}`,
      nomArtiste: `${this.testDataPrefix} ${artistName}`,
      genre: genre,
      
      // Projet actuel
      projets: [{
        id: uuidv4(),
        nom: projetName,
        description: faker.lorem.paragraph(),
        dateDebut: faker.date.future().toISOString().split('T')[0],
        dateFin: faker.date.future({ years: 1 }).toISOString().split('T')[0]
      }],
      
      // Contact
      contactNom: faker.person.fullName(),
      contactTelephone: faker.phone.number('06 ## ## ## ##'),
      contactEmail: faker.internet.email(),
      
      // Infos artistiques
      biographie: faker.lorem.paragraphs(2),
      siteWeb: faker.internet.url(),
      
      // Besoins techniques
      nombreMusiciens: faker.number.int({ min: 1, max: 8 }),
      besoinsLogistiques: faker.lorem.sentence(),
      
      // Métadonnées
      tags: ['test', 'artiste', genre.toLowerCase()],
      isTest: true
    };
  }

  /**
   * Génère un concert de test lié à un programmateur et un lieu
   */
  generateTestConcert(programmateurId, lieuId, artisteData) {
    const concertDate = faker.date.future({ years: 0.5 });
    const cachet = faker.number.int({ min: 500, max: 10000 });
    
    return {
      // Date et lieu
      date: concertDate.toISOString().split('T')[0],
      heure: faker.helpers.arrayElement(['20:30', '21:00', '19:30', '20:00']),
      
      // Associations
      organisateurId: programmateurId,
      lieuId: lieuId,
      artisteId: artisteData.id,
      artisteNom: artisteData.nom,
      projetNom: artisteData.projets?.[0]?.nom || 'Projet test',
      
      // Détails du concert
      libelle: `${this.testDataPrefix} Concert ${artisteData.nom} à ${faker.location.city()}`,
      genre: artisteData.genre,
      
      // Conditions financières
      cachetBrut: cachet,
      cachetNet: Math.round(cachet * 0.8),
      fraisDeplacement: faker.number.int({ min: 0, max: 500 }),
      fraisHebergement: faker.number.int({ min: 0, max: 300 }),
      
      // Production
      productionType: faker.helpers.arrayElement(['Location', 'Coréalisation', 'Cession']),
      tauxLocation: faker.number.int({ min: 0, max: 30 }),
      
      // Billetterie
      prixBilletTTC: faker.number.int({ min: 10, max: 50 }),
      capaciteAccueil: faker.number.int({ min: 100, max: 1000 }),
      
      // Statuts
      statut: 'En cours',
      statutFormulaire: 'non_envoye',
      
      // Token pour le formulaire
      formToken: uuidv4(),
      
      // Métadonnées
      tags: ['test', 'concert'],
      isTest: true
    };
  }

  /**
   * Génère des données de formulaire pré-remplies
   */
  generateTestFormData(concertData) {
    return {
      // Infos de base reprises du concert
      artisteNom: concertData.artisteNom,
      projetNom: concertData.projetNom,
      date: concertData.date,
      heure: concertData.heure,
      
      // Complément d'infos artiste
      nombreMusiciens: faker.number.int({ min: 2, max: 8 }),
      genreMusical: concertData.genre,
      dureeSpectacle: faker.helpers.arrayElement(['45', '60', '90', '120']),
      
      // Besoins techniques
      besoinsEclairage: faker.lorem.sentence(),
      besoinsSon: faker.lorem.sentence(),
      besoinsLogistiques: faker.lorem.sentence(),
      
      // Contact tournée
      contactTourneeNom: faker.person.fullName(),
      contactTourneeTelephone: faker.phone.number('06 ## ## ## ##'),
      contactTourneeEmail: faker.internet.email(),
      
      // Hébergement
      hebergementNecessaire: faker.datatype.boolean(),
      nombreChambresSimples: faker.number.int({ min: 0, max: 4 }),
      nombreChambresDoubles: faker.number.int({ min: 0, max: 2 }),
      regimeAlimentaire: faker.helpers.arrayElement(['Aucun', 'Végétarien', 'Vegan', 'Sans gluten']),
      
      // Transport
      modeTransport: faker.helpers.arrayElement(['Voiture', 'Train', 'Avion', 'Van']),
      immatriculation: faker.vehicle.vrm(),
      
      // Commentaires
      commentaires: faker.lorem.paragraph(),
      
      // Validation
      accepteConditions: true,
      dateSignature: new Date().toISOString()
    };
  }

  /**
   * Crée un workflow complet de test
   */
  async createCompleteTestWorkflow(organizationId) {
    if (!this.isTestEnvironment) {
      console.warn('Les données de test ne peuvent être créées qu\'en environnement de développement');
      return null;
    }

    try {
      console.log('🧪 Création du workflow de test...');

      // 1. Créer un artiste
      const artisteData = this.generateTestArtiste();
      artisteData.organizationId = organizationId;
      artisteData.createdAt = serverTimestamp();
      artisteData.updatedAt = serverTimestamp();
      const artisteRef = await addDoc(collection(db, 'artistes'), artisteData);
      const artisteId = artisteRef.id;
      console.log('✅ Artiste créé:', artisteId);

      // 2. Créer un programmateur
      const programmateurData = this.generateTestProgrammateur();
      programmateurData.organizationId = organizationId;
      programmateurData.createdAt = serverTimestamp();
      programmateurData.updatedAt = serverTimestamp();
      const programmateurRef = await addDoc(collection(db, 'contacts'), programmateurData);
      const programmateurId = programmateurRef.id;
      console.log('✅ Programmateur créé:', programmateurId);

      // 3. Créer un lieu
      const lieuData = this.generateTestLieu();
      lieuData.organizationId = organizationId;
      lieuData.createdAt = serverTimestamp();
      lieuData.updatedAt = serverTimestamp();
      const lieuRef = await addDoc(collection(db, 'lieux'), lieuData);
      const lieuId = lieuRef.id;
      console.log('✅ Lieu créé:', lieuId);

      // 4. Créer un concert
      const concertData = this.generateTestConcert(
        programmateurId,
        lieuId,
        { ...artisteData, id: artisteId }
      );
      concertData.organizationId = organizationId;
      concertData.createdAt = serverTimestamp();
      concertData.updatedAt = serverTimestamp();
      const concertRef = await addDoc(collection(db, 'concerts'), concertData);
      const concertId = concertRef.id;
      console.log('✅ Concert créé:', concertId);

      // 5. Retourner toutes les données créées
      return {
        artiste: { id: artisteId, ...artisteData },
        programmateur: { id: programmateurId, ...programmateurData },
        lieu: { id: lieuId, ...lieuData },
        concert: { id: concertId, ...concertData },
        formToken: concertData.formToken,
        formUrl: `/formulaire/${concertData.formToken}`
      };

    } catch (error) {
      console.error('❌ Erreur lors de la création du workflow de test:', error);
      throw error;
    }
  }

  /**
   * Nettoie toutes les données de test
   */
  async cleanupTestData(organizationId) {
    if (!this.isTestEnvironment) {
      console.warn('Le nettoyage des données de test n\'est disponible qu\'en environnement de développement');
      return;
    }

    try {
      console.log('🧹 Nettoyage des données de test...');
      
      // Collections à nettoyer
      const collections = ['concerts', 'lieux', 'contacts', 'artistes'];
      let totalDeleted = 0;

      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName),
          where('organizationId', '==', organizationId),
          where('isTest', '==', true)
        );
        
        const snapshot = await getDocs(q);
        
        for (const doc of snapshot.docs) {
          await deleteDoc(doc.ref);
          totalDeleted++;
        }
        
        console.log(`✅ ${snapshot.size} documents supprimés de ${collectionName}`);
      }

      console.log(`🎉 Nettoyage terminé: ${totalDeleted} documents supprimés au total`);
      return totalDeleted;

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      throw error;
    }
  }
}

// Export de l'instance unique
export default new TestDataService();