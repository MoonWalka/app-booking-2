import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import styles from './LieuMapDebug.module.css';

/**
 * Composant de debug pour comprendre pourquoi les cartes ne s'affichent pas
 */
function LieuMapDebug() {
  const [debugData, setDebugData] = useState({
    concerts: [],
    lieux: [],
    loading: true,
    error: null
  });
  
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    const runDiagnostic = async () => {
      try {
        console.log('🔍 DÉBUT DU DIAGNOSTIC LIEU-MAP');
        console.log('Organization courante:', currentOrganization?.id);

        // 1. Récupérer des concerts
        const concertsSnapshot = await getDocs(collection(db, 'concerts'));
        const concerts = [];
        
        concertsSnapshot.forEach(doc => {
          const data = doc.data();
          concerts.push({
            id: doc.id,
            titre: data.titre,
            lieuId: data.lieuId,
            organizationId: data.organizationId,
            ...data
          });
        });

        console.log(`Nombre total de concerts: ${concerts.length}`);

        // 2. Filtrer les concerts avec lieuId
        const concertsWithLieu = concerts.filter(c => c.lieuId);
        console.log(`Concerts avec lieuId: ${concertsWithLieu.length}`);

        // 3. Charger les lieux associés
        const lieuxData = [];
        for (const concert of concertsWithLieu.slice(0, 5)) { // Limiter à 5 pour le debug
          if (concert.lieuId) {
            try {
              const lieuDoc = await getDoc(doc(db, 'lieux', concert.lieuId));
              if (lieuDoc.exists()) {
                const lieuData = lieuDoc.data();
                lieuxData.push({
                  concertId: concert.id,
                  concertTitre: concert.titre,
                  lieuId: concert.lieuId,
                  lieu: {
                    id: lieuDoc.id,
                    ...lieuData
                  },
                  hasAddress: !!lieuData.adresse,
                  organizationMatch: concert.organizationId === lieuData.organizationId
                });
              } else {
                lieuxData.push({
                  concertId: concert.id,
                  concertTitre: concert.titre,
                  lieuId: concert.lieuId,
                  lieu: null,
                  error: 'Lieu introuvable'
                });
              }
            } catch (error) {
              lieuxData.push({
                concertId: concert.id,
                concertTitre: concert.titre,
                lieuId: concert.lieuId,
                lieu: null,
                error: error.message
              });
            }
          }
        }

        setDebugData({
          concerts: concertsWithLieu.slice(0, 5),
          lieux: lieuxData,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Erreur diagnostic:', error);
        setDebugData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    runDiagnostic();
  }, [currentOrganization]);

  if (debugData.loading) {
    return <div className={styles.debugContainer}>Chargement du diagnostic...</div>;
  }

  if (debugData.error) {
    return (
      <div className={styles.debugContainer}>
        <h3>Erreur de diagnostic</h3>
        <pre>{debugData.error}</pre>
      </div>
    );
  }

  return (
    <div className={styles.debugContainer}>
      <h3>🔍 Diagnostic: Affichage des cartes de lieux</h3>
      
      <div className={styles.section}>
        <h4>Organization courante</h4>
        <p>ID: {currentOrganization?.id || 'NON DÉFINIE'}</p>
      </div>

      <div className={styles.section}>
        <h4>Concerts avec lieux</h4>
        {debugData.lieux.length === 0 ? (
          <p className={styles.error}>❌ Aucun concert n'a de lieuId défini!</p>
        ) : (
          debugData.lieux.map((item, index) => (
            <div key={index} className={styles.debugItem}>
              <h5>Concert: {item.concertTitre || 'Sans titre'}</h5>
              <ul>
                <li>Concert ID: {item.concertId}</li>
                <li>Lieu ID: {item.lieuId}</li>
                {item.error ? (
                  <li className={styles.error}>❌ Erreur: {item.error}</li>
                ) : item.lieu ? (
                  <>
                    <li>Lieu nom: {item.lieu.nom || 'Sans nom'}</li>
                    <li>Adresse: {item.lieu.adresse || <span className={styles.warning}>⚠️ NON DÉFINIE</span>}</li>
                    <li>Code postal: {item.lieu.codePostal || 'Non défini'}</li>
                    <li>Ville: {item.lieu.ville || 'Non définie'}</li>
                    <li>Organization match: {item.organizationMatch ? '✅' : '❌'}</li>
                    {!item.hasAddress && (
                      <li className={styles.error}>❌ La carte ne s'affichera pas sans adresse!</li>
                    )}
                  </>
                ) : (
                  <li className={styles.error}>❌ Lieu introuvable</li>
                )}
              </ul>
            </div>
          ))
        )}
      </div>

      <div className={styles.section}>
        <h4>Problèmes détectés</h4>
        <ul>
          {debugData.lieux.filter(l => !l.hasAddress).length > 0 && (
            <li className={styles.error}>
              ❌ {debugData.lieux.filter(l => !l.hasAddress).length} lieu(x) sans adresse
            </li>
          )}
          {debugData.lieux.filter(l => l.lieu && !l.organizationMatch).length > 0 && (
            <li className={styles.warning}>
              ⚠️ {debugData.lieux.filter(l => l.lieu && !l.organizationMatch).length} lieu(x) avec organizationId différent
            </li>
          )}
          {debugData.lieux.filter(l => l.error).length > 0 && (
            <li className={styles.error}>
              ❌ {debugData.lieux.filter(l => l.error).length} lieu(x) introuvable(s)
            </li>
          )}
        </ul>
      </div>

      <div className={styles.section}>
        <h4>Pour corriger</h4>
        <ol>
          <li>Vérifier que chaque lieu a une adresse définie</li>
          <li>Vérifier que les organizationId correspondent</li>
          <li>Vérifier que les lieuId dans les concerts pointent vers des lieux existants</li>
          <li>Regarder les logs de la console pour plus de détails</li>
        </ol>
      </div>
    </div>
  );
}

export default LieuMapDebug;