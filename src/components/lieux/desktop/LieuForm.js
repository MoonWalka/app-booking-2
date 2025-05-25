import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import Spinner from '@/components/common/Spinner';
import Alert from '@/components/ui/Alert';
import styles from './LieuForm.module.css';

// MIGRATION: Utilisation du hook optimisé au lieu du hook complet
import { useLieuForm } from '@/hooks/lieux';
import useLieuDelete from '@/hooks/lieux/useLieuDelete';

// Import sections
import LieuFormHeader from './sections/LieuFormHeader';
import LieuInfoSection from './sections/LieuInfoSection';
import LieuAddressSection from './sections/LieuAddressSection';
import LieuProgrammateurSection from './sections/LieuProgrammateurSection';
import LieuContactSection from './sections/LieuContactSection';
import LieuFormActions from './sections/LieuFormActions';

const LieuForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // MIGRATION: Utilisation du hook optimisé
  const {
    lieu,
    loading,
    error,
    handleChange,
    handleSubmit,
    addressSearch,
    programmateurSearch,
    submitting
  } = useLieuForm(id);

  // Ajout du hook de suppression optimisé
  const {
    isDeleting,
    handleDeleteLieu
  } = useLieuDelete(() => navigate('/lieux'));

  if (loading && id !== 'nouveau') {
    return <Spinner message="Chargement du lieu..." contentOnly={true} />;
  }

  return (
    <div className={styles.lieuFormContainer}>
      <LieuFormHeader id={id} lieuNom={lieu.nom} navigate={navigate} />

      <form onSubmit={handleSubmit} className={styles.modernForm}>
        <div className={styles.sectionsStack}>
          {/* Main venue information */}
          <LieuInfoSection 
            lieu={lieu} 
            handleChange={handleChange} 
          />

          {/* Address and map */}
          <LieuAddressSection 
            lieu={lieu}
            handleChange={handleChange}
            addressSearch={addressSearch}
          />

          {/* Programmateur */}
          <LieuProgrammateurSection 
            programmateurSearch={programmateurSearch}
          />

          {/* Contact information */}
          <LieuContactSection 
            contact={lieu.contact} 
            handleChange={handleChange} 
          />

          {/* Form actions */}
          <LieuFormActions 
            loading={submitting || loading || isDeleting}
            id={id}
            navigate={navigate}
            onDelete={id !== 'nouveau' ? () => handleDeleteLieu(id) : undefined}
            isDeleting={isDeleting}
          />

          {error && (
            <Alert variant="danger" className="d-flex align-items-center gap-2 shadow-sm rounded-3 mb-4">
              <div>{error}</div>
            </Alert>
          )}
        </div>
      </form>
    </div>
  );
};

export default LieuForm;
