import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import styles from './ParametresCompte.module.css';
import { useAuth } from '@/context/AuthContext';
import { updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { auth } from '@/services/firebase-service';

const ParametresCompte = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePasswordChange = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!validatePasswordChange()) {
        setLoading(false);
        return;
      }

      // Utiliser l'utilisateur Firebase actuel au lieu du cache
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('Utilisateur non connecté');
      }

      // Mettre à jour le nom d'affichage
      if (formData.displayName !== currentUser.displayName) {
        await updateProfile(firebaseUser, {
          displayName: formData.displayName
        });
      }

      // Mettre à jour l'email
      if (formData.email !== currentUser.email) {
        await updateEmail(firebaseUser, formData.email);
      }

      // Mettre à jour le mot de passe
      if (formData.newPassword) {
        await updatePassword(firebaseUser, formData.newPassword);
      }

      setSuccess('Les informations du compte ont été mises à jour avec succès');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Recharger la page pour mettre à jour l'affichage du nom dans la sidebar
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError('Erreur lors de la mise à jour du compte: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Body>
        <h3 className={styles.formTitle}>Compte utilisateur</h3>
        {error && <Alert variant="danger" className={styles.errorAlert}>{error}</Alert>}
        {success && <Alert variant="success" className={styles.successAlert}>{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className={styles.formSection}>
            <Form.Label>Nom d'utilisateur</Form.Label>
            <Form.Control
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Votre nom d'affichage"
            />
            <Form.Text className="text-muted">
              Ce nom sera affiché dans l'interface utilisateur
            </Form.Text>
          </Form.Group>

          <Form.Group className={styles.formSection}>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className={styles.formSection}>
            <Form.Label>Mot de passe actuel</Form.Label>
            <Form.Control
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required={formData.newPassword || formData.email !== currentUser.email}
            />
          </Form.Group>

          <Form.Group className={styles.formSection}>
            <Form.Label>Nouveau mot de passe</Form.Label>
            <div className={styles.passwordField}>
              <Form.Control
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
              />
              <Form.Text className={styles.passwordHint}>
                Laissez vide si vous ne souhaitez pas changer de mot de passe
              </Form.Text>
            </div>
          </Form.Group>

          <Form.Group className={styles.formSection}>
            <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={!formData.newPassword}
            />
          </Form.Group>

          <div className={styles.formActions}>
            <Button
              variant="danger"
              type="button"
              onClick={() => {
                if (window.confirm('Voulez-vous vraiment réinitialiser le formulaire ?')) {
                  setFormData({
                    displayName: currentUser?.displayName || '',
                    email: currentUser?.email || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setError('');
                  setSuccess('');
                }
              }}
            >
              Réinitialiser
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour le compte'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ParametresCompte;