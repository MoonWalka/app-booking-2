import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const ProgrammateursList = () => {
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgrammateurs = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'programmateurs'), orderBy('nom'));
        const querySnapshot = await getDocs(q);
        const programmateursData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProgrammateurs(programmateursData);
      } catch (error) {
        console.error('Erreur lors de la récupération des programmateurs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgrammateurs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce programmateur ?')) {
      try {
        await deleteDoc(doc(db, 'programmateurs', id));
        setProgrammateurs(programmateurs.filter(prog => prog.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression du programmateur:', error);
        alert('Une erreur est survenue lors de la suppression du programmateur');
      }
    }
  };

  if (loading) {
    return <div className="text-center my-5">Chargement des programmateurs...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Liste des programmateurs</h2>
        <Link to="/programmateurs/nouveau" className="btn btn-primary">
          + Ajouter un programmateur
        </Link>
      </div>

      {programmateurs.length === 0 ? (
        <div className="alert alert-info">
          Aucun programmateur n'a été ajouté. Cliquez sur "Ajouter un programmateur" pour commencer.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Structure</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programmateurs.map(prog => (
                <tr key={prog.id}>
                  <td>{prog.nom}</td>
                  <td>{prog.structure || '-'}</td>
                  <td>{prog.email || '-'}</td>
                  <td>{prog.telephone || '-'}</td>
                  <td>
                    <div className="btn-group">
                      <Link to={`/programmateurs/${prog.id}`} className="btn btn-sm btn-outline-primary">
                        Détails
                      </Link>
                      <Link to={`/programmateurs/edit/${prog.id}`} className="btn btn-sm btn-outline-secondary">
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(prog.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        Supprimer
                      </button>
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

export default ProgrammateursList;
