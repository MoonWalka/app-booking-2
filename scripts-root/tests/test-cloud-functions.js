/**
 * Script de test direct des Cloud Functions
 * Test les fonctions déployées sans interface
 */

const axios = require('axios');

// URLs des Cloud Functions déployées
const BASE_URL = 'https://us-central1-app-booking-26571.cloudfunctions.net';

// Test 1: Envoi email unifié (devrait fallback sur SMTP car pas de Brevo configuré)
async function testUnifiedEmail() {
  try {
    console.log('🧪 Test sendUnifiedEmail (fallback SMTP)...');
    
    const emailData = {
      to: 'meltinrecordz@gmail.com',
      subject: 'Test Cloud Function - TourCraft',
      html: `
        <h2>✅ Test Cloud Function Réussi !</h2>
        <p>Cette email confirme que vos Cloud Functions TourCraft fonctionnent.</p>
        <p><strong>Service utilisé :</strong> Fallback SMTP (pas de Brevo configuré)</p>
        <p><strong>Timestamp :</strong> ${new Date().toISOString()}</p>
        <hr>
        <p><small>Envoyé via Cloud Function sendUnifiedEmail</small></p>
      `,
      userId: 'test-user',
      entrepriseId: 'test-org'
    };
    
    const response = await axios.post(`${BASE_URL}/sendUnifiedEmail`, emailData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ sendUnifiedEmail réussi !');
    console.log('📧 Résultat:', response.data);
    
  } catch (error) {
    console.error('❌ Erreur sendUnifiedEmail:', error.response?.data || error.message);
  }
}

// Test 2: Validation clé Brevo (devrait échouer avec clé bidon)
async function testBrevoValidation() {
  try {
    console.log('🔑 Test validateBrevoKey...');
    
    const response = await axios.post(`${BASE_URL}/validateBrevoKey`, {
      apiKey: 'xkeysib-fake-key-for-testing'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📝 Résultat validation:', response.data);
    
  } catch (error) {
    console.log('⚠️ Validation échouée (normal avec fausse clé):', error.response?.data?.error || error.message);
  }
}

// Test 3: Templates Brevo (devrait échouer sans vraie clé)
async function testBrevoTemplates() {
  try {
    console.log('🎨 Test getBrevoTemplates...');
    
    const response = await axios.post(`${BASE_URL}/getBrevoTemplates`, {
      apiKey: 'xkeysib-fake-key-for-testing'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📋 Templates trouvés:', response.data);
    
  } catch (error) {
    console.log('⚠️ Templates échoués (normal sans vraie clé):', error.response?.data?.error || error.message);
  }
}

// Lancement des tests
async function runAllTests() {
  console.log('🚀 Test des Cloud Functions TourCraft\n');
  
  await testUnifiedEmail();
  console.log('');
  
  await testBrevoValidation();
  console.log('');
  
  await testBrevoTemplates();
  
  console.log('\n✨ Tests terminés !');
  console.log('💡 Pour tester avec vraie clé Brevo, utilisez l\'interface TourCraft');
}

runAllTests().catch(console.error);