/* eslint-disable no-await-in-loop */
import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, FormControl, Table, TableHead, TableRow, TableCell, TableBody, Button, Box, LinearProgress,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import { useCatch } from '../reactHelper';

const useStyles = makeStyles((theme) => ({
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const HourPage = () => {
  const classes = useStyles();

  const t = useTranslation();
  // const user = useSelector((state) => state.session.user);
  const { horas } = useParams();

  const [item, setItem] = useState(null);
  const [items, setItems] = useState([]);
  const [repeticion, setRepeticion] = useState(0);

  const [name, setName] = useState('');

  const newDateStart = new Date();
  const [hoursStart, minutesStart] = ('00:00').split(':');
  newDateStart.setHours(hoursStart);
  newDateStart.setMinutes(minutesStart);
  const [start, setStart] = useState(dayjs(newDateStart));

  const newDateEnd = new Date();
  const [hoursEnd, minutesEnd] = ('00:00').split(':');
  newDateEnd.setHours(hoursEnd);
  newDateEnd.setMinutes(minutesEnd);
  const [end, setEnd] = useState(dayjs(newDateEnd));

  const newDate = new Date();
  const [hours, minutes] = ('00:00').split(':');
  newDateEnd.setHours(hours);
  newDateEnd.setMinutes(minutes);
  const [date, setDate] = useState(dayjs(newDate));

  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const onItemSaved = useCatch(async () => {
    setSaving(true);
    for (let il = 0; il < items.length; il += 1) {
      const i = items[il];
      if (i.hasOwnProperty('id') && i?.name !== null) {
        await fetch(`/api/horasalidas/${i.gpsid ? i.gpsid : ''}`, { method: i.gpsid ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, hour: i.hour, id: i.gpsid }) });
      }
      setProgress((il * 100) / items.length);
    }
    setSaving(false);
  });

  useEffect(() => {
    fetch(`/api/horasalidas/${horas}/list`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      .then((response) => response.json())
      .then((data) => {
        const i = [];
        for (let index = 0; index < data.length; index += 1) {
          const obj = data[index];

          if (obj) {
            i.push({ id: index + 1, name: obj.name, hour: obj.hour, gpsid: obj.id });
            setName(obj.name);
          }
        }
        setItems(i);
      });
  }, []);

  useEffect(() => {
    setStart(dayjs(newDateStart));
    setEnd(dayjs(newDateEnd));
  }, []);

  const updateStart = (newstart) => {
    setStart(dayjs(newstart));
  };

  const updateEnd = (newend) => {
    setEnd(dayjs(newend));
  };

  const hoursGenerator = () => {
    if (repeticion <= 0) return;

    const h = start.toDate();
    const i = items;
    h.setSeconds(0);
    while (h < end.toDate()) {
      i.push({ id: items.length + 1, hour: new Date(h), name });
      h.setMinutes(h.getMinutes() + repeticion);
    }
    setItems(i);
    setItem(null);
  };

  const updateItem = (item) => {
    setItem(item);
    setDate(dayjs(item.hour));
  };

  const saveItem = () => {
    const i = items.map((i) => (i.id === item.id ? item : i));
    setItems(i);
    setItem(null);
  };

  const removeItem = (item) => {
    const i = items.filter((i) => (i.id !== item.id));
    setItems(i);
    setItem(null);
    if (item.gpsid) {
      fetch(`/api/horasalidas/${item.gpsid}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
        .then((response) => response.json())
        .then((data) => data);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    };

    if (saving) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [saving]);

  const validate = () => name && items.length > 0;

  return (
    <EditItemView
      endpoint="horasalidas"
      item={item}
      setItem={setItem}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sectionDialog']}
      preventBack
    >
      {item && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {t('sharedRequired')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <TextField
              value={name || ''}
              onChange={(event) => setName(event.target.value)}
              label={t('sharedName')}
            />

            {saving ? (
              <Box sx={{ width: '100%' }}>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            ) : (
              <FormControl fullWidth>
                <TextField onChange={(event) => setRepeticion(Number(event.target.value))} label="Repetición" />
                <br />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['TimePicker', 'TimePicker']}>
                    <DemoItem>
                      <TimePicker
                        label={t('reportStartTime')}
                        value={start}
                        onChange={(newValue) => updateStart(newValue)}
                      />
                    </DemoItem>

                  </DemoContainer>
                </LocalizationProvider>
                <br />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['TimePicker', 'TimePicker']}>
                    <DemoItem>
                      <TimePicker
                        label={t('reportEndTime')}
                        value={end}
                        onChange={(newValue) => updateEnd(newValue)}
                      />
                    </DemoItem>

                  </DemoContainer>
                </LocalizationProvider>

                <br />
                <Button onClick={hoursGenerator}>Generar</Button>

                {item.id && (
                  <>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={['TimePicker', 'TimePicker']}>
                        <DemoItem>
                          <TimePicker
                            label={t('reportEndTime')}
                            value={date}
                            onChange={(newValue) => { setItem({ ...item, hour: dayjs(newValue) }); setDate(dayjs(newValue)); }}
                          />
                        </DemoItem>

                      </DemoContainer>
                    </LocalizationProvider>
                    <Button onClick={(() => saveItem())}>Guardar</Button>
                  </>
                )}

              </FormControl>
            )}

            {saving ? (
              <Box sx={{ width: '100%' }} />
            ) :
              (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('sharedName')}</TableCell>
                      <TableCell>{t('sharedHour')}</TableCell>
                      <TableCell className={classes.columnAction} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{name}</TableCell>
                        <TableCell>{new Date(item.hour).toLocaleString()}</TableCell>
                        <TableCell className={classes.columnAction} padding="none">
                          <Button onClick={(() => updateItem(item))}>Editar</Button>
                          <Button onClick={(() => removeItem(item))}>Eliminar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

          </AccordionDetails>
        </Accordion>

      )}
    </EditItemView>
  );
};

export default HourPage;
