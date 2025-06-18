import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Table, Modal, Alert, Nav, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import './CollaborateursManager.css';

const CollaborateursManager = () => {
    const [collaborateursList, setCollaborateursList] = useState([]);
    const [selectedCollaborateur, setSelectedCollaborateur] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [activeTab, setActiveTab] = useState('informations-generales');
    const [showPassword, setShowPassword] = useState(false);
    
    // État pour le formulaire de collaborateur
    const [currentCollaborateur, setCurrentCollaborateur] = useState({
        id: null,
        actif: true,
        nom: '',
        prenom: '',
        email: '',
        initiales: '',
        identifiant: '',
        motDePasse: '',
        confirmationMotDePasse: '',
        changerIdentifiants: false,
        groupes: [],
        entreprises: [],
        comptesMessagerie: [],
        artistes: [],
        partageEmails: {},
        partageCommentaires: {},
        partageNotes: {}
    });

    // Données d'exemple
    const getMockCollaborateurs = () => [
        {
            id: 1,
            actif: true,
            nom: 'Dupont',
            prenom: 'Jean',
            email: 'jean.dupont@tourcraft.com',
            initiales: 'JD',
            identifiant: 'jdupont',
            groupes: ['admin'],
            entreprises: [1],
            comptesMessagerie: [1],
            artistes: [1, 2]
        },
        {
            id: 2,
            actif: true,
            nom: 'Martin',
            prenom: 'Marie',
            email: 'marie.martin@tourcraft.com',
            initiales: 'MM',
            identifiant: 'mmartin',
            groupes: ['Utilisateur'],
            entreprises: [1, 2],
            comptesMessagerie: [2],
            artistes: [1]
        },
        {
            id: 3,
            actif: false,
            nom: 'Durand',
            prenom: 'Pierre',
            email: 'pierre.durand@tourcraft.com',
            initiales: 'PD',
            identifiant: 'pdurand',
            groupes: ['Stagiaire'],
            entreprises: [2],
            comptesMessagerie: [],
            artistes: []
        }
    ];

    const getMockGroupes = () => [
        { id: 'admin', nom: 'admin', description: 'Administrateur système' },
        { id: 'Invité', nom: 'Invité', description: 'Accès limité' },
        { id: 'Stagiaire', nom: 'Stagiaire', description: 'Stagiaire' },
        { id: 'test group', nom: 'test group', description: 'Groupe de test' },
        { id: 'Utilisateur', nom: 'Utilisateur', description: 'Utilisateur standard' }
    ];

    const getMockEntreprises = () => [
        { id: 1, raisonSociale: 'TourCraft Productions' },
        { id: 2, raisonSociale: 'Spectacles & Événements' }
    ];

    const getMockComptesMessagerie = () => [
        { id: 1, compte: 'pop.bob-booking.fr', adresse: 'encodeur-fleurie.0s@icloud.com' },
        { id: 2, compte: 'smtp.tourcraft.com', adresse: 'contact@tourcraft.com' }
    ];

    const getMockArtistes = () => [
        { id: 1, nom: 'artiste test' },
        { id: 2, nom: 'artsite 2' },
        { id: 3, nom: 'Groupe Rock' }
    ];

    // Chargement initial
    useEffect(() => {
        const mockData = getMockCollaborateurs();
        setCollaborateursList(mockData);
        if (mockData.length > 0) {
            setSelectedCollaborateur(mockData[0]);
        }
    }, []);

    const handleShowModal = (collaborateur = null) => {
        if (collaborateur) {
            setCurrentCollaborateur({ 
                ...collaborateur, 
                motDePasse: '********',
                confirmationMotDePasse: '********',
                changerIdentifiants: false
            });
            setIsEditing(true);
        } else {
            setCurrentCollaborateur({
                id: null,
                actif: true,
                nom: '',
                prenom: '',
                email: '',
                initiales: '',
                identifiant: '',
                motDePasse: '',
                confirmationMotDePasse: '',
                changerIdentifiants: false,
                groupes: [],
                entreprises: [],
                comptesMessagerie: [],
                artistes: [],
                partageEmails: {},
                partageCommentaires: {},
                partageNotes: {}
            });
            setIsEditing(false);
        }
        setShowModal(true);
        setShowPassword(false);
    };

    const handleSave = () => {
        if (!currentCollaborateur.nom.trim() || !currentCollaborateur.prenom.trim() || !currentCollaborateur.email.trim()) {
            return;
        }

        if (!isEditing && (!currentCollaborateur.motDePasse.trim() || currentCollaborateur.motDePasse !== currentCollaborateur.confirmationMotDePasse)) {
            alert('Les mots de passe ne correspondent pas ou sont vides');
            return;
        }

        if (isEditing) {
            setCollaborateursList(collaborateursList.map(collab => 
                collab.id === currentCollaborateur.id ? currentCollaborateur : collab
            ));
            if (selectedCollaborateur?.id === currentCollaborateur.id) {
                setSelectedCollaborateur(currentCollaborateur);
            }
            showSuccessMessage('Collaborateur modifié avec succès');
        } else {
            const newCollaborateur = {
                ...currentCollaborateur,
                id: Math.max(...collaborateursList.map(c => c.id), 0) + 1
            };
            setCollaborateursList([...collaborateursList, newCollaborateur]);
            if (!selectedCollaborateur) {
                setSelectedCollaborateur(newCollaborateur);
            }
            showSuccessMessage('Collaborateur ajouté avec succès');
        }
        setShowModal(false);
    };

    const handleDelete = (collaborateur) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${collaborateur.prenom} ${collaborateur.nom}" ?`)) {
            setCollaborateursList(collaborateursList.filter(c => c.id !== collaborateur.id));
            if (selectedCollaborateur?.id === collaborateur.id) {
                const remaining = collaborateursList.filter(c => c.id !== collaborateur.id);
                setSelectedCollaborateur(remaining.length > 0 ? remaining[0] : null);
            }
            showSuccessMessage('Collaborateur supprimé avec succès');
        }
    };

    const showSuccessMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentCollaborateur(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const updateSelectedCollaborateur = (field, value) => {
        if (selectedCollaborateur) {
            const updated = { ...selectedCollaborateur, [field]: value };
            setSelectedCollaborateur(updated);
            setCollaborateursList(collaborateursList.map(c => 
                c.id === selectedCollaborateur.id ? updated : c
            ));
        }
    };

    // Rendu de la liste des collaborateurs (colonne 2)
    const renderCollaborateursList = () => (
        <div>
            <div className="mb-3">
                <Button 
                    variant="success" 
                    onClick={() => handleShowModal()}
                    className="w-100"
                >
                    <FaPlus className="me-2" />
                    Nouveau collaborateur
                </Button>
            </div>

            <div className="collaborateurs-list">
                {collaborateursList.map(collaborateur => (
                    <Card 
                        key={collaborateur.id} 
                        className={`mb-2 cursor-pointer ${selectedCollaborateur?.id === collaborateur.id ? 'border-primary' : ''} ${!collaborateur.actif ? 'opacity-50' : ''}`}
                        onClick={() => setSelectedCollaborateur(collaborateur)}
                    >
                        <Card.Body className="py-2">
                            <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                    <h6 className="mb-1">
                                        {collaborateur.prenom} {collaborateur.nom}
                                        {!collaborateur.actif && <span className="badge bg-secondary ms-2 small">Inactif</span>}
                                    </h6>
                                    <small className="text-muted">
                                        {collaborateur.email}
                                    </small>
                                </div>
                                <div className="ms-2">
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleShowModal(collaborateur);
                                        }}
                                        className="text-warning p-1"
                                    >
                                        <FaEdit />
                                    </Button>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(collaborateur);
                                        }}
                                        className="text-danger p-1"
                                    >
                                        <FaTrash />
                                    </Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        </div>
    );

    // Rendu des détails du collaborateur avec onglets (colonne 3)
    const renderCollaborateurDetails = () => {
        if (!selectedCollaborateur) {
            return (
                <div className="text-center p-5">
                    <i className="bi bi-person" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                    <h4 className="mt-3">Aucun collaborateur sélectionné</h4>
                    <p className="text-muted">Sélectionnez un collaborateur dans la liste pour voir ses détails.</p>
                </div>
            );
        }

        return (
            <Card>
                <Card.Header>
                    <h4 className="mb-0">
                        {selectedCollaborateur.prenom} {selectedCollaborateur.nom}
                        {!selectedCollaborateur.actif && <span className="badge bg-secondary ms-2">Inactif</span>}
                    </h4>
                </Card.Header>
                <Card.Body className="p-0">
                    <Nav variant="tabs" className="border-bottom-0 flex-wrap">
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'informations-generales'}
                                onClick={() => setActiveTab('informations-generales')}
                                className="small"
                            >
                                Informations générales
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'groupes-permissions'}
                                onClick={() => setActiveTab('groupes-permissions')}
                                className="small"
                            >
                                Groupes / permissions
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'entreprises'}
                                onClick={() => setActiveTab('entreprises')}
                                className="small"
                            >
                                Entreprises
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'comptes-messagerie'}
                                onClick={() => setActiveTab('comptes-messagerie')}
                                className="small"
                            >
                                Comptes de messagerie
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'artistes'}
                                onClick={() => setActiveTab('artistes')}
                                className="small"
                            >
                                Artistes
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'partage-emails-taches'}
                                onClick={() => setActiveTab('partage-emails-taches')}
                                className="small"
                            >
                                Partages des emails et tâches
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'partage-commentaires'}
                                onClick={() => setActiveTab('partage-commentaires')}
                                className="small"
                            >
                                Partage des commentaires
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'partage-notes'}
                                onClick={() => setActiveTab('partage-notes')}
                                className="small"
                            >
                                Partage des notes de suivi
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                    
                    <div className="p-3">
                        {renderTabContent()}
                    </div>
                </Card.Body>
            </Card>
        );
    };

    // Rendu du contenu des onglets
    const renderTabContent = () => {
        switch (activeTab) {
            case 'informations-generales':
                return renderInformationsGenerales();
            case 'groupes-permissions':
                return renderGroupesPermissions();
            case 'entreprises':
                return renderEntreprises();
            case 'comptes-messagerie':
                return renderComptesMessagerie();
            case 'artistes':
                return renderArtistes();
            case 'partage-emails-taches':
                return renderPartageEmailsTaches();
            case 'partage-commentaires':
                return renderPartageCommentaires();
            case 'partage-notes':
                return renderPartageNotes();
            default:
                return null;
        }
    };

    // Onglet Informations générales
    const renderInformationsGenerales = () => (
        <Form>
            <Form.Group className="mb-3">
                <Form.Check
                    type="checkbox"
                    label="Collaborateur actif ?"
                    checked={selectedCollaborateur.actif || false}
                    onChange={(e) => updateSelectedCollaborateur('actif', e.target.checked)}
                />
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nom *</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedCollaborateur.nom || ''}
                            onChange={(e) => updateSelectedCollaborateur('nom', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Prénom *</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedCollaborateur.prenom || ''}
                            onChange={(e) => updateSelectedCollaborateur('prenom', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>E-mail *</Form.Label>
                <Form.Control
                    type="email"
                    value={selectedCollaborateur.email || ''}
                    onChange={(e) => updateSelectedCollaborateur('email', e.target.value)}
                />
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Initiales</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedCollaborateur.initiales || ''}
                            onChange={(e) => updateSelectedCollaborateur('initiales', e.target.value)}
                            maxLength={4}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Identifiant</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedCollaborateur.identifiant || ''}
                            onChange={(e) => updateSelectedCollaborateur('identifiant', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Check
                    type="checkbox"
                    label="Changer l'identifiant et le mot de passe ?"
                    checked={selectedCollaborateur.changerIdentifiants || false}
                    onChange={(e) => updateSelectedCollaborateur('changerIdentifiants', e.target.checked)}
                />
            </Form.Group>

            {selectedCollaborateur.changerIdentifiants && (
                <>
                    <Form.Group className="mb-3">
                        <Form.Label>Mot de passe</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showPassword ? "text" : "password"}
                                value={selectedCollaborateur.motDePasse || ''}
                                onChange={(e) => updateSelectedCollaborateur('motDePasse', e.target.value)}
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Confirmation du mot de passe</Form.Label>
                        <Form.Control
                            type="password"
                            value={selectedCollaborateur.confirmationMotDePasse || ''}
                            onChange={(e) => updateSelectedCollaborateur('confirmationMotDePasse', e.target.value)}
                        />
                    </Form.Group>
                </>
            )}
        </Form>
    );

    // Onglet Groupes/permissions
    const renderGroupesPermissions = () => {
        const groupes = getMockGroupes();
        const selectedGroupes = selectedCollaborateur.groupes || [];

        return (
            <div>
                <Row>
                    <Col md={6}>
                        <h6>Groupes disponibles</h6>
                        <Table size="sm" hover>
                            <thead>
                                <tr>
                                    <th>Nom du groupe / permissions</th>
                                    <th className="text-center" style={{width: '80px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupes.map(groupe => (
                                    <tr key={groupe.id}>
                                        <td>
                                            <div>
                                                <strong>{groupe.nom}</strong>
                                                {groupe.description && <div className="small text-muted">{groupe.description}</div>}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                size="sm"
                                                variant={selectedGroupes.includes(groupe.id) ? "success" : "outline-primary"}
                                                onClick={() => {
                                                    const newGroupes = selectedGroupes.includes(groupe.id)
                                                        ? selectedGroupes.filter(g => g !== groupe.id)
                                                        : [...selectedGroupes, groupe.id];
                                                    updateSelectedCollaborateur('groupes', newGroupes);
                                                }}
                                            >
                                                {selectedGroupes.includes(groupe.id) ? '✓' : '+'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                    <Col md={6}>
                        <h6>Groupes sélectionnés</h6>
                        <Table size="sm">
                            <thead>
                                <tr>
                                    <th>Groupe actif</th>
                                    <th className="text-center" style={{width: '80px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedGroupes.map(groupeId => {
                                    const groupe = groupes.find(g => g.id === groupeId);
                                    return groupe ? (
                                        <tr key={groupeId}>
                                            <td>
                                                <strong>{groupe.nom}</strong>
                                            </td>
                                            <td className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() => {
                                                        const newGroupes = selectedGroupes.filter(g => g !== groupeId);
                                                        updateSelectedCollaborateur('groupes', newGroupes);
                                                    }}
                                                >
                                                    ×
                                                </Button>
                                            </td>
                                        </tr>
                                    ) : null;
                                })}
                                {selectedGroupes.length === 0 && (
                                    <tr>
                                        <td colSpan="2" className="text-center text-muted">
                                            Aucun groupe sélectionné
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </div>
        );
    };

    // Onglet Entreprises
    const renderEntreprises = () => {
        const entreprises = getMockEntreprises();
        const selectedEntreprises = selectedCollaborateur.entreprises || [];

        return (
            <div>
                <Row>
                    <Col md={6}>
                        <h6>Entreprises disponibles</h6>
                        <Table size="sm" hover>
                            <thead>
                                <tr>
                                    <th>Raison sociale</th>
                                    <th className="text-center" style={{width: '80px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entreprises.map(entreprise => (
                                    <tr key={entreprise.id}>
                                        <td>{entreprise.raisonSociale}</td>
                                        <td className="text-center">
                                            <Button
                                                size="sm"
                                                variant={selectedEntreprises.includes(entreprise.id) ? "success" : "outline-primary"}
                                                onClick={() => {
                                                    const newEntreprises = selectedEntreprises.includes(entreprise.id)
                                                        ? selectedEntreprises.filter(e => e !== entreprise.id)
                                                        : [...selectedEntreprises, entreprise.id];
                                                    updateSelectedCollaborateur('entreprises', newEntreprises);
                                                }}
                                            >
                                                {selectedEntreprises.includes(entreprise.id) ? '✓' : '+'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                    <Col md={6}>
                        <h6>Entreprises sélectionnées</h6>
                        <Table size="sm">
                            <thead>
                                <tr>
                                    <th>Raison sociale</th>
                                    <th className="text-center" style={{width: '80px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedEntreprises.map(entrepriseId => {
                                    const entreprise = entreprises.find(e => e.id === entrepriseId);
                                    return entreprise ? (
                                        <tr key={entrepriseId}>
                                            <td>{entreprise.raisonSociale}</td>
                                            <td className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() => {
                                                        const newEntreprises = selectedEntreprises.filter(e => e !== entrepriseId);
                                                        updateSelectedCollaborateur('entreprises', newEntreprises);
                                                    }}
                                                >
                                                    ×
                                                </Button>
                                            </td>
                                        </tr>
                                    ) : null;
                                })}
                                {selectedEntreprises.length === 0 && (
                                    <tr>
                                        <td colSpan="2" className="text-center text-muted">
                                            Aucune entreprise sélectionnée
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </div>
        );
    };

    // Onglet Comptes de messagerie
    const renderComptesMessagerie = () => {
        const comptes = getMockComptesMessagerie();
        const selectedComptes = selectedCollaborateur.comptesMessagerie || [];

        return (
            <div>
                <Row>
                    <Col md={6}>
                        <h6>Comptes disponibles</h6>
                        <Table size="sm" hover>
                            <thead>
                                <tr>
                                    <th>Compte</th>
                                    <th>Adresse</th>
                                    <th className="text-center" style={{width: '80px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comptes.map(compte => (
                                    <tr key={compte.id}>
                                        <td>{compte.compte}</td>
                                        <td className="small text-muted">{compte.adresse}</td>
                                        <td className="text-center">
                                            <Button
                                                size="sm"
                                                variant={selectedComptes.includes(compte.id) ? "success" : "outline-primary"}
                                                onClick={() => {
                                                    const newComptes = selectedComptes.includes(compte.id)
                                                        ? selectedComptes.filter(c => c !== compte.id)
                                                        : [...selectedComptes, compte.id];
                                                    updateSelectedCollaborateur('comptesMessagerie', newComptes);
                                                }}
                                            >
                                                {selectedComptes.includes(compte.id) ? '✓' : '+'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                    <Col md={6}>
                        <h6>Comptes sélectionnés</h6>
                        <Table size="sm">
                            <thead>
                                <tr>
                                    <th>Compte</th>
                                    <th className="text-center" style={{width: '80px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedComptes.map(compteId => {
                                    const compte = comptes.find(c => c.id === compteId);
                                    return compte ? (
                                        <tr key={compteId}>
                                            <td>
                                                <div>{compte.compte}</div>
                                                <div className="small text-muted">{compte.adresse}</div>
                                            </td>
                                            <td className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() => {
                                                        const newComptes = selectedComptes.filter(c => c !== compteId);
                                                        updateSelectedCollaborateur('comptesMessagerie', newComptes);
                                                    }}
                                                >
                                                    ×
                                                </Button>
                                            </td>
                                        </tr>
                                    ) : null;
                                })}
                                {selectedComptes.length === 0 && (
                                    <tr>
                                        <td colSpan="2" className="text-center text-muted">
                                            Aucun compte sélectionné
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </div>
        );
    };

    // Onglet Artistes
    const renderArtistes = () => {
        const artistes = getMockArtistes();
        const selectedArtistes = selectedCollaborateur.artistes || [];

        return (
            <div>
                <Row>
                    <Col md={6}>
                        <h6>Artistes disponibles</h6>
                        <Table size="sm" hover>
                            <thead>
                                <tr>
                                    <th>Artiste</th>
                                    <th className="text-center" style={{width: '80px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {artistes.map(artiste => (
                                    <tr key={artiste.id}>
                                        <td>{artiste.nom}</td>
                                        <td className="text-center">
                                            <Button
                                                size="sm"
                                                variant={selectedArtistes.includes(artiste.id) ? "success" : "outline-primary"}
                                                onClick={() => {
                                                    const newArtistes = selectedArtistes.includes(artiste.id)
                                                        ? selectedArtistes.filter(a => a !== artiste.id)
                                                        : [...selectedArtistes, artiste.id];
                                                    updateSelectedCollaborateur('artistes', newArtistes);
                                                }}
                                            >
                                                {selectedArtistes.includes(artiste.id) ? '✓' : '+'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                    <Col md={6}>
                        <h6>Artistes sélectionnés</h6>
                        <Table size="sm">
                            <thead>
                                <tr>
                                    <th>Artiste</th>
                                    <th className="text-center" style={{width: '80px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedArtistes.map(artisteId => {
                                    const artiste = artistes.find(a => a.id === artisteId);
                                    return artiste ? (
                                        <tr key={artisteId}>
                                            <td>{artiste.nom}</td>
                                            <td className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() => {
                                                        const newArtistes = selectedArtistes.filter(a => a !== artisteId);
                                                        updateSelectedCollaborateur('artistes', newArtistes);
                                                    }}
                                                >
                                                    ×
                                                </Button>
                                            </td>
                                        </tr>
                                    ) : null;
                                })}
                                {selectedArtistes.length === 0 && (
                                    <tr>
                                        <td colSpan="2" className="text-center text-muted">
                                            Aucun artiste sélectionné
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </div>
        );
    };

    // Onglets de partage (structure similaire pour les 3)
    const renderPartageEmailsTaches = () => (
        <div>
            <div className="mb-3">
                <Button variant="outline-secondary" size="sm" className="me-2">
                    Afficher les collaborateurs désactivés
                </Button>
                <Button variant="outline-warning" size="sm" className="me-2">
                    Annuler les modifications
                </Button>
                <Button variant="outline-info" size="sm">
                    Seulement avec les collaborateurs de mes entreprises
                </Button>
            </div>
            
            <Table hover>
                <thead>
                    <tr>
                        <th>Nom collaborateur</th>
                        <th>Peut voir les e-mails & tâches de</th>
                        <th>Partage ses e-mails & tâches avec</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{selectedCollaborateur.prenom} {selectedCollaborateur.nom}</td>
                        <td>
                            <Form.Control as="select" size="sm">
                                <option>Sélectionner...</option>
                                {collaborateursList.filter(c => c.id !== selectedCollaborateur.id).map(c => (
                                    <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                                ))}
                            </Form.Control>
                        </td>
                        <td>
                            <Form.Control as="select" size="sm">
                                <option>Sélectionner...</option>
                                {collaborateursList.filter(c => c.id !== selectedCollaborateur.id).map(c => (
                                    <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                                ))}
                            </Form.Control>
                        </td>
                    </tr>
                </tbody>
            </Table>
        </div>
    );

    const renderPartageCommentaires = () => (
        <div>
            <div className="mb-3">
                <Button variant="outline-secondary" size="sm" className="me-2">
                    Afficher les collaborateurs désactivés
                </Button>
                <Button variant="outline-warning" size="sm" className="me-2">
                    Annuler les modifications
                </Button>
                <Button variant="outline-info" size="sm">
                    Seulement avec les collaborateurs de mes entreprises
                </Button>
            </div>
            
            <Table hover>
                <thead>
                    <tr>
                        <th>Nom collaborateur</th>
                        <th>Peut voir les commentaires de</th>
                        <th>Partage ses commentaires avec</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{selectedCollaborateur.prenom} {selectedCollaborateur.nom}</td>
                        <td>
                            <Form.Control as="select" size="sm">
                                <option>Sélectionner...</option>
                                {collaborateursList.filter(c => c.id !== selectedCollaborateur.id).map(c => (
                                    <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                                ))}
                            </Form.Control>
                        </td>
                        <td>
                            <Form.Control as="select" size="sm">
                                <option>Sélectionner...</option>
                                {collaborateursList.filter(c => c.id !== selectedCollaborateur.id).map(c => (
                                    <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                                ))}
                            </Form.Control>
                        </td>
                    </tr>
                </tbody>
            </Table>
        </div>
    );

    const renderPartageNotes = () => (
        <div>
            <div className="mb-3">
                <Button variant="outline-secondary" size="sm" className="me-2">
                    Afficher les collaborateurs désactivés
                </Button>
                <Button variant="outline-warning" size="sm" className="me-2">
                    Annuler les modifications
                </Button>
                <Button variant="outline-info" size="sm">
                    Seulement avec les collaborateurs de mes entreprises
                </Button>
            </div>
            
            <Table hover>
                <thead>
                    <tr>
                        <th>Nom collaborateur</th>
                        <th>Peut voir les notes de dossiers de suivi de</th>
                        <th>Partage ses notes de dossiers de suivi avec</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{selectedCollaborateur.prenom} {selectedCollaborateur.nom}</td>
                        <td>
                            <Form.Control as="select" size="sm">
                                <option>Sélectionner...</option>
                                {collaborateursList.filter(c => c.id !== selectedCollaborateur.id).map(c => (
                                    <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                                ))}
                            </Form.Control>
                        </td>
                        <td>
                            <Form.Control as="select" size="sm">
                                <option>Sélectionner...</option>
                                {collaborateursList.filter(c => c.id !== selectedCollaborateur.id).map(c => (
                                    <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                                ))}
                            </Form.Control>
                        </td>
                    </tr>
                </tbody>
            </Table>
        </div>
    );

    // Modal pour créer/éditer un collaborateur
    const renderModal = () => (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEditing ? 'Modifier' : 'Ajouter'} un collaborateur
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Collaborateur actif"
                            name="actif"
                            checked={currentCollaborateur.actif}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nom *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nom"
                                    value={currentCollaborateur.nom}
                                    onChange={handleInputChange}
                                    required
                                    autoFocus
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Prénom *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="prenom"
                                    value={currentCollaborateur.prenom}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>E-mail *</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={currentCollaborateur.email}
                            onChange={handleInputChange}
                            required
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Initiales</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="initiales"
                                    value={currentCollaborateur.initiales}
                                    onChange={handleInputChange}
                                    maxLength={4}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Identifiant</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="identifiant"
                                    value={currentCollaborateur.identifiant}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {!isEditing && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Mot de passe *</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        name="motDePasse"
                                        value={currentCollaborateur.motDePasse}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </Button>
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Confirmation du mot de passe *</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="confirmationMotDePasse"
                                    value={currentCollaborateur.confirmationMotDePasse}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                        </>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Annuler
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleSave}
                    disabled={!currentCollaborateur.nom.trim() || !currentCollaborateur.prenom.trim() || !currentCollaborateur.email.trim()}
                >
                    {isEditing ? 'Modifier' : 'Ajouter'}
                </Button>
            </Modal.Footer>
        </Modal>
    );

    return (
        <Row>
            {showAlert && (
                <Col xs={12}>
                    <Alert variant="success" dismissible onClose={() => setShowAlert(false)}>
                        {alertMessage}
                    </Alert>
                </Col>
            )}
            
            <Col md={3}>
                <Card>
                    <Card.Header>
                        <h6 className="mb-0">Collaborateurs</h6>
                    </Card.Header>
                    <Card.Body className="p-2">
                        {renderCollaborateursList()}
                    </Card.Body>
                </Card>
            </Col>
            
            <Col md={9}>
                {renderCollaborateurDetails()}
            </Col>
            
            {renderModal()}
        </Row>
    );
};

export default CollaborateursManager;