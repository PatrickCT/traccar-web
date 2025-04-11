import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Box, IconButton, Typography } from '@mui/material';
import React, { useState } from 'react';

const NumericInput = ({
  min = 0,
  max = 100,
  initialValue = 0,
  onChange = () => { },
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (newValue) => {
    if (newValue < min || newValue > max) return;
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <IconButton
        onClick={() => handleChange(value - 1)}
        disabled={value <= min}
        size="small"
      >
        <RemoveIcon />
      </IconButton>

      <Box
        width={40}
        height={32}
        display="flex"
        alignItems="center"
        justifyContent="center"
        border={1}
        borderColor="grey.300"
        borderRadius={1}
      >
        <Typography variant="body1">{value}</Typography>
      </Box>

      <IconButton
        onClick={() => handleChange(value + 1)}
        disabled={value >= max}
        size="small"
      >
        <AddIcon />
      </IconButton>
    </Box>
  );
};

export default NumericInput;
