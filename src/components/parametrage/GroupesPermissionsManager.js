import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Alert, Badge, Dropdown } from 'react-bootstrap';
import { FaPlus, FaSync, FaEdit, FaTrash, FaUsers, FaKey, FaEllipsisV } from 'react-icons/fa';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import GroupeFormModal from './GroupeFormModal';
import CollaborateursModal from './CollaborateursModal';
import './GroupesPermissionsManager.css';

const GroupesPermissionsManager = () => {
    const { currentEntreprise } = useEntreprise();
    const [groupesList, setGroupesList] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('success');
    const [loading, setLoading] = useState(true);
    
    // États pour les modales
    const [showGroupeModal, setShowGroupeModal] = useState(false);
    const [showCollaborateursModal, setShowCollaborateursModal] = useState(false);
    const [currentGroupe, setCurrentGroupe] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Chargement initial des données
    useEffect(() => {
        if (currentEntreprise?.id) {
            loadGroupesList();
        }
    }, [currentEntreprise?.id]);

    const loadGroupesList = async () => {
        if (!currentEntreprise?.id) return;
        
        setLoading(true);
        try {
            // Charger les groupes depuis Firebase
            const groupesRef = collection(db, 'entreprises', currentEntreprise.id, 'groupesPermissions');
            const groupesSnapshot = await getDocs(groupesRef);
            
            const groupes = [];
            groupesSnapshot.forEach(doc => {
                groupes.push({ id: doc.id, ...doc.data() });
            });
            
            // Si aucun groupe n'existe, créer les groupes par défaut
            if (groupes.length === 0) {
                const defaultGroups = [
                    {
                        id: 'admin',
                        nom: 'Administrateurs',
                        commentaires: 'Accès complet à toutes les fonctionnalités',
                        permissions: {
                            artistes: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
                            contacts: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
                            dates: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
                            entreprises: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
                            collaborateurs: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
                            contrats: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
                            factures: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
                            parametrage: { modifier: true }
                        },
                        collaborateurs: [],
                        dateCreation: new Date().toISOString(),
                        derniereModification: new Date().toISOString()
                    },
                    {
                        id: 'utilisateur',
                        nom: 'Utilisateurs standard',
                        commentaires: 'Droits de consultation et modification limitée',
                        permissions: {
                            artistes: { creer: true, modifier: true, voir: true, historique: true },
                            contacts: { creer: true, modifier: true, voir: true, historique: true },
                            dates: { creer: true, modifier: true, voir: true, historique: true },
                            entreprises: { voir: true },
                            collaborateurs: { voir: true },
                            contrats: { creer: true, modifier: true, voir: true },
                            factures: { voir: true }
                        },
                        collaborateurs: [],
                        dateCreation: new Date().toISOString(),
                        derniereModification: new Date().toISOString()
                    },
                    {
                        id: 'invite',
                        nom: 'Invités',
                        commentaires: 'Accès en lecture seule',
                        permissions: {
                            artistes: { voir: true },
                            contacts: { voir: true },
                            dates: { voir: true }
                        },
                        collaborateurs: [],
                        dateCreation: new Date().toISOString(),
                        derniereModification: new Date().toISOString()
                    },
                    {
                        id: 'stagiaire',
                        nom: 'Stagiaires',
                        commentaires: 'Accès limité pour les stagiaires',
                        permissions: {
                            artistes: { voir: true, modifier: true },
                            contacts: { voir: true, modifier: true },
                            dates: { voir: true }
                        },
                        collaborateurs: [],
                        dateCreation: new Date().toISOString(),
                        derniereModification: new Date().toISOString()
                    }
                ];
                
                // Sauvegarder les groupes par défaut
                for (const groupe of defaultGroups) {
                    const groupeRef = doc(db, 'entreprises', currentEntreprise.id, 'groupesPermissions', groupe.id);
                    await setDoc(groupeRef, groupe);
                    groupes.push(groupe);
                }
            }
            
            setGroupesList(groupes);
        } catch (error) {
            console.error('Erreur lors du chargement des groupes:', error);
            showErrorMessage('Erreur lors du chargement des groupes');
        } finally {
            setLoading(false);
        }
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

    const handleDeleteGroupe = async (groupe) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le groupe "${groupe.nom}" ?`)) {
            try {
                setLoading(true);
                // Supprimer de Firebase
                const groupeRef = doc(db, 'entreprises', currentEntreprise.id, 'groupesPermissions', groupe.id);
                await deleteDoc(groupeRef);
                
                // Mettre à jour l'état local
                setGroupesList(groupesList.filter(item => item.id !== groupe.id));
                showSuccessMessage('Groupe supprimé avec succès');
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                showErrorMessage('Erreur lors de la suppression du groupe');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveGroupe = async (groupeData) => {
        try {
            setLoading(true);
            
            let groupeToSave = {
                ...groupeData,
                derniereModification: new Date().toISOString()
            };
            
            if (isEditing) {
                // Modifier le groupe existant
                const groupeRef = doc(db, 'entreprises', currentEntreprise.id, 'groupesPermissions', groupeData.id);
                await setDoc(groupeRef, groupeToSave, { merge: true });
                
                setGroupesList(groupesList.map(item => 
                    item.id === groupeData.id ? groupeToSave : item
                ));
                showSuccessMessage('Groupe modifié avec succès');
            } else {
                // Créer un nouveau groupe
                const newId = `groupe_${Date.now()}`;
                groupeToSave = {
                    ...groupeToSave,
                    id: newId,
                    dateCreation: new Date().toISOString(),
                    collaborateurs: []
                };
                
                const groupeRef = doc(db, 'entreprises', currentEntreprise.id, 'groupesPermissions', newId);
                await setDoc(groupeRef, groupeToSave);
                
                setGroupesList([...groupesList, groupeToSave]);
                showSuccessMessage('Groupe créé avec succès');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            showErrorMessage('Erreur lors de la sauvegarde du groupe');
        } finally {
            setLoading(false);
        }
    };

    const handleGererCollaborateurs = (groupe) => {
        setCurrentGroupe(groupe);
        setShowCollaborateursModal(true);
    };

    const handleSaveCollaborateurs = async (groupeId, collaborateurs) => {
        try {
            setLoading(true);
            
            // Mettre à jour dans Firebase
            const groupeRef = doc(db, 'entreprises', currentEntreprise.id, 'groupesPermissions', groupeId);
            await setDoc(groupeRef, {
                collaborateurs,
                derniereModification: new Date().toISOString()
            }, { merge: true });
            
            // Mettre à jour l'état local
            setGroupesList(groupesList.map(groupe => 
                groupe.id === groupeId 
                    ? { ...groupe, collaborateurs, derniereModification: new Date().toISOString() }
                    : groupe
            ));
            showSuccessMessage('Collaborateurs mis à jour avec succès');
        } catch (error) {
            console.error('Erreur lors de la mise à jour des collaborateurs:', error);
            showErrorMessage('Erreur lors de la mise à jour des collaborateurs');
        } finally {
            setLoading(false);
        }
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
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                            <p className="mt-3">Chargement des groupes...</p>
                        </div>
                    ) : (
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