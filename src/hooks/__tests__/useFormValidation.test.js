// src/hooks/__tests__/useFormValidation.test.js
import { renderHook, act } from '@testing-library/react';
import useFormValidation from '../forms/useFormValidation';

// Désactiver les logs pendant les tests pour éviter de polluer la console
jest.mock('../../utils/logUtils', () => ({
  debugLog: jest.fn()
}));

describe('useFormValidation', () => {
  // Configuration de base pour les tests
  const initialValues = {
    name: '',
    email: '',
    age: '',
    acceptTerms: false
  };

  const validationSchema = {
    name: {
      required: true,
      requiredMessage: 'Le nom est obligatoire',
      min: 2,
      minMessage: 'Le nom doit contenir au moins 2 caractères'
    },
    email: {
      required: true,
      requiredMessage: 'L\'email est obligatoire',
      email: true,
      emailMessage: 'Format d\'email invalide'
    },
    age: {
      required: true,
      requiredMessage: 'L\'âge est obligatoire',
      validate: (value) => {
        const ageNum = Number(value);
        if (isNaN(ageNum)) return 'L\'âge doit être un nombre';
        if (ageNum < 18) return 'Vous devez avoir au moins 18 ans';
        return null;
      }
    },
    acceptTerms: {
      required: true,
      requiredMessage: 'Vous devez accepter les conditions'
    }
  };

  test('devrait initialiser correctement les valeurs et l\'état du formulaire', () => {
    const { result } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema
    }));

    // Vérifier l'état initial
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  test('devrait mettre à jour les valeurs lors des changements', () => {
    const { result } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema
    }));

    // Simuler un changement de valeur via événement
    act(() => {
      result.current.handleChange({
        target: {
          name: 'name',
          value: 'John Doe'
        }
      });
    });

    // Vérifier que la valeur a été mise à jour
    expect(result.current.values.name).toBe('John Doe');

    // Simuler un changement de valeur directement
    act(() => {
      result.current.setFieldValue('email', 'john@example.com');
    });

    // Vérifier que la valeur a été mise à jour
    expect(result.current.values.email).toBe('john@example.com');

    // Vérifier que le formulaire est marqué comme modifié
    expect(result.current.isDirty).toBe(true);
  });

  test('devrait valider correctement les valeurs du formulaire', () => {
    const { result } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema
    }));

    // Valider le formulaire en entier
    act(() => {
      result.current.validateForm();
    });

    // Vérifier les erreurs pour tous les champs requis
    expect(result.current.errors.name).toBe('Le nom est obligatoire');
    expect(result.current.errors.email).toBe('L\'email est obligatoire');
    expect(result.current.errors.age).toBe('L\'âge est obligatoire');
    expect(result.current.errors.acceptTerms).toBe('Vous devez accepter les conditions');
    expect(result.current.isValid).toBe(false);

    // Simuler des changements valides
    act(() => {
      result.current.setFieldValue('name', 'John Doe');
      result.current.setFieldValue('email', 'john@example.com');
      result.current.setFieldValue('age', '25');
      result.current.setFieldValue('acceptTerms', true);
    });

    // Valider à nouveau le formulaire
    act(() => {
      result.current.validateForm();
    });

    // Vérifier qu'il n'y a plus d'erreurs
    expect(Object.keys(result.current.errors).length).toBe(0);
    expect(result.current.isValid).toBe(true);
  });

  test('devrait valider les champs individuellement', () => {
    const { result } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema,
      validateOnChange: true
    }));

    // Tester la validation du champ email
    act(() => {
      result.current.setFieldValue('email', 'invalid-email');
    });

    // Vérifier l'erreur de format d'email
    expect(result.current.errors.email).toBe('Format d\'email invalide');

    // Corriger l'email
    act(() => {
      result.current.setFieldValue('email', 'valid@example.com');
    });

    // Vérifier que l'erreur a été résolue
    expect(result.current.errors.email).toBeUndefined();

    // Tester la validation du champ age avec la fonction personnalisée
    act(() => {
      result.current.setFieldValue('age', '15');
    });

    // Vérifier l'erreur d'âge minimum
    expect(result.current.errors.age).toBe('Vous devez avoir au moins 18 ans');

    // Corriger l'âge
    act(() => {
      result.current.setFieldValue('age', '20');
    });

    // Vérifier que l'erreur a été résolue
    expect(result.current.errors.age).toBeUndefined();
  });

  test('devrait gérer correctement la soumission du formulaire', () => {
    const mockSubmit = jest.fn();
    
    const { result } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema,
      validateOnSubmit: true,
      onSubmit: mockSubmit
    }));

    // Essayer de soumettre un formulaire invalide
    act(() => {
      result.current.handleSubmit();
    });

    // Vérifier que le callback n'a pas été appelé
    expect(mockSubmit).not.toHaveBeenCalled();
    // Vérifier que tous les champs sont maintenant marqués comme touchés
    expect(Object.keys(result.current.touched).length).toBe(4);

    // Remplir le formulaire avec des valeurs valides
    act(() => {
      result.current.setFieldValues({
        name: 'John Doe',
        email: 'john@example.com',
        age: '25',
        acceptTerms: true
      });
    });

    // Soumettre le formulaire valide
    act(() => {
      result.current.handleSubmit();
    });

    // Vérifier que le callback a été appelé avec les bonnes valeurs
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit.mock.calls[0][0]).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      age: '25',
      acceptTerms: true
    });
  });

  test('devrait réinitialiser correctement le formulaire', () => {
    const { result } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema
    }));

    // Modifier le formulaire
    act(() => {
      result.current.setFieldValues({
        name: 'John Doe',
        email: 'john@example.com',
        age: '25',
        acceptTerms: true
      });
    });

    // Vérifier que le formulaire est modifié
    expect(result.current.isDirty).toBe(true);
    expect(result.current.values.name).toBe('John Doe');

    // Réinitialiser le formulaire
    act(() => {
      result.current.resetForm();
    });

    // Vérifier que le formulaire est réinitialisé
    expect(result.current.isDirty).toBe(false);
    expect(result.current.values).toEqual(initialValues);
    expect(Object.keys(result.current.errors).length).toBe(0);
    expect(Object.keys(result.current.touched).length).toBe(0);
  });

  test('devrait gérer correctement les changements de focus (blur)', () => {
    const { result } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema,
      validateOnBlur: true
    }));

    // Simuler un événement blur
    act(() => {
      result.current.handleBlur({
        target: {
          name: 'name',
          value: ''
        }
      });
    });

    // Vérifier que le champ est marqué comme touché
    expect(result.current.touched.name).toBe(true);
    // Vérifier que l'erreur est présente car le champ est requis
    expect(result.current.errors.name).toBe('Le nom est obligatoire');

    // Simuler un autre événement blur avec une valeur valide
    act(() => {
      result.current.setFieldValue('name', 'John');
      result.current.handleBlur({
        target: {
          name: 'name',
          value: 'John'
        }
      });
    });

    // Vérifier que l'erreur a été résolue
    expect(result.current.errors.name).toBeUndefined();
  });

  test('devrait permettre d\'ajouter et de gérer des erreurs manuellement', () => {
    const { result } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema
    }));

    // Ajouter une erreur manuellement
    act(() => {
      result.current.setFieldError('name', 'Erreur personnalisée');
    });

    // Vérifier que l'erreur est présente
    expect(result.current.errors.name).toBe('Erreur personnalisée');

    // Vérifier l'état de validité global
    expect(result.current.isValid).toBe(false);

    // Supprimer l'erreur manuellement
    act(() => {
      result.current.setFieldError('name', null);
    });

    // Vérifier que l'erreur a été supprimée
    expect(result.current.errors.name).toBeNull();
  });
});