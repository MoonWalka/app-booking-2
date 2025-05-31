import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/services/firebase-service';

/**
 * Version ultra-simplifiée de StructuresList pour test
 * Utilise directement Firebase sans hooks complexes
 */
const StructuresListSimple = () => {
  const navigate = useNavigate();
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStructures = async () => {
      try {
        console.log('📥 Chargement des structures...');
        const structuresRef = collection(db, 'structures');
        const q = query(structuresRef, orderBy('nom', 'asc'));
        const snapshot = await getDocs(q);
        
        const structuresData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('✅ Structures chargées:', structuresData.length);
        setStructures(structuresData);
      } catch (err) {
        console.error('❌ Erreur chargement structures:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStructures();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Structures</h1>
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Structures</h1>
        <div style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>
          Erreur: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Structures ({structures.length})</h1>
        <button 
          onClick={() => navigate('/structures/nouveau')}
          style={{ 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Nouvelle Structure
        </button>
      </div>

      {structures.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Aucune structure trouvée
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Nom
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Type
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Ville
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Contact
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {structures.map(structure => (
                <tr 
                  key={structure.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/structures/${structure.id}`)}
                >
                  <td style={{ padding: '12px', borderBottom: '1px solid #f1f3f5' }}>
                    <strong>{structure.nom || structure.raisonSociale || 'Sans nom'}</strong>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #f1f3f5' }}>
                    <span style={{ 
                      background: '#e3f2fd', 
                      color: '#1976d2', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px' 
                    }}>
                      {structure.type || 'Non défini'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #f1f3f5' }}>
                    {structure.adresse?.ville || structure.ville || '-'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #f1f3f5' }}>
                    {structure.contact?.nom || '-'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #f1f3f5' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/structures/${structure.id}/edit`);
                      }}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        marginRight: '8px'
                      }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Supprimer ${structure.nom || structure.raisonSociale} ?`)) {
                          // TODO: Implémenter la suppression
                          alert('Suppression non implémentée dans cette version de test');
                        }
                      }}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StructuresListSimple;