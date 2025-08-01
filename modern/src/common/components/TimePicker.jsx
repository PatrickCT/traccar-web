import { Box, TextField } from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import moment from 'moment';
import React from 'react';

const TimePickerComponent = ({ hour, setHour, t }) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Box width="100%">
      <TimePicker
        label={t('reportStartTime')}
        value={dayjs(hour)}
        onChange={(newValue) => {
          setHour(moment.utc(newValue.toDate()));
        }}
        renderInput={(params) => (
          <TextField {...params} fullWidth />
        )}
      />
    </Box>
  </LocalizationProvider>
);

export default TimePickerComponent;
