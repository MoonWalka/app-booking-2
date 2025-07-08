import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Table, Modal, Alert, Nav, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useEntreprise } from '@/context/EntrepriseContext';
import './CollaborateursManager.css';

const CollaborateursManagerFirebase = () => {
    const { currentUser } = useAuth();
    const { currentEntreprise } = useEntreprise();
    const [collaborateursList, setCollaborateursList] = useState([]);
    const [selectedCollaborateur, setSelectedCollaborateur] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success');
    const [activeTab, setActiveTab] = useState('informations-generales');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // État pour les entreprises et comptes de messagerie
    const [entreprisesList, setEntreprisesList] = useState([]);
    const [comptesMessagerieList, setComptesMessagerieList] = useState([]);
    
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
        partageNotes: {},
        createdAt: null,
        updatedAt: null
    });

    // Charger les entreprises depuis Firebase
    const loadEntreprises = async () => {
        if (!currentEntreprise?.id) return;
        
        try {
            let loadedEntreprises = [];
            
            // Charger depuis collaborationConfig
            const configDoc = await getDoc(doc(db, 'collaborationConfig', currentEntreprise.id));
            
            if (configDoc.exists()) {
                const data = configDoc.data();
                if (data.entreprises && Array.isArray(data.entreprises)) {
                    loadedEntreprises = data.entreprises;
                }
            }
            
            // Charger aussi l'entreprise principale depuis organizations/settings/entreprise
            const entrepriseRef = doc(db, 'organizations', currentEntreprise.id, 'settings', 'entreprise');
            const entrepriseDoc = await getDoc(entrepriseRef);
            
            if (entrepriseDoc.exists()) {
                const mainEntreprise = {
                    ...entrepriseDoc.data(),
                    id: 'main',
                    principal: true,
                    raisonSociale: entrepriseDoc.data().nom || entrepriseDoc.data().raisonSociale,
                    ape: entrepriseDoc.data().codeAPE || entrepriseDoc.data().ape
                };
                
                // Vérifier si l'entreprise principale n'est pas déjà dans la liste chargée
                const existingMain = loadedEntreprises.find(e => e.id === 'main');
                if (!existingMain) {
                    loadedEntreprises = [mainEntreprise, ...loadedEntreprises];
                }
            }
            
            setEntreprisesList(loadedEntreprises);
        } catch (error) {
            console.error('Erreur lors du chargement des entreprises:', error);
        }
    };

    // Charger les collaborateurs depuis Firebase
    useEffect(() => {
        const loadCollaborateurs = async () => {
            if (!currentEntreprise?.id) return;
            
            setLoading(true);
            try {
                let collaborateurs = [];
                
                // Charger depuis collaborationConfig
                const configDoc = await getDoc(doc(db, 'collaborationConfig', currentEntreprise.id));
                
                if (configDoc.exists()) {
                    const data = configDoc.data();
                    if (data.collaborateurs && Array.isArray(data.collaborateurs)) {
                        collaborateurs = data.collaborateurs;
                    }
                }
                
                // Si aucun collaborateur, créer automatiquement l'utilisateur actuel
                if (collaborateurs.length === 0 && currentUser) {
                    const currentUserCollaborateur = {
                        id: currentUser.uid,
                        actif: true,
                        nom: currentUser.displayName?.split(' ').slice(-1)[0] || '',
                        prenom: currentUser.displayName?.split(' ').slice(0, -1).join(' ') || currentUser.displayName || '',
                        email: currentUser.email,
                        initiales: (currentUser.displayName || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
                        identifiant: currentUser.email?.split('@')[0] || '',
                        groupes: ['admin'],
                        entreprises: [],
                        comptesMessagerie: [],
                        artistes: [],
                        partageEmails: {},
                        partageCommentaires: {},
                        partageNotes: {},
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    
                    collaborateurs = [currentUserCollaborateur];
                    
                    // Sauvegarder automatiquement
                    await saveCollaborateursToFirebase(collaborateurs);
                }
                
                setCollaborateursList(collaborateurs);
                if (collaborateurs.length > 0) {
                    setSelectedCollaborateur(collaborateurs[0]);
                }
                
                // Charger les entreprises
                await loadEntreprises();
                
            } catch (error) {
                console.error('Erreur lors du chargement des collaborateurs:', error);
                showMessage('Erreur lors du chargement des collaborateurs', 'danger');
            } finally {
                setLoading(false);
            }
        };

        loadCollaborateurs();
    }, [currentEntreprise?.id, currentUser]);

    const saveCollaborateursToFirebase = async (collaborateurs) => {
        if (!currentEntreprise?.id) return;
        
        try {
            const configRef = doc(db, 'collaborationConfig', currentEntreprise.id);
            const configDoc = await getDoc(configRef);
            
            const configData = configDoc.exists() ? configDoc.data() : {};
            
            await setDoc(configRef, {
                ...configData,
                collaborateurs: collaborateurs,
                updatedAt: new Date(),
                entrepriseId: currentEntreprise.id
            }, { merge: true });
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des collaborateurs:', error);
            throw error;
        }
    };

    const showMessage = (message, type = 'success') => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

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
                partageNotes: {},
                createdAt: null,
                updatedAt: null
            });
            setIsEditing(false);
        }
        setShowModal(true);
        setShowPassword(false);
    };

    const handleSave = async () => {
        if (!currentCollaborateur.nom.trim() || !currentCollaborateur.prenom.trim() || !currentCollaborateur.email.trim()) {
            showMessage('Veuillez remplir tous les champs obligatoires', 'danger');
            return;
        }

        if (!isEditing && (!currentCollaborateur.motDePasse.trim() || currentCollaborateur.motDePasse !== currentCollaborateur.confirmationMotDePasse)) {
            showMessage('Les mots de passe ne correspondent pas ou sont vides', 'danger');
            return;
        }

        try {
            setLoading(true);
            let updatedCollaborateurs = [];

            if (isEditing) {
                updatedCollaborateurs = collaborateursList.map(collab => 
                    collab.id === currentCollaborateur.id 
                        ? { ...currentCollaborateur, updatedAt: new Date() }
                        : collab
                );
            } else {
                const newCollaborateur = {
                    ...currentCollaborateur,
                    id: `collab_${Date.now()}`,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                updatedCollaborateurs = [...collaborateursList, newCollaborateur];
            }

            await saveCollaborateursToFirebase(updatedCollaborateurs);
            setCollaborateursList(updatedCollaborateurs);
            
            if (isEditing) {
                if (selectedCollaborateur?.id === currentCollaborateur.id) {
                    setSelectedCollaborateur({ ...currentCollaborateur, updatedAt: new Date() });
                }
                showMessage('Collaborateur modifié avec succès');
            } else {
                const newCollaborateur = updatedCollaborateurs[updatedCollaborateurs.length - 1];
                if (!selectedCollaborateur) {
                    setSelectedCollaborateur(newCollaborateur);
                }
                showMessage('Collaborateur ajouté avec succès');
            }
            
            setShowModal(false);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            showMessage('Erreur lors de la sauvegarde du collaborateur', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (collaborateur) => {
        // Empêcher la suppression de l'utilisateur actuel
        if (collaborateur.id === currentUser?.uid) {
            showMessage('Vous ne pouvez pas supprimer votre propre compte', 'danger');
            return;
        }

        if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${collaborateur.prenom} ${collaborateur.nom}" ?`)) {
            try {
                setLoading(true);
                const updatedCollaborateurs = collaborateursList.filter(c => c.id !== collaborateur.id);
                await saveCollaborateursToFirebase(updatedCollaborateurs);
                setCollaborateursList(updatedCollaborateurs);
                
                if (selectedCollaborateur?.id === collaborateur.id) {
                    setSelectedCollaborateur(updatedCollaborateurs.length > 0 ? updatedCollaborateurs[0] : null);
                }
                showMessage('Collaborateur supprimé avec succès');
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                showMessage('Erreur lors de la suppression du collaborateur', 'danger');
            } finally {
                setLoading(false);
            }
        }
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
            const updated = { ...selectedCollaborateur, [field]: value, updatedAt: new Date() };
            setSelectedCollaborateur(updated);
            
            const updatedList = collaborateursList.map(c => 
                c.id === selectedCollaborateur.id ? updated : c
            );
            setCollaborateursList(updatedList);
            
            // Sauvegarder automatiquement les modifications
            saveCollaborateursToFirebase(updatedList).catch(error => {
                console.error('Erreur lors de la sauvegarde automatique:', error);
            });
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
                    disabled={loading}
                >
                    <FaPlus className="me-2" />
                    Nouveau collaborateur
                </Button>
            </div>

            {loading ? (
                <div className="text-center p-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-2">Chargement des collaborateurs...</p>
                </div>
            ) : (
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
                                            {collaborateur.id === currentUser?.uid && <span className="badge bg-primary ms-2 small">Vous</span>}
                                        </h6>
                                        <small className="text-muted">
                                            {collaborateur.email}
                                        </small>
                                        {collaborateur.groupes && collaborateur.groupes.length > 0 && (
                                            <div className="mt-1">
                                                {collaborateur.groupes.map(groupe => (
                                                    <span key={groupe} className="badge bg-info me-1 small">{groupe}</span>
                                                ))}
                                            </div>
                                        )}
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
                                        {collaborateur.id !== currentUser?.uid && (
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
                                        )}
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
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
                        {selectedCollaborateur.id === currentUser?.uid && <span className="badge bg-primary ms-2">Vous</span>}
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
                    disabled={selectedCollaborateur.id === currentUser?.uid}
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

            {selectedCollaborateur.createdAt && (
                <div className="mt-3 p-2 bg-light rounded">
                    <small className="text-muted">
                        Créé le : {selectedCollaborateur.createdAt.toDate ? selectedCollaborateur.createdAt.toDate().toLocaleDateString() : new Date(selectedCollaborateur.createdAt).toLocaleDateString()}
                        {selectedCollaborateur.updatedAt && (
                            <span className="ms-3">
                                Modifié le : {selectedCollaborateur.updatedAt.toDate ? selectedCollaborateur.updatedAt.toDate().toLocaleDateString() : new Date(selectedCollaborateur.updatedAt).toLocaleDateString()}
                            </span>
                        )}
                    </small>
                </div>
            )}
        </Form>
    );

    // Onglet Groupes/permissions
    const renderGroupesPermissions = () => {
        const groupes = [
            { id: 'admin', nom: 'admin', description: 'Administrateur système' },
            { id: 'Invité', nom: 'Invité', description: 'Accès limité' },
            { id: 'Stagiaire', nom: 'Stagiaire', description: 'Stagiaire' },
            { id: 'Utilisateur', nom: 'Utilisateur', description: 'Utilisateur standard' }
        ];
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
                        <Table size="sm" hover>
                            <thead>
                                <tr>
                                    <th>Groupe</th>
                                    <th className="text-center" style={{width: '80px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedGroupes.map(groupeId => {
                                    const groupe = groupes.find(g => g.id === groupeId);
                                    return groupe ? (
                                        <tr key={groupeId}>
                                            <td>
                                                <div>
                                                    <strong>{groupe.nom}</strong>
                                                    {groupe.description && <div className="small text-muted">{groupe.description}</div>}
                                                </div>
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
                                                    ✕
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
        const selectedEntreprises = selectedCollaborateur?.entreprises || [];
        
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
                                {entreprisesList.length > 0 ? (
                                    entreprisesList.map(entreprise => (
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="text-center text-muted">
                                            Aucune entreprise configurée
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Col>
                    <Col md={6}>
                        <h6>Entreprises sélectionnées</h6>
                        <Table size="sm" hover>
                            <thead>
                                <tr>
                                    <th>Entreprise</th>
                                    <th className="text-center" style={{width: '80px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedEntreprises.length > 0 ? (
                                    selectedEntreprises.map(entrepriseId => {
                                        const entreprise = entreprisesList.find(e => e.id === entrepriseId);
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
                                                        ✕
                                                    </Button>
                                                </td>
                                            </tr>
                                        ) : null;
                                    })
                                ) : (
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
        const selectedComptes = selectedCollaborateur?.comptesMessagerie || [];
        
        // Pour l'instant, utiliser des données mock en attendant la connexion Firebase
        const comptesMock = [
            { id: 1, compte: 'pop.bob-booking.fr', adresse: 'encodeur-fleurie.0s@icloud.com' },
            { id: 2, compte: 'smtp.tourcraft.com', adresse: 'contact@tourcraft.com' }
        ];
        
        return (
            <div>
                <Row>
                    <Col md={6}>
                        <h6>Comptes disponibles</h6>
                        <Table size="sm" hover>
                            <thead>
                                <tr>
                                    <th>Compte</th>
                                    <th className="text-center" style={{width: '80px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comptesMock.map(compte => (
                                    <tr key={compte.id}>
                                        <td>
                                            <div>
                                                <strong>{compte.compte}</strong>
                                                <div className="small text-muted">{compte.adresse}</div>
                                            </div>
                                        </td>
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
                        <Table size="sm" hover>
                            <thead>
                                <tr>
                                    <th>Compte</th>
                                    <th className="text-center" style={{width: '80px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedComptes.length > 0 ? (
                                    selectedComptes.map(compteId => {
                                        const compte = comptesMock.find(c => c.id === compteId);
                                        return compte ? (
                                            <tr key={compteId}>
                                                <td>
                                                    <div>
                                                        <strong>{compte.compte}</strong>
                                                        <div className="small text-muted">{compte.adresse}</div>
                                                    </div>
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
                                                        ✕
                                                    </Button>
                                                </td>
                                            </tr>
                                        ) : null;
                                    })
                                ) : (
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
        const artistes = [
            { id: 1, nom: 'artiste test' },
            { id: 2, nom: 'artsite 2' },
            { id: 3, nom: 'Groupe Rock' }
        ];
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
                        <Table size="sm" hover>
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
                                                    ✕
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

    // Onglet Partage des emails et tâches
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

    // Modal pour ajouter/modifier un collaborateur
    const renderModal = () => (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEditing ? 'Modifier le collaborateur' : 'Nouveau collaborateur'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
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
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Mot de passe *</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                name="motDePasse"
                                                value={currentCollaborateur.motDePasse}
                                                onChange={handleInputChange}
                                                placeholder="Mot de passe"
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
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Confirmation mot de passe *</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="confirmationMotDePasse"
                                            value={currentCollaborateur.confirmationMotDePasse}
                                            onChange={handleInputChange}
                                            placeholder="Confirmer le mot de passe"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            name="actif"
                            label="Collaborateur actif"
                            checked={currentCollaborateur.actif}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Annuler
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Sauvegarde...
                        </>
                    ) : (
                        isEditing ? 'Modifier' : 'Ajouter'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );

    return (
        <div>
            {showAlert && (
                <Alert variant={alertType} onClose={() => setShowAlert(false)} dismissible>
                    {alertMessage}
                </Alert>
            )}
            
            <Row>
                <Col md={4}>
                    {renderCollaborateursList()}
                </Col>
                <Col md={8}>
                    {renderCollaborateurDetails()}
                </Col>
            </Row>
            
            {renderModal()}
        </div>
    );
};

export default CollaborateursManagerFirebase; 