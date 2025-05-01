import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { useLocationIQ } from '@/hooks/common/useLocationIQ';
import Spinner from '@/components/common/Spinner';
import styles from './LieuForm.module.css';

// Import custom hooks
import { useLieuForm } from '@/hooks/lieux/useLieuForm';
import { useAddressSearch } from '@/hooks/lieux/useAddressSearch';
import { useProgrammateurSearch } from '@/hooks/lieux/useProgrammateurSearch';

// Import sections
import LieuFormHeader from './sections/LieuFormHeader';
import LieuInfoSection from './sections/LieuInfoSection';
import LieuAddressSection from './sections/LieuAddressSection';
import LieuProgrammateurSection from './sections/LieuProgrammateurSection';
import LieuContactSection from './sections/LieuContactSection';
import LieuFormActions from './sections/LieuFormActions';

const LieuForm = () => {
  const navigate = useNavigate();
  
  // Use custom hooks
  const {
    id,
    lieu,
    setLieu,
    loading,
    error,
    handleChange,
    validateForm,
    handleSubmit
  } = useLieuForm();
  
  // Use additional hooks
  const { isLoading: isApiLoading } = useLocationIQ();
  const addressSearch = useAddressSearch(lieu, setLieu);
  const programmateurSearch = useProgrammateurSearch(lieu, setLieu);

  if (loading && id !== 'nouveau') {
    return <Spinner message="Chargement du lieu..." contentOnly={true} />;
  }

  if (isApiLoading) {
    return <Spinner message="Chargement de l'API de géolocalisation..." contentOnly={true} />;
  }

  return (
    <div className={styles.lieuFormContainer}>
      <LieuFormHeader id={id} lieuNom={lieu.nom} navigate={navigate} />

      <form onSubmit={handleSubmit} className={styles.modernForm}>
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
          loading={loading}
          id={id}
          navigate={navigate}
        />

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 shadow-sm rounded-3 mb-4">
            <i className="bi bi-exclamation-triangle-fill fs-5 text-danger me-2"></i>
            <div>{error}</div>
          </div>
        )}
      </form>
    </div>
  );
};

export default LieuForm;
