import React from 'react';
import { CircularProgress } from '@mui/material';

const LoadingComponent = ({ isLoading, children, style = {} }) => (
  <div style={{ height: '100%', maxHeight: '100%', ...style }}>
    {isLoading ? (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </div>
    ) : (
      children
    )}
  </div>
);

export default LoadingComponent;
