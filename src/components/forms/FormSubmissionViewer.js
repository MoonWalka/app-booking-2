import React, { useState, useEffect } from 'react';
import { db } from '@/services/firebase-service';
import { doc, getDoc } from 'firebase/firestore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './FormSubmissionViewer.module.css';

/**
 * Composant pour visualiser une soumission de formulaire
 */
const FormSubmissionViewer = ({ submissionId, onValidate }) => {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const submissionDoc = await getDoc(doc(db, 'formSubmissions', submissionId));
        
        if (submissionDoc.exists()) {
          setSubmission({
            id: submissionDoc.id,
            ...submissionDoc.data()
          });
        } else {
          setError('Soumission non trouvée');
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la soumission:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  if (loading) {
    return <div>Chargement de la soumission...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!submission) {
    return null;
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('fr-FR');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'warning', text: 'En attente' },
      validated: { class: 'success', text: 'Validé' },
      rejected: { class: 'danger', text: 'Rejeté' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`badge bg-${badge.class}`}>{badge.text}</span>;
  };

  return (
    <div className={styles.submissionViewer}>
      <Card title="Détails de la soumission" className="mb-4">
        <div className="row mb-3">
          <div className="col-md-6">
            <strong>Date de soumission :</strong> {formatDate(submission.submittedAt)}
          </div>
          <div className="col-md-6">
            <strong>Statut :</strong> {getStatusBadge(submission.status)}
          </div>
        </div>
      </Card>

      {/* Données du programmateur */}
      <Card title="Informations du programmateur" className="mb-4">
        <div className="row">
          <div className="col-md-6">
            <h5>Contact</h5>
            {submission.programmateurData?.contact && (
              <dl>
                <dt>Nom</dt>
                <dd>{submission.programmateurData.contact.nom || 'N/A'}</dd>
                <dt>Prénom</dt>
                <dd>{submission.programmateurData.contact.prenom || 'N/A'}</dd>
                <dt>Email</dt>
                <dd>{submission.programmateurData.contact.email || 'N/A'}</dd>
                <dt>Téléphone</dt>
                <dd>{submission.programmateurData.contact.telephone || 'N/A'}</dd>
                <dt>Fonction</dt>
                <dd>{submission.programmateurData.contact.fonction || 'N/A'}</dd>
              </dl>
            )}
          </div>
          <div className="col-md-6">
            <h5>Structure</h5>
            {submission.programmateurData?.structure && (
              <dl>
                <dt>Raison sociale</dt>
                <dd>{submission.programmateurData.structure.raisonSociale || submission.programmateurData.structure.nom || 'N/A'}</dd>
                <dt>SIRET</dt>
                <dd>{submission.programmateurData.structure.siret || 'N/A'}</dd>
                <dt>Type</dt>
                <dd>{submission.programmateurData.structure.type || 'N/A'}</dd>
                <dt>Adresse</dt>
                <dd>
                  {submission.programmateurData.structure.adresse || ''}<br />
                  {submission.programmateurData.structure.codePostal} {submission.programmateurData.structure.ville}
                </dd>
              </dl>
            )}
          </div>
        </div>
      </Card>

      {/* Données du lieu si présentes */}
      {submission.lieuData && Object.keys(submission.lieuData).length > 0 && (
        <Card title="Informations du lieu" className="mb-4">
          <dl>
            <dt>Nom</dt>
            <dd>{submission.lieuData.nom || 'N/A'}</dd>
            <dt>Adresse</dt>
            <dd>
              {submission.lieuData.adresse || ''}<br />
              {submission.lieuData.codePostal} {submission.lieuData.ville}
            </dd>
            <dt>Capacité</dt>
            <dd>{submission.lieuData.capacite || 'N/A'}</dd>
          </dl>
        </Card>
      )}

      {/* Actions */}
      {submission.status === 'pending' && onValidate && (
        <div className="text-center mt-4">
          <Button 
            variant="success" 
            onClick={() => onValidate(submission)}
          >
            Valider et intégrer les données
          </Button>
        </div>
      )}
    </div>
  );
};

export default FormSubmissionViewer; 