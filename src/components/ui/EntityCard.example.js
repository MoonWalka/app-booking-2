// Exemple d'utilisation du composant EntityCard
import React from 'react';
import { useNavigate } from 'react-router-dom';
import EntityCard from './EntityCard';

/**
 * Exemples d'utilisation du composant EntityCard
 */
function EntityCardExamples() {
  const navigate = useNavigate();

  // Handlers de navigation
  const handleArtisteClick = (id) => navigate(`/artistes/${id}`);
  const handleContactClick = (id) => navigate(`/contacts/${id}`);
  const handleStructureClick = (id) => navigate(`/structures/${id}`);
  const handleLieuClick = (id) => navigate(`/lieux/${id}`);
  const handleConcertClick = (id) => navigate(`/concerts/${id}`);

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
      gap: '16px',
      padding: '24px'
    }}>
      
      {/* Artiste */}
      <EntityCard
        entityType="artiste"
        name="Jean Dupont"
        subtitle="Chanteur"
        onClick={() => handleArtisteClick('artist-123')}
      />

      {/* Contact */}
      <EntityCard
        entityType="contact"
        name="Marie Martin"
        subtitle="Organisatrice"
        onClick={() => handleContactClick('contact-456')}
      />

      {/* Structure */}
      <EntityCard
        entityType="structure"
        name="Salle de Concert ABC"
        subtitle="Salle de spectacle"
        onClick={() => handleStructureClick('struct-789')}
      />

      {/* Lieu */}
      <EntityCard
        entityType="lieu"
        name="Place de la République"
        subtitle="Place publique"
        onClick={() => handleLieuClick('lieu-101')}
      />

      {/* Concert */}
      <EntityCard
        entityType="concert"
        name="Concert Rock Festival"
        subtitle="Événement musical"
        onClick={() => handleConcertClick('concert-112')}
      />

      {/* Avec icône personnalisée */}
      <EntityCard
        entityType="artiste"
        name="Groupe de Jazz"
        subtitle="Formation musicale"
        icon={<span>🎷</span>}
        onClick={() => handleArtisteClick('artist-jazz')}
      />

      {/* Carte désactivée */}
      <EntityCard
        entityType="contact"
        name="Contact archivé"
        subtitle="Non disponible"
        disabled={true}
        onClick={() => console.log('Clic désactivé')}
      />

      {/* Nom très long (test de troncature) */}
      <EntityCard
        entityType="structure"
        name="Nom de structure très très long qui devrait être tronqué automatiquement"
        subtitle="Lieu avec nom très long"
        onClick={() => handleStructureClick('struct-long')}
      />

    </div>
  );
}

export default EntityCardExamples;