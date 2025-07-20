import React, { useState } from 'react';
import AddressInput from './AddressInput';
import AddressInputGoogle from './AddressInputGoogle';

/**
 * Composant de test pour comparer LocationIQ et Google Places
 */
const AddressInputTest = () => {
  const [locationIQAddress, setLocationIQAddress] = useState('');
  const [googleAddress, setGoogleAddress] = useState('');
  const [locationIQData, setLocationIQData] = useState(null);
  const [googleData, setGoogleData] = useState(null);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Test de comparaison LocationIQ vs Google Places</h2>
      
      <div style={{ marginBottom: '40px' }}>
        <h3>LocationIQ (actuel)</h3>
        <AddressInput
          label="Adresse avec LocationIQ"
          value={locationIQAddress}
          onChange={(e) => setLocationIQAddress(e.target.value)}
          onAddressSelected={(data) => {
            console.log('LocationIQ data:', data);
            setLocationIQData(data);
          }}
          placeholder="Ex: mairie de pomerol"
        />
        {locationIQData && (
          <pre style={{ background: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
            {JSON.stringify(locationIQData, null, 2)}
          </pre>
        )}
      </div>

      <div>
        <h3>Google Places (nouveau)</h3>
        <AddressInputGoogle
          label="Adresse avec Google Places"
          value={googleAddress}
          onChange={(e) => setGoogleAddress(e.target.value)}
          onAddressSelected={(data) => {
            console.log('Google Places data:', data);
            setGoogleData(data);
          }}
          placeholder="Ex: mairie de pomerol"
        />
        {googleData && (
          <pre style={{ background: '#e8f5e9', padding: '10px', marginTop: '10px' }}>
            {JSON.stringify(googleData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default AddressInputTest;