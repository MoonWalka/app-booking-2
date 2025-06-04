// src/components/contacts/desktop/sections/ContactConcertsSectionV2.js
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import { collection, query, where, getDocs, db } from '@/services/firebase-service';

/**
 * Section Concerts du contact - Version V2
 */
const ContactConcertsSectionV2 = ({ 
  contactId, 
  isEditMode, 
  navigateToConcertDetails 
}) => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConcerts = async () => {
      if (!contactId) return;
      
      try {
        setLoading(true);
        const q = query(
          collection(db, 'concerts'),
          where('contactId', '==', contactId)
        );
        const snapshot = await getDocs(q);
        const concertsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConcerts(concertsData);
      } catch (error) {
        console.error('Erreur lors du chargement des concerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
  }, [contactId]);
  
  if (loading) {
    return (
      <Card
        title="Concerts associés"
        icon={<i className="bi bi-music-note-list"></i>}
      >
        <div className="text-center">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Concerts associés"
      icon={<i className="bi bi-music-note-list"></i>}
    >
      {concerts && concerts.length > 0 ? (
        <div className="row">
          {concerts.map((concert, index) => (
            <div key={concert.id || index} className="col-md-6 mb-3">
              <div className="border rounded p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{concert.titre || 'Concert sans titre'}</h6>
                    {concert.date && (
                      <small className="text-muted">
                        {new Date(concert.date).toLocaleDateString('fr-FR')}
                      </small>
                    )}
                    {concert.lieuNom && (
                      <div>
                        <small className="text-muted">
                          <i className="bi bi-geo-alt"></i> {concert.lieuNom}
                        </small>
                      </div>
                    )}
                  </div>
                  {!isEditMode && (
                    <button
                      onClick={() => navigateToConcertDetails(concert.id)}
                      className="tc-btn tc-btn-outline-primary tc-btn-sm"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Alert variant="info">
          Aucun concert n'est associé à ce contact.
        </Alert>
      )}
    </Card>
  );
};

export default ContactConcertsSectionV2;