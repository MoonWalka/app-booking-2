import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

const ContactAssociationsDebug = () => {
  const [contacts, setContacts] = useState([]);
  const [setSelectedContact] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'programmateurs'));
        const contactsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setContacts(contactsData);
      } catch (error) {
        console.error('Erreur chargement contacts:', error);
      }
    };

    loadContacts();
  }, []);

  const analyzeContact = async (contact) => {
    setLoading(true);
    setSelectedContact(contact);
    
    try {
      const debug = {
        contact: contact,
        structure: null,
        lieux: [],
        concerts: [],
        errors: []
      };

      // Analyser la structure
      if (contact.structureId) {
        try {
          const structureDoc = await getDoc(doc(db, 'structures', contact.structureId));
          if (structureDoc.exists()) {
            debug.structure = { id: structureDoc.id, ...structureDoc.data() };
          } else {
            debug.errors.push(`Structure ${contact.structureId} introuvable`);
          }
        } catch (error) {
          debug.errors.push(`Erreur chargement structure: ${error.message}`);
        }
      }

      // Analyser les lieux
      if (contact.lieuxIds && contact.lieuxIds.length > 0) {
        try {
          const lieuxPromises = contact.lieuxIds.map(lieuId => {
            const id = typeof lieuId === 'object' ? lieuId.id : lieuId;
            return getDoc(doc(db, 'lieux', id)).then(doc => 
              doc.exists() ? { id: doc.id, ...doc.data() } : null
            );
          });
          debug.lieux = (await Promise.all(lieuxPromises)).filter(Boolean);
        } catch (error) {
          debug.errors.push(`Erreur chargement lieux: ${error.message}`);
        }
      } else {
        // Recherche inverse
        try {
          const lieuxQuery = query(
            collection(db, 'lieux'),
            where('programmateurId', '==', contact.id)
          );
          const snapshot = await getDocs(lieuxQuery);
          debug.lieux = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          debug.errors.push(`Erreur recherche lieux inverse: ${error.message}`);
        }
      }

      // Analyser les concerts
      try {
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('programmateurId', '==', contact.id)
        );
        const snapshot = await getDocs(concertsQuery);
        debug.concerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        debug.errors.push(`Erreur chargement concerts: ${error.message}`);
      }

      setDebugInfo(debug);
    } catch (error) {
      console.error('Erreur analyse contact:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>🔍 Debug Associations Contacts</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <select 
          onChange={(e) => {
            const contact = contacts.find(c => c.id === e.target.value);
            if (contact) analyzeContact(contact);
          }}
          defaultValue=""
          style={{ padding: '8px', minWidth: '300px' }}
        >
          <option value="">Sélectionner un contact à analyser...</option>
          {contacts.map(contact => (
            <option key={contact.id} value={contact.id}>
              {contact.contact?.nom || contact.nom || 'Sans nom'} ({contact.id})
            </option>
          ))}
        </select>
      </div>

      {loading && <div>⏳ Analyse en cours...</div>}

      {debugInfo && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Données brutes */}
          <div>
            <h3>📋 Données brutes</h3>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              {JSON.stringify(debugInfo.contact, null, 2)}
            </pre>
          </div>

          {/* Résultats analyse */}
          <div>
            <h3>🎯 Résultats analyse</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <h4>🏢 Structure</h4>
              {debugInfo.structure ? (
                <div style={{ background: '#e8f5e8', padding: '10px', borderRadius: '4px' }}>
                  <strong>{debugInfo.structure.raisonSociale || debugInfo.structure.nom}</strong><br/>
                  Type: {debugInfo.structure.type || 'Non défini'}<br/>
                  Ville: {debugInfo.structure.ville || 'Non définie'}
                </div>
              ) : (
                <div style={{ background: '#ffe8e8', padding: '10px', borderRadius: '4px' }}>
                  Aucune structure trouvée
                </div>
              )}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <h4>🗺️ Lieux ({debugInfo.lieux.length})</h4>
              {debugInfo.lieux.length > 0 ? (
                debugInfo.lieux.map(lieu => (
                  <div key={lieu.id} style={{ background: '#e8f5e8', padding: '8px', margin: '4px 0', borderRadius: '4px' }}>
                    <strong>{lieu.nom}</strong><br/>
                    {lieu.ville && <span>📍 {lieu.ville}</span>}
                  </div>
                ))
              ) : (
                <div style={{ background: '#ffe8e8', padding: '10px', borderRadius: '4px' }}>
                  Aucun lieu trouvé
                </div>
              )}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <h4>🎵 Concerts ({debugInfo.concerts.length})</h4>
              {debugInfo.concerts.length > 0 ? (
                debugInfo.concerts.map(concert => (
                  <div key={concert.id} style={{ background: '#e8f5e8', padding: '8px', margin: '4px 0', borderRadius: '4px' }}>
                    <strong>{concert.titre || 'Sans titre'}</strong><br/>
                    {concert.date && <span>📅 {new Date(concert.date).toLocaleDateString()}</span>}
                  </div>
                ))
              ) : (
                <div style={{ background: '#ffe8e8', padding: '10px', borderRadius: '4px' }}>
                  Aucun concert trouvé
                </div>
              )}
            </div>

            {debugInfo.errors.length > 0 && (
              <div>
                <h4>❌ Erreurs</h4>
                {debugInfo.errors.map((error, index) => (
                  <div key={index} style={{ background: '#ffe8e8', padding: '8px', margin: '4px 0', borderRadius: '4px' }}>
                    {error}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactAssociationsDebug;