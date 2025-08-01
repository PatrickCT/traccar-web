import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from '../../common/components/LocalizationProvider';

const Modal = ({ isOpen, onClose, children, zIndex = 1000, style = {} }) => {
  const t = useTranslation();
  const modalStyle = {
    display: isOpen ? 'block' : 'none',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    zIndex,
    borderRadius: '5px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
    width: '60%',
    height: '60%',
    ...style,
  };

  const overlayStyle = {
    display: isOpen ? 'block' : 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black background
    zIndex: 200, // A lower zIndex than the modal
  };

  // Apply wider width on mobile devices
  const isMobile = window.innerWidth <= 768; // Adjust the breakpoint as needed
  if (isMobile && isOpen) {
    modalStyle.width = '90vw'; // Customize the width for mobile
  }

  if (!isOpen) return null;

  return (
    <div>
      <div className="overlay" style={overlayStyle} />
      <div className="modal" style={modalStyle}>
        <div className="modal-content">
          {children}
          <Button style={{ position: 'fixed', bottom: '0px', left: '0px' }} onClick={onClose}>{t('sharedClose')}</Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
