import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Alert } from 'react-bootstrap';
import { collection, query, where, onSnapshot } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { useTabs } from '@/context/TabsContext';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { useDeleteContact } from '@/hooks/contacts';

/**
 * Liste des contacts filtrée par tag
 * Utilisée dans les onglets ouverts depuis la gestion des tags
 */
function ContactsListFiltered({ filterTag, filterType, usageCount }) {
  const { currentOrganization } = useOrganization();
  const { openContactTab } = useTabs();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Callback après suppression
  const onDeleteSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const { handleDelete: handleDeleteContact } = useDeleteContact(onDeleteSuccess);

  // Chargement des contacts filtrés par tag
  useEffect(() => {
    if (!currentOrganization?.id || !filterTag) {
      setLoading(false);
      return;
    }

    console.log(`🔍 Chargement contacts avec tag "${filterTag}" (type: ${filterType})...`);
    
    // Requête pour les contacts avec le tag spécifique
    const contactsQuery = query(
      collection(db, 'contacts_unified'),
      where('organizationId', '==', currentOrganization.id),
      where('qualification.tags', 'array-contains', filterTag)
    );
    
    const unsubscribe = onSnapshot(
      contactsQuery,
      (snapshot) => {
        try {
          const contactsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Assurer la compatibilité avec ListWithFilters
            type: doc.data().type || 'personne',
            displayName: doc.data().nom || 'Sans nom',
            email: doc.data().email || '',
            telephone: doc.data().telephone || '',
            adresse: doc.data().adresse || {},
            qualification: doc.data().qualification || {}
          }));

          console.log(`✅ ${contactsData.length} contacts trouvés avec tag "${filterTag}"`);
          setContacts(contactsData);
          setError(null);
        } catch (err) {
          console.error('❌ Erreur lors du chargement des contacts filtrés:', err);
          setError('Erreur lors du chargement des contacts');
          setContacts([]);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('❌ Erreur snapshot contacts filtrés:', err);
        setError('Erreur de connexion à la base de données');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentOrganization?.id, filterTag, filterType, refreshKey]);

  // Configuration pour ListWithFilters
  const listConfig = {
    title: `Contacts avec le tag "${filterTag}"`,
    emptyMessage: usageCount === 0 
      ? `Aucun contact n'utilise encore le tag "${filterTag}". Vous pouvez commencer à l'assigner à vos contacts !`
      : `Aucun contact trouvé avec le tag "${filterTag}"`,
    searchPlaceholder: 'Rechercher dans les contacts filtrés...',
    showCreateButton: false,
    onItemClick: (contact) => {
      openContactTab(contact.id, contact.displayName || contact.nom);
    },
    onDelete: handleDeleteContact,
    renderCustomActions: (contact) => (
      <div className="d-flex gap-1">
        <Badge bg="info" className="small">
          {contact.type === 'structure' ? 'Structure' : 'Personne'}
        </Badge>
        {contact.qualification?.tags?.length > 0 && (
          <Badge bg="secondary" className="small">
            {contact.qualification.tags.length} tags
          </Badge>
        )}
      </div>
    )
  };

  // Colonnes pour l'affichage
  const columns = [
    {
      key: 'nom',
      label: 'Nom',
      sortable: true,
      render: (contact) => (
        <div>
          <strong>{contact.nom || 'Sans nom'}</strong>
          {contact.prenom && <span> {contact.prenom}</span>}
          {contact.type === 'structure' && contact.raisonSociale && (
            <div className="small text-muted">{contact.raisonSociale}</div>
          )}
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (contact) => (
        <Badge bg={contact.type === 'structure' ? 'primary' : 'success'}>
          {contact.type === 'structure' ? 'Structure' : 'Personne'}
        </Badge>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (contact) => contact.email || '-'
    },
    {
      key: 'telephone',
      label: 'Téléphone',
      sortable: true,
      render: (contact) => contact.telephone || '-'
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (contact) => (
        <div className="d-flex flex-wrap gap-1">
          {contact.qualification?.tags?.map((tag, index) => (
            <Badge 
              key={index} 
              bg={tag === filterTag ? 'warning' : 'light'} 
              text={tag === filterTag ? 'dark' : 'dark'}
              className="small"
            >
              {tag}
            </Badge>
          )) || '-'}
        </div>
      )
    }
  ];

  if (error) {
    return (
      <Container fluid className="p-4">
        <Alert variant="danger">
          <h5>Erreur de chargement</h5>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">
              <i className="bi bi-funnel me-2"></i>
              Contacts avec le tag "{filterTag}"
            </h5>
            <small className="text-muted">
              Type: <Badge bg="info" className="small">{filterType}</Badge>
              {usageCount && <span> • {usageCount} contact{usageCount > 1 ? 's' : ''} trouvé{usageCount > 1 ? 's' : ''}</span>}
            </small>
          </div>
          <Badge bg="primary" className="fs-6">
            {contacts.length} résultat{contacts.length > 1 ? 's' : ''}
          </Badge>
        </Card.Header>
      </Card>

      <ListWithFilters
        data={contacts}
        config={listConfig}
        columns={columns}
        loading={loading}
        defaultSort={{ key: 'nom', direction: 'asc' }}
      />
    </Container>
  );
}

export default ContactsListFiltered;