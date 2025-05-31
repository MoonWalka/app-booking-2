import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  orderBy,
  where,
  db 
} from '@/services/firebase-service';
import { useMultiOrgQuery, useMultiOrgMutation } from '@/hooks/useMultiOrgQuery';

/**
 * EXEMPLE DE MIGRATION : Composant de gestion des programmateurs
 * 
 * Ce fichier montre comment migrer un composant existant
 * vers le système multi-organisation.
 */

// ===============================================
// AVANT : Composant utilisant l'ancien système
// ===============================================

const ProgrammateursListOLD = () => {
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chargement des données SANS multi-organisation
  useEffect(() => {
    const fetchProgrammateurs = async () => {
      try {
        setLoading(true);
        
        // ❌ Requête directe sur la collection globale
        const q = query(
          collection(db, 'programmateurs'),
          orderBy('nom', 'asc')
        );
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProgrammateurs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgrammateurs();
  }, []);

  // Ajouter un programmateur SANS multi-organisation
  const handleAdd = async (formData) => {
    try {
      // ❌ Ajout direct dans la collection globale
      const docRef = await addDoc(collection(db, 'programmateurs'), {
        ...formData,
        createdAt: new Date()
      });
      
      // Recharger la liste
      // ... code de rechargement
      
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Mettre à jour SANS multi-organisation
  const handleUpdate = async (id, data) => {
    try {
      // ❌ Mise à jour directe sans contexte organisationnel
      const docRef = doc(db, 'programmateurs', id);
      await updateDoc(docRef, data);
      
      // Recharger la liste
      // ... code de rechargement
      
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Supprimer SANS multi-organisation
  const handleDelete = async (id) => {
    try {
      // ❌ Suppression directe sans vérification d'organisation
      await deleteDoc(doc(db, 'programmateurs', id));
      
      // Recharger la liste
      // ... code de rechargement
      
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div>
      <h2>Programmateurs (Ancien système)</h2>
      <ul>
        {programmateurs.map(prog => (
          <li key={prog.id}>
            {prog.nom} - {prog.contact?.email}
            <button onClick={() => handleUpdate(prog.id, { /* data */ })}>
              Modifier
            </button>
            <button onClick={() => handleDelete(prog.id)}>
              Supprimer
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => handleAdd({ /* formData */ })}>
        Ajouter un programmateur
      </button>
    </div>
  );
};

// ===============================================
// APRÈS : Composant utilisant le système multi-organisation
// ===============================================

const ProgrammateursListNEW = () => {
  // ✅ Utilisation du hook multi-organisation pour les requêtes
  const { 
    data: programmateurs, 
    loading, 
    error 
  } = useMultiOrgQuery('programmateurs', {
    orderByField: 'nom',
    orderDirection: 'asc',
    realtime: true // Écoute en temps réel des changements
  });

  // ✅ Utilisation du hook multi-organisation pour les mutations
  const { 
    create, 
    update, 
    remove, 
    loading: mutationLoading 
  } = useMultiOrgMutation('programmateurs');

  // Ajouter un programmateur AVEC multi-organisation
  const handleAdd = async (formData) => {
    try {
      // ✅ Ajout automatique dans la collection de l'organisation courante
      const id = await create(formData);
      console.log('Programmateur créé avec l\'ID:', id);
      
      // Pas besoin de recharger, le hook realtime s'en charge
      
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Mettre à jour AVEC multi-organisation
  const handleUpdate = async (id, data) => {
    try {
      // ✅ Mise à jour avec vérification automatique de l'organisation
      await update(id, data);
      console.log('Programmateur mis à jour');
      
      // Pas besoin de recharger, le hook realtime s'en charge
      
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Supprimer AVEC multi-organisation
  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    
    try {
      // ✅ Suppression avec vérification automatique de l'organisation
      await remove(id);
      console.log('Programmateur supprimé');
      
      // Pas besoin de recharger, le hook realtime s'en charge
      
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div>
      <h2>Programmateurs (Nouveau système multi-org)</h2>
      <ul>
        {programmateurs.map(prog => (
          <li key={prog.id}>
            {prog.nom} - {prog.contact?.email}
            <button 
              onClick={() => handleUpdate(prog.id, { /* data */ })}
              disabled={mutationLoading}
            >
              Modifier
            </button>
            <button 
              onClick={() => handleDelete(prog.id)}
              disabled={mutationLoading}
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
      <button 
        onClick={() => handleAdd({ /* formData */ })}
        disabled={mutationLoading}
      >
        Ajouter un programmateur
      </button>
    </div>
  );
};

// ===============================================
// COMPARAISON CÔTE À CÔTE
// ===============================================

const MigrationExample = () => {
  const [showOld, setShowOld] = useState(true);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Exemple de Migration Multi-Organisation</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setShowOld(true)}
          style={{ 
            backgroundColor: showOld ? '#dc3545' : '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            marginRight: '1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Ancien Système ❌
        </button>
        <button 
          onClick={() => setShowOld(false)}
          style={{ 
            backgroundColor: !showOld ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Nouveau Système ✅
        </button>
      </div>

      <div style={{ 
        border: '2px solid',
        borderColor: showOld ? '#dc3545' : '#28a745',
        borderRadius: '8px',
        padding: '1rem'
      }}>
        {showOld ? <ProgrammateursListOLD /> : <ProgrammateursListNEW />}
      </div>

      <div style={{ marginTop: '2rem', backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
        <h3>Points clés de la migration :</h3>
        <ul>
          <li><strong>Hooks simplifiés</strong> : Plus besoin de gérer manuellement les états loading, error, etc.</li>
          <li><strong>Contexte automatique</strong> : L'organisation courante est gérée automatiquement</li>
          <li><strong>Temps réel</strong> : Option realtime pour synchroniser automatiquement les données</li>
          <li><strong>Sécurité intégrée</strong> : Les règles Firestore vérifient automatiquement les permissions</li>
          <li><strong>Moins de code</strong> : Le nouveau système réduit considérablement le boilerplate</li>
        </ul>
      </div>
    </div>
  );
};

export default MigrationExample; 