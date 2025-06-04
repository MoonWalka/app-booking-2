import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

const AssociationsAudit = () => {
  const [loading, setLoading] = useState(false);
  const [rapport, setRapport] = useState(null);

  const verifierRetourReference = (lieu, contactId) => {
    if (lieu.contactId === contactId) return true;
    if (lieu.contactsAssocies) {
      return lieu.contactsAssocies.some(ref => {
        const id = typeof ref === 'object' ? ref.id : ref;
        return id === contactId;
      });
    }
    return false;
  };

  const verifierRetourReferenceLieu = (contact, lieuId) => {
    const lieuxIds = contact.lieuxIds || contact.lieuxAssocies || [];
    return lieuxIds.some(ref => {
      const id = typeof ref === 'object' ? ref.id : ref;
      return id === lieuId;
    });
  };

  const lancerAudit = async () => {
    setLoading(true);
    
    const newRapport = {
      contacts: [],
      lieux: [],
      incoherences: [],
      statistiques: {
        totalContacts: 0,
        totalLieux: 0,
        contactsAvecLieux: 0,
        lieuxAvecContacts: 0,
        associationsCoherentes: 0,
        referencesOrphelines: 0
      }
    };

    try {
      // Récupérer tous les contacts
      const contactsSnapshot = await getDocs(collection(db, 'contacts'));
      const contacts = contactsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Récupérer tous les lieux
      const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
      const lieux = lieuxSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      newRapport.statistiques.totalContacts = contacts.length;
      newRapport.statistiques.totalLieux = lieux.length;

      // Analyse des contacts
      for (const contact of contacts) {
        const contactAnalyse = {
          id: contact.id,
          nom: contact.contact?.nom || contact.nom || 'Sans nom',
          email: contact.contact?.email || contact.email || '',
          lieuxReferences: [],
          lieuxReelsAssocies: [],
          structureId: contact.structureId || null,
          incoherences: []
        };

        const lieuxIds = contact.lieuxIds || contact.lieuxAssocies || [];
        if (lieuxIds.length > 0) {
          newRapport.statistiques.contactsAvecLieux++;
          
          for (const lieuRef of lieuxIds) {
            const lieuId = typeof lieuRef === 'object' ? lieuRef.id : lieuRef;
            contactAnalyse.lieuxReferences.push(lieuId);
            
            const lieuExiste = lieux.find(l => l.id === lieuId);
            if (lieuExiste) {
              contactAnalyse.lieuxReelsAssocies.push({
                id: lieuId,
                nom: lieuExiste.nom,
                retourReference: verifierRetourReference(lieuExiste, contact.id)
              });
            } else {
              contactAnalyse.incoherences.push(`Lieu ${lieuId} référencé mais n'existe pas`);
              newRapport.statistiques.referencesOrphelines++;
            }
          }
        }

        newRapport.contacts.push(contactAnalyse);
      }

      // Analyse des lieux
      for (const lieu of lieux) {
        const lieuAnalyse = {
          id: lieu.id,
          nom: lieu.nom || 'Sans nom',
          ville: lieu.ville || '',
          contactsReferences: [],
          contactsReelsAssocies: [],
          incoherences: []
        };

        // Méthode 1: contactId
        if (lieu.contactId) {
          newRapport.statistiques.lieuxAvecContacts++;
          lieuAnalyse.contactsReferences.push(lieu.contactId);
          
          const contactExiste = contacts.find(c => c.id === lieu.contactId);
          if (contactExiste) {
            lieuAnalyse.contactsReelsAssocies.push({
              id: lieu.contactId,
              nom: contactExiste.contact?.nom || contactExiste.nom,
              retourReference: verifierRetourReferenceLieu(contactExiste, lieu.id)
            });
          } else {
            lieuAnalyse.incoherences.push(`Contact ${lieu.contactId} référencé mais n'existe pas`);
            newRapport.statistiques.referencesOrphelines++;
          }
        }

        // Méthode 2: contactsAssocies
        if (lieu.contactsAssocies && Array.isArray(lieu.contactsAssocies)) {
          if (lieu.contactsAssocies.length > 0 && !lieu.contactId) {
            newRapport.statistiques.lieuxAvecContacts++;
          }
          
          for (const progRef of lieu.contactsAssocies) {
            const progId = typeof progRef === 'object' ? progRef.id : progRef;
            if (!lieuAnalyse.contactsReferences.includes(progId)) {
              lieuAnalyse.contactsReferences.push(progId);
            }
            
            const contactExiste = contacts.find(c => c.id === progId);
            if (contactExiste) {
              const dejaAjoute = lieuAnalyse.contactsReelsAssocies.find(c => c.id === progId);
              if (!dejaAjoute) {
                lieuAnalyse.contactsReelsAssocies.push({
                  id: progId,
                  nom: contactExiste.contact?.nom || contactExiste.nom,
                  retourReference: verifierRetourReferenceLieu(contactExiste, lieu.id)
                });
              }
            } else {
              lieuAnalyse.incoherences.push(`Contact ${progId} référencé mais n'existe pas`);
              newRapport.statistiques.referencesOrphelines++;
            }
          }
        }

        newRapport.lieux.push(lieuAnalyse);
      }

      // Détection des incohérences bidirectionnelles
      for (const contact of newRapport.contacts) {
        for (const lieuAssocie of contact.lieuxReelsAssocies) {
          if (!lieuAssocie.retourReference) {
            newRapport.incoherences.push({
              type: 'REFERENCE_UNIDIRECTIONNELLE_CONTACT_VERS_LIEU',
              contactId: contact.id,
              contactNom: contact.nom,
              lieuId: lieuAssocie.id,
              lieuNom: lieuAssocie.nom,
              description: `Contact ${contact.nom} référence lieu ${lieuAssocie.nom}, mais le lieu ne référence pas le contact en retour`
            });
          } else {
            newRapport.statistiques.associationsCoherentes++;
          }
        }
      }

      for (const lieu of newRapport.lieux) {
        for (const contactAssocie of lieu.contactsReelsAssocies) {
          if (!contactAssocie.retourReference) {
            newRapport.incoherences.push({
              type: 'REFERENCE_UNIDIRECTIONNELLE_LIEU_VERS_CONTACT',
              lieuId: lieu.id,
              lieuNom: lieu.nom,
              contactId: contactAssocie.id,
              contactNom: contactAssocie.nom,
              description: `Lieu ${lieu.nom} référence contact ${contactAssocie.nom}, mais le contact ne référence pas le lieu en retour`
            });
          }
        }
      }

      setRapport(newRapport);
    } catch (error) {
      console.error('Erreur audit:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (hasRetourReference) => {
    return hasRetourReference ? '✅' : '❌';
  };

  const getStatusColor = (hasRetourReference) => {
    return hasRetourReference ? '#10b981' : '#ef4444';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🔍 Audit Associations Contact ↔ Lieu</h2>
        <button 
          onClick={lancerAudit} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳ Analyse en cours...' : '🚀 Lancer l\'audit'}
        </button>
      </div>

      {rapport && (
        <>
          {/* Statistiques */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px', 
            marginBottom: '30px' 
          }}>
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>
                {rapport.statistiques.totalContacts}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Total contacts</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>
                {rapport.statistiques.totalLieux}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Total lieux</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
                {rapport.statistiques.associationsCoherentes}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Associations cohérentes</div>
            </div>
            <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                {rapport.incoherences.length}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Incohérences</div>
            </div>
          </div>

          {/* Incohérences */}
          {rapport.incoherences.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#dc2626', marginBottom: '15px' }}>❌ Incohérences détectées</h3>
              {rapport.incoherences.map((inc, index) => (
                <div key={index} style={{ 
                  background: '#fef2f2', 
                  border: '1px solid #fecaca', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  marginBottom: '10px' 
                }}>
                  <div style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: '5px' }}>
                    {inc.type.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                    {inc.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Détails par entité */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* Contacts */}
            <div>
              <h3>👥 Contacts (Top 10)</h3>
              {rapport.contacts.slice(0, 10).map(contact => (
                <div key={contact.id} style={{ 
                  background: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px', 
                  padding: '15px', 
                  marginBottom: '15px' 
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    {contact.nom} ({contact.id.substring(0, 8)}...)
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                    Email: {contact.email || 'Non défini'} • Structure: {contact.structureId || 'Non définie'}
                  </div>
                  
                  {contact.lieuxReelsAssocies.length > 0 ? (
                    <>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                        Lieux associés ({contact.lieuxReelsAssocies.length}):
                      </div>
                      {contact.lieuxReelsAssocies.map(lieu => (
                        <div key={lieu.id} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          fontSize: '13px', 
                          marginBottom: '4px',
                          color: getStatusColor(lieu.retourReference)
                        }}>
                          <span style={{ marginRight: '8px' }}>
                            {getStatusIcon(lieu.retourReference)}
                          </span>
                          <span>{lieu.nom}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
                      Aucun lieu associé
                    </div>
                  )}

                  {contact.incoherences.length > 0 && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#dc2626' }}>
                      ⚠️ {contact.incoherences.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Lieux */}
            <div>
              <h3>🗺️ Lieux (Top 10)</h3>
              {rapport.lieux.slice(0, 10).map(lieu => (
                <div key={lieu.id} style={{ 
                  background: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px', 
                  padding: '15px', 
                  marginBottom: '15px' 
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    {lieu.nom} ({lieu.id.substring(0, 8)}...)
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                    Ville: {lieu.ville || 'Non définie'}
                  </div>
                  
                  {lieu.contactsReelsAssocies.length > 0 ? (
                    <>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                        Contacts associés ({lieu.contactsReelsAssocies.length}):
                      </div>
                      {lieu.contactsReelsAssocies.map(contact => (
                        <div key={contact.id} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          fontSize: '13px', 
                          marginBottom: '4px',
                          color: getStatusColor(contact.retourReference)
                        }}>
                          <span style={{ marginRight: '8px' }}>
                            {getStatusIcon(contact.retourReference)}
                          </span>
                          <span>{contact.nom}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
                      Aucun contact associé
                    </div>
                  )}

                  {lieu.incoherences.length > 0 && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#dc2626' }}>
                      ⚠️ {lieu.incoherences.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AssociationsAudit;