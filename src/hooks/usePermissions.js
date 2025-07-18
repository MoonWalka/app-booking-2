import { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useEntreprise } from '@/context/EntrepriseContext';

/**
 * Hook pour gérer les permissions de l'utilisateur actuel
 * Centralise toute la logique de vérification des permissions
 */
const usePermissions = () => {
  const { currentUser } = useAuth();
  const { currentEntreprise } = useEntreprise();
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!currentUser?.uid || !currentEntreprise?.id) {
        setPermissions({});
        setLoading(false);
        return;
      }

      try {
        // 1. Récupérer le collaborateur actuel depuis collaborationConfig
        const configDoc = await getDoc(doc(db, 'collaborationConfig', currentEntreprise.id));
        if (!configDoc.exists()) {
          console.log('❌ Aucune configuration de collaboration trouvée');
          setPermissions({});
          setLoading(false);
          return;
        }

        const configData = configDoc.data();
        const collaborateurs = configData.collaborateurs || [];
        const currentCollaborateur = collaborateurs.find(c => c.id === currentUser.uid);

        if (!currentCollaborateur) {
          console.log('❌ Utilisateur non trouvé dans les collaborateurs');
          setPermissions({});
          setLoading(false);
          return;
        }

        // 2. Récupérer les groupes de l'utilisateur
        const userGroupes = currentCollaborateur.groupes || [];
        console.log('👤 Groupes de l\'utilisateur:', userGroupes);

        // 3. Charger les permissions de chaque groupe
        const groupesRef = collection(db, 'entreprises', currentEntreprise.id, 'groupesPermissions');
        const groupesSnapshot = await getDocs(groupesRef);
        
        let mergedPermissions = {};
        let adminFound = false;

        for (const groupeDoc of groupesSnapshot.docs) {
          const groupeData = groupeDoc.data();
          
          // Si l'utilisateur appartient à ce groupe
          if (userGroupes.includes(groupeDoc.id)) {
            console.log(`📋 Chargement des permissions du groupe: ${groupeData.nom}`);
            
            // Vérifier si c'est un groupe admin
            if (groupeDoc.id === 'admin' || groupeData.nom?.toLowerCase().includes('admin')) {
              adminFound = true;
            }

            // Fusionner les permissions (OR logique - si au moins un groupe permet, c'est autorisé)
            Object.entries(groupeData.permissions || {}).forEach(([entity, actions]) => {
              if (!mergedPermissions[entity]) {
                mergedPermissions[entity] = {};
              }
              
              Object.entries(actions).forEach(([action, allowed]) => {
                // Si au moins un groupe autorise l'action, elle est autorisée
                if (allowed) {
                  mergedPermissions[entity][action] = true;
                }
              });
            });
          }
        }

        console.log('✅ Permissions finales:', mergedPermissions);
        setPermissions(mergedPermissions);
        setIsAdmin(adminFound);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des permissions:', error);
        setPermissions({});
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [currentUser, currentEntreprise]);

  /**
   * Vérifier si l'utilisateur a une permission spécifique
   * @param {string} entity - L'entité (ex: 'dates', 'contrats', 'artistes')
   * @param {string} action - L'action (ex: 'creer', 'modifier', 'voir', 'supprimer', 'historique')
   * @returns {boolean}
   */
  const hasPermission = useMemo(() => (entity, action) => {
    // Les admins ont toutes les permissions
    if (isAdmin && entity !== 'parametrage') return true;
    
    // Vérifier la permission spécifique
    return permissions[entity]?.[action] === true;
  }, [permissions, isAdmin]);

  /**
   * Obtenir toutes les permissions pour une entité
   * @param {string} entity - L'entité
   * @returns {object}
   */
  const getEntityPermissions = useMemo(() => (entity) => {
    if (isAdmin && entity !== 'parametrage') {
      return {
        creer: true,
        modifier: true,
        voir: true,
        supprimer: true,
        historique: true
      };
    }
    
    return permissions[entity] || {};
  }, [permissions, isAdmin]);

  /**
   * Vérifier si l'utilisateur peut effectuer au moins une action sur une entité
   * @param {string} entity - L'entité
   * @returns {boolean}
   */
  const canAccessEntity = useMemo(() => (entity) => {
    const entityPerms = getEntityPermissions(entity);
    return Object.values(entityPerms).some(permission => permission === true);
  }, [getEntityPermissions]);

  return {
    permissions,
    loading,
    isAdmin,
    hasPermission,
    getEntityPermissions,
    canAccessEntity,
    // Helpers spécifiques pour chaque entité
    canCreate: (entity) => hasPermission(entity, 'creer'),
    canEdit: (entity) => hasPermission(entity, 'modifier'),
    canView: (entity) => hasPermission(entity, 'voir'),
    canDelete: (entity) => hasPermission(entity, 'supprimer'),
    canViewHistory: (entity) => hasPermission(entity, 'historique'),
    // Helper pour les paramètres
    canEditSettings: () => hasPermission('parametrage', 'modifier')
  };
};

export default usePermissions;