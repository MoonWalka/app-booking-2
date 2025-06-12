import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, limit, db } from '@/services/firebase-service';
import styles from './DebugController.module.css';
import { useMultiOrgQuery } from '@/hooks/useMultiOrgQuery';

const ConcertContactsDebug = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    withContactId: 0,
    withContactIds: 0,
    withContactsWithRoles: 0,
    withNoContact: 0
  });
  
  // Hook pour les requêtes multi-organisation
  const { buildConstraints } = useMultiOrgQuery('concerts');

  useEffect(() => {
    const analyzeContactStructure = async () => {
      setLoading(true);
      try {
        const constraints = buildConstraints();
        const q = query(collection(db, 'concerts'), ...constraints, limit(50));
        const snapshot = await getDocs(q);
        
        const concertData = [];
        let stats = {
          total: 0,
          withContactId: 0,
          withContactIds: 0,
          withContactsWithRoles: 0,
          withNoContact: 0
        };
        
        snapshot.forEach(doc => {
          const data = doc.data();
          const concertInfo = {
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
          
          concertData.push(concertInfo);
        });
        
        setConcerts(concertData);
        setStats(stats);
      } catch (error) {
        console.error('Erreur lors de l\'analyse:', error);
      } finally {
        setLoading(false);
      }
    };
    
    analyzeContactStructure();
  }, [buildConstraints]);

  return (
    <div className={styles.debugSection}>
      <h2>Analyse de la structure des contacts dans les concerts</h2>
      
      {loading ? (
        <p>Chargement en cours...</p>
      ) : (
        <>
          <div className={styles.stats}>
            <h3>Statistiques</h3>
            <ul>
              <li>Total des concerts analysés: <strong>{stats.total}</strong></li>
              <li>Concerts avec contactId (singulier): <strong>{stats.withContactId}</strong></li>
              <li>Concerts avec contactIds (pluriel): <strong>{stats.withContactIds}</strong></li>
              <li>Concerts avec contactsWithRoles: <strong>{stats.withContactsWithRoles}</strong></li>
              <li>Concerts sans contact: <strong>{stats.withNoContact}</strong></li>
            </ul>
          </div>
          
          <div className={styles.details}>
            <h3>Détails par concert</h3>
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
                {concerts.map(concert => (
                  <tr key={concert.id}>
                    <td>{concert.id}</td>
                    <td>{concert.titre}</td>
                    <td>
                      {concert.contactId ? (
                        <span className={styles.success}>{concert.contactId}</span>
                      ) : (
                        <span className={styles.empty}>-</span>
                      )}
                    </td>
                    <td>
                      {concert.contactIds ? (
                        <span className={styles.info}>
                          [{concert.contactIds.join(', ')}]
                        </span>
                      ) : (
                        <span className={styles.empty}>-</span>
                      )}
                    </td>
                    <td>
                      {concert.contactsWithRoles ? (
                        <span className={styles.warning}>
                          {JSON.stringify(concert.contactsWithRoles)}
                        </span>
                      ) : (
                        <span className={styles.empty}>-</span>
                      )}
                    </td>
                    <td>{concert.contactNom || '-'}</td>
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
                La majorité des concerts utilisent <code>contactId</code> (singulier) pour stocker un seul contact.
                Le composant <code>ContactSearchSection</code> a été conçu pour gérer plusieurs contacts mais 
                l'implémentation actuelle ne sauvegarde qu'un seul contact.
              </p>
              
              <h4>Limitation identifiée:</h4>
              <ul>
                <li>Le formulaire utilise <code>formData.contactId</code> (singulier)</li>
                <li>Le hook <code>useConcertForm</code> ne gère qu'un seul contact</li>
                <li>La configuration dans <code>entityConfigurations.js</code> définit <code>isArray: false</code></li>
                <li>Le composant <code>ContactSearchSectionWithRoles</code> existe mais n'est pas utilisé</li>
              </ul>
              
              <h4>Conclusion:</h4>
              <p>
                C'est une <strong>limitation actuelle</strong> de l'implémentation, pas un bug. 
                Le système est configuré pour ne gérer qu'un seul contact par concert, 
                même si l'interface suggère la possibilité d'en ajouter plusieurs.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConcertContactsDebug;