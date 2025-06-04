import React, { useState, useEffect } from 'react';
import { collection, getDocs, db } from '@/services/firebase-service';

/**
 * Debug pour vérifier l'état de la migration programmateur → contact
 */
const ContactMigrationDebug = () => {
  const [data, setData] = useState({ contacts: [], programmateurs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMigrationState = async () => {
      try {
        // Vérifier les contacts
        const contactsSnapshot = await getDocs(collection(db, 'contacts'));
        const contacts = [];
        contactsSnapshot.forEach(doc => {
          contacts.push({ id: doc.id, ...doc.data() });
        });

        // Vérifier s'il reste des programmateurs
        let programmateurs = [];
        try {
          const programmateurSnapshot = await getDocs(collection(db, 'programmateurs'));
          programmateurSnapshot.forEach(doc => {
            programmateurs.push({ id: doc.id, ...doc.data() });
          });
        } catch (err) {
          console.log('Collection programmateurs n\'existe pas (normal après migration)');
        }

        setData({ contacts, programmateurs });
        setLoading(false);
      } catch (err) {
        console.error('Erreur debug migration:', err);
        setLoading(false);
      }
    };

    checkMigrationState();
  }, []);

  if (loading) return <div>🔄 Vérification état migration...</div>;

  return (
    <div style={{ padding: '20px', border: '2px solid #blue', margin: '10px', backgroundColor: '#f0f8ff' }}>
      <h3>🔍 DEBUG MIGRATION PROGRAMMATEUR → CONTACT</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h4>📋 CONTACTS ({data.contacts.length})</h4>
          {data.contacts.length > 0 ? (
            <ul>
              {data.contacts.slice(0, 3).map(contact => (
                <li key={contact.id}>
                  <strong>{contact.nom}</strong> - {contact.email || 'pas d\'email'}
                </li>
              ))}
              {data.contacts.length > 3 && <li>... et {data.contacts.length - 3} autres</li>}
            </ul>
          ) : (
            <p style={{ color: 'red' }}>❌ <strong>AUCUN CONTACT !</strong></p>
          )}
        </div>
        
        <div>
          <h4>📋 PROGRAMMATEURS ({data.programmateurs.length})</h4>
          {data.programmateurs.length > 0 ? (
            <ul>
              {data.programmateurs.slice(0, 3).map(prog => (
                <li key={prog.id}>
                  <strong>{prog.nom}</strong> - {prog.email || 'pas d\'email'}
                </li>
              ))}
              {data.programmateurs.length > 3 && <li>... et {data.programmateurs.length - 3} autres</li>}
            </ul>
          ) : (
            <p style={{ color: 'green' }}>✅ Collection programmateurs supprimée (normal)</p>
          )}
        </div>
      </div>
      
      {data.contacts.length === 0 && data.programmateurs.length === 0 && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#ffebee', border: '1px solid #f44336' }}>
          <h4 style={{ color: '#d32f2f' }}>⚠️ PROBLÈME DÉTECTÉ</h4>
          <p>Il n'y a ni contacts ni programmateurs dans la base de données.</p>
          <p><strong>Action requise :</strong> Vérifier si la migration s'est bien passée ou créer des données de test.</p>
        </div>
      )}
    </div>
  );
};

export default ContactMigrationDebug;