import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Alert, Badge, Dropdown } from 'react-bootstrap';
import { FaPlus, FaSync, FaEdit, FaTrash, FaUsers, FaKey, FaEllipsisV } from 'react-icons/fa';
import GroupeFormModal from './GroupeFormModal';
import CollaborateursModal from './CollaborateursModal';
import './GroupesPermissionsManager.css';

const GroupesPermissionsManager = () => {
    const [groupesList, setGroupesList] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('success');
    
    // États pour les modales
    const [showGroupeModal, setShowGroupeModal] = useState(false);
    const [showCollaborateursModal, setShowCollaborateursModal] = useState(false);
    const [currentGroupe, setCurrentGroupe] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Chargement initial des données
    useEffect(() => {
        loadGroupesList();
    }, []);

    const loadGroupesList = () => {
        // Simulation de données pour l'exemple
        const mockData = [
            {
                id: 1,
                nom: 'Administrateurs',
                commentaires: 'Accès complet à toutes les fonctionnalités',
                permissions: {
                    artistes: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
                    contacts: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
                    dates: { creer: true, modifier: true, voir: true, supprimer: true, historique: true }
                },
                collaborateurs: [
                    { id: 1, nom: 'Martin', prenom: 'Jean', email: 'jean.martin@example.com', role: 'Admin' }
                ],
                dateCreation: '2024-01-01',
                derniereModification: '2024-02-15'
            },
            {
                id: 2,
                nom: 'Utilisateurs standard',
                commentaires: 'Droits de consultation et modification limitée',
                permissions: {
                    artistes: { creer: true, modifier: true, voir: true, historique: true },
                    contacts: { creer: true, modifier: true, voir: true, historique: true },
                    dates: { creer: true, modifier: true, voir: true, historique: true }
                },
                collaborateurs: [
                    { id: 2, nom: 'Dupont', prenom: 'Marie', email: 'marie.dupont@example.com', role: 'Utilisateur' },
                    { id: 5, nom: 'Petit', prenom: 'Lucas', email: 'lucas.petit@example.com', role: 'Utilisateur' }
                ],
                dateCreation: '2024-01-15',
                derniereModification: '2024-02-10'
            },
            {
                id: 3,
                nom: 'Invités',
                commentaires: 'Accès en lecture seule',
                permissions: {
                    artistes: { voir: true },
                    contacts: { voir: true },
                    dates: { voir: true }
                },
                collaborateurs: [
                    { id: 3, nom: 'Bernard', prenom: 'Paul', email: 'paul.bernard@example.com', role: 'Invité' }
                ],
                dateCreation: '2024-02-01',
                derniereModification: '2024-02-01'
            },
            {
                id: 4,
                nom: 'Stagiaires',
                commentaires: 'Accès limité pour les stagiaires',
                permissions: {
                    artistes: { voir: true, modifier: true },
                    contacts: { voir: true, modifier: true },
                    dates: { voir: true }
                },
                collaborateurs: [
                    { id: 4, nom: 'Moreau', prenom: 'Sophie', email: 'sophie.moreau@example.com', role: 'Stagiaire' }
                ],
                dateCreation: '2024-02-05',
                derniereModification: '2024-02-20'
            }
        ];
        setGroupesList(mockData);
    };

    const handleNewGroupe = () => {
        setCurrentGroupe(null);
        setIsEditing(false);
        setShowGroupeModal(true);
    };

    const handleEditGroupe = (groupe) => {
        setCurrentGroupe(groupe);
        setIsEditing(true);
        setShowGroupeModal(true);
    };

    const handleDeleteGroupe = (groupe) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le groupe "${groupe.nom}" ?`)) {
            setGroupesList(groupesList.filter(item => item.id !== groupe.id));
            showSuccessMessage('Groupe supprimé avec succès');
        }
    };

    const handleSaveGroupe = (groupeData) => {
        if (isEditing) {
            setGroupesList(groupesList.map(item => 
                item.id === groupeData.id ? groupeData : item
            ));
            showSuccessMessage('Groupe modifié avec succès');
        } else {
            setGroupesList([...groupesList, groupeData]);
            showSuccessMessage('Groupe créé avec succès');
        }
    };

    const handleGererCollaborateurs = (groupe) => {
        setCurrentGroupe(groupe);
        setShowCollaborateursModal(true);
    };

    const handleSaveCollaborateurs = (groupeId, collaborateurs) => {
        setGroupesList(groupesList.map(groupe => 
            groupe.id === groupeId 
                ? { ...groupe, collaborateurs, derniereModification: new Date().toISOString() }
                : groupe
        ));
        showSuccessMessage('Collaborateurs mis à jour avec succès');
    };

    const showSuccessMessage = (message) => {
        setAlertMessage(message);
        setAlertVariant('success');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    // eslint-disable-next-line no-unused-vars
    const showErrorMessage = (message) => {
        setAlertMessage(message);
        setAlertVariant('danger');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
    };

    const getPermissionsCount = (permissions) => {
        let count = 0;
        Object.keys(permissions).forEach(entity => {
            Object.keys(permissions[entity]).forEach(right => {
                if (permissions[entity][right]) count++;
            });
        });
        return count;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    const getGroupeVariant = (nom) => {
        if (nom.toLowerCase().includes('admin')) return 'danger';
        if (nom.toLowerCase().includes('utilisateur')) return 'primary';
        if (nom.toLowerCase().includes('invité')) return 'warning';
        if (nom.toLowerCase().includes('stagiaire')) return 'info';
        return 'secondary';
    };

    return (
        <div className="groupes-permissions-manager">
            {showAlert && (
                <Alert variant={alertVariant} dismissible onClose={() => setShowAlert(false)}>
                    {alertMessage}
                </Alert>
            )}

            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h3 className="mb-0">Gestion des groupes et permissions</h3>
                            <small className="text-muted">
                                Créez des groupes avec des permissions spécifiques et affectez-y vos collaborateurs
                            </small>
                        </div>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="success" 
                                onClick={handleNewGroupe}
                                className="d-flex align-items-center gap-2"
                            >
                                <FaPlus /> Nouveau groupe / permissions
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={loadGroupesList}
                                className="d-flex align-items-center"
                            >
                                <FaSync />
                            </Button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Nom du groupe</th>
                                <th>Collaborateurs</th>
                                <th>Permissions</th>
                                <th>Dernière modification</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupesList.map(groupe => (
                                <tr key={groupe.id}>
                                    <td>
                                        <div>
                                            <Badge bg={getGroupeVariant(groupe.nom)} className="me-2">
                                                <FaKey className="me-1" />
                                                {groupe.nom}
                                            </Badge>
                                            {groupe.commentaires && (
                                                <div>
                                                    <small className="text-muted">{groupe.commentaires}</small>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <FaUsers className="me-2 text-muted" />
                                            <span className="me-2">{groupe.collaborateurs.length}</span>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={() => handleGererCollaborateurs(groupe)}
                                                className="p-0"
                                            >
                                                Gérer
                                            </Button>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg="info">
                                            {getPermissionsCount(groupe.permissions)} permissions
                                        </Badge>
                                    </td>
                                    <td>{formatDate(groupe.derniereModification)}</td>
                                    <td className="text-center">
                                        <Dropdown>
                                            <Dropdown.Toggle variant="link" size="sm" className="text-muted">
                                                <FaEllipsisV />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => handleEditGroupe(groupe)}>
                                                    <FaEdit className="me-2" />
                                                    Modifier les droits
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleGererCollaborateurs(groupe)}>
                                                    <FaUsers className="me-2" />
                                                    Gérer les collaborateurs
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item 
                                                    onClick={() => handleDeleteGroupe(groupe)}
                                                    className="text-danger"
                                                >
                                                    <FaTrash className="me-2" />
                                                    Supprimer le groupe
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {groupesList.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            <FaKey size={48} className="mb-3 opacity-50" />
                            <h5>Aucun groupe de permissions</h5>
                            <p>Créez votre premier groupe pour commencer à gérer les permissions</p>
                            <Button variant="primary" onClick={handleNewGroupe}>
                                <FaPlus className="me-2" />
                                Créer un groupe
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Modal de création/édition de groupe */}
            <GroupeFormModal
                show={showGroupeModal}
                onHide={() => setShowGroupeModal(false)}
                groupe={currentGroupe}
                onSaveGroupe={handleSaveGroupe}
                isEditing={isEditing}
            />

            {/* Modal de gestion des collaborateurs */}
            <CollaborateursModal
                show={showCollaborateursModal}
                onHide={() => setShowCollaborateursModal(false)}
                groupe={currentGroupe}
                onSaveCollaborateurs={handleSaveCollaborateurs}
            />
        </div>
    );
};

export default GroupesPermissionsManager;