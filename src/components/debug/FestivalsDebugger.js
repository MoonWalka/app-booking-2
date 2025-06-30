import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, Container, Alert } from 'react-bootstrap';

const FestivalsDebugger = () => {
  const [festivals, setFestivals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

        // 3. Analyser les données
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
    </Container>
  );
};

export default FestivalsDebugger;