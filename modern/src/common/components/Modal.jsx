import React from 'react';

const Modal = ({ url, onClose }) => {
  return (

    <div className="modal">
      <div className="modal-content">
        <button type="button" className="close-button" onClick={onClose}>Close</button>
        <iframe
          src={url}
          width="600"
          height="450"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen=""
          aria-hidden="false"
          title="SV"
        />
      </div>
    </div>
  );
};

export default Modal;
