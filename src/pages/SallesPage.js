import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import useGenericEntityList from '../hooks/generics/lists/useGenericEntityList';
import SalleCreationModal from '../components/common/modals/SalleCreationModal';
import '@styles/index.css';

/**
 * Formate un numéro de téléphone avec des espaces
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return phone;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  if (cleaned.length === 11 && cleaned.startsWith('33')) {
    return cleaned.replace(/(\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5 $6');
  }
  return phone;
};

/**
 * Composant pour afficher un numéro de téléphone avec toggle de formatage
 */
const PhoneDisplay = ({ phone }) => {
  const [isFormatted, setIsFormatted] = useState(() => {
    const saved = localStorage.getItem('phoneFormatPreference');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('phoneFormatPreference', isFormatted);
  }, [isFormatted]);

  if (!phone || phone === '-') return phone;

  const displayPhone = isFormatted ? formatPhoneNumber(phone) : phone;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <span>{displayPhone}</span>
      <button
        onClick={() => setIsFormatted(!isFormatted)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '1px',
          color: '#6c757d',
          fontSize: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.color = '#007bff'}
        onMouseLeave={(e) => e.target.style.color = '#6c757d'}
        title={isFormatted ? 'Afficher sans formatage' : 'Afficher avec formatage'}
      >
        <i className={isFormatted ? 'bi bi-dash-circle' : 'bi bi-plus-circle'}></i>
      </button>
    </span>
  );
};

const SallesPage = () => {
  console.log('[SallesPage] RENDER');
  const [showModal, setShowModal] = useState(false);
  
  // Récupérer la liste des salles depuis la collection 'salles'
  const { items: salles, loading: loadingSalles, error, refetch: refetchSalles } = useGenericEntityList('salles', {
    pageSize: 50,
    defaultSort: { field: 'nom', direction: 'asc' }
  });

  // Récupérer aussi les contacts qui ont des informations de salle (pour compatibilité)
  const { items: contacts, loading: loadingContacts, refetch: refetchContacts } = useGenericEntityList('contacts', {
    pageSize: 100,
    defaultSort: { field: 'salleNom', direction: 'asc' }
  });

  const handleEdit = (contactId) => {
    // TODO: Implémenter la modification du contact pour les infos de salle
    console.log('Modifier les infos de salle pour le contact:', contactId);
  };

  const handleDelete = (contactId) => {
    // TODO: Implémenter la suppression des infos de salle
    console.log('Supprimer les infos de salle pour le contact:', contactId);
  };

  const handleCreateSalle = () => {
    setShowModal(true);
  };

  const handleSalleCreated = (newSalle) => {
    // Actualiser la liste après création
    refetchSalles();
    refetchContacts();
    console.log('Nouvelle salle créée:', newSalle);
  };

  // Combiner les salles de la collection 'salles' et les infos de salle des contacts
  const sallesFromContacts = contacts?.filter(contact => 
    contact.salleNom || 
    contact.salleAdresse || 
    contact.salleVille ||
    contact.salleJauge1 ||
    contact.salleJauge2 ||
    contact.salleJauge3
  ).map(contact => ({
    id: contact.id,
    // Mapper les champs de contact vers les champs de salle
    nom: contact.salleNom,
    adresse: contact.salleAdresse,
    suiteAdresse: contact.salleSuiteAdresse,
    codePostal: contact.salleCodePostal,
    ville: contact.salleVille,
    departement: contact.salleDepartement,
    region: contact.salleRegion,
    pays: contact.sallePays,
    telephone: contact.salleTelephone,
    jauges: [contact.salleJauge1, contact.salleJauge2, contact.salleJauge3].filter(Boolean).join(' / '),
    ouverture: contact.salleOuverture,
    profondeur: contact.salleProfondeur,
    hauteur: contact.salleHauteur,
    // Marquer comme provenant d'un contact
    sourceType: 'contact',
    contactInfo: `${contact.prenom} ${contact.nom}`
  })) || [];

  // Mapper les salles de la collection 'salles'
  const sallesFromSalles = salles?.map(salle => ({
    ...salle,
    sourceType: 'salle',
    contactInfo: salle.responsable || '-'
  })) || [];

  // Combiner les deux sources
  const sallesData = [...sallesFromSalles, ...sallesFromContacts];

  if (loadingSalles || loadingContacts) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Chargement des salles...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Erreur lors du chargement des salles: {error.message || error}
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">
                <i className="bi bi-building me-2"></i>
                Salles
              </h1>
              <p className="text-muted mb-0">
                Gestion des informations techniques des salles de spectacle
              </p>
            </div>
            <Button 
              variant="primary" 
              onClick={handleCreateSalle}
              className="d-flex align-items-center"
            >
              <i className="bi bi-plus-circle me-2"></i>
              Nouvelle salle
            </Button>
          </div>
        </Col>
      </Row>

      {/* Tableau des salles */}
      {sallesData.length === 0 ? (
        <Row>
          <Col>
            <div className="text-center py-5">
              <i className="bi bi-building" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
              <h4 className="mt-3 text-muted">Aucune salle trouvée</h4>
              <p className="text-muted">
                Aucun contact ne contient d'informations de salle pour le moment.
              </p>
              <Button variant="primary" onClick={handleCreateSalle}>
                <i className="bi bi-plus-circle me-2"></i>
                Créer la première salle
              </Button>
            </div>
          </Col>
        </Row>
      ) : (
        <>
          <Row className="mb-3">
            <Col>
              <div className="bg-light p-3 rounded">
                <strong>{sallesData.length}</strong> salle{sallesData.length > 1 ? 's' : ''} trouvée{sallesData.length > 1 ? 's' : ''}
              </div>
            </Col>
          </Row>
          
          <Row>
            <Col>
              <div className="table-responsive">
                <Table striped bordered hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Nom de la salle</th>
                      <th>Adresse</th>
                      <th>Suite adresse</th>
                      <th>Code postal</th>
                      <th>Ville</th>
                      <th>Département</th>
                      <th>Région</th>
                      <th>Pays</th>
                      <th>Téléphone</th>
                      <th>Jauge 1</th>
                      <th>Jauge 2</th>
                      <th>Jauge 3</th>
                      <th>Ouverture</th>
                      <th>Profondeur</th>
                      <th>Hauteur</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sallesData.map((salle, index) => (
                      <tr key={salle.id || index}>
                        <td>
                          <strong>{salle.nom || '-'}</strong>
                          <div className="text-muted small">
                            {salle.sourceType === 'contact' ? (
                              <>📧 Contact: {salle.contactInfo}</>
                            ) : (
                              <>🏢 Responsable: {salle.contactInfo}</>
                            )}
                          </div>
                        </td>
                        <td>{salle.adresse || '-'}</td>
                        <td>{salle.suiteAdresse || salle.suiteAdresse2 || salle.suiteAdresse3 || '-'}</td>
                        <td>{salle.codePostal || '-'}</td>
                        <td>{salle.ville || '-'}</td>
                        <td>{salle.departement || '-'}</td>
                        <td>{salle.region || '-'}</td>
                        <td>{salle.pays || '-'}</td>
                        <td><PhoneDisplay phone={salle.telephone || '-'} /></td>
                        <td>
                          <span className="fw-bold text-primary">
                            {salle.jauges || '-'}
                          </span>
                        </td>
                        <td>-</td>
                        <td>-</td>
                        <td>{salle.ouverture || '-'}</td>
                        <td>{salle.profondeur || '-'}</td>
                        <td>{salle.hauteur || '-'}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(salle.id)}
                              title="Modifier"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(salle.id)}
                              title="Supprimer"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>
          
          {/* Footer avec compteur */}
          <Row className="mt-3">
            <Col>
              <div className="text-muted text-center">
                Affichage de {sallesData.length} salle{sallesData.length > 1 ? 's' : ''}
              </div>
            </Col>
          </Row>
        </>
      )}

      {/* Modal de création de salle */}
      <SalleCreationModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSalleCreated={handleSalleCreated}
      />
    </Container>
  );
};

export default SallesPage; 