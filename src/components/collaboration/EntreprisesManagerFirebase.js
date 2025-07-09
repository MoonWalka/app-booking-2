import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Modal, Alert, Nav } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import './EntreprisesManager.css';

/**
 * EntreprisesManager avec intégration Firebase
 * Gère les entreprises dans la collection collaborationConfig
 */
const EntreprisesManagerFirebase = () => {
    const { currentEntreprise } = useEntreprise();
    const [entreprisesList, setEntreprisesList] = useState([]);
    const [selectedEntreprise, setSelectedEntreprise] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success');
    const [activeTab, setActiveTab] = useState('informations-generales');
    const [loading, setLoading] = useState(false);
    
    // État pour le formulaire d'entreprise
    const [entrepriseForm, setEntrepriseForm] = useState({
        id: null,
        raisonSociale: '',
        code: '',
        adresse: '',
        suiteAdresse: '',
        suiteAdresse2: '',
        suiteAdresse3: '',
        codePostal: '',
        ville: '',
        pays: 'France',
        region: '',
        departement: '',
        principal: false,
        assujettie: false,
        devise: 'EUR',
        structureBase: '',
        telephone: '',
        fax: '',
        email: '',
        site: '',
        // Infos administratives
        signataire: '',
        fonction: '',
        lieu: '',
        tribunaux: '',
        coordonneesBancaires: '',
        ordre: '',
        siret: '',
        ape: '',
        licence: '',
        tva: '',
        // Informations bancaires détaillées
        iban: '',
        bic: '',
        banque: ''
    });

    // Charger les entreprises depuis Firebase
    useEffect(() => {
        const loadEntreprises = async () => {
            if (!currentEntreprise?.id) return;
            
            setLoading(true);
            try {
                let loadedEntreprises = [];
                
                // Charger depuis entreprises/{id}/collaborationEntreprises
                const collaborationEntreprisesRef = collection(db, 'entreprises', currentEntreprise.id, 'collaborationEntreprises');
                const collaborationSnapshot = await getDocs(collaborationEntreprisesRef);
                
                collaborationSnapshot.forEach(doc => {
                    loadedEntreprises.push({ id: doc.id, ...doc.data() });
                });
                
                // Charger l'entreprise principale depuis la racine entreprises/{id}
                const entrepriseDoc = await getDoc(doc(db, 'entreprises', currentEntreprise.id));
                
                if (entrepriseDoc.exists()) {
                    const entrepriseData = entrepriseDoc.data();
                    
                    // Essayer aussi de charger les détails depuis settings/entreprise si disponible
                    const settingsRef = doc(db, 'entreprises', currentEntreprise.id, 'settings', 'entreprise');
                    const settingsDoc = await getDoc(settingsRef);
                    
                    // Fusionner les données de base avec les détails si disponibles
                    const mainEntreprise = {
                        id: 'main',
                        principal: true,
                        raisonSociale: entrepriseData.name || settingsDoc.data()?.nom || settingsDoc.data()?.raisonSociale || 'Entreprise principale',
                        code: entrepriseData.slug || 'MAIN',
                        type: entrepriseData.type,
                        ...(settingsDoc.exists() ? settingsDoc.data() : {}),
                        // Mapper les champs si nécessaire
                        ape: settingsDoc.data()?.codeAPE || settingsDoc.data()?.ape || '',
                        ville: settingsDoc.data()?.ville || '',
                        email: settingsDoc.data()?.email || '',
                        telephone: settingsDoc.data()?.telephone || ''
                    };
                    
                    // Vérifier si l'entreprise principale n'est pas déjà dans la liste chargée
                    const existingMain = loadedEntreprises.find(e => e.id === 'main');
                    if (!existingMain) {
                        loadedEntreprises = [mainEntreprise, ...loadedEntreprises];
                    }
                }
                
                // Mettre à jour l'état une seule fois
                setEntreprisesList(loadedEntreprises);
                if (loadedEntreprises.length > 0) {
                    setSelectedEntreprise(loadedEntreprises[0]);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des entreprises:', error);
                showMessage('Erreur lors du chargement des entreprises', 'danger');
            } finally {
                setLoading(false);
            }
        };
        
        loadEntreprises();
    }, [currentEntreprise?.id]);

    const handleShowModal = (entreprise = null) => {
        if (entreprise) {
            setEntrepriseForm({ ...entreprise });
            setIsEditing(true);
        } else {
            setEntrepriseForm({
                id: null,
                raisonSociale: '',
                code: '',
                adresse: '',
                suiteAdresse: '',
                suiteAdresse2: '',
                suiteAdresse3: '',
                codePostal: '',
                ville: '',
                pays: 'France',
                region: '',
                departement: '',
                principal: false,
                assujettie: false,
                devise: 'EUR',
                structureBase: '',
                telephone: '',
                fax: '',
                email: '',
                site: '',
                signataire: '',
                fonction: '',
                lieu: '',
                tribunaux: '',
                coordonneesBancaires: '',
                ordre: '',
                siret: '',
                ape: '',
                licence: '',
                tva: ''
            });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!entrepriseForm.raisonSociale.trim()) {
            return;
        }

        try {
            let updatedList;
            
            if (isEditing) {
                updatedList = entreprisesList.map(entreprise => 
                    entreprise.id === entrepriseForm.id ? entrepriseForm : entreprise
                );
                
                if (selectedEntreprise?.id === entrepriseForm.id) {
                    setSelectedEntreprise(entrepriseForm);
                }
            } else {
                const newEntreprise = {
                    ...entrepriseForm,
                    id: `entreprise_${Date.now()}`
                };
                updatedList = [...entreprisesList, newEntreprise];
                
                if (!selectedEntreprise) {
                    setSelectedEntreprise(newEntreprise);
                }
            }
            
            // Sauvegarder dans Firebase
            await saveEntreprisesToFirebase(updatedList);
            
            setEntreprisesList(updatedList);
            showMessage(
                isEditing ? 'Entreprise modifiée avec succès' : 'Entreprise ajoutée avec succès',
                'success'
            );
            setShowModal(false);
            
            // Si c'est l'entreprise principale, mettre à jour aussi dans settings/entreprise
            if (entrepriseForm.principal || entrepriseForm.id === 'main') {
                const entrepriseRef = doc(db, 'entreprises', currentEntreprise.id, 'settings', 'entreprise');
                
                // Préparer les données en nettoyant les undefined
                const dataToSave = cleanUndefinedValues({
                    nom: entrepriseForm.raisonSociale,
                    adresse: entrepriseForm.adresse,
                    codePostal: entrepriseForm.codePostal,
                    ville: entrepriseForm.ville,
                    telephone: entrepriseForm.telephone,
                    email: entrepriseForm.email,
                    siteWeb: entrepriseForm.site,
                    siret: entrepriseForm.siret,
                    codeAPE: entrepriseForm.ape,
                    numeroTVAIntracommunautaire: entrepriseForm.tva,
                    licenceSpectacle: entrepriseForm.licence,
                    representantLegal: entrepriseForm.signataire,
                    qualiteRepresentant: entrepriseForm.fonction,
                    coordonneesBancaires: entrepriseForm.coordonneesBancaires,
                    iban: entrepriseForm.iban,
                    bic: entrepriseForm.bic,
                    banque: entrepriseForm.banque,
                    updatedAt: new Date().toISOString()
                });
                
                await setDoc(entrepriseRef, dataToSave);
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            showMessage('Erreur lors de la sauvegarde', 'danger');
        }
    };

    const handleDelete = async (entreprise) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${entreprise.raisonSociale}" ?`)) {
            if (entreprise.principal || entreprise.id === 'main') {
                showMessage('Impossible de supprimer l\'entreprise principale', 'warning');
                return;
            }
            
            try {
                // Supprimer de Firebase
                if (entreprise.id && entreprise.id !== 'main') {
                    const entrepriseRef = doc(db, 'entreprises', currentEntreprise.id, 'collaborationEntreprises', entreprise.id);
                    await deleteDoc(entrepriseRef);
                }
                
                const updatedList = entreprisesList.filter(e => e.id !== entreprise.id);
                setEntreprisesList(updatedList);
                if (selectedEntreprise?.id === entreprise.id) {
                    const remaining = updatedList;
                    setSelectedEntreprise(remaining.length > 0 ? remaining[0] : null);
                }
                
                showMessage('Entreprise supprimée avec succès', 'success');
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                showMessage('Erreur lors de la suppression', 'danger');
            }
        }
    };

    // Fonction pour nettoyer les valeurs undefined
    const cleanUndefinedValues = (obj) => {
        const cleaned = {};
        Object.keys(obj).forEach(key => {
            if (obj[key] !== undefined) {
                cleaned[key] = obj[key];
            }
        });
        return cleaned;
    };

    const saveEntreprisesToFirebase = async (entreprises) => {
        if (!currentEntreprise?.id) return;
        
        // Sauvegarder chaque entreprise dans la sous-collection
        for (const entreprise of entreprises) {
            if (entreprise.id && entreprise.id !== 'main') {
                const entrepriseRef = doc(db, 'entreprises', currentEntreprise.id, 'collaborationEntreprises', entreprise.id);
                const cleanedEntreprise = cleanUndefinedValues(entreprise);
                await setDoc(entrepriseRef, {
                    ...cleanedEntreprise,
                    updatedAt: new Date()
                });
            }
        }
    };

    const showMessage = (message, type = 'success') => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEntrepriseForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const updateSelectedEntreprise = (field, value) => {
        if (selectedEntreprise) {
            const updated = { ...selectedEntreprise, [field]: value };
            setSelectedEntreprise(updated);
            
            const updatedList = entreprisesList.map(e => 
                e.id === selectedEntreprise.id ? updated : e
            );
            setEntreprisesList(updatedList);
        }
    };

    // Fonction pour sauvegarder manuellement les modifications
    const handleSaveEntreprise = async () => {
        if (!selectedEntreprise) return;
        
        try {
            setLoading(true);
            await saveEntreprisesToFirebase(entreprisesList);
            
            // Si c'est l'entreprise principale, mettre à jour aussi dans settings/entreprise
            if (selectedEntreprise.principal || selectedEntreprise.id === 'main') {
                const entrepriseRef = doc(db, 'entreprises', currentEntreprise.id, 'settings', 'entreprise');
                
                // Préparer les données en nettoyant les undefined
                const dataToSave = cleanUndefinedValues({
                    nom: selectedEntreprise.raisonSociale,
                    adresse: selectedEntreprise.adresse,
                    codePostal: selectedEntreprise.codePostal,
                    ville: selectedEntreprise.ville,
                    telephone: selectedEntreprise.telephone,
                    email: selectedEntreprise.email,
                    siteWeb: selectedEntreprise.site,
                    siret: selectedEntreprise.siret,
                    codeAPE: selectedEntreprise.ape,
                    numeroTVAIntracommunautaire: selectedEntreprise.tva,
                    licenceSpectacle: selectedEntreprise.licence,
                    representantLegal: selectedEntreprise.signataire,
                    qualiteRepresentant: selectedEntreprise.fonction,
                    coordonneesBancaires: selectedEntreprise.coordonneesBancaires,
                    iban: selectedEntreprise.iban,
                    bic: selectedEntreprise.bic,
                    banque: selectedEntreprise.banque,
                    updatedAt: new Date().toISOString()
                });
                
                await setDoc(entrepriseRef, dataToSave);
            }
            
            showMessage('Entreprise enregistrée avec succès', 'success');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            showMessage('Erreur lors de la sauvegarde', 'danger');
        } finally {
            setLoading(false);
        }
    };

    // Rendu de la liste des entreprises (colonne 2)
    const renderEntreprisesList = () => (
        <div>
            <div className="mb-3">
                <Button 
                    variant="success" 
                    onClick={() => handleShowModal()}
                    className="w-100 d-flex align-items-center justify-content-center"
                    disabled={loading}
                >
                    <FaPlus className="me-2" />
                    <span className="text-nowrap">Nouvelle entreprise</span>
                </Button>
            </div>

            {loading ? (
                <div className="text-center p-3">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            ) : (
                <div className="entreprises-list">
                    {entreprisesList.map(entreprise => (
                        <Card 
                            key={entreprise.id} 
                            className={`mb-2 cursor-pointer ${selectedEntreprise?.id === entreprise.id ? 'border-primary' : ''}`}
                            onClick={() => setSelectedEntreprise(entreprise)}
                        >
                            <Card.Body className="py-2">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                        <h6 className="mb-1">
                                            {entreprise.raisonSociale}
                                            {(entreprise.principal || entreprise.id === 'main') && (
                                                <span className="badge bg-primary ms-2">Principale</span>
                                            )}
                                        </h6>
                                        <small className="text-muted">
                                            {entreprise.code} • {entreprise.ville}
                                        </small>
                                    </div>
                                    <div className="ms-2">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleShowModal(entreprise);
                                            }}
                                            className="text-warning p-1"
                                        >
                                            <FaEdit />
                                        </Button>
                                        {!(entreprise.principal || entreprise.id === 'main') && (
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(entreprise);
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

    // Rendu des détails d'entreprise avec onglets (colonne 3)
    const renderEntrepriseDetails = () => {
        if (!selectedEntreprise) {
            return (
                <div className="text-center p-5">
                    <i className="bi bi-building" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                    <h4 className="mt-3">Aucune entreprise sélectionnée</h4>
                    <p className="text-muted">Sélectionnez une entreprise dans la liste pour voir ses détails.</p>
                </div>
            );
        }

        return (
            <Card>
                <Card.Header>
                    <h4 className="mb-0">{selectedEntreprise.raisonSociale}</h4>
                </Card.Header>
                <Card.Body className="p-0">
                    <Nav variant="tabs" className="border-bottom-0">
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'informations-generales'}
                                onClick={() => setActiveTab('informations-generales')}
                            >
                                Informations générales
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'informations-administratives'}
                                onClick={() => setActiveTab('informations-administratives')}
                            >
                                Informations administratives
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'collaborateurs'}
                                onClick={() => setActiveTab('collaborateurs')}
                            >
                                Collaborateurs
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'preferences-devis'}
                                onClick={() => setActiveTab('preferences-devis')}
                            >
                                Préférences devis
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'preferences-pre-contrat'}
                                onClick={() => setActiveTab('preferences-pre-contrat')}
                            >
                                Préférences pré-contrat
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'preferences-contrat'}
                                onClick={() => setActiveTab('preferences-contrat')}
                            >
                                Préférences contrat
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'preferences-facture'}
                                onClick={() => setActiveTab('preferences-facture')}
                            >
                                Préférences facture
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                    
                    <div className="p-3">
                        {renderTabContent()}
                        
                        {/* Bouton Enregistrer */}
                        <div className="mt-4 d-flex justify-content-end">
                            <Button 
                                variant="primary" 
                                onClick={handleSaveEntreprise}
                                disabled={loading || !selectedEntreprise}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-save me-2"></i>
                                        Enregistrer les modifications
                                    </>
                                )}
                            </Button>
                        </div>
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
            case 'informations-administratives':
                return renderInformationsAdministratives();
            case 'collaborateurs':
                return renderCollaborateurs();
            case 'preferences-devis':
            case 'preferences-pre-contrat':
            case 'preferences-contrat':
            case 'preferences-facture':
                return renderPreferencesVide();
            default:
                return null;
        }
    };

    // Onglet Informations générales
    const renderInformationsGenerales = () => (
        <Form>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Raison sociale *</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.raisonSociale || ''}
                            onChange={(e) => updateSelectedEntreprise('raisonSociale', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Code *</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.code || ''}
                            onChange={(e) => updateSelectedEntreprise('code', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Adresse</Form.Label>
                <Form.Control
                    type="text"
                    value={selectedEntreprise.adresse || ''}
                    onChange={(e) => updateSelectedEntreprise('adresse', e.target.value)}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Suite adresse</Form.Label>
                <Form.Control
                    type="text"
                    value={selectedEntreprise.suiteAdresse || ''}
                    onChange={(e) => updateSelectedEntreprise('suiteAdresse', e.target.value)}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Suite adresse 2</Form.Label>
                <Form.Control
                    type="text"
                    value={selectedEntreprise.suiteAdresse2 || ''}
                    onChange={(e) => updateSelectedEntreprise('suiteAdresse2', e.target.value)}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Suite adresse 3</Form.Label>
                <Form.Control
                    type="text"
                    value={selectedEntreprise.suiteAdresse3 || ''}
                    onChange={(e) => updateSelectedEntreprise('suiteAdresse3', e.target.value)}
                />
            </Form.Group>

            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Code postal</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.codePostal || ''}
                            onChange={(e) => updateSelectedEntreprise('codePostal', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={8}>
                    <Form.Group className="mb-3">
                        <Form.Label>Ville</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.ville || ''}
                            onChange={(e) => updateSelectedEntreprise('ville', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Pays</Form.Label>
                        <Form.Select
                            value={selectedEntreprise.pays || 'France'}
                            onChange={(e) => updateSelectedEntreprise('pays', e.target.value)}
                        >
                            <option value="France">France</option>
                            <option value="Belgique">Belgique</option>
                            <option value="Suisse">Suisse</option>
                            <option value="Canada">Canada</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Région</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.region || ''}
                            onChange={(e) => updateSelectedEntreprise('region', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Département</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.departement || ''}
                            onChange={(e) => updateSelectedEntreprise('departement', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>État</Form.Label>
                        <div>
                            <Form.Check
                                type="checkbox"
                                label="Principal"
                                checked={selectedEntreprise.principal || false}
                                onChange={(e) => updateSelectedEntreprise('principal', e.target.checked)}
                                disabled={selectedEntreprise.id === 'main'}
                            />
                            <Form.Check
                                type="checkbox"
                                label="Assujettie"
                                checked={selectedEntreprise.assujettie || false}
                                onChange={(e) => updateSelectedEntreprise('assujettie', e.target.checked)}
                            />
                        </div>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Devise de facturation</Form.Label>
                        <Form.Select
                            value={selectedEntreprise.devise || 'EUR'}
                            onChange={(e) => updateSelectedEntreprise('devise', e.target.value)}
                        >
                            <option value="EUR">Euro (EUR)</option>
                            <option value="USD">Dollar américain (USD)</option>
                            <option value="GBP">Livre sterling (GBP)</option>
                            <option value="CHF">Franc suisse (CHF)</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Structure dans la base</Form.Label>
                <Form.Control
                    type="text"
                    value={selectedEntreprise.structureBase || ''}
                    onChange={(e) => updateSelectedEntreprise('structureBase', e.target.value)}
                />
            </Form.Group>

            <h6 className="border-bottom pb-2 mb-3">Joignable au</h6>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Téléphone</Form.Label>
                        <Form.Control
                            type="tel"
                            value={selectedEntreprise.telephone || ''}
                            onChange={(e) => updateSelectedEntreprise('telephone', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Fax</Form.Label>
                        <Form.Control
                            type="tel"
                            value={selectedEntreprise.fax || ''}
                            onChange={(e) => updateSelectedEntreprise('fax', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={selectedEntreprise.email || ''}
                            onChange={(e) => updateSelectedEntreprise('email', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Site</Form.Label>
                        <Form.Control
                            type="url"
                            value={selectedEntreprise.site || ''}
                            onChange={(e) => updateSelectedEntreprise('site', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>
        </Form>
    );

    // Onglet Informations administratives
    const renderInformationsAdministratives = () => (
        <Form>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Signataire</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.signataire || ''}
                            onChange={(e) => updateSelectedEntreprise('signataire', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Fonction</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.fonction || ''}
                            onChange={(e) => updateSelectedEntreprise('fonction', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Lieu</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.lieu || ''}
                            onChange={(e) => updateSelectedEntreprise('lieu', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tribunaux</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.tribunaux || ''}
                            onChange={(e) => updateSelectedEntreprise('tribunaux', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <h5 className="mt-4 mb-3">Informations bancaires</h5>
            
            <Row>
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label>IBAN</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.iban || ''}
                            onChange={(e) => updateSelectedEntreprise('iban', e.target.value)}
                            placeholder="FR76 1234 5678 9012 3456 7890 123"
                        />
                        <Form.Text className="text-muted">
                            International Bank Account Number
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>
            
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>BIC</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.bic || ''}
                            onChange={(e) => updateSelectedEntreprise('bic', e.target.value)}
                            placeholder="BNPAFRPP"
                        />
                        <Form.Text className="text-muted">
                            Bank Identifier Code
                        </Form.Text>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nom de la banque</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.banque || ''}
                            onChange={(e) => updateSelectedEntreprise('banque', e.target.value)}
                            placeholder="BNP Paribas"
                        />
                    </Form.Group>
                </Col>
            </Row>
            
            <Form.Group className="mb-3">
                <Form.Label>Autres informations bancaires</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    value={selectedEntreprise.coordonneesBancaires || ''}
                    onChange={(e) => updateSelectedEntreprise('coordonneesBancaires', e.target.value)}
                    placeholder="Informations complémentaires (agence, adresse...)"
                />
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Ordre</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.ordre || ''}
                            onChange={(e) => updateSelectedEntreprise('ordre', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>SIRET</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.siret || ''}
                            onChange={(e) => updateSelectedEntreprise('siret', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>APE</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.ape || ''}
                            onChange={(e) => updateSelectedEntreprise('ape', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Licence</Form.Label>
                        <Form.Control
                            type="text"
                            value={selectedEntreprise.licence || ''}
                            onChange={(e) => updateSelectedEntreprise('licence', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>TVA</Form.Label>
                <Form.Control
                    type="text"
                    value={selectedEntreprise.tva || ''}
                    onChange={(e) => updateSelectedEntreprise('tva', e.target.value)}
                />
            </Form.Group>
        </Form>
    );

    // Onglet Collaborateurs (vide pour l'instant)
    const renderCollaborateurs = () => (
        <div className="text-center p-5">
            <i className="bi bi-people" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
            <h5 className="mt-3">Collaborateurs</h5>
            <p className="text-muted">
                Cette section sera implémentée prochainement.<br />
                Elle affichera la liste des collaborateurs associés à cette entreprise.
            </p>
        </div>
    );

    // Onglets Préférences (vides pour l'instant)
    const renderPreferencesVide = () => {
        const titres = {
            'preferences-devis': 'Préférences devis',
            'preferences-pre-contrat': 'Préférences pré-contrat',
            'preferences-contrat': 'Préférences contrat',
            'preferences-facture': 'Préférences facture'
        };
        
        return (
            <div className="text-center p-5">
                <i className="bi bi-gear" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                <h5 className="mt-3">{titres[activeTab]}</h5>
                <p className="text-muted">
                    Cette section sera implémentée prochainement.<br />
                    Elle permettra de configurer les préférences pour {titres[activeTab].toLowerCase()}.
                </p>
            </div>
        );
    };

    // Modal pour créer/éditer une entreprise
    const renderModal = () => (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEditing ? 'Modifier' : 'Ajouter'} une entreprise
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Raison sociale *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="raisonSociale"
                                    value={entrepriseForm.raisonSociale}
                                    onChange={handleInputChange}
                                    required
                                    autoFocus
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Code *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="code"
                                    value={entrepriseForm.code}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Adresse</Form.Label>
                        <Form.Control
                            type="text"
                            name="adresse"
                            value={entrepriseForm.adresse}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Code postal</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="codePostal"
                                    value={entrepriseForm.codePostal}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Ville</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="ville"
                                    value={entrepriseForm.ville}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Téléphone</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="telephone"
                                    value={entrepriseForm.telephone}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={entrepriseForm.email}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Check
                                type="checkbox"
                                label="Principal"
                                name="principal"
                                checked={entrepriseForm.principal}
                                onChange={handleInputChange}
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Check
                                type="checkbox"
                                label="Assujettie"
                                name="assujettie"
                                checked={entrepriseForm.assujettie}
                                onChange={handleInputChange}
                            />
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Annuler
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleSave}
                    disabled={!entrepriseForm.raisonSociale.trim()}
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
                    <Alert variant={alertType} dismissible onClose={() => setShowAlert(false)}>
                        {alertMessage}
                    </Alert>
                </Col>
            )}
            
            <Col md={3}>
                <Card>
                    <Card.Header>
                        <h6 className="mb-0">Entreprises</h6>
                    </Card.Header>
                    <Card.Body className="p-2">
                        {renderEntreprisesList()}
                    </Card.Body>
                </Card>
            </Col>
            
            <Col md={9}>
                {renderEntrepriseDetails()}
            </Col>
            
            {renderModal()}
        </Row>
    );
};

export default EntreprisesManagerFirebase;