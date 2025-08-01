/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import Modal from 'react-modal';
import VideoPlayer from './VideoPlayer'; // Your VideoPlayer component

// Style overrides for the modal
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',

  },
  modalheader: {
    display: 'flex',
    justifContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgrounColor: '#f2f2f2',
    bordeBbottom: '1px solid #ccc',
  },
  closebutton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#333',
    top: 60,
    right: 20,
    position: 'absolute',
  },
};

const VideoModal = ({ videoUrl, onClose }) => (
  <Modal
    isOpen // The modal is open
    onRequestClose={onClose} // Close modal when the overlay is clicked or Esc is pressed
    style={customStyles.content}
    contentLabel="Video Modal"
  >
    <div style={customStyles.modalheader} className="modal-header">
      <h2>Video</h2>
      <button style={customStyles.closebutton} type="button" onClick={onClose} className="close-button">
        X
      </button>
    </div>
    <div className="video-container">
      <VideoPlayer videoSrc={videoUrl} controls styled />
    </div>
  </Modal>
);

export default VideoModal;
