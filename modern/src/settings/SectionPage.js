import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import TextField from '@mui/material/TextField';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import { useCatch } from '../reactHelper';
import { groupsActions } from '../store';

const useStyles = makeStyles((theme) => ({
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const SectionPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();
  // const user = useSelector((state) => state.session.user);

  const [item, setItem] = useState();
  const [geofences, setGeofences] = useState([]);
  const [geofence, setGeofence] = useState(0);

  const onItemSaved = useCatch(async () => {
    const response = await fetch('/api/groups');
    if (response.ok) {
      dispatch(groupsActions.update(await response.json()));
    } else {
      throw Error(await response.text());
    }
  });

  useEffect(() => {
    fetch('/api/geofences')
      .then((response) => response.json())
      .then((data) => setGeofences(data));
    setGeofence(item?.geofenceId ?? 0);
  }, [item?.id]);

  const updateGeocerca = (evt) => {
    setGeofence(evt.target.value);
    setItem({
      ...item,
      geofenceId: evt.target.value,
    });
  };

  const updateMin = (evt) => {
    if (/^\d*$/.test(evt.target.value) && evt.target.value.length < 3) {
      setItem({ ...item, minTime: parseInt(evt.target.value, 10) });
    }
  };

  const updateMax = (evt) => {
    if (/^\d*$/.test(evt.target.value) && evt.target.value.length < 3) {
      setItem({ ...item, maxTime: parseInt(evt.target.value, 10) });
    }
  };

  const validate = () => item && item.name && item.minTime && item.maxTime && item.punishment && item.geofenceId && item.minTime <= item.maxTime;

  return (
    <EditItemView
      endpoint="tramos"
      item={item}
      setItem={setItem}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sectionDialog']}
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
              value={item.name || ''}
              onChange={(event) => setItem({ ...item, name: event.target.value })}
              label={t('sharedName')}
            />
            <TextField
              value={item.minTime || ''}
              onChange={(event) => { updateMin(event); }}
              label={t('minTime')}
            />
            <TextField
              value={item.maxTime || ''}
              onChange={(event) => { updateMax(event); }}
              label={t('maxTime')}
            />
            <TextField
              value={item.punishment || ''}
              onChange={(event) => { console.log(event.target.value); if (/^[0-9]*$/.test(event.target.value)) { setItem({ ...item, punishment: event.target.value }); } }}
              label={t('punishment')}
            />
            <FormControl fullWidth>
              <InputLabel id="geofence">{t('geofences')}</InputLabel>
              <Select
                labelId="geofenceid-label"
                id="geofenceid"
                value={geofence ?? 0}
                label={t('geofences')}
                onChange={updateGeocerca}
              >
                {geofences && (
                  geofences.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)
                )}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

      )}
    </EditItemView>
  );
};

export default SectionPage;
