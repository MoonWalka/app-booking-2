import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStructureDetails } from '@/hooks/structures';
import Button from '@/components/ui/Button';
import ContactEntityTable from '@/components/contacts/ContactEntityTable';
import ContactQualificationSection from '@/components/contacts/sections/ContactQualificationSection';
import ContactDiffusionSection from '@/components/contacts/sections/ContactDiffusionSection';
import EntityViewTabs from '@/components/common/EntityViewTabs';
import styles from './StructureViewTabs.module.css';

const StructureViewTabs = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    structure,
    loading,
    error,
    isEditing,
    formData,
    setFormData,
    contacts,
    concerts,
    lieux
  } = useStructureDetails(id);

  // Gestionnaire de navigation vers une personne
  const handlePersonAction = (action, personId) => {
    if (action === 'modifier' && personId) {
      navigate(`/contacts/${personId}/edit`);
    } else if (action === 'supprimer' && personId) {
      console.log('Supprimer personne:', personId);
    }
  };

  const renderBottomContent = (activeBottomTab) => {
    const commonTableProps = {
      showHeader: true,
      itemsPerPage: 5
    };

    switch (activeBottomTab) {
      case 'correspondance':
        return (
          <ContactEntityTable
            title="Correspondance"
            data={contacts || []}
            columns={[
              { key: 'nom', label: 'Nom' },
              { key: 'prenom', label: 'Prénom' },
              { key: 'email', label: 'Email' },
              { key: 'telephone', label: 'Téléphone' }
            ]}
            actions={[
              { 
                label: 'Modifier', 
                onClick: (item) => handlePersonAction('modifier', item.id),
                variant: 'outline-primary',
                size: 'sm'
              },
              { 
                label: 'Supprimer', 
                onClick: (item) => handlePersonAction('supprimer', item.id),
                variant: 'outline-danger',
                size: 'sm'
              }
            ]}
            addButtonLabel="Nouveau contact"
            onAdd={() => navigate('/contacts/nouveau')}
            {...commonTableProps}
          />
        );

      case 'lieux':
        return (
          <ContactEntityTable
            title="Lieux"
            data={lieux || []}
            columns={[
              { key: 'nom', label: 'Nom' },
              { key: 'ville', label: 'Ville' },
              { key: 'type', label: 'Type' },
              { key: 'capacite', label: 'Capacité' }
            ]}
            actions={[
              { 
                label: 'Voir', 
                onClick: (item) => navigate(`/lieux/${item.id}`),
                variant: 'outline-primary',
                size: 'sm'
              }
            ]}
            addButtonLabel="Nouveau lieu"
            onAdd={() => navigate('/lieux/nouveau')}
            {...commonTableProps}
          />
        );

      case 'diffusion':
        return (
          <ContactEntityTable
            title="Concerts"
            data={concerts || []}
            columns={[
              { key: 'titre', label: 'Titre' },
              { key: 'date', label: 'Date' },
              { key: 'lieu', label: 'Lieu' },
              { key: 'statut', label: 'Statut' }
            ]}
            actions={[
              { 
                label: 'Voir', 
                onClick: (item) => navigate(`/concerts/${item.id}`),
                variant: 'outline-primary',
                size: 'sm'
              }
            ]}
            addButtonLabel="Nouveau concert"
            onAdd={() => navigate('/concerts/nouveau')}
            {...commonTableProps}
          />
        );

      case 'dates':
        return (
          <ContactEntityTable
            title="Dates"
            data={concerts || []}
            columns={[
              { key: 'artiste', label: 'Artiste' },
              { key: 'propositionArtistique', label: 'Proposition artistique' },
              { key: 'ville', label: 'Ville' },
              { key: 'priseOption', label: 'Prise d\'option' },
              { key: 'dateDebut', label: 'Début' },
              { key: 'dateFin', label: 'Fin' },
              { key: 'montant', label: 'Montant' }
            ]}
            actions={[
              { 
                label: 'Formulaire', 
                onClick: (item) => navigate(`/concerts/${item.id}/formulaire`),
                variant: 'outline-success',
                size: 'sm'
              },
              { 
                label: 'Contrat', 
                onClick: (item) => navigate(`/contrats/generate/${item.id}`),
                variant: 'outline-primary',
                size: 'sm'
              },
              { 
                label: 'Facture', 
                onClick: (item) => navigate(`/factures/generate/${item.id}`),
                variant: 'outline-warning',
                size: 'sm'
              }
            ]}
            addButtonLabel="Nouvelle date"
            onAdd={() => navigate('/concerts/nouveau')}
            {...commonTableProps}
          />
        );

      case 'contrats':
        return (
          <ContactEntityTable
            title="Contrats"
            data={[]}
            columns={[
              { key: 'numero', label: 'Numéro' },
              { key: 'concert', label: 'Concert' },
              { key: 'statut', label: 'Statut' },
              { key: 'dateCreation', label: 'Date création' }
            ]}
            actions={[
              { 
                label: 'Voir', 
                onClick: (item) => navigate(`/contrats/${item.id}`),
                variant: 'outline-primary',
                size: 'sm'
              }
            ]}
            addButtonLabel="Nouveau contrat"
            onAdd={() => navigate('/contrats/nouveau')}
            {...commonTableProps}
          />
        );

      case 'factures':
        return (
          <ContactEntityTable
            title="Factures"
            data={[]}
            columns={[
              { key: 'numero', label: 'Numéro' },
              { key: 'concert', label: 'Concert' },
              { key: 'montant', label: 'Montant' },
              { key: 'statut', label: 'Statut' }
            ]}
            actions={[
              { 
                label: 'Voir', 
                onClick: (item) => navigate(`/factures/${item.id}`),
                variant: 'outline-primary',
                size: 'sm'
              }
            ]}
            addButtonLabel="Nouvelle facture"
            onAdd={() => navigate('/factures/nouveau')}
            {...commonTableProps}
          />
        );

      default:
        return <div>Contenu à venir</div>;
    }
  };

  // Configuration pour le composant générique
  const config = {
    defaultBottomTab: 'correspondance',
    notFoundIcon: 'bi-building-x',
    notFoundTitle: 'Structure non trouvée',
    notFoundMessage: 'La structure demandée n\'existe pas ou n\'est plus disponible.',
    
    bottomTabs: [
      { id: 'correspondance', label: 'Correspondance', icon: 'bi-envelope', color: '#28a745' },
      { id: 'lieux', label: 'Lieux', icon: 'bi-geo-alt', color: '#fd7e14' },
      { id: 'diffusion', label: 'Diffusion', icon: 'bi-broadcast', color: '#6f42c1' },
      { id: 'dates', label: 'Dates', icon: 'bi-calendar-event', color: '#dc3545' },
      { id: 'contrats', label: 'Contrats', icon: 'bi-file-earmark-text', color: '#007bff' },
      { id: 'factures', label: 'Factures', icon: 'bi-receipt', color: '#ffc107' }
    ],

    topSections: [
      {
        className: 'topLeft',
        title: 'Info générale',
        icon: 'bi bi-building',
        render: (structure) => (
          <div className={styles.structureInfo}>
            <h2>{structure.nom || 'Structure sans nom'}</h2>
            <p><strong>Type:</strong> {structure.type || 'Non spécifié'}</p>
            {structure.email && <p><strong>Email:</strong> {structure.email}</p>}
            {structure.telephone && <p><strong>Téléphone:</strong> {structure.telephone}</p>}
            {structure.adresse && <p><strong>Adresse:</strong> {structure.adresse}</p>}
          </div>
        )
      },
      {
        className: 'topRight',
        title: 'Qualification',
        icon: 'bi bi-award',
        render: () => (
          <ContactQualificationSection
            formData={formData}
            setFormData={setFormData}
            isEditing={isEditing}
          />
        )
      },
      {
        className: 'middleLeft',
        title: 'Personnes',
        icon: 'bi bi-people',
        render: () => (
          <div className={styles.personsList}>
            {contacts?.slice(0, 3).map((contact, index) => (
              <div key={contact.id || index} className={styles.personItem}>
                <div className={styles.personInfo}>
                  <span className={styles.personName}>
                    {contact.nom} {contact.prenom}
                  </span>
                  <span className={styles.personEmail}>{contact.email}</span>
                </div>
                <div className={styles.personActions}>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handlePersonAction('modifier', contact.id)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handlePersonAction('supprimer', contact.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
            ))}
            {(!contacts || contacts.length === 0) && (
              <p className={styles.emptyMessage}>Aucune personne associée</p>
            )}
          </div>
        )
      },
      {
        className: 'middleRight',
        title: 'Diffusion',
        icon: 'bi bi-broadcast',
        render: () => (
          <ContactDiffusionSection
            formData={formData}
            setFormData={setFormData}
            isEditing={isEditing}
          />
        )
      }
    ],

    renderBottomTabContent: renderBottomContent
  };

  return (
    <EntityViewTabs
      entity={structure}
      loading={loading}
      error={error}
      entityType="structure"
      config={config}
    />
  );
};

export default StructureViewTabs;