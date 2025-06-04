import React, { useState, useEffect } from 'react';
import { collection, getDocs, db } from '@/services/firebase-service';

/**
 * Composant de debug temporaire pour vérifier les contacts
 */
const ContactsDebug = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        console.log('🔍 [ContactsDebug] Tentative de chargement des contacts...');
        const contactsCollection = collection(db, 'contacts');
        const snapshot = await getDocs(contactsCollection);
        
        const contactsData = [];
        snapshot.forEach((doc) => {
          contactsData.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('📊 [ContactsDebug] Contacts trouvés:', contactsData.length);
        console.log('📋 [ContactsDebug] Données:', contactsData);
        
        setContacts(contactsData);
        setLoading(false);
      } catch (err) {
        console.error('❌ [ContactsDebug] Erreur:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) return <div>🔄 Chargement debug contacts...</div>;
  if (error) return <div>❌ Erreur: {error}</div>;

  return (
    <div style={{ padding: '20px', border: '2px solid #orange', margin: '10px' }}>
      <h3>🔍 DEBUG CONTACTS</h3>
      <p><strong>Nombre de contacts:</strong> {contacts.length}</p>
      {contacts.length > 0 ? (
        <ul>
          {contacts.slice(0, 5).map(contact => (
            <li key={contact.id}>
              <strong>{contact.nom || 'Sans nom'}</strong> - ID: {contact.id}
              {contact.email && ` - ${contact.email}`}
            </li>
          ))}
          {contacts.length > 5 && <li>... et {contacts.length - 5} autres</li>}
        </ul>
      ) : (
        <p>❌ <strong>Aucun contact trouvé dans la base !</strong></p>
      )}
    </div>
  );
};

export default ContactsDebug;