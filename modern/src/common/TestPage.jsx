import React, { useEffect, useState } from 'react';
import MainMap from '../main/MainMap';

const TestPage = () => {
  const [positions, setPositions] = useState([]);
  useEffect(() => {
    fetch('/api/positions', { method: 'GET' })
      .then((response) => response.json())
      .then((data) => setPositions(data));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MainMap
        filteredPositions={positions}
        selectedPosition={positions[0]}
        onEventsClick={() => { }}
      />
    </div>
  );
};

export default TestPage;
