import { Alert, LinearProgress, Link, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react';


export function CustomSnackbar({ notification, onClose }: {
  notification: { id: string, show: boolean, message: string, position: any, snackBarDurationMs: number },
  onClose: () => void
}) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!notification.show) return;

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const newProgress = Math.max(0, 100 - (elapsed / notification.snackBarDurationMs) * 100);
      setProgress(newProgress);
    }, 100);

    return () => clearInterval(interval);
  }, [notification.show]);

  return (
    <Snackbar
      anchorOrigin={notification.position}
      key={notification.id}
      open={notification.show}
      autoHideDuration={notification.snackBarDurationMs}
      onClose={onClose}
    >
      <Alert
        severity="info"
        onClose={onClose}
        variant="filled"
        sx={{
          position: 'relative',
          maxWidth: '90dvw',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          color: 'black',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'background-color 0.3s, opacity 0.3s',
          '&:hover': {
            backgroundColor: 'transparent',
            opacity: 0.0,
            backdropFilter: 'none',
          },
        }}
      >
        {notification.message.split('\\n').map((line, i) => (
          <React.Fragment key={i}>
            {line.includes('http')
              ? <Link href={line} target='_blank' rel="noopener noreferrer">{line}</Link>
              : line}
            <br />
          </React.Fragment>
        ))}

        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={100}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '3px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'yellow',
              transformOrigin: 'left',
              animation: `shrink ${notification.snackBarDurationMs}ms linear forwards`,
            },
            '@keyframes shrink': {
              from: { transform: 'scaleX(1)' },
              to: { transform: 'scaleX(0)' },
            },
          }}
        />
      </Alert>
    </Snackbar>
  );
}
