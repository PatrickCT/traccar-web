/* eslint-disable no-unused-vars */
import { Box } from '@mui/material';
import React, { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBaseURL } from '../common/util/utils';
import ExitsPage from '../other/ExitsPage';
import { modalsActions } from '../store/modals';
import Modal from './components/BasicModal';

const style = {
  position: 'absolute',
  top: '5%',
  left: '5%',
  transform: 'translate(-5%, -5%)',
  width: '100%',
  height: '100%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ManualExitsModal = memo(() => {
  const dispatch = useDispatch();
  const showModalManualExits = useSelector((state) => state.modals?.items?.showModalManualExits);

  return (
    <Modal
      isOpen={showModalManualExits}
      onClose={() => {
        dispatch(modalsActions.update({ showModalManualExits: false }));
      }} // Close modal when the overlay is clicked or Esc is pressed
      contentLabel="Salidas manuales"
      style={{ height: '90%', width: '80%' }}
    >
      <Box sx={style}>
        <ExitsPage showMenu={false} />
      </Box>
    </Modal>
  );
});

export default ManualExitsModal;
