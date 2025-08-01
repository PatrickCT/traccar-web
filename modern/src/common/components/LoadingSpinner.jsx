import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fonstSize = null }) => (
  <div style={{ fontSize: fonstSize || 10 }} className="spinner-container">
    <div className="loading-spinner" />
  </div>
);

export default LoadingSpinner;
