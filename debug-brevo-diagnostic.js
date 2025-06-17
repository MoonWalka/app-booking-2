/**
 * Script de diagnostic pour comparer API directe vs Cloud Functions Brevo
 * Identifie les différences dans le traitement des clés API
 */

const axios = require('axios');

// Configuration
const API_KEY = 'xkeysib-test-api-key-placeholder'; // Remplacer par vraie clé
const CLOUD_FUNCTION_URL = 'https://us-central1-app-booking-26571.cloudfunctions.net';

// Test 1: API Brevo directe
async function testDirectBrevoAPI(apiKey) {
  console.log('🔑 Test API Brevo directe...');
  console.log(`   Clé API (premiers 10 caractères): ${apiKey.substring(0, 10)}...`);
  
  try {
    const response = await axios.get('https://api.brevo.com/v3/account', {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'TourCraft-Debug/1.0'
      },
      timeout: 10000
    });
    
    console.log('✅ API directe réussie !');
    console.log(`   Compte: ${response.data.email}`);
    console.log(`   Plan: ${response.data.plan?.type || 'non spécifié'}`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers reçus:`, Object.keys(response.headers));
    
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers
    };
  } catch (error) {
    console.error('❌ API directe échouée:');
    console.error(`   Status: ${error.response?.status || 'N/A'}`);
    console.error(`   Message: ${error.response?.data?.message || error.message}`);
    console.error(`   Code: ${error.response?.data?.code || error.code}`);
    
    if (error.response?.headers) {
      console.error(`   Headers erreur:`, Object.keys(error.response.headers));
    }
    
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test 2: Cloud Function validation
async function testCloudFunctionValidation(apiKey) {
  console.log('☁️ Test Cloud Function validateBrevoKey...');
  console.log(`   Clé API (premiers 10 caractères): ${apiKey.substring(0, 10)}...`);
  
  try {
    const response = await axios.post(`${CLOUD_FUNCTION_URL}/validateBrevoKey`, {
      apiKey: apiKey
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TourCraft-Debug/1.0'
      },
      timeout: 30000
    });
    
    console.log('✅ Cloud Function réussie !');
    console.log(`   Résultat: ${JSON.stringify(response.data, null, 2)}`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error('❌ Cloud Function échouée:');
    console.error(`   Status: ${error.response?.status || 'N/A'}`);
    console.error(`   Message: ${error.response?.data?.message || error.message}`);
    console.error(`   Erreur: ${JSON.stringify(error.response?.data || error.message, null, 2)}`);
    
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test 3: Comparaison détaillée
async function compareResults(directResult, cloudResult) {
  console.log('\n📊 COMPARAISON DES RÉSULTATS');
  console.log('='.repeat(50));
  
  console.log('\n🔍 API Directe:');
  console.log(`   Succès: ${directResult.success}`);
  if (directResult.success) {
    console.log(`   Email compte: ${directResult.data?.email || 'N/A'}`);
    console.log(`   Plan: ${directResult.data?.plan?.type || 'N/A'}`);
  } else {
    console.log(`   Erreur: ${directResult.error?.message || directResult.error}`);
  }
  
  console.log('\n☁️ Cloud Function:');
  console.log(`   Succès: ${cloudResult.success}`);
  if (cloudResult.success) {
    console.log(`   Validation: ${cloudResult.data?.valid ? 'Valide' : 'Invalide'}`);
    console.log(`   Message: ${cloudResult.data?.message || 'N/A'}`);
  } else {
    console.log(`   Erreur: ${cloudResult.error?.message || cloudResult.error}`);
  }
  
  // Analyser les différences
  console.log('\n🔍 ANALYSE DES DIFFÉRENCES:');
  
  if (directResult.success && cloudResult.success) {
    if (cloudResult.data?.valid) {
      console.log('✅ COHÉRENT: Les deux méthodes indiquent une clé valide');
    } else {
      console.log('⚠️ INCOHÉRENT: API directe réussit mais Cloud Function dit invalide');
      console.log('   → Problème potentiel dans le traitement Cloud Function');
    }
  } else if (directResult.success && !cloudResult.success) {
    console.log('⚠️ PROBLÈME: API directe réussit mais Cloud Function échoue');
    console.log('   → Erreur probable dans la Cloud Function ou la transmission de la clé');
  } else if (!directResult.success && cloudResult.success) {
    console.log('⚠️ ÉTRANGE: API directe échoue mais Cloud Function réussit');
    console.log('   → Configuration ou traitement inhabituel');
  } else {
    console.log('❌ ÉCHEC GÉNÉRALISÉ: Les deux méthodes échouent');
    console.log('   → Clé API probablement invalide ou problème réseau');
  }
}

// Test 4: Analyse des en-têtes HTTP
async function analyzeHttpHeaders(apiKey) {
  console.log('\n🔍 ANALYSE DES EN-TÊTES HTTP');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get('https://api.brevo.com/v3/account', {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'TourCraft-Debug/1.0'
      },
      timeout: 10000
    });
    
    console.log('📤 En-têtes envoyés:');
    console.log(`   api-key: ${apiKey.substring(0, 10)}...`);
    console.log(`   Content-Type: application/json`);
    console.log(`   User-Agent: TourCraft-Debug/1.0`);
    
    console.log('\n📥 En-têtes reçus:');
    Object.entries(response.headers).forEach(([key, value]) => {
      if (key.toLowerCase().includes('rate') || 
          key.toLowerCase().includes('limit') || 
          key.toLowerCase().includes('auth') ||
          key.toLowerCase().includes('content')) {
        console.log(`   ${key}: ${value}`);
      }
    });
    
  } catch (error) {
    console.log(`❌ Impossible d'analyser les en-têtes: ${error.message}`);
  }
}

// Fonction principale
async function runDiagnostic() {
  console.log('🚀 DIAGNOSTIC BREVO - API DIRECTE vs CLOUD FUNCTIONS');
  console.log('='.repeat(60));
  
  if (API_KEY === 'xkeysib-test-api-key-placeholder') {
    console.error('❌ Veuillez remplacer API_KEY par votre vraie clé Brevo dans ce fichier');
    console.log('\n💡 Pour obtenir votre clé API:');
    console.log('   1. Connectez-vous à https://app.brevo.com');
    console.log('   2. Allez dans SMTP & API → API Keys');
    console.log('   3. Copiez votre clé v3-XXXXXXXX');
    return;
  }
  
  console.log(`\n🔑 Clé API testée: ${API_KEY.substring(0, 15)}...`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}\n`);
  
  // Test des en-têtes HTTP
  await analyzeHttpHeaders(API_KEY);
  
  // Test 1: API directe
  console.log('\n' + '='.repeat(30) + ' TEST 1 ' + '='.repeat(30));
  const directResult = await testDirectBrevoAPI(API_KEY);
  
  // Test 2: Cloud Function
  console.log('\n' + '='.repeat(30) + ' TEST 2 ' + '='.repeat(30));
  const cloudResult = await testCloudFunctionValidation(API_KEY);
  
  // Comparaison
  await compareResults(directResult, cloudResult);
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ Diagnostic terminé !');
  
  // Recommandations
  console.log('\n💡 RECOMMANDATIONS:');
  if (directResult.success && !cloudResult.success) {
    console.log('   → Vérifiez les logs de la Cloud Function validateBrevoKey');
    console.log('   → Contrôlez que la clé API arrive bien non-chiffrée');
    console.log('   → Testez avec firebase emulator pour debug local');
  } else if (!directResult.success) {
    console.log('   → Vérifiez que votre clé API est correcte et active');
    console.log('   → Contrôlez les limites de taux de votre compte Brevo');
  } else {
    console.log('   → Configuration semble correcte, problème ailleurs');
  }
}

// Lancement
runDiagnostic().catch(console.error);