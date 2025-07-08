import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Alert, Table, Badge, Spinner } from 'react-bootstrap';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import { TAGS_HIERARCHY } from '@/config/tagsHierarchy';

const TagsHierarchyDebug = () => {
  const { currentEntreprise } = useEntreprise();
  const [loading, setLoading] = useState(false);
  const [debugData, setDebugData] = useState(null);
  const [error, setError] = useState(null);

  const analyzeTagsUsage = useCallback(async () => {
    if (!currentEntreprise?.id) {
      setError('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Requête pour tous les contacts avec des tags
      const contactsQuery = query(
        collection(db, 'contacts'),
        where('organizationId', '==', currentEntreprise.id)
      );
      
      const contactsSnapshot = await getDocs(contactsQuery);
      const usageCount = {};
      const contactsWithTags = [];
      const allTagsUsed = new Set();

      // Compter l'utilisation de chaque tag
      contactsSnapshot.docs.forEach(doc => {
        const contact = doc.data();
        const tags = contact.qualification?.tags || [];
        
        if (tags.length > 0) {
          contactsWithTags.push({
            id: doc.id,
            nom: contact.nom || 'Sans nom',
            prenom: contact.prenom || '',
            tags: tags
          });

          tags.forEach(tag => {
            allTagsUsed.add(tag);
            usageCount[tag] = (usageCount[tag] || 0) + 1;
          });
        }
      });

      // Analyser la hiérarchie des tags
      const analyzeHierarchy = (items, level = 0) => {
        let analysis = [];
        
        items.forEach(item => {
          const usage = usageCount[item.label] || 0;
          const isUsed = allTagsUsed.has(item.label);
          
          analysis.push({
            id: item.id,
            label: item.label,
            level: level,
            usage: usage,
            isUsed: isUsed,
            color: item.color,
            hasChildren: item.children && item.children.length > 0
          });

          if (item.children) {
            analysis = analysis.concat(analyzeHierarchy(item.children, level + 1));
          }
        });

        return analysis;
      };

      const hierarchyAnalysis = analyzeHierarchy(TAGS_HIERARCHY);

      // Trouver les tags orphelins (utilisés mais pas dans la hiérarchie)
      const tagsInHierarchy = new Set();
      const collectTagsFromHierarchy = (items) => {
        items.forEach(item => {
          tagsInHierarchy.add(item.label);
          if (item.children) {
            collectTagsFromHierarchy(item.children);
          }
        });
      };
      collectTagsFromHierarchy(TAGS_HIERARCHY);

      const orphanTags = Array.from(allTagsUsed).filter(tag => !tagsInHierarchy.has(tag));

      setDebugData({
        organizationId: currentEntreprise.id,
        organizationName: currentEntreprise.nom,
        totalContacts: contactsSnapshot.size,
        contactsWithTags: contactsWithTags.length,
        totalTagsUsed: allTagsUsed.size,
        totalTagsInHierarchy: tagsInHierarchy.size,
        orphanTags: orphanTags,
        usageCount: usageCount,
        hierarchyAnalysis: hierarchyAnalysis,
        contactsWithTagsDetails: contactsWithTags.slice(0, 10), // Limiter à 10 pour l'affichage
        timestamp: new Date().toLocaleString()
      });

    } catch (error) {
      console.error('Erreur lors de l\'analyse des tags:', error);
      setError('Erreur lors de l\'analyse des tags: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [currentEntreprise?.id, currentEntreprise?.nom]);

  useEffect(() => {
    if (currentEntreprise?.id) {
      analyzeTagsUsage();
    }
  }, [currentEntreprise?.id, analyzeTagsUsage]);

  if (!currentEntreprise) {
    return (
      <Alert variant="warning">
        <h5>Aucune organisation sélectionnée</h5>
        <p>Veuillez sélectionner une organisation pour utiliser cet outil de debug.</p>
      </Alert>
    );
  }

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>🏷️ Debug Tags Hiérarchie</h4>
        <Button onClick={analyzeTagsUsage} disabled={loading}>
          {loading ? <Spinner size="sm" className="me-2" /> : null}
          {loading ? 'Analyse en cours...' : 'Actualiser l\'analyse'}
        </Button>
      </div>

      {error && (
        <Alert variant="danger">
          <strong>Erreur:</strong> {error}
        </Alert>
      )}

      {debugData && (
        <>
          {/* Informations générales */}
          <Card className="mb-3">
            <Card.Header>
              <h5>📊 Statistiques générales</h5>
            </Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-md-3">
                  <h6>Organisation</h6>
                  <p>{debugData.organizationName}</p>
                  <small className="text-muted">ID: {debugData.organizationId}</small>
                </div>
                <div className="col-md-3">
                  <h6>Contacts</h6>
                  <p>{debugData.totalContacts} au total</p>
                  <p>{debugData.contactsWithTags} avec des tags</p>
                </div>
                <div className="col-md-3">
                  <h6>Tags</h6>
                  <p>{debugData.totalTagsUsed} utilisés</p>
                  <p>{debugData.totalTagsInHierarchy} dans la hiérarchie</p>
                </div>
                <div className="col-md-3">
                  <h6>Dernière analyse</h6>
                  <p>{debugData.timestamp}</p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Tags orphelins */}
          {debugData.orphanTags.length > 0 && (
            <Card className="mb-3">
              <Card.Header className="bg-warning">
                <h5>⚠️ Tags orphelins ({debugData.orphanTags.length})</h5>
                <small>Tags utilisés dans les contacts mais pas présents dans la hiérarchie</small>
              </Card.Header>
              <Card.Body>
                {debugData.orphanTags.map(tag => (
                  <Badge key={tag} bg="warning" className="me-2 mb-2">
                    {tag} ({debugData.usageCount[tag]} utilisations)
                  </Badge>
                ))}
              </Card.Body>
            </Card>
          )}

          {/* Analyse de la hiérarchie */}
          <Card className="mb-3">
            <Card.Header>
              <h5>🌳 Analyse de la hiérarchie</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Tag</th>
                    <th>Niveau</th>
                    <th>Utilisations</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {debugData.hierarchyAnalysis.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ marginLeft: `${item.level * 20}px` }}>
                          {item.color && (
                            <span
                              className="me-2"
                              style={{
                                display: 'inline-block',
                                width: '12px',
                                height: '12px',
                                backgroundColor: item.color,
                                borderRadius: '50%'
                              }}
                            ></span>
                          )}
                          <strong style={{ fontSize: item.level === 0 ? '1rem' : '0.9rem' }}>
                            {item.label}
                          </strong>
                          {item.hasChildren && <small className="text-muted ms-2">(a des enfants)</small>}
                        </div>
                      </td>
                      <td>
                        <Badge bg="secondary">Niveau {item.level}</Badge>
                      </td>
                      <td>
                        <Badge bg={item.usage > 0 ? 'success' : 'light'}>
                          {item.usage}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={item.isUsed ? 'success' : 'secondary'}>
                          {item.isUsed ? 'Utilisé' : 'Non utilisé'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Exemples de contacts avec tags */}
          <Card>
            <Card.Header>
              <h5>👥 Exemples de contacts avec tags</h5>
              <small>Aperçu des {Math.min(10, debugData.contactsWithTagsDetails.length)} premiers contacts</small>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {debugData.contactsWithTagsDetails.map((contact, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{contact.nom}</strong>
                        {contact.prenom && <span> {contact.prenom}</span>}
                        <br />
                        <small className="text-muted">ID: {contact.id}</small>
                      </td>
                      <td>
                        {contact.tags.map(tag => (
                          <Badge
                            key={tag}
                            bg={debugData.orphanTags.includes(tag) ? 'warning' : 'primary'}
                            className="me-1 mb-1"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default TagsHierarchyDebug;