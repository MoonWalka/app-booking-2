import React from 'react';
import { useModal } from '@/context/ModalContext';
import styles from './ModalExample.module.css';

// Exemple de composant à afficher dans une modale
const ModalContent = ({ title, message, closeModal }) => {
  return (
    <div className={styles.modalContent}>
      <h3 className={styles.modalTitle}>{title}</h3>
      <p className={styles.modalMessage}>{message}</p>
      <div className={styles.modalActions}>
        <button 
          className={styles.modalButton} 
          onClick={closeModal}
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

// Exemple de formulaire à afficher dans une modale
const ModalForm = ({ onSubmit, closeModal }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    closeModal();
  };

  return (
    <div className={styles.modalContent}>
      <h3 className={styles.modalTitle}>Formulaire exemple</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Nom</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.modalActions}>
          <button 
            type="button" 
            onClick={closeModal}
            className={styles.modalButtonSecondary}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className={styles.modalButton}
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
};

// Composant principal qui démontre l'utilisation des modales
const ModalExample = () => {
  const { openModal } = useModal();

  // Fonction pour ouvrir une modale simple
  const openSimpleModal = () => {
    openModal({
      component: ModalContent,
      props: {
        title: 'Exemple de modale simple',
        message: 'Voici un exemple de modale simple avec un message et un bouton de fermeture.'
      },
      modalProps: {
        title: 'Information',
        size: 'sm'
      }
    });
  };

  // Fonction pour ouvrir une modale avec un formulaire
  const openFormModal = () => {
    openModal({
      component: ModalForm,
      props: {
        onSubmit: (data) => {
          console.log('Données du formulaire:', data);
          // Ouvrir une autre modale pour confirmer la soumission
          openModal({
            component: ModalContent,
            props: {
              title: 'Formulaire soumis',
              message: `Merci ${data.name} ! Votre formulaire a été soumis avec succès.`
            },
            modalProps: {
              title: 'Confirmation',
              size: 'sm'
            }
          });
        }
      },
      modalProps: {
        title: 'Formulaire',
        size: 'md',
        closeOnClickOutside: false
      }
    });
  };

  return (
    <div className={styles.exampleContainer}>
      <h2 className={styles.exampleTitle}>Démonstration du système de modales</h2>
      <div className={styles.buttonGroup}>
        <button 
          onClick={openSimpleModal}
          className={styles.button}
        >
          Ouvrir une modale simple
        </button>
        <button 
          onClick={openFormModal}
          className={styles.button}
        >
          Ouvrir une modale avec formulaire
        </button>
      </div>
    </div>
  );
};

export default ModalExample;