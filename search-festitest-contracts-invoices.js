/**
 * Script pour rechercher les contrats et factures liés à festitest
 * Recherche dans les collections contrats, factures et leurs relations
 */

(async function searchFestitestContractsInvoices() {
  console.log('📄 === RECHERCHE CONTRATS & FACTURES FESTITEST ===');
  
  try {
    // Importer les services Firebase
    const { db, collection, query, where, getDocs, doc, getDoc } = await import('./src/services/firebase-service.js');
    const { getCurrentOrganization } = await import('./src/services/firebase-service.js');
    
    const currentOrgId = getCurrentOrganization();
    console.log('🏢 Organisation:', currentOrgId);
    
    const results = {
      contrats: [],
      factures: [],
      relatedConcerts: [],
      relatedContacts: [],
      relatedStructures: []
    };

    // Collections à rechercher
    const contractCollections = ['contrats'];
    const factureCollections = ['factures'];
    
    if (currentOrgId) {
      contractCollections.push(`contrats_org_${currentOrgId}`);
      factureCollections.push(`factures_org_${currentOrgId}`);
    }

    // Termes de recherche
    const searchTerms = ['festitest', 'Festitest', 'FESTITEST'];

    // 1. Rechercher dans les contrats
    console.log('\n📄 === RECHERCHE DANS LES CONTRATS ===');
    
    for (const collName of contractCollections) {
      try {
        console.log(`\n📋 Collection: ${collName}`);
        
        // Recherche par différents champs
        const contractFields = [
          'concertTitre',
          'concertNom', 
          'lieuNom',
          'artisteNom',
          'contactNom',
          'structureNom',
          'titre',
          'objet'
        ];
        
        for (const field of contractFields) {
          for (const term of searchTerms) {
            try {
              const q = query(
                collection(db, collName),
                where(field, '==', term)
              );
              const snapshot = await getDocs(q);
              
              if (!snapshot.empty) {
                console.log(`✅ ${snapshot.size} contrat(s) trouvé(s) pour ${field}="${term}"`);
                snapshot.forEach(docSnap => {
                  const data = { id: docSnap.id, _collection: collName, ...docSnap.data() };
                  results.contrats.push(data);
                  console.log('📄 Contrat trouvé:', {
                    id: data.id,
                    numero: data.numero,
                    concertId: data.concertId,
                    concertTitre: data.concertTitre,
                    statut: data.statut,
                    dateCreation: data.dateCreation,
                    montant: data.montant
                  });
                });
              }
            } catch (error) {
              if (!error.message.includes('No matching field')) {
                console.warn(`⚠️ Erreur recherche contrat ${field}:`, error.message);
              }
            }
          }
        }
        
        // Recherche par concertId si on a des concerts festitest
        if (window.festitestData && window.festitestData.festitest.concerts.length > 0) {
          console.log('\n🔗 Recherche contrats par concertId...');
          for (const concert of window.festitestData.festitest.concerts) {
            try {
              const q = query(
                collection(db, collName),
                where('concertId', '==', concert.id)
              );
              const snapshot = await getDocs(q);
              
              if (!snapshot.empty) {
                console.log(`✅ ${snapshot.size} contrat(s) pour concert ${concert.id}`);
                snapshot.forEach(docSnap => {
                  const data = { id: docSnap.id, _collection: collName, ...docSnap.data() };
                  results.contrats.push(data);
                });
              }
            } catch (error) {
              console.warn(`⚠️ Erreur recherche contrat par concertId:`, error.message);
            }
          }
        }
        
      } catch (collError) {
        console.warn(`⚠️ Collection ${collName} non accessible:`, collError.message);
      }
    }

    // 2. Rechercher dans les factures
    console.log('\n🧾 === RECHERCHE DANS LES FACTURES ===');
    
    for (const collName of factureCollections) {
      try {
        console.log(`\n📋 Collection: ${collName}`);
        
        // Recherche par différents champs
        const factureFields = [
          'concertTitre',
          'concertNom',
          'lieuNom', 
          'artisteNom',
          'contactNom',
          'structureNom',
          'objet',
          'description'
        ];
        
        for (const field of factureFields) {
          for (const term of searchTerms) {
            try {
              const q = query(
                collection(db, collName),
                where(field, '==', term)
              );
              const snapshot = await getDocs(q);
              
              if (!snapshot.empty) {
                console.log(`✅ ${snapshot.size} facture(s) trouvée(s) pour ${field}="${term}"`);
                snapshot.forEach(docSnap => {
                  const data = { id: docSnap.id, _collection: collName, ...docSnap.data() };
                  results.factures.push(data);
                  console.log('🧾 Facture trouvée:', {
                    id: data.id,
                    numero: data.numero,
                    concertId: data.concertId,
                    concertTitre: data.concertTitre,
                    statut: data.statut,
                    dateCreation: data.dateCreation,
                    montantTotal: data.montantTotal
                  });
                });
              }
            } catch (error) {
              if (!error.message.includes('No matching field')) {
                console.warn(`⚠️ Erreur recherche facture ${field}:`, error.message);
              }
            }
          }
        }
        
        // Recherche par concertId
        if (window.festitestData && window.festitestData.festitest.concerts.length > 0) {
          console.log('\n🔗 Recherche factures par concertId...');
          for (const concert of window.festitestData.festitest.concerts) {
            try {
              const q = query(
                collection(db, collName),
                where('concertId', '==', concert.id)
              );
              const snapshot = await getDocs(q);
              
              if (!snapshot.empty) {
                console.log(`✅ ${snapshot.size} facture(s) pour concert ${concert.id}`);
                snapshot.forEach(docSnap => {
                  const data = { id: docSnap.id, _collection: collName, ...docSnap.data() };
                  results.factures.push(data);
                });
              }
            } catch (error) {
              console.warn(`⚠️ Erreur recherche facture par concertId:`, error.message);
            }
          }
        }
        
      } catch (collError) {
        console.warn(`⚠️ Collection ${collName} non accessible:`, collError.message);
      }
    }

    // 3. Récupérer les données liées (concerts, contacts, structures)
    console.log('\n🔗 === RÉCUPÉRATION DES DONNÉES LIÉES ===');
    
    // Concerts liés
    const concertIds = [...new Set([
      ...results.contrats.filter(c => c.concertId).map(c => c.concertId),
      ...results.factures.filter(f => f.concertId).map(f => f.concertId)
    ])];
    
    for (const concertId of concertIds) {
      try {
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        if (concertDoc.exists()) {
          const concertData = { id: concertDoc.id, ...concertDoc.data() };
          results.relatedConcerts.push(concertData);
          console.log('🎵 Concert lié récupéré:', concertData.titre || concertId);
        }
      } catch (error) {
        console.warn(`⚠️ Erreur récupération concert ${concertId}:`, error.message);
      }
    }
    
    // Contacts liés
    const contactIds = [...new Set([
      ...results.contrats.filter(c => c.contactId).map(c => c.contactId),
      ...results.factures.filter(f => f.contactId).map(f => f.contactId)
    ])];
    
    for (const contactId of contactIds) {
      try {
        const contactDoc = await getDoc(doc(db, 'contacts', contactId));
        if (contactDoc.exists()) {
          const contactData = { id: contactDoc.id, ...contactDoc.data() };
          results.relatedContacts.push(contactData);
          console.log('👤 Contact lié récupéré:', contactData.nom || contactId);
        }
      } catch (error) {
        console.warn(`⚠️ Erreur récupération contact ${contactId}:`, error.message);
      }
    }
    
    // Structures liées
    const structureIds = [...new Set([
      ...results.contrats.filter(c => c.structureId).map(c => c.structureId),
      ...results.factures.filter(f => f.structureId).map(f => f.structureId)
    ])];
    
    for (const structureId of structureIds) {
      try {
        const structureDoc = await getDoc(doc(db, 'structures', structureId));
        if (structureDoc.exists()) {
          const structureData = { id: structureDoc.id, ...structureDoc.data() };
          results.relatedStructures.push(structureData);
          console.log('🏢 Structure liée récupérée:', structureData.nom || structureId);
        }
      } catch (error) {
        console.warn(`⚠️ Erreur récupération structure ${structureId}:`, error.message);
      }
    }

    // 4. Résumé détaillé
    console.log('\n🎉 === RÉSUMÉ CONTRATS & FACTURES ===');
    console.log(`📄 Contrats trouvés: ${results.contrats.length}`);
    console.log(`🧾 Factures trouvées: ${results.factures.length}`);
    console.log(`🎵 Concerts liés: ${results.relatedConcerts.length}`);
    console.log(`👤 Contacts liés: ${results.relatedContacts.length}`);
    console.log(`🏢 Structures liées: ${results.relatedStructures.length}`);
    
    if (results.contrats.length > 0) {
      console.log('\n📋 DÉTAILS DES CONTRATS:');
      results.contrats.forEach((contrat, index) => {
        console.log(`\n📄 Contrat #${index + 1}:`);
        console.log('  ID:', contrat.id);
        console.log('  Collection:', contrat._collection);
        console.log('  Numéro:', contrat.numero || 'N/A');
        console.log('  Concert ID:', contrat.concertId || 'N/A');
        console.log('  Concert Titre:', contrat.concertTitre || 'N/A');
        console.log('  Statut:', contrat.statut || 'N/A');
        console.log('  Date création:', contrat.dateCreation || 'N/A');
        console.log('  Montant:', contrat.montant || 'N/A');
        console.log('  Contact ID:', contrat.contactId || 'N/A');
        console.log('  Structure ID:', contrat.structureId || 'N/A');
        console.log('  Métadonnées complètes:', JSON.stringify(contrat, null, 2));
      });
    }
    
    if (results.factures.length > 0) {
      console.log('\n📋 DÉTAILS DES FACTURES:');
      results.factures.forEach((facture, index) => {
        console.log(`\n🧾 Facture #${index + 1}:`);
        console.log('  ID:', facture.id);
        console.log('  Collection:', facture._collection);
        console.log('  Numéro:', facture.numero || 'N/A');
        console.log('  Concert ID:', facture.concertId || 'N/A');
        console.log('  Concert Titre:', facture.concertTitre || 'N/A');
        console.log('  Statut:', facture.statut || 'N/A');
        console.log('  Date création:', facture.dateCreation || 'N/A');
        console.log('  Montant total:', facture.montantTotal || 'N/A');
        console.log('  Contact ID:', facture.contactId || 'N/A');
        console.log('  Structure ID:', facture.structureId || 'N/A');
        console.log('  Métadonnées complètes:', JSON.stringify(facture, null, 2));
      });
    }

    // Sauvegarder pour utilisation ultérieure
    window.festitestContractsData = results;
    console.log('\n💾 Données sauvegardées dans window.festitestContractsData');
    
    return results;
    
  } catch (error) {
    console.error('💥 Erreur lors de la recherche des contrats/factures:', error);
    throw error;
  }
})();