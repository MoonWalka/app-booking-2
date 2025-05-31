import React, { useState, useEffect } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { addTestCoordinatesToLieux } from '@/utils/addCoordinatesToLieux';

const LieuxMapDebug = () => {
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchLieux = async () => {
    try {
      setLoading(true);
      const lieuxQuery = query(collection(db, 'lieux'), limit(10));
      const snapshot = await getDocs(lieuxQuery);
      
      const lieuxData = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        lieuxData.push({
          id: doc.id,
          nom: data.nom,
          adresse: data.adresse,
          ville: data.ville,
          latitude: data.latitude,
          longitude: data.longitude,
          hasCoordinates: !!(data.latitude && data.longitude),
          testCoordinates: data.testCoordinates || false
        });
      });
      
      setLieux(lieuxData);
      console.log('Lieux chargés:', lieuxData);
    } catch (err) {
      console.error('Erreur lors du chargement des lieux:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLieux();
  }, []);

  const handleAddTestCoordinates = async () => {
    setUpdating(true);
    try {
      await addTestCoordinatesToLieux();
      // Recharger les données
      await fetchLieux();
      alert('Coordonnées de test ajoutées avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout des coordonnées:', error);
      alert('Erreur lors de l\'ajout des coordonnées: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>Chargement des lieux...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Debug des cartes des lieux</h3>
      <p>Nombre de lieux trouvés: {lieux.length}</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleAddTestCoordinates}
          disabled={updating}
          style={{
            padding: '10px 20px',
            backgroundColor: updating ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: updating ? 'not-allowed' : 'pointer'
          }}
        >
          {updating ? 'Ajout en cours...' : 'Ajouter coordonnées de test'}
        </button>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Nom</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Ville</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Latitude</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Longitude</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Carte?</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Test?</th>
          </tr>
        </thead>
        <tbody>
          {lieux.map(lieu => (
            <tr key={lieu.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{lieu.nom || 'Sans nom'}</td>
              <td style={{ padding: '8px' }}>{lieu.ville || 'Sans ville'}</td>
              <td style={{ padding: '8px' }}>{lieu.latitude || 'N/A'}</td>
              <td style={{ padding: '8px' }}>{lieu.longitude || 'N/A'}</td>
              <td style={{ padding: '8px' }}>
                {lieu.hasCoordinates ? '✅ Oui' : '❌ Non'}
              </td>
              <td style={{ padding: '8px' }}>
                {lieu.testCoordinates ? '🧪 Test' : '📍 Réel'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ marginTop: '20px' }}>
        <h4>Résumé:</h4>
        <p>Lieux avec coordonnées: {lieux.filter(l => l.hasCoordinates).length}</p>
        <p>Lieux sans coordonnées: {lieux.filter(l => !l.hasCoordinates).length}</p>
      </div>
    </div>
  );
};

export default LieuxMapDebug;