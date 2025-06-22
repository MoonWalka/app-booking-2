// src/hooks/contacts/useUnifiedContact.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { useContactsRelational } from './useContactsRelational';
import { structuresService } from '@/services/contacts/structuresService';
import { personnesService } from '@/services/contacts/personnesService';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Hook pour charger un contact depuis le nouveau modèle relationnel
 * MIGRATION: Remplace l'accès à contacts_unified par le modèle relationnel
 * Garde la même interface pour compatibilité avec les composants existants
 */
export const useUnifiedContact = (contactId, contactType = null) => {
  const { currentOrganization } = useOrganization();
  const { getStructureWithPersonnes, getPersonneWithStructures } = useContactsRelational();
  
  const [data, setData] = useState({
    contact: null,
    loading: true,
    error: null,
    entityType: null
  });
  
  // Ref pour éviter les appels multiples simultanés
  const loadingRef = useRef(false);
  const lastContactIdRef = useRef(null);

  const loadUnifiedContact = useCallback(async (forceReload = false) => {
    if (!contactId) {
      setData({
        contact: null,
        loading: false,
        error: 'ID manquant',
        entityType: null
      });
      return;
    }

    if (!currentOrganization?.id) {
      setData({
        contact: null,
        loading: false,
        error: 'Organisation manquante',
        entityType: null
      });
      return;
    }

    // Éviter les appels multiples simultanés
    if (loadingRef.current && !forceReload) {
      console.log('⏳ [useUnifiedContact] Chargement déjà en cours, ignoré');
      return;
    }

    console.log('🔄 [useUnifiedContact] Chargement relationnel ID:', contactId, forceReload ? '(forcé)' : '');
    
    try {
      loadingRef.current = true;
      setData(prev => ({ ...prev, loading: true, error: null }));

      let contactData = null;
      let detectedEntityType = contactType;
      
      // Normaliser le type (personne_libre -> personne)
      if (detectedEntityType === 'personne_libre') {
        detectedEntityType = 'personne';
      }

      // Si le type n'est pas spécifié, essayer de détecter
      if (!detectedEntityType) {
        console.log('🔍 [useUnifiedContact] Détection automatique du type pour ID:', contactId);
        // Essayer de charger comme structure d'abord
        try {
          const structureResult = await structuresService.getStructure(contactId);
          console.log('📦 [useUnifiedContact] Résultat structure:', structureResult);
          if (structureResult.success && structureResult.data) {
            detectedEntityType = 'structure';
          }
        } catch (structureError) {
          console.log('❌ [useUnifiedContact] Pas une structure:', structureError.message);
          // Si pas trouvé comme structure, essayer comme personne
          try {
            const personneResult = await personnesService.getPersonne(contactId);
            console.log('👤 [useUnifiedContact] Résultat personne:', personneResult);
            if (personneResult.success && personneResult.data) {
              detectedEntityType = 'personne';
            }
          } catch (personneError) {
            console.warn('⚠️ [useUnifiedContact] Contact non trouvé dans les nouvelles collections:', contactId);
          }
        }
      } else {
        console.log('✅ [useUnifiedContact] Type spécifié:', detectedEntityType);
      }

      // Charger les données selon le type
      if (detectedEntityType === 'structure') {
        console.log('🏢 [useUnifiedContact] Chargement comme structure');
        contactData = getStructureWithPersonnes(contactId);
        
        // Si pas trouvé dans le cache, essayer de charger directement depuis le service
        if (!contactData) {
          console.log('🔄 [useUnifiedContact] Structure pas dans le cache, chargement direct depuis le service');
          try {
            const structureResult = await structuresService.getStructure(contactId);
            if (structureResult.success && structureResult.data) {
              console.log('✅ [useUnifiedContact] Structure trouvée via service:', structureResult.data);
              
              // Charger aussi les liaisons et personnes associées
              const liaisonsQuery = query(
                collection(db, 'liaisons'),
                where('structureId', '==', contactId),
                where('actif', '==', true),
                where('organizationId', '==', currentOrganization.id)
              );
              const liaisonsSnapshot = await getDocs(liaisonsQuery);
              
              // Récupérer les personnes pour chaque liaison
              const personnesAssociees = [];
              for (const liaisonDoc of liaisonsSnapshot.docs) {
                const liaison = liaisonDoc.data();
                const personneResult = await personnesService.getPersonne(liaison.personneId);
                if (personneResult.success && personneResult.data) {
                  personnesAssociees.push({
                    ...personneResult.data,
                    liaison: {
                      id: liaisonDoc.id,
                      fonction: liaison.fonction,
                      actif: liaison.actif,
                      prioritaire: liaison.prioritaire,
                      interesse: liaison.interesse,
                      dateDebut: liaison.dateDebut,
                      dateFin: liaison.dateFin,
                      notes: liaison.notes
                    }
                  });
                }
              }
              
              console.log('📋 [useUnifiedContact] Personnes associées trouvées:', personnesAssociees.length);
              
              // Créer un objet complet avec les personnes
              contactData = {
                ...structureResult.data,
                personnes: personnesAssociees
              };
            }
          } catch (error) {
            console.error('❌ [useUnifiedContact] Erreur chargement direct structure:', error);
          }
        }
        
        if (contactData) {
          // Adapter au format attendu par les composants existants
          contactData = {
            id: contactData.id,
            entityType: 'structure',
            structure: {
              raisonSociale: contactData.raisonSociale,
              type: contactData.type,
              email: contactData.email,
              telephone1: contactData.telephone1,
              telephone2: contactData.telephone2,
              fax: contactData.fax,
              siteWeb: contactData.siteWeb,
              adresse: contactData.adresse,
              codePostal: contactData.codePostal,
              ville: contactData.ville,
              pays: contactData.pays,
              isClient: contactData.isClient,
              notes: contactData.notes
            },
            qualification: {
              tags: contactData.tags || []
            },
            personnes: contactData.personnes?.map(p => ({
              id: p.id,
              prenom: p.prenom,
              nom: p.nom,
              fonction: p.liaison?.fonction || '',
              email: p.email,
              telephone: p.telephone,
              mobile: p.telephone2,
              mailPerso: p.email, // À adapter selon la structure
              adresse: p.adresse,
              codePostal: p.codePostal,
              ville: p.ville,
              pays: p.pays,
              // Ajouter les informations de liaison
              actif: p.liaison?.actif,
              prioritaire: p.liaison?.prioritaire,
              interesse: p.liaison?.interesse
            })) || [],
            createdAt: contactData.createdAt,
            updatedAt: contactData.updatedAt
          };
        }
      } else if (detectedEntityType === 'personne') {
        console.log('👤 [useUnifiedContact] Chargement comme personne avec ID:', contactId);
        contactData = getPersonneWithStructures(contactId);
        console.log('📊 [useUnifiedContact] Données personne récupérées du cache:', contactData);
        
        // Si pas trouvé dans le cache, essayer de charger directement depuis le service
        if (!contactData) {
          console.log('🔄 [useUnifiedContact] Pas dans le cache, chargement direct depuis le service');
          try {
            const personneResult = await personnesService.getPersonne(contactId);
            if (personneResult.success && personneResult.data) {
              console.log('✅ [useUnifiedContact] Personne trouvée via service:', personneResult.data);
              
              // Charger les liaisons de cette personne pour récupérer les structures
              const liaisonsQuery = query(
                collection(db, 'liaisons'),
                where('personneId', '==', contactId),
                where('actif', '==', true),
                where('organizationId', '==', currentOrganization.id)
              );
              const liaisonsSnapshot = await getDocs(liaisonsQuery);
              
              // Récupérer les structures associées
              const structures = [];
              for (const liaisonDoc of liaisonsSnapshot.docs) {
                const liaison = liaisonDoc.data();
                const structureResult = await structuresService.getStructure(liaison.structureId);
                if (structureResult.success && structureResult.data) {
                  structures.push({
                    ...structureResult.data,
                    liaison: {
                      id: liaisonDoc.id,
                      fonction: liaison.fonction,
                      actif: liaison.actif,
                      prioritaire: liaison.prioritaire,
                      interesse: liaison.interesse
                    }
                  });
                }
              }
              
              console.log('📋 [useUnifiedContact] Structures trouvées pour la personne:', structures.length);
              
              // Créer un objet compatible avec les structures
              contactData = {
                ...personneResult.data,
                structures
              };
            }
          } catch (error) {
            console.error('❌ [useUnifiedContact] Erreur chargement direct:', error);
          }
        }
        
        if (contactData) {
          // Adapter au format attendu par les composants existants
          contactData = {
            id: contactData.id,
            entityType: (contactData.isPersonneLibre && (!contactData.structures || contactData.structures.length === 0)) ? 'personne_libre' : 'personne',
            personne: {
              prenom: contactData.prenom,
              nom: contactData.nom,
              email: contactData.email,
              telephone: contactData.telephone,
              mobile: contactData.telephone2,
              adresse: contactData.adresse,
              codePostal: contactData.codePostal,
              ville: contactData.ville,
              pays: contactData.pays,
              notes: contactData.notes
            },
            qualification: {
              tags: contactData.tags || []
            },
            structures: contactData.structures?.map(s => ({
              id: s.id,
              raisonSociale: s.raisonSociale,
              type: s.type,
              fonction: s.liaison?.fonction || '',
              actif: s.liaison?.actif,
              prioritaire: s.liaison?.prioritaire,
              interesse: s.liaison?.interesse
            })) || [],
            createdAt: contactData.createdAt,
            updatedAt: contactData.updatedAt
          };
        }
      }

      if (contactData) {
        console.log('✅ [useUnifiedContact] Contact trouvé dans modèle relationnel:', {
          id: contactData.id,
          entityType: contactData.entityType,
          structureName: contactData.structure?.raisonSociale,
          personnesCount: contactData.personnes?.length || 0,
          structuresCount: contactData.structures?.length || 0,
          tags: contactData.qualification?.tags?.length || 0
        });

        setData({
          contact: contactData,
          loading: false,
          error: null,
          entityType: contactData.entityType
        });
      } else {
        setData({
          contact: null,
          loading: false,
          error: 'Contact non trouvé dans le modèle relationnel',
          entityType: null
        });
      }
    } catch (error) {
      console.error('❌ [useUnifiedContact] Erreur:', error);
      setData({
        contact: null,
        loading: false,
        error: error.message,
        entityType: null
      });
    } finally {
      loadingRef.current = false;
    }
  }, [contactId, contactType, currentOrganization, getStructureWithPersonnes, getPersonneWithStructures]);

  // Charger seulement si l'ID change réellement
  useEffect(() => {
    if (lastContactIdRef.current !== contactId) {
      lastContactIdRef.current = contactId;
      loadUnifiedContact();
    }
  }, [contactId, loadUnifiedContact]);

  const reload = useCallback(() => {
    console.log('🔄 [useUnifiedContact] Rechargement forcé demandé');
    loadUnifiedContact(true);
  }, [loadUnifiedContact]);

  // Fonction pour invalider le cache (compatibilité)
  const invalidateCache = useCallback(() => {
    if (contactId) {
      console.log('🗑️ [useUnifiedContact] Cache invalidé pour (relationnel):', contactId);
      // Dans le modèle relationnel, on peut forcer un reload
      loadUnifiedContact(true);
    }
  }, [contactId, loadUnifiedContact]);

  // Mémoriser le résultat pour éviter les re-renders inutiles
  const result = useMemo(() => ({
    contact: data.contact,
    loading: data.loading,
    error: data.error,
    entityType: data.entityType,
    reload,
    invalidateCache
  }), [data.contact, data.loading, data.error, data.entityType, reload, invalidateCache]);

  return result;
};

// Fonction utilitaire pour nettoyer le cache (compatibilité)
export const clearContactCache = () => {
  console.log('🧹 [useUnifiedContact] Cache nettoyé (modèle relationnel)');
  // Dans le modèle relationnel, le cache est géré par useContactsRelational
};