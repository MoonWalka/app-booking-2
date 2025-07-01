import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, Container, Alert, Form, Button, Spinner, ListGroup, Badge } from 'react-bootstrap';

const FestivalsDebugger = () => {
  const [festivals, setFestivals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [concertId, setConcertId] = useState('');
  const [concertDiagnostic, setConcertDiagnostic] = useState(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentConcerts, setRecentConcerts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    const debugFestivals = async () => {
      if (!currentOrganization?.id) {
        setError('Pas d\'organisation courante');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 [FestivalsDebugger] Organisation:', currentOrganization.id);

        // 1. Récupérer tous les festivals
        const festivalsQuery = query(
          collection(db, 'festivals'),
          where('organizationId', '==', currentOrganization.id)
        );
        
        const festivalsSnapshot = await getDocs(festivalsQuery);
        const festivalsData = festivalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`📊 [FestivalsDebugger] ${festivalsData.length} festivals trouvés`);
        setFestivals(festivalsData);

        // 2. Récupérer les contacts avec tag diffuseur
        const contactsQuery = query(
          collection(db, 'contacts'),
          where('organizationId', '==', currentOrganization.id),
          where('tags', 'array-contains', 'diffuseur')
        );
        
        const contactsSnapshot = await getDocs(contactsQuery);
        const contactsData = contactsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`📊 [FestivalsDebugger] ${contactsData.length} contacts diffuseurs trouvés`);
        setContacts(contactsData);

        // 3. Récupérer les concerts récents
        const concertsQuery = query(
          collection(db, 'concerts'),
          where('organizationId', '==', currentOrganization.id),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        
        const concertsSnapshot = await getDocs(concertsQuery);
        const concertsData = concertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`📊 [FestivalsDebugger] ${concertsData.length} concerts récents trouvés`);
        setRecentConcerts(concertsData);

        // 4. Analyser les données
        festivalsData.forEach(festival => {
          console.log('🎪 Festival:', {
            id: festival.id,
            titre: festival.titre,
            contactId: festival.contactId,
            contactName: festival.contactName,
            organizationId: festival.organizationId
          });
        });

        setLoading(false);
      } catch (err) {
        console.error('❌ [FestivalsDebugger] Erreur:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    debugFestivals();
  }, [currentOrganization?.id]);

  // Rechercher des concerts
  const searchConcerts = async (term) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const concertsQuery = query(
        collection(db, 'concerts'),
        where('organizationId', '==', currentOrganization.id),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const concertsSnapshot = await getDocs(concertsQuery);
      const allConcerts = concertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filtrer localement par le terme de recherche
      const filtered = allConcerts.filter(concert => {
        const searchLower = term.toLowerCase();
        return (
          concert.artisteNom?.toLowerCase().includes(searchLower) ||
          concert.structureNom?.toLowerCase().includes(searchLower) ||
          concert.organisateurNom?.toLowerCase().includes(searchLower) ||
          concert.lieuNom?.toLowerCase().includes(searchLower) ||
          concert.id.toLowerCase().includes(searchLower)
        );
      });

      setSearchResults(filtered);
      setShowSearchResults(true);
    } catch (error) {
      console.error('[FestivalsDebugger] Erreur recherche concerts:', error);
    }
  };

  // Sélectionner un concert
  const selectConcert = (concert) => {
    setConcertId(concert.id);
    setSearchTerm(concert.artisteNom || concert.id);
    setShowSearchResults(false);
    runConcertDiagnosticById(concert.id);
  };

  // Fonction pour diagnostiquer un concert spécifique
  const runConcertDiagnostic = async () => {
    if (!concertId) {
      alert('Veuillez sélectionner un concert');
      return;
    }
    runConcertDiagnosticById(concertId);
  };

  const runConcertDiagnosticById = async (id) => {
    if (!id || !currentOrganization?.id) {
      alert('Veuillez entrer un ID de concert');
      return;
    }

    setDiagnosticLoading(true);
    setConcertDiagnostic(null);
    setConcertId(id);

    try {
      console.log('[DIAGNOSTIC CONCERT] Démarrage pour concert ID:', id);
      
      // 1. Charger les données du concert
      const concertDoc = await getDoc(doc(db, 'concerts', id));
      
      if (!concertDoc.exists()) {
        setConcertDiagnostic({ error: 'Concert non trouvé' });
        setDiagnosticLoading(false);
        return;
      }

      const concertData = { id: concertDoc.id, ...concertDoc.data() };
      console.log('[DIAGNOSTIC CONCERT] Données du concert:', concertData);

      // 2. Identifier le contact propriétaire
      const contactId = concertData.structureId || concertData.organisateurId;
      console.log('[DIAGNOSTIC CONCERT] Contact ID extrait:', {
        structureId: concertData.structureId,
        organisateurId: concertData.organisateurId,
        finalContactId: contactId
      });

      // 3. Charger tous les festivals de l'organisation
      const festivalsOrgQuery = query(
        collection(db, 'festivals'),
        where('organizationId', '==', currentOrganization.id)
      );
      const festivalsOrgSnapshot = await getDocs(festivalsOrgQuery);
      const festivalsFromOrg = festivalsOrgSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 4. Charger les festivals du contact spécifique
      let festivalsFromContact = [];
      if (contactId) {
        const festivalsContactQuery = query(
          collection(db, 'festivals'),
          where('organizationId', '==', currentOrganization.id),
          where('contactId', '==', contactId)
        );
        const festivalsContactSnapshot = await getDocs(festivalsContactQuery);
        festivalsFromContact = festivalsContactSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }

      // 5. Vérifier si le festivalId du concert existe dans les listes
      let festivalExists = { inOrg: false, inContact: false };
      if (concertData.festivalId) {
        festivalExists.inOrg = festivalsFromOrg.some(f => f.id === concertData.festivalId);
        festivalExists.inContact = festivalsFromContact.some(f => f.id === concertData.festivalId);
      }

      setConcertDiagnostic({
        concertData,
        contactId,
        festivalsFromOrg,
        festivalsFromContact,
        festivalExists
      });

    } catch (error) {
      console.error('[DIAGNOSTIC CONCERT] Erreur:', error);
      setConcertDiagnostic({ error: error.message });
    } finally {
      setDiagnosticLoading(false);
    }
  };

  if (loading) {
    return <Container className="mt-4"><div>Chargement...</div></Container>;
  }

  if (error) {
    return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container className="mt-4">
      <h2>🔍 Debug Festivals</h2>
      
      <Card className="mb-4">
        <Card.Header>
          <h4>Organisation courante</h4>
        </Card.Header>
        <Card.Body>
          <p>ID: {currentOrganization?.id}</p>
          <p>Nom: {currentOrganization?.name}</p>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h4>Festivals ({festivals.length})</h4>
        </Card.Header>
        <Card.Body>
          {festivals.length === 0 ? (
            <Alert variant="info">Aucun festival trouvé</Alert>
          ) : (
            <div>
              {festivals.map(festival => (
                <div key={festival.id} className="mb-3 p-3 border rounded">
                  <strong>{festival.titre || 'Sans titre'}</strong>
                  <ul className="mt-2">
                    <li>ID: {festival.id}</li>
                    <li>Contact ID: {festival.contactId}</li>
                    <li>Contact Name: {festival.contactName}</li>
                    <li>Type: {festival.type || '-'}</li>
                    <li>Est actif: {festival.estActif ? 'Oui' : 'Non'}</li>
                    <li>Créé le: {festival.createdAt?.toDate?.()?.toLocaleString() || '-'}</li>
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h4>Contacts avec tag "diffuseur" ({contacts.length})</h4>
        </Card.Header>
        <Card.Body>
          {contacts.length === 0 ? (
            <Alert variant="warning">
              Aucun contact avec le tag "diffuseur" trouvé. 
              L'onglet Festival ne s'affichera que pour les contacts ayant ce tag.
            </Alert>
          ) : (
            <div>
              {contacts.map(contact => (
                <div key={contact.id} className="mb-2">
                  <strong>
                    {contact.structure?.raisonSociale || 
                     contact.personne?.prenom + ' ' + contact.personne?.nom || 
                     'Sans nom'}
                  </strong>
                  <span className="ms-2 text-muted">(ID: {contact.id})</span>
                  <div className="ms-3">
                    Tags: {contact.tags?.join(', ') || 'Aucun'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h4>Instructions</h4>
        </Card.Header>
        <Card.Body>
          <ol>
            <li>L'onglet Festival n'apparaît que si le contact a le tag "diffuseur"</li>
            <li>Vérifiez que le contact a bien ce tag dans la liste ci-dessus</li>
            <li>Si le contact n'a pas le tag, ajoutez-le via l'interface</li>
            <li>Les festivals sont liés au contact via le champ contactId</li>
          </ol>
        </Card.Body>
      </Card>

      {/* Section de diagnostic pour un concert spécifique */}
      <Card className="mt-4">
        <Card.Header className="bg-warning text-dark">
          <h4>🎵 Diagnostic Concert - Festival Dropdown</h4>
        </Card.Header>
        <Card.Body>
          <p className="mb-3">
            Recherchez un concert pour diagnostiquer pourquoi le dropdown festival/saison pourrait apparaître vide dans la page de détails.
          </p>
          
          {/* Barre de recherche */}
          <Form.Group className="mb-3">
            <Form.Label>Rechercher un concert</Form.Label>
            <Form.Control
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                searchConcerts(e.target.value);
              }}
              placeholder="Tapez le nom de l'artiste, du lieu, de l'organisateur..."
            />
            
            {/* Résultats de recherche */}
            {showSearchResults && searchResults.length > 0 && (
              <ListGroup className="position-absolute w-100 mt-1" style={{ zIndex: 1000, maxHeight: '300px', overflow: 'auto' }}>
                {searchResults.map(concert => (
                  <ListGroup.Item 
                    key={concert.id} 
                    action 
                    onClick={() => selectConcert(concert)}
                    className="cursor-pointer"
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{concert.artisteNom || 'Sans nom'}</strong>
                        <div className="text-muted small">
                          {concert.date && new Date(concert.date).toLocaleDateString('fr-FR')}
                          {concert.lieuNom && ` - ${concert.lieuNom}`}
                          {concert.structureNom && ` - ${concert.structureNom}`}
                        </div>
                      </div>
                      <Badge bg="secondary" className="ms-2">{concert.id.substring(0, 8)}...</Badge>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Form.Group>

          {/* Concerts récents */}
          {!showSearchResults && recentConcerts.length > 0 && (
            <div className="mb-3">
              <p className="text-muted mb-2">Ou sélectionnez parmi les concerts récents :</p>
              <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                <ListGroup>
                  {recentConcerts.slice(0, 10).map(concert => (
                    <ListGroup.Item 
                      key={concert.id} 
                      action 
                      onClick={() => selectConcert(concert)}
                      className="cursor-pointer py-2"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{concert.artisteNom || 'Sans nom'}</strong>
                          <span className="text-muted ms-2">
                            {concert.date && new Date(concert.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <Badge bg="info">{concert.lieuNom || 'Lieu non défini'}</Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </div>
          )}

          {/* ID sélectionné */}
          {concertId && (
            <Alert variant="info" className="py-2">
              Concert sélectionné : <strong>{concertId}</strong>
            </Alert>
          )}

          {concertDiagnostic && (
            <div className="mt-4">
              {concertDiagnostic.error ? (
                <Alert variant="danger">
                  <strong>Erreur:</strong> {concertDiagnostic.error}
                </Alert>
              ) : (
                <>
                  <Alert variant="info">
                    <h5>📊 Résumé du diagnostic</h5>
                    <ul className="mb-0">
                      <li>Concert: {concertDiagnostic.concertData.artisteNom || 'Sans nom'}</li>
                      <li>Contact ID extrait: <strong>{concertDiagnostic.contactId || 'AUCUN'}</strong></li>
                      <li>Festival ID du concert: <strong>{concertDiagnostic.concertData.festivalId || 'AUCUN'}</strong></li>
                      <li>Festivals dans l'organisation: {concertDiagnostic.festivalsFromOrg.length}</li>
                      <li>Festivals du contact: <strong>{concertDiagnostic.festivalsFromContact.length}</strong></li>
                      {concertDiagnostic.concertData.festivalId && (
                        <>
                          <li>Festival existe dans org: {concertDiagnostic.festivalExists.inOrg ? '✅ OUI' : '❌ NON'}</li>
                          <li>Festival existe pour contact: {concertDiagnostic.festivalExists.inContact ? '✅ OUI' : '❌ NON'}</li>
                        </>
                      )}
                    </ul>
                  </Alert>

                  <div className="accordion" id="concertDiagnosticAccordion">
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#concertData">
                          Données du concert
                        </button>
                      </h2>
                      <div id="concertData" className="accordion-collapse collapse" data-bs-parent="#concertDiagnosticAccordion">
                        <div className="accordion-body">
                          <pre className="bg-light p-2" style={{ maxHeight: '300px', overflow: 'auto' }}>
                            {JSON.stringify(concertDiagnostic.concertData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#festivalsOrg">
                          Festivals de l'organisation ({concertDiagnostic.festivalsFromOrg.length})
                        </button>
                      </h2>
                      <div id="festivalsOrg" className="accordion-collapse collapse" data-bs-parent="#concertDiagnosticAccordion">
                        <div className="accordion-body">
                          <pre className="bg-light p-2" style={{ maxHeight: '300px', overflow: 'auto' }}>
                            {JSON.stringify(concertDiagnostic.festivalsFromOrg, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#festivalsContact">
                          Festivals du contact ({concertDiagnostic.festivalsFromContact.length})
                        </button>
                      </h2>
                      <div id="festivalsContact" className="accordion-collapse collapse" data-bs-parent="#concertDiagnosticAccordion">
                        <div className="accordion-body">
                          <pre className="bg-light p-2" style={{ maxHeight: '300px', overflow: 'auto' }}>
                            {JSON.stringify(concertDiagnostic.festivalsFromContact, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic et recommandations */}
                  <Alert variant={concertDiagnostic.festivalsFromContact.length > 0 ? 'success' : 'warning'} className="mt-3">
                    <h5>🔍 Diagnostic</h5>
                    {!concertDiagnostic.contactId && (
                      <p>❌ <strong>Problème critique:</strong> Le concert n'a pas de structureId ou organisateurId. Le dropdown sera vide.</p>
                    )}
                    {concertDiagnostic.contactId && concertDiagnostic.festivalsFromContact.length === 0 && (
                      <p>⚠️ <strong>Aucun festival trouvé pour ce contact.</strong> Le dropdown sera vide. Vérifiez que le contact {concertDiagnostic.contactId} possède des festivals.</p>
                    )}
                    {concertDiagnostic.contactId && concertDiagnostic.festivalsFromContact.length > 0 && (
                      <p>✅ <strong>OK:</strong> {concertDiagnostic.festivalsFromContact.length} festival(s) trouvé(s) pour ce contact. Le dropdown devrait fonctionner.</p>
                    )}
                  </Alert>
                </>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FestivalsDebugger;