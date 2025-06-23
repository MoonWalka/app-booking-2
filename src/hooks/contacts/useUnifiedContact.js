// src/hooks/contacts/useUnifiedContact.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { useContactsRelational } from './useContactsRelational';
import { structuresService } from '@/services/contacts/structuresService';
import { personnesService } from '@/services/contacts/personnesService';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import debug from '@/utils/debugTagsComments';

/**
 * Hook pour charger un contact depuis le nouveau modèle relationnel
 * MIGRATION: Remplace l'accès à contacts_unified par le modèle relationnel
 * Garde la même interface pour compatibilité avec les composants existants
 */
export const useUnifiedContact = (contactId, contactType = null) => {
  const { currentOrganization } = useOrganization();
  const { getStructureWithPersonnes, getPersonneWithStructures, structures, personnes } = useContactsRelational();
  
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
        let rawContactData = getStructureWithPersonnes(contactId);
        
        if (rawContactData) {
          debug.cache.cacheHit(contactId, rawContactData);
        } else {
          debug.cache.cacheMiss(contactId, 'structure');
        }
        
        // Si pas trouvé dans le cache, essayer de charger directement depuis le service
        if (!rawContactData) {
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
              rawContactData = {
                ...structureResult.data,
                personnes: personnesAssociees
              };
            }
          } catch (error) {
            console.error('❌ [useUnifiedContact] Erreur chargement direct structure:', error);
          }
        }
        
        if (rawContactData) {
          console.log('🏷️ [useUnifiedContact] Tags présents dans rawContactData:', rawContactData.tags);
          
          // Adapter au format attendu par les composants existants
          contactData = {
            id: rawContactData.id,
            entityType: 'structure',
            structure: {
              raisonSociale: rawContactData.raisonSociale,
              type: rawContactData.type,
              email: rawContactData.email,
              telephone1: rawContactData.telephone1,
              telephone2: rawContactData.telephone2,
              fax: rawContactData.fax,
              siteWeb: rawContactData.siteWeb,
              adresse: rawContactData.adresse,
              codePostal: rawContactData.codePostal,
              ville: rawContactData.ville,
              pays: rawContactData.pays,
              isClient: rawContactData.isClient,
              notes: rawContactData.notes
            },
            tags: rawContactData.tags || [],
            commentaires: rawContactData.commentaires || [],
            personnes: rawContactData.personnes?.map(p => ({
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
            createdAt: rawContactData.createdAt,
            updatedAt: rawContactData.updatedAt
          };
        }
      } else if (detectedEntityType === 'personne') {
        console.log('👤 [useUnifiedContact] Chargement comme personne avec ID:', contactId);
        let rawContactData = getPersonneWithStructures(contactId);
        console.log('📊 [useUnifiedContact] Données personne récupérées du cache:', rawContactData);
        
        if (rawContactData) {
          debug.cache.cacheHit(contactId, rawContactData);
        } else {
          debug.cache.cacheMiss(contactId, 'personne');
        }
        
        // Si pas trouvé dans le cache, essayer de charger directement depuis le service
        if (!rawContactData) {
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
              rawContactData = {
                ...personneResult.data,
                structures
              };
            }
          } catch (error) {
            console.error('❌ [useUnifiedContact] Erreur chargement direct:', error);
          }
        }
        
        if (rawContactData) {
          console.log('🏷️ [useUnifiedContact] Tags présents dans rawContactData:', rawContactData.tags);
          
          // Adapter au format attendu par les composants existants
          contactData = {
            id: rawContactData.id,
            entityType: (rawContactData.isPersonneLibre && (!rawContactData.structures || rawContactData.structures.length === 0)) ? 'personne_libre' : 'personne',
            personne: {
              prenom: rawContactData.prenom,
              nom: rawContactData.nom,
              email: rawContactData.email,
              telephone: rawContactData.telephone,
              mobile: rawContactData.telephone2,
              adresse: rawContactData.adresse,
              codePostal: rawContactData.codePostal,
              ville: rawContactData.ville,
              pays: rawContactData.pays,
              notes: rawContactData.notes
            },
            tags: rawContactData.tags || [],
            commentaires: rawContactData.commentaires || [],
            structures: rawContactData.structures?.map(s => ({
              id: s.id,
              raisonSociale: s.raisonSociale,
              type: s.type,
              fonction: s.liaison?.fonction || '',
              actif: s.liaison?.actif,
              prioritaire: s.liaison?.prioritaire,
              interesse: s.liaison?.interesse
            })) || [],
            createdAt: rawContactData.createdAt,
            updatedAt: rawContactData.updatedAt
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
          tags: contactData.tags?.length || 0
        });
        
        // DEBUG: Tracer les données dans le hook
        debug.tags.hookData(contactId, contactData);
        debug.comments.hookData(contactId, contactData);

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

  // Utiliser directement les données du cache relationnel qui sont réactives
  useEffect(() => {
    if (!contactId || data.loading) return;
    
    // Une fois qu'on connaît le type, utiliser directement les données réactives
    if (data.entityType === 'structure') {
      const structureData = getStructureWithPersonnes(contactId);
      if (structureData) {
        console.log('🔄 [useUnifiedContact] Mise à jour réactive des données structure');
        debug.tags.hookData(contactId, structureData);
        
        // Adapter au format attendu par les composants existants
        const contactData = {
          id: structureData.id,
          entityType: 'structure',
          structure: {
            raisonSociale: structureData.raisonSociale,
            type: structureData.type,
            email: structureData.email,
            telephone1: structureData.telephone1,
            telephone2: structureData.telephone2,
            fax: structureData.fax,
            siteWeb: structureData.siteWeb,
            adresse: structureData.adresse,
            codePostal: structureData.codePostal,
            ville: structureData.ville,
            pays: structureData.pays,
            isClient: structureData.isClient,
            notes: structureData.notes
          },
          tags: structureData.tags || [],
          commentaires: structureData.commentaires || [],
          personnes: structureData.personnes?.map(p => ({
            id: p.id,
            prenom: p.prenom,
            nom: p.nom,
            fonction: p.liaison?.fonction || '',
            email: p.email,
            telephone: p.telephone,
            mobile: p.telephone2,
            mailPerso: p.email,
            adresse: p.adresse,
            codePostal: p.codePostal,
            ville: p.ville,
            pays: p.pays,
            actif: p.liaison?.actif,
            prioritaire: p.liaison?.prioritaire,
            interesse: p.liaison?.interesse
          })) || [],
          createdAt: structureData.createdAt,
          updatedAt: structureData.updatedAt
        };
        
        setData({
          contact: contactData,
          loading: false,
          error: null,
          entityType: 'structure'
        });
      }
    } else if (data.entityType === 'personne' || data.entityType === 'personne_libre') {
      const personneData = getPersonneWithStructures(contactId);
      if (personneData) {
        console.log('🔄 [useUnifiedContact] Mise à jour réactive des données personne');
        debug.tags.hookData(contactId, personneData);
        
        // Adapter au format attendu par les composants existants
        const contactData = {
          id: personneData.id,
          entityType: (personneData.isPersonneLibre && (!personneData.structures || personneData.structures.length === 0)) ? 'personne_libre' : 'personne',
          personne: {
            prenom: personneData.prenom,
            nom: personneData.nom,
            email: personneData.email,
            telephone: personneData.telephone,
            mobile: personneData.telephone2,
            adresse: personneData.adresse,
            codePostal: personneData.codePostal,
            ville: personneData.ville,
            pays: personneData.pays,
            notes: personneData.notes
          },
          tags: personneData.tags || [],
          commentaires: personneData.commentaires || [],
          structures: personneData.structures?.map(s => ({
            id: s.id,
            raisonSociale: s.raisonSociale,
            type: s.type,
            fonction: s.liaison?.fonction || '',
            actif: s.liaison?.actif,
            prioritaire: s.liaison?.prioritaire,
            interesse: s.liaison?.interesse
          })) || [],
          createdAt: personneData.createdAt,
          updatedAt: personneData.updatedAt
        };
        
        setData({
          contact: contactData,
          loading: false,
          error: null,
          entityType: contactData.entityType
        });
      }
    }
  }, [structures, personnes, contactId, data.entityType, data.loading, getStructureWithPersonnes, getPersonneWithStructures]);

  const reload = useCallback(() => {
    console.log('🔄 [useUnifiedContact] Rechargement forcé demandé');
    loadUnifiedContact(true);
  }, [loadUnifiedContact]);

  // Mémoriser le résultat pour éviter les re-renders inutiles
  const result = useMemo(() => ({
    contact: data.contact,
    loading: data.loading,
    error: data.error,
    entityType: data.entityType,
    reload
  }), [data.contact, data.loading, data.error, data.entityType, reload]);

  return result;
};