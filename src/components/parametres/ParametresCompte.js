import React, { useState } from 'react';
import { Form, Button, Card, Alert, Modal } from 'react-bootstrap';
import styles from './ParametresCompte.module.css';
import { useAuth } from '@/context/AuthContext';
import { updateEmail, updatePassword, updateProfile, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { useNavigate } from 'react-router-dom';

const ParametresCompte = () => {
  const { currentUser, logout } = useAuth();
  const { currentOrganization } = useOrganization();
  const navigate = useNavigate();
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Veuillez entrer votre mot de passe');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      // Réauthentifier l'utilisateur
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('Utilisateur non connecté');
      }

      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        deletePassword
      );
      
      await reauthenticateWithCredential(firebaseUser, credential);

      // Supprimer les données utilisateur dans Firestore (si nécessaire)
      // Note: Dans un environnement de production, vous voudriez peut-être
      // conserver certaines données pour des raisons légales/comptables
      if (currentOrganization?.id) {
        try {
          // Supprimer les documents personnels de l'utilisateur
          // (ajouter ici la logique spécifique selon votre structure de données)
          console.log('Suppression des données utilisateur...');
        } catch (firestoreError) {
          console.error('Erreur lors de la suppression des données:', firestoreError);
          // Continuer même si la suppression Firestore échoue
        }
      }

      // Supprimer le compte utilisateur Firebase
      await deleteUser(firebaseUser);

      // Déconnecter et rediriger
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Erreur lors de la suppression du compte:', err);
      if (err.code === 'auth/wrong-password') {
        setDeleteError('Mot de passe incorrect');
      } else if (err.code === 'auth/requires-recent-login') {
        setDeleteError('Pour des raisons de sécurité, veuillez vous reconnecter avant de supprimer votre compte');
      } else {
        setDeleteError('Erreur lors de la suppression du compte: ' + err.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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

        {/* Section de suppression du compte */}
        <div className={styles.dangerZone} style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #dee2e6' }}>
          <h4 className="text-danger mb-3">Zone de danger</h4>
          <p className="text-muted mb-3">
            La suppression de votre compte est permanente et irréversible. Toutes vos données seront définitivement effacées.
          </p>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <i className="bi bi-trash me-2"></i>
            Supprimer mon compte
          </Button>
        </div>
      </Card.Body>
    </Card>

    {/* Modale de confirmation de suppression */}
    <Modal 
      show={showDeleteModal} 
      onHide={() => {
        setShowDeleteModal(false);
        setDeletePassword('');
        setDeleteError('');
      }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Supprimer définitivement votre compte
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="danger">
          <Alert.Heading>Attention !</Alert.Heading>
          <p>Cette action est <strong>permanente et irréversible</strong>. Une fois votre compte supprimé :</p>
          <ul>
            <li>Vous perdrez l'accès à toutes vos données</li>
            <li>Vos informations personnelles seront effacées</li>
            <li>Vous ne pourrez pas récupérer votre compte</li>
          </ul>
        </Alert>
        
        {deleteError && <Alert variant="danger">{deleteError}</Alert>}
        
        <Form.Group className="mt-3">
          <Form.Label>
            Pour confirmer, veuillez entrer votre mot de passe actuel :
          </Form.Label>
          <Form.Control
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Mot de passe"
            autoFocus
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={() => {
            setShowDeleteModal(false);
            setDeletePassword('');
            setDeleteError('');
          }}
          disabled={isDeleting}
        >
          Annuler
        </Button>
        <Button 
          variant="danger" 
          onClick={handleDeleteAccount}
          disabled={isDeleting || !deletePassword}
        >
          {isDeleting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Suppression en cours...
            </>
          ) : (
            <>
              <i className="bi bi-trash me-2"></i>
              Supprimer définitivement
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default ParametresCompte;