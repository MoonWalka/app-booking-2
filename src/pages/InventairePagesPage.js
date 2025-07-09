import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Alert, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAvailableComponents } from '../components/preview/componentRegistry';
import './InventairePagesPage.css';

const InventairePagesPage = () => {
    const navigate = useNavigate();
    const [pagesList, setPagesList] = useState([]);
    const [filteredPagesList, setFilteredPagesList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPage, setSelectedPage] = useState(null);
    const [selectedPages, setSelectedPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewContent, setPreviewContent] = useState(null);
    const [error, setError] = useState(null);
    const [showJsonBlock, setShowJsonBlock] = useState(false);
    const [showComponents, setShowComponents] = useState(false);


    // Liste statique des pages du projet (à jour au moment de la création)
    const getProjectPages = () => [
        // Pages principales
        { name: 'AdminParametragePage', path: 'src/pages/AdminParametragePage.js', route: '/preview/admin/parametrage', category: 'Paramétrage', usedInNewVersion: true },
        { name: 'ArtistesPage', path: 'src/pages/ArtistesPage.js', route: '/preview/artistes', category: 'Gestion', usedInNewVersion: true },
        { name: 'BookingParametragePage', path: 'src/pages/BookingParametragePage.js', route: '/preview/booking/parametrage', category: 'Paramétrage', usedInNewVersion: true },
        { name: 'CollaborationParametragePage', path: 'src/pages/CollaborationParametragePage.js', route: '/preview/collaboration/parametrage', category: 'Paramétrage', usedInNewVersion: true },
        { name: 'DatesPage', path: 'src/pages/DatesPage.js', route: '/preview/concerts', category: 'Gestion', usedInNewVersion: true },
        { name: 'ContactParametragePage', path: 'src/pages/ContactParametragePage.js', route: null, category: 'Paramétrage', usedInNewVersion: true },
        { name: 'ContactTagsPage', path: 'src/pages/ContactTagsPage.js', route: '/contacts/tags', category: 'Gestion', usedInNewVersion: false },
        { name: 'ContactsPage', path: 'src/pages/ContactsPage.js', route: '/preview/contacts', category: 'Gestion', usedInNewVersion: true },
        { name: 'ContratsPage', path: 'src/pages/ContratsPage.js', route: '/preview/contrats', category: 'Gestion', usedInNewVersion: true },
        { name: 'CreateDefaultTemplate', path: 'src/pages/CreateDefaultTemplate.js', route: '/create-default-template', category: 'Utilitaires', usedInNewVersion: false },
        { name: 'DashboardPage', path: 'src/pages/DashboardPage.js', route: '/preview/dashboard', category: 'Principal', usedInNewVersion: true },
        { name: 'DateCreationPage', path: 'src/pages/DateCreationPage.js', route: '/preview/booking/nouvelle-date', category: 'Formulaires', usedInNewVersion: true },
        { name: 'DebugToolsPage', path: 'src/pages/DebugToolsPage.js', route: '/preview/debug-tools', category: 'Debug', usedInNewVersion: true },
        { name: 'FacturesPage', path: 'src/pages/FacturesPage.js', route: '/preview/factures', category: 'Gestion', usedInNewVersion: true },
        { name: 'InventairePagesPage', path: 'src/pages/InventairePagesPage.js', route: '/inventaire-pages', category: 'Debug', usedInNewVersion: false },
        { name: 'LieuxPage', path: 'src/pages/LieuxPage.js', route: '/preview/lieux', category: 'Gestion', usedInNewVersion: true },
        { name: 'LoginPage', path: 'src/pages/LoginPage.js', route: '/login', category: 'Authentification', usedInNewVersion: false },
        { name: 'MesRecherchesPage', path: 'src/pages/MesRecherchesPage.js', route: '/mes-recherches', category: 'Gestion', usedInNewVersion: false },
        { name: 'MesSelectionsPage', path: 'src/pages/MesSelectionsPage.js', route: '/mes-selections', category: 'Gestion', usedInNewVersion: false },
        // { name: 'ParametresPage', path: 'src/pages/ParametresPage.js', route: '/preview/parametres', category: 'Paramétrage', usedInNewVersion: true }, // Supprimé
        { name: 'ProjetsPage', path: 'src/pages/ProjetsPage.js', route: '/preview/projets', category: 'Gestion', usedInNewVersion: true },
        { name: 'SallesPage', path: 'src/pages/SallesPage.js', route: '/preview/salles', category: 'Gestion', usedInNewVersion: true },
        { name: 'StructuresPage', path: 'src/pages/StructuresPage.js', route: '/preview/structures', category: 'Gestion', usedInNewVersion: true },
        { name: 'TableauDeBordPage', path: 'src/pages/TableauDeBordPage.js', route: '/preview/tableau-de-bord', category: 'Principal', usedInNewVersion: true },
        { name: 'TabsTestPage', path: 'src/pages/TabsTestPage.js', route: '/tabs-test', category: 'Debug', usedInNewVersion: false },
        { name: 'TachesPage', path: 'src/pages/TachesPage.js', route: '/preview/taches', category: 'Gestion', usedInNewVersion: true },
        
        // Pages avec routes paramétrées
        { name: 'ContratDetailsPage', path: 'src/pages/ContratDetailsPage.js', route: '/contrats/:contratId', category: 'Détails', usedInNewVersion: false },
        { name: 'ContratGenerationPage', path: 'src/pages/ContratGenerationPage.js', route: '/contrats/generate/:dateId', category: 'Génération', usedInNewVersion: false },
        { name: 'ContratRedactionPage', path: 'src/pages/ContratRedactionPage.js', route: '/contrats/redaction/:dateId', category: 'Génération', usedInNewVersion: false },
        // { name: 'FactureDetailsPage', path: 'src/pages/FactureDetailsPage.js', route: '/factures/:factureId', category: 'Détails', usedInNewVersion: false }, // Remplacé par FactureGeneratorPage
        { name: 'FactureGeneratorPage', path: 'src/pages/FactureGeneratorPage.js', route: '/preview/component/FactureGeneratorPage', category: 'Génération', usedInNewVersion: false },
        { name: 'FormResponsePage', path: 'src/pages/FormResponsePage.js', route: '/formulaire/:dateId/:token', category: 'Formulaires', usedInNewVersion: false },
        { name: 'PreContratFormResponsePage', path: 'src/pages/PreContratFormResponsePage.js', route: '/pre-contrat/:dateId/:token', category: 'Formulaires', usedInNewVersion: false },
        { name: 'PreContratGenerationPage', path: 'src/pages/PreContratGenerationPage.js', route: '/pre-contrat/generate/:dateId', category: 'Génération', usedInNewVersion: false },
        
        // Pages de templates (intégrées via ParametresPage)
        { name: 'contratTemplatesPage', path: 'src/pages/contratTemplatesPage.js', route: '/preview/component/contratTemplatesPage', category: 'Templates', usedInNewVersion: false },
        { name: 'contratTemplatesEditPage', path: 'src/pages/contratTemplatesEditPage.js', route: '/preview/component/contratTemplatesEditPage', category: 'Templates', usedInNewVersion: false },
        { name: 'factureTemplatesPage', path: 'src/pages/factureTemplatesPage.js', route: '/preview/component/factureTemplatesPage', category: 'Templates', usedInNewVersion: false },
        { name: 'factureTemplatesEditPage', path: 'src/pages/factureTemplatesEditPage.js', route: '/preview/component/factureTemplatesEditPage', category: 'Templates', usedInNewVersion: false },
        
        // Pages admin spéciales
        { name: 'MigrationPage', path: 'src/pages/admin/MigrationPage.js', route: '/admin/migration', category: 'Admin', usedInNewVersion: false }
    ];

    useEffect(() => {
        loadPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showComponents]);

    useEffect(() => {
        filterPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, pagesList]);

    const loadPages = () => {
        setLoading(true);
        try {
            const items = showComponents ? getAvailableComponents() : getProjectPages();
            // Trier par catégorie puis par nom
            const sortedItems = items.sort((a, b) => {
                if (a.category !== b.category) {
                    return a.category.localeCompare(b.category);
                }
                return a.name.localeCompare(b.name);
            });
            setPagesList(sortedItems);
            setFilteredPagesList(sortedItems);
            
            // Sélectionner le premier élément par défaut
            if (sortedItems.length > 0) {
                setSelectedPage(sortedItems[0]);
                loadPreview(sortedItems[0]);
            }
        } catch (err) {
            setError('Erreur lors du chargement de la liste');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterPages = () => {
        if (!searchTerm) {
            setFilteredPagesList(pagesList);
            return;
        }

        const searchLower = searchTerm.toLowerCase();
        const filtered = pagesList.filter(page => 
            page.name.toLowerCase().includes(searchLower) ||
            page.path.toLowerCase().includes(searchLower) ||
            page.category.toLowerCase().includes(searchLower) ||
            (page.route && page.route.toLowerCase().includes(searchLower))
        );

        setFilteredPagesList(filtered);
    };

    const loadPreview = async (item) => {
        setPreviewLoading(true);
        setPreviewContent(null);
        
        try {
            // Simuler un petit délai pour l'UX
            await new Promise(resolve => setTimeout(resolve, 200));
            
            if (showComponents) {
                // Pour les composants, générer la route de preview
                setPreviewContent({
                    name: item.name,
                    description: item.description,
                    route: `/preview/component/${item.name}`,
                    category: item.category,
                    hasRoute: true,
                    isComponent: true
                });
            } else {
                // Pour les pages
                setPreviewContent({
                    name: item.name,
                    path: item.path,
                    route: item.route,
                    category: item.category,
                    hasRoute: item.route !== null,
                    isComponent: false
                });
            }
            
        } catch (err) {
            console.error('Erreur lors du chargement de la prévisualisation:', err);
            setPreviewContent({
                name: item.name,
                path: item.path,
                route: item.route,
                category: item.category,
                hasRoute: false,
                error: 'Impossible de charger la prévisualisation'
            });
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleBackToApp = () => {
        navigate('/');
    };

    const handlePageSelect = (page) => {
        setSelectedPage(page);
        loadPreview(page);
    };

    const handlePageCheck = (page, checked) => {
        if (checked) {
            setSelectedPages(prev => [...prev, page]);
            if (!showJsonBlock) setShowJsonBlock(true);
        } else {
            setSelectedPages(prev => prev.filter(p => p.name !== page.name));
        }
    };

    const handleSelectAll = (category, checked) => {
        const categoryPages = filteredPagesList.filter(page => page.category === category);
        if (checked) {
            setSelectedPages(prev => {
                const existingNames = prev.map(p => p.name);
                const newPages = categoryPages.filter(page => !existingNames.includes(page.name));
                return [...prev, ...newPages];
            });
            if (!showJsonBlock) setShowJsonBlock(true);
        } else {
            setSelectedPages(prev => 
                prev.filter(page => !categoryPages.some(cp => cp.name === page.name))
            );
        }
    };

    const clearAllSelections = () => {
        setSelectedPages([]);
        setShowJsonBlock(false);
    };

    const generateJSON = () => {
        return selectedPages.map(page => ({
            nom: page.name,
            chemin: page.path,
            route: page.route
        }));
    };

    const copyJsonToClipboard = async () => {
        try {
            const jsonData = JSON.stringify(generateJSON(), null, 2);
            await navigator.clipboard.writeText(jsonData);
            // Feedback visuel temporaire
            const button = document.querySelector('.copy-json-btn');
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="bi bi-check me-1"></i>Copié !';
                button.classList.add('btn-success');
                button.classList.remove('btn-outline-primary');
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('btn-success');
                    button.classList.add('btn-outline-primary');
                }, 2000);
            }
        } catch (err) {
            console.error('Erreur lors de la copie:', err);
            alert('Erreur lors de la copie dans le presse-papiers');
        }
    };

    const isPageSelected = (page) => {
        return selectedPages.some(p => p.name === page.name);
    };

    const getCategorySelectionState = (category) => {
        const categoryPages = filteredPagesList.filter(page => page.category === category);
        const selectedCategoryPages = selectedPages.filter(page => page.category === category);
        
        if (selectedCategoryPages.length === 0) return 'none';
        if (selectedCategoryPages.length === categoryPages.length) return 'all';
        return 'partial';
    };

    const groupPagesByCategory = () => {
        const grouped = {};
        filteredPagesList.forEach(page => {
            if (!grouped[page.category]) {
                grouped[page.category] = [];
            }
            grouped[page.category].push(page);
        });
        return grouped;
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Principal': 'primary',
            'Gestion': 'success',
            'Paramétrage': 'warning',
            'Détails': 'info',
            'Formulaires': 'secondary',
            'Debug': 'danger',
            'Admin': 'dark',
            'Templates': 'light',
            'Génération': 'info',
            'Utilitaires': 'secondary',
            'Authentification': 'primary'
        };
        return colors[category] || 'secondary';
    };

    const renderSidebar = () => {
        if (loading) {
            return (
                <div className="text-center p-4">
                    <Spinner animation="border" size="sm" />
                    <p className="mt-2 small">Chargement des pages...</p>
                </div>
            );
        }

        const groupedPages = groupPagesByCategory();

        return (
            <div className="pages-sidebar">
                <div className="p-3 border-bottom">
                    <h6 className="mb-0">
                        <i className={`bi ${showComponents ? 'bi-puzzle' : 'bi-file-earmark-code'} me-2`}></i>
                        {showComponents ? 'Composants' : 'Pages'} du projet ({filteredPagesList.length}/{pagesList.length})
                    </h6>
                    <div className="mt-2">
                        <div className="input-group">
                            <span className="input-group-text">
                                <i className="bi bi-search"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder={`Rechercher ${showComponents ? 'un composant' : 'une page'}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button 
                                    className="btn btn-outline-secondary"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="pages-list">
                    {Object.keys(groupedPages).length === 0 ? (
                        <div className="text-center p-4">
                            <i className="bi bi-search" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                            <p className="mt-2 text-muted">Aucune page trouvée pour "{searchTerm}"</p>
                            <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setSearchTerm('')}
                            >
                                Effacer la recherche
                            </button>
                        </div>
                    ) : (
                        Object.entries(groupedPages).map(([category, pages]) => {
                            const selectionState = getCategorySelectionState(category);
                            return (
                                <div key={category} className="category-group">
                                    <div className="category-header p-2">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center">
                                                <span className={`badge bg-${getCategoryColor(category)} me-2`}>
                                                    {pages.length}
                                                </span>
                                                <strong>{category}</strong>
                                            </div>
                                            <div className="form-check form-check-sm">
                                                <input 
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={selectionState === 'all'}
                                                    ref={input => {
                                                        if (input) input.indeterminate = selectionState === 'partial';
                                                    }}
                                                    onChange={(e) => handleSelectAll(category, e.target.checked)}
                                                    title={`Sélectionner toutes les pages ${category}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <ListGroup variant="flush">
                                        {pages.map((page, index) => (
                                            <ListGroup.Item
                                                key={`${category}-${index}`}
                                                className="page-item d-flex align-items-center"
                                            >
                                                <div className="form-check form-check-sm me-2">
                                                    <input 
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={isPageSelected(page)}
                                                        onChange={(e) => handlePageCheck(page, e.target.checked)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                                <div 
                                                    className={`page-info flex-grow-1 cursor-pointer ${selectedPage?.name === page.name ? 'selected' : ''}`}
                                                    onClick={() => handlePageSelect(page)}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className="page-name">{page.name}</div>
                                                        {!showComponents && page.usedInNewVersion !== undefined && (
                                                            page.usedInNewVersion ? (
                                                                <i className="bi bi-check-circle text-success" title="Utilisée dans la nouvelle version"></i>
                                                            ) : (
                                                                <i className="bi bi-exclamation-triangle text-warning" title="Ancienne version uniquement"></i>
                                                            )
                                                        )}
                                                    </div>
                                                    <div className="page-path text-muted small">
                                                        {showComponents ? page.description : page.path}
                                                    </div>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };

    const renderPreview = () => {
        if (!selectedPage) {
            return (
                <div className="text-center p-5">
                    <i className="bi bi-file-earmark" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                    <h4 className="mt-3">Aucune page sélectionnée</h4>
                    <p className="text-muted">Sélectionnez une page dans la liste pour voir sa prévisualisation.</p>
                </div>
            );
        }

        return (
            <div className="preview-container">
                {/* Bloc JSON - affiché seulement si des pages sont sélectionnées */}
                {showJsonBlock && selectedPages.length > 0 && (
                    <div className="json-block">
                        <div className="json-header p-3 border-bottom bg-light">
                            <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">
                                    <i className="bi bi-code-square me-2"></i>
                                    JSON des pages sélectionnées ({selectedPages.length})
                                </h6>
                                <div className="d-flex gap-2">
                                    <button 
                                        className="btn btn-outline-primary btn-sm copy-json-btn"
                                        onClick={copyJsonToClipboard}
                                        title="Copier le JSON dans le presse-papiers"
                                    >
                                        <i className="bi bi-clipboard me-1"></i>
                                        Copier JSON
                                    </button>
                                    <button 
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={clearAllSelections}
                                        title="Effacer toutes les sélections"
                                    >
                                        <i className="bi bi-x-circle me-1"></i>
                                        Effacer
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="json-content p-3">
                            <pre className="json-display">
                                <code>
                                    {JSON.stringify(generateJSON(), null, 2)}
                                </code>
                            </pre>
                        </div>
                    </div>
                )}

                {/* Preview de la page sélectionnée */}
                <div className="preview-header p-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="mb-0">{selectedPage.name}</h5>
                        <div className="d-flex align-items-center gap-2">
                            {!showComponents && selectedPage.usedInNewVersion !== undefined && (
                                selectedPage.usedInNewVersion ? (
                                    <span className="badge bg-success" title="Cette page est utilisée dans la nouvelle version avec le système d'onglets">
                                        <i className="bi bi-check-circle me-1"></i>
                                        Nouvelle version
                                    </span>
                                ) : (
                                    <span className="badge bg-warning text-dark" title="Cette page n'est pas utilisée dans la nouvelle version avec le système d'onglets">
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        Ancienne version
                                    </span>
                                )
                            )}
                            {showComponents && (
                                <span className="badge bg-info">
                                    <i className="bi bi-puzzle me-1"></i>
                                    Composant
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="text-muted small mb-2">
                        <i className={`bi ${showComponents ? 'bi-info-circle' : 'bi-folder'} me-1`}></i>
                        {showComponents ? selectedPage.description : selectedPage.path}
                    </p>
                    <span className={`badge bg-${getCategoryColor(selectedPage.category)}`}>
                        {selectedPage.category}
                    </span>
                </div>

                <div className="preview-content p-3">
                    {previewLoading ? (
                        <div className="text-center p-4">
                            <Spinner animation="border" size="sm" />
                            <p className="mt-2 small">Chargement de la prévisualisation...</p>
                        </div>
                    ) : previewContent ? (
                        <div className="page-preview">
                            {previewContent.error ? (
                                <Alert variant="warning">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {previewContent.error}
                                </Alert>
                            ) : previewContent.hasRoute ? (
                                <div className="iframe-preview">
                                    <div className="iframe-header mb-2">
                                        <small className="text-muted">
                                            <i className="bi bi-link-45deg me-1"></i>
                                            Aperçu en temps réel de {previewContent.route}
                                        </small>
                                    </div>
                                    <div className="iframe-container">
                                        <iframe
                                            src={previewContent.route}
                                            className="page-iframe"
                                            title={`Aperçu de ${previewContent.name}`}
                                            onLoad={(e) => {
                                                console.log('Iframe chargé pour:', previewContent.route);
                                            }}
                                            onError={(e) => {
                                                console.error('Erreur iframe pour:', previewContent.route);
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <Alert variant="info">
                                    <Alert.Heading>Page sans route directe</Alert.Heading>
                                    <p className="mb-2">
                                        Cette page n'a pas de route directe accessible et ne peut être prévisualisée.
                                    </p>
                                    <hr />
                                    <p className="mb-0 small text-muted">
                                        <strong>Type:</strong> {previewContent.category}<br/>
                                        <strong>Fichier:</strong> {previewContent.path}
                                    </p>
                                </Alert>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        );
    };

    if (error) {
        return (
            <Container fluid className="p-4">
                <Alert variant="danger">
                    <Alert.Heading>Erreur</Alert.Heading>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="p-4 inventaire-pages">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={handleBackToApp}
                        className="me-3"
                    >
                        <i className="bi bi-arrow-left me-1"></i>
                        Retour à l'app
                    </Button>
                    <h2 className="mb-0">
                        <i className="bi bi-file-earmark-code me-2"></i>
                        Inventaire {showComponents ? 'des composants' : 'des pages'}
                    </h2>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div className="btn-group" role="group">
                        <button 
                            type="button" 
                            className={`btn btn-sm ${!showComponents ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setShowComponents(false)}
                        >
                            <i className="bi bi-file-earmark me-1"></i>
                            Pages
                        </button>
                        <button 
                            type="button" 
                            className={`btn btn-sm ${showComponents ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setShowComponents(true)}
                        >
                            <i className="bi bi-puzzle me-1"></i>
                            Composants
                        </button>
                    </div>
                    
                    {!showComponents && (
                        <>
                            <span className="badge bg-primary">{pagesList.length} pages</span>
                            <span className="badge bg-success">
                                {pagesList.filter(p => p.usedInNewVersion).length} nouvelle version
                            </span>
                            <span className="badge bg-warning text-dark">
                                {pagesList.filter(p => !p.usedInNewVersion).length} ancienne version
                            </span>
                        </>
                    )}
                    
                    {showComponents && (
                        <span className="badge bg-primary">{pagesList.length} composants</span>
                    )}
                    
                    <button 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={loadPages}
                        disabled={loading}
                    >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Actualiser
                    </button>
                </div>
            </div>

            <Row className="h-100">
                <Col md={4} className="border-end">
                    <Card className="h-100">
                        <Card.Body className="p-0">
                            {renderSidebar()}
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col md={8}>
                    <Card className="h-100">
                        <Card.Body className="p-0">
                            {renderPreview()}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default InventairePagesPage;