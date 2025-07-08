#!/usr/bin/env node

/**
 * Script pour corriger la migration relationnelle
 * - Corrige isPersonneLibre sur les personnes
 * - Crée les structures manquantes
 * - Crée les liaisons entre structures et personnes
 */

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc,
  updateDoc,
  query, 
  where, 
  writeBatch,
  serverTimestamp
} = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Organisation à traiter (par défaut: test)
const organizationId = process.argv[2] || '9LjkCJG04pEzbABdHkSf';
const isDryRun = process.argv.includes('--dry-run');

console.log('🔧 CORRECTION DE LA MIGRATION RELATIONNELLE');
console.log('==========================================\n');
console.log(`Organisation: ${organizationId}`);
console.log(`Mode: ${isDryRun ? 'SIMULATION' : 'PRODUCTION'}\n`);

async function main() {
  try {
    // 1. Analyser la situation actuelle
    console.log('📊 ANALYSE DE LA SITUATION ACTUELLE...\n');
    
    // Charger les données existantes
    const structuresSnap = await getDocs(query(collection(db, 'structures'), where('organizationId', '==', organizationId)));
    const personnesSnap = await getDocs(query(collection(db, 'personnes'), where('organizationId', '==', organizationId)));
    const liaisonsSnap = await getDocs(query(collection(db, 'liaisons'), where('organizationId', '==', organizationId)));
    const unifiedSnap = await getDocs(query(collection(db, 'contacts_unified'), where('organizationId', '==', organizationId)));
    
    console.log(`Structures existantes: ${structuresSnap.size}`);
    console.log(`Personnes existantes: ${personnesSnap.size}`);
    console.log(`Liaisons existantes: ${liaisonsSnap.size}`);
    console.log(`Contacts unifiés source: ${unifiedSnap.size}\n`);

    // 2. Corriger isPersonneLibre sur les personnes sans liaison
    console.log('🔄 CORRECTION DES PERSONNES LIBRES...\n');
    
    // Créer un set des personnes qui ont des liaisons
    const personnesAvecLiaisons = new Set();
    liaisonsSnap.forEach(doc => {
      const liaison = doc.data();
      if (liaison.actif !== false) {
        personnesAvecLiaisons.add(liaison.personneId);
      }
    });
    
    let personnesCorrigees = 0;
    const batch1 = writeBatch(db);
    let batchCount1 = 0;
    
    for (const personneDoc of personnesSnap.docs) {
      const personne = personneDoc.data();
      const shouldBeLibre = !personnesAvecLiaisons.has(personneDoc.id);
      
      if (personne.isPersonneLibre !== shouldBeLibre) {
        console.log(`- ${personne.prenom} ${personne.nom}: isPersonneLibre ${personne.isPersonneLibre} → ${shouldBeLibre}`);
        
        if (!isDryRun) {
          batch1.update(doc(db, 'personnes', personneDoc.id), {
            isPersonneLibre: shouldBeLibre,
            updatedAt: serverTimestamp()
          });
          batchCount1++;
          personnesCorrigees++;
          
          if (batchCount1 >= 400) {
            await batch1.commit();
            batchCount1 = 0;
          }
        }
      }
    }
    
    if (batchCount1 > 0 && !isDryRun) {
      await batch1.commit();
    }
    
    console.log(`\n✅ ${personnesCorrigees} personnes corrigées\n`);

    // 3. Créer les structures manquantes depuis contacts_unified
    console.log('🏢 CRÉATION DES STRUCTURES MANQUANTES...\n');
    
    const structuresExistantes = new Set();
    structuresSnap.forEach(doc => {
      const structure = doc.data();
      if (structure.siret) {
        structuresExistantes.add(structure.siret);
      }
    });
    
    let structuresCreees = 0;
    const nouvellesStructures = new Map(); // siret -> structureId
    
    for (const unifiedDoc of unifiedSnap.docs) {
      const unified = unifiedDoc.data();
      
      if (unified.entityType === 'structure' && unified.structure) {
        const structure = unified.structure;
        const siret = structure.siret;
        
        if (siret && !structuresExistantes.has(siret)) {
          const structureId = `structure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const structureData = {
            organizationId,
            raisonSociale: structure.raisonSociale || structure.nom || 'Structure sans nom',
            type: structure.type || 'autre',
            email: structure.email || '',
            telephone1: structure.telephone1 || '',
            telephone2: structure.telephone2 || '',
            fax: structure.fax || '',
            siteWeb: structure.siteWeb || '',
            adresse: structure.adresse?.adresse || '',
            codePostal: structure.adresse?.codePostal || structure.codePostal || '',
            ville: structure.adresse?.ville || structure.ville || '',
            departement: structure.departement || '',
            region: structure.region || '',
            pays: structure.adresse?.pays || structure.pays || 'France',
            siret: siret,
            tags: unified.qualification?.tags || unified.tags || [],
            notes: '',
            isClient: unified.client || false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            migrationNote: `Créée depuis ${unifiedDoc.id}`
          };
          
          console.log(`- Création structure: ${structureData.raisonSociale} (SIRET: ${siret})`);
          
          if (!isDryRun) {
            await setDoc(doc(db, 'structures', structureId), structureData);
            structuresCreees++;
          }
          
          nouvellesStructures.set(siret, structureId);
          structuresExistantes.add(siret);
        }
      }
    }
    
    console.log(`\n✅ ${structuresCreees} structures créées\n`);

    // 4. Créer les liaisons manquantes
    console.log('🔗 CRÉATION DES LIAISONS...\n');
    
    // Recharger les structures pour avoir les nouvelles
    const allStructuresSnap = await getDocs(query(collection(db, 'structures'), where('organizationId', '==', organizationId)));
    const structuresBySiret = new Map();
    allStructuresSnap.forEach(doc => {
      const structure = doc.data();
      if (structure.siret) {
        structuresBySiret.set(structure.siret, { id: doc.id, ...structure });
      }
    });
    
    // Créer un index des personnes par email
    const personnesByEmail = new Map();
    personnesSnap.forEach(doc => {
      const personne = doc.data();
      if (personne.email) {
        personnesByEmail.set(personne.email.toLowerCase(), { id: doc.id, ...personne });
      }
    });
    
    // Créer un index des personnes par nom complet
    const personnesByNom = new Map();
    personnesSnap.forEach(doc => {
      const personne = doc.data();
      const nomComplet = `${personne.prenom} ${personne.nom}`.toLowerCase().trim();
      personnesByNom.set(nomComplet, { id: doc.id, ...personne });
    });
    
    let liaisonsCreees = 0;
    const batch2 = writeBatch(db);
    let batchCount2 = 0;
    
    // Parcourir les contacts unifiés pour créer les liaisons
    for (const unifiedDoc of unifiedSnap.docs) {
      const unified = unifiedDoc.data();
      
      if (unified.entityType === 'structure' && unified.structure && unified.personnes) {
        const structure = unified.structure;
        const structureData = structuresBySiret.get(structure.siret);
        
        if (structureData) {
          // Créer les liaisons pour chaque personne
          for (const personneUnified of unified.personnes) {
            let personneData = null;
            
            // Chercher par email d'abord
            if (personneUnified.email || personneUnified.mailDirect) {
              const email = (personneUnified.email || personneUnified.mailDirect || '').toLowerCase();
              personneData = personnesByEmail.get(email);
            }
            
            // Si pas trouvé par email, chercher par nom
            if (!personneData && personneUnified.prenom && personneUnified.nom) {
              const nomComplet = `${personneUnified.prenom} ${personneUnified.nom}`.toLowerCase().trim();
              personneData = personnesByNom.get(nomComplet);
            }
            
            if (personneData && structureData) {
              // Vérifier si la liaison existe déjà
              const liaisonExistante = liaisonsSnap.docs.find(doc => {
                const l = doc.data();
                return l.structureId === structureData.id && l.personneId === personneData.id;
              });
              
              if (!liaisonExistante) {
                const liaisonId = `liaison_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const liaisonData = {
                  organizationId,
                  structureId: structureData.id,
                  personneId: personneData.id,
                  fonction: personneUnified.fonction || '',
                  actif: true,
                  prioritaire: false,
                  interesse: false,
                  dateDebut: serverTimestamp(),
                  notes: '',
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp()
                };
                
                console.log(`- Liaison: ${personneData.prenom} ${personneData.nom} ↔ ${structureData.raisonSociale}`);
                
                if (!isDryRun) {
                  batch2.set(doc(db, 'liaisons', liaisonId), liaisonData);
                  batchCount2++;
                  liaisonsCreees++;
                  
                  if (batchCount2 >= 400) {
                    await batch2.commit();
                    batchCount2 = 0;
                  }
                }
              }
            }
          }
        }
      }
    }
    
    if (batchCount2 > 0 && !isDryRun) {
      await batch2.commit();
    }
    
    console.log(`\n✅ ${liaisonsCreees} liaisons créées\n`);

    // 5. Résumé final
    console.log('📈 RÉSUMÉ DE LA CORRECTION');
    console.log('========================\n');
    console.log(`Personnes corrigées: ${personnesCorrigees}`);
    console.log(`Structures créées: ${structuresCreees}`);
    console.log(`Liaisons créées: ${liaisonsCreees}`);
    
    if (isDryRun) {
      console.log('\n⚠️  Mode simulation - aucune modification effectuée');
      console.log('Relancez sans --dry-run pour appliquer les corrections');
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  }
}

// Lancer le script
main();