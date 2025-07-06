/**
 * Service de génération de données de test simplifié
 * Version sans faker.js pour éviter les problèmes de compatibilité
 */
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebase-service';
import { v4 as uuidv4 } from 'uuid';

class TestDataServiceSimple {
  constructor() {
    this.testDataPrefix = '[TEST]';
    this.isTestEnvironment = process.env.NODE_ENV === 'development';
  }

  /**
   * Génère un nombre aléatoire entre min et max
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Choisit un élément aléatoire dans un tableau
   */
  randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Génère un numéro de téléphone français
   */
  randomPhone(prefix = '06') {
    const numbers = Array.from({ length: 8 }, () => this.randomInt(0, 9)).join('');
    return `${prefix} ${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 6)} ${numbers.slice(6, 8)}`;
  }

  /**
   * Génère un email
   */
  randomEmail(firstName, lastName) {
    const domains = ['gmail.com', 'outlook.fr', 'orange.fr', 'free.fr', 'yahoo.fr'];
    const domain = this.randomElement(domains);
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
  }

  /**
   * Génère un SIRET
   */
  randomSIRET() {
    return Array.from({ length: 14 }, () => this.randomInt(0, 9)).join('');
  }

  /**
   * Génère un programmateur (structure) de test
   */
  generateTestProgrammateur() {
    const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Michel', 'Nathalie', 'Philippe', 'Catherine'];
    const lastNames = ['Dupont', 'Martin', 'Bernard', 'Durand', 'Moreau', 'Laurent', 'Simon', 'Michel'];
    const companyTypes = ['Association', 'SARL', 'SAS', 'Mairie', 'Communauté de communes'];
    const companyNames = ['Les Musicales', 'Festival', 'Productions', 'Culture', 'Spectacles', 'Events'];
    
    const firstName = this.randomElement(firstNames);
    const lastName = this.randomElement(lastNames);
    const companyType = this.randomElement(companyTypes);
    const companyName = `${this.randomElement(companyNames)} de ${this.randomElement(['Lyon', 'Paris', 'Marseille', 'Toulouse', 'Nantes'])}`;
    
    return {
      // Identifiants
      type: 'structure',
      structureRaisonSociale: `${this.testDataPrefix} ${companyType} ${companyName}`,
      nom: `${this.testDataPrefix} ${companyType} ${companyName}`,
      
      // Coordonnées
      structureAdresse: `${this.randomInt(1, 200)} rue ${this.randomElement(['de la République', 'Victor Hugo', 'Jean Jaurès', 'du Commerce'])}`,
      structureCodePostal: `${this.randomInt(10, 95)}000`,
      structureVille: this.randomElement(['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nantes', 'Bordeaux']),
      structurePays: 'France',
      
      // Contact principal
      personneNom: lastName,
      personnePrenom: firstName,
      personneTelephone: this.randomPhone(),
      personneEmail: this.randomEmail(firstName, lastName),
      personneFonction: this.randomElement(['Directeur', 'Programmateur', 'Responsable culturel', 'Chargé de production']),
      
      // Informations légales
      structureSiret: this.randomSIRET(),
      structureNumeroTva: `FR${this.randomInt(10, 99)}${this.randomSIRET().slice(0, 9)}`,
      structureLicences: `${this.randomInt(1, 3)}-${this.randomInt(100000, 999999)}`,
      
      // Tags et métadonnées
      tags: ['test', 'programmateur'],
      isTest: true
    };
  }

  /**
   * Génère un lieu de test
   */
  generateTestLieu() {
    const venueTypes = ['Salle', 'Théâtre', 'Centre culturel', 'Espace', 'Auditorium'];
    const cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nantes', 'Bordeaux', 'Lille', 'Strasbourg'];
    const venueName = `${this.randomElement(venueTypes)} ${this.randomElement(['Municipal', 'des Arts', 'Culturel', 'de Musique'])}`;
    
    return {
      // Identifiants
      type: 'lieu',
      nom: `${this.testDataPrefix} ${venueName}`,
      
      // Localisation
      adresse: `${this.randomInt(1, 200)} ${this.randomElement(['avenue', 'rue', 'boulevard'])} ${this.randomElement(['de la Liberté', 'du Théâtre', 'des Arts'])}`,
      codePostal: `${this.randomInt(10, 95)}000`,
      ville: this.randomElement(cities),
      pays: 'France',
      latitude: 43 + Math.random() * 7, // France latitude range
      longitude: -1 + Math.random() * 8, // France longitude range
      
      // Caractéristiques
      capacite: this.randomInt(100, 2000),
      typesDeLieu: [this.randomElement(['Salle de date', 'Théâtre', 'Plein air', 'Bar'])],
      
      // Contact
      contactNom: `${this.randomElement(['Jean', 'Marie', 'Pierre'])} ${this.randomElement(['Dupont', 'Martin'])}`,
      contactTelephone: this.randomPhone('05'),
      contactEmail: `contact@${venueName.toLowerCase().replace(/\s+/g, '-')}.fr`,
      
      // Équipements
      equipements: ['Sonorisation', 'Éclairage', 'Scène', 'Loges', 'Bar'],
      
      // Métadonnées
      tags: ['test', 'lieu'],
      isTest: true
    };
  }

  /**
   * Génère un artiste de test
   */
  generateTestArtiste() {
    const firstNames = ['Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank', 'Grace', 'Henri'];
    const lastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez'];
    const genres = ['Rock', 'Jazz', 'Pop', 'Électro', 'Chanson française', 'Classique'];
    
    const firstName = this.randomElement(firstNames);
    const lastName = this.randomElement(lastNames);
    const artistName = `${firstName} ${lastName}`;
    const genre = this.randomElement(genres);
    
    return {
      nom: `${this.testDataPrefix} ${artistName}`,
      nomArtiste: `${this.testDataPrefix} ${artistName}`,
      genre: genre,
      
      // Projet actuel
      projets: [{
        id: uuidv4(),
        nom: `${this.randomElement(['Nouvel Album', 'Tournée', 'Festival Tour'])} ${new Date().getFullYear()}`,
        description: 'Description du projet de test',
        dateDebut: new Date().toISOString().split('T')[0],
        dateFin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }],
      
      // Contact
      contactNom: `Manager de ${firstName}`,
      contactTelephone: this.randomPhone(),
      contactEmail: this.randomEmail(firstName, lastName),
      
      // Infos artistiques
      biographie: `Biographie de test pour ${artistName}. Artiste de ${genre} reconnu.`,
      siteWeb: `https://www.${firstName.toLowerCase()}-${lastName.toLowerCase()}.com`,
      
      // Besoins techniques
      nombreMusiciens: this.randomInt(1, 8),
      besoinsLogistiques: 'Besoins logistiques standards',
      
      // Métadonnées
      tags: ['test', 'artiste', genre.toLowerCase()],
      isTest: true
    };
  }

  /**
   * Génère un date de test lié à un programmateur et un lieu
   */
  generateTestDate(programmateurId, lieuId, artisteData) {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + this.randomInt(1, 6));
    const cachet = this.randomInt(5, 100) * 100; // 500 à 10000 par paliers de 100
    
    return {
      // Date et lieu
      date: futureDate.toISOString().split('T')[0],
      heure: this.randomElement(['20:30', '21:00', '19:30', '20:00']),
      
      // Associations
      organisateurId: programmateurId,
      lieuId: lieuId,
      artisteId: artisteData.id,
      artisteNom: artisteData.nom,
      projetNom: artisteData.projets?.[0]?.nom || 'Projet test',
      
      // Détails du date
      libelle: `${this.testDataPrefix} Date ${artisteData.nom}`,
      genre: artisteData.genre,
      
      // Conditions financières
      cachetBrut: cachet,
      cachetNet: Math.round(cachet * 0.8),
      fraisDeplacement: this.randomInt(0, 5) * 100,
      fraisHebergement: this.randomInt(0, 3) * 100,
      
      // Production
      productionType: this.randomElement(['Location', 'Coréalisation', 'Cession']),
      tauxLocation: this.randomInt(0, 30),
      
      // Billetterie
      prixBilletTTC: this.randomInt(10, 50),
      capaciteAccueil: this.randomInt(100, 1000),
      
      // Statuts
      statut: 'En cours',
      statutFormulaire: 'non_envoye',
      
      // Token pour le formulaire
      formToken: uuidv4(),
      
      // Métadonnées
      tags: ['test', 'date'],
      isTest: true
    };
  }

  /**
   * Génère des données de formulaire pré-remplies
   */
  generateTestFormData(dateData) {
    return {
      // Infos de base reprises du date
      artisteNom: dateData.artisteNom,
      projetNom: dateData.projetNom,
      date: dateData.date,
      heure: dateData.heure,
      
      // Complément d'infos artiste
      nombreMusiciens: this.randomInt(2, 8),
      genreMusical: dateData.genre,
      dureeSpectacle: this.randomElement(['45', '60', '90', '120']),
      
      // Besoins techniques
      besoinsEclairage: 'Plan de feu standard',
      besoinsSon: 'Sonorisation complète',
      besoinsLogistiques: 'Loges pour ' + this.randomInt(2, 8) + ' personnes',
      
      // Contact tournée
      contactTourneeNom: `${this.randomElement(['Tour', 'Booking'])} Manager`,
      contactTourneeTelephone: this.randomPhone(),
      contactTourneeEmail: `tour@${dateData.artisteNom.toLowerCase().replace(/\s+/g, '-')}.com`,
      
      // Hébergement
      hebergementNecessaire: Math.random() > 0.5,
      nombreChambresSimples: this.randomInt(0, 4),
      nombreChambresDoubles: this.randomInt(0, 2),
      regimeAlimentaire: this.randomElement(['Aucun', 'Végétarien', 'Vegan', 'Sans gluten']),
      
      // Transport
      modeTransport: this.randomElement(['Voiture', 'Train', 'Avion', 'Van']),
      immatriculation: `${this.randomElement(['AB', 'CD', 'EF'])}-${this.randomInt(100, 999)}-${this.randomElement(['GH', 'IJ', 'KL'])}`,
      
      // Commentaires
      commentaires: 'Commentaires de test',
      
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

      // 4. Créer un date
      const dateData = this.generateTestDate(
        programmateurId,
        lieuId,
        { ...artisteData, id: artisteId }
      );
      dateData.organizationId = organizationId;
      dateData.createdAt = serverTimestamp();
      dateData.updatedAt = serverTimestamp();
      const dateRef = await addDoc(collection(db, 'dates'), dateData);
      const dateId = dateRef.id;
      console.log('✅ Date créé:', dateId);

      // 5. Retourner toutes les données créées
      return {
        artiste: { id: artisteId, ...artisteData },
        programmateur: { id: programmateurId, ...programmateurData },
        lieu: { id: lieuId, ...lieuData },
        date: { id: dateId, ...dateData },
        formToken: dateData.formToken,
        formUrl: `/formulaire/${dateData.formToken}`
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
      const collections = ['dates', 'lieux', 'contacts', 'artistes'];
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
export default new TestDataServiceSimple();