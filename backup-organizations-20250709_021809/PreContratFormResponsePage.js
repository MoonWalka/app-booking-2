import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import preContratService from '@/services/preContratService';
import PreContratFormContainer from '@/components/forms/public/PreContratFormContainer';
import PublicFormLayout from '@/components/forms/public/PublicFormLayout';

/**
 * Page publique pour le formulaire de pré-contrat
 * Route: /pre-contrat/:dateId/:token
 */
function PreContratFormResponsePage() {
  const { dateId, token } = useParams();
  const [organizationName, setOrganizationName] = useState('');

  useEffect(() => {
    const fetchOrganizationName = async () => {
      try {
        // Valider le token et récupérer le pré-contrat
        const validationResult = await preContratService.validateToken(dateId, token);
        
        if (validationResult.valid && validationResult.preContrat?.entrepriseId) {
          // Récupérer les données de l'organisation
          const orgDoc = await getDoc(doc(db, 'organizations', validationResult.preContrat.entrepriseId));
          if (orgDoc.exists()) {
            const orgData = orgDoc.data();
            setOrganizationName(orgData.name || 'TourCraft');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'organisation:', error);
      }
    };

    if (dateId && token) {
      fetchOrganizationName();
    }
  }, [dateId, token]);

  return (
    <PublicFormLayout organizationName={organizationName}>
      <PreContratFormContainer dateId={dateId} token={token} />
    </PublicFormLayout>
  );
}

export default PreContratFormResponsePage;