/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { useWizard } from 'react-use-wizard';
import dayjs from 'dayjs';
import moment from 'moment';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Button, TextField } from '@mui/material';
import { useTranslation } from '../../common/components/LocalizationProvider';
import '../customDatePicker.css';

const CreateLink = ({ selectedItem, setSelectedItem, onClick }) => {
  const t = useTranslation();
  const { handleStep, nextStep } = useWizard();
  handleStep(() => {
  });

  return (
    <>
      <h4>{`${selectedItem.id ? 'Editar' : 'Crear'} enlace`}</h4>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          format="DD/MM/YYYY"
          value={dayjs(selectedItem.limitDate || '')}
          onChange={(newValue) => {
            setSelectedItem({ ...selectedItem, limitDate: moment.utc(newValue.toDate()) });
          }}
          className="customDatePickerWidth"
          label="Vigencia"
        />
      </LocalizationProvider>
      <div style={{ marginBottom: '20px' }} />
      <TextField
        fullWidth
        value={selectedItem.pass || ''}
        onChange={(event) => { setSelectedItem({ ...selectedItem, pass: event.target.value }); }}
        label={`${t('userPassword')} (Opcional)`}
      />
      <div style={{ marginBottom: '20px' }} />
      <TextField
        fullWidth
        value={selectedItem.name || ''}
        onChange={(event) => { setSelectedItem({ ...selectedItem, name: event.target.value }); event.target.focus(); }}
        label="Compartir con"
        required
      />
      <div style={{ marginBottom: '20px' }} />
      <Button
        disabled={selectedItem.limitDate == null || selectedItem.name == null || selectedItem.name === ''}
        style={{ position: 'fixed', bottom: '0px', right: '0px' }}
        onClick={() => {
          onClick();
          nextStep();
        }}
      >
        {t('sharedNext')}
      </Button>
    </>
  );
};

export default CreateLink;
