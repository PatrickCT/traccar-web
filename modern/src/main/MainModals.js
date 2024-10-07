import React, { memo, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Modal from './components/BasicModal';
import LinksPage from '../settings/LinksPage';
import { devicesActions } from '../store';

export const modals = {

};

const MainModals = memo(() => {
  const dispatch = useDispatch();
  const [showModalShareLocation, setShowModalShareLocation] = useState(false);

  useEffect(() => {
    modals.locationModal = (action) => {
      dispatch(devicesActions.selectId(0));
      setShowModalShareLocation(action);
    };
  }, []);

  return (
    <Modal
      isOpen={showModalShareLocation}
      onClose={() => setShowModalShareLocation(false)} // Close modal when the overlay is clicked or Esc is pressed
      contentLabel="Links"
    >
      <LinksPage />
    </Modal>
  );
});

export default MainModals;
