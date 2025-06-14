import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import Card from '@components/ui/Card';
import styles from './ArtisteMembersSection.module.css';

/**
 * ArtisteMembersSection - Section de gestion des membres pour le formulaire d'artiste
 * Permet d'ajouter, modifier et supprimer les membres du groupe
 */
const ArtisteMembersSection = ({ 
  formData, 
  handleChange, 
  errors = {},
  showCardWrapper = true 
}) => {
  const [newMember, setNewMember] = useState('');
  
  // Initialiser la liste des membres depuis formData
  const members = formData.membres || [];

  // Ajouter un nouveau membre
  const handleAddMember = () => {
    if (newMember.trim()) {
      const updatedMembers = [...members, newMember.trim()];
      handleChange({
        target: {
          name: 'membres',
          value: updatedMembers
        }
      });
      setNewMember('');
    }
  };

  // Supprimer un membre
  const handleRemoveMember = (index) => {
    const updatedMembers = members.filter((_, i) => i !== index);
    handleChange({
      target: {
        name: 'membres',
        value: updatedMembers
      }
    });
  };

  // Modifier un membre
  const handleEditMember = (index, value) => {
    const updatedMembers = [...members];
    updatedMembers[index] = value;
    handleChange({
      target: {
        name: 'membres',
        value: updatedMembers
      }
    });
  };

  // Gérer l'ajout avec Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMember();
    }
  };

  // Contenu du formulaire réutilisable
  const formContent = (
    <div>
      {/* Ajout de nouveau membre */}
      <Row className="align-items-end">
        <Col md={8}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Ajouter un membre</Form.Label>
            <Form.Control
              type="text"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nom du membre, instrument..."
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Button
            variant="primary"
            className={styles.addButton}
            onClick={handleAddMember}
            disabled={!newMember.trim()}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Ajouter
          </Button>
        </Col>
      </Row>

      {/* Liste des membres */}
      {members.length > 0 && (
        <div className={styles.membersList}>
          <Form.Label className={styles.formLabel}>
            Membres du groupe ({members.length})
          </Form.Label>
          {members.map((member, index) => (
            <div key={index} className={styles.memberItem}>
              <Row className="align-items-center">
                <Col md={9}>
                  <Form.Control
                    type="text"
                    value={member}
                    onChange={(e) => handleEditMember(index, e.target.value)}
                    className={styles.memberInput}
                  />
                </Col>
                <Col md={3} className="text-end">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveMember(index)}
                    className={styles.removeButton}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      )}

      {/* Message vide */}
      {members.length === 0 && (
        <div className={styles.emptyState}>
          <i className="bi bi-people text-muted me-2"></i>
          <span className="text-muted">
            Aucun membre ajouté. Pour un artiste solo, vous pouvez laisser cette section vide.
          </span>
        </div>
      )}
    </div>
  );

  // Version sans carte (pour usage dans des wrappers)
  if (!showCardWrapper) {
    return formContent;
  }

  // Version avec carte (pour usage standalone)
  return (
    <Card
      title="Membres du groupe"
      icon={<i className="bi bi-people"></i>}
      variant="primary"
      className={styles.sectionCard}
    >
      {formContent}
    </Card>
  );
};

export default ArtisteMembersSection;