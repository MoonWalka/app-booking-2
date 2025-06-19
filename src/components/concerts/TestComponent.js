import React from 'react';

function TestComponent() {
  console.log('TestComponent rendered!');
  return (
    <div style={{ 
      padding: '50px', 
      backgroundColor: 'red', 
      color: 'white', 
      fontSize: '24px',
      minHeight: '500px'
    }}>
      <h1>TEST COMPONENT WORKING!</h1>
      <p>If you see this red box, the component is rendering.</p>
    </div>
  );
}

export default TestComponent;