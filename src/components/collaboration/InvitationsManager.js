import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Modal, Form, Alert, Badge, InputGroup } from 'react-bootstrap';
import { FaPlus, FaCopy, FaEnvelope, FaTrash, FaEye } from 'react-icons/fa';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useEntreprise } from '@/context/EntrepriseContext';
import { generateInvitationCode } from '@/services/firebase-service';

const InvitationsManager = () => {
    const { currentUser } = useAuth();
    const { currentEntreprise } = useEntreprise();
    
    console.log('📧 InvitationsManager - Composant monté');
    
    // États
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedInvitation, setSelectedInvitation] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success');
    
    // État pour le formulaire de nouvelle invitation
    const [newInvitation, setNewInvitation] = useState({
        email: '',
        groupes: [],
        expirationDays: 7,
        maxUses: 1,
        isGeneral: false
    });
    
    // États pour les données liées
    const [groupesList, setGroupesList] = useState([]);
    
    // Charger les groupes de permissions
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
    
    // Charger les invitations
    const loadInvitations = async () => {
        if (!currentEntreprise?.id) {
            console.log('📧 InvitationsManager - Pas d\'entreprise courante');
            return;
        }
        
        console.log('📧 InvitationsManager - Chargement des invitations pour entreprise:', currentEntreprise.id);
        setLoading(true);
        try {
            // Requête simplifiée sans orderBy pour éviter l'erreur d'index
            const invitationsQuery = query(
                collection(db, 'entreprise_invitations'),
                where('entrepriseId', '==', currentEntreprise.id)
            );
            
            const snapshot = await getDocs(invitationsQuery);
            const invitationsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Calculer si l'invitation est expirée
                isExpired: doc.data().expiresAt && doc.data().expiresAt.toDate() < new Date()
            }));
            
            // Trier par date de création décroissante côté client
            invitationsList.sort((a, b) => {
                const dateA = a.createdAt?.toDate() || new Date(0);
                const dateB = b.createdAt?.toDate() || new Date(0);
                return dateB - dateA;
            });
            
            console.log('📧 InvitationsManager - Invitations trouvées:', invitationsList.length);
            setInvitations(invitationsList);
        } catch (error) {
            console.error('Erreur lors du chargement des invitations:', error);
            showMessage('Erreur lors du chargement des invitations', 'danger');
        } finally {
            setLoading(false);
        }
    };
    
    // Effet pour charger les données au montage
    useEffect(() => {
        loadInvitations();
        loadGroupes();
    }, [currentEntreprise?.id]);
    
    // Afficher un message
    const showMessage = (message, type = 'success') => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };
    
    // Générer une nouvelle invitation
    const handleGenerateInvitation = async () => {
        if (!newInvitation.isGeneral && !newInvitation.email.trim()) {
            showMessage('Veuillez entrer un email ou cocher "Invitation générale"', 'danger');
            return;
        }
        
        try {
            setLoading(true);
            
            // Générer le code d'invitation
            const invitation = await generateInvitationCode(
                currentEntreprise.id,
                'member', // Rôle par défaut
                newInvitation.expirationDays,
                newInvitation.maxUses
            );
            
            // Ajouter les métadonnées supplémentaires
            const invitationData = {
                ...invitation,
                email: newInvitation.isGeneral ? null : newInvitation.email,
                groupes: newInvitation.groupes,
                createdBy: currentUser.uid,
                createdByName: currentUser.displayName || currentUser.email,
                entrepriseName: currentEntreprise.raisonSociale || currentEntreprise.nom,
                isGeneral: newInvitation.isGeneral
            };
            
            // L'invitation est déjà sauvegardée par generateInvitationCode
            // On met juste à jour avec les métadonnées supplémentaires
            if (invitation.id) {
                await updateDoc(doc(db, 'entreprise_invitations', invitation.id), {
                    email: newInvitation.isGeneral ? null : newInvitation.email,
                    groupes: newInvitation.groupes,
                    createdBy: currentUser.uid,
                    createdByName: currentUser.displayName || currentUser.email,
                    entrepriseName: currentEntreprise.name || currentEntreprise.nom || 'Entreprise',
                    isGeneral: newInvitation.isGeneral
                });
            }
            
            showMessage(`Invitation créée avec succès. Code : ${invitation.code}`, 'success');
            setShowModal(false);
            setNewInvitation({
                email: '',
                groupes: [],
                expirationDays: 7,
                maxUses: 1,
                isGeneral: false
            });
            loadInvitations();
            
        } catch (error) {
            console.error('Erreur lors de la génération de l\'invitation:', error);
            showMessage('Erreur lors de la création de l\'invitation', 'danger');
        } finally {
            setLoading(false);
        }
    };
    
    // Copier le lien d'invitation
    const handleCopyLink = (code) => {
        const link = `${window.location.origin}/onboarding?action=join&code=${code}`;
        navigator.clipboard.writeText(link);
        showMessage('Lien copié dans le presse-papiers');
    };
    
    // Envoyer par email
    const handleSendEmail = (invitation) => {
        const link = `${window.location.origin}/onboarding?action=join&code=${invitation.code}`;
        const subject = `Invitation à rejoindre ${invitation.entrepriseName}`;
        const body = `Bonjour,\n\nVous êtes invité(e) à rejoindre l'entreprise ${invitation.entrepriseName} sur TourCraft.\n\nCliquez sur le lien suivant ou utilisez le code d'invitation : ${invitation.code}\n\n${link}\n\nCette invitation expire le ${invitation.expiresAt.toDate().toLocaleDateString('fr-FR')}.\n\nCordialement,\n${invitation.createdByName}`;
        
        const mailtoLink = `mailto:${invitation.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };
    
    // Révoquer une invitation
    const handleRevokeInvitation = async (invitationId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir révoquer cette invitation ?')) {
            return;
        }
        
        try {
            await updateDoc(doc(db, 'entreprise_invitations', invitationId), {
                status: 'revoked',
                revokedAt: new Date(),
                revokedBy: currentUser.uid
            });
            
            showMessage('Invitation révoquée avec succès');
            loadInvitations();
        } catch (error) {
            console.error('Erreur lors de la révocation:', error);
            showMessage('Erreur lors de la révocation de l\'invitation', 'danger');
        }
    };
    
    // Afficher les détails d'une invitation
    const handleShowDetails = (invitation) => {
        setSelectedInvitation(invitation);
        setShowDetailsModal(true);
    };
    
    // Obtenir le badge de statut
    const getStatusBadge = (invitation) => {
        if (invitation.status === 'revoked') {
            return <Badge bg="danger">Révoquée</Badge>;
        }
        if (invitation.isExpired) {
            return <Badge bg="secondary">Expirée</Badge>;
        }
        if (invitation.usedBy && invitation.usedBy.length >= invitation.maxUses) {
            return <Badge bg="info">Utilisée</Badge>;
        }
        return <Badge bg="success">Active</Badge>;
    };
    
    return (
        <div>
            {showAlert && (
                <Alert variant={alertType} onClose={() => setShowAlert(false)} dismissible>
                    {alertMessage}
                </Alert>
            )}
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Gestion des invitations</h5>
                <Button variant="success" onClick={() => setShowModal(true)}>
                    <FaPlus className="me-2" />
                    Nouvelle invitation
                </Button>
            </div>
            
            {loading ? (
                <div className="text-center p-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            ) : invitations.length === 0 ? (
                <Card>
                    <Card.Body className="text-center py-5">
                        <p className="text-muted mb-3">Aucune invitation créée</p>
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            Créer une première invitation
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Table responsive hover>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Invité</th>
                            <th>Créé le</th>
                            <th>Expire le</th>
                            <th>Utilisations</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invitations.map(invitation => (
                            <tr key={invitation.id}>
                                <td>
                                    <code className="bg-light px-2 py-1 rounded">{invitation.code}</code>
                                </td>
                                <td>
                                    {invitation.email || <span className="text-muted">(Invitation générale)</span>}
                                </td>
                                <td>
                                    {invitation.createdAt?.toDate().toLocaleDateString('fr-FR')}
                                </td>
                                <td>
                                    {invitation.expiresAt?.toDate().toLocaleDateString('fr-FR')}
                                </td>
                                <td>
                                    {invitation.usedBy?.length || 0}/{invitation.maxUses}
                                </td>
                                <td>
                                    {getStatusBadge(invitation)}
                                </td>
                                <td>
                                    <div className="d-flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            title="Copier le lien"
                                            onClick={() => handleCopyLink(invitation.code)}
                                            disabled={invitation.status === 'revoked' || invitation.isExpired}
                                        >
                                            <FaCopy />
                                        </Button>
                                        {invitation.email && (
                                            <Button
                                                size="sm"
                                                variant="outline-info"
                                                title="Envoyer par email"
                                                onClick={() => handleSendEmail(invitation)}
                                                disabled={invitation.status === 'revoked' || invitation.isExpired}
                                            >
                                                <FaEnvelope />
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline-secondary"
                                            title="Voir les détails"
                                            onClick={() => handleShowDetails(invitation)}
                                        >
                                            <FaEye />
                                        </Button>
                                        {invitation.status !== 'revoked' && !invitation.isExpired && (
                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                title="Révoquer"
                                                onClick={() => handleRevokeInvitation(invitation.id)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
            
            {/* Modal de création d'invitation */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Nouvelle invitation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Invitation générale (peut être utilisée par plusieurs personnes)"
                                checked={newInvitation.isGeneral}
                                onChange={(e) => setNewInvitation({
                                    ...newInvitation,
                                    isGeneral: e.target.checked,
                                    maxUses: e.target.checked ? 10 : 1
                                })}
                            />
                        </Form.Group>
                        
                        {!newInvitation.isGeneral && (
                            <Form.Group className="mb-3">
                                <Form.Label>Email du collaborateur *</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={newInvitation.email}
                                    onChange={(e) => setNewInvitation({
                                        ...newInvitation,
                                        email: e.target.value
                                    })}
                                    placeholder="collaborateur@example.com"
                                    required
                                />
                            </Form.Group>
                        )}
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Groupes / permissions</Form.Label>
                            <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {groupesList.map(groupe => (
                                    <Form.Check
                                        key={groupe.id}
                                        type="checkbox"
                                        label={groupe.nom}
                                        checked={newInvitation.groupes.includes(groupe.id)}
                                        onChange={(e) => {
                                            const updatedGroupes = e.target.checked
                                                ? [...newInvitation.groupes, groupe.id]
                                                : newInvitation.groupes.filter(g => g !== groupe.id);
                                            setNewInvitation({
                                                ...newInvitation,
                                                groupes: updatedGroupes
                                            });
                                        }}
                                    />
                                ))}
                            </div>
                            <Form.Text className="text-muted">
                                Les groupes sélectionnés seront automatiquement attribués au collaborateur
                            </Form.Text>
                        </Form.Group>
                        
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Durée de validité (jours)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={newInvitation.expirationDays}
                                        onChange={(e) => setNewInvitation({
                                            ...newInvitation,
                                            expirationDays: parseInt(e.target.value) || 7
                                        })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre d'utilisations max</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={newInvitation.maxUses}
                                        onChange={(e) => setNewInvitation({
                                            ...newInvitation,
                                            maxUses: parseInt(e.target.value) || 1
                                        })}
                                        disabled={!newInvitation.isGeneral}
                                    />
                                </Form.Group>
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
                        onClick={handleGenerateInvitation}
                        disabled={loading}
                    >
                        {loading ? 'Génération...' : 'Générer l\'invitation'}
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Modal de détails */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Détails de l'invitation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedInvitation && (
                        <div>
                            <Row>
                                <Col md={6}>
                                    <p><strong>Code :</strong> <code className="bg-light px-2 py-1 rounded">{selectedInvitation.code}</code></p>
                                    <p><strong>Email invité :</strong> {selectedInvitation.email || '(Invitation générale)'}</p>
                                    <p><strong>Créée par :</strong> {selectedInvitation.createdByName}</p>
                                    <p><strong>Entreprise :</strong> {selectedInvitation.entrepriseName}</p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Créée le :</strong> {selectedInvitation.createdAt?.toDate().toLocaleString('fr-FR')}</p>
                                    <p><strong>Expire le :</strong> {selectedInvitation.expiresAt?.toDate().toLocaleString('fr-FR')}</p>
                                    <p><strong>Statut :</strong> {getStatusBadge(selectedInvitation)}</p>
                                    <p><strong>Utilisations :</strong> {selectedInvitation.usedBy?.length || 0}/{selectedInvitation.maxUses}</p>
                                </Col>
                            </Row>
                            
                            {selectedInvitation.groupes && selectedInvitation.groupes.length > 0 && (
                                <div className="mt-3">
                                    <strong>Groupes attribués :</strong>
                                    <div className="mt-2">
                                        {selectedInvitation.groupes.map(groupeId => {
                                            const groupe = groupesList.find(g => g.id === groupeId);
                                            return groupe ? (
                                                <Badge key={groupeId} bg="primary" className="me-2">
                                                    {groupe.nom}
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                            
                            {selectedInvitation.usedBy && selectedInvitation.usedBy.length > 0 && (
                                <div className="mt-3">
                                    <strong>Utilisée par :</strong>
                                    <Table size="sm" className="mt-2">
                                        <thead>
                                            <tr>
                                                <th>Utilisateur</th>
                                                <th>Date d'utilisation</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedInvitation.usedBy.map((userId, index) => (
                                                <tr key={index}>
                                                    <td>{userId}</td>
                                                    <td>-</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                            
                            <div className="mt-3 p-3 bg-light rounded">
                                <strong>Lien d'invitation :</strong>
                                <InputGroup className="mt-2">
                                    <Form.Control
                                        type="text"
                                        value={`${window.location.origin}/onboarding?action=join&code=${selectedInvitation.code}`}
                                        readOnly
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => handleCopyLink(selectedInvitation.code)}
                                    >
                                        <FaCopy />
                                    </Button>
                                </InputGroup>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default InvitationsManager;