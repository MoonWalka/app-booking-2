// Script de debug pour les contacts - À copier-coller dans la console du navigateur

// 1. Vérifier le nombre total de personnes et structures
console.log('=== DÉBUT DU DIAGNOSTIC CONTACTS ===');

// 2. Fonction pour analyser les données
function analyzeContacts() {
  // Récupérer le hook depuis React DevTools si possible
  const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  
  console.log('🔍 Recherche des données dans le DOM...');
  
  // Essayer de trouver les compteurs dans le DOM
  const counters = document.querySelectorAll('[class*="badge"], [class*="count"]');
  counters.forEach(el => {
    if (el.textContent.match(/\d+/)) {
      console.log('📊 Compteur trouvé:', el.textContent, el.className);
    }
  });
  
  // Chercher les onglets
  const tabs = document.querySelectorAll('[role="tab"], .nav-link');
  tabs.forEach(tab => {
    console.log('📑 Onglet:', tab.textContent.trim());
  });
  
  // Chercher les lignes du tableau
  const rows = document.querySelectorAll('tbody tr, [class*="row"]');
  console.log('📋 Nombre de lignes visibles:', rows.length);
}

// 3. Vérifier le cache
function checkCache() {
  console.log('💾 Vérification du cache...');
  
  // Si clearContactCache est disponible
  if (typeof clearContactCache !== 'undefined') {
    console.log('✅ Fonction clearContactCache disponible');
    console.log('Pour vider le cache, tapez: clearContactCache()');
  } else {
    console.log('❌ Fonction clearContactCache non disponible dans ce contexte');
  }
}

// 4. Analyser les filtres actifs
function checkFilters() {
  console.log('🔎 Recherche des filtres actifs...');
  
  // Chercher les inputs de recherche
  const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="Rechercher"]');
  searchInputs.forEach(input => {
    if (input.value) {
      console.log('🔍 Filtre de recherche actif:', input.value);
    }
  });
  
  // Chercher les checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  checkboxes.forEach(cb => {
    console.log('☑️ Checkbox active:', cb.name || cb.id || 'sans nom');
  });
}

// 5. Logs à ajouter dans useContactsRelational.js
console.log(`
📝 LOGS À AJOUTER dans useContactsRelational.js :

1. Après la ligne 142 (setPersonnes):
   console.log('👥 Personnes chargées:', personnesData.length, 'dont libres:', personnesData.filter(p => p.isPersonneLibre).length);

2. Après la ligne 78 (setStructures):
   console.log('🏢 Structures chargées:', structuresData.length);

3. Après la ligne 143 (setLiaisons):
   console.log('🔗 Liaisons chargées:', liaisonsData.length, 'dont actives:', liaisonsData.filter(l => l.actif !== false).length);

4. Dans ContactsList.js, après la ligne 144 (personnesLibres):
   console.log('👤 Personnes libres affichées:', personnesLibres.length);
   console.log('🏢 Structures affichées:', structuresWithPersonnes.length);
`);

// Exécuter les analyses
analyzeContacts();
checkCache();
checkFilters();

console.log('=== FIN DU DIAGNOSTIC ===');
console.log('💡 Copiez ces résultats et partagez-les pour analyse');