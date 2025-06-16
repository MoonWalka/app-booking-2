import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Debug component to test structure click functionality
 */
const StructuresClickDebug = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStructures = async () => {
      try {
        console.log('🔍 StructuresClickDebug: Loading structures...');
        console.log('🏢 Current organization:', currentOrganization);
        
        const structuresRef = collection(db, 'structures');
        const q = query(structuresRef, limit(5));
        const snapshot = await getDocs(q);
        
        const structuresData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('📋 Loaded structures:', structuresData);
        setStructures(structuresData);
      } catch (err) {
        console.error('❌ Error loading structures:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentOrganization?.id) {
      loadStructures();
    } else {
      console.log('⏳ Waiting for organization...');
      setLoading(false);
    }
  }, [currentOrganization]);

  const handleStructureClick = (structure) => {
    console.log('🖱️ Structure clicked:', structure);
    console.log('🚀 Navigating to:', `/structures/${structure.id}`);
    
    try {
      navigate(`/structures/${structure.id}`);
      console.log('✅ Navigation called successfully');
    } catch (err) {
      console.error('❌ Navigation error:', err);
    }
  };

  const testNavigation = () => {
    console.log('🧪 Testing navigation manually...');
    navigate('/structures/test-id');
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>🔍 Structures Click Debug</h2>
        <p>Loading structures...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>🔍 Structures Click Debug</h2>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>🔍 Structures Click Debug</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Debug Info:</h3>
        <ul>
          <li>Current Organization: {currentOrganization?.id || 'None'}</li>
          <li>Structures Found: {structures.length}</li>
          <li>Current Path: {window.location.pathname}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testNavigation}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Navigation to /structures/test-id
        </button>
      </div>

      <h3>Structures List (Click to Test):</h3>
      {structures.length === 0 ? (
        <p>No structures found</p>
      ) : (
        <div>
          {structures.map((structure, index) => (
            <div
              key={structure.id}
              onClick={() => handleStructureClick(structure)}
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '10px',
                margin: '10px 0',
                cursor: 'pointer',
                backgroundColor: '#f8f9fa'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e9ecef';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
              }}
            >
              <strong>#{index + 1} - {structure.nom || 'Unnamed Structure'}</strong>
              <br />
              <small>ID: {structure.id}</small>
              <br />
              <small>Type: {structure.type || 'No type'}</small>
              {structure.ville && (
                <>
                  <br />
                  <small>Ville: {structure.ville}</small>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StructuresClickDebug;