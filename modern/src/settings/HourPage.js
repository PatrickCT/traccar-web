/* eslint-disable no-await-in-loop */
import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import { useParams } from 'react-router-dom';
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

  const [name, setName] = useState('');

  const newDateStart = new Date();
  const [hoursStart, minutesStart] = ('00:00').split(':');
  newDateStart.setHours(hoursStart);
  newDateStart.setMinutes(minutesStart);

  const newDateEnd = new Date();
  const [hoursEnd, minutesEnd] = ('00:00').split(':');
  newDateEnd.setHours(hoursEnd);
  newDateEnd.setMinutes(minutesEnd);

  const [hours, minutes] = ('00:00').split(':');
  newDateEnd.setHours(hours);
  newDateEnd.setMinutes(minutes);

  const [stringDates, setStringDates] = useState('');
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

  const parseTimeToDate = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number); // Split and convert to numbers
    const now = new Date(); // Get the current date

    // Set the hours and minutes
    now.setHours(hours, minutes, 0, 0); // Setting seconds and milliseconds to 0

    return now;
  };

  const hoursGenerator = () => {
    setItem(null);
    const dd = stringDates
      .split('\n')
      .filter((d) => d.includes(':'))
      .map((d) => parseTimeToDate(d))
      .sort((a, b) => a - b)
      .map((d, i) => ({ id: i + 1, name, hour: d }));
    setItems(dd);
  };

  const removeItem = (item) => {
    const i = items.filter((i) => (i.id !== item.id));
    setItems(i);
    setItem(null);
    if (item.gpsid) {
      fetch(`/api/horasalidas/${item.gpsid}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
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

  useEffect(() => {
    setItems(() => [...items.map((i) => ({ ...i, name }))]);
  }, [name]);

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
            <TextField value={stringDates} multiline rows={4 + items.length} onChange={(evt) => setStringDates(evt.target.value)} />
            {saving ? (
              <Box sx={{ width: '100%' }}>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            ) : (
              <FormControl fullWidth>
                <Button onClick={hoursGenerator}>Generar</Button>

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
                          {/* <Button onClick={(() => updateItem(item))}>Editar</Button> */}
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
