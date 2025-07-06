import React, { useState } from 'react';
import { collection, getDocs, updateDoc, doc, query } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

export default function OrganizationIdFixer() {
  const { currentOrganization } = useOrganization();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fixResults, setFixResults] = useState(null);

  const runAutomaticFix = async () => {
    if (!currentOrganization?.id) {
      console.error('Pas d\'organisation actuelle');
      return;
    }

    setIsLoading(true);
    setFixResults(null);
    const fixLog = [];
    
    try {
      console.log('🔧 === CORRECTION AUTOMATIQUE ORGANIZATIONID ===');
      console.log(`Organization ID: ${currentOrganization.id}`);
      
      // 1. Corriger tous les contacts sans organizationId
      console.log('\n📝 Correction des contacts...');
      const allContactsQuery = query(collection(db, 'contacts'));
      const allContactsSnapshot = await getDocs(allContactsQuery);
      
      let contactsFixed = 0;
      const contactsToFix = [];
      
      allContactsSnapshot.forEach(docSnapshot => {
        const data = docSnapshot.data();
        if (!data.organizationId) {
          contactsToFix.push({
            id: docSnapshot.id,
            nom: `${data.prenom || ''} ${data.nom || 'Sans nom'}`.trim()
          });
        }
      });
      
      console.log(`Contacts à corriger: ${contactsToFix.length}`);
      fixLog.push(`Contacts à corriger: ${contactsToFix.length}`);
      
      // Corriger les contacts par batch
      for (const contact of contactsToFix) {
        try {
          await updateDoc(doc(db, 'contacts', contact.id), {
            organizationId: currentOrganization.id
          });
          contactsFixed++;
          console.log(`✅ Contact corrigé: ${contact.nom} (${contact.id})`);
          fixLog.push(`✅ Contact corrigé: ${contact.nom}`);
        } catch (error) {
          console.error(`❌ Erreur contact ${contact.id}:`, error);
          fixLog.push(`❌ Erreur contact ${contact.nom}: ${error.message}`);
        }
      }
      
      // 2. Corriger tous les lieux sans organizationId
      console.log('\n🏢 Correction des lieux...');
      const allLieuxQuery = query(collection(db, 'lieux'));
      const allLieuxSnapshot = await getDocs(allLieuxQuery);
      
      let lieuxFixed = 0;
      const lieuxToFix = [];
      
      allLieuxSnapshot.forEach(docSnapshot => {
        const data = docSnapshot.data();
        if (!data.organizationId) {
          lieuxToFix.push({
            id: docSnapshot.id,
            nom: data.nom || 'Sans nom'
          });
        }
      });
      
      console.log(`Lieux à corriger: ${lieuxToFix.length}`);
      fixLog.push(`Lieux à corriger: ${lieuxToFix.length}`);
      
      // Corriger les lieux par batch
      for (const lieu of lieuxToFix) {
        try {
          await updateDoc(doc(db, 'lieux', lieu.id), {
            organizationId: currentOrganization.id
          });
          lieuxFixed++;
          console.log(`✅ Lieu corrigé: ${lieu.nom} (${lieu.id})`);
          fixLog.push(`✅ Lieu corrigé: ${lieu.nom}`);
        } catch (error) {
          console.error(`❌ Erreur lieu ${lieu.id}:`, error);
          fixLog.push(`❌ Erreur lieu ${lieu.nom}: ${error.message}`);
        }
      }
      
      // 3. Optionnel : Corriger aussi les dates et structures si nécessaire
      console.log('\n🎵 Vérification des dates...');
      const allDatesQuery = query(collection(db, 'dates'));
      const allDatesSnapshot = await getDocs(allDatesQuery);
      
      let datesFixed = 0;
      const datesToFix = [];
      
      allDatesSnapshot.forEach(docSnapshot => {
        const data = docSnapshot.data();
        if (!data.organizationId) {
          datesToFix.push({
            id: docSnapshot.id,
            titre: data.titre || 'Sans titre'
          });
        }
      });
      
      console.log(`Dates à corriger: ${datesToFix.length}`);
      fixLog.push(`Dates à corriger: ${datesToFix.length}`);
      
      // Corriger les dates
      for (const date of datesToFix) {
        try {
          await updateDoc(doc(db, 'dates', date.id), {
            organizationId: currentOrganization.id
          });
          datesFixed++;
          console.log(`✅ Date corrigé: ${date.titre} (${date.id})`);
          fixLog.push(`✅ Date corrigé: ${date.titre}`);
        } catch (error) {
          console.error(`❌ Erreur date ${date.id}:`, error);
          fixLog.push(`❌ Erreur date ${date.titre}: ${error.message}`);
        }
      }
      
      // 4. Structures
      console.log('\n🏛️ Vérification des structures...');
      const allStructuresQuery = query(collection(db, 'structures'));
      const allStructuresSnapshot = await getDocs(allStructuresQuery);
      
      let structuresFixed = 0;
      const structuresToFix = [];
      
      allStructuresSnapshot.forEach(docSnapshot => {
        const data = docSnapshot.data();
        if (!data.organizationId) {
          structuresToFix.push({
            id: docSnapshot.id,
            nom: data.nom || 'Sans nom'
          });
        }
      });
      
      console.log(`Structures à corriger: ${structuresToFix.length}`);
      fixLog.push(`Structures à corriger: ${structuresToFix.length}`);
      
      // Corriger les structures
      for (const structure of structuresToFix) {
        try {
          await updateDoc(doc(db, 'structures', structure.id), {
            organizationId: currentOrganization.id
          });
          structuresFixed++;
          console.log(`✅ Structure corrigée: ${structure.nom} (${structure.id})`);
          fixLog.push(`✅ Structure corrigée: ${structure.nom}`);
        } catch (error) {
          console.error(`❌ Erreur structure ${structure.id}:`, error);
          fixLog.push(`❌ Erreur structure ${structure.nom}: ${error.message}`);
        }
      }
      
      const summary = {
        contacts: { total: contactsToFix.length, fixed: contactsFixed },
        lieux: { total: lieuxToFix.length, fixed: lieuxFixed },
        dates: { total: datesToFix.length, fixed: datesFixed },
        structures: { total: structuresToFix.length, fixed: structuresFixed }
      };
      
      console.log('\n🎯 === RÉSUMÉ DE LA CORRECTION ===');
      console.log(`Contacts: ${contactsFixed}/${contactsToFix.length} corrigés`);
      console.log(`Lieux: ${lieuxFixed}/${lieuxToFix.length} corrigés`);
      console.log(`Dates: ${datesFixed}/${datesToFix.length} corrigés`);
      console.log(`Structures: ${structuresFixed}/${structuresToFix.length} corrigés`);
      
      setFixResults(summary);
      setResults(fixLog);
      
    } catch (error) {
      console.error('Erreur lors de la correction automatique:', error);
      fixLog.push(`❌ Erreur générale: ${error.message}`);
      setResults(fixLog);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #28a745', margin: '20px' }}>
      <h2>🔧 Correcteur automatique OrganizationId</h2>
      <p>Organisation actuelle: {currentOrganization?.nom} ({currentOrganization?.id})</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runAutomaticFix}
          disabled={isLoading}
          style={{ 
            padding: '15px 30px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? '🔧 Correction en cours...' : '🚀 CORRIGER AUTOMATIQUEMENT TOUS LES ORGANIZATIONID'}
        </button>
      </div>

      {fixResults && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb',
          borderRadius: '5px'
        }}>
          <h3>📊 Résumé de la correction</h3>
          <p><strong>Contacts:</strong> {fixResults.contacts.fixed}/{fixResults.contacts.total} corrigés</p>
          <p><strong>Lieux:</strong> {fixResults.lieux.fixed}/{fixResults.lieux.total} corrigés</p>
          <p><strong>Dates:</strong> {fixResults.dates.fixed}/{fixResults.dates.total} corrigés</p>
          <p><strong>Structures:</strong> {fixResults.structures.fixed}/{fixResults.structures.total} corrigés</p>
          
          {(fixResults.contacts.fixed > 0 || fixResults.lieux.fixed > 0) && (
            <div style={{ marginTop: '15px' }}>
              <button 
                onClick={refreshPage}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                🔄 Recharger la page pour voir les changements
              </button>
            </div>
          )}
        </div>
      )}
      
      {results.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>📝 Log détaillé:</h3>
          <div style={{ 
            maxHeight: '300px', 
            overflow: 'auto',
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #dee2e6'
          }}>
            {results.map((result, index) => (
              <div 
                key={index}
                style={{ 
                  padding: '5px 0',
                  borderBottom: index < results.length - 1 ? '1px solid #eee' : 'none',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}
              >
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 