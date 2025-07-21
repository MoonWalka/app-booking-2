// src/components/devis/DevisForm.js
import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Table, Card, Modal, ListGroup } from 'react-bootstrap';
import { getStructureById } from '@/services/structureService';
import projetService from '@/services/projetService';
import contactServiceRelational from '@/services/contactServiceRelational';
import collaborateurService from '@/services/collaborateurService';
import { useEntreprise } from '@/context/EntrepriseContext';
import { useParametres } from '@/context/ParametresContext';
import { useAuth } from '@/context/AuthContext';
import devisConfig from '@/config/devisConfig';

/**
 * Formulaire d'édition de devis
 */
function DevisForm({ devisData, setDevisData, onCalculateTotals, readonly = false }) {
  const { currentEntreprise } = useEntreprise();
  const { parametres } = useParametres();
  const { user } = useAuth();
  
  // États pour les données dynamiques
  const [projets, setProjets] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [collaborateurs, setCollaborateurs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Log initial pour tracer les données reçues
  useEffect(() => {
    console.log('=== DevisForm - Données reçues ===');
    console.log('Projet du devis:', devisData.projetNom || 'AUCUN');
    console.log('Date ID:', devisData.dateId || 'AUCUN');
    console.log('Artiste:', devisData.artisteNom || 'AUCUN');
    console.log('Structure:', devisData.structureNom || 'AUCUNE');
    console.log('Données complètes du devis:', devisData);
    console.log('=================================');
  }, [devisData]);

  // Récupérer les taux de TVA et unités depuis les paramètres ou la config par défaut
  const tauxTvaDisponibles = (parametres?.tva && Array.isArray(parametres.tva)) 
    ? parametres.tva 
    : devisConfig.tauxTvaDefaut;

  const unitesDisponibles = (parametres?.unites && Array.isArray(parametres.unites)) 
    ? parametres.unites 
    : devisConfig.unitesDefaut;

  // Ajouter une ligne objet
  const addLigneObjet = () => {
    const newId = Math.max(...devisData.lignesObjet.map(l => l.id), 0) + 1;
    // Utiliser le premier taux TVA des paramètres ou 20 par défaut
    const defaultTva = tauxTvaDisponibles.length > 0 ? tauxTvaDisponibles[0].taux : devisConfig.nouvelleLigneDefaut.tauxTVA;
    const newLigne = {
      id: newId,
      objet: '',
      quantite: 1,
      unite: devisConfig.nouvelleLigneDefaut.unite,
      prixUnitaire: 0,
      montantHT: 0,
      tauxTVA: defaultTva
    };
    
    setDevisData(prev => ({
      ...prev,
      lignesObjet: [...prev.lignesObjet, newLigne]
    }));
  };

  // Supprimer une ligne objet
  const removeLigneObjet = (id) => {
    setDevisData(prev => ({
      ...prev,
      lignesObjet: prev.lignesObjet.filter(l => l.id !== id)
    }));
  };

  // Mettre à jour une ligne objet
  const updateLigneObjet = (id, field, value) => {
    setDevisData(prev => ({
      ...prev,
      lignesObjet: prev.lignesObjet.map(ligne => {
        if (ligne.id === id) {
          const updatedLigne = { ...ligne, [field]: value };
          
          // Recalculer le montant HT si nécessaire
          if (field === 'quantite' || field === 'prixUnitaire') {
            updatedLigne.montantHT = (updatedLigne.quantite || 0) * (updatedLigne.prixUnitaire || 0);
          }
          
          return updatedLigne;
        }
        return ligne;
      })
    }));
  };

  // Ajouter une ligne de règlement
  const addLigneReglement = () => {
    const newId = Math.max(...devisData.lignesReglement.map(l => l.id), 0) + 1;
    const newLigne = {
      id: newId,
      nature: devisConfig.reglement.natureDefaut,
      montantTTC: 0,
      dateFacturation: '',
      dateEcheance: '',
      modePaiement: devisConfig.reglement.modePaiementDefaut
    };
    
    setDevisData(prev => ({
      ...prev,
      lignesReglement: [...prev.lignesReglement, newLigne]
    }));
  };

  // Générer le solde
  const generateSolde = () => {
    // Vérifier qu'il n'y a pas déjà de solde
    const hasSolde = devisData.lignesReglement.some(l => l.nature === 'solde');
    if (hasSolde) {
      alert('Un solde existe déjà');
      return;
    }

    const newId = Math.max(...devisData.lignesReglement.map(l => l.id), 0) + 1;
    const soldeLigne = {
      id: newId,
      nature: 'solde',
      montantTTC: devisData.montantTTC,
      dateFacturation: new Date().toISOString().split('T')[0],
      dateEcheance: new Date().toISOString().split('T')[0],
      modePaiement: devisConfig.reglement.modePaiementDefaut
    };
    
    setDevisData(prev => ({
      ...prev,
      lignesReglement: [...prev.lignesReglement, soldeLigne]
    }));
  };

  // Supprimer une ligne de règlement
  const removeLigneReglement = (id) => {
    setDevisData(prev => ({
      ...prev,
      lignesReglement: prev.lignesReglement.filter(l => l.id !== id)
    }));
  };

  // Mettre à jour une ligne de règlement
  const updateLigneReglement = (id, field, value) => {
    setDevisData(prev => ({
      ...prev,
      lignesReglement: prev.lignesReglement.map(ligne => 
        ligne.id === id ? { ...ligne, [field]: value } : ligne
      )
    }));
  };

  // Recalculer les totaux quand les lignes changent
  useEffect(() => {
    if (onCalculateTotals) {
      onCalculateTotals(devisData.lignesObjet);
    }
  }, [devisData.lignesObjet, onCalculateTotals]);

  // Charger les données depuis Firebase
  useEffect(() => {
    const loadData = async () => {
      if (!currentEntreprise?.id) return;
      
      setLoading(true);
      try {
        // Charger les projets
        const projetsData = await projetService.getProjetsByOrganization(currentEntreprise.id);
        setProjets(projetsData);
        
        // Charger les collaborateurs
        const collaborateursData = await collaborateurService.getCollaborateursByOrganization(currentEntreprise.id);
        setCollaborateurs(collaborateursData);
        
        // Charger les contacts (selon la structure si présente)
        if (devisData.structureId) {
          const contactsData = await contactServiceRelational.getContactsByStructure(devisData.structureId);
          setContacts(contactsData);
        } else {
          const contactsData = await contactServiceRelational.getContactsByOrganization(currentEntreprise.id);
          setContacts(contactsData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentEntreprise?.id, devisData.structureId]);

  // Auto-remplir le nom de l'entreprise depuis les paramètres
  useEffect(() => {
    if (!devisData.entreprise && (parametres?.entreprise?.nom || currentEntreprise?.name)) {
      const nomEntreprise = parametres?.entreprise?.nom || currentEntreprise?.name;
      setDevisData(prev => ({
        ...prev,
        entreprise: nomEntreprise
      }));
    }
  }, [parametres?.entreprise?.nom, currentEntreprise?.name, devisData.entreprise, setDevisData]);

  // Auto-remplir l'adresse administrative depuis la structure
  useEffect(() => {
    const fetchStructureAddress = async () => {
      if (devisData.structureId && !devisData.adresseAdministrative) {
        try {
          const structure = await getStructureById(devisData.structureId);
          if (structure) {
            // Construire l'adresse simplifiée (sans département ni région)
            const adresseComplete = [
              structure.adresse,
              structure.suiteAdresse1,
              structure.codePostal && structure.ville ? `${structure.codePostal} ${structure.ville}` : '',
              structure.pays || 'France'
            ].filter(Boolean).join('\n');

            setDevisData(prev => ({
              ...prev,
              adresseAdministrative: adresseComplete
            }));
          }
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'adresse de la structure:', error);
        }
      }
    };

    fetchStructureAddress();
  }, [devisData.structureId, devisData.adresseAdministrative, setDevisData]);

  // État pour la modal d'adresses alternatives
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [alternativeAddresses, setAlternativeAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Fonction pour actualiser manuellement l'adresse depuis la structure
  const actualiserAdresseStructure = async () => {
    if (devisData.structureId) {
      try {
        const structure = await getStructureById(devisData.structureId);
        if (structure) {
          // Construire l'adresse simplifiée (sans département ni région)
          const adresseComplete = [
            structure.adresse,
            structure.suiteAdresse1,
            structure.codePostal && structure.ville ? `${structure.codePostal} ${structure.ville}` : '',
            structure.pays || 'France'
          ].filter(Boolean).join('\n');

          setDevisData(prev => ({
            ...prev,
            adresseAdministrative: adresseComplete
          }));
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'adresse de la structure:', error);
      }
    }
  };

  // Fonction pour rechercher les adresses alternatives
  const chercherAdressesAlternatives = async () => {
    console.log('Recherche d\'adresses alternatives...');
    console.log('devisData.structureId:', devisData.structureId);
    
    // Si pas de structureId, créer quand même quelques adresses d'exemple
    if (!devisData.structureId) {
      console.log('Pas de structureId, création d\'adresses d\'exemple');
      const exampleAddresses = [
        {
          type: 'principale',
          label: 'Adresse principale (exemple)',
          adresse: '123 Rue de la République\n75001 Paris\nFrance'
        },
        {
          type: 'facturation',
          label: 'Adresse de facturation (exemple)',
          adresse: '456 Avenue des Champs\n75008 Paris\nFrance'
        }
      ];
      setAlternativeAddresses(exampleAddresses);
      setShowAddressModal(true);
      return;
    }

    try {
      console.log('Récupération de la structure...');
      const structure = await getStructureById(devisData.structureId);
      console.log('Structure récupérée:', structure);
      
      if (!structure) {
        console.log('Structure non trouvée');
        return;
      }

      const addresses = [];
      
      // Adresse principale
      if (structure.adresse) {
        addresses.push({
          type: 'principale',
          label: 'Adresse principale',
          adresse: [
            structure.adresse,
            structure.suiteAdresse1,
            structure.codePostal && structure.ville ? `${structure.codePostal} ${structure.ville}` : '',
            structure.pays || 'France'
          ].filter(Boolean).join('\n')
        });
      }

      // Adresse de facturation (si différente)
      if (structure.adresseFacturation) {
        addresses.push({
          type: 'facturation',
          label: 'Adresse de facturation',
          adresse: structure.adresseFacturation
        });
      }

      // Adresse de livraison (si différente)
      if (structure.adresseLivraison) {
        addresses.push({
          type: 'livraison',
          label: 'Adresse de livraison',
          adresse: structure.adresseLivraison
        });
      }

      // Autres adresses dans les commentaires ou champs libres
      if (structure.commentaires1 && structure.commentaires1.toLowerCase().includes('adresse')) {
        addresses.push({
          type: 'autre',
          label: 'Adresse mentionnée dans les commentaires',
          adresse: structure.commentaires1
        });
      }

      // Ajouter une adresse d'exemple si aucune trouvée
      if (addresses.length === 0) {
        addresses.push({
          type: 'exemple',
          label: 'Adresse d\'exemple',
          adresse: 'Aucune adresse alternative trouvée.\nVoici une adresse d\'exemple.'
        });
      }

      console.log('Adresses trouvées:', addresses);
      setAlternativeAddresses(addresses);
      setShowAddressModal(true);
      console.log('Modal ouverte');
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresses alternatives:', error);
      // Ouvrir quand même la modal avec un message d'erreur
      setAlternativeAddresses([{
        type: 'erreur',
        label: 'Erreur lors de la récupération',
        adresse: 'Une erreur s\'est produite lors de la récupération des adresses.'
      }]);
      setShowAddressModal(true);
    }
  };

  // Fonction pour confirmer la sélection d'adresse
  const confirmerSelectionAdresse = () => {
    if (selectedAddress) {
      setDevisData(prev => ({
        ...prev,
        adresseAdministrative: selectedAddress.adresse
      }));
      setShowAddressModal(false);
      setSelectedAddress(null);
    }
  };


  return (
    <div className="devis-form">
      <Form>

        {/* 1. Émetteur & Destinataire */}
        <Card className="mb-4">
          <Card.Header>
            <Row>
              <Col md={6} className="text-center">
                <h5 className="mb-0">1. Émetteur</h5>
              </Col>
              <Col md={6} className="text-center">
                <h5 className="mb-0">1. Destinataire</h5>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <Row>
              {/* Émetteur - Colonne gauche */}
              <Col md={6} className="border-end pe-4">
                <Form.Group className="mb-3">
                  <Form.Label>Entreprise</Form.Label>
                  <Form.Control
                    type="text"
                    value={devisData.entreprise || parametres?.entreprise?.nom || currentEntreprise?.name || ''}
                    onChange={(e) => setDevisData(prev => ({ ...prev, entreprise: e.target.value }))}
                    disabled={readonly}
                    placeholder="Nom de l'entreprise"
                  />
                  {(parametres?.entreprise?.nom || currentEntreprise?.name) && !devisData.entreprise && (
                    <Form.Text className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Auto-rempli depuis les paramètres de l'entreprise
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Collaborateur</Form.Label>
                  <Form.Select
                    value={devisData.collaborateurId || user?.uid || ''}
                    onChange={(e) => {
                      const selectedCollab = collaborateurs.find(c => c.id === e.target.value);
                      setDevisData(prev => ({ 
                        ...prev, 
                        collaborateurId: e.target.value,
                        collaborateurNom: selectedCollab?.displayName || selectedCollab?.email || ''
                      }))
                    }}
                    disabled={readonly || loading}
                  >
                    <option value="">Sélectionner un collaborateur</option>
                    {collaborateurs.map(collab => (
                      <option key={collab.id} value={collab.id}>
                        {collab.displayName || collab.email || 'Collaborateur sans nom'}
                        {collab.id === user?.uid && ' (Vous)'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Destinataire - Colonne droite */}
              <Col md={6} className="ps-4">
                <Form.Group className="mb-3">
                  <Form.Label>Structure</Form.Label>
                  <div className="fw-bold fs-5 p-2 bg-light border rounded">
                    {devisData.structureNom || devisConfig.placeholders.structureNonSelectionnee}
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>À l'attention de</Form.Label>
                  <Form.Select
                    value={devisData.contactId || ''}
                    onChange={(e) => {
                      const selectedContact = contacts.find(c => c.id === e.target.value);
                      setDevisData(prev => ({ 
                        ...prev, 
                        contactId: e.target.value,
                        contactNom: selectedContact ? `${selectedContact.prenom || ''} ${selectedContact.nom || ''}`.trim() : ''
                      }))
                    }}
                    disabled={readonly || loading || contacts.length === 0}
                  >
                    <option value="">Sélectionner un contact</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.prenom} {contact.nom}
                        {contact.fonction && ` - ${contact.fonction}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Adresse administrative</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={devisData.adresseAdministrative || ''}
                    onChange={(e) => setDevisData(prev => ({ ...prev, adresseAdministrative: e.target.value }))}
                    disabled={readonly}
                    placeholder="Adresse complète..."
                  />
                  <div className="mt-1 d-flex gap-2">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0"
                      onClick={actualiserAdresseStructure}
                      disabled={readonly}
                      title="Récupérer l'adresse de la structure"
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Actualiser depuis la structure
                    </Button>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 text-muted"
                      onClick={chercherAdressesAlternatives}
                      disabled={readonly}
                    >
                      Choisir une autre adresse…
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* 3. Informations générales */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">2. Informations générales</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Projet</Form.Label>
              {devisData.projetNom && devisData.projetNom !== 'Aucun projet' ? (
                // Si le projet vient de la date, l'afficher en lecture seule
                <>
                  <Form.Control
                    type="text"
                    value={devisData.projetNom}
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Projet hérité de la date (ID: {devisData.dateId || 'N/A'})
                  </Form.Text>
                  {console.log('🎯 Affichage du projet en lecture seule:', devisData.projetNom)}
                </>
              ) : (
                // Sinon, permettre la sélection
                <Form.Select
                  value={devisData.projetId || ''}
                  onChange={(e) => {
                    const selectedProjet = projets.find(p => p.id === e.target.value);
                    console.log('🔄 Sélection manuelle du projet:', selectedProjet?.intitule || 'AUCUN');
                    setDevisData(prev => ({ 
                      ...prev, 
                      projetId: e.target.value,
                      projetNom: selectedProjet?.intitule || ''
                    }))
                  }}
                  disabled={readonly || loading}
                >
                  <option value="">Sélectionner un projet</option>
                  {projets.map(projet => (
                    <option key={projet.id} value={projet.id}>
                      {projet.intitule}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Période</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">du</span>
                <Form.Control
                  type="date"
                  size="sm"
                  value={devisData.dateDebut || ''}
                  onChange={(e) => setDevisData(prev => ({ ...prev, dateDebut: e.target.value }))}
                  disabled={readonly || devisData.statut !== 'brouillon'}
                />
                <span className="text-muted">au</span>
                <Form.Control
                  type="date"
                  size="sm"
                  value={devisData.dateFin || ''}
                  onChange={(e) => setDevisData(prev => ({ ...prev, dateFin: e.target.value }))}
                  disabled={readonly || devisData.statut !== 'brouillon'}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Titre</Form.Label>
              <Form.Control
                type="text"
                value={devisData.titre || `1 représentation(s) du spectacle ${devisData.projetNom && devisData.projetNom !== 'Aucun projet' ? devisData.projetNom : devisConfig.placeholders.projetNonDefini} le ${devisData.dateDebut ? new Date(devisData.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : devisConfig.placeholders.dateNonDefinie}`}
                onChange={(e) => setDevisData(prev => ({ ...prev, titre: e.target.value, titreModifieManuellement: true }))}
                disabled={readonly}
                placeholder="Titre auto-généré, éditable"
              />
              <Form.Text className="text-muted">
                Se régénère automatiquement tant que non modifié manuellement
              </Form.Text>
            </Form.Group>
          </Card.Body>
        </Card>

        {/* 4. Conditions financières */}
        <Card className="mb-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">3. Conditions financières</h5>
              <div className="d-flex align-items-center gap-2">
                <Form.Label className="mb-0 me-2">Devise:</Form.Label>
                <Form.Select 
                  size="sm" 
                  style={{ width: 'auto' }}
                  value={devisData.devise || 'EUR'}
                  onChange={(e) => setDevisData(prev => ({ ...prev, devise: e.target.value }))}
                  disabled={readonly}
                >
                  {devisConfig.devises.map(devise => (
                    <option key={devise.code} value={devise.code}>{devise.libelle}</option>
                  ))}
                </Form.Select>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <Row>
              {/* Colonne gauche : Tableau des objets */}
              <Col md={9}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Tableau des objets</h6>
                  {!readonly && devisData.statut === 'brouillon' && (
                    <Button variant="success" size="sm" onClick={addLigneObjet}>
                      <i className="bi bi-plus"></i>
                    </Button>
                  )}
                </div>
                
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Objet</th>
                      <th style={{ width: '60px' }}>Qté</th>
                      <th style={{ width: '80px' }}>Unité</th>
                      <th style={{ width: '90px' }}>Prix unit. HT</th>
                      <th style={{ width: '90px' }}>Montant HT</th>
                      <th style={{ width: '90px' }}>TVA %</th>
                      {!readonly && devisData.statut === 'brouillon' && <th style={{ width: '60px' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {devisData.lignesObjet.map((ligne) => (
                      <tr key={ligne.id}>
                        <td>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={ligne.objet}
                            onChange={(e) => updateLigneObjet(ligne.id, 'objet', e.target.value)}
                            disabled={readonly || devisData.statut !== 'brouillon'}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            size="sm"
                            value={ligne.quantite}
                            onChange={(e) => updateLigneObjet(ligne.id, 'quantite', parseFloat(e.target.value) || 0)}
                            disabled={readonly || devisData.statut !== 'brouillon'}
                          />
                        </td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={ligne.unite}
                            onChange={(e) => updateLigneObjet(ligne.id, 'unite', e.target.value)}
                            disabled={readonly || devisData.statut !== 'brouillon'}
                          >
                            {unitesDisponibles.map((unite) => (
                              <option key={unite.id} value={unite.nom}>
                                {unite.nom.charAt(0).toUpperCase() + unite.nom.slice(1)}
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            size="sm"
                            step="0.01"
                            value={ligne.prixUnitaire}
                            onChange={(e) => updateLigneObjet(ligne.id, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                            disabled={readonly || devisData.statut !== 'brouillon'}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={`${ligne.montantHT.toFixed(2)} €`}
                            disabled
                          />
                        </td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={ligne.tauxTVA}
                            onChange={(e) => updateLigneObjet(ligne.id, 'tauxTVA', parseFloat(e.target.value) || 0)}
                            disabled={readonly || devisData.statut !== 'brouillon'}
                          >
                            {tauxTvaDisponibles.map((tva) => (
                              <option key={tva.id} value={tva.taux}>
                                {tva.taux}% - {tva.libelle}
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                        {!readonly && devisData.statut === 'brouillon' && (
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeLigneObjet(ligne.id)}
                              title="Supprimer"
                            >
                              🗑️
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>

              {/* Colonne droite : Totaux */}
              <Col md={3}>
                <h6 className="mb-3">Totaux</h6>
                <Card className="border-primary">
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Total HT:</span>
                      <strong>{devisData.montantHT.toFixed(2)} €</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Total TVA:</span>
                      <strong>{devisData.totalTVA.toFixed(2)} €</strong>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <span className="fw-bold">Total TTC:</span>
                      <strong className="text-primary fs-5">{devisData.montantTTC.toFixed(2)} €</strong>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* 5. Règlement devis */}
        <Card className="mb-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">4. Règlement devis</h5>
              <div className="d-flex align-items-center gap-3">
                {!readonly && (
                  <Button variant="primary" size="sm" onClick={generateSolde}>
                    Solde
                  </Button>
                )}
                <div className="d-flex align-items-center gap-2">
                  <Form.Label className="mb-0">Date de validité:</Form.Label>
                  <Form.Control
                    type="date"
                    size="sm"
                    style={{ width: 'auto' }}
                    value={devisData.dateValidite || ''}
                    onChange={(e) => setDevisData(prev => ({ ...prev, dateValidite: e.target.value }))}
                    disabled={readonly}
                  />
                </div>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Tableau des échéances</h6>
              {!readonly && (
                <Button variant="success" size="sm" onClick={addLigneReglement}>
                  <i className="bi bi-plus"></i>
                </Button>
              )}
            </div>

            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Nature</th>
                  <th>Montant TTC</th>
                  <th>Date facturation</th>
                  <th>Date échéance</th>
                  <th>Date envoi</th>
                  <th>Mode de paiement</th>
                  {!readonly && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {devisData.lignesReglement.map((ligne) => (
                  <tr key={ligne.id}>
                    <td>
                      <Form.Select
                        size="sm"
                        value={ligne.nature}
                        onChange={(e) => updateLigneReglement(ligne.id, 'nature', e.target.value)}
                        disabled={readonly || devisData.statut !== 'brouillon'}
                      >
                        {devisConfig.naturesReglement.map(nature => (
                          <option key={nature.value} value={nature.value}>{nature.label}</option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        step="0.01"
                        value={ligne.montantTTC}
                        onChange={(e) => updateLigneReglement(ligne.id, 'montantTTC', parseFloat(e.target.value) || 0)}
                        disabled={readonly || devisData.statut !== 'brouillon'}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={ligne.dateFacturation}
                        onChange={(e) => updateLigneReglement(ligne.id, 'dateFacturation', e.target.value)}
                        disabled={readonly || devisData.statut !== 'brouillon'}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={ligne.dateEcheance}
                        onChange={(e) => updateLigneReglement(ligne.id, 'dateEcheance', e.target.value)}
                        disabled={readonly || devisData.statut !== 'brouillon'}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={ligne.dateEnvoi || ''}
                        onChange={(e) => updateLigneReglement(ligne.id, 'dateEnvoi', e.target.value)}
                        disabled={readonly || devisData.statut !== 'brouillon'}
                      />
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={ligne.modePaiement}
                        onChange={(e) => updateLigneReglement(ligne.id, 'modePaiement', e.target.value)}
                        disabled={readonly || devisData.statut !== 'brouillon'}
                      >
                        {devisConfig.modesPaiement.map(mode => (
                          <option key={mode.value} value={mode.value}>{mode.label}</option>
                        ))}
                      </Form.Select>
                    </td>
                    {!readonly && (
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeLigneReglement(ligne.id)}
                          title="Supprimer"
                        >
                          🗑️
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* 6. Conditions particulières de vente */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">5. Conditions particulières de vente</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={6}
                value={devisData.conditionsParticulieres || ''}
                onChange={(e) => setDevisData(prev => ({ ...prev, conditionsParticulieres: e.target.value }))}
                disabled={readonly}
                placeholder="Zone de texte riche (gras, italique, puces)..."
              />
              <Form.Text className="text-muted">
                Formatage riche disponible (gras, italique, puces)
              </Form.Text>
            </Form.Group>
          </Card.Body>
        </Card>

        {/* 6. Modalités de paiement */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">6. Modalités de paiement</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={6}
                value={devisData.modalitesPaiement || ''}
                onChange={(e) => setDevisData(prev => ({ ...prev, modalitesPaiement: e.target.value }))}
                disabled={readonly}
                placeholder="Zone de texte riche..."
              />
              <Form.Text className="text-muted">
                Formatage riche disponible
              </Form.Text>
            </Form.Group>
          </Card.Body>
        </Card>

        {/* 7. Informations complémentaires */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">7. Informations complémentaires</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={6}
                value={devisData.informationsComplementaires || ''}
                onChange={(e) => setDevisData(prev => ({ ...prev, informationsComplementaires: e.target.value }))}
                disabled={readonly}
                placeholder="Informations complémentaires, notes, remarques..."
              />
              <Form.Text className="text-muted">
                Zone libre pour toute information complémentaire
              </Form.Text>
            </Form.Group>
          </Card.Body>
        </Card>
      </Form>

      {/* Modal pour sélectionner une adresse alternative */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-geo-alt me-2"></i>
            Choisir une adresse
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Voici les autres adresses que nous avons trouvées concernant cette structure :
          </p>
          
          {alternativeAddresses.length > 0 ? (
            <ListGroup>
              {alternativeAddresses.map((address, index) => (
                <ListGroup.Item
                  key={index}
                  action
                  active={selectedAddress === address}
                  onClick={() => setSelectedAddress(address)}
                  className="d-flex align-items-start"
                >
                  <Form.Check
                    type="radio"
                    name="selectedAddress"
                    checked={selectedAddress === address}
                    onChange={() => setSelectedAddress(address)}
                    className="me-3 mt-1"
                  />
                  <div className="flex-grow-1">
                    <div className="fw-bold text-primary mb-1">
                      <i className="bi bi-geo-alt-fill me-1"></i>
                      {address.label}
                    </div>
                    <div className="text-break" style={{ whiteSpace: 'pre-line' }}>
                      {address.adresse}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-center text-muted py-4">
              <i className="bi bi-info-circle fs-1 mb-2 d-block"></i>
              Aucune adresse alternative trouvée pour cette structure.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddressModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={confirmerSelectionAdresse}
            disabled={!selectedAddress}
          >
            <i className="bi bi-check-lg me-1"></i>
            Confirmer cette adresse
          </Button>
        </Modal.Footer>
      </Modal>
      
    </div>
  );
}

export default DevisForm;