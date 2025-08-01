import { Alert, Snackbar } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from '../../reactHelper';
import { errorsActions } from '../../store';

const ErrorHandler = () => {
  const dispatch = useDispatch();

  const error = useSelector((state) => state.errors.errors.find(() => true));
  const previousError = usePrevious(error);

  return (
    <Snackbar
      open={!!error}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        elevation={6}
        onClose={() => dispatch(errorsActions.pop())}
        severity="error"
        variant="filled"
        sx={{
          maxWidth: '90vw', // responsive max width
          maxHeight: '40vh', // max height to avoid going out of viewport
          overflowY: 'auto', // enable scrolling if content overflows
          wordBreak: 'break-word', // break long words if needed
        }}
      >
        {error || previousError}
      </Alert>
    </Snackbar>
  );
};

export default ErrorHandler;
