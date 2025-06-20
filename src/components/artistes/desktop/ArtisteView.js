// src/components/artistes/desktop/ArtisteView.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/firebase-service';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import FormHeader from '@/components/ui/FormHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import '@styles/index.css';

/**
 * Composant de vue pour les détails d'un artiste - Version Desktop harmonisée
 * Séparé du composant d'édition pour une meilleure séparation des préoccupations
 */
const ArtisteView = ({ id }) => {
  const navigate = useNavigate();
  const [artiste, setArtiste] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtiste = async () => {
      try {
        const artisteDoc = await getDoc(doc(db, 'artistes', id));
        if (artisteDoc.exists()) {
          const artisteData = {
            id: artisteDoc.id,
            ...artisteDoc.data()
          };
          
          // Charger les concerts liés via la relation bidirectionnelle
          const concertsRef = collection(db, 'concerts');
          const q = query(concertsRef, where('artisteId', '==', id));
          const concertsSnapshot = await getDocs(q);
          
          artisteData.concertsAssocies = concertsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setArtiste(artisteData);
        } else {
          navigate('/artistes');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'artiste:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtiste();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!artiste) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle"></i>
        Artiste non trouvé
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="form-container">
        {/* Header harmonisé avec FormHeader */}
        <FormHeader 
          title={artiste.nom || 'Artiste'}
          icon={<i className="bi bi-music-note-beamed"></i>}
          subtitle={artiste.genre || ''}
          roundedTop={true}
          actions={[
            <Button 
              key="back"
              onClick={() => navigate('/artistes')}
              variant="secondary"
              icon={<i className="bi bi-arrow-left"></i>}
            >
              Retour
            </Button>,
            <Button 
              key="edit"
              onClick={() => navigate(`/artistes/${id}/modifier`)} 
              variant="primary"
              icon={<i className="bi bi-pencil"></i>}
            >
              Modifier
            </Button>
          ]}
        />

        <div className="sections-stack" style={{ padding: 'var(--tc-space-6)' }}>
          {/* Section Photo et Informations principales */}
          <Card 
            title="Informations générales"
            icon={<i className="bi bi-person"></i>}
          >
            <div style={{ display: 'flex', gap: 'var(--tc-space-6)', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0 }}>
                {artiste.photoPrincipale ? (
                  <img 
                    src={artiste.photoPrincipale} 
                    alt={artiste.nom} 
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      objectFit: 'cover', 
                      borderRadius: 'var(--tc-radius-lg)' 
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: '150px', 
                    height: '150px', 
                    backgroundColor: 'var(--tc-color-gray-100)', 
                    borderRadius: 'var(--tc-radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    color: 'var(--tc-color-gray-400)'
                  }}>
                    <i className="bi bi-music-note-beamed"></i>
                  </div>
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 'var(--tc-space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--tc-space-4)', marginBottom: 'var(--tc-space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--tc-space-2)' }}>
                      <i className="bi bi-calendar-event" style={{ color: 'var(--tc-color-primary)' }}></i>
                      <span>{artiste.concertsAssocies?.length || 0} concerts</span>
                    </div>
                    {artiste.cachetMoyen && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--tc-space-2)' }}>
                        <i className="bi bi-cash" style={{ color: 'var(--tc-color-success)' }}></i>
                        <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.cachetMoyen)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {artiste.description && (
                  <div style={{ marginBottom: 'var(--tc-space-4)' }}>
                    <h4 style={{ marginBottom: 'var(--tc-space-2)', color: 'var(--tc-color-primary)' }}>Description</h4>
                    <p style={{ lineHeight: '1.6' }}>{artiste.description}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Section Membres */}
          {artiste.membres && artiste.membres.length > 0 && (
            <Card 
              title="Membres"
              icon={<i className="bi bi-people"></i>}
            >
              <div style={{ display: 'grid', gap: 'var(--tc-space-3)' }}>
                {artiste.membres.map((membre, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: 'var(--tc-space-3)',
                      backgroundColor: 'var(--tc-color-gray-50)',
                      borderRadius: 'var(--tc-radius-base)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontWeight: 'var(--tc-font-weight-medium)' }}>
                      {typeof membre === 'string' ? membre : membre.nom}
                    </span>
                    {typeof membre === 'object' && membre.instrument && (
                      <span style={{ color: 'var(--tc-color-gray-600)' }}>{membre.instrument}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Section Contacts */}
          <Card 
            title="Contacts"
            icon={<i className="bi bi-phone"></i>}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--tc-space-3)' }}>
              {artiste.contacts?.email && (
                <a 
                  href={`mailto:${artiste.contacts.email}`} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--tc-space-2)',
                    padding: 'var(--tc-space-3)',
                    backgroundColor: 'var(--tc-color-primary-50)',
                    color: 'var(--tc-color-primary)',
                    borderRadius: 'var(--tc-radius-base)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className="bi bi-envelope"></i>
                  <span>{artiste.contacts.email}</span>
                </a>
              )}
              {artiste.contacts?.telephone && (
                <a 
                  href={`tel:${artiste.contacts.telephone}`} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--tc-space-2)',
                    padding: 'var(--tc-space-3)',
                    backgroundColor: 'var(--tc-color-success-50)',
                    color: 'var(--tc-color-success)',
                    borderRadius: 'var(--tc-radius-base)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className="bi bi-telephone"></i>
                  <span>{artiste.contacts.telephone}</span>
                </a>
              )}
              {artiste.contacts?.siteWeb && (
                <a 
                  href={artiste.contacts.siteWeb} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--tc-space-2)',
                    padding: 'var(--tc-space-3)',
                    backgroundColor: 'var(--tc-color-info-50)',
                    color: 'var(--tc-color-info)',
                    borderRadius: 'var(--tc-radius-base)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className="bi bi-globe"></i>
                  <span>Site web</span>
                </a>
              )}
            </div>
          </Card>

          {/* Section Réseaux sociaux */}
          {((artiste.contacts?.instagram || artiste.contacts?.facebook) || 
            (artiste.reseauxSociaux && Object.keys(artiste.reseauxSociaux).length > 0)) && (
            <Card 
              title="Réseaux sociaux"
              icon={<i className="bi bi-share"></i>}
            >
              <div style={{ display: 'flex', gap: 'var(--tc-space-3)', flexWrap: 'wrap' }}>
                {artiste.contacts?.instagram && (
                  <a 
                    href={`https://instagram.com/${artiste.contacts.instagram}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--tc-space-2)',
                      padding: 'var(--tc-space-2) var(--tc-space-3)',
                      backgroundColor: 'var(--tc-color-primary-50)',
                      color: 'var(--tc-color-primary)',
                      borderRadius: 'var(--tc-radius-base)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="bi bi-instagram"></i>
                    <span>Instagram</span>
                  </a>
                )}
                {artiste.contacts?.facebook && (
                  <a 
                    href={artiste.contacts.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--tc-space-2)',
                      padding: 'var(--tc-space-2) var(--tc-space-3)',
                      backgroundColor: 'var(--tc-color-primary-50)',
                      color: 'var(--tc-color-primary)',
                      borderRadius: 'var(--tc-radius-base)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="bi bi-facebook"></i>
                    <span>Facebook</span>
                  </a>
                )}
                {artiste.reseauxSociaux && Object.entries(artiste.reseauxSociaux).map(([plateforme, url]) => (
                  url && (
                    <a 
                      key={plateforme} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--tc-space-2)',
                        padding: 'var(--tc-space-2) var(--tc-space-3)',
                        backgroundColor: 'var(--tc-color-primary-50)',
                        color: 'var(--tc-color-primary)',
                        borderRadius: 'var(--tc-radius-base)',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <i className={`bi bi-${plateforme}`}></i>
                      <span>{plateforme}</span>
                    </a>
                  )
                ))}
              </div>
            </Card>
          )}

          {/* Section Concerts */}
          <Card 
            title={`Concerts associés (${artiste.concertsAssocies?.length || 0})`}
            icon={<i className="bi bi-calendar-event"></i>}
            actions={[
              <Button 
                key="new-concert"
                onClick={() => navigate('/concerts/nouveau')} 
                variant="primary"
                size="sm"
                icon={<i className="bi bi-plus-circle"></i>}
              >
                Nouveau concert
              </Button>
            ]}
          >
            {artiste.concertsAssocies && artiste.concertsAssocies.length > 0 ? (
              <div style={{ display: 'grid', gap: 'var(--tc-space-4)' }}>
                {artiste.concertsAssocies.map((concert, index) => (
                  <div 
                    key={index} 
                    style={{
                      padding: 'var(--tc-space-4)',
                      border: '1px solid var(--tc-border-light)',
                      borderRadius: 'var(--tc-radius-base)',
                      backgroundColor: 'var(--tc-color-gray-50)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => navigate(`/concerts/${concert.id}`)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--tc-color-primary-50)';
                      e.target.style.borderColor = 'var(--tc-color-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--tc-color-gray-50)';
                      e.target.style.borderColor = 'var(--tc-border-light)';
                    }}
                  >
                    <h4 style={{ margin: '0 0 var(--tc-space-2) 0', color: 'var(--tc-color-primary)' }}>
                      {concert.titre || 'Concert sans titre'}
                    </h4>
                    <div style={{ display: 'flex', gap: 'var(--tc-space-4)', fontSize: 'var(--tc-font-size-sm)', color: 'var(--tc-color-gray-600)' }}>
                      <span><i className="bi bi-calendar"></i> {new Date(concert.date).toLocaleDateString('fr-FR')}</span>
                      <span><i className="bi bi-geo-alt"></i> {concert.lieu || concert.lieuNom}</span>
                      {concert.montant && (
                        <span><i className="bi bi-cash"></i> {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(concert.montant)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--tc-space-8)', color: 'var(--tc-color-gray-500)' }}>
                <i className="bi bi-calendar-x" style={{ fontSize: '3rem', marginBottom: 'var(--tc-space-2)' }}></i>
                <p>Aucun concert associé pour le moment.</p>
                <Button 
                  onClick={() => navigate('/concerts/nouveau')} 
                  variant="primary"
                  icon={<i className="bi bi-plus-circle"></i>}
                >
                  Créer un concert
                </Button>
              </div>
            )}
          </Card>

          {/* Section Contrats */}
          <Card 
            title="Contrats"
            icon={<i className="bi bi-file-earmark-text"></i>}
          >
            {artiste.contrats && artiste.contrats.length > 0 ? (
              <div style={{ display: 'grid', gap: 'var(--tc-space-3)' }}>
                {artiste.contrats.map((contrat, index) => (
                  <div 
                    key={index} 
                    style={{
                      padding: 'var(--tc-space-3)',
                      border: '1px solid var(--tc-border-light)',
                      borderRadius: 'var(--tc-radius-base)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'var(--tc-font-weight-medium)' }}>
                        {new Date(contrat.dateSignature).toLocaleDateString('fr-FR')}
                      </div>
                      <div style={{ fontSize: 'var(--tc-font-size-sm)', color: 'var(--tc-color-gray-600)' }}>
                        {artiste.concertsAssocies?.find(c => c.id === contrat.concertId)?.lieu || 'Concert inconnu'}
                      </div>
                    </div>
                    {contrat.url && (
                      <a 
                        href={contrat.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          padding: 'var(--tc-space-2)',
                          backgroundColor: 'var(--tc-color-primary)',
                          color: 'white',
                          borderRadius: 'var(--tc-radius-base)',
                          textDecoration: 'none'
                        }}
                      >
                        <i className="bi bi-file-earmark-pdf"></i>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--tc-space-8)', color: 'var(--tc-color-gray-500)' }}>
                <i className="bi bi-file-earmark-plus" style={{ fontSize: '3rem', marginBottom: 'var(--tc-space-2)' }}></i>
                <p>Aucun contrat pour le moment.</p>
              </div>
            )}
          </Card>

          {/* Section Statistiques */}
          <Card 
            title="Statistiques"
            icon={<i className="bi bi-graph-up"></i>}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--tc-space-4)' }}>
              <div style={{
                padding: 'var(--tc-space-4)',
                backgroundColor: 'var(--tc-color-primary-50)',
                borderRadius: 'var(--tc-radius-base)',
                textAlign: 'center'
              }}>
                <i className="bi bi-calendar-check" style={{ fontSize: '2rem', color: 'var(--tc-color-primary)', marginBottom: 'var(--tc-space-2)' }}></i>
                <div style={{ fontSize: 'var(--tc-font-size-lg)', fontWeight: 'var(--tc-font-weight-bold)' }}>
                  {artiste.concertsAssocies?.length || 0}
                </div>
                <div style={{ fontSize: 'var(--tc-font-size-sm)', color: 'var(--tc-color-gray-600)' }}>
                  Concerts totaux
                </div>
              </div>
              
              {artiste.cachetMoyen && (
                <div style={{
                  padding: 'var(--tc-space-4)',
                  backgroundColor: 'var(--tc-color-success-50)',
                  borderRadius: 'var(--tc-radius-base)',
                  textAlign: 'center'
                }}>
                  <i className="bi bi-cash-coin" style={{ fontSize: '2rem', color: 'var(--tc-color-success)', marginBottom: 'var(--tc-space-2)' }}></i>
                  <div style={{ fontSize: 'var(--tc-font-size-lg)', fontWeight: 'var(--tc-font-weight-bold)' }}>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(artiste.cachetMoyen)}
                  </div>
                  <div style={{ fontSize: 'var(--tc-font-size-sm)', color: 'var(--tc-color-gray-600)' }}>
                    Cachet moyen
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArtisteView;