/* eslint-disable no-await-in-loop */
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  circularProgressClasses,
  FormControl,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead, TableRow,
  Typography,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useCatch } from '../reactHelper';
import EditItemView from './components/EditItemView';
import SettingsMenu from './components/SettingsMenu';

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
  const navigate = useNavigate();

  const onItemSaved = useCatch(async () => {
    setSaving(true);

    const i = items[0];
    if (i.gpsid) {
      for (let il = 0; il < items.length; il += 1) {
        const i = items[il];
        await fetch(`/api/horasalidas/${i.gpsid}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, hour: i.hour, id: i.gpsid }) });
        setProgress((il * 100) / items.length);
      }
    } else {
      await fetch('/api/horasalidas/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(items.map((i) => ({ name, hour: i.hour, id: i.gpsid }))) });
    }
    navigate('/settings/hours', true);
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

  const removeItems = async () => {
    setSaving(true);
    setProgress(0);
    const step = ((1 * 100) / items.length);
    await Promise.all(items.map(async item => {
      await Promise.all([removeItem(item)]);
      setProgress((prev) => prev + step);
    }));
    setProgress(0);
    setSaving(false);
    setTimeout(() => {
      location.reload()
    }, 10 * 1000);
  }

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

  const validate = () => name && items.length > 0 && !saving;

  return (
    <EditItemView
      endpoint="horasalidas"
      item={item}
      setItem={setItem}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sectionDialog']}
      preventBack={!horas}
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
            <TextField value={stringDates} multiline rows={10} onChange={(evt) => setStringDates(evt.target.value)} />
            {saving ? (
              <Box sx={{ width: '100%' }}>
                {horas ? (
                  <LinearProgress variant="determinate" value={progress} />
                ) : (
                  <CircularProgress
                    variant="indeterminate"
                    disableShrink
                    sx={(theme) => ({
                      color: '#1a90ff',
                      animationDuration: '550ms',
                      position: 'absolute',
                      left: '50%',
                      [`& .${circularProgressClasses.circle}`]: {
                        strokeLinecap: 'round',
                      },
                      ...theme.applyStyles('dark', {
                        color: '#308fe8',
                      }),
                    })}
                    size={40}
                    thickness={4}
                  />
                )}
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
                <>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                    <Button onClick={removeItems}>Eliminar todo</Button>
                  </div>
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
                </>
              )}

          </AccordionDetails>
        </Accordion>

      )}
    </EditItemView>
  );
};

export default HourPage;
