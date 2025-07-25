// src/pages/ContratsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { Container, Row, Col, Card } from 'react-bootstrap';
import FlexContainer from '@/components/ui/FlexContainer';
import Button from '@/components/ui/Button';
import ContratsTableNew from '@/components/contrats/sections/ContratsTableNew';
import Badge from '@/components/ui/Badge';
import { useResponsive } from '@/hooks/common';
import { useTabs } from '@/context/TabsContext';
import { useEntreprise } from '@/context/EntrepriseContext';
import contratService from '@/services/contratService';
import '@styles/index.css';

const ContratsPage = () => {
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { openTab, openDevisTab, openNewDevisTab, openContratTab } = useTabs();
  const { currentEntreprise } = useEntreprise();

  const fetchContrats = async () => {
    // Vérifier qu'on a bien une entreprise
    if (!currentEntreprise?.id) {
      console.warn('[ContratsPage] Pas d\'entreprise courante');
      setContrats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // IMPORTANT: Filtrer par entrepriseId pour la sécurité
      const contratsQuery = query(
        collection(db, 'contrats'), 
        where('entrepriseId', '==', currentEntreprise.id),
        orderBy('updatedAt', 'desc')
      );
      const contratsSnapshot = await getDocs(contratsQuery);
      
      const contratsPromises = contratsSnapshot.docs.map(async (doc) => {
        const contratData = doc.data();
        
        // Récupérer les données du date associé
        let dateData = null;
        let devisData = null;
        let factureData = null;
        
        if (contratData.dateId) {
          try {
            const dateDoc = await getDocs(query(
              collection(db, 'dates'),
              where('__name__', '==', contratData.dateId)
            ));
            
            if (!dateDoc.empty) {
              const dateDocData = dateDoc.docs[0].data();
              // Vérifier que le date appartient bien à l'entreprise courante
              if (dateDocData.entrepriseId !== currentEntreprise.id) {
                console.warn('[ContratsPage] Date n\'appartient pas à l\'entreprise courante');
                return null; // Ignorer ce contrat
              }
              
              dateData = {
                id: dateDoc.docs[0].id,
                ...dateDocData
              };
              
              // 🔧 CORRECTION: Charger les noms des entités liées si manquants
              const promises = [];
              
              // Charger le nom du lieu si manquant
              if (dateData.lieuId && !dateData.lieuNom) {
                promises.push(
                  getDocs(query(collection(db, 'lieux'), where('__name__', '==', dateData.lieuId)))
                    .then(snapshot => {
                      if (!snapshot.empty) {
                        dateData.lieuNom = snapshot.docs[0].data().nom;
                      }
                    })
                    .catch(err => console.error('Erreur chargement lieu:', err))
                );
              }
              
              // Charger le nom du contact si manquant
              if (dateData.contactId && !dateData.contactNom) {
                promises.push(
                  getDocs(query(collection(db, 'contacts'), where('__name__', '==', dateData.contactId)))
                    .then(snapshot => {
                      if (!snapshot.empty) {
                        dateData.contactNom = snapshot.docs[0].data().nom;
                      }
                    })
                    .catch(err => console.error('Erreur chargement contact:', err))
                );
              }
              
              // Charger le nom de l'artiste si manquant
              if (dateData.artisteId && !dateData.artisteNom) {
                promises.push(
                  getDocs(query(collection(db, 'artistes'), where('__name__', '==', dateData.artisteId)))
                    .then(snapshot => {
                      if (!snapshot.empty) {
                        dateData.artisteNom = snapshot.docs[0].data().nom;
                      }
                    })
                    .catch(err => console.error('Erreur chargement artiste:', err))
                );
              }
              
              // Attendre que tous les chargements soient terminés
              await Promise.all(promises);
            }
          } catch (err) {
            console.error('Erreur lors de la récupération du date:', err);
          }
        }
        
        // Récupérer les données du devis associé si présent
        if (contratData.devisId || dateData?.devisId) {
          try {
            const devisId = contratData.devisId || dateData?.devisId;
            const devisQuery = query(
              collection(db, 'devis'),
              where('__name__', '==', devisId)
            );
            const devisSnapshot = await getDocs(devisQuery);
            
            if (!devisSnapshot.empty) {
              devisData = {
                id: devisSnapshot.docs[0].id,
                ...devisSnapshot.docs[0].data()
              };
            }
          } catch (err) {
            console.error('Erreur lors de la récupération du devis:', err);
          }
        }
        
        // Récupérer les données de la facture associée si présente
        if (contratData.factureId || dateData?.factureId) {
          try {
            const factureId = contratData.factureId || dateData?.factureId;
            const factureQuery = query(
              collection(db, 'factures'),
              where('__name__', '==', factureId)
            );
            const factureSnapshot = await getDocs(factureQuery);
            
            if (!factureSnapshot.empty) {
              factureData = {
                id: factureSnapshot.docs[0].id,
                ...factureSnapshot.docs[0].data()
              };
            }
          } catch (err) {
            console.error('Erreur lors de la récupération de la facture:', err);
          }
        }
        
        // Mapper les données avec toutes les propriétés nécessaires pour ContratsTableNew
        return {
          id: doc.id,
          ...contratData,
          // Propriétés essentielles avec valeurs par défaut
          ref: contratData.ref || contratData.contratNumber || `CONT-${doc.id.slice(0, 6)}`,
          entrepriseCode: contratData.entrepriseCode || 'MR',
          collaborateurCode: contratData.collaborateurCode || '--',
          type: contratData.type || contratData.contratType || 'Standard',
          raisonSociale: contratData.raisonSociale || 
                        contratData.organisateur?.raisonSociale || 
                        dateData?.structureNom || 
                        '--',
          // Données de l'artiste et du lieu
          artiste: contratData.artiste || dateData?.artisteNom || '--',
          artisteNom: dateData?.artisteNom || contratData.artisteNom || '--',
          lieu: dateData?.lieuNom || contratData.lieu || '--',
          ville: contratData.ville || dateData?.ville || '--',
          // Dates
          dateEvenement: dateData?.date || contratData.dateEvenement,
          dateGeneration: contratData.dateGeneration || contratData.createdAt || contratData.updatedAt,
          dateValidite: contratData.dateValidite || contratData.dateEvenement,
          // Montants - Gérer toutes les structures possibles
          totalHT: contratData.montantHT || 
                   contratData.totalHT || 
                   contratData.negociation?.montantNet || 
                   contratData.reglement?.montantHT || 
                   0,
          totalTTC: contratData.montantTTC || 
                    contratData.totalTTC || 
                    contratData.negociation?.montantTTC || 
                    contratData.reglement?.totalTTC || 
                    0,
          montantConsolideHT: contratData.montantConsolideHT || 
                              contratData.montantHT || 
                              contratData.totalHT || 
                              contratData.negociation?.montantNet || 
                              contratData.reglement?.montantHT || 
                              0,
          // Statut normalisé - IMPORTANT: s'assurer que 'generated' est bien géré
          status: contratData.status || (contratData.contratGenere ? 'draft' : null),
          // Statuts d'envoi et signature
          envoye: contratData.envoye || false,
          signe: contratData.signe || false,
          dateSignature: contratData.dateSignature,
          // Données du date pour les actions
          date: dateData,
          dateId: contratData.dateId,
          structureId: dateData?.structureId || contratData.structureId,
          // Informations du devis
          hasDevis: !!devisData,
          devisId: devisData?.id || contratData.devisId,
          devisStatus: devisData?.statut || null,
          devisNumero: devisData?.numero || null,
          // Informations de la facture
          hasFacture: !!factureData,
          factureId: factureData?.id || contratData.factureId,
          factureStatus: factureData?.statut || null,
          factureInfo: factureData ? {
            montantTotal: factureData.montantTTC || factureData.totalTTC || 0,
            montantPaye: factureData.montantPaye || 0,
            dateEcheance: factureData.dateEcheance,
            envoye: factureData.envoye || false
          } : null
        };
      });
      
      const contratsWithData = await Promise.all(contratsPromises);
      // Filtrer les contrats null (ceux qui n'appartiennent pas à l'entreprise)
      const validContrats = contratsWithData.filter(contrat => contrat !== null);
      setContrats(validContrats);
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContrats();
  }, []);

  const handleUpdateContrat = async (contratUpdated) => {
    // Si pas de paramètre, c'est qu'on veut juste rafraîchir (après suppression par exemple)
    if (!contratUpdated) {
      console.log('[ContratsPage] Rafraîchissement des contrats demandé');
      fetchContrats();
      return;
    }
    
    try {
      // Préparer les données à mettre à jour
      const updates = {
        envoye: contratUpdated.envoye,
        signe: contratUpdated.signe,
        updatedAt: new Date()
      };
      
      // Ajouter dateSignature seulement si elle est définie
      if (contratUpdated.dateSignature !== undefined) {
        updates.dateSignature = contratUpdated.dateSignature;
      }
      
      // Mettre à jour le contrat dans Firebase
      await contratService.updateContrat(contratUpdated.id, updates);
      
      // Mettre à jour l'état local après la sauvegarde réussie
      setContrats(prev => 
        prev.map(contrat => 
          contrat.id === contratUpdated.id ? contratUpdated : contrat
        )
      );
      
      console.log('[ContratsPage] Contrat mis à jour:', contratUpdated.id);
    } catch (error) {
      console.error('[ContratsPage] Erreur mise à jour contrat:', error);
      // En cas d'erreur, recharger les contrats pour s'assurer que l'état est correct
      fetchContrats();
    }
  };

  // Handlers pour les factures
  const handleViewFacture = (factureId) => {
    if (openTab) {
      openTab({
        id: `facture-${factureId}`,
        title: `Facture`,
        path: `/factures/${factureId}`,
        component: 'FactureGeneratorPage',
        params: { factureId },
        icon: 'bi-receipt'
      });
    } else {
      navigate(`/factures/${factureId}`);
    }
  };

  const handleGenerateFacture = (dateId, contratId) => {
    if (openTab) {
      const contrat = contrats.find(c => c.id === contratId);
      const structureName = contrat?.raisonSociale || 'Structure';
      openTab({
        id: `facture-generate-${dateId}`,
        title: `Nouvelle facture - ${structureName}`,
        path: `/factures/generate/${dateId}?fromContrat=true`,
        component: 'FactureGeneratorPage',
        params: { dateId, fromContrat: true, contratId },
        icon: 'bi-receipt'
      });
    } else {
      navigate(`/factures/generate/${dateId}?fromContrat=true`);
    }
  };

  // Helper pour obtenir le nom de la structure
  const getStructureName = () => {
    // Dans cette vue générale, on ne peut pas déterminer une structure spécifique
    return 'Structure';
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <FlexContainer justify="space-between" align="center">
            <h2 className="mb-0"><i className="bi bi-file-earmark-text me-2"></i>Contrats</h2>
            <Button 
              variant="primary" 
              onClick={() => navigate('/parametres/contrats')}
            >
              <i className="bi bi-gear me-2"></i>
              Gérer les modèles
            </Button>
          </FlexContainer>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : contrats.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-5 text-center">
            <i className="bi bi-file-earmark-text fs-1 mb-3 text-muted"></i>
            <p className="fs-5">Aucun contrat n'a été généré.</p>
            <p className="text-muted">
              Rendez-vous sur la page de détail d'un date pour générer un contrat.
            </p>
            <Button 
              variant="outline-primary" 
              className="mt-3"
              onClick={() => navigate('/parametres/contrats')}
            >
              <i className="bi bi-file-earmark-text me-2"></i>
              Gérer les modèles de contrats
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          {isMobile ? (
            <div className="mobile-list">
              {contrats.map(contrat => (
                <Card key={contrat.id} className="mb-3 border-0 shadow-sm">
                  <Card.Body 
                    className="p-3" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/contrats/${contrat.id}`)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1 fw-bold">
                          {contrat.date?.titre || 'N/A'}
                        </h6>
                        <small className="text-muted">
                          {contrat.date?.artisteNom && `${contrat.date.artisteNom} • `}
                          {(() => {
                            if (!contrat.dateGeneration) return '-';
                            try {
                              if (contrat.dateGeneration.seconds) {
                                return new Date(contrat.dateGeneration.seconds * 1000).toLocaleDateString('fr-FR');
                              }
                              return new Date(contrat.dateGeneration).toLocaleDateString('fr-FR');
                            } catch (error) {
                              return '-';
                            }
                          })()}
                        </small>
                      </div>
                      {(() => {
                        const getStatusBadge = (status) => {
                          switch (status) {
                            case 'signed':
                              return <Badge variant="green">Signé</Badge>;
                            case 'sent':
                              return <Badge variant="blue">Envoyé</Badge>;
                            case 'generated':
                              return <Badge variant="yellow">Généré</Badge>;
                            default:
                              return <Badge variant="gray">Inconnu</Badge>;
                          }
                        };
                        return getStatusBadge(contrat.status);
                      })()}
                    </div>
                    
                    <div className="small text-muted mb-2">
                      <i className="bi bi-geo-alt me-1"></i>
                      {contrat.date?.lieuNom || 'N/A'}
                    </div>
                    
                    <div className="small text-muted mb-3">
                      <i className="bi bi-person me-1"></i>
                      {contrat.date?.contactNom || 'N/A'}
                    </div>
                    
                    <div className="d-flex gap-2" onClick={e => e.stopPropagation()}>
                      <button 
                        className="btn btn-sm btn-outline-primary flex-fill"
                        onClick={() => navigate(`/contrats/${contrat.id}`)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => navigate(`/contrats/${contrat.id}?preview=web`)}
                      >
                        <i className="bi bi-globe"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => navigate(`/contrats/${contrat.id}/edit`)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-success"
                        onClick={() => window.open(`/contrats/${contrat.id}/download`, '_blank')}
                      >
                        <i className="bi bi-download"></i>
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div data-tour="contrats-table">
              <ContratsTableNew 
              contrats={contrats} 
              onUpdateContrat={handleUpdateContrat}
              openDevisTab={openDevisTab}
              openNewDevisTab={openNewDevisTab}
              openContratTab={openContratTab}
              handleViewFacture={handleViewFacture}
              handleGenerateFacture={handleGenerateFacture}
              getStructureName={getStructureName}
            />
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default ContratsPage;
