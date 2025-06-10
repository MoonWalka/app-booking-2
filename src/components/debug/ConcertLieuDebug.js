import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, db } from '@/services/firebase-service';
import { useConcertDetails } from '@/hooks/concerts';
import styles from './LieuMapDebug.module.css';

/**
 * Composant de debug pour analyser pourquoi le lieu ne s'affiche pas dans un concert spécifique
 */
function ConcertLieuDebug() {
  const { id } = useParams();
  const [debugData, setDebugData] = useState({
    firebaseData: null,
    hookData: null,
    loading: true,
    error: null
  });

  // Utiliser le hook pour voir ce qu'il retourne
  const hookResult = useConcertDetails(id);

  useEffect(() => {
    const loadDebugData = async () => {
      if (!id) {
        setDebugData({
          firebaseData: null,
          hookData: hookResult,
          loading: false,
          error: 'Aucun ID de concert fourni'
        });
        return;
      }

      try {
        console.log('🔍 DEBUG CONCERT-LIEU pour ID:', id);

        // 1. Charger directement depuis Firebase
        const concertDoc = await getDoc(doc(db, 'concerts', id));
        let firebaseData = null;
        let lieuData = null;

        if (concertDoc.exists()) {
          firebaseData = {
            id: concertDoc.id,
            ...concertDoc.data()
          };

          console.log('Concert Firebase:', firebaseData);

          // Si lieuId existe, charger le lieu
          if (firebaseData.lieuId) {
            console.log('Chargement du lieu:', firebaseData.lieuId);
            const lieuDoc = await getDoc(doc(db, 'lieux', firebaseData.lieuId));
            if (lieuDoc.exists()) {
              lieuData = {
                id: lieuDoc.id,
                ...lieuDoc.data()
              };
              console.log('Lieu trouvé:', lieuData);
            } else {
              console.log('❌ Lieu introuvable avec ID:', firebaseData.lieuId);
            }
          }
        }

        setDebugData({
          firebaseData: {
            concert: firebaseData,
            lieu: lieuData
          },
          hookData: hookResult,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Erreur debug:', error);
        setDebugData({
          firebaseData: null,
          hookData: hookResult,
          loading: false,
          error: error.message
        });
      }
    };

    loadDebugData();
  }, [id, hookResult?.concert?.id, hookResult]); // Re-run si les données du hook changent

  if (debugData.loading || hookResult?.loading) {
    return <div className={styles.debugContainer}>Chargement du debug...</div>;
  }

  return (
    <div className={styles.debugContainer}>
      <h3>🔍 Debug Concert-Lieu: {id}</h3>

      <div className={styles.section}>
        <h4>1. Données Firebase directes</h4>
        {debugData.firebaseData?.concert ? (
          <div>
            <h5>Concert:</h5>
            <ul>
              <li>ID: {debugData.firebaseData.concert.id}</li>
              <li>Titre: {debugData.firebaseData.concert.titre || 'Sans titre'}</li>
              <li>lieuId: {debugData.firebaseData.concert.lieuId || <span className={styles.error}>NON DÉFINI</span>}</li>
              <li>organizationId: {debugData.firebaseData.concert.organizationId || <span className={styles.error}>NON DÉFINI</span>}</li>
            </ul>

            {debugData.firebaseData.concert.lieuId && (
              <>
                <h5>Lieu associé:</h5>
                {debugData.firebaseData.lieu ? (
                  <ul>
                    <li>ID: {debugData.firebaseData.lieu.id}</li>
                    <li>Nom: {debugData.firebaseData.lieu.nom || 'Sans nom'}</li>
                    <li>Adresse: {debugData.firebaseData.lieu.adresse || <span className={styles.warning}>NON DÉFINIE</span>}</li>
                    <li>Code postal: {debugData.firebaseData.lieu.codePostal}</li>
                    <li>Ville: {debugData.firebaseData.lieu.ville}</li>
                    <li>organizationId: {debugData.firebaseData.lieu.organizationId}</li>
                  </ul>
                ) : (
                  <p className={styles.error}>❌ Lieu introuvable avec ID: {debugData.firebaseData.concert.lieuId}</p>
                )}
              </>
            )}
          </div>
        ) : (
          <p className={styles.error}>❌ Concert introuvable dans Firebase</p>
        )}
      </div>

      <div className={styles.section}>
        <h4>2. Données du hook useConcertDetails</h4>
        {hookResult ? (
          <div>
            <h5>Concert (hookResult.concert):</h5>
            {hookResult.concert ? (
              <ul>
                <li>ID: {hookResult.concert.id}</li>
                <li>Titre: {hookResult.concert.titre}</li>
                <li>lieuId: {hookResult.concert.lieuId || <span className={styles.error}>NON DÉFINI</span>}</li>
              </ul>
            ) : (
              <p className={styles.error}>❌ Pas de concert dans hookResult</p>
            )}

            <h5>Lieu (hookResult.lieu):</h5>
            {hookResult.lieu ? (
              <ul>
                <li>ID: {hookResult.lieu.id}</li>
                <li>Nom: {hookResult.lieu.nom}</li>
                <li>Adresse: {hookResult.lieu.adresse || <span className={styles.warning}>NON DÉFINIE</span>}</li>
                <li className={styles.success}>✅ Le lieu est chargé par le hook!</li>
              </ul>
            ) : (
              <p className={styles.error}>❌ Pas de lieu dans hookResult</p>
            )}
          </div>
        ) : (
          <p className={styles.error}>❌ Hook non disponible</p>
        )}
      </div>

      <div className={styles.section}>
        <h4>3. Analyse du problème</h4>
        <ul>
          {/* Vérifier si le concert a un lieuId */}
          {!debugData.firebaseData?.concert?.lieuId && (
            <li className={styles.error}>❌ Le concert n'a pas de lieuId défini dans Firebase</li>
          )}
          
          {/* Vérifier si le lieu existe */}
          {debugData.firebaseData?.concert?.lieuId && !debugData.firebaseData?.lieu && (
            <li className={styles.error}>❌ Le lieu référencé n'existe pas dans Firebase</li>
          )}
          
          {/* Vérifier si le lieu a une adresse */}
          {debugData.firebaseData?.lieu && !debugData.firebaseData.lieu.adresse && (
            <li className={styles.warning}>⚠️ Le lieu n'a pas d'adresse, la carte ne s'affichera pas</li>
          )}
          
          {/* Vérifier la cohérence des organizationId */}
          {debugData.firebaseData?.concert?.organizationId !== debugData.firebaseData?.lieu?.organizationId && (
            <li className={styles.warning}>⚠️ Les organizationId ne correspondent pas</li>
          )}
          
          {/* Vérifier si le hook charge le lieu */}
          {debugData.firebaseData?.concert?.lieuId && !hookResult?.lieu && (
            <li className={styles.error}>❌ Le hook ne charge pas le lieu malgré un lieuId valide</li>
          )}
          
          {/* Succès */}
          {hookResult?.lieu && hookResult.lieu.adresse && (
            <li className={styles.success}>✅ Tout est OK, la carte devrait s'afficher!</li>
          )}
        </ul>
      </div>

      <div className={styles.section}>
        <h4>4. Logs de la console</h4>
        <p>Vérifiez la console pour:</p>
        <ul>
          <li>[ConcertViewWithRelances] Données reçues</li>
          <li>[ConcertLieuMap] Lieu reçu</li>
          <li>[useConcertDetails] logs de chargement</li>
        </ul>
      </div>
    </div>
  );
}

export default ConcertLieuDebug;