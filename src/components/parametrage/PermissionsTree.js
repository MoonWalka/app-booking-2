import React, { useState } from 'react';
import { Form, Card, Collapse } from 'react-bootstrap';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

const PermissionsTree = ({ permissions, onPermissionsChange, disabled = false }) => {
    const [expandedSections, setExpandedSections] = useState({});

    // Définition des entités et de leurs droits
    const entities = [
        { 
            key: 'activites', 
            label: 'Activités',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'adherents',
            label: 'Adhérents',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'agendas',
            label: 'Agendas',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'artistes',
            label: 'Artistes',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'backlines',
            label: 'Backlines',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'booking_request',
            label: 'Booking Request',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter', 'valider_demandes', 'voir_demandes']
        },
        {
            key: 'budgets',
            label: 'Budgets',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'budgets_modeles',
            label: 'Budgets : modèles',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'budgets_scenarios',
            label: 'Budgets : scenarios',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'budgets_date_suivi',
            label: 'Budgets de date et suivi de tournée',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'campagnes',
            label: 'Campagnes',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'collaborateurs',
            label: 'Collaborateurs',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter', 'acheter_credits']
        },
        {
            key: 'comptes_messagerie',
            label: 'Comptes de messagerie',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'contacts',
            label: 'Contacts',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'contrats',
            label: 'Contrats',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'dates',
            label: 'Dates',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter', 'supprimer_dates_ouvertes', 'modifier_dates_ouvertes', 'voir_dates_ouvertes', 'creer_evenement', 'supprimer_evenement', 'modifier_evenement']
        },
        {
            key: 'devis',
            label: 'Devis',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'diffusions',
            label: 'Diffusions',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'documents',
            label: 'Documents',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'documents_types',
            label: 'Documents types',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'dossiers_suivi',
            label: 'Dossiers de suivi',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'emails_entrants',
            label: 'E-mails entrants',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'entreprises',
            label: 'Entreprises',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'factures',
            label: 'Factures',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'fonctions',
            label: 'Fonctions',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'genres',
            label: 'Genres',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'groupes',
            label: 'Groupes',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'hebergement',
            label: 'Hébergement',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'historique',
            label: 'Historique',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'messages_taches',
            label: 'Messages & tâches',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'modeles_contrats',
            label: 'Modèles de contrats',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'moderations',
            label: 'Modérations',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        },
        {
            key: 'mots_cles',
            label: 'Mots-clés',
            rights: ['creer', 'supprimer', 'masquer', 'modifier', 'voir', 'historique', 'dupliquer', 'exporter']
        }
    ];

    // Labels des droits
    const rightsLabels = {
        creer: 'Créer',
        supprimer: 'Supprimer',
        masquer: 'Masquer',
        modifier: 'Modifier',
        voir: 'Voir',
        historique: 'Historique',
        dupliquer: 'Dupliquer',
        exporter: 'Exporter',
        acheter_credits: 'Acheter des crédits',
        supprimer_dates_ouvertes: 'Supprimer les dates ouvertes',
        valider_demandes: 'Valider les demandes',
        modifier_dates_ouvertes: 'Modifier les dates ouvertes',
        voir_demandes: 'Voir les demandes',
        voir_dates_ouvertes: 'Voir les dates ouvertes',
        creer_evenement: 'Créer un événement',
        supprimer_evenement: 'Supprimer un événement',
        modifier_evenement: 'Modifier un événement'
    };

    const toggleSection = (entityKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [entityKey]: !prev[entityKey]
        }));
    };

    const handlePermissionChange = (entityKey, rightKey, checked) => {
        if (disabled) return;
        
        const newPermissions = { ...permissions };
        if (!newPermissions[entityKey]) {
            newPermissions[entityKey] = {};
        }
        newPermissions[entityKey][rightKey] = checked;
        onPermissionsChange(newPermissions);
    };

    const isPermissionChecked = (entityKey, rightKey) => {
        return permissions[entityKey] && permissions[entityKey][rightKey] === true;
    };

    const isEntityPartiallyChecked = (entity) => {
        if (!permissions[entity.key]) return false;
        const checkedRights = entity.rights.filter(right => 
            permissions[entity.key][right] === true
        );
        return checkedRights.length > 0 && checkedRights.length < entity.rights.length;
    };

    const isEntityFullyChecked = (entity) => {
        if (!permissions[entity.key]) return false;
        return entity.rights.every(right => 
            permissions[entity.key][right] === true
        );
    };

    const toggleAllEntityRights = (entity, checked) => {
        if (disabled) return;
        
        const newPermissions = { ...permissions };
        if (!newPermissions[entity.key]) {
            newPermissions[entity.key] = {};
        }
        
        entity.rights.forEach(right => {
            newPermissions[entity.key][right] = checked;
        });
        
        onPermissionsChange(newPermissions);
    };

    return (
        <div className="permissions-tree">
            <h5 className="mb-3">Permissions par entité</h5>
            {entities.map(entity => (
                <Card key={entity.key} className="mb-2">
                    <Card.Header 
                        className="py-2 cursor-pointer d-flex align-items-center justify-content-between"
                        onClick={() => toggleSection(entity.key)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="d-flex align-items-center">
                            {expandedSections[entity.key] ? 
                                <FaChevronDown className="me-2" /> : 
                                <FaChevronRight className="me-2" />
                            }
                            <Form.Check
                                type="checkbox"
                                checked={isEntityFullyChecked(entity)}
                                ref={input => {
                                    if (input) input.indeterminate = isEntityPartiallyChecked(entity);
                                }}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    toggleAllEntityRights(entity, e.target.checked);
                                }}
                                disabled={disabled}
                                className="me-2"
                            />
                            <strong>{entity.label}</strong>
                        </div>
                    </Card.Header>
                    <Collapse in={expandedSections[entity.key]}>
                        <Card.Body className="py-2">
                            <div className="row">
                                {entity.rights.map(right => (
                                    <div key={right} className="col-md-6 col-lg-4 mb-2">
                                        <Form.Check
                                            type="checkbox"
                                            label={rightsLabels[right] || right}
                                            checked={isPermissionChecked(entity.key, right)}
                                            onChange={(e) => handlePermissionChange(entity.key, right, e.target.checked)}
                                            disabled={disabled}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Collapse>
                </Card>
            ))}
        </div>
    );
};

export default PermissionsTree;