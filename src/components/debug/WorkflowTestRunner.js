/**
 * Composant principal pour tester le workflow complet de l'application
 * Permet de créer et vérifier toutes les entités et leurs relations
 */
import React, { useState } from 'react';
import { Button, Card, Alert, Tabs, Tab, Badge, Spinner, Form } from 'react-bootstrap';
import { FaPlay, FaBroom, FaCheck, FaTimes, FaDatabase, FaFileExport } from 'react-icons/fa';
import { useOrganization } from '@/context/OrganizationContext';
import { toast } from 'react-toastify';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  getDoc,
  doc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { v4 as uuidv4 } from 'uuid';
import styles from './WorkflowTestRunner.module.css';

function WorkflowTestRunner() {
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [testReport, setTestReport] = useState(null);
  const [activeTab, setActiveTab] = useState('scenario');
  const [selectedScenario, setSelectedScenario] = useState('complete');
  
  // État pour stocker les entités créées
  const [createdEntities, setCreatedEntities] = useState({
    artiste: null,
    structure: null,
    lieu: null,
    concert: null,
    formSubmission: null,
    contrat: null,
    devis: null,
    facture: null
  });

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomElement = (array) => array[Math.floor(Math.random() * array.length)];

  /**
   * Génère des données de test réalistes
   */
  const generateTestData = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testId = `test_${timestamp}`;
    
    return {
      testId,
      artiste: {
        nom: `[TEST] Les ${randomElement(['Rockeurs', 'Jazzmen', 'Électros'])} ${randomElement(['Fantastiques', 'Magiques', 'Cosmiques'])}`,
        nomArtiste: `[TEST] Artiste ${randomInt(1000, 9999)}`,
        genre: randomElement(['Rock', 'Jazz', 'Pop', 'Electro', 'Folk']),
        pays: 'France',
        projets: [{
          id: uuidv4(),
          nom: `Tournée ${new Date().getFullYear()}`,
          description: 'Nouvelle tournée nationale avec spectacle immersif'
        }],
        contactNom: randomElement(['Jean', 'Marie', 'Pierre']) + ' Manager',
        contactEmail: `manager.test${randomInt(1000, 9999)}@example.com`,
        contactTelephone: `06 ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
        siteWeb: `https://www.artiste-test-${randomInt(1000, 9999)}.com`,
        biographie: 'Groupe formé en 2020, mélange unique de sonorités modernes et classiques.',
        organizationId: currentOrganization.id,
        tags: ['test', 'rock', 'tournee'],
        isTest: true,
        testId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      
      structure: {
        type: 'structure',
        structureRaisonSociale: `[TEST] ${randomElement(['Association', 'SARL', 'SAS'])} ${randomElement(['CultureLive', 'ArtScene', 'MusicProd'])}`,
        nom: `[TEST] Structure ${randomInt(1000, 9999)}`,
        structureAdresse: `${randomInt(1, 200)} ${randomElement(['rue', 'avenue', 'boulevard'])} ${randomElement(['de la Culture', 'des Arts', 'de la Musique'])}`,
        structureCodePostal: `${randomInt(10, 95)}000`,
        structureVille: randomElement(['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nantes']),
        structurePays: 'France',
        structureSiret: Array.from({ length: 14 }, () => randomInt(0, 9)).join(''),
        structureNumeroTva: `FR${randomInt(10, 99)}${Array.from({ length: 9 }, () => randomInt(0, 9)).join('')}`,
        structureLicence: `${randomInt(1, 3)}-${randomInt(100000, 999999)}`,
        personneNom: randomElement(['Dupont', 'Martin', 'Bernard', 'Durand']),
        personnePrenom: randomElement(['Jean', 'Marie', 'Pierre', 'Sophie']),
        personneTelephone: `01 ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
        personneEmail: `contact${randomInt(1000, 9999)}@structure-test.fr`,
        personneFonction: randomElement(['Directeur', 'Programmateur', 'Responsable culturel']),
        commentaire: 'Structure de test créée automatiquement',
        organizationId: currentOrganization.id,
        tags: ['test', 'programmateur'],
        isTest: true,
        testId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      
      lieu: {
        type: 'lieu',
        nom: `[TEST] ${randomElement(['Salle', 'Théâtre', 'Espace', 'Centre'])} ${randomElement(['des Fêtes', 'Municipal', 'Culturel', 'des Arts'])}`,
        adresse: `${randomInt(1, 50)} ${randomElement(['place', 'rue', 'avenue'])} ${randomElement(['de la Mairie', 'du Centre', 'des Arts'])}`,
        codePostal: `${randomInt(10, 95)}000`,
        ville: randomElement(['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nantes']),
        pays: 'France',
        capacite: randomInt(100, 2000),
        dimensionsScene: {
          largeur: randomInt(8, 15),
          profondeur: randomInt(6, 12),
          hauteur: randomInt(4, 8)
        },
        equipementsSon: 'Système Line Array complet',
        equipementsLumiere: 'Console DMX + projecteurs LED',
        loges: randomInt(2, 4),
        parking: true,
        accessibilite: true,
        organizationId: currentOrganization.id,
        tags: ['test', 'salle'],
        isTest: true,
        testId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      
      concert: {
        date: new Date(Date.now() + randomInt(30, 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        heure: `${randomInt(19, 21)}:${randomElement(['00', '30'])}`,
        libelle: `[TEST] Concert ${randomElement(['Printemps', 'Été', 'Automne', 'Hiver'])} ${new Date().getFullYear()}`,
        genre: randomElement(['Rock', 'Jazz', 'Pop', 'Electro']),
        cachetBrut: randomInt(1000, 5000),
        cachetNet: 0,
        fraisTechniques: randomInt(200, 800),
        fraisDeplacements: randomInt(100, 500),
        fraisHebergement: randomInt(200, 600),
        statut: 'En cours',
        statutFormulaire: 'non_envoye',
        notes: 'Concert de test automatisé pour validation du workflow',
        formToken: uuidv4(),
        organizationId: currentOrganization.id,
        tags: ['test'],
        isTest: true,
        testId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      
      formSubmission: {
        lieuData: {
          nom: '[TEST] Salle principale',
          adresse: '123 rue du Test',
          codePostal: '75001',
          ville: 'Paris',
          pays: 'France'
        },
        structureData: {
          nom: '[TEST] Association Organisatrice',
          siret: '12345678901234',
          adresse: '456 avenue de l\'Organisation',
          codePostal: '75002',
          ville: 'Paris',
          numeroIntracommunautaire: 'FR12345678901'
        },
        signataireData: {
          nom: 'Signataire',
          prenom: 'Test',
          fonction: 'Président',
          email: 'signataire@test.com',
          telephone: '01 23 45 67 89'
        },
        status: 'completed',
        submittedAt: serverTimestamp()
      },
      
      contrat: {
        titre: `[TEST] Contrat ${randomElement(['Festival', 'Salle', 'Bar'])} ${new Date().getFullYear()}`,
        dateDebut: new Date(Date.now() + randomInt(30, 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateFin: new Date(Date.now() + randomInt(31, 91) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        entrepriseCode: 'MR',
        numeroContrat: `TEST-${new Date().getFullYear()}-${randomInt(1000, 9999)}`,
        
        // Données artiste
        artiste: {
          nom: testData.artiste.nom,
          contactNom: testData.artiste.contactNom,
          contactEmail: testData.artiste.contactEmail,
          contactTelephone: testData.artiste.contactTelephone
        },
        
        // Données organisateur
        organisateur: {
          raisonSociale: testData.structure.structureRaisonSociale,
          adresse: testData.structure.structureAdresse,
          codePostal: testData.structure.structureCodePostal,
          ville: testData.structure.structureVille,
          siret: testData.structure.structureSiret,
          numeroTva: testData.structure.structureNumeroTva,
          licence: testData.structure.structureLicence,
          signataire: {
            nom: testData.structure.personneNom,
            prenom: testData.structure.personnePrenom,
            fonction: testData.structure.personneFonction,
            email: testData.structure.personneEmail,
            telephone: testData.structure.personneTelephone
          }
        },
        
        // Données négociation
        negociation: {
          montantBrut: testData.concert.cachetBrut,
          montantNet: testData.concert.cachetBrut,
          montantTTC: Math.round(testData.concert.cachetBrut * 1.055), // TVA 5.5%
          fraisTechniques: testData.concert.fraisTechniques,
          fraisDeplacements: testData.concert.fraisDeplacements,
          fraisHebergement: testData.concert.fraisHebergement,
          montantTotal: testData.concert.cachetBrut + testData.concert.fraisTechniques + testData.concert.fraisDeplacements + testData.concert.fraisHebergement
        },
        
        // Informations du concert
        representation: {
          date: testData.concert.date,
          heure: testData.concert.heure,
          lieu: testData.lieu.nom,
          adresse: testData.lieu.adresse,
          codePostal: testData.lieu.codePostal,
          ville: testData.lieu.ville
        },
        
        isTest: true,
        testId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      
      devis: {
        numero: `DEV-TEST-${new Date().getFullYear()}-${randomInt(1000, 9999)}`,
        dateEmission: new Date().toISOString().split('T')[0],
        dateValidite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        montantHT: testData.concert.cachetBrut,
        tauxTVA: 5.5,
        montantTVA: Math.round(testData.concert.cachetBrut * 0.055),
        montantTTC: Math.round(testData.concert.cachetBrut * 1.055),
        lignes: [{
          description: `Prestation artistique - ${testData.artiste.nom}`,
          quantite: 1,
          prixUnitaire: testData.concert.cachetBrut,
          montant: testData.concert.cachetBrut
        }],
        isTest: true,
        testId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      
      facture: {
        numero: `FAC-TEST-${new Date().getFullYear()}-${randomInt(1000, 9999)}`,
        dateEmission: new Date().toISOString().split('T')[0],
        dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        montantHT: testData.concert.cachetBrut,
        tauxTVA: 5.5,
        montantTVA: Math.round(testData.concert.cachetBrut * 0.055),
        montantTTC: Math.round(testData.concert.cachetBrut * 1.055),
        lignes: [{
          description: `Prestation artistique - ${testData.artiste.nom}`,
          quantite: 1,
          prixUnitaire: testData.concert.cachetBrut,
          montant: testData.concert.cachetBrut
        }],
        isTest: true,
        testId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    };
  };

  /**
   * Crée toutes les entités du workflow DE MANIÈRE SÉQUENTIELLE
   * Simule le vrai workflow de l'application
   */
  const createWorkflowEntities = async (testData) => {
    const results = {
      artiste: null,
      structure: null,
      lieu: null,
      concert: null,
      formSubmission: null,
      contrat: null,
      devis: null,
      facture: null
    };

    try {
      // 1. Créer l'artiste
      console.log('🎤 Création de l\'artiste...');
      const artisteRef = await addDoc(collection(db, 'artistes'), testData.artiste);
      results.artiste = { id: artisteRef.id, ...testData.artiste };
      console.log('✅ Artiste créé:', artisteRef.id);

      // 2. Créer la structure
      console.log('🏢 Création de la structure...');
      const structureRef = await addDoc(collection(db, 'structures'), testData.structure);
      results.structure = { id: structureRef.id, ...testData.structure };
      console.log('✅ Structure créée:', structureRef.id);

      // 3. Créer le lieu
      console.log('🏛️ Création du lieu...');
      const lieuRef = await addDoc(collection(db, 'lieux'), testData.lieu);
      results.lieu = { id: lieuRef.id, ...testData.lieu };
      console.log('✅ Lieu créé:', lieuRef.id);

      // 4. Créer le concert avec toutes les relations
      console.log('🎵 Création du concert...');
      const concertData = {
        ...testData.concert,
        // Relations artiste
        artisteId: artisteRef.id,
        artisteNom: testData.artiste.nom,
        projetNom: testData.artiste.projets[0].nom,
        // Relations structure
        structureId: structureRef.id,
        structureNom: testData.structure.nom,
        organisateurId: structureRef.id,
        organisateurNom: testData.structure.nom,
        // Relations lieu
        lieuId: lieuRef.id,
        lieuNom: testData.lieu.nom,
        lieuVille: testData.lieu.ville,
        lieuCapacite: testData.lieu.capacite,
        // WORKFLOW: Commencer au statut "contact" (première étape)
        statut: 'contact',
        statutFormulaire: 'non_envoye'
      };
      
      const concertRef = await addDoc(collection(db, 'concerts'), concertData);
      results.concert = { id: concertRef.id, ...concertData };
      console.log('✅ Concert créé avec statut "contact":', concertRef.id);

      // 5. WORKFLOW ÉTAPE 1: Simuler l'envoi puis la soumission du formulaire
      console.log('📝 WORKFLOW: Envoi et soumission du formulaire...');
      
      // D'abord, mettre à jour le concert pour indiquer que le formulaire a été envoyé
      await updateDoc(doc(db, 'concerts', concertRef.id), {
        statutFormulaire: 'envoye',
        formToken: concertData.formToken,
        updatedAt: serverTimestamp()
      });
      console.log('✉️ Formulaire marqué comme envoyé');
      
      // Ensuite, simuler la soumission du formulaire
      const formSubmissionData = {
        ...testData.formSubmission,
        concertId: concertRef.id,
        formToken: concertData.formToken,
        organizationId: currentOrganization.id,
        testId: testData.testId
      };
      
      const formRef = await addDoc(collection(db, 'formSubmissions'), formSubmissionData);
      results.formSubmission = { id: formRef.id, ...formSubmissionData };
      
      // Mettre à jour le concert pour indiquer que le formulaire a été rempli
      await updateDoc(doc(db, 'concerts', concertRef.id), {
        statutFormulaire: 'complete',
        hasFormSubmission: true,
        lastFormSubmissionId: formRef.id,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Formulaire soumis et concert mis à jour');

      // 6. WORKFLOW ÉTAPE 2: Créer le contrat APRÈS validation du formulaire
      console.log('📄 WORKFLOW: Création du contrat après validation formulaire...');
      
      // Simuler la validation du formulaire d'abord
      await updateDoc(doc(db, 'concerts', concertRef.id), {
        formValidated: true,
        statut: 'negociation', // Passer au statut négociation
        updatedAt: serverTimestamp()
      });
      console.log('✅ Formulaire validé, statut passé à "negociation"');
      
      // Maintenant créer le contrat
      const contratData = {
        ...testData.contrat,
        concertId: concertRef.id,
        artisteId: artisteRef.id,
        structureId: structureRef.id,
        lieuId: lieuRef.id,
        organizationId: currentOrganization.id,
        montantHT: testData.contrat.negociation.montantNet,
        montantTTC: testData.contrat.negociation.montantTTC,
        status: 'draft' // Commence en brouillon
      };
      
      // Les contrats utilisent l'ID du concert comme ID
      await setDoc(doc(db, 'contrats', concertRef.id), contratData);
      results.contrat = { id: concertRef.id, ...contratData };
      
      // Mettre à jour le concert pour indiquer qu'il a un contrat
      await updateDoc(doc(db, 'concerts', concertRef.id), {
        hasContrat: true,
        contratId: concertRef.id,
        contratStatus: 'draft',
        updatedAt: serverTimestamp()
      });
      console.log('✅ Contrat créé en mode brouillon');

      // 7. WORKFLOW ÉTAPE 3: Simuler l'envoi et la signature du contrat
      console.log('📮 WORKFLOW: Envoi et signature du contrat...');
      
      // Simuler l'envoi du contrat
      await updateDoc(doc(db, 'contrats', concertRef.id), {
        status: 'sent',
        sentAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'concerts', concertRef.id), {
        contratStatus: 'sent',
        updatedAt: serverTimestamp()
      });
      console.log('✉️ Contrat envoyé');
      
      // Simuler la signature du contrat
      await new Promise(resolve => setTimeout(resolve, 500)); // Petit délai pour simuler le temps réel
      
      await updateDoc(doc(db, 'contrats', concertRef.id), {
        status: 'signed',
        signedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'concerts', concertRef.id), {
        statut: 'confirme', // Le concert passe en confirmé après signature
        contratStatus: 'signed',
        updatedAt: serverTimestamp()
      });
      console.log('✍️ Contrat signé, concert confirmé');

      // 8. WORKFLOW ÉTAPE 4: Créer le devis BASÉ sur le contrat signé
      console.log('💰 WORKFLOW: Création du devis basé sur le contrat signé...');
      const devisData = {
        ...testData.devis,
        concertId: concertRef.id,
        contratId: concertRef.id,
        artisteId: artisteRef.id,
        structureId: structureRef.id,
        organizationId: currentOrganization.id,
        // Reprendre les montants du contrat
        montantHT: contratData.montantHT,
        montantTTC: contratData.montantTTC,
        status: 'draft'
      };
      
      const devisRef = await addDoc(collection(db, 'devis'), devisData);
      results.devis = { id: devisRef.id, ...devisData };
      
      await updateDoc(doc(db, 'concerts', concertRef.id), {
        hasDevis: true,
        devisId: devisRef.id,
        devisStatus: 'draft',
        updatedAt: serverTimestamp()
      });
      console.log('✅ Devis créé à partir du contrat');

      // 9. WORKFLOW ÉTAPE 5: Créer la facture APRÈS le concert (normalement)
      console.log('🧾 WORKFLOW: Création de la facture après prestation...');
      
      // Simuler que le concert a eu lieu
      await updateDoc(doc(db, 'concerts', concertRef.id), {
        statut: 'realise', // Concert réalisé
        updatedAt: serverTimestamp()
      });
      console.log('🎤 Concert marqué comme réalisé');
      
      const factureData = {
        ...testData.facture,
        concertId: concertRef.id,
        contratId: concertRef.id,
        devisId: devisRef.id,
        artisteId: artisteRef.id,
        structureId: structureRef.id,
        organizationId: currentOrganization.id,
        // Reprendre les montants du contrat/devis
        montantHT: contratData.montantHT,
        montantTTC: contratData.montantTTC,
        status: 'draft'
      };
      
      const factureRef = await addDoc(collection(db, 'factures'), factureData);
      results.facture = { id: factureRef.id, ...factureData };
      
      await updateDoc(doc(db, 'concerts', concertRef.id), {
        hasFacture: true,
        factureId: factureRef.id,
        factureStatus: 'draft',
        updatedAt: serverTimestamp()
      });
      console.log('✅ Facture créée après réalisation du concert');

      // Émettre l'événement de création
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('concertCreated', { 
          detail: { concertId: concertRef.id, isTest: true } 
        }));
      }

      return results;
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      throw error;
    }
  };

  /**
   * Vérifie que toutes les entités sont visibles et liées correctement
   */
  const verifyWorkflow = async (entities) => {
    const verifications = {
      artisteVisible: false,
      structureVisible: false,
      lieuVisible: false,
      concertVisible: false,
      relationsEtablies: false,
      formulaireRempli: false,
      contratCree: false,
      devisCree: false,
      factureCree: false,
      // Vérifications du workflow
      workflowStatuts: false,
      workflowDependances: false,
      errors: []
    };

    try {
      // Vérifier que l'artiste est visible
      const artisteDoc = await getDoc(doc(db, 'artistes', entities.artiste.id));
      if (artisteDoc.exists()) {
        verifications.artisteVisible = true;
        console.log('✅ Artiste vérifié');
      } else {
        verifications.errors.push('Artiste non trouvé');
      }

      // Vérifier la structure
      const structureDoc = await getDoc(doc(db, 'structures', entities.structure.id));
      if (structureDoc.exists()) {
        verifications.structureVisible = true;
        console.log('✅ Structure vérifiée');
      } else {
        verifications.errors.push('Structure non trouvée');
      }

      // Vérifier le lieu
      const lieuDoc = await getDoc(doc(db, 'lieux', entities.lieu.id));
      if (lieuDoc.exists()) {
        verifications.lieuVisible = true;
        console.log('✅ Lieu vérifié');
      } else {
        verifications.errors.push('Lieu non trouvé');
      }

      // Vérifier le concert et ses relations
      const concertDoc = await getDoc(doc(db, 'concerts', entities.concert.id));
      if (concertDoc.exists()) {
        verifications.concertVisible = true;
        const concertData = concertDoc.data();
        
        // Vérifier les relations
        if (concertData.artisteId === entities.artiste.id &&
            concertData.structureId === entities.structure.id &&
            concertData.lieuId === entities.lieu.id) {
          verifications.relationsEtablies = true;
          console.log('✅ Relations vérifiées');
        } else {
          verifications.errors.push('Relations incorrectes dans le concert');
        }
      } else {
        verifications.errors.push('Concert non trouvé');
      }

      // Vérifier le formulaire
      const formDoc = await getDoc(doc(db, 'formSubmissions', entities.formSubmission.id));
      if (formDoc.exists()) {
        verifications.formulaireRempli = true;
        console.log('✅ Formulaire vérifié');
      } else {
        verifications.errors.push('Formulaire non trouvé');
      }

      // Vérifier le contrat
      if (entities.contrat?.id) {
        const contratDoc = await getDoc(doc(db, 'contrats', entities.contrat.id));
        if (contratDoc.exists()) {
          verifications.contratCree = true;
          console.log('✅ Contrat vérifié');
        } else {
          verifications.errors.push('Contrat non trouvé');
        }
      }

      // Vérifier le devis
      if (entities.devis?.id) {
        const devisDoc = await getDoc(doc(db, 'devis', entities.devis.id));
        if (devisDoc.exists()) {
          verifications.devisCree = true;
          console.log('✅ Devis vérifié');
        } else {
          verifications.errors.push('Devis non trouvé');
        }
      }

      // Vérifier la facture
      if (entities.facture?.id) {
        const factureDoc = await getDoc(doc(db, 'factures', entities.facture.id));
        if (factureDoc.exists()) {
          verifications.factureCree = true;
          console.log('✅ Facture vérifiée');
        } else {
          verifications.errors.push('Facture non trouvée');
        }
      }

      // VÉRIFICATIONS DU WORKFLOW
      console.log('🔄 Vérification du workflow et des statuts...');
      
      // Re-récupérer le concert pour avoir les derniers statuts
      const concertFinalDoc = await getDoc(doc(db, 'concerts', entities.concert.id));
      if (concertFinalDoc.exists()) {
        const concertFinal = concertFinalDoc.data();
        
        // Vérifier les statuts du workflow
        const statutsCorrects = 
          concertFinal.statut === 'realise' && // Concert réalisé
          concertFinal.statutFormulaire === 'complete' && // Formulaire complété
          concertFinal.formValidated === true && // Formulaire validé
          concertFinal.contratStatus === 'signed' && // Contrat signé
          concertFinal.hasContrat === true &&
          concertFinal.hasDevis === true &&
          concertFinal.hasFacture === true;
          
        if (statutsCorrects) {
          verifications.workflowStatuts = true;
          console.log('✅ Statuts du workflow corrects');
        } else {
          verifications.errors.push('Statuts du workflow incorrects');
          console.log('❌ Statuts incorrects:', {
            statut: concertFinal.statut,
            statutFormulaire: concertFinal.statutFormulaire,
            formValidated: concertFinal.formValidated,
            contratStatus: concertFinal.contratStatus
          });
        }
        
        // Vérifier les dépendances (que chaque document pointe vers les précédents)
        const contratFinalDoc = await getDoc(doc(db, 'contrats', entities.contrat.id));
        const devisFinalDoc = await getDoc(doc(db, 'devis', entities.devis.id));
        const factureFinalDoc = await getDoc(doc(db, 'factures', entities.facture.id));
        
        if (contratFinalDoc.exists() && devisFinalDoc.exists() && factureFinalDoc.exists()) {
          const devisFinal = devisFinalDoc.data();
          const factureFinal = factureFinalDoc.data();
          
          const dependancesCorrectes = 
            devisFinal.contratId === entities.contrat.id && // Devis lié au contrat
            factureFinal.contratId === entities.contrat.id && // Facture liée au contrat
            factureFinal.devisId === entities.devis.id; // Facture liée au devis
            
          if (dependancesCorrectes) {
            verifications.workflowDependances = true;
            console.log('✅ Dépendances du workflow correctes');
          } else {
            verifications.errors.push('Dépendances entre documents incorrectes');
          }
        }
      }

      return verifications;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification:', error);
      verifications.errors.push(error.message);
      return verifications;
    }
  };

  /**
   * Lance le test complet du workflow
   */
  const runCompleteTest = async () => {
    if (!currentOrganization?.id) {
      toast.error('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      console.log('🚀 Début du test de workflow complet...');
      
      // Générer les données de test
      const testData = generateTestData();
      console.log('📊 Données de test générées:', testData.testId);

      // Créer toutes les entités
      const entities = await createWorkflowEntities(testData);
      setCreatedEntities(entities);

      // Attendre un peu pour que les données se propagent
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Vérifier le workflow
      console.log('🔍 Vérification du workflow...');
      const verifications = await verifyWorkflow(entities);

      // Créer le rapport
      const report = {
        testId: testData.testId,
        timestamp: new Date().toISOString(),
        organizationId: currentOrganization.id,
        duration: `${(Date.now() - startTime) / 1000}s`,
        entitiesCreated: {
          artiste: { 
            id: entities.artiste.id, 
            nom: entities.artiste.nom 
          },
          structure: { 
            id: entities.structure.id, 
            nom: entities.structure.nom 
          },
          lieu: { 
            id: entities.lieu.id, 
            nom: entities.lieu.nom 
          },
          concert: { 
            id: entities.concert.id, 
            date: entities.concert.date,
            libelle: entities.concert.libelle
          },
          formSubmission: {
            id: entities.formSubmission.id,
            status: entities.formSubmission.status
          },
          contrat: entities.contrat ? { 
            id: entities.contrat.id, 
            numero: entities.contrat.numeroContrat,
            status: entities.contrat.status 
          } : null,
          devis: entities.devis ? { 
            id: entities.devis.id, 
            numero: entities.devis.numero,
            status: entities.devis.status 
          } : null,
          facture: entities.facture ? { 
            id: entities.facture.id, 
            numero: entities.facture.numero,
            status: entities.facture.status 
          } : null
        },
        verifications,
        success: Object.values(verifications).filter(v => v === true).length === 11, // 11 vérifications au total maintenant
        errors: verifications.errors,
        // Détails du workflow pour le rapport
        workflowDetails: {
          etapes: [
            '1. Concert créé avec statut "contact"',
            '2. Formulaire envoyé puis soumis',
            '3. Formulaire validé → statut "negociation"',
            '4. Contrat créé → envoyé → signé',
            '5. Concert confirmé après signature',
            '6. Devis créé basé sur le contrat',
            '7. Concert réalisé',
            '8. Facture créée après prestation'
          ],
          statutsFinals: {
            concert: 'realise',
            formulaire: 'complete + validé',
            contrat: 'signed',
            devis: 'draft',
            facture: 'draft'
          }
        }
      };

      setTestReport(report);
      setActiveTab('report');

      // Notification
      if (report.success) {
        toast.success('✅ Test complet réussi ! Toutes les vérifications sont passées.');
      } else {
        toast.warning(`⚠️ Test terminé avec ${verifications.errors.length} erreur(s)`);
      }

      console.log('📊 Rapport de test:', report);

    } catch (error) {
      console.error('❌ Erreur lors du test:', error);
      toast.error('Erreur lors du test: ' + error.message);
      
      setTestReport({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        duration: `${(Date.now() - startTime) / 1000}s`
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Nettoie toutes les données de test
   */
  const cleanupTestData = async () => {
    if (!currentOrganization?.id) {
      toast.error('Aucune organisation sélectionnée');
      return;
    }

    if (!window.confirm('⚠️ Supprimer toutes les données de test ?')) {
      return;
    }

    setLoading(true);
    try {
      console.log('🧹 Nettoyage des données de test...');
      
      const collections = ['concerts', 'lieux', 'contacts', 'artistes', 'formSubmissions', 'contrats', 'devis', 'factures'];
      let totalDeleted = 0;

      for (const collectionName of collections) {
        // Adapter pour la nouvelle structure
        const actualCollection = collectionName === 'contacts' ? 'structures' : collectionName;
        const q = query(
          collection(db, actualCollection),
          where('organizationId', '==', currentOrganization.id),
          where('isTest', '==', true)
        );
        
        const snapshot = await getDocs(q);
        
        for (const doc of snapshot.docs) {
          await deleteDoc(doc.ref);
          totalDeleted++;
          console.log(`🗑️ Supprimé: ${actualCollection}/${doc.id}`);
        }
      }

      toast.success(`✅ ${totalDeleted} données de test supprimées`);
      
      // Réinitialiser l'état
      setCreatedEntities({
        artiste: null,
        structure: null,
        lieu: null,
        concert: null,
        formSubmission: null,
        contrat: null,
        devis: null,
        facture: null
      });
      setTestReport(null);
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      toast.error('Erreur lors du nettoyage');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exporte le rapport en JSON
   */
  const exportReport = () => {
    if (!testReport) return;

    const blob = new Blob([JSON.stringify(testReport, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${testReport.testId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('📄 Rapport exporté');
  };

  return (
    <div className={styles.container}>
      <Card className={styles.mainCard}>
        <Card.Header>
          <h2>🧪 Test de Workflow Complet</h2>
          <p className="text-muted mb-0">
            Valide la création et les relations entre toutes les entités
          </p>
        </Card.Header>

        <Card.Body>
          <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
            <Tab eventKey="scenario" title="Scénarios">
              <div className={styles.scenarioSection}>
                <h4>Sélectionner un scénario de test</h4>
                
                <Form.Check
                  type="radio"
                  id="complete"
                  name="scenario"
                  label={
                    <div>
                      <strong>Workflow Complet</strong>
                      <p className="text-muted mb-0">
                        Crée toutes les entités (artiste, structure, lieu, concert) 
                        et vérifie leurs relations
                      </p>
                    </div>
                  }
                  checked={selectedScenario === 'complete'}
                  onChange={() => setSelectedScenario('complete')}
                  className="mb-3"
                />

                <Form.Check
                  type="radio"
                  id="forms"
                  name="scenario"
                  label={
                    <div>
                      <strong>Test des Formulaires</strong>
                      <p className="text-muted mb-0">
                        Teste le remplissage automatique des formulaires publics
                      </p>
                    </div>
                  }
                  checked={selectedScenario === 'forms'}
                  onChange={() => setSelectedScenario('forms')}
                  disabled
                  className="mb-3"
                />

                <Form.Check
                  type="radio"
                  id="relations"
                  name="scenario"
                  label={
                    <div>
                      <strong>Test des Relations</strong>
                      <p className="text-muted mb-0">
                        Vérifie les relations bidirectionnelles entre entités
                      </p>
                    </div>
                  }
                  checked={selectedScenario === 'relations'}
                  onChange={() => setSelectedScenario('relations')}
                  disabled
                  className="mb-3"
                />

                <div className={styles.actions}>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={runCompleteTest}
                    disabled={loading || !currentOrganization}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Test en cours...
                      </>
                    ) : (
                      <>
                        <FaPlay className="me-2" />
                        Lancer le Test
                      </>
                    )}
                  </Button>

                  <Button
                    variant="danger"
                    onClick={cleanupTestData}
                    disabled={loading}
                  >
                    <FaBroom className="me-2" />
                    Nettoyer les Tests
                  </Button>
                </div>
              </div>
            </Tab>

            <Tab eventKey="status" title="État">
              <div className={styles.statusSection}>
                <h4>Entités créées</h4>
                
                <div className={styles.entityGrid}>
                  {Object.entries(createdEntities).map(([type, entity]) => (
                    <div key={type} className={styles.entityCard}>
                      <div className={styles.entityType}>{type}</div>
                      {entity ? (
                        <>
                          <div className={styles.entityId}>ID: {entity.id}</div>
                          <div className={styles.entityName}>
                            {entity.nom || entity.libelle || entity.status}
                          </div>
                          <Badge bg="success">
                            <FaCheck /> Créé
                          </Badge>
                        </>
                      ) : (
                        <Badge bg="secondary">En attente</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Tab>

            <Tab eventKey="report" title={
              <span>
                Rapport
                {testReport && (
                  <Badge bg={testReport.success ? 'success' : 'danger'} className="ms-2">
                    {testReport.success ? 'Succès' : 'Échec'}
                  </Badge>
                )}
              </span>
            }>
              {testReport ? (
                <div className={styles.reportSection}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h4>Rapport de Test</h4>
                    <Button variant="outline-primary" size="sm" onClick={exportReport}>
                      <FaFileExport className="me-1" />
                      Exporter JSON
                    </Button>
                  </div>

                  <Alert variant={testReport.success ? 'success' : 'danger'}>
                    {testReport.success ? (
                      <>
                        <FaCheck className="me-2" />
                        Test réussi - Toutes les vérifications sont passées
                      </>
                    ) : (
                      <>
                        <FaTimes className="me-2" />
                        Test échoué - {testReport.errors?.length || 1} erreur(s) détectée(s)
                      </>
                    )}
                  </Alert>

                  <div className={styles.reportDetails}>
                    <div className={styles.reportMeta}>
                      <div><strong>Test ID:</strong> {testReport.testId}</div>
                      <div><strong>Date:</strong> {new Date(testReport.timestamp).toLocaleString()}</div>
                      <div><strong>Durée:</strong> {testReport.duration}</div>
                      <div><strong>Organisation:</strong> {testReport.organizationId}</div>
                    </div>

                    {testReport.verifications && (
                      <div className={styles.verificationsList}>
                        <h5>Vérifications</h5>
                        {Object.entries(testReport.verifications).map(([key, value]) => {
                          if (key === 'errors') return null;
                          return (
                            <div key={key} className={styles.verificationItem}>
                              {value === true ? (
                                <FaCheck className="text-success me-2" />
                              ) : (
                                <FaTimes className="text-danger me-2" />
                              )}
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {testReport.errors && testReport.errors.length > 0 && (
                      <Alert variant="danger" className="mt-3">
                        <h6>Erreurs détectées:</h6>
                        <ul className="mb-0">
                          {testReport.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </Alert>
                    )}

                    {testReport.workflowDetails && (
                      <div className={styles.workflowDetails}>
                        <h5>Détails du Workflow</h5>
                        <div className="mb-3">
                          <h6>Étapes exécutées :</h6>
                          <ol className="mb-0">
                            {testReport.workflowDetails.etapes.map((etape, idx) => (
                              <li key={idx} className="mb-1">{etape}</li>
                            ))}
                          </ol>
                        </div>
                        <div className="mb-3">
                          <h6>Statuts finaux :</h6>
                          <ul className="list-unstyled mb-0">
                            {Object.entries(testReport.workflowDetails.statutsFinals).map(([key, value]) => (
                              <li key={key}>
                                <strong>{key}:</strong> <span className="badge bg-info">{value}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className={styles.reportJson}>
                      <h5>Données JSON</h5>
                      <pre>{JSON.stringify(testReport, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert variant="info">
                  Aucun test n'a encore été exécuté. 
                  Lancez un test pour voir le rapport ici.
                </Alert>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
}

export default WorkflowTestRunner;