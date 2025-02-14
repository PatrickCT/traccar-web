/* eslint-disable no-unused-vars */
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { useTranslation } from '../common/components/LocalizationProvider';
import {
  distanceFromMeters, distanceToMeters,
  speedFromKnots, speedToKnots,
} from '../common/util/converter';
import { useAdministrator } from '../common/util/permissions';
import { useAttributePreference } from '../common/util/preferences';
import { prefixString } from '../common/util/stringUtils';
import { createBaseURL, formatDate } from '../common/util/utils';
import SearchSelect from '../reports/components/SearchableSelect';
import EditAttributesAccordion from './components/EditAttributesAccordion';
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

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  height: '45%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const cleanTraccarModel = (inputString) => {
  if (!inputString) return null;
  const start = inputString.toString().indexOf('{');
  if (start === -1) return null;
  const objectString = inputString.substring(start);
  const trimmedString = objectString.slice(1, -1);
  const jsonString = `{${trimmedString
    .split(', ')
    .map((pair) => {
      const [key, value] = pair.split('=');
      return `"${key}": ${Number.isNaN(value) ? (value === 'null' || value === 'false' || value === 'true' ? (value || 'NA') : `"${value || ''}"`) : `"${value || 'NA'}"`}`;
    })
    .join(', ')}}`;
  return JSON.parse(jsonString);
};

const MaintenancePage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const [item, setItem] = useState();
  const [device, setDevice] = useState();
  const [deviceId, setDeviceId] = useState();
  const [labels, setLabels] = useState({ start: '', period: '' });

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const speedUnit = useAttributePreference('speedUnit', 'kn');
  const distanceUnit = useAttributePreference('distanceUnit', 'km');
  const devices = useSelector((state) => state.devices.items);
  const admin = useAdministrator();

  const convertToList = (attributes) => {
    const otherList = [];
    Object.keys(attributes).forEach((key) => {
      const value = attributes[key];
      if (value.type === 'number') {
        otherList.push({ key, name: value.name, type: value.type });
      }
    });
    return otherList;
  };

  const onMaintenanceTypeChange = (event) => {
    const newValue = event.target.value;
    setItem({
      ...item, type: newValue, start: 0, period: 0,
    });

    const attribute = positionAttributes[newValue];
    if (attribute && attribute.dataType) {
      switch (attribute.dataType) {
        case 'distance':
          setLabels({ ...labels, start: t(prefixString('shared', distanceUnit)), period: t(prefixString('shared', distanceUnit)) });
          break;
        case 'speed':
          setLabels({ ...labels, start: t(prefixString('shared', speedUnit)), period: t(prefixString('shared', speedUnit)) });
          break;
        default:
          setLabels({ ...labels, start: null, period: null });
          break;
      }
    } else {
      setLabels({ ...labels, start: null, period: null });
    }
  };

  const rawToValue = (value) => {
    const attribute = positionAttributes[item.type];
    if (attribute && attribute.dataType) {
      switch (attribute.dataType) {
        case 'speed':
          return speedFromKnots(value, speedUnit);
        case 'distance':
          return distanceFromMeters(value, distanceUnit);
        default:
          return value;
      }
    }
    return value;
  };

  const valueToRaw = (value) => {
    const attribute = positionAttributes[item.type];
    if (attribute && attribute.dataType) {
      switch (attribute.dataType) {
        case 'speed':
          return speedToKnots(value, speedUnit);
        case 'distance':
          return distanceToMeters(value, distanceUnit);
        default:
          return value;
      }
    }
    return value;
  };

  const validate = () => item && item.name && item.type && item.start && item.period && (!item.id ? (deviceId) : true);

  const linkDevice = async (maintenance) => {
    window.Notiflix.Loading.dots('Guardando');
    // vincular dispositivo
    document.getElementById('NotiflixLoadingMessage').innerText = 'Vinculando equipo';
    await fetch(`${createBaseURL()}/api/permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId: deviceId.toString(),
        maintenanceId: maintenance.id,
      }),
    });
    // listar notificaciones
    document.getElementById('NotiflixLoadingMessage').innerText = 'Revisando notificaciones';
    const notifications = await (await fetch(`${createBaseURL()}/api/notifications`)).json();
    const notification = notifications.find((n) => n.type === 'maintenance');
    // si tiene notificacion de mantenimiento vincular
    // si no tiene notificacion de mantenimiento crear y vincular
    if (notification) {
      document.getElementById('NotiflixLoadingMessage').innerText = 'Vinculando notificación';
      await fetch(`${createBaseURL()}/api/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: deviceId.toString(),
          notificationId: notification.id,
        }),
      });
    } else {
      document.getElementById('NotiflixLoadingMessage').innerText = 'Creando notificación';
      const newNotification = await fetch(`${createBaseURL()}/api/notifications`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'maintenance',
          notificators: 'web,mail,sms',
        }),
      });
      document.getElementById('NotiflixLoadingMessage').innerText = 'Vinculando notificación';
      await fetch(`${createBaseURL()}/api/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: deviceId.toString(),
          notificationId: newNotification.id,
        }),
      });
    }
    window.Notiflix.Loading.remove();
  };

  useEffect(() => setDevice(cleanTraccarModel(item?.device || '')), [item]);

  return (
    <EditItemView
      endpoint="maintenance"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedMaintenance']}
      onItemSaved={async (response) => {
        await linkDevice(response);
      }}
      preventBack
    >
      {item && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              {!item?.id && (
                <FormControl fullWidth>
                  <SearchSelect
                    data={Object.values(devices).sort((a, b) => a.name.localeCompare(b.name))}
                    label={t('reportDevice')}
                    value={item?.device?.id || deviceId || ''}
                    onChange={(e) => setDeviceId(e.target.value)}
                  />
                </FormControl>
              )}
              {item?.id && (
                <TextField
                  value={device?.name || ''}
                  label={t('sharedDevice')}
                  onChange={() => setDevice({ ...device })}
                />
              )}
              <TextField
                value={item.name || ''}
                onChange={(event) => setItem({ ...item, name: event.target.value })}
                label={t('sharedName')}
              />
              <FormControl>
                <InputLabel>{t('sharedType')}</InputLabel>
                <Select
                  label={t('sharedType')}
                  value={item.type || ''}
                  onChange={onMaintenanceTypeChange}
                >
                  {convertToList(positionAttributes).filter((key) => (key.key === 'deviceTime' || key.key === 'hours' || key.key === 'totalDistance')).map(({ key, name }) => (
                    <MenuItem key={key} value={key}>{name}</MenuItem>
                  ))}
                  <MenuItem key="date" value="date">Fecha</MenuItem>
                </Select>
              </FormControl>
              {item.type === 'date' ? (
                <>
                  <TextField
                    label={t('reportFrom')}
                    type="datetime-local"
                    value={((d) => (!d ? new Date() : new Date(((parts) => `${parts[2]}/${parts[1]}/${parts[0]}`)(d.split('-')))))(item?.attributes?.last)}
                    onChange={(e) => {
                      setItem({ ...item, start: 1, attributes: { ...item.attributes, last: formatDate(new Date(e.target.value), 'dd-MM-yyyy') } });
                    }}
                    fullWidth
                  />
                  <TextField
                    type="number"
                    value={rawToValue(item.period) || ''}
                    onChange={(event) => setItem({ ...item, period: valueToRaw(event.target.value) })}
                    label={labels.period ? `${t('maintenancePeriod')} (${labels.period})` : t('maintenancePeriod')}
                  />

                </>
              ) : (
                <>
                  <TextField
                    type="number"
                    value={rawToValue(item.start) || ''}
                    onChange={(event) => setItem({ ...item, start: valueToRaw(event.target.value) })}
                    label={labels.start ? `${t('maintenanceStart')} (${labels.start})` : t('maintenanceStart')}
                  />
                  <TextField
                    type="number"
                    value={rawToValue(item.period) || ''}
                    onChange={(event) => setItem({ ...item, period: valueToRaw(event.target.value) })}
                    label={labels.period ? `${t('maintenancePeriod')} (${labels.period})` : t('maintenancePeriod')}
                  />
                </>
              )}

              {item?.type === 'totalDistance' && (item?.device?.id || deviceId) && (
                <Button onClick={handleOpen}>Actualizar acumuladores</Button>
              )}
              <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={style}>
                  <iframe
                    src={`${createBaseURL()}/settings/accumulators/${(device?.id || deviceId)}?hideMenu=true&hideNavigation=true`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    aria-hidden="false"
                    title="SV"
                  />
                </Box>
              </Modal>
            </AccordionDetails>
          </Accordion>
          {admin && (
            <EditAttributesAccordion
              attributes={item.attributes}
              setAttributes={(attributes) => setItem({ ...item, attributes })}
              definitions={{}}
            />
          )}
        </>
      )}
    </EditItemView>
  );
};

export default MaintenancePage;
