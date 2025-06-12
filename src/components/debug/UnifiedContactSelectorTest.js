import React, { useState } from 'react';
import UnifiedContactSelector from '@/components/common/UnifiedContactSelector';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import styles from './DataStructureFixer.module.css';

/**
 * Page de test pour le composant UnifiedContactSelector
 * Permet de tester toutes les configurations du composant
 */
const UnifiedContactSelectorTest = () => {
  // États pour les différents tests
  const [monoContactValue, setMonoContactValue] = useState(null);
  const [multiContactValue, setMultiContactValue] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [isEditing, setIsEditing] = useState(true);

  // Ajouter un résultat de test
  const addTestResult = (test, result) => {
    setTestResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      test,
      result,
      type: result.includes('Erreur') ? 'error' : 'success'
    }]);
  };

  // Tests prédéfinis
  const runMonoContactTest = () => {
    setMonoContactValue('test-contact-id');
    addTestResult('Mode mono-contact', 'Valeur définie à "test-contact-id"');
  };

  const runMultiContactTest = () => {
    setMultiContactValue(['contact-1', 'contact-2', 'contact-3']);
    addTestResult('Mode multi-contacts', 'Valeurs définies : 3 contacts');
  };

  const runClearTest = () => {
    setMonoContactValue(null);
    setMultiContactValue([]);
    addTestResult('Réinitialisation', 'Toutes les valeurs effacées');
  };

  const runNullValueTest = () => {
    try {
      setMonoContactValue(null);
      addTestResult('Test valeur null', 'Gestion correcte de null');
    } catch (error) {
      addTestResult('Test valeur null', `Erreur : ${error.message}`);
    }
  };

  const runArrayToMonoTest = () => {
    // Tester la conversion d'un tableau vers mono-contact
    const testArray = ['single-contact'];
    setMonoContactValue(testArray[0]);
    addTestResult('Conversion array → mono', `Converti [${testArray}] en "${testArray[0]}"`);
  };

  return (
    <div className={styles.container}>
      <Card title="🧪 Test du composant UnifiedContactSelector" className={styles.card}>
        <div className={styles.description}>
          <p>Cette page permet de tester le composant UnifiedContactSelector dans différentes configurations.</p>
          <Alert type="info">
            Le composant est conçu pour remplacer ContactSearchSection et LieuContactSearchSection
          </Alert>
        </div>

        <div className={styles.section}>
          <h3>⚙️ Configuration des tests</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ marginRight: '1rem' }}>
              <input
                type="checkbox"
                checked={isEditing}
                onChange={(e) => setIsEditing(e.target.checked)}
              />
              Mode édition
            </label>
          </div>

          <div className={styles.actions}>
            <Button onClick={runMonoContactTest} variant="primary">
              Test mono-contact
            </Button>
            <Button onClick={runMultiContactTest} variant="primary">
              Test multi-contacts
            </Button>
            <Button onClick={runNullValueTest} variant="secondary">
              Test valeur null
            </Button>
            <Button onClick={runArrayToMonoTest} variant="secondary">
              Test conversion
            </Button>
            <Button onClick={runClearTest} variant="danger">
              Réinitialiser
            </Button>
          </div>
        </div>
      </Card>

      {/* Test 1 : Mode mono-contact */}
      <Card title="Test 1 : Mode mono-contact (défaut)" className={styles.card}>
        <div className={styles.section}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Configuration :</strong> multiple=false, value={JSON.stringify(monoContactValue)}
          </p>
          
          <UnifiedContactSelector
            value={monoContactValue}
            onChange={(value) => {
              setMonoContactValue(value);
              addTestResult('onChange mono-contact', `Nouvelle valeur : ${JSON.stringify(value)}`);
            }}
            isEditing={isEditing}
            label="Contact unique"
            required={true}
          />

          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <strong>État actuel :</strong>
            <pre>{JSON.stringify({ monoContactValue }, null, 2)}</pre>
          </div>
        </div>
      </Card>

      {/* Test 2 : Mode multi-contacts */}
      <Card title="Test 2 : Mode multi-contacts" className={styles.card}>
        <div className={styles.section}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Configuration :</strong> multiple=true, value={JSON.stringify(multiContactValue)}
          </p>
          
          <UnifiedContactSelector
            multiple={true}
            value={multiContactValue}
            onChange={(value) => {
              setMultiContactValue(value);
              addTestResult('onChange multi-contacts', `Nouvelles valeurs : ${JSON.stringify(value)}`);
            }}
            isEditing={isEditing}
            label="Contacts multiples"
            entityType="test"
            entityId="test-entity"
          />

          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <strong>État actuel :</strong>
            <pre>{JSON.stringify({ multiContactValue }, null, 2)}</pre>
          </div>
        </div>
      </Card>

      {/* Test 3 : Configurations spéciales */}
      <Card title="Test 3 : Configurations spéciales" className={styles.card}>
        <div className={styles.section}>
          <h4>Label personnalisé + non requis</h4>
          <UnifiedContactSelector
            value={null}
            onChange={(value) => addTestResult('Config spéciale', `Valeur : ${value}`)}
            isEditing={isEditing}
            label="Organisateur principal"
            required={false}
          />

          <h4 style={{ marginTop: '2rem' }}>Mode lecture seule avec données</h4>
          <UnifiedContactSelector
            multiple={true}
            value={['contact-demo-1', 'contact-demo-2']}
            onChange={() => {}}
            isEditing={false}
            label="Contacts (lecture seule)"
          />

          <h4 style={{ marginTop: '2rem' }}>Classe CSS personnalisée</h4>
          <UnifiedContactSelector
            value={null}
            onChange={() => {}}
            isEditing={isEditing}
            label="Avec style custom"
            className="custom-test-class"
          />
        </div>
      </Card>

      {/* Test 4 : Cas limites */}
      <Card title="Test 4 : Cas limites et erreurs" className={styles.card}>
        <div className={styles.section}>
          <h4>Valeur string en mode multi-contacts</h4>
          <UnifiedContactSelector
            multiple={true}
            value="single-string-id" // Devrait être converti en ["single-string-id"]
            onChange={(value) => addTestResult('String → Array', `Converti en : ${JSON.stringify(value)}`)}
            isEditing={isEditing}
            label="Test conversion automatique"
          />

          <h4 style={{ marginTop: '2rem' }}>Tableau vide</h4>
          <UnifiedContactSelector
            multiple={true}
            value={[]}
            onChange={(value) => addTestResult('Tableau vide', `Valeur : ${JSON.stringify(value)}`)}
            isEditing={isEditing}
            label="Tableau vide initial"
          />
        </div>
      </Card>

      {/* Journal des tests */}
      {testResults.length > 0 && (
        <Card title="📋 Journal des tests" className={styles.card}>
          <div className={styles.section}>
            <Button 
              onClick={() => setTestResults([])} 
              variant="secondary"
              size="small"
              style={{ marginBottom: '1rem' }}
            >
              Effacer le journal
            </Button>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {testResults.map((result, index) => (
                <Alert 
                  key={index} 
                  type={result.type}
                  style={{ marginBottom: '0.5rem' }}
                >
                  <strong>[{result.timestamp}] {result.test}:</strong> {result.result}
                </Alert>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Documentation rapide */}
      <Card title="📚 Aide-mémoire" className={styles.card}>
        <div className={styles.section}>
          <h4>Props principales :</h4>
          <ul>
            <li><code>multiple</code> : Active le mode multi-contacts</li>
            <li><code>value</code> : String ou Array selon le mode</li>
            <li><code>onChange</code> : Callback (reçoit string ou array)</li>
            <li><code>isEditing</code> : Mode édition ou lecture</li>
            <li><code>label</code> : Texte du label</li>
            <li><code>required</code> : Champ obligatoire</li>
          </ul>

          <h4>Comportements :</h4>
          <ul>
            <li>Normalise automatiquement les valeurs en tableau en interne</li>
            <li>Évite les doublons en mode multi-contacts</li>
            <li>Charge les données depuis Firestore automatiquement</li>
            <li>Gère la création de nouveaux contacts</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default UnifiedContactSelectorTest;