/**
 * Script de test direct de l'API Brevo - TEMPLATE
 * 
 * INSTRUCTIONS:
 * 1. Copiez ce fichier vers test-brevo-direct.js
 * 2. Remplacez VOTRE_CLE_API_ICI par votre vraie clé API
 * 3. Lancez: node test-brevo-direct.js
 * 
 * Note: test-brevo-direct.js est dans .gitignore pour protéger votre clé API
 */

const axios = require('axios');

// REMPLACEZ PAR VOTRE CLÉ API BREVO
const BREVO_API_KEY = 'VOTRE_CLE_API_ICI';

async function testBrevoConnection() {
  console.log('🔍 Test de connexion Brevo...\n');
  
  try {
    // 1. Test de validation de la clé API
    console.log('1️⃣ Test de validation de la clé API...');
    const accountResponse = await axios.get('https://api.brevo.com/v3/account', {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Clé API valide !');
    console.log('   Compte:', accountResponse.data.email);
    console.log('   Plan:', accountResponse.data.plan[0].type);
    console.log('');
    
    // 2. Récupération des templates
    console.log('2️⃣ Récupération des templates...');
    const templatesResponse = await axios.get('https://api.brevo.com/v3/smtp/templates', {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 50
      }
    });
    
    if (templatesResponse.data.templates && templatesResponse.data.templates.length > 0) {
      console.log(`✅ ${templatesResponse.data.templates.length} templates trouvés :\n`);
      
      templatesResponse.data.templates.forEach((template, index) => {
        console.log(`   ${index + 1}. ${template.name}`);
        console.log(`      ID: ${template.id}`);
        console.log(`      Type: ${template.type || 'Non spécifié'}`);
        console.log(`      Statut: ${template.status}`);
        console.log(`      Créé le: ${new Date(template.createdAt).toLocaleDateString('fr-FR')}`);
        console.log('');
      });
    } else {
      console.log('⚠️  Aucun template trouvé !');
      console.log('   Assurez-vous d\'avoir créé au moins un template dans Brevo.');
      console.log('   Allez sur https://app.brevo.com > Campaigns > Email templates');
    }
    
    // 3. Test d'envoi (optionnel)
    console.log('\n3️⃣ Information sur l\'envoi d\'emails :');
    console.log('   Pour tester l\'envoi, décommentez la section d\'envoi dans ce script');
    console.log('   et remplacez YOUR_EMAIL par votre adresse email.');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.error('\n⚠️  Clé API invalide ou non autorisée.');
      console.error('   Vérifiez votre clé API dans Brevo > SMTP & API > API Keys');
    } else if (error.response?.status === 403) {
      console.error('\n⚠️  Accès refusé. Vérifiez les permissions de votre clé API.');
    }
  }
}

// Section d'envoi de test (décommentez pour tester)
/*
async function testSendEmail() {
  const YOUR_EMAIL = 'votre@email.com'; // REMPLACEZ PAR VOTRE EMAIL
  
  try {
    console.log('\n4️⃣ Test d\'envoi d\'email...');
    
    const emailData = {
      sender: {
        name: "TourCraft Test",
        email: "noreply@tourcraft.app" // Assurez-vous que cet email est vérifié dans Brevo
      },
      to: [{
        email: YOUR_EMAIL,
        name: "Test User"
      }],
      subject: "Test Brevo - TourCraft",
      htmlContent: "<h1>Test réussi !</h1><p>Si vous voyez cet email, Brevo fonctionne correctement.</p>",
      textContent: "Test réussi ! Si vous voyez cet email, Brevo fonctionne correctement."
    };
    
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Email envoyé avec succès !');
    console.log('   Message ID:', response.data.messageId);
    
  } catch (error) {
    console.error('❌ Erreur envoi:', error.response?.data || error.message);
  }
}
*/

// Lancer le test
console.log('====================================');
console.log('TEST DE DIAGNOSTIC BREVO - TOURCRAFT');
console.log('====================================\n');

testBrevoConnection().then(() => {
  // Décommentez la ligne suivante pour tester l'envoi
  // testSendEmail();
});