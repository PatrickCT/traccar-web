// import { Button } from '@mui/material';
import React from 'react';
// const DebtModal = ({ onClose }) => {
const DebtModal = () => {
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9,
  };

  const modalContentStyle = {
    background: '#fff',
    padding: '20px',
    borderRadius: '5px',
    width: '80%',
    maxWidth: '80%',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',

  };

  const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  };

  const modalBodyStyle = {
    marginBottom: '20px',
    fontSize: 30,
  };

  const modalFooterStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h1>Recordatorio de pagos pendientes</h1>
          {/* You can add a close button or any other elements as needed */}
        </div>
        <div style={modalBodyStyle}>
          <p>
            Usted tiene un saldo pendiente, para continuar usando la plataforma le pedimos que realice su pago, si necesita una aclaración comuniquece con soporte
          </p>
        </div>
        <div style={modalFooterStyle}>
          {/* You can add buttons or links for actions, such as making a payment */}
          {/* <Button onClick={onClose} /> */}
        </div>
      </div>
    </div>
  );
};

export default DebtModal;
