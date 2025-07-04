/**
 * Composant bouton pour remplir automatiquement avec des données de test
 * Visible uniquement en environnement de développement
 */
import React, { useState } from 'react';
import { Button, Dropdown, Spinner } from 'react-bootstrap';
import { FaFlask, FaBroom, FaPlay } from 'react-icons/fa';
import testDataService from '@/services/testDataServiceSimple';
import { useOrganization } from '@/context/OrganizationContext';
import { toast } from 'react-toastify';

function TestDataButton({ 
  onDataGenerated, 
  onFormFill,
  variant = 'primary',
  size = 'sm',
  mode = 'simple', // 'simple' | 'workflow' | 'form'
  formData = null
}) {
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentOrganization } = useOrganization();

  // Ne pas afficher en production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  /**
   * Génère des données simples pour un formulaire
   */
  const handleGenerateSimpleData = async () => {
    setLoading(true);
    try {
      let data;
      
      switch (mode) {
        case 'programmateur':
          data = testDataService.generateTestProgrammateur();
          break;
        case 'lieu':
          data = testDataService.generateTestLieu();
          break;
        case 'artiste':
          data = testDataService.generateTestArtiste();
          break;
        case 'concert':
          // Pour un concert, on a besoin des IDs
          toast.info('Utilisez le workflow complet pour créer un concert de test');
          return;
        case 'form':
          data = testDataService.generateTestFormData(formData || {});
          break;
        default:
          data = {};
      }

      if (onDataGenerated) {
        onDataGenerated(data);
      }

      if (onFormFill && data) {
        onFormFill(data);
      }

      toast.success('✅ Données de test générées !');
    } catch (error) {
      console.error('Erreur lors de la génération des données:', error);
      toast.error('❌ Erreur lors de la génération des données');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lance le workflow complet de test
   */
  const handleCreateWorkflow = async () => {
    if (!currentOrganization?.id) {
      toast.error('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);
    try {
      const result = await testDataService.createCompleteTestWorkflow(currentOrganization.id);
      
      if (result) {
        toast.success(
          <div>
            <strong>✅ Workflow de test créé !</strong>
            <br />
            <small>
              Artiste: {result.artiste.nom}<br />
              Lieu: {result.lieu.nom}<br />
              Concert: {result.concert.libelle}<br />
              <a href={result.formUrl} target="_blank" rel="noopener noreferrer">
                Ouvrir le formulaire →
              </a>
            </small>
          </div>,
          { autoClose: 10000 }
        );

        if (onDataGenerated) {
          onDataGenerated(result);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création du workflow:', error);
      toast.error('❌ Erreur lors de la création du workflow');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Nettoie toutes les données de test
   */
  const handleCleanup = async () => {
    if (!currentOrganization?.id) {
      toast.error('Aucune organisation sélectionnée');
      return;
    }

    if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer toutes les données de test ?')) {
      return;
    }

    setLoading(true);
    try {
      const count = await testDataService.cleanupTestData(currentOrganization.id);
      toast.success(`🧹 ${count} données de test supprimées`);
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      toast.error('❌ Erreur lors du nettoyage');
    } finally {
      setLoading(false);
    }
  };

  // Mode simple : un seul bouton
  if (mode !== 'workflow') {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleGenerateSimpleData}
        disabled={loading}
        title="Remplir avec des données de test"
      >
        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <>
            <FaFlask className="me-1" />
            Données de test
          </>
        )}
      </Button>
    );
  }

  // Mode workflow : dropdown avec plusieurs options
  return (
    <Dropdown show={showDropdown} onToggle={setShowDropdown}>
      <Dropdown.Toggle
        variant={variant}
        size={size}
        disabled={loading}
      >
        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <>
            <FaFlask className="me-1" />
            Test
          </>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>🧪 Outils de test</Dropdown.Header>
        
        <Dropdown.Item onClick={handleCreateWorkflow}>
          <FaPlay className="me-2 text-success" />
          Créer workflow complet
        </Dropdown.Item>
        
        <Dropdown.Divider />
        
        <Dropdown.Item onClick={handleCleanup} className="text-danger">
          <FaBroom className="me-2" />
          Nettoyer données test
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default TestDataButton;