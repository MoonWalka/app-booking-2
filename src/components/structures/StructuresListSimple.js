import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

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
        <div style={{ color: 'var(--tc-color-error-600)', background: 'var(--tc-color-error-100)', padding: '10px', borderRadius: '4px' }}>
          Erreur: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Structures ({structures.length})</h1>
        <Button 
          variant="primary"
          onClick={() => navigate('/structures/nouveau')}
        >
          + Nouvelle Structure
        </Button>
      </div>

      {structures.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--tc-color-gray-600)' }}>
          Aucune structure trouvée
        </div>
      ) : (
        <div style={{ background: 'var(--tc-bg-white)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--tc-shadow-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--tc-color-gray-50)' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--tc-color-gray-200)' }}>
                  Nom
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--tc-color-gray-200)' }}>
                  Type
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--tc-color-gray-200)' }}>
                  Ville
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--tc-color-gray-200)' }}>
                  Contact
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--tc-color-gray-200)' }}>
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
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--tc-color-gray-100)' }}>
                    <strong>{structure.nom || structure.raisonSociale || 'Sans nom'}</strong>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--tc-color-gray-100)' }}>
                    <Badge variant="blue" size="sm">
                      {structure.type || 'Non défini'}
                    </Badge>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--tc-color-gray-100)' }}>
                    {structure.adresse?.ville || structure.ville || '-'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--tc-color-gray-100)' }}>
                    {structure.contact?.nom || '-'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid var(--tc-color-gray-100)' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/structures/${structure.id}/edit`);
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Supprimer ${structure.nom || structure.raisonSociale} ?`)) {
                            // TODO: Implémenter la suppression
                            alert('Suppression non implémentée dans cette version de test');
                          }
                        }}
                      >
                        Supprimer
                      </Button>
                    </div>
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