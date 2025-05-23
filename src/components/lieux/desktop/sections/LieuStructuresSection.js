import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '@/firebaseInit';
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  query, 
  collection, 
  getDocs, 
  limit 
} from 'firebase/firestore';
import { Spinner } from 'react-bootstrap';
import Button from '@ui/Button';
import Card from '@/components/ui/Card';
import styles from './LieuStructuresSection.module.css';

/**
 * Component to display and manage structures associated with a venue
 */
export const LieuStructuresSection = ({ lieu, isEditing = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [structures, setStructures] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const dropdownRef = useRef(null);

  // Charger les structures associées au lieu
  useEffect(() => {
    const fetchAssociatedStructures = async () => {
      if (!lieu || !lieu.id) return;
      
      setLoading(true);
      try {
        // Si le lieu a des structures associées
        if (lieu.structuresIds && lieu.structuresIds.length > 0) {
          // Query pour récupérer toutes les structures associées
          const structuresPromises = lieu.structuresIds.map(structureId => 
            doc(db, 'structures', structureId).get()
          );
          
          const structureDocs = await Promise.all(structuresPromises);
          const structuresData = structureDocs
            .filter(doc => doc.exists())
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          
          setStructures(structuresData);
        } else {
          setStructures([]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des structures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssociatedStructures();
  }, [lieu]);

  // Recherche de structures
  useEffect(() => {
    const searchStructures = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const searchTermLower = searchTerm.toLowerCase();
        
        // Créer une requête pour rechercher des structures par nom
        const q = query(
          collection(db, 'structures'),
          limit(10)
        );

        const querySnapshot = await getDocs(q);
        const results = [];
        
        querySnapshot.forEach((doc) => {
          const structure = {
            id: doc.id,
            ...doc.data()
          };
          
          // Filtre côté client pour plus de flexibilité
          if (structure.nom && structure.nom.toLowerCase().includes(searchTermLower)) {
            results.push(structure);
          }
        });
        
        // Filtrer les structures déjà associées
        const filteredResults = results.filter(result => 
          !lieu.structuresIds || !lieu.structuresIds.includes(result.id)
        );
        
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Erreur lors de la recherche de structures:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchStructures();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, lieu]);

  // Gestionnaire de clic extérieur pour fermer la liste déroulante
  useEffect(() => {
    if (!isEditing) return;
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  // Sélectionner une structure
  const handleSelectStructure = async (structure) => {
    try {
      // Mettre à jour le document du lieu avec la nouvelle structure
      const lieuRef = doc(db, 'lieux', lieu.id);
      await updateDoc(lieuRef, {
        structuresIds: arrayUnion(structure.id)
      });
      
      // Mettre à jour l'UI
      setStructures(prev => [...prev, structure]);
      setSearchResults([]);
      setSearchTerm('');
    } catch (error) {
      console.error('Erreur lors de l\'association de la structure:', error);
    }
  };

  // Supprimer l'association avec une structure
  const handleRemoveStructure = async (structureId) => {
    try {
      // Mettre à jour le document du lieu en supprimant la structure
      const lieuRef = doc(db, 'lieux', lieu.id);
      await updateDoc(lieuRef, {
        structuresIds: arrayRemove(structureId)
      });
      
      // Mettre à jour l'UI
      setStructures(prev => prev.filter(s => s.id !== structureId));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'association:', error);
    }
  };

  // Naviguer vers la création d'une nouvelle structure
  const handleCreateStructure = () => {
    navigate('/structures/nouveau', { 
      state: { 
        returnTo: `/lieux/${lieu.id}`,
        preselectedLieu: {
          id: lieu.id,
          nom: lieu.nom
        }
      }
    });
  };

  return (
    <Card
      title="Structures associées"
      icon={<i className="bi bi-diagram-3"></i>}
      isEditing={isEditing}
      isHoverable={!isEditing}
      headerActions={
        isEditing ? (
          <div className={styles.headerActions}>
            <Button
              size="sm"
              variant="outline-primary"
              onClick={handleCreateStructure}
              title="Associer une structure à ce lieu"
            >
              <i className="bi bi-plus-lg"></i>
              <span className="d-none d-sm-inline ms-1">Associer une structure</span>
            </Button>
          </div>
        ) : null
      }
    >
      {loading ? (
        <Spinner animation="border" size="sm" />
      ) : (
        <div className={styles.structuresListContainer}>
          {structures.length > 0 ? (
            structures.map(structure => (
              <div key={structure.id} className={styles.structureItem}>
                <Link to={`/structures/${structure.id}`}>{structure.nom}</Link>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline-danger"
                    className="ms-2"
                    onClick={() => handleRemoveStructure(structure.id)}
                    title="Retirer cette structure du lieu"
                  >
                    <i className="bi bi-x-lg"></i>
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className={styles.textEmpty}>Aucune structure associée.</div>
          )}
        </div>
      )}
    </Card>
  );
};

export default LieuStructuresSection;
