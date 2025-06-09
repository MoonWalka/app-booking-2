import React, { useState } from 'react';
import { db } from '@/services/firebase-service';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useOrganization } from '@/context/OrganizationContext';

const OrganizationIdFixer = () => {
  const { currentOrganization } = useOrganization();
  const [isFixing, setIsFixing] = useState(false);
  const [results, setResults] = useState(null);
  const [checking, setChecking] = useState(false);
  const [checkResults, setCheckResults] = useState(null);

  // Fonction pour vérifier l'état actuel
  const checkAllCollections = async () => {
    setChecking(true);
    console.log('🔍 VÉRIFICATION DE TOUTES LES COLLECTIONS');
    
    const collections = ['contacts', 'lieux', 'concerts', 'artistes', 'structures'];
    const results = {};
    
    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        let total = 0;
        let withoutOrg = 0;
        
        snapshot.docs.forEach(docSnapshot => {
          total++;
          const data = docSnapshot.data();
          if (!data.organizationId) {
            withoutOrg++;
          }
        });
        
        results[collectionName] = { total, withoutOrg };
        console.log(`📋 ${collectionName}: ${total} total, ${withoutOrg} sans organizationId`);
      } catch (error) {
        console.error(`❌ Erreur vérification ${collectionName}:`, error);
        results[collectionName] = { error: error.message };
      }
    }
    
    setCheckResults(results);
    setChecking(false);
  };

  // Fonction pour corriger une collection
  const fixCollection = async (collectionName) => {
    console.log(`🔧 Correction de la collection: ${collectionName}`);
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    let total = 0;
    let withoutOrg = 0;
    let fixed = 0;
    let errors = 0;
    
    for (const docSnapshot of snapshot.docs) {
      total++;
      const data = docSnapshot.data();
      
      if (!data.organizationId) {
        withoutOrg++;
        console.log(`📝 ${collectionName} sans organizationId: ${docSnapshot.id} - ${data.nom || data.titre || data.name || 'sans nom'}`);
        
        try {
          await updateDoc(doc(db, collectionName, docSnapshot.id), {
            organizationId: currentOrganization.id
          });
          fixed++;
          console.log(`✅ ${collectionName} corrigé: ${data.nom || data.titre || data.name || docSnapshot.id}`);
        } catch (error) {
          errors++;
          console.error(`❌ Erreur correction ${collectionName} ${docSnapshot.id}:`, error);
        }
      }
    }
    
    console.log(`📊 RÉSUMÉ ${collectionName.toUpperCase()}:`);
    console.log(`   Total: ${total}`);
    console.log(`   Sans organizationId: ${withoutOrg}`);
    console.log(`   Corrigés: ${fixed}`);
    console.log(`   Erreurs: ${errors}`);
    
    return { total, withoutOrg, fixed, errors };
  };

  // Fonction pour corriger toutes les collections
  const fixAllCollections = async () => {
    if (!currentOrganization?.id) {
      alert('Aucune organisation active trouvée !');
      return;
    }

    setIsFixing(true);
    console.log('🚀 DÉBUT DE LA CORRECTION MASSIVE');
    
    const collections = [
      'contacts',
      'lieux', 
      'concerts',
      'artistes',
      'structures',
      'contrats',
      'factures'
    ];
    
    const results = {};
    
    for (const collectionName of collections) {
      try {
        console.log(`\n🔧 ===== TRAITEMENT ${collectionName.toUpperCase()} =====`);
        results[collectionName] = await fixCollection(collectionName);
      } catch (error) {
        console.error(`❌ Erreur lors du traitement de ${collectionName}:`, error);
        results[collectionName] = { error: error.message };
      }
    }
    
    console.log('\n🎯 ===== RÉSUMÉ GLOBAL =====');
    let totalFixed = 0;
    for (const [collection, result] of Object.entries(results)) {
      if (result.fixed !== undefined) {
        console.log(`${collection}: ${result.fixed} documents corrigés`);
        totalFixed += result.fixed;
      } else {
        console.log(`${collection}: ERREUR - ${result.error}`);
      }
    }
    
    console.log(`\n✅ TOTAL: ${totalFixed} documents corrigés dans toutes les collections`);
    console.log('🔄 Rafraîchissez maintenant votre page (F5) pour voir les changements !');
    
    setResults(results);
    setIsFixing(false);
    
    // Auto-refresh après 3 secondes
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#fff', 
      border: '2px solid #e74c3c', 
      padding: '20px', 
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 9999,
      width: '400px',
      fontFamily: 'monospace'
    }}>
      <h3 style={{ color: '#e74c3c', margin: '0 0 15px 0' }}>
        🔧 ORGANIZATION ID FIXER
      </h3>
      
      {currentOrganization && (
        <p style={{ margin: '0 0 15px 0', fontSize: '12px' }}>
          <strong>Organisation:</strong> {currentOrganization.name} ({currentOrganization.id})
        </p>
      )}

      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={checkAllCollections}
          disabled={checking}
          style={{
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {checking ? '🔍 Vérification...' : '🔍 Vérifier l\'état'}
        </button>
        
        <button 
          onClick={fixAllCollections}
          disabled={isFixing || !currentOrganization}
          style={{
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {isFixing ? '🔧 Correction...' : '🔧 CORRIGER TOUT'}
        </button>
      </div>

      {checkResults && (
        <div style={{ 
          background: '#ecf0f1', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '15px',
          fontSize: '12px'
        }}>
          <strong>📊 État actuel:</strong>
          {Object.entries(checkResults).map(([collection, data]) => (
            <div key={collection}>
              {collection}: {data.total || 0} total, {data.withoutOrg || 0} sans organizationId
            </div>
          ))}
        </div>
      )}

      {results && (
        <div style={{ 
          background: '#d5f5d5', 
          padding: '10px', 
          borderRadius: '5px',
          fontSize: '12px'
        }}>
          <strong>✅ Résultats:</strong>
          {Object.entries(results).map(([collection, data]) => (
            <div key={collection}>
              {collection}: {data.fixed || 0} corrigés
            </div>
          ))}
          <p style={{ margin: '10px 0 0 0', fontWeight: 'bold' }}>
            🔄 Rechargement automatique dans 3s...
          </p>
        </div>
      )}

      <p style={{ fontSize: '10px', color: '#7f8c8d', margin: '15px 0 0 0' }}>
        Ce composant corrige automatiquement les organizationId manquants.
        Supprimez-le après utilisation !
      </p>
    </div>
  );
};

export default OrganizationIdFixer; 