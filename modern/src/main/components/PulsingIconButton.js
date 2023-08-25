import React from 'react';
import {
  IconButton, Tooltip,
} from '@mui/material';
import './PulsingIconButton.css';
import { Help } from '@mui/icons-material';

const PulsingIconButton = ({ onClick, disabled, title }) => (
  <IconButton
    edge="end"
    onClick={onClick}
    disabled={disabled}
    className="pulsing-button"
  >
    <Tooltip open={false} title={title} arrow>
      <Help style={{ color: 'orange' }} />
    </Tooltip>
    {disabled && <span />}
  </IconButton>
);

export default PulsingIconButton;
