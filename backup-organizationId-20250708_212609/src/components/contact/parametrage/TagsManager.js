import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Modal, Form, Alert, Badge, InputGroup } from 'react-bootstrap';
import { FaPlus, FaSync, FaEdit, FaTrash, FaSearch, FaChevronRight, FaChevronDown, FaFilter } from 'react-icons/fa';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import { useTabs } from '@/context/TabsContext';
import { TAGS_HIERARCHY, GENRES_HIERARCHY, RESEAUX_HIERARCHY, MOTS_CLES_HIERARCHY } from '@/config/tagsHierarchy';
import './TagsManager.css';

const TagsManager = ({ type, title, buttonLabel }) => {
    const { currentEntreprise } = useEntreprise();
    const { openTab } = useTabs();
    const [itemsList, setItemsList] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentItem, setCurrentItem] = useState({
        id: null,
        nom: '',
        type: 'Utilisateur'
    });

    // États pour l'arborescence hiérarchique
    const [expandedItems, setExpandedItems] = useState(new Set());
    const [hiddenItems, setHiddenItems] = useState(new Set());
    const [showOnlyUsed, setShowOnlyUsed] = useState(false);
    const [realUsageData, setRealUsageData] = useState({});

    // Fonction pour obtenir la hiérarchie selon le type
    const getHierarchyForType = () => {
        switch (type) {
            case 'activites':
                return TAGS_HIERARCHY;
            case 'genres':
                return GENRES_HIERARCHY;
            case 'reseaux':
                return RESEAUX_HIERARCHY;
            case 'mots-cles':
                return MOTS_CLES_HIERARCHY;
            default:
                return [];
        }
    };

    const currentHierarchy = getHierarchyForType();

    // Données d'exemple selon le type
    const getMockData = () => {
        switch (type) {
            case 'activites':
                return [
                    { id: 1, nom: 'Organisme / institution', type: 'Système', utilisations: 45 },
                    { id: 2, nom: 'Disque', type: 'Système', utilisations: 23 },
                    { id: 3, nom: 'Ressource / Formation', type: 'Système', utilisations: 12 },
                    { id: 4, nom: 'Média', type: 'Système', utilisations: 34 },
                    { id: 5, nom: 'Artiste', type: 'Système', utilisations: 89 },
                    { id: 6, nom: 'Public', type: 'Système', utilisations: 56 },
                    { id: 7, nom: 'Adhérent', type: 'Système', utilisations: 78 },
                    { id: 8, nom: 'Personnel', type: 'Système', utilisations: 12 },
                    { id: 9, nom: 'Diffuseur', type: 'Système', utilisations: 67 },
                    { id: 10, nom: 'Agent', type: 'Système', utilisations: 43 },
                    { id: 11, nom: 'Entrepreneur de spectacles', type: 'Système', utilisations: 29 },
                    { id: 12, nom: 'Prestataire', type: 'Système', utilisations: 35 }
                ];
            case 'genres':
                return [
                    { id: 1, nom: 'Musique', type: 'Système', utilisations: 156 },
                    { id: 2, nom: 'Arts vivants', type: 'Système', utilisations: 87 },
                    { id: 3, nom: 'Pluridisciplinaire', type: 'Système', utilisations: 43 },
                    { id: 4, nom: 'Arts plastiques', type: 'Système', utilisations: 32 },
                    { id: 5, nom: 'Cinéma', type: 'Système', utilisations: 29 },
                    { id: 6, nom: 'Expositions', type: 'Système', utilisations: 15 },
                    { id: 7, nom: 'Vidéo et arts numériques', type: 'Système', utilisations: 21 },
                    { id: 8, nom: 'Jeune public', type: 'Système', utilisations: 67 }
                ];
            case 'reseaux':
                return [
                    { id: 1, nom: 'Actes IF', type: 'Système', utilisations: 5 },
                    { id: 2, nom: 'AJC - Jazzé Croisé', type: 'Système', utilisations: 8 },
                    { id: 3, nom: 'AprèsMai', type: 'Système', utilisations: 3 },
                    { id: 4, nom: 'ATP', type: 'Système', utilisations: 12 },
                    { id: 5, nom: 'Avant-Mardi', type: 'Système', utilisations: 7 },
                    { id: 6, nom: 'Bretagne en Scène', type: 'Système', utilisations: 15 },
                    { id: 7, nom: 'CCR', type: 'Système', utilisations: 9 },
                    { id: 8, nom: 'Centre Chorégraphique National', type: 'Système', utilisations: 6 },
                    { id: 9, nom: 'Fedelima', type: 'Système', utilisations: 23 },
                    { id: 10, nom: 'SMAC', type: 'Système', utilisations: 45 }
                ];
            case 'mots-cles':
                return [
                    { id: 1, nom: 'Urgent', type: 'Système', utilisations: 123, tache: true, projet: false, personne: true, structure: false },
                    { id: 2, nom: 'Important', type: 'Système', utilisations: 89, tache: true, projet: true, personne: false, structure: true },
                    { id: 3, nom: 'Festival', type: 'Utilisateur', utilisations: 67, tache: false, projet: true, personne: false, structure: true },
                    { id: 4, nom: 'Date', type: 'Utilisateur', utilisations: 145, tache: false, projet: true, personne: false, structure: false },
                    { id: 5, nom: 'Partenaire', type: 'Utilisateur', utilisations: 34, tache: false, projet: false, personne: true, structure: true }
                ];
            default:
                return [];
        }
    };

    // Chargement initial des données et configuration de l'expansion
    useEffect(() => {
        loadItemsList();
        // Initialiser l'expansion avec tous les éléments principaux de la hiérarchie actuelle
        setExpandedItems(new Set(currentHierarchy.map(item => item.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]);

    // Filtrage des éléments
    useEffect(() => {
        if (searchTerm) {
            setFilteredItems(itemsList.filter(item => 
                item.nom.toLowerCase().includes(searchTerm.toLowerCase())
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
            setCurrentItem({ ...item });
            setIsEditing(true);
        } else {
            setCurrentItem({
                id: null,
                nom: '',
                type: 'Utilisateur'
            });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentItem({
            id: null,
            nom: '',
            type: 'Utilisateur'
        });
    };

    const handleSave = () => {
        if (!currentItem.nom.trim()) {
            return;
        }

        if (isEditing) {
            setItemsList(itemsList.map(item => 
                item.id === currentItem.id ? currentItem : item
            ));
            showSuccessMessage(`${title.slice(0, -1)} modifié${title.endsWith('s') ? 'e' : ''} avec succès`);
        } else {
            const newItem = {
                ...currentItem,
                id: Math.max(...itemsList.map(i => i.id), 0) + 1,
                utilisations: 0
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

    const showSuccessMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    // Fonction pour ouvrir un onglet avec les contacts filtrés par tag
    const openContactsWithTag = (tagLabel, usageCount) => {
        console.log('🔍 Clic sur tag:', tagLabel, 'avec', usageCount, 'utilisations');
        
        const tabId = `contacts-filtered-${type}-${tagLabel.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const tabTitle = usageCount > 0 ? `${tagLabel} (${usageCount})` : `${tagLabel} (0)`;
        
        console.log('📋 Ouverture onglet:', { tabId, tabTitle, tagLabel, type, usageCount });
        
        try {
            openTab({
                id: tabId,
                title: tabTitle,
                path: `/contacts?filter=${encodeURIComponent(tagLabel)}&type=${type}`,
                component: 'ContactsListFiltered',
                params: { 
                    filterTag: tagLabel,
                    filterType: type,
                    usageCount: usageCount 
                },
                icon: 'bi-funnel',
                closable: true
            });
            console.log('✅ Onglet créé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de la création de l\'onglet:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getTypeVariant = (itemType) => {
        return itemType === 'Système' ? 'secondary' : 'primary';
    };

    const renderUsageIndicators = (item) => {
        if (type !== 'mots-cles') return null;
        
        return (
            <div className="d-flex gap-1">
                {item.tache && <Badge bg="info" className="small">T</Badge>}
                {item.projet && <Badge bg="success" className="small">P</Badge>}
                {item.personne && <Badge bg="warning" className="small">Pe</Badge>}
                {item.structure && <Badge bg="danger" className="small">S</Badge>}
            </div>
        );
    };

    // Fonctions pour l'arborescence hiérarchique
    const toggleExpand = (itemId) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    const handleHideItem = (item) => {
        const newHidden = new Set(hiddenItems);
        newHidden.add(item.id);
        setHiddenItems(newHidden);
        
        setAlertMessage(`Tag "${item.label}" masqué avec succès`);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    // Fonction pour charger les vraies données d'utilisation depuis Firestore
    const loadRealUsageData = useCallback(async () => {
        if (!currentEntreprise?.id) {
            return;
        }

        try {
            // Requête pour tous les contacts avec des tags
            const contactsQuery = query(
                collection(db, 'contacts'),
                where('organizationId', '==', currentEntreprise.id)
            );
            
            const contactsSnapshot = await getDocs(contactsQuery);
            const usageCount = {};
            
            // Compter l'utilisation de chaque tag
            contactsSnapshot.docs.forEach(doc => {
                const contact = doc.data();
                const tags = contact.qualification?.tags || [];
                
                tags.forEach(tag => {
                    // Trouver l'ID correspondant dans la hiérarchie et l'incrémenter
                    const findTagInHierarchy = (items) => {
                        for (const item of items) {
                            if (item.label === tag) {
                                usageCount[item.id] = (usageCount[item.id] || 0) + 1;
                                return true; // Tag trouvé, arrêter la recherche
                            }
                            if (item.children) {
                                const found = findTagInHierarchy(item.children);
                                if (found) return true;
                            }
                        }
                        return false;
                    };
                    
                    // Si le tag n'est pas trouvé dans la hiérarchie, le compter quand même par label
                    if (!findTagInHierarchy(currentHierarchy)) {
                        usageCount[tag] = (usageCount[tag] || 0) + 1;
                    }
                });
            });
            
            setRealUsageData(usageCount);
        } catch (error) {
            console.error('TagsManager: Erreur lors du chargement des données d\'utilisation:', error);
        }
    }, [currentEntreprise?.id, currentHierarchy]);

    // Charger les données d'utilisation au montage
    useEffect(() => {
        if (currentEntreprise?.id && ['activites', 'genres', 'reseaux', 'mots-cles'].includes(type)) {
            loadRealUsageData();
        }
    }, [currentEntreprise?.id, type, loadRealUsageData]);

    const getUsageCount = (itemId) => {
        // Pour tous les types avec hiérarchie, utiliser les vraies données (y compris 0 si jamais utilisé)
        if (['activites', 'genres', 'reseaux', 'mots-cles'].includes(type)) {
            return realUsageData[itemId] || 0;
        }
        // Sinon, retourner des données fictives
        return Math.floor(Math.random() * 100);
    };

    // Fonction pour collecter tous les tags de façon plate avec gestion du pliage
    const getFlatTagsList = () => {
        const flatTags = [];
        
        const addTags = (items, level = 0, parentPath = '', parentExpanded = true) => {
            items.forEach(item => {
                if (hiddenItems.has(item.id)) return;
                
                const fullPath = parentPath ? `${parentPath} > ${item.label}` : item.label;
                const usageCount = getUsageCount(item.id);
                const type = level === 0 ? 'Système' : 'Système'; // Tous système pour l'instant
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.has(item.id);
                
                // Filtrer selon le mode "utilisés seulement"
                const shouldShow = !showOnlyUsed || usageCount > 0;
                
                // Ajouter l'item seulement si son parent est déplié et qu'il respecte le filtre
                if ((level === 0 || parentExpanded) && shouldShow) {
                    flatTags.push({
                        id: item.id,
                        label: item.label,
                        fullPath: fullPath,
                        level: level,
                        color: item.color || '#6c757d',
                        usageCount: usageCount,
                        type: type,
                        hasChildren: hasChildren,
                        isExpanded: isExpanded
                    });
                }
                
                // Ajouter les enfants seulement si l'item est déplié et visible
                if (hasChildren && isExpanded && (level === 0 || parentExpanded)) {
                    addTags(item.children, level + 1, fullPath, true);
                }
            });
        };
        
        addTags(currentHierarchy);
        return flatTags;
    };

    // Rendu d'une ligne de tableau
    const renderTableRow = (tag) => {
        return (
            <tr key={tag.id}>
                <td>
                    <div className="d-flex align-items-center">
                        {/* Indentation pour montrer la hiérarchie */}
                        <div style={{ marginLeft: `${tag.level * 20}px` }} className="d-flex align-items-center">
                            {/* Bouton expand/collapse pour les éléments avec enfants */}
                            {tag.hasChildren ? (
                                <button
                                    className="btn btn-sm p-0 me-2"
                                    style={{ width: '16px', height: '16px', fontSize: '0.7rem' }}
                                    onClick={() => toggleExpand(tag.id)}
                                >
                                    {tag.isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                </button>
                            ) : (
                                <span style={{ width: '16px', marginRight: '0.5rem' }}></span>
                            )}
                            
                            <div 
                                className="me-2"
                                style={{ 
                                    width: '12px', 
                                    height: '12px', 
                                    backgroundColor: tag.color,
                                    borderRadius: '50%',
                                    border: '2px solid white',
                                    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)'
                                }}
                            ></div>
                            <span 
                                className={`${tag.level === 0 ? 'fw-bold' : ''}`}
                                style={{ 
                                    fontSize: tag.level === 0 ? '0.95rem' : '0.9rem',
                                    color: tag.level === 0 ? '#212529' : '#495057',
                                    cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                    console.log('🖱️ Clic détecté sur tag:', tag.label, 'count:', tag.usageCount);
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openContactsWithTag(tag.label, tag.usageCount);
                                }}
                                title={`Voir les contacts avec le tag "${tag.label}" (${tag.usageCount} trouvé${tag.usageCount > 1 ? 's' : ''})`}
                            >
                                {tag.label}
                            </span>
                        </div>
                    </div>
                </td>
                <td className="text-center">
                    <Badge 
                        bg={tag.usageCount > 0 ? "success" : "secondary"} 
                        text="white"
                        style={{ 
                            cursor: 'pointer' 
                        }}
                        onClick={(e) => {
                            console.log('🖱️ Clic sur badge nombre:', tag.label, 'count:', tag.usageCount);
                            e.preventDefault();
                            e.stopPropagation();
                            openContactsWithTag(tag.label, tag.usageCount);
                        }}
                        title={`Cliquer pour voir les contacts avec "${tag.label}" (${tag.usageCount} trouvé${tag.usageCount > 1 ? 's' : ''})`}
                    >
                        {tag.usageCount}
                    </Badge>
                </td>
                <td className="text-center">
                    <Badge bg={tag.type === 'Système' ? 'secondary' : 'primary'}>
                        {tag.type}
                    </Badge>
                </td>
                <td className="text-center">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleHideItem({ id: tag.id, label: tag.label })}
                        title="Masquer ce tag"
                        className="p-1"
                    >
                        <i className="bi bi-eye-slash"></i>
                    </Button>
                </td>
            </tr>
        );
    };

    return (
        <div className="tags-manager">
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
                            {['activites', 'genres', 'reseaux', 'mots-cles'].includes(type) && (
                                <Button 
                                    variant={showOnlyUsed ? "primary" : "outline-primary"}
                                    onClick={() => setShowOnlyUsed(!showOnlyUsed)}
                                    className="d-flex align-items-center gap-2"
                                >
                                    <FaFilter /> {showOnlyUsed ? `Tous les ${title.toLowerCase()}` : `${title} utilisé(e)s`}
                                </Button>
                            )}
                            <Button 
                                variant="outline-secondary" 
                                onClick={['activites', 'genres', 'reseaux', 'mots-cles'].includes(type) ? loadRealUsageData : loadItemsList}
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

                    {['activites', 'genres', 'reseaux', 'mots-cles'].includes(type) ? (
                        // Affichage hiérarchique pour tous les types de tags
                        <>
                            {/* Statistiques */}
                            <div className="mb-3 p-3 bg-light rounded">
                                <div className="row text-center">
                                    <div className="col">
                                        <h6 className="mb-1">{getFlatTagsList().filter(tag => tag.level === 0).length}</h6>
                                        <small className="text-muted">Catégories principales</small>
                                    </div>
                                    <div className="col">
                                        <h6 className="mb-1">{getFlatTagsList().filter(tag => tag.level > 0).length}</h6>
                                        <small className="text-muted">Sous-catégories</small>
                                    </div>
                                    <div className="col">
                                        <h6 className="mb-1">{getFlatTagsList().length}</h6>
                                        <small className="text-muted">Total visible</small>
                                    </div>
                                </div>
                            </div>

                            {/* Boutons de contrôle */}
                            <div className="mb-3 d-flex gap-2 justify-content-between">
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => setExpandedItems(new Set())}
                                    >
                                        Tout replier
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => setExpandedItems(new Set(currentHierarchy.map(item => item.id)))}
                                    >
                                        Tout déplier
                                    </Button>
                                </div>
                                <div className="d-flex gap-2 align-items-center">
                                    {hiddenItems.size > 0 && (
                                        <>
                                            <Badge bg="secondary">{hiddenItems.size} masqué(s)</Badge>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => setHiddenItems(new Set())}
                                            >
                                                Tout afficher
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Tableau hiérarchique */}
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>Titre</th>
                                        <th className="text-center">Nbr</th>
                                        <th className="text-center">Type</th>
                                        <th className="text-center" style={{ width: '80px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFlatTagsList().map(tag => renderTableRow(tag))}
                                </tbody>
                            </Table>
                        </>
                    ) : (
                        // Affichage tableau traditionnel pour les autres types
                        <>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Type</th>
                                <th className="text-center">Utilisations</th>
                                {type === 'mots-cles' && <th className="text-center">Usage</th>}
                                <th className="text-center" style={{ width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.id}>
                                    <td>{item.nom}</td>
                                    <td>
                                        <Badge bg={getTypeVariant(item.type)}>
                                            {item.type}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Badge bg="light" text="dark">{item.utilisations}</Badge>
                                    </td>
                                    {type === 'mots-cles' && (
                                        <td className="text-center">
                                            {renderUsageIndicators(item)}
                                        </td>
                                    )}
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
                                            className="text-danger p-1 ms-2"
                                            disabled={item.type === 'Système'}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {filteredItems.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : `Aucun élément trouvé`}
                        </div>
                    )}
                        </>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? `Modifier` : `Ajouter`} - {title.slice(0, -1)}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nom</Form.Label>
                            <Form.Control
                                type="text"
                                name="nom"
                                value={currentItem.nom}
                                onChange={handleInputChange}
                                placeholder={`Nom ${title.slice(0, -1).toLowerCase()}...`}
                                required
                                autoFocus
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Select
                                name="type"
                                value={currentItem.type}
                                onChange={handleInputChange}
                            >
                                <option value="Utilisateur">Utilisateur</option>
                                <option value="Système">Système</option>
                            </Form.Select>
                            <Form.Text className="text-muted">
                                Les éléments "Système" ne peuvent pas être supprimés
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Annuler
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSave}
                        disabled={!currentItem.nom.trim()}
                    >
                        {isEditing ? 'Modifier' : 'Ajouter'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TagsManager;