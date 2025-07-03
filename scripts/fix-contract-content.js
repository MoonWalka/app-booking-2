#!/usr/bin/env node

/**
 * Script pour corriger les contrats qui ont encore l'ancien champ contratContenu
 * et les mettre à jour pour utiliser le nouveau système de templates avec variables
 */

const admin = require('firebase-admin');

// Configuration Firebase Admin SDK
if (!admin.apps.length) {
  // En mode émulateur ou local, utiliser des credentials factices
  if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_MODE === 'local') {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    admin.initializeApp({
      projectId: 'demo-project',
      credential: admin.credential.applicationDefault()
    });
    console.log('🔧 Configuration Firebase Admin (mode émulateur)');
  } else {
    // En production, utiliser les vraies credentials
    admin.initializeApp();
    console.log('🔧 Configuration Firebase Admin (mode production)');
  }
}

const db = admin.firestore();

async function analyzeContract(contractId) {
  try {
    console.log(`\n📄 Analyse du contrat ${contractId}...`);
    
    const contractDoc = await db.collection('contrats').doc(contractId).get();
    
    if (!contractDoc.exists) {
      console.log('❌ Contrat non trouvé');
      return;
    }
    
    const contractData = contractDoc.data();
    console.log('\n📊 Données du contrat :');
    console.log('- ID:', contractId);
    console.log('- ConcertId:', contractData.concertId);
    console.log('- TemplateId:', contractData.templateId);
    console.log('- Status:', contractData.status);
    console.log('- Date génération:', contractData.dateGeneration?.toDate?.() || 'Non définie');
    console.log('- A contratContenu:', !!contractData.contratContenu);
    console.log('- A templateSnapshot:', !!contractData.templateSnapshot);
    console.log('- A variables:', !!contractData.variables);
    
    if (contractData.contratContenu) {
      console.log('\n⚠️  Ce contrat utilise l\'ancien système (contratContenu)');
      console.log('Longueur du contenu:', contractData.contratContenu.length);
      
      // Vérifier si le contenu contient des variables non remplacées
      const oldVariablePattern = /\[nomProgrammateur\]|\[structureProgrammateur\]|\[adresseProgrammateur\]/g;
      const newVariablePattern = /\{contact_nom\}|\{contact_structure\}|\{contact_adresse\}/g;
      
      const oldVariables = contractData.contratContenu.match(oldVariablePattern) || [];
      const newVariables = contractData.contratContenu.match(newVariablePattern) || [];
      
      if (oldVariables.length > 0) {
        console.log('\n🔍 Variables anciennes trouvées:', oldVariables.length);
        console.log('Exemples:', oldVariables.slice(0, 5));
      }
      
      if (newVariables.length > 0) {
        console.log('\n🔍 Variables nouvelles trouvées:', newVariables.length);
        console.log('Exemples:', newVariables.slice(0, 5));
      }
    }
    
    if (contractData.templateSnapshot) {
      console.log('\n✅ Ce contrat a une snapshot du template');
      console.log('- Nom du template:', contractData.templateSnapshot.name);
      console.log('- Type:', contractData.templateSnapshot.type);
      console.log('- A bodyContent:', !!contractData.templateSnapshot.bodyContent);
    }
    
    if (contractData.variables) {
      console.log('\n📝 Variables sauvegardées:');
      const sampleVars = Object.entries(contractData.variables).slice(0, 10);
      sampleVars.forEach(([key, value]) => {
        console.log(`  - ${key}: ${value}`);
      });
      console.log(`  ... et ${Object.keys(contractData.variables).length - 10} autres variables`);
    }
    
    // Vérifier le template associé
    if (contractData.templateId) {
      console.log('\n🔍 Vérification du template associé...');
      const templateDoc = await db.collection('contratTemplates').doc(contractData.templateId).get();
      
      if (templateDoc.exists) {
        const templateData = templateDoc.data();
        console.log('✅ Template trouvé:', templateData.name);
        console.log('- A bodyContent:', !!templateData.bodyContent);
        console.log('- Type:', templateData.type);
      } else {
        console.log('❌ Template non trouvé');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

async function fixContract(contractId, options = {}) {
  try {
    console.log(`\n🔧 Correction du contrat ${contractId}...`);
    
    const contractRef = db.collection('contrats').doc(contractId);
    const contractDoc = await contractRef.get();
    
    if (!contractDoc.exists) {
      console.log('❌ Contrat non trouvé');
      return;
    }
    
    const contractData = contractDoc.data();
    
    if (!contractData.contratContenu) {
      console.log('✅ Ce contrat utilise déjà le nouveau système');
      return;
    }
    
    console.log('🔄 Suppression du champ contratContenu...');
    
    // Préparer la mise à jour
    const updates = {
      contratContenu: admin.firestore.FieldValue.delete(),
      dateModification: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Si on veut forcer la régénération
    if (options.forceRegenerate) {
      updates.pdfUrl = null;
      updates.status = 'brouillon';
      console.log('🔄 Réinitialisation du PDF et du statut');
    }
    
    if (options.dryRun) {
      console.log('🏃 Mode dry-run - Aucune modification effectuée');
      console.log('Updates qui seraient appliquées:', updates);
      return;
    }
    
    // Appliquer les mises à jour
    await contractRef.update(updates);
    
    console.log('✅ Contrat mis à jour avec succès');
    console.log('ℹ️  Le contrat utilisera maintenant le template avec les variables dynamiques');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  }
}

async function findContractsWithOldContent() {
  try {
    console.log('🔍 Recherche des contrats avec l\'ancien système...\n');
    
    const snapshot = await db.collection('contrats').get();
    const oldContracts = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.contratContenu) {
        oldContracts.push({
          id: doc.id,
          concertId: data.concertId,
          status: data.status,
          hasTemplateSnapshot: !!data.templateSnapshot,
          hasVariables: !!data.variables
        });
      }
    });
    
    console.log(`📊 Trouvé ${oldContracts.length} contrats avec contratContenu`);
    
    if (oldContracts.length > 0) {
      console.log('\nListe des contrats :');
      oldContracts.forEach((contract, index) => {
        console.log(`${index + 1}. ${contract.id}`);
        console.log(`   - Concert: ${contract.concertId}`);
        console.log(`   - Status: ${contract.status}`);
        console.log(`   - Template snapshot: ${contract.hasTemplateSnapshot ? '✅' : '❌'}`);
        console.log(`   - Variables: ${contract.hasVariables ? '✅' : '❌'}`);
      });
    }
    
    return oldContracts;
  } catch (error) {
    console.error('❌ Erreur:', error);
    return [];
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const contractId = args[1];
  
  console.log('🚀 Script de correction des contrats\n');
  
  switch (command) {
    case 'analyze':
      if (!contractId) {
        console.log('❌ Usage: node fix-contract-content.js analyze <contractId>');
        process.exit(1);
      }
      await analyzeContract(contractId);
      break;
      
    case 'fix':
      if (!contractId) {
        console.log('❌ Usage: node fix-contract-content.js fix <contractId> [--dry-run] [--force-regenerate]');
        process.exit(1);
      }
      const options = {
        dryRun: args.includes('--dry-run'),
        forceRegenerate: args.includes('--force-regenerate')
      };
      await fixContract(contractId, options);
      break;
      
    case 'find':
      await findContractsWithOldContent();
      break;
      
    case 'fix-all':
      const dryRun = args.includes('--dry-run');
      const forceRegenerate = args.includes('--force-regenerate');
      
      console.log('Mode:', dryRun ? 'DRY-RUN' : 'EXECUTION');
      console.log('Force regenerate:', forceRegenerate ? 'OUI' : 'NON');
      console.log('');
      
      const contracts = await findContractsWithOldContent();
      
      if (contracts.length > 0 && !dryRun) {
        console.log('\n⚠️  ATTENTION: Cette opération va modifier tous les contrats listés ci-dessus.');
        console.log('Appuyez sur Ctrl+C pour annuler ou attendez 5 secondes pour continuer...\n');
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        for (const contract of contracts) {
          await fixContract(contract.id, { dryRun, forceRegenerate });
        }
      }
      break;
      
    default:
      console.log('📖 Usage:');
      console.log('  node fix-contract-content.js analyze <contractId>  - Analyser un contrat');
      console.log('  node fix-contract-content.js fix <contractId> [options]  - Corriger un contrat');
      console.log('  node fix-contract-content.js find  - Trouver tous les contrats avec l\'ancien système');
      console.log('  node fix-contract-content.js fix-all [options]  - Corriger tous les contrats');
      console.log('\nOptions:');
      console.log('  --dry-run          - Simuler l\'opération sans modifier');
      console.log('  --force-regenerate - Forcer la régénération du PDF');
  }
  
  process.exit(0);
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});