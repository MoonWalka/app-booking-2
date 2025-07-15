import React, { useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './ContactsMap.module.css';

// Fix pour les icônes Leaflet dans React/Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Supprimer l'icône par défaut
delete L.Icon.Default.prototype._getIconUrl;

// Définir les nouvelles URLs
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

const ContactsMap = ({ contacts, onContactClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Préparer les adresses pour la carte
  const contactsWithAddresses = useMemo(() => {
    return contacts.filter(contact => {
      const adresse = contact.adresse || '';
      const ville = contact.ville || '';
      const codePostal = contact.codePostal || contact.cp || '';
      return adresse || ville || codePostal;
    }).slice(0, 100); // Limiter à 100 contacts pour la performance
  }, [contacts]);

  // Fonction pour géocoder une adresse (simple approximation basée sur la ville)
  const geocodeAddress = async (contact) => {
    const address = [
      contact.adresse,
      contact.codePostal || contact.cp,
      contact.ville,
      contact.pays || 'France'
    ].filter(Boolean).join(', ');

    try {
      // Utiliser l'API Nominatim d'OpenStreetMap pour le géocodage gratuit
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          address: address,
          contact: contact
        };
      }
    } catch (error) {
      console.error('Erreur de géocodage:', error);
    }
    return null;
  };

  // Initialiser la carte
  useEffect(() => {
    if (!mapRef.current || contactsWithAddresses.length === 0) return;

    // Nettoyer l'ancienne carte si elle existe
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      } catch (e) {
        console.error('Erreur lors de la suppression de la carte:', e);
      }
    }

    // Petit délai pour s'assurer que le DOM est prêt
    const initializeMap = () => {
      if (!mapRef.current) return;

      try {
        // Créer une nouvelle carte
        const map = L.map(mapRef.current, {
          center: [46.603354, 1.888334], // Centre de la France
          zoom: 6,
          preferCanvas: true // Utiliser canvas pour de meilleures performances
        });

        // Ajouter la couche OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;

        // Géocoder et ajouter les marqueurs
        const addMarkers = async () => {
          // Nettoyer les anciens marqueurs
          markersRef.current.forEach(marker => {
            try {
              marker.remove();
            } catch (e) {
              console.error('Erreur lors de la suppression du marqueur:', e);
            }
          });
          markersRef.current = [];

          const bounds = L.latLngBounds();
          let hasValidBounds = false;

          // Géocoder les adresses et ajouter les marqueurs
          for (const contact of contactsWithAddresses.slice(0, 20)) { // Limiter à 20 pour ne pas surcharger l'API
            const geocoded = await geocodeAddress(contact);
            if (geocoded) {
              try {
                const marker = L.marker([geocoded.lat, geocoded.lng])
                  .addTo(map)
                  .bindPopup(`
                    <div style="padding: 10px;">
                      <strong>${contact.displayName || contact.nom}</strong><br/>
                      ${geocoded.address}<br/>
                      <small>${(contact.type === 'structure' || contact.entityType === 'structure') ? 'Structure' : 'Personne'}</small>
                    </div>
                  `);
                
                // Ajouter un événement de clic
                marker.on('click', () => {
                  if (onContactClick) {
                    onContactClick(contact);
                  }
                });

                markersRef.current.push(marker);
                bounds.extend([geocoded.lat, geocoded.lng]);
                hasValidBounds = true;
              } catch (e) {
                console.error('Erreur lors de l\'ajout du marqueur:', e);
              }
            }
            
            // Petit délai pour ne pas surcharger l'API Nominatim
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          // Ajuster la vue pour inclure tous les marqueurs
          if (hasValidBounds) {
            try {
              map.fitBounds(bounds, { padding: [50, 50] });
            } catch (e) {
              console.error('Erreur lors de l\'ajustement de la vue:', e);
            }
          }
        };

        // Attendre que la carte soit complètement initialisée
        map.whenReady(() => {
          addMarkers();
        });

      } catch (e) {
        console.error('Erreur lors de l\'initialisation de la carte:', e);
      }
    };

    // Utiliser un timeout pour s'assurer que le DOM est prêt
    const timeoutId = setTimeout(initializeMap, 100);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {
          console.error('Erreur lors du cleanup de la carte:', e);
        }
      }
    };
  }, [contactsWithAddresses, onContactClick]);

  // Si aucun contact n'a d'adresse, afficher un placeholder
  if (contactsWithAddresses.length === 0) {
    return (
      <div className={styles.mapPlaceholder}>
        <div className={styles.mapContent}>
          <i className="bi bi-geo-alt fs-1 text-muted mb-3"></i>
          <h4>Aucune adresse disponible</h4>
          <p className="text-muted">
            Les contacts n'ont pas d'adresses renseignées pour afficher la carte
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapHeader}>
        <h5>
          <i className="bi bi-geo-alt me-2"></i>
          {contactsWithAddresses.length} contact{contactsWithAddresses.length > 1 ? 's' : ''} avec adresse
        </h5>
        <small className="text-muted">
          Cliquez sur un marqueur pour voir les détails du contact
        </small>
      </div>
      
      <div className={styles.mapWrapper}>
        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            height: '600px',
            position: 'relative',
            zIndex: 1
          }}
        />
      </div>

      {/* Liste des contacts avec adresse */}
      <div className={styles.contactsList}>
        <h6 className="mb-3">Contacts géolocalisés :</h6>
        <div className={styles.contactsGrid}>
          {contactsWithAddresses.map(contact => (
            <div 
              key={contact.id} 
              className={styles.contactCard}
              onClick={() => onContactClick && onContactClick(contact)}
            >
              <div className={styles.contactType}>
                <i className={`bi ${(contact.type === 'structure' || contact.entityType === 'structure') ? 'bi-building' : 'bi-person'} me-1`}></i>
                {(contact.type === 'structure' || contact.entityType === 'structure') ? 'Structure' : 'Personne'}
              </div>
              <h6 className={styles.contactName}>{contact.displayName || contact.nom}</h6>
              <p className={styles.contactAddress}>
                {contact.adresse && <span>{contact.adresse}<br /></span>}
                {(contact.codePostal || contact.cp) && <span>{contact.codePostal || contact.cp} </span>}
                {contact.ville && <span>{contact.ville}</span>}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactsMap;