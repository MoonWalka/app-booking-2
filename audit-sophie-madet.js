// SCRIPT À EXÉCUTER DANS LA CONSOLE DU NAVIGATEUR
// Pour analyser spécifiquement le problème avec Sophie Madet

(async function auditSophieMadet() {
  console.log('🔍 AUDIT SPÉCIFIQUE: Sophie Madet');
  console.log('=================================');
  
  // Vérifier que Firebase est disponible
  if (typeof window === 'undefined' || !window.db) {
    console.error('❌ Firebase non disponible. Assurez-vous d\'être connecté à l\'application.');
    return;
  }
  
  const { collection, getDocs, query, where, orderBy, limit } = window;
  const db = window.db;
  
  try {
    console.log('\n1. RECHERCHE DANS CONTACTS_UNIFIED');
    console.log('====================================');
    
    // 1. Chercher Sophie Madet dans contacts_unified
    const unifiedQuery = query(
      collection(db, 'contacts_unified'),
      where('personne.nom', '==', 'Madet')
    );
    const unifiedSnapshot = await getDocs(unifiedQuery);
    
    console.log(`Nombre de documents trouvés: ${unifiedSnapshot.size}`);
    
    let sophieUnified = null;
    unifiedSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Document ID: ${doc.id}`);
      console.log('Données:', data);
      
      if (data.personne?.prenom === 'Sophie') {
        sophieUnified = { id: doc.id, ...data };
        console.log('✅ Sophie Madet trouvée dans contacts_unified:', sophieUnified);
      }
    });
    
    if (!sophieUnified) {
      console.log('❌ Sophie Madet NON trouvée dans contacts_unified');
    }
    
    console.log('\n2. RECHERCHE DANS CONTACTS (ANCIENNE COLLECTION)');
    console.log('=================================================');
    
    // 2. Chercher Sophie Madet dans la collection contacts
    const contactsQuery = query(
      collection(db, 'contacts'),
      where('nom', '==', 'Madet')
    );
    const contactsSnapshot = await getDocs(contactsQuery);
    
    console.log(`Nombre de documents trouvés: ${contactsSnapshot.size}`);
    
    let sophieContacts = null;
    contactsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Document ID: ${doc.id}`);
      console.log('Données:', data);
      
      if (data.prenom === 'Sophie') {
        sophieContacts = { id: doc.id, ...data };
        console.log('✅ Sophie Madet trouvée dans contacts:', sophieContacts);
      }
    });
    
    if (!sophieContacts) {
      console.log('❌ Sophie Madet NON trouvée dans contacts');
    }
    
    console.log('\n3. RECHERCHE DANS PERSONNE_LIBRE');
    console.log('=================================');
    
    // 3. Chercher Sophie Madet dans personne_libre
    const personnesQuery = query(
      collection(db, 'personne_libre'),
      where('nom', '==', 'Madet')
    );
    const personnesSnapshot = await getDocs(personnesQuery);
    
    console.log(`Nombre de documents trouvés: ${personnesSnapshot.size}`);
    
    let sophiePersonnes = null;
    personnesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Document ID: ${doc.id}`);
      console.log('Données:', data);
      
      if (data.prenom === 'Sophie') {
        sophiePersonnes = { id: doc.id, ...data };
        console.log('✅ Sophie Madet trouvée dans personne_libre:', sophiePersonnes);
      }
    });
    
    if (!sophiePersonnes) {
      console.log('❌ Sophie Madet NON trouvée dans personne_libre');
    }
    
    console.log('\n4. RECHERCHE PAR EMAIL');
    console.log('=======================');
    
    const email = 'sophie@assmadet.fr';
    
    // Recherche par email dans contacts_unified
    const unifiedEmailQuery = query(
      collection(db, 'contacts_unified'),
      where('personne.email', '==', email)
    );
    const unifiedEmailSnapshot = await getDocs(unifiedEmailQuery);
    console.log(`contacts_unified avec email ${email}: ${unifiedEmailSnapshot.size} documents`);
    
    // Recherche par email dans contacts
    const contactsEmailQuery = query(
      collection(db, 'contacts'),
      where('email', '==', email)
    );
    const contactsEmailSnapshot = await getDocs(contactsEmailQuery);
    console.log(`contacts avec email ${email}: ${contactsEmailSnapshot.size} documents`);
    
    // Recherche par email dans personne_libre
    const personnesEmailQuery = query(
      collection(db, 'personne_libre'),
      where('email', '==', email)
    );
    const personnesEmailSnapshot = await getDocs(personnesEmailQuery);
    console.log(`personne_libre avec email ${email}: ${personnesEmailSnapshot.size} documents`);
    
    console.log('\n5. SIMULATION LOGIQUE AssociatePersonModal');
    console.log('==========================================');
    
    // Simuler exactement ce que fait AssociatePersonModal
    const personnesRef = collection(db, 'contacts_unified');
    const q = query(personnesRef, limit(50)); // Même logique que la modal
    
    const snapshot = await getDocs(q);
    const personnesData = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Nouveau format unifié
      if (data.personne && (data.personne.nom || data.personne.prenom)) {
        personnesData.push({
          id: doc.id,
          nom: `${data.personne.prenom || ''} ${data.personne.nom || ''}`.trim(),
          prenom: data.personne.prenom || '',
          nomFamille: data.personne.nom || '',
          fonction: data.personne.fonction || '',
          email: data.personne.email || '',
          telephone: data.personne.telephone || data.personne.mobile || '',
          ...data
        });
      }
      // Ancien format (partiellement migré) - personne libre
      else if ((data.type === 'personne' || data.type === 'mixte') && 
               (data.nom || data.prenom)) {
        personnesData.push({
          id: doc.id,
          nom: `${data.prenom || ''} ${data.nom || ''}`.trim(),
          prenom: data.prenom || '',
          nomFamille: data.nom || '',
          fonction: data.fonction || '',
          email: data.email || data.mailDirect || '',
          telephone: data.telephone || data.mobile || data.telDirect || '',
          ...data
        });
      }
    });
    
    console.log(`Total personnes chargées par AssociatePersonModal: ${personnesData.length}`);
    
    // Chercher Sophie dans les résultats
    const sophieInModal = personnesData.find(p => 
      p.nomFamille === 'Madet' && p.prenom === 'Sophie'
    );
    
    if (sophieInModal) {
      console.log('✅ Sophie Madet TROUVÉE dans la logique d\'AssociatePersonModal:', sophieInModal);
    } else {
      console.log('❌ Sophie Madet NON TROUVÉE dans la logique d\'AssociatePersonModal');
      
      // Analyser pourquoi
      const madetPersonnes = personnesData.filter(p => p.nomFamille === 'Madet');
      console.log(`Personnes avec nom "Madet" trouvées: ${madetPersonnes.length}`, madetPersonnes);
    }
    
    console.log('\n6. SIMULATION LOGIQUE useContactSearch');
    console.log('======================================');
    
    // Simuler exactement ce que fait useContactSearch
    const contactsQuery2 = query(collection(db, 'contacts'));
    const contactsSnapshot2 = await getDocs(contactsQuery2);
    const contactsFromHook = [];
    
    contactsSnapshot2.forEach(doc => {
      const data = doc.data();
      contactsFromHook.push({
        id: doc.id,
        ...data,
        displayName: data.nom ? 
          `${data.prenom || ''} ${data.nom}` : 
          'Contact sans nom',
        fullName: `${data.prenom || ''} ${data.nom || ''}`
      });
    });
    
    console.log(`Total contacts chargés par useContactSearch: ${contactsFromHook.length}`);
    
    const sophieInContactSearch = contactsFromHook.find(c => 
      c.nom === 'Madet' && c.prenom === 'Sophie'
    );
    
    if (sophieInContactSearch) {
      console.log('✅ Sophie Madet TROUVÉE dans useContactSearch:', sophieInContactSearch);
    } else {
      console.log('❌ Sophie Madet NON TROUVÉE dans useContactSearch');
      
      const madetContacts = contactsFromHook.filter(c => c.nom === 'Madet');
      console.log(`Contacts avec nom "Madet" trouvés: ${madetContacts.length}`, madetContacts);
    }
    
    console.log('\n7. RÉSUMÉ ET DIAGNOSTIC');
    console.log('========================');
    
    const summary = {
      contacts_unified: !!sophieUnified,
      contacts: !!sophieContacts,
      personne_libre: !!sophiePersonnes,
      associatePersonModal: !!sophieInModal,
      useContactSearch: !!sophieInContactSearch
    };
    
    console.log('Sophie Madet trouvée dans:');
    console.table(summary);
    
    if (!sophieInModal && !sophieInContactSearch) {
      console.log('\n🚨 PROBLÈME IDENTIFIÉ:');
      console.log('Sophie Madet n\'apparaît dans aucune interface utilisateur');
      
      if (sophieUnified || sophieContacts || sophiePersonnes) {
        console.log('Mais elle existe dans au moins une collection Firebase');
        console.log('DIAGNOSTIC: Problème de logique de chargement/filtrage');
      } else {
        console.log('Et elle n\'existe dans aucune collection Firebase');
        console.log('DIAGNOSTIC: Données manquantes ou supprimées');
      }
    }
    
    return {
      unified: sophieUnified,
      contacts: sophieContacts,
      personnes: sophiePersonnes,
      modalData: sophieInModal,
      searchData: sophieInContactSearch,
      summary
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error);
  }
})();