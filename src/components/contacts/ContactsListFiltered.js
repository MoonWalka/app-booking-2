import React, { useState, useMemo } from 'react';
import { Container, Card, Badge, Alert } from 'react-bootstrap';
import { useOrganization } from '@/context/OrganizationContext';
import { useTabs } from '@/context/TabsContext';
import { useContactsRelational } from '@/hooks/contacts/useContactsRelational';
import ListWithFilters from '@/components/ui/ListWithFilters';
import { useDeleteContactRelational } from '@/hooks/contacts';

/**
 * Liste des contacts filtrée par tag - MODÈLE RELATIONNEL
 * Utilise useContactsRelational pour filtrer structures et personnes par tags
 * Utilisée dans les onglets ouverts depuis la gestion des tags
 */
function ContactsListFiltered({ filterTag, filterType, usageCount }) {
  useOrganization(); // Pour le contexte
  const { openContactTab } = useTabs();
  
  // Utiliser le hook relationnel
  const { 
    structures, 
    personnes, 
    loading, 
    error 
  } = useContactsRelational();

  // Callback après suppression
  const onDeleteSuccess = () => {
    // Les données se mettront à jour automatiquement via les listeners Firebase
  };
  
  const { handleDelete: handleDeleteContact } = useDeleteContactRelational(onDeleteSuccess);

  // Filtrer les contacts par tag depuis le modèle relationnel
  const filteredContacts = useMemo(() => {
    if (!filterTag) return [];
    
    console.log(`🔍 Filtrage contacts avec tag "${filterTag}" (type: ${filterType})...`);
    
    const contacts = [];
    
    // Filtrer les structures par tag
    structures
      .filter(structure => structure.tags && structure.tags.includes(filterTag))
      .forEach(structure => {
        contacts.push({
          id: structure.id,
          entityType: 'structure',
          type: 'structure',
          nom: structure.raisonSociale || 'Structure sans nom',
          raisonSociale: structure.raisonSociale,
          displayName: structure.raisonSociale || 'Structure sans nom',
          email: structure.email || '',
          telephone: structure.telephone1 || '',
          ville: structure.ville || '',
          tags: structure.tags || [],
          isClient: structure.isClient,
          createdAt: structure.createdAt,
          updatedAt: structure.updatedAt
        });
      });
    
    // Filtrer les personnes par tag
    personnes
      .filter(personne => personne.tags && personne.tags.includes(filterTag))
      .forEach(personne => {
        contacts.push({
          id: personne.id,
          entityType: personne.isPersonneLibre ? 'personne_libre' : 'personne',
          type: 'personne',
          nom: personne.nom || '',
          prenom: personne.prenom || '',
          displayName: `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Personne sans nom',
          email: personne.email || '',
          telephone: personne.telephone || '',
          ville: personne.ville || '',
          tags: personne.tags || [],
          isPersonneLibre: personne.isPersonneLibre,
          createdAt: personne.createdAt,
          updatedAt: personne.updatedAt
        });
      });
    
    console.log(`✅ ${contacts.length} contacts trouvés avec tag "${filterTag}"`);
    return contacts;
  }, [structures, personnes, filterTag, filterType]);

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
        {contact.tags?.length > 0 && (
          <Badge bg="secondary" className="small">
            {contact.tags.length} tags
          </Badge>
        )}
        {contact.isClient && (
          <Badge bg="success" className="small ms-1">
            Client
          </Badge>
        )}
        {contact.isPersonneLibre && (
          <Badge bg="warning" className="small ms-1">
            Libre
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
      key: 'ville',
      label: 'Ville',
      sortable: true,
      render: (contact) => contact.ville || '-'
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (contact) => (
        <div className="d-flex flex-wrap gap-1">
          {contact.tags?.map((tag, index) => (
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
            {filteredContacts.length} résultat{filteredContacts.length > 1 ? 's' : ''}
          </Badge>
        </Card.Header>
      </Card>

      <ListWithFilters
        data={filteredContacts}
        config={listConfig}
        columns={columns}
        loading={loading}
        defaultSort={{ key: 'nom', direction: 'asc' }}
      />
    </Container>
  );
}

export default ContactsListFiltered;