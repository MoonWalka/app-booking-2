import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import { updateEmail, updatePassword } from 'firebase/auth';

const ParametresCompte = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
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

      if (formData.email !== currentUser.email) {
        await updateEmail(currentUser, formData.email);
      }

      if (formData.newPassword) {
        await updatePassword(currentUser, formData.newPassword);
      }

      setSuccess('Les informations du compte ont été mises à jour avec succès');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError('Erreur lors de la mise à jour du compte: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Body>
        <h3 className="mb-3">Compte utilisateur</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mot de passe actuel</Form.Label>
            <Form.Control
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required={formData.newPassword || formData.email !== currentUser.email}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nouveau mot de passe</Form.Label>
            <Form.Control
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              Laissez vide si vous ne souhaitez pas changer de mot de passe
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={!formData.newPassword}
            />
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center">
            <Button
              variant="danger"
              type="button"
              onClick={() => {
                if (window.confirm('Voulez-vous vraiment réinitialiser le formulaire ?')) {
                  setFormData({
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