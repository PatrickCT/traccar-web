import React from 'react';
import './Loading.css';

const Loading = ({ type = '01' }) => (
  <div className="loader">
    <div className={`loading loading${type}`}>
      <span>C</span>
      <span>A</span>
      <span>R</span>
      <span>G</span>
      <span>A</span>
      <span>N</span>
      <span>D</span>
      <span>O</span>
    </div>
  </div>
);

export default Loading;
