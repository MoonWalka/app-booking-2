/**
 * Script de debug pour vérifier les données entreprise dans Firebase
 * Usage: node debug-enterprise-data.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./tourcraft-d1e1a-firebase-adminsdk-1bnxe-7bb8b00b3f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function debugEnterpriseData() {
  console.log('=== DEBUG ENTERPRISE DATA ===\n');
  
  try {
    // 1. Lister toutes les organizations
    console.log('1. LISTING ALL ORGANIZATIONS:');
    const orgsSnapshot = await db.collection('organizations').get();
    const organizations = [];
    
    orgsSnapshot.forEach(doc => {
      const data = doc.data();
      organizations.push({
        id: doc.id,
        name: data.name || 'Unknown'
      });
      console.log(`   - ${doc.id}: ${data.name || 'Unknown'}`);
    });
    
    console.log('\n2. CHECKING ENTERPRISE DATA FOR EACH ORGANIZATION:');
    
    for (const org of organizations) {
      console.log(`\n   Organization: ${org.name} (${org.id})`);
      console.log('   ' + '-'.repeat(50));
      
      // Check path 1: organizations/{id}/settings/entreprise
      try {
        const settingsEntrepriseRef = db.collection('organizations').doc(org.id)
          .collection('settings').doc('entreprise');
        const settingsEntrepriseDoc = await settingsEntrepriseRef.get();
        
        if (settingsEntrepriseDoc.exists()) {
          console.log('   ✓ Found in organizations/{id}/settings/entreprise');
          const data = settingsEntrepriseDoc.data();
          console.log('     - Nom:', data.nom || 'N/A');
          console.log('     - Adresse:', data.adresse || 'N/A');
          console.log('     - Ville:', data.ville || 'N/A');
          console.log('     - SIRET:', data.siret || 'N/A');
        } else {
          console.log('   ✗ Not found in organizations/{id}/settings/entreprise');
        }
      } catch (error) {
        console.log('   ✗ Error checking settings/entreprise:', error.message);
      }
      
      // Check path 2: organizations/{id}/parametres/settings
      try {
        const parametresSettingsRef = db.collection('organizations').doc(org.id)
          .collection('parametres').doc('settings');
        const parametresSettingsDoc = await parametresSettingsRef.get();
        
        if (parametresSettingsDoc.exists()) {
          const data = parametresSettingsDoc.data();
          if (data.entreprise) {
            console.log('   ✓ Found in organizations/{id}/parametres/settings.entreprise');
            console.log('     - Nom:', data.entreprise.nom || 'N/A');
            console.log('     - Adresse:', data.entreprise.adresse || 'N/A');
            console.log('     - Ville:', data.entreprise.ville || 'N/A');
            console.log('     - SIRET:', data.entreprise.siret || 'N/A');
          } else {
            console.log('   ✗ No entreprise field in parametres/settings');
          }
        } else {
          console.log('   ✗ Not found in organizations/{id}/parametres/settings');
        }
      } catch (error) {
        console.log('   ✗ Error checking parametres/settings:', error.message);
      }
      
      // Check path 3: collaborationConfig/{id}
      try {
        const collaborationConfigRef = db.collection('collaborationConfig').doc(org.id);
        const collaborationConfigDoc = await collaborationConfigRef.get();
        
        if (collaborationConfigDoc.exists()) {
          const data = collaborationConfigDoc.data();
          if (data.entreprises && Array.isArray(data.entreprises)) {
            console.log(`   ✓ Found ${data.entreprises.length} entreprises in collaborationConfig`);
            data.entreprises.forEach((ent, idx) => {
              console.log(`     - Entreprise ${idx + 1}: ${ent.raisonSociale || 'N/A'}`);
            });
          } else if (data.entreprise) {
            console.log('   ✓ Found entreprise object in collaborationConfig');
            console.log('     - Nom:', data.entreprise.nomEntreprise || 'N/A');
          } else {
            console.log('   ✗ No entreprise data in collaborationConfig');
          }
        } else {
          console.log('   ✗ Not found in collaborationConfig');
        }
      } catch (error) {
        console.log('   ✗ Error checking collaborationConfig:', error.message);
      }
      
      // Check old path: parametres/{orgId}
      try {
        const oldParametresRef = db.collection('parametres').doc(org.id);
        const oldParametresDoc = await oldParametresRef.get();
        
        if (oldParametresDoc.exists()) {
          const data = oldParametresDoc.data();
          if (data.entreprise) {
            console.log('   ⚠️  Found in OLD path parametres/{id}.entreprise (legacy)');
            console.log('     - Nom:', data.entreprise.nom || 'N/A');
          }
        }
      } catch (error) {
        console.log('   ✗ Error checking old parametres path:', error.message);
      }
    }
    
    console.log('\n3. RECOMMENDATIONS:');
    console.log('   - Primary path should be: organizations/{id}/settings/entreprise');
    console.log('   - Secondary path: organizations/{id}/parametres/settings.entreprise');
    console.log('   - For multiple companies: collaborationConfig/{id}.entreprises[]');
    console.log('   - Update ContratGeneratorNew to check these paths in order');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('\n=== END DEBUG ===');
    process.exit(0);
  }
}

// Run the debug
debugEnterpriseData();