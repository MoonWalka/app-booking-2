import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert, Badge, InputGroup, Row, Col } from 'react-bootstrap';
import { FaPlus, FaSync, FaEdit, FaTrash, FaSearch, FaEye, FaEyeSlash } from 'react-icons/fa';
import './MessagerieManager.css';

const MessagerieManager = ({ type, title, buttonLabel }) => {
    const [itemsList, setItemsList] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [currentItem, setCurrentItem] = useState({
        id: null,
        nom: '',
        email: '',
        serveur: '',
        port: '',
        securite: 'SSL',
        username: '',
        password: '',
        actif: true
    });

    // Données d'exemple selon le type
    const getMockData = () => {
        switch (type) {
            case 'comptes-messagerie':
                return [
                    { 
                        id: 1, 
                        nom: 'Compte principal', 
                        email: 'contact@tourcraft.com', 
                        serveur: 'smtp.gmail.com', 
                        port: 587, 
                        securite: 'TLS',
                        username: 'contact@tourcraft.com',
                        actif: true,
                        dernierTest: '2024-01-15 10:30'
                    },
                    { 
                        id: 2, 
                        nom: 'Booking', 
                        email: 'booking@tourcraft.com', 
                        serveur: 'smtp.gmail.com', 
                        port: 587, 
                        securite: 'TLS',
                        username: 'booking@tourcraft.com',
                        actif: true,
                        dernierTest: '2024-01-14 16:45'
                    },
                    { 
                        id: 3, 
                        nom: 'Communication', 
                        email: 'communication@tourcraft.com', 
                        serveur: 'smtp.office365.com', 
                        port: 587, 
                        securite: 'TLS',
                        username: 'communication@tourcraft.com',
                        actif: false,
                        dernierTest: '2024-01-10 14:20'
                    }
                ];
            case 'serveur-envoi':
                return [
                    { 
                        id: 1, 
                        nom: 'Configuration Gmail', 
                        serveur: 'smtp.gmail.com', 
                        port: 587, 
                        securite: 'TLS',
                        actif: true,
                        description: 'Configuration pour les comptes Gmail'
                    },
                    { 
                        id: 2, 
                        nom: 'Configuration Office 365', 
                        serveur: 'smtp.office365.com', 
                        port: 587, 
                        securite: 'TLS',
                        actif: true,
                        description: 'Configuration pour les comptes Microsoft'
                    },
                    { 
                        id: 3, 
                        nom: 'Configuration Yahoo', 
                        serveur: 'smtp.mail.yahoo.com', 
                        port: 587, 
                        securite: 'TLS',
                        actif: false,
                        description: 'Configuration pour les comptes Yahoo'
                    }
                ];
            default:
                return [];
        }
    };

    // Chargement initial des données
    useEffect(() => {
        loadItemsList();
    }, [type]);

    // Filtrage des éléments
    useEffect(() => {
        if (searchTerm) {
            setFilteredItems(itemsList.filter(item => 
                item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                item.serveur.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        } else {
            setFilteredItems(itemsList);
        }
    }, [itemsList, searchTerm]);

    const loadItemsList = () => {
        const mockData = getMockData();
        setItemsList(mockData);
    };

    const handleShowModal = (item = null) => {
        if (item) {
            setCurrentItem({ ...item, password: '********' }); // Masquer le mot de passe
            setIsEditing(true);
        } else {
            setCurrentItem({
                id: null,
                nom: '',
                email: type === 'comptes-messagerie' ? '' : undefined,
                serveur: '',
                port: type === 'comptes-messagerie' ? 587 : '',
                securite: 'TLS',
                username: type === 'comptes-messagerie' ? '' : undefined,
                password: type === 'comptes-messagerie' ? '' : undefined,
                description: type === 'serveur-envoi' ? '' : undefined,
                actif: true
            });
            setIsEditing(false);
        }
        setShowModal(true);
        setShowPassword(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentItem({
            id: null,
            nom: '',
            email: type === 'comptes-messagerie' ? '' : undefined,
            serveur: '',
            port: type === 'comptes-messagerie' ? 587 : '',
            securite: 'TLS',
            username: type === 'comptes-messagerie' ? '' : undefined,
            password: type === 'comptes-messagerie' ? '' : undefined,
            description: type === 'serveur-envoi' ? '' : undefined,
            actif: true
        });
        setShowPassword(false);
    };

    const handleSave = () => {
        if (!currentItem.nom.trim() || !currentItem.serveur.trim()) {
            return;
        }

        if (type === 'comptes-messagerie' && (!currentItem.email.trim() || !currentItem.username.trim())) {
            return;
        }

        if (isEditing) {
            const updatedItem = { ...currentItem };
            // Si le mot de passe n'a pas été modifié, garder l'ancien
            if (updatedItem.password === '********') {
                const originalItem = itemsList.find(item => item.id === currentItem.id);
                updatedItem.password = originalItem.password;
            }
            
            setItemsList(itemsList.map(item => 
                item.id === currentItem.id ? updatedItem : item
            ));
            showSuccessMessage(`${title.slice(0, -1)} modifié${title.endsWith('s') ? 'e' : ''} avec succès`);
        } else {
            const newItem = {
                ...currentItem,
                id: Math.max(...itemsList.map(i => i.id), 0) + 1,
                dernierTest: type === 'comptes-messagerie' ? new Date().toLocaleString('fr-FR') : undefined
            };
            setItemsList([...itemsList, newItem]);
            showSuccessMessage(`${title.slice(0, -1)} ajouté${title.endsWith('s') ? 'e' : ''} avec succès`);
        }
        handleCloseModal();
    };

    const handleDelete = (item) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${item.nom}" ?`)) {
            setItemsList(itemsList.filter(i => i.id !== item.id));
            showSuccessMessage(`${title.slice(0, -1)} supprimé${title.endsWith('s') ? 'e' : ''} avec succès`);
        }
    };

    const toggleActif = (item) => {
        const updatedItem = { ...item, actif: !item.actif };
        setItemsList(itemsList.map(i => i.id === item.id ? updatedItem : i));
        showSuccessMessage(`${title.slice(0, -1)} ${updatedItem.actif ? 'activé' : 'désactivé'}${title.endsWith('s') ? 'e' : ''} avec succès`);
    };

    const testConnection = (item) => {
        // Simuler un test de connexion
        const updatedItem = { ...item, dernierTest: new Date().toLocaleString('fr-FR') };
        setItemsList(itemsList.map(i => i.id === item.id ? updatedItem : i));
        showSuccessMessage(`Test de connexion réussi pour "${item.nom}"`);
    };

    const showSuccessMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentItem(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const getSecuriteBadgeVariant = (securite) => {
        switch (securite) {
            case 'SSL': return 'success';
            case 'TLS': return 'primary';
            case 'NONE': return 'warning';
            default: return 'secondary';
        }
    };

    const renderCompteMessagerie = () => (
        <>
            <Table responsive hover>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Serveur</th>
                        <th>Port</th>
                        <th className="text-center">Sécurité</th>
                        <th className="text-center">Statut</th>
                        <th className="text-center">Dernier test</th>
                        <th className="text-center" style={{ width: '180px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.map(item => (
                        <tr key={item.id} className={!item.actif ? 'text-muted' : ''}>
                            <td>{item.nom}</td>
                            <td>{item.email}</td>
                            <td>{item.serveur}</td>
                            <td>{item.port}</td>
                            <td className="text-center">
                                <Badge bg={getSecuriteBadgeVariant(item.securite)}>
                                    {item.securite}
                                </Badge>
                            </td>
                            <td className="text-center">
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => toggleActif(item)}
                                    className={`p-1 ${item.actif ? 'text-success' : 'text-secondary'}`}
                                >
                                    <i className={`bi ${item.actif ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i>
                                </Button>
                            </td>
                            <td className="text-center">
                                <small className="text-muted">{item.dernierTest}</small>
                            </td>
                            <td className="text-center">
                                <Button 
                                    variant="link" 
                                    size="sm"
                                    onClick={() => testConnection(item)}
                                    className="text-info p-1"
                                    title="Tester la connexion"
                                >
                                    <i className="bi bi-wifi"></i>
                                </Button>
                                <Button 
                                    variant="link" 
                                    size="sm"
                                    onClick={() => handleShowModal(item)}
                                    className="text-warning p-1"
                                >
                                    <FaEdit />
                                </Button>
                                <Button 
                                    variant="link" 
                                    size="sm"
                                    onClick={() => handleDelete(item)}
                                    className="text-danger p-1"
                                >
                                    <FaTrash />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );

    const renderServeurEnvoi = () => (
        <>
            <Table responsive hover>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Serveur</th>
                        <th>Port</th>
                        <th className="text-center">Sécurité</th>
                        <th>Description</th>
                        <th className="text-center">Statut</th>
                        <th className="text-center" style={{ width: '120px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.map(item => (
                        <tr key={item.id} className={!item.actif ? 'text-muted' : ''}>
                            <td>{item.nom}</td>
                            <td>{item.serveur}</td>
                            <td>{item.port}</td>
                            <td className="text-center">
                                <Badge bg={getSecuriteBadgeVariant(item.securite)}>
                                    {item.securite}
                                </Badge>
                            </td>
                            <td>{item.description}</td>
                            <td className="text-center">
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => toggleActif(item)}
                                    className={`p-1 ${item.actif ? 'text-success' : 'text-secondary'}`}
                                >
                                    <i className={`bi ${item.actif ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i>
                                </Button>
                            </td>
                            <td className="text-center">
                                <Button 
                                    variant="link" 
                                    size="sm"
                                    onClick={() => handleShowModal(item)}
                                    className="text-warning p-1"
                                >
                                    <FaEdit />
                                </Button>
                                <Button 
                                    variant="link" 
                                    size="sm"
                                    onClick={() => handleDelete(item)}
                                    className="text-danger p-1"
                                >
                                    <FaTrash />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );

    const renderModalContent = () => {
        if (type === 'comptes-messagerie') {
            return (
                <>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nom du compte *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nom"
                                    value={currentItem.nom}
                                    onChange={handleInputChange}
                                    placeholder="Nom descriptif du compte..."
                                    required
                                    autoFocus
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Adresse email *</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={currentItem.email}
                                    onChange={handleInputChange}
                                    placeholder="exemple@domaine.com"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Serveur SMTP *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="serveur"
                                    value={currentItem.serveur}
                                    onChange={handleInputChange}
                                    placeholder="smtp.exemple.com"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Port *</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="port"
                                    value={currentItem.port}
                                    onChange={handleInputChange}
                                    placeholder="587"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Sécurité</Form.Label>
                                <Form.Select
                                    name="securite"
                                    value={currentItem.securite}
                                    onChange={handleInputChange}
                                >
                                    <option value="TLS">TLS</option>
                                    <option value="SSL">SSL</option>
                                    <option value="NONE">Aucune</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nom d'utilisateur *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="username"
                                    value={currentItem.username}
                                    onChange={handleInputChange}
                                    placeholder="Généralement l'adresse email"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Mot de passe *</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={currentItem.password}
                                onChange={handleInputChange}
                                placeholder="Mot de passe du compte"
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
                        <Form.Check
                            type="checkbox"
                            name="actif"
                            label="Compte actif"
                            checked={currentItem.actif}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                </>
            );
        } else {
            return (
                <>
                    <Form.Group className="mb-3">
                        <Form.Label>Nom de la configuration *</Form.Label>
                        <Form.Control
                            type="text"
                            name="nom"
                            value={currentItem.nom}
                            onChange={handleInputChange}
                            placeholder="Nom descriptif..."
                            required
                            autoFocus
                        />
                    </Form.Group>

                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Serveur SMTP *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="serveur"
                                    value={currentItem.serveur}
                                    onChange={handleInputChange}
                                    placeholder="smtp.exemple.com"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Port *</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="port"
                                    value={currentItem.port}
                                    onChange={handleInputChange}
                                    placeholder="587"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Sécurité</Form.Label>
                        <Form.Select
                            name="securite"
                            value={currentItem.securite}
                            onChange={handleInputChange}
                        >
                            <option value="TLS">TLS</option>
                            <option value="SSL">SSL</option>
                            <option value="NONE">Aucune</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="description"
                            value={currentItem.description || ''}
                            onChange={handleInputChange}
                            placeholder="Description de cette configuration..."
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            name="actif"
                            label="Configuration active"
                            checked={currentItem.actif}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                </>
            );
        }
    };

    return (
        <div className="messagerie-manager">
            {showAlert && (
                <Alert variant="success" dismissible onClose={() => setShowAlert(false)}>
                    {alertMessage}
                </Alert>
            )}

            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">{title}</h3>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="success" 
                                onClick={() => handleShowModal()}
                                className="d-flex align-items-center gap-2"
                            >
                                <FaPlus /> {buttonLabel}
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={loadItemsList}
                                className="d-flex align-items-center"
                            >
                                <FaSync />
                            </Button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body>
                    <div className="mb-3">
                        <InputGroup>
                            <InputGroup.Text>
                                <FaSearch />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder={`Rechercher dans ${title.toLowerCase()}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </div>

                    {type === 'comptes-messagerie' ? renderCompteMessagerie() : renderServeurEnvoi()}

                    {filteredItems.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : `Aucun élément trouvé`}
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? `Modifier` : `Ajouter`} - {title.slice(0, -1)}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {renderModalContent()}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Annuler
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSave}
                        disabled={!currentItem.nom.trim() || !currentItem.serveur.trim()}
                    >
                        {isEditing ? 'Modifier' : 'Ajouter'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MessagerieManager;