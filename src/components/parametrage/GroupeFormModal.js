import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Dropdown, ButtonGroup } from 'react-bootstrap';
import { FaCopy } from 'react-icons/fa';
import PermissionsTree from './PermissionsTree';

const GroupeFormModal = ({ show, onHide, groupe, onSaveGroupe, isEditing = false }) => {
    const [formData, setFormData] = useState({
        nom: '',
        commentaires: '',
        permissions: {},
        groupeModele: ''
    });
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // Groupes modèles disponibles
    const groupesModeles = [
        { 
            key: 'admin', 
            label: 'Admin',
            permissions: {
                artistes: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
                contacts: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
                dates: { creer: true, modifier: true, voir: true, supprimer: true, historique: true }
            }
        },
        { 
            key: 'utilisateur', 
            label: 'Utilisateur',
            permissions: {
                artistes: { creer: true, modifier: true, voir: true, historique: true },
                contacts: { creer: true, modifier: true, voir: true, historique: true },
                dates: { creer: true, modifier: true, voir: true, historique: true }
            }
        },
        { 
            key: 'invite', 
            label: 'Invité',
            permissions: {
                artistes: { voir: true },
                contacts: { voir: true },
                dates: { voir: true }
            }
        },
        { 
            key: 'stagiaire', 
            label: 'Stagiaire',
            permissions: {
                artistes: { voir: true, modifier: true },
                contacts: { voir: true, modifier: true },
                dates: { voir: true }
            }
        },
        { 
            key: 'test_group', 
            label: 'Test group',
            permissions: {
                artistes: { voir: true, creer: true },
                contacts: { voir: true },
                dates: { voir: true, creer: true }
            }
        }
    ];

    useEffect(() => {
        if (show) {
            if (isEditing && groupe) {
                setFormData({
                    nom: groupe.nom || '',
                    commentaires: groupe.commentaires || '',
                    permissions: groupe.permissions || {},
                    groupeModele: ''
                });
            } else {
                setFormData({
                    nom: '',
                    commentaires: '',
                    permissions: {},
                    groupeModele: ''
                });
            }
        }
    }, [show, isEditing, groupe]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePermissionsChange = (newPermissions) => {
        setFormData(prev => ({
            ...prev,
            permissions: newPermissions
        }));
    };

    const handleGroupeModeleSelect = (modeleKey) => {
        const modele = groupesModeles.find(g => g.key === modeleKey);
        if (modele) {
            setFormData(prev => ({
                ...prev,
                groupeModele: modeleKey,
                permissions: { ...modele.permissions }
            }));
            showSuccessMessage(`Permissions copiées depuis le modèle "${modele.label}"`);
        }
    };

    const handleSave = () => {
        if (!formData.nom.trim()) {
            showErrorMessage('Le nom du groupe est obligatoire');
            return;
        }

        const groupeData = {
            id: isEditing ? groupe.id : Date.now(),
            nom: formData.nom.trim(),
            commentaires: formData.commentaires.trim(),
            permissions: formData.permissions,
            collaborateurs: isEditing ? groupe.collaborateurs || [] : [],
            dateCreation: isEditing ? groupe.dateCreation : new Date().toISOString(),
            derniereModification: new Date().toISOString()
        };

        onSaveGroupe(groupeData);
        onHide();
    };

    const showSuccessMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const showErrorMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
    };

    const getPermissionsCount = () => {
        let count = 0;
        Object.keys(formData.permissions).forEach(entity => {
            Object.keys(formData.permissions[entity]).forEach(right => {
                if (formData.permissions[entity][right]) count++;
            });
        });
        return count;
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" scrollable>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEditing ? 'Modifier le groupe' : 'Nouveau groupe / permissions'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {showAlert && (
                    <Alert 
                        variant={alertMessage.includes('obligatoire') ? "danger" : "success"} 
                        dismissible 
                        onClose={() => setShowAlert(false)}
                    >
                        {alertMessage}
                    </Alert>
                )}

                <Form>
                    <div className="row">
                        <div className="col-md-8">
                            <Form.Group className="mb-3">
                                <Form.Label>Nom du groupe *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleInputChange}
                                    placeholder="Entrez le nom du groupe..."
                                    required
                                    autoFocus
                                />
                            </Form.Group>
                        </div>
                        <div className="col-md-4">
                            {!isEditing && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Créer à partir d'un modèle</Form.Label>
                                    <Dropdown as={ButtonGroup} className="w-100">
                                        <Button variant="outline-primary" className="w-100 text-start">
                                            <FaCopy className="me-2" />
                                            {formData.groupeModele ? 
                                                groupesModeles.find(g => g.key === formData.groupeModele)?.label :
                                                'Choisir un modèle'
                                            }
                                        </Button>
                                        <Dropdown.Toggle split variant="outline-primary" />
                                        <Dropdown.Menu className="w-100">
                                            {groupesModeles.map(modele => (
                                                <Dropdown.Item 
                                                    key={modele.key}
                                                    onClick={() => handleGroupeModeleSelect(modele.key)}
                                                >
                                                    A partir de {modele.label}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Form.Group>
                            )}
                        </div>
                    </div>

                    <Form.Group className="mb-4">
                        <Form.Label>Commentaires</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="commentaires"
                            value={formData.commentaires}
                            onChange={handleInputChange}
                            placeholder="Description ou commentaires sur ce groupe..."
                        />
                    </Form.Group>

                    <div className="border rounded p-3 bg-light mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">Résumé des permissions</h6>
                            <span className="badge bg-primary">{getPermissionsCount()} permissions actives</span>
                        </div>
                        <small className="text-muted">
                            Utilisez l'arborescence ci-dessous pour définir finement les droits de ce groupe
                        </small>
                    </div>

                    <PermissionsTree
                        permissions={formData.permissions}
                        onPermissionsChange={handlePermissionsChange}
                    />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Annuler
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleSave}
                    disabled={!formData.nom.trim()}
                >
                    {isEditing ? 'Modifier' : 'Créer'} le groupe
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default GroupeFormModal;