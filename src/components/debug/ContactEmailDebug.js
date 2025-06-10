import React, { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import Button from '@/components/ui/Button';
import styles from './OrganizationIdDebug.module.css';

/**
 * Composant de debug pour vérifier les emails des contacts
 */
function ContactEmailDebug() {
  const [contactId, setContactId] = useState('');
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentOrganization } = useOrganization();

  const checkContact = async () => {
    if (!contactId) {
      setError('Veuillez entrer un ID de contact');
      return;
    }

    setLoading(true);
    setError(null);
    setContactData(null);

    try {
      const contactRef = doc(db, 'contacts', contactId);
      const contactDoc = await getDoc(contactRef);

      if (!contactDoc.exists()) {
        setError('Contact non trouvé');
        return;
      }

      const data = contactDoc.data();
      setContactData({
        id: contactDoc.id,
        data: data,
        hasEmail: !!data.email,
        hasContactEmail: !!data.contact?.email,
        organizationId: data.organizationId,
        belongsToCurrentOrg: data.organizationId === currentOrganization?.id
      });

    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.debugContainer}>
      <h2>Debug Email Contact</h2>
      
      <div className={styles.section}>
        <h3>Vérifier un contact</h3>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            placeholder="ID du contact"
            className={styles.input}
          />
          <Button onClick={checkContact} disabled={loading}>
            {loading ? 'Chargement...' : 'Vérifier'}
          </Button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          Erreur: {error}
        </div>
      )}

      {contactData && (
        <div className={styles.section}>
          <h3>Résultat</h3>
          <div className={styles.result}>
            <p><strong>ID:</strong> {contactData.id}</p>
            <p><strong>Organization ID:</strong> {contactData.organizationId || 'MANQUANT'}</p>
            <p><strong>Appartient à l'org courante:</strong> {contactData.belongsToCurrentOrg ? 'OUI' : 'NON'}</p>
            <p><strong>Email (direct):</strong> {contactData.data.email || 'MANQUANT'}</p>
            <p><strong>Email (dans contact):</strong> {contactData.data.contact?.email || 'MANQUANT'}</p>
            
            <h4>Structure complète des données:</h4>
            <pre className={styles.json}>
              {JSON.stringify(contactData.data, null, 2)}
            </pre>
            
            <h4>Clés présentes:</h4>
            <ul>
              {Object.keys(contactData.data).map(key => (
                <li key={key}>{key}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactEmailDebug;