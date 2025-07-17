import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Table, Modal, Alert, Nav, InputGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaCopy, FaEnvelope } from 'react-icons/fa';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
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
    const [groupesList, setGroupesList] = useState([]);
    
    // État pour l'onglet actif dans la modale
    const [modalActiveTab, setModalActiveTab] = useState('informations-generales');
    
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
            
            // Charger depuis entreprises/{id}/collaborationEntreprises (même source que EntreprisesManagerFirebase)
            const collaborationEntreprisesRef = collection(db, 'entreprises', currentEntreprise.id, 'collaborationEntreprises');
            const collaborationSnapshot = await getDocs(collaborationEntreprisesRef);
            
            collaborationSnapshot.forEach(doc => {
                loadedEntreprises.push({ id: doc.id, ...doc.data() });
            });
            
            // Charger l'entreprise principale depuis la racine entreprises/{id}
            const entrepriseDoc = await getDoc(doc(db, 'entreprises', currentEntreprise.id));
            
            if (entrepriseDoc.exists()) {
                const entrepriseData = entrepriseDoc.data();
                console.log('Données entreprise principale (collaborateurs):', entrepriseData);
                
                // Essayer aussi de charger les détails depuis settings/entreprise si disponible
                const settingsRef = doc(db, 'entreprises', currentEntreprise.id, 'settings', 'entreprise');
                const settingsDoc = await getDoc(settingsRef);
                const settingsData = settingsDoc.exists() ? settingsDoc.data() : null;
                
                // Fusionner les données de base avec les détails si disponibles
                const mainEntreprise = {
                    id: 'main',
                    principal: true,
                    raisonSociale: entrepriseData.name || settingsData?.nom || settingsData?.raisonSociale || currentEntreprise.name || 'Entreprise principale',
                    code: entrepriseData.slug || currentEntreprise.slug || 'MAIN',
                    type: entrepriseData.type,
                    ville: settingsData?.ville || '',
                    email: settingsData?.email || '',
                    telephone: settingsData?.telephone || ''
                };
                
                console.log('Entreprise principale construite (collaborateurs):', mainEntreprise);
                
                // Vérifier si l'entreprise principale n'est pas déjà dans la liste chargée
                const existingMain = loadedEntreprises.find(e => e.id === 'main');
                if (!existingMain) {
                    loadedEntreprises = [mainEntreprise, ...loadedEntreprises];
                }
            } else {
                console.log('Document entreprise non trouvé, utilisation des données du contexte');
                // Si le document n'existe pas, créer une entreprise principale à partir du contexte
                const mainEntreprise = {
                    id: 'main',
                    principal: true,
                    raisonSociale: currentEntreprise.name || 'Mon entreprise',
                    code: currentEntreprise.slug || 'MAIN',
                    ville: '',
                    email: '',
                    telephone: ''
                };
                loadedEntreprises = [mainEntreprise, ...loadedEntreprises];
            }
            
            console.log('Entreprises chargées pour les collaborateurs:', loadedEntreprises);
            setEntreprisesList(loadedEntreprises);
        } catch (error) {
            console.error('Erreur lors du chargement des entreprises:', error);
        }
    };

    // Charger les comptes de messagerie depuis Firebase
    const loadComptesMessagerie = async () => {
        if (!currentEntreprise?.id) return;
        
        try {
            // Charger depuis entreprises/{id}/comptesMessagerie
            const comptesRef = collection(db, 'entreprises', currentEntreprise.id, 'comptesMessagerie');
            const comptesSnapshot = await getDocs(comptesRef);
            
            const loadedComptes = [];
            comptesSnapshot.forEach(doc => {
                loadedComptes.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('Comptes de messagerie chargés:', loadedComptes);
            setComptesMessagerieList(loadedComptes);
        } catch (error) {
            console.error('Erreur lors du chargement des comptes de messagerie:', error);
        }
    };

    // Fonction pour charger les groupes de permissions depuis Firebase
    const loadGroupes = async () => {
        if (!currentEntreprise?.id) return;
        
        try {
            const groupesSnapshot = await getDocs(collection(db, 'entreprises', currentEntreprise.id, 'groupesPermissions'));
            const groupes = groupesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setGroupesList(groupes);
        } catch (error) {
            console.error('Erreur lors du chargement des groupes:', error);
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
                
                // Charger les comptes de messagerie
                await loadComptesMessagerie();
                
                // Charger les groupes de permissions
                await loadGroupes();
                
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
            // Sauvegarder dans collaborationConfig
            const configRef = doc(db, 'collaborationConfig', currentEntreprise.id);
            const configDoc = await getDoc(configRef);
            
            const configData = configDoc.exists() ? configDoc.data() : {};
            
            await setDoc(configRef, {
                ...configData,
                collaborateurs: collaborateurs,
                updatedAt: new Date(),
                entrepriseId: currentEntreprise.id
            }, { merge: true });
            
            // Sauvegarder aussi dans la collection collaborateurs pour être compatible avec le reste du système
            for (const collaborateur of collaborateurs) {
                const collaborateurRef = doc(db, 'entreprises', currentEntreprise.id, 'collaborateurs', collaborateur.id);
                await setDoc(collaborateurRef, collaborateur, { merge: true });
            }
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
        // Réinitialiser l'onglet actif de la modale
        setModalActiveTab('informations-generales');
        
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
        if (!currentCollaborateur.email.trim()) {
            showMessage('Veuillez entrer une adresse email', 'danger');
            return;
        }

        try {
            setLoading(true);
            
            if (isEditing) {
                // Mode édition : mettre à jour normalement
                const updatedCollaborateurs = collaborateursList.map(collab => 
                    collab.id === currentCollaborateur.id 
                        ? { ...currentCollaborateur, updatedAt: new Date() }
                        : collab
                );
                
                await saveCollaborateursToFirebase(updatedCollaborateurs);
                setCollaborateursList(updatedCollaborateurs);
                
                if (selectedCollaborateur?.id === currentCollaborateur.id) {
                    setSelectedCollaborateur({ ...currentCollaborateur, updatedAt: new Date() });
                }
                showMessage('Collaborateur modifié avec succès');
            } else {
                // Mode création : créer une invitation automatiquement
                const { generateInvitationCode } = await import('@/services/firebase-service');
                
                // Générer l'invitation
                const invitation = await generateInvitationCode(
                    currentEntreprise.id,
                    'member', // Rôle par défaut
                    30, // 30 jours de validité
                    1   // Usage unique
                );
                
                // Ajouter les métadonnées du collaborateur
                const invitationData = {
                    ...invitation,
                    email: currentCollaborateur.email,
                    nom: currentCollaborateur.nom || null,
                    prenom: currentCollaborateur.prenom || null,
                    groupes: currentCollaborateur.groupes || [],
                    entreprises: currentCollaborateur.entreprises || [],
                    createdBy: currentUser.uid,
                    createdByName: currentUser.displayName || currentUser.email,
                    entrepriseName: currentEntreprise.raisonSociale || currentEntreprise.nom,
                    isFromCollaborateur: true,
                    collaborateurData: {
                        initiales: currentCollaborateur.initiales || '',
                        identifiant: currentCollaborateur.identifiant || currentCollaborateur.email,
                        actif: currentCollaborateur.actif !== false // Par défaut actif
                    }
                };
                
                // Mettre à jour l'invitation avec les métadonnées
                await updateDoc(doc(db, 'entreprise_invitations', invitation.id), invitationData);
                
                // Créer aussi une entrée dans collaborateurs pour le tracking
                const newCollaborateur = {
                    ...currentCollaborateur,
                    id: `collab_${Date.now()}`,
                    invitationId: invitation.id,
                    invitationCode: invitation.code,
                    status: 'pending', // En attente d'acceptation
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                
                const updatedCollaborateurs = [...collaborateursList, newCollaborateur];
                await saveCollaborateursToFirebase(updatedCollaborateurs);
                setCollaborateursList(updatedCollaborateurs);
                
                showMessage(`Invitation créée avec succès. Code : ${invitation.code}`, 'success');
                
                // TODO: Envoyer un email d'invitation
                console.log('📧 Email d\'invitation à envoyer à:', currentCollaborateur.email);
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
        
        // Si on change l'email et que l'identifiant n'est pas modifiable, mettre à jour l'identifiant
        if (name === 'email' && !currentCollaborateur.changerIdentifiants) {
            setCurrentCollaborateur(prev => ({
                ...prev,
                email: value,
                identifiant: value
            }));
        } 
        // Si on change le nom ou le prénom et que les initiales sont vides, générer automatiquement
        else if ((name === 'nom' || name === 'prenom') && !currentCollaborateur.initiales) {
            const updatedCollab = {
                ...currentCollaborateur,
                [name]: value
            };
            const initiales = (updatedCollab.prenom[0] || '') + (updatedCollab.nom[0] || '');
            setCurrentCollaborateur({
                ...updatedCollab,
                initiales: initiales.toUpperCase()
            });
        } else {
            setCurrentCollaborateur(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const updateSelectedCollaborateur = (field, value) => {
        if (selectedCollaborateur) {
            let updated = { ...selectedCollaborateur, [field]: value, updatedAt: new Date() };
            
            // Si on change l'email et que l'identifiant n'est pas modifiable, mettre à jour l'identifiant
            if (field === 'email' && !selectedCollaborateur.changerIdentifiants) {
                updated.identifiant = value;
            }
            
            // Si on désactive le changement d'identifiants, réinitialiser l'identifiant et les mots de passe
            if (field === 'changerIdentifiants' && !value) {
                updated.identifiant = updated.email;
                updated.motDePasse = '';
                updated.confirmationMotDePasse = '';
            }
            
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
                    className="w-100 text-nowrap d-flex align-items-center justify-content-center"
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
                                            {collaborateur.prenom || collaborateur.nom ? 
                                                `${collaborateur.prenom || ''} ${collaborateur.nom || ''}`.trim() : 
                                                collaborateur.email
                                            }
                                            {!collaborateur.actif && <span className="badge bg-secondary ms-2 small">Inactif</span>}
                                            {collaborateur.status === 'pending' && <span className="badge bg-warning ms-2 small">En attente</span>}
                                            {collaborateur.id === currentUser?.uid && <span className="badge bg-primary ms-2 small">Vous</span>}
                                        </h6>
                                        <small className="text-muted">
                                            {collaborateur.email}
                                            {collaborateur.invitationCode && (
                                                <span className="ms-2">
                                                    • Code: <code className="bg-light px-1">{collaborateur.invitationCode}</code>
                                                </span>
                                            )}
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
                        <Form.Check
                            type="checkbox"
                            label="Changer l'identifiant et le mot de passe ?"
                            checked={selectedCollaborateur.changerIdentifiants || false}
                            onChange={(e) => updateSelectedCollaborateur('changerIdentifiants', e.target.checked)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Identifiant</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedCollaborateur.identifiant || selectedCollaborateur.email || ''}
                            onChange={(e) => updateSelectedCollaborateur('identifiant', e.target.value)}
                            disabled={!selectedCollaborateur.changerIdentifiants}
                            className={!selectedCollaborateur.changerIdentifiants ? "bg-light" : ""}
                        />
                        <Form.Text className="text-muted">
                            {!selectedCollaborateur.changerIdentifiants && "Par défaut, l'email est utilisé comme identifiant"}
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>

            {selectedCollaborateur.changerIdentifiants && (
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Mot de passe</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    value={selectedCollaborateur.motDePasse || ''}
                                    onChange={(e) => updateSelectedCollaborateur('motDePasse', e.target.value)}
                                    placeholder="Nouveau mot de passe"
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
                            <Form.Label>Confirmation</Form.Label>
                            <Form.Control
                                type="password"
                                value={selectedCollaborateur.confirmationMotDePasse || ''}
                                onChange={(e) => updateSelectedCollaborateur('confirmationMotDePasse', e.target.value)}
                                placeholder="Confirmer le mot de passe"
                            />
                        </Form.Group>
                    </Col>
                </Row>
            )}

            {selectedCollaborateur.status === 'pending' && selectedCollaborateur.invitationCode && (
                <div className="mt-3 p-3 bg-warning bg-opacity-10 border border-warning rounded">
                    <h6 className="mb-2">Invitation en attente</h6>
                    <p className="mb-2">Ce collaborateur n'a pas encore accepté l'invitation.</p>
                    <div className="d-flex gap-2">
                        <Button
                            size="sm"
                            variant="warning"
                            onClick={() => {
                                const link = `${window.location.origin}/onboarding?action=join&code=${selectedCollaborateur.invitationCode}`;
                                navigator.clipboard.writeText(link);
                                showMessage('Lien d\'invitation copié !');
                            }}
                        >
                            <FaCopy className="me-2" />
                            Copier le lien
                        </Button>
                        <Button
                            size="sm"
                            variant="outline-warning"
                            onClick={() => {
                                const link = `${window.location.origin}/onboarding?action=join&code=${selectedCollaborateur.invitationCode}`;
                                const subject = `Invitation à rejoindre ${currentEntreprise.raisonSociale || currentEntreprise.nom}`;
                                const body = `Bonjour ${selectedCollaborateur.prenom},\n\nVous êtes invité(e) à rejoindre notre équipe sur TourCraft.\n\nCliquez sur le lien suivant ou utilisez le code d'invitation : ${selectedCollaborateur.invitationCode}\n\n${link}\n\nCordialement`;
                                window.location.href = `mailto:${selectedCollaborateur.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                            }}
                        >
                            <FaEnvelope className="me-2" />
                            Renvoyer par email
                        </Button>
                    </div>
                </div>
            )}

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
                                {groupesList.length > 0 ? groupesList.map(groupe => (
                                    <tr key={groupe.id}>
                                        <td>
                                            <div>
                                                <strong>{groupe.nom}</strong>
                                                {groupe.commentaires && <div className="small text-muted">{groupe.commentaires}</div>}
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
                                )) : (
                                    <tr>
                                        <td colSpan="2" className="text-center text-muted">
                                            Aucun groupe de permissions configuré
                                        </td>
                                    </tr>
                                )}
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
                                    const groupe = groupesList.find(g => g.id === groupeId);
                                    return groupe ? (
                                        <tr key={groupeId}>
                                            <td>
                                                <div>
                                                    <strong>{groupe.nom}</strong>
                                                    {groupe.commentaires && <div className="small text-muted">{groupe.commentaires}</div>}
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
                <Nav variant="tabs" className="mb-3">
                    <Nav.Item>
                        <Nav.Link 
                            active={modalActiveTab === 'informations-generales'}
                            onClick={() => setModalActiveTab('informations-generales')}
                        >
                            Informations générales
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link 
                            active={modalActiveTab === 'groupes-permissions'}
                            onClick={() => setModalActiveTab('groupes-permissions')}
                        >
                            Groupes / permissions
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link 
                            active={modalActiveTab === 'entreprises'}
                            onClick={() => setModalActiveTab('entreprises')}
                        >
                            Entreprises
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link 
                            active={modalActiveTab === 'comptes-messagerie'}
                            onClick={() => setModalActiveTab('comptes-messagerie')}
                        >
                            Comptes de messagerie
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
                
                {modalActiveTab === 'informations-generales' && (
                    <Form>
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            name="actif"
                            label="Collaborateur actif ?"
                            checked={currentCollaborateur.actif}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nom</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nom"
                                    value={currentCollaborateur.nom}
                                    onChange={handleInputChange}
                                    placeholder="Optionnel"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Prénom</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="prenom"
                                    value={currentCollaborateur.prenom}
                                    onChange={handleInputChange}
                                    placeholder="Optionnel"
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
                                    value={currentCollaborateur.identifiant || currentCollaborateur.email}
                                    onChange={handleInputChange}
                                    disabled={!currentCollaborateur.changerIdentifiants}
                                    className={!currentCollaborateur.changerIdentifiants ? "bg-light" : ""}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {!isEditing && (
                        <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            Une invitation sera automatiquement créée et envoyée à cette adresse email.
                        </div>
                    )}
                </Form>
                )}
                
                {modalActiveTab === 'groupes-permissions' && (
                    <div>
                        <Row>
                            <Col md={6}>
                                <h6>Groupes disponibles</h6>
                                <div className="border rounded p-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {groupesList.length > 0 ? groupesList.map(groupe => (
                                        <Form.Check
                                            key={groupe.id}
                                            type="checkbox"
                                            label={groupe.nom}
                                            checked={currentCollaborateur.groupes?.includes(groupe.id) || false}
                                            onChange={(e) => {
                                                const updatedGroupes = e.target.checked
                                                    ? [...(currentCollaborateur.groupes || []), groupe.id]
                                                    : (currentCollaborateur.groupes || []).filter(g => g !== groupe.id);
                                                setCurrentCollaborateur({
                                                    ...currentCollaborateur,
                                                    groupes: updatedGroupes
                                                });
                                            }}
                                        />
                                    )) : (
                                        <div className="text-center text-muted py-3">
                                            Aucun groupe de permissions configuré
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col md={6}>
                                <h6>Groupes sélectionnés</h6>
                                <div className="border rounded p-2" style={{ minHeight: '100px' }}>
                                    {currentCollaborateur.groupes?.map(groupeId => {
                                        const groupe = groupesList.find(g => g.id === groupeId);
                                        return groupe ? (
                                            <Badge key={groupeId} bg="primary" className="me-2 mb-2">
                                                {groupe.nom}
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
                
                {modalActiveTab === 'entreprises' && (
                    <div>
                        <Row>
                            <Col md={6}>
                                <h6>Entreprises disponibles</h6>
                                <div className="border rounded p-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {entreprisesList.map(entreprise => (
                                        <Form.Check
                                            key={entreprise.id}
                                            type="checkbox"
                                            label={entreprise.raisonSociale || entreprise.nom}
                                            checked={currentCollaborateur.entreprises?.includes(entreprise.id) || false}
                                            onChange={(e) => {
                                                const updatedEntreprises = e.target.checked
                                                    ? [...(currentCollaborateur.entreprises || []), entreprise.id]
                                                    : (currentCollaborateur.entreprises || []).filter(id => id !== entreprise.id);
                                                setCurrentCollaborateur({
                                                    ...currentCollaborateur,
                                                    entreprises: updatedEntreprises
                                                });
                                            }}
                                        />
                                    ))}
                                </div>
                            </Col>
                            <Col md={6}>
                                <h6>Raison sociale</h6>
                                <div className="border rounded p-2" style={{ minHeight: '100px' }}>
                                    {currentCollaborateur.entreprises?.map(entrepriseId => {
                                        const entreprise = entreprisesList.find(e => e.id === entrepriseId);
                                        return entreprise ? (
                                            <Badge key={entrepriseId} bg="info" className="me-2 mb-2">
                                                {entreprise.raisonSociale || entreprise.nom}
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
                
                {modalActiveTab === 'comptes-messagerie' && (
                    <div>
                        <Row>
                            <Col md={6}>
                                <h6>Comptes disponibles</h6>
                                <div className="border rounded p-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {comptesMessagerieList.map(compte => (
                                        <Form.Check
                                            key={compte.id}
                                            type="checkbox"
                                            label={`${compte.compte} - ${compte.adresse}`}
                                            checked={currentCollaborateur.comptesMessagerie?.includes(compte.id) || false}
                                            onChange={(e) => {
                                                const updatedComptes = e.target.checked
                                                    ? [...(currentCollaborateur.comptesMessagerie || []), compte.id]
                                                    : (currentCollaborateur.comptesMessagerie || []).filter(id => id !== compte.id);
                                                setCurrentCollaborateur({
                                                    ...currentCollaborateur,
                                                    comptesMessagerie: updatedComptes
                                                });
                                            }}
                                        />
                                    ))}
                                </div>
                            </Col>
                            <Col md={6}>
                                <h6>Comptes sélectionnés</h6>
                                <div className="border rounded p-2" style={{ minHeight: '100px' }}>
                                    {currentCollaborateur.comptesMessagerie?.map(compteId => {
                                        const compte = comptesMessagerieList.find(c => c.id === compteId);
                                        return compte ? (
                                            <Badge key={compteId} bg="success" className="me-2 mb-2">
                                                {compte.compte}
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
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