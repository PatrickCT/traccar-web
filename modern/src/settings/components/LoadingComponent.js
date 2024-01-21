import React from 'react';
import { CircularProgress } from '@mui/material';

const LoadingComponent = ({ isLoading, children }) => (
  <div style={{ height: '100%' }}>
    {isLoading ? (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    ) : (
      children
    )}
  </div>
);

export default LoadingComponent;
