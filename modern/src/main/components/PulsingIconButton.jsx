import React from 'react';
import {
  IconButton, Tooltip,
} from '@mui/material';
import './PulsingIconButton.css';
import { Help } from '@mui/icons-material';

const PulsingIconButton = ({ onClick, disabled, title, icon = <Help style={{ color: 'orange' }} />, color = 'rgba(255, 0, 0, 0.5)' }) => (
  <IconButton
    edge="end"
    onClick={onClick}
    disabled={disabled}
    className="pulsing-button"
    style={{ '--color': color }}
  >
    <Tooltip open={false} title={title} arrow>
      {icon}
    </Tooltip>
    {disabled && <span />}
  </IconButton>
);

export default PulsingIconButton;
