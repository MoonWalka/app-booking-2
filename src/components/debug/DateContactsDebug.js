import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, limit, where, db } from '@/services/firebase-service';
import styles from './DebugController.module.css';
import { useOrganization } from '@/context/OrganizationContext';

const DateContactsDebug = () => {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    withContactId: 0,
    withContactIds: 0,
    withContactsWithRoles: 0,
    withNoContact: 0
  });
  
  // Récupérer l'organisation courante
  const { currentOrg } = useOrganization();

  useEffect(() => {
    const analyzeContactStructure = async () => {
      setLoading(true);
      try {
        // Construire la requête en fonction de l'organisation courante
        let constraints = [];
        if (currentOrg) {
          constraints.push(where('organizationId', '==', currentOrg.id));
        }
        constraints.push(limit(50));
        
        const q = query(collection(db, 'dates'), ...constraints);
        const snapshot = await getDocs(q);
        
        const dateData = [];
        let stats = {
          total: 0,
          withContactId: 0,
          withContactIds: 0,
          withContactsWithRoles: 0,
          withNoContact: 0
        };
        
        snapshot.forEach(doc => {
          const data = doc.data();
          const dateInfo = {
            id: doc.id,
            titre: data.titre || 'Sans titre',
            contactId: data.contactId || null,
            contactIds: data.contactIds || null,
            contactsWithRoles: data.contactsWithRoles || null,
            contactNom: data.contactNom || null
          };
          
          stats.total++;
          
          if (data.contactId) {
            stats.withContactId++;
          }
          
          if (data.contactIds && Array.isArray(data.contactIds)) {
            stats.withContactIds++;
          }
          
          if (data.contactsWithRoles && Array.isArray(data.contactsWithRoles)) {
            stats.withContactsWithRoles++;
          }
          
          if (!data.contactId && !data.contactIds && !data.contactsWithRoles) {
            stats.withNoContact++;
          }
          
          dateData.push(dateInfo);
        });
        
        setDates(dateData);
        setStats(stats);
      } catch (error) {
        console.error('Erreur lors de l\'analyse:', error);
      } finally {
        setLoading(false);
      }
    };
    
    analyzeContactStructure();
  }, [currentOrg?.id]); // Dépendance stable sur l'ID de l'organisation

  return (
    <div className={styles.debugSection}>
      <h2>Analyse de la structure des contacts dans les dates</h2>
      
      {loading ? (
        <p>Chargement en cours...</p>
      ) : (
        <>
          <div className={styles.stats}>
            <h3>Statistiques</h3>
            <ul>
              <li>Total des dates analysés: <strong>{stats.total}</strong></li>
              <li>Dates avec contactId (singulier): <strong>{stats.withContactId}</strong></li>
              <li>Dates avec contactIds (pluriel): <strong>{stats.withContactIds}</strong></li>
              <li>Dates avec contactsWithRoles: <strong>{stats.withContactsWithRoles}</strong></li>
              <li>Dates sans contact: <strong>{stats.withNoContact}</strong></li>
            </ul>
          </div>
          
          <div className={styles.details}>
            <h3>Détails par date</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>contactId</th>
                  <th>contactIds</th>
                  <th>contactsWithRoles</th>
                  <th>contactNom</th>
                </tr>
              </thead>
              <tbody>
                {dates.map(date => (
                  <tr key={date.id}>
                    <td>{date.id}</td>
                    <td>{date.titre}</td>
                    <td>
                      {date.contactId ? (
                        <span className={styles.success}>{date.contactId}</span>
                      ) : (
                        <span className={styles.empty}>-</span>
                      )}
                    </td>
                    <td>
                      {date.contactIds ? (
                        <span className={styles.info}>
                          [{date.contactIds.join(', ')}]
                        </span>
                      ) : (
                        <span className={styles.empty}>-</span>
                      )}
                    </td>
                    <td>
                      {date.contactsWithRoles ? (
                        <span className={styles.warning}>
                          {JSON.stringify(date.contactsWithRoles)}
                        </span>
                      ) : (
                        <span className={styles.empty}>-</span>
                      )}
                    </td>
                    <td>{date.contactNom || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className={styles.analysis}>
            <h3>Analyse</h3>
            <div>
              <h4>Structure actuelle:</h4>
              <p>
                Le système a été migré vers <code>contactIds</code> (pluriel) pour supporter plusieurs contacts.
                Le composant <code>UnifiedContactSelector</code> remplace désormais les anciens composants
                et gère correctement les contacts multiples.
              </p>
              
              <h4>Migration effectuée:</h4>
              <ul>
                <li>✅ Le formulaire utilise maintenant <code>formData.contactIds</code> (pluriel)</li>
                <li>✅ Le hook <code>useDateForm</code> gère plusieurs contacts</li>
                <li>✅ La configuration définit <code>isArray: true</code></li>
                <li>✅ <code>UnifiedContactSelector</code> remplace les anciens composants</li>
              </ul>
              
              <h4>Conclusion:</h4>
              <p>
                ✅ <strong>Migration terminée</strong> ! Le système gère maintenant plusieurs contacts par date.
                La rétrocompatibilité avec <code>contactId</code> est maintenue pour les anciens dates.
                Tous les nouveaux dates utilisent le format <code>contactIds</code>.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DateContactsDebug;