import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Hook pour récupérer les contrats associés à un contact ou une structure
 * Les contrats sont liés via les concerts
 */
export const useContactContrats = (entityId, entityType = 'contact') => {
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id;

  // Fonction pour normaliser les statuts devis Firebase vers les statuts attendus
  const normalizeDevisStatus = (status) => {
    if (!status) return null;
    const statusMap = {
      'generated': 'genere',
      'sent': 'envoye', 
      'accepted': 'accepte',
      'rejected': 'refuse',
      'draft': 'brouillon'
    };
    return statusMap[status] || status;
  };

  // Fonction utilitaire pour récupérer le statut d'un devis
  const getDevisStatus = async (devisId) => {
    if (!devisId) return null;
    try {
      const devisRef = doc(db, 'devis', devisId);
      const devisSnap = await getDoc(devisRef);
      if (devisSnap.exists()) {
        const devisData = devisSnap.data();
        return {
          id: devisId,
          status: devisData.status || devisData.statut || 'brouillon',
          dateCreation: devisData.dateCreation,
          montant: devisData.montantTotal || devisData.montant
        };
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du devis:', err);
    }
    return null;
  };

  // Fonction utilitaire pour récupérer le statut d'une facture
  const getFactureStatus = async (factureId) => {
    if (!factureId) return null;
    try {
      const factureRef = doc(db, 'factures', factureId);
      const factureSnap = await getDoc(factureRef);
      if (factureSnap.exists()) {
        const factureData = factureSnap.data();
        return {
          id: factureId,
          status: factureData.status || factureData.statut || 'brouillon',
          dateCreation: factureData.dateCreation,
          dateEcheance: factureData.dateEcheance,
          montantTotal: factureData.montantTotal || factureData.montant,
          montantPaye: factureData.montantPaye || 0,
          envoye: factureData.envoye || false
        };
      }
    } catch (err) {
      console.error('Erreur lors de la récupération de la facture:', err);
    }
    return null;
  };

  useEffect(() => {
    console.log('[useContactContrats] Hook appelé avec:', { entityId, entityType, organizationId });
    
    if (!entityId || !organizationId) {
      console.log('[useContactContrats] Pas d\'entityId ou organizationId, arrêt');
      setContrats([]);
      return;
    }

    const fetchContactContrats = async () => {
      setLoading(true);
      setError(null);

      try {
        let structureId = entityId;
        
        // Si c'est un contact, récupérer sa structure
        if (entityType === 'contact') {
          const contactRef = doc(db, 'contacts', entityId);
          const contactSnap = await getDoc(contactRef);
          
          if (!contactSnap.exists()) {
            console.warn('Contact non trouvé:', entityId);
            setContrats([]);
            return;
          }

          const contactData = contactSnap.data();
          structureId = contactData.structureId || contactData.structureReference;
          
          if (!structureId) {
            console.log('Contact sans structure associée');
            setContrats([]);
            return;
          }
        }

        // 2. Récupérer tous les concerts de la structure
        console.log('[useContactContrats] Recherche des concerts pour la structure:', structureId);
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('structureId', '==', structureId)
        );
        const concertsSnapshot = await getDocs(concertsQuery);
        console.log('[useContactContrats] Nombre de concerts trouvés:', concertsSnapshot.size);
        
        if (concertsSnapshot.empty) {
          console.log('[useContactContrats] Aucun concert trouvé pour cette structure');
          setContrats([]);
          return;
        }

        // 3. Récupérer les contrats pour chaque concert
        const contratsPromises = concertsSnapshot.docs.map(async (concertDoc) => {
          const concertData = { id: concertDoc.id, ...concertDoc.data() };
          
          // Rechercher dans la collection contrats globale
          // Les contrats utilisent l'ID du concert comme ID de document
          const contratRef = doc(db, 'contrats', concertDoc.id);
          const contratSnap = await getDoc(contratRef);
          
          const contratsFromQuery = [];
          if (contratSnap.exists()) {
            const contratData = contratSnap.data();
            console.log(`[useContactContrats] Contrat trouvé:`, {
              id: contratSnap.id,
              negociation: contratData.negociation,
              montantHT: contratData.montantHT,
              montantTTC: contratData.montantTTC,
              devisId: contratData.devisId,
              factureId: contratData.factureId
            });
            contratsFromQuery.push({ id: contratSnap.id, ...contratData });
          }
          
          console.log(`[useContactContrats] Concert ${concertDoc.id}: ${contratsFromQuery.length} contrats trouvés`);

          // Enrichir chaque contrat avec les données de devis et facture
          const enrichedContrats = await Promise.all(contratsFromQuery.map(async (contrat) => {
            // Récupérer les informations du devis et de la facture
            const [devisInfo, factureInfo] = await Promise.all([
              getDevisStatus(contrat.devisId),
              getFactureStatus(contrat.factureId)
            ]);

            return {
              ...contrat,
              concert: concertData,
              concertId: concertDoc.id,
              structureId: structureId, // Ajouter structureId pour les handlers devis
              // Ajouter des champs utiles pour l'affichage
              dateEvenement: concertData.date,
              artisteNom: concertData.artisteNom || concertData.artiste?.nom,
              lieu: concertData.lieu,
              ville: concertData.ville,
              artiste: concertData.artiste || { nom: concertData.artisteNom },
              // Mapper les montants directement ici aussi
              totalHT: contrat.negociation?.montantNet || contrat.montantHT || 0,
              totalTTC: contrat.negociation?.montantTTC || contrat.montantTTC || 0,
              montantConsolideHT: contrat.montantConsolideHT || contrat.negociation?.montantNet || contrat.montantHT || 0,
              // Enrichissement devis - normaliser les statuts
              devisInfo: devisInfo,
              devisStatus: devisInfo ? normalizeDevisStatus(devisInfo.status) : null,
              hasDevis: !!devisInfo,
              // Enrichissement facture
              factureInfo: factureInfo,
              factureStatus: factureInfo?.status || null,
              hasFacture: !!factureInfo
            };
          }));

          return enrichedContrats;
        });

        // 4. Aplatir le tableau de résultats
        const contratsResults = await Promise.all(contratsPromises);
        const allContrats = contratsResults.flat();
        console.log('[useContactContrats] Nombre total de contrats trouvés:', allContrats.length);

        // 5. Récupérer les informations de structure pour chaque contrat
        const contratsWithStructure = await Promise.all(
          allContrats.map(async (contrat) => {
            try {
              // Récupérer les infos de la structure
              const structureRef = doc(db, 'structures', structureId);
              const structureSnap = await getDoc(structureRef);
              
              if (structureSnap.exists()) {
                const structureData = structureSnap.data();
                return {
                  ...contrat,
                  raisonSociale: structureData.raisonSociale || structureData.nom,
                  structureNom: structureData.nom,
                  // Ajouter les champs requis pour le tableau
                  ref: contrat.numeroContrat || contrat.reference || `CONT-${contrat.id?.substring(0, 6)}`,
                  entrepriseCode: contrat.entrepriseCode || currentOrganization?.nom || currentOrganization?.code || 'TC',
                  collaborateurCode: contrat.collaborateurCode || contrat.collaborateur?.code || '—',
                  type: contrat.type || 'Cession',
                  envoye: contrat.envoye || false,
                  signe: contrat.signe || false,
                  dateValidite: contrat.dateValidite || contrat.dateEvenement,
                  dateSignature: contrat.dateSignature,
                  // Conserver les montants déjà mappés
                  montantPaye: contrat.montantPaye || 0,
                  devise: contrat.negociation?.devise || contrat.devise || 'EUR',
                  contratGenere: contrat.status !== 'draft'
                };
              }
            } catch (err) {
              console.error('Erreur lors de la récupération de la structure:', err);
            }
            return contrat;
          })
        );

        // 6. Trier par date d'événement (plus récent en premier)
        contratsWithStructure.sort((a, b) => {
          const dateA = a.dateEvenement?.toDate?.() || new Date(a.dateEvenement);
          const dateB = b.dateEvenement?.toDate?.() || new Date(b.dateEvenement);
          return dateB - dateA;
        });

        console.log('[useContactContrats] Contrats enrichis avec devis/factures:', 
          contratsWithStructure.map(c => ({
            id: c.id,
            hasDevis: c.hasDevis,
            devisStatus: c.devisStatus,
            hasFacture: c.hasFacture,
            factureStatus: c.factureStatus
          }))
        );

        setContrats(contratsWithStructure);
      } catch (err) {
        console.error('Erreur lors de la récupération des contrats du contact:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContactContrats();
  }, [entityId, entityType, organizationId, currentOrganization]);

  return { contrats, loading, error };
};