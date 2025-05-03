import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';

/**
 * ProgrammateurConcertsSection - Affiche les concerts associés à un programmateur
 */
const ProgrammateurConcertsSection = ({ concertsAssocies = [] }) => {
  if (!concertsAssocies || concertsAssocies.length === 0) {
    return (
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Concerts associés</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted text-center my-3">
            Aucun concert associé à ce programmateur
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white">
        <h5 className="mb-0">
          Concerts associés
          <Badge bg="primary" className="ms-2">{concertsAssocies.length}</Badge>
        </h5>
      </Card.Header>
      <Table responsive hover className="mb-0">
        <thead>
          <tr>
            <th>Date</th>
            <th>Artiste</th>
            <th>Lieu</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {concertsAssocies.map((concert, index) => (
            <tr key={concert.id || index}>
              <td>{formatDate(concert.date)}</td>
              <td>{concert.artisteNom || 'Non spécifié'}</td>
              <td>{concert.lieuNom || 'Non spécifié'}</td>
              <td>
                <Badge bg={getStatusBadgeColor(concert.status)}>
                  {formatStatus(concert.status)}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

// Fonction de formatage pour la date
const formatDate = (dateString) => {
  if (!dateString) return 'Date non définie';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return 'Date incorrecte';
  }
};

// Fonction pour déterminer la couleur du badge de statut
const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};

// Fonction pour formater le status
const formatStatus = (status) => {
  switch (status) {
    case 'confirmed':
      return 'Confirmé';
    case 'pending':
      return 'En attente';
    case 'cancelled':
      return 'Annulé';
    default:
      return 'Non défini';
  }
};

export default ProgrammateurConcertsSection;