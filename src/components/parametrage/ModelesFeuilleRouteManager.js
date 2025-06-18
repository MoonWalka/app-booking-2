import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Alert } from 'react-bootstrap';
import { FaPlus, FaSync, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import './ModelesFeuilleRouteManager.css';

const ModelesFeuilleRouteManager = () => {
    const [modelesList, setModelesList] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // Chargement initial des données
    useEffect(() => {
        loadModelesList();
    }, []);

    const loadModelesList = () => {
        // Simulation de données pour l'exemple
        const mockData = [
            { 
                id: 1, 
                nom: 'Modèle de feuille de route (exemple 1)', 
                dateCreation: '2024-01-15',
                derniereModification: '2024-02-20'
            },
            { 
                id: 2, 
                nom: 'Modèle de feuille de route (exemple 2)', 
                dateCreation: '2024-02-01',
                derniereModification: '2024-02-25'
            }
        ];
        setModelesList(mockData);
    };

    const handleNewModele = () => {
        // Pour l'instant, juste afficher un message
        showSuccessMessage('Cette fonctionnalité sera implémentée prochainement');
    };

    const handleView = (modele) => {
        showSuccessMessage(`Visualisation du modèle "${modele.nom}" - À implémenter`);
    };

    const handleEdit = (modele) => {
        showSuccessMessage(`Édition du modèle "${modele.nom}" - À implémenter`);
    };

    const handleDelete = (modele) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le modèle "${modele.nom}" ?`)) {
            setModelesList(modelesList.filter(item => item.id !== modele.id));
            showSuccessMessage('Modèle supprimé avec succès');
        }
    };

    const showSuccessMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    return (
        <div className="modeles-feuille-route-manager">
            {showAlert && (
                <Alert variant="info" dismissible onClose={() => setShowAlert(false)}>
                    {alertMessage}
                </Alert>
            )}

            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">Modèles de feuille de route</h3>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="success" 
                                onClick={handleNewModele}
                                className="d-flex align-items-center gap-2"
                            >
                                <FaPlus /> Nouveau modèle
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={loadModelesList}
                                className="d-flex align-items-center"
                            >
                                <FaSync />
                            </Button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Nom du modèle</th>
                                <th>Date de création</th>
                                <th>Dernière modification</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modelesList.map(modele => (
                                <tr key={modele.id}>
                                    <td>{modele.nom}</td>
                                    <td>{formatDate(modele.dateCreation)}</td>
                                    <td>{formatDate(modele.derniereModification)}</td>
                                    <td className="text-center">
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleView(modele)}
                                            className="text-info p-1"
                                            title="Visualiser"
                                        >
                                            <FaEye />
                                        </Button>
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleEdit(modele)}
                                            className="text-warning p-1 ms-2"
                                            title="Modifier"
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleDelete(modele)}
                                            className="text-danger p-1 ms-2"
                                            title="Supprimer"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {modelesList.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            Aucun modèle de feuille de route trouvé
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default ModelesFeuilleRouteManager;