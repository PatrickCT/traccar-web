// import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
// const DebtModal = ({ onClose }) => {
const DebtModal = () => {
  const userId = useSelector((state) => state.session.user.id);

  let lh = 0.7;
  let f = 50;
  let w = 80;
  let h = 80;

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    h = 90;
    f = 35;
    lh = 0.9;
    w = 95;
  }

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9,
  };

  const modalContentStyle = {
    background: '#fff',
    padding: '20px',
    borderRadius: '25px',
    width: `${w}%`,
    height: `${h}%`,
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    backgroundColor: 'rgb(40 72 113 / 80%)',
    fontSize: f,
    lineHeight: lh,
  };

  const modalBodyStyle = {
    fontSize: f,
  };

  const paragraphStyle = {
    textAlign: 'center',
    fontSize: `${f}px`,
    lineHeight: `${lh}`,
  };

  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`http://45.79.45.108:4040/api/external/${userId}`)
      .then((response) => response.json())
      .then((data) => setResult(data));
  }, []);

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={modalBodyStyle}>
          <p style={paragraphStyle}>
            <span style={{ color: '#ffffff' }}>
              <strong>SU CUENTA PRESENTA UN PAGO PENDIENTE</strong>
            </span>
          </p>
          <p style={paragraphStyle}>
            <span style={{ color: '#000000' }}>
              <strong>IMPORTE: </strong>
            </span>
            <span style={{ color: '#ffffff' }}>$</span>
            <span style={{ color: '#ffffff' }}>{result?.data?.debt}</span>
          </p>
          <p style={paragraphStyle}>
            <span style={{ color: '#ff0000' }}>
              <strong>PAGUE A TRAV&Eacute;Z DE:</strong>
            </span>
          </p>
          <p style={paragraphStyle}>
            <span style={{ color: '#000000' }}>
              <strong>TRANSFERENCIA</strong>
            </span>
          </p>
          <p style={paragraphStyle}>
            <span style={{ color: '#ffffff' }}>
              <strong>{result?.data?.stp}</strong>
            </span>
          </p>
          <p style={paragraphStyle}>
            <span style={{ color: '#000000' }}>
              <strong>LINK DE PAGO</strong>
            </span>
          </p>
          <p style={paragraphStyle}>
            <a style={{ color: '#ffffff' }} href="https://clip.mx/@gpstrackermx" target="_blank" rel="noreferrer">
              <strong>https://clip.mx/@gpstrackermx</strong>
            </a>
          </p>
          <p style={paragraphStyle}>
            <span style={{ color: '#ffffff' }}>
              <strong>
                MAYORES INFORMES:
                <a style={{ color: 'inherit' }} href="tel:4434521162"> 4434521162 </a>
                EXT. 3
              </strong>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DebtModal;
