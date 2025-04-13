import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const LieuxList = () => {
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLieux = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'lieux'), orderBy('nom'));
        const querySnapshot = await getDocs(q);
        const lieuxData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLieux(lieuxData);
      } catch (error) {
        console.error('Erreur lors de la récupération des lieux:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLieux();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      try {
        await deleteDoc(doc(db, 'lieux', id));
        setLieux(lieux.filter(lieu => lieu.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression du lieu:', error);
        alert('Une erreur est survenue lors de la suppression du lieu');
      }
    }
  };

  if (loading) {
    return <div className="text-center my-5">Chargement des lieux...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Liste des lieux</h2>
        <Link to="/lieux/nouveau" className="btn btn-primary">
          + Ajouter un lieu
        </Link>
      </div>

      {lieux.length === 0 ? (
        <div className="alert alert-info">
          Aucun lieu n'a été ajouté. Cliquez sur "Ajouter un lieu" pour commencer.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Ville</th>
                <th>Capacité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lieux.map(lieu => (
                <tr key={lieu.id}>
                  <td>{lieu.nom}</td>
                  <td>{lieu.adresse}</td>
                  <td>{lieu.ville}</td>
                  <td>{lieu.capacite || '-'}</td>
                  <td>
  <div className="btn-group action-buttons">
    <ActionButton 
      to={`/lieux/${lieu.id}`} 
      tooltip="Voir les détails" 
      icon={<i className="bi bi-eye" />} 
      variant="light"
    />
    <ActionButton 
      to={`/lieux/edit/${lieu.id}`} 
      tooltip="Modifier le lieu" 
      icon={<i className="bi bi-pencil" />} 
      variant="light"
    />
    <ActionButton 
      tooltip="Supprimer le lieu" 
      icon={<i className="bi bi-trash" />} 
      variant="light" 
      onClick={() => handleDelete(lieu.id)}
    />
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

export default LieuxList;
