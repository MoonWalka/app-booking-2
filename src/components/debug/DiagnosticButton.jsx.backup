import React, { useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

const DiagnosticButton = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runDiagnostic = async () => {
    setLoading(true);
    const diagnosticResults = [];
    
    try {
      diagnosticResults.push('🔍 DIAGNOSTIC ASSOCIATIONS CONTACT ↔ LIEU');
      diagnosticResults.push('='.repeat(50));
      
      // Récupérer les données
      const contactsSnapshot = await getDocs(collection(db, 'programmateurs'));
      const contacts = contactsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
      const lieux = lieuxSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      diagnosticResults.push(`✅ ${contacts.length} contacts et ${lieux.length} lieux récupérés`);

      // Analyser le contact spécifique
      const contactProblematique = contacts.find(c => c.id === 'DCzhj9kzMerwapji2jvk');
      if (contactProblematique) {
        diagnosticResults.push('\n👤 CONTACT PROBLÉMATIQUE ANALYSÉ:');
        diagnosticResults.push(`Contact ID: ${contactProblematique.id}`);
        diagnosticResults.push(`Nom: ${contactProblematique.contact?.nom || contactProblematique.nom}`);
        diagnosticResults.push(`Structure ID: ${contactProblematique.structureId}`);
        diagnosticResults.push(`Lieux IDs: ${JSON.stringify(contactProblematique.lieuxIds || 'AUCUN')}`);
        diagnosticResults.push(`Lieux Associés: ${JSON.stringify(contactProblematique.lieuxAssocies || 'AUCUN')}`);
        
        // Chercher les lieux qui référencent ce contact
        const lieuxQuiLeReferencent = lieux.filter(lieu => {
          return lieu.programmateurId === contactProblematique.id ||
                 (lieu.programmateursAssocies && lieu.programmateursAssocies.some(ref => {
                   const id = typeof ref === 'object' ? ref.id : ref;
                   return id === contactProblematique.id;
                 }));
        });
        
        diagnosticResults.push('\n🗺️ LIEUX QUI RÉFÉRENCENT CE CONTACT:');
        if (lieuxQuiLeReferencent.length === 0) {
          diagnosticResults.push('❌ Aucun lieu ne référence ce contact');
        } else {
          lieuxQuiLeReferencent.forEach(lieu => {
            diagnosticResults.push(`✅ ${lieu.nom} (${lieu.id})`);
            diagnosticResults.push(`   - Via programmateurId: ${lieu.programmateurId === contactProblematique.id ? 'OUI' : 'NON'}`);
            diagnosticResults.push(`   - Via programmateursAssocies: ${lieu.programmateursAssocies ? 'OUI' : 'NON'}`);
          });
          
          const lieuxIds = lieuxQuiLeReferencent.map(lieu => lieu.id);
          diagnosticResults.push('\n🔧 SOLUTION:');
          diagnosticResults.push(`Le contact devrait avoir ces lieuxIds: ${JSON.stringify(lieuxIds)}`);
          
          // Proposer la correction automatique
          diagnosticResults.push('\n💡 CORRECTION AUTOMATIQUE DISPONIBLE');
          diagnosticResults.push('Cliquez sur "Corriger automatiquement" pour appliquer la solution.');
          
          // Sauvegarder les IDs pour la correction
          window.tempDiagnosticData = {
            contactId: contactProblematique.id,
            lieuxIds: lieuxIds
          };
        }
      } else {
        diagnosticResults.push('❌ Contact DCzhj9kzMerwapji2jvk non trouvé');
      }

    } catch (error) {
      diagnosticResults.push(`❌ Erreur: ${error.message}`);
    }
    
    setResults(diagnosticResults);
    setLoading(false);
  };

  const applyFix = async () => {
    if (!window.tempDiagnosticData) {
      alert('Aucune correction disponible. Lancez d\'abord le diagnostic.');
      return;
    }

    try {
      const { contactId, lieuxIds } = window.tempDiagnosticData;
      await updateDoc(doc(db, 'programmateurs', contactId), {
        lieuxIds: lieuxIds
      });
      
      alert(`✅ Contact ${contactId} mis à jour avec ${lieuxIds.length} lieu(x) associé(s)!`);
      
      // Recharger la page pour voir les changements
      window.location.reload();
      
    } catch (error) {
      alert(`❌ Erreur lors de la correction: ${error.message}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 9999,
      background: 'white',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1e40af' }}>🔍 Diagnostic Contact ↔ Lieu</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={runDiagnostic}
          disabled={loading}
          style={{
            background: loading ? '#ccc' : '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? '⏳ Analyse...' : '🚀 Lancer diagnostic'}
        </button>
        
        {window.tempDiagnosticData && (
          <button
            onClick={applyFix}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ✨ Corriger automatiquement
          </button>
        )}
      </div>

      {results && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          padding: '10px',
          fontSize: '12px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-line',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {results.join('\n')}
        </div>
      )}
      
      <button
        onClick={() => {
          const button = document.getElementById('diagnostic-button-container');
          if (button) button.remove();
        }}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '25px',
          height: '25px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default DiagnosticButton;