// components/contacts/EchangeForm.js
import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { TYPES_ECHANGES, STATUTS_ECHANGES } from '@/services/historiqueEchangesService';
import styles from './EchangeForm.module.css';

/**
 * Formulaire pour ajouter ou éditer un échange
 */
function EchangeForm({ echange, onSubmit, onCancel, dates = [], isSubmitting = false }) {
  const [formData, setFormData] = useState({
    type: TYPES_ECHANGES.EMAIL,
    statut: STATUTS_ECHANGES.PLANIFIE,
    date: new Date().toISOString().slice(0, 16),
    sujet: '',
    contenu: '',
    rappel: '',
    dateId: ''
  });

  const [errors, setErrors] = useState({});

  // Initialiser avec les données de l'échange si en mode édition
  useEffect(() => {
    if (echange) {
      const dateValue = echange.date ? 
        (echange.date.toDate ? echange.date.toDate() : new Date(echange.date))
          .toISOString().slice(0, 16) : '';
      
      const rappelValue = echange.rappel ? 
        (echange.rappel.toDate ? echange.rappel.toDate() : new Date(echange.rappel))
          .toISOString().slice(0, 16) : '';

      setFormData({
        type: echange.type || TYPES_ECHANGES.EMAIL,
        statut: echange.statut || STATUTS_ECHANGES.PLANIFIE,
        date: dateValue,
        sujet: echange.sujet || '',
        contenu: echange.contenu || '',
        rappel: rappelValue,
        dateId: echange.dateId || ''
      });
    }
  }, [echange]);

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.sujet.trim()) {
      newErrors.sujet = 'Le sujet est requis';
    }

    if (!formData.date) {
      newErrors.date = 'La date est requise';
    }

    if (formData.rappel && new Date(formData.rappel) <= new Date()) {
      newErrors.rappel = 'La date de rappel doit être dans le futur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler pour les changements
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dataToSubmit = {
      ...formData,
      date: new Date(formData.date),
      rappel: formData.rappel ? new Date(formData.rappel) : null,
      dateId: formData.dateId || null
    };

    console.log('[EchangeForm] Soumission avec données:', dataToSubmit);
    await onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.row}>
        <FormField 
          label="Type d'échange" 
          required
          type="select"
          name="type"
          value={formData.type}
          onChange={handleChange}
        >
          {Object.entries(TYPES_ECHANGES).map(([key, value]) => (
            <option key={key} value={value}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </option>
          ))}
        </FormField>

        <FormField 
          label="Statut" 
          required
          type="select"
          name="statut"
          value={formData.statut}
          onChange={handleChange}
        >
          {Object.entries(STATUTS_ECHANGES).map(([key, value]) => (
            <option key={key} value={value}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </option>
          ))}
        </FormField>
      </div>

      <div className={styles.row}>
        <FormField 
          label="Date et heure" 
          error={errors.date} 
          required
          type="datetime-local"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />

        <FormField 
          label="Date lié (optionnel)"
          type="select"
          name="dateId"
          value={formData.dateId}
          onChange={handleChange}
        >
          <option value="">Aucun concert</option>
          {dates && dates.length > 0 ? (
            dates.map(concert => {
              const dateDate = concert.date?.toDate ? concert.date.toDate() : new Date(concert.date);
              return (
                <option key={concert.id} value={concert.id}>
                  {concert.titre || 'Sans titre'} - {dateDate.toLocaleDateString('fr-FR')}
                </option>
              );
            })
          ) : (
            <option disabled>Aucun date disponible</option>
          )}
        </FormField>
      </div>

      <FormField 
        label="Sujet" 
        error={errors.sujet} 
        required
        type="text"
        name="sujet"
        value={formData.sujet}
        onChange={handleChange}
        placeholder={`Ex: ${
          formData.type === TYPES_ECHANGES.EMAIL ? 'Proposition de concert' :
          formData.type === TYPES_ECHANGES.APPEL ? 'Discussion tarifs' :
          formData.type === TYPES_ECHANGES.REUNION ? 'Réunion de programmation' :
          'Échange avec le contact'
        }`}
      />

      <FormField 
        label="Notes / Contenu"
        type="textarea"
        name="contenu"
        value={formData.contenu}
        onChange={handleChange}
        placeholder="Détails de l'échange, points importants discutés, actions à suivre..."
      />

      <FormField 
        label="Rappel (optionnel)" 
        error={errors.rappel}
        type="datetime-local"
        name="rappel"
        value={formData.rappel}
        onChange={handleChange}
        min={new Date().toISOString().slice(0, 16)}
        helpText={formData.rappel ? "Un rappel sera affiché à cette date" : ""}
      />

      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'En cours...' : `${echange ? 'Modifier' : 'Ajouter'} l'échange`}
        </Button>
      </div>
    </form>
  );
}

export default EchangeForm;