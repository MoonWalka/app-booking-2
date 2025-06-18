import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Modal, Alert, Nav } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './EntreprisesManager.css';

const EntreprisesManager = () => {
    const [entreprisesList, setEntreprisesList] = useState([]);
    const [selectedEntreprise, setSelectedEntreprise] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [activeTab, setActiveTab] = useState('informations-generales');
    
    // État pour le formulaire d'entreprise
    const [currentEntreprise, setCurrentEntreprise] = useState({
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
        tva: ''
    });

    // Données d'exemple
    const getMockData = () => [
        {
            id: 1,
            raisonSociale: 'TourCraft Productions',
            code: 'TCP',
            adresse: '123 Rue de la Musique',
            ville: 'Paris',
            pays: 'France',
            telephone: '+33 1 23 45 67 89',
            email: 'contact@tourcraft.com',
            principal: true,
            assujettie: true
        },
        {
            id: 2,
            raisonSociale: 'Spectacles & Événements',
            code: 'SE',
            adresse: '456 Avenue des Arts',
            ville: 'Lyon',
            pays: 'France',
            telephone: '+33 4 78 90 12 34',
            email: 'info@spectacles-events.fr',
            principal: false,
            assujettie: true
        }
    ];

    // Chargement initial
    useEffect(() => {
        const mockData = getMockData();
        setEntreprisesList(mockData);
        if (mockData.length > 0) {
            setSelectedEntreprise(mockData[0]);
        }
    }, []);

    const handleShowModal = (entreprise = null) => {
        if (entreprise) {
            setCurrentEntreprise({ ...entreprise });
            setIsEditing(true);
        } else {
            setCurrentEntreprise({
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

    const handleSave = () => {
        if (!currentEntreprise.raisonSociale.trim()) {
            return;
        }

        if (isEditing) {
            setEntreprisesList(entreprisesList.map(entreprise => 
                entreprise.id === currentEntreprise.id ? currentEntreprise : entreprise
            ));
            if (selectedEntreprise?.id === currentEntreprise.id) {
                setSelectedEntreprise(currentEntreprise);
            }
            showSuccessMessage('Entreprise modifiée avec succès');
        } else {
            const newEntreprise = {
                ...currentEntreprise,
                id: Math.max(...entreprisesList.map(e => e.id), 0) + 1
            };
            setEntreprisesList([...entreprisesList, newEntreprise]);
            if (!selectedEntreprise) {
                setSelectedEntreprise(newEntreprise);
            }
            showSuccessMessage('Entreprise ajoutée avec succès');
        }
        setShowModal(false);
    };

    const handleDelete = (entreprise) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${entreprise.raisonSociale}" ?`)) {
            setEntreprisesList(entreprisesList.filter(e => e.id !== entreprise.id));
            if (selectedEntreprise?.id === entreprise.id) {
                const remaining = entreprisesList.filter(e => e.id !== entreprise.id);
                setSelectedEntreprise(remaining.length > 0 ? remaining[0] : null);
            }
            showSuccessMessage('Entreprise supprimée avec succès');
        }
    };

    const showSuccessMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentEntreprise(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const updateSelectedEntreprise = (field, value) => {
        if (selectedEntreprise) {
            const updated = { ...selectedEntreprise, [field]: value };
            setSelectedEntreprise(updated);
            setEntreprisesList(entreprisesList.map(e => 
                e.id === selectedEntreprise.id ? updated : e
            ));
        }
    };

    // Rendu de la liste des entreprises (colonne 2)
    const renderEntreprisesList = () => (
        <div>
            <div className="mb-3">
                <Button 
                    variant="success" 
                    onClick={() => handleShowModal()}
                    className="w-100"
                >
                    <FaPlus className="me-2" />
                    Nouvelle entreprise
                </Button>
            </div>

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
                                    <h6 className="mb-1">{entreprise.raisonSociale}</h6>
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
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                ))}
            </div>
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

            <Form.Group className="mb-3">
                <Form.Label>Coordonnées bancaires</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedEntreprise.coordonneesBancaires || ''}
                    onChange={(e) => updateSelectedEntreprise('coordonneesBancaires', e.target.value)}
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
                                    value={currentEntreprise.raisonSociale}
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
                                    value={currentEntreprise.code}
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
                            value={currentEntreprise.adresse}
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
                                    value={currentEntreprise.codePostal}
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
                                    value={currentEntreprise.ville}
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
                                    value={currentEntreprise.telephone}
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
                                    value={currentEntreprise.email}
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
                                checked={currentEntreprise.principal}
                                onChange={handleInputChange}
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Check
                                type="checkbox"
                                label="Assujettie"
                                name="assujettie"
                                checked={currentEntreprise.assujettie}
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
                    disabled={!currentEntreprise.raisonSociale.trim()}
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

export default EntreprisesManager;