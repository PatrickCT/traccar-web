import React from 'react';
import { useTheme } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import {
  ListItemText, ListItemButton, useMediaQuery, Tooltip, IconButton,
} from '@mui/material';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import moment from 'moment';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60';
import Battery20Icon from '@mui/icons-material/Battery20';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import ErrorIcon from '@mui/icons-material/Error';
import { ReactComponent as EngineIcon } from '../resources/images/data/engine.svg';
import { devicesActions } from '../store';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useAdministrator } from '../common/util/permissions';
import { useAttributePreference } from '../common/util/preferences';
import { formatAlarm, formatBoolean, formatPercentage } from '../common/util/formatter';
import { hasPassedTime } from '../common/util/utils';
import { map } from '../map/core/MapView';

const useStyles = makeStyles((theme) => ({
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  batteryText: {
    fontSize: '0.75rem',
    fontWeight: 'normal',
    lineHeight: '0.875rem',
  },
  positive: {
    // color: theme.palette.colors.positive,
    color: '#036104',
  },
  medium: {
    color: theme.palette.colors.medium,
  },
  negative: {
    color: theme.palette.colors.negative,
  },
  neutral: {
    color: theme.palette.colors.neutral,
  },
  customTooltip: {
    backgroundColor: 'white',
    color: 'black',
  },
}));

const DeviceRow = ({ data, index, style }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const admin = useAdministrator();
  const item = data[index];
  const position = useSelector((state) => state.session.positions[item.id]);
  const geofences = useSelector((state) => state.geofences.items);
  const devicePrimary = useAttributePreference('devicePrimary', 'name');
  // const deviceSecondary = useAttributePreference('deviceSecondary', '');

  const formatProperty = (key) => {
    let status;
    if (item.status === 'online') {
      status = 'Reportando';
    } else {
      status = 'Sin reportar';
    }
    if (key === 'geofenceIds') {
      const geofenceIds = item[key] || [];
      return geofenceIds
        .filter((id) => geofences.hasOwnProperty(id))
        .map((id) => geofences[id].name)
        .join(', ');
    }
    return (
      <>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{`${item[key]} `}</span>
        {' • '}
        <span style={{ color: item.status === 'online' ? 'green' : 'red', fontWeight: 'normal', fontSize: '14px' }}>{status}</span>
        {' • '}
        {position && position.fixTime ? (
          <>
            <span style={{ fontSize: '14px' }}>{`Conexión: ${moment(item.lastUpdate).format('YYYY-MM-D HH:mm:ss')}`}</span>
            {' • '}
            <span style={{ fontSize: '14px' }}>{`Posición: ${moment(position.fixTime).format('YYYY-MM-D HH:mm:ss')}`}</span>
          </>
        ) : (
          <span style={{ fontSize: '14px' }} />
        )}
      </>
    );
  };

  return (
    <div style={style}>
      <ListItemButton
        style={{ backgroundColor: (!position || !position.fixTime || hasPassedTime(new Date(position?.fixTime || new Date()), 40)) ? '#F4757B44' : '#99d2f0', marginTop: '2px', marginBottom: '4px', lineHeight: '1px', padding: '2px' }}
        key={item.id}
        onClick={() => {
          dispatch(devicesActions.selectId(0));
          dispatch(devicesActions.selectId(item.id));
          window.device = (window.devices ?? {})[item.id] || null;
          window.deviceName = ((window.devices ?? {})[item.id])?.name || null;
          if (!desktop) { window.showDevicesList(false); }
          if (position) {
            map.flyTo({ center: [position.longitude, position.latitude], zoom: 18, duration: 1000 });
          }
        }}
        disabled={!admin && item.disabled}
      >
        <Tooltip classes={{ tooltip: classes.customTooltip }} title={formatProperty(devicePrimary)}>
          <ListItemText
            primary={formatProperty(devicePrimary)}
            primaryTypographyProps={{ noWrap: true }}

          />
        </Tooltip>
        {position && (
          <>
            {hasPassedTime(new Date(position.fixTime), 30) && (
              <Tooltip title={t('eventAlarm')}>
                <CrisisAlertIcon fontSize="small" className={classes.negative} />
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('alarm') && (
              <Tooltip title={`${t('eventAlarm')}: ${formatAlarm(position.attributes.alarm, t)}`}>
                <IconButton size="small">
                  <ErrorIcon fontSize="small" className={classes.negative} />
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('ignition') && (
              <Tooltip title={`${t('positionIgnition')}: ${formatBoolean(position.attributes.ignition, t)}`}>
                <IconButton size="small">
                  {position.attributes.ignition ? (
                    <EngineIcon width={20} height={20} className={classes.positive} />
                  ) : (
                    <EngineIcon width={20} height={20} className={classes.neutral} />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('batteryLevel') && (
              <Tooltip title={`${t('positionBatteryLevel')}: ${formatPercentage(position.attributes.batteryLevel)}`}>
                <IconButton size="small">
                  {position.attributes.batteryLevel > 70 ? (
                    position.attributes.charge
                      ? (<BatteryChargingFullIcon fontSize="small" className={classes.positive} />)
                      : (<BatteryFullIcon fontSize="small" className={classes.positive} />)
                  ) : position.attributes.batteryLevel > 30 ? (
                    position.attributes.charge
                      ? (<BatteryCharging60Icon fontSize="small" className={classes.medium} />)
                      : (<Battery60Icon fontSize="small" className={classes.medium} />)
                  ) : (
                    position.attributes.charge
                      ? (<BatteryCharging20Icon fontSize="small" className={classes.negative} />)
                      : (<Battery20Icon fontSize="small" className={classes.negative} />)
                  )}
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
