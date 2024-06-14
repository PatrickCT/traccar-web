import {
  React, memo, useEffect, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import makeStyles from '@mui/styles/makeStyles';
import { useTheme } from '@emotion/react';
import {
  IconButton,
  ListItemText,
  ListItemButton,
  useMediaQuery,
} from '@mui/material';
import Collapse from 'react-collapse';
import { devicesActions } from '../store';
import {
  getStatusColor,
} from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useAdministrator } from '../common/util/permissions';
import { useAttributePreference } from '../common/util/preferences';
import { map } from '../map/core/MapView';
import TableExist from './components/TableExits';

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
    color: theme.palette.colors.positive,
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
  collapse: {
    padding: '1rem',
  },
}));

const DeviceRowTransporte = ({ data, index }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();
  const user = useSelector((state) => state.session.user);
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const admin = useAdministrator();
  const item = data[index];
  const position = useSelector((state) => state.session.positions[item.id]);
  const geofences = useSelector((state) => state.geofences.items);
  const groups = useSelector((state) => state.groups.items);
  const [isOpened, setIsOpen] = useState(false);
  const [info, setInfo] = useState({});
  const devicePrimary = useAttributePreference('devicePrimary', 'name');
  const [hasSalida, setHasSalida] = useState(false);
  const devices = useSelector((state) => state.devices.items);

  const formatProperty = (key) => {
    if (key === 'geofenceIds') {
      const geofenceIds = item[key] || [];
      return geofenceIds
        .filter((id) => geofences.hasOwnProperty(id))
        .map((id) => geofences[id].name)
        .join(', ');
    }
    return (
      <>
        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{`${item[key]} `}</span>
        {' • '}
        <span style={{ fontSize: '12px' }}>{`${moment(item.lastUpdate).format('YYYY-MM-D HH:mm:ss')}`}</span>
        {' • '}
        <span style={{ fontSize: '12px' }}>{`${groups[item.groupId]?.name || t('groupNoGroup')}`}</span>
      </>
    );
  };

  const secondaryText = () => <span className={classes[getStatusColor(item.status)]}>{`${item.uniqueId ?? t('no-imei')}`}</span>;

  const handleLoadInfo = (infoChild) => {
    setInfo(infoChild);
  };

  useEffect(() => {
    const device = devices[item.id];
    if (device) {
      setHasSalida(device.attributes.hasOwnProperty('Salida') ? device.attributes.Salida : false);
    }
  });

  return (
    <div style={{ position: 'relative' }}>
      <ListItemButton
        style={isOpened ? { backgroundColor: '#cccccc', position: 'relative' } : { backgroundColor: '#ffffff', position: 'relative' }}
        key={item.id}
        onClick={() => {
          dispatch(devicesActions.selectId(item.id));
          window.device = (window.devices ?? {})[item.id] || null;
          window.deviceName = ((window.devices ?? {})[item.id])?.name || null;

          setIsOpen(!isOpened);
          if (!desktop && user.attributes.hasOwnProperty('Transporte')) {
            window.showDevicesList(true);
          }
          if (position !== undefined) {
            map.jumpTo({
              center: [position.longitude, position.latitude],
              zoom: Math.max(map.getZoom(), 16),
            });
          }
        }}
        disabled={!admin && item.disabled}
      >
        <ListItemText
          primary={formatProperty(devicePrimary)}
          primaryTypographyProps={{ noWrap: true }}
          secondary={secondaryText()}
          secondaryTypographyProps={{ noWrap: true }}
        />

        {isOpened && Object.keys(info).length > 0 ? (
          <IconButton size="small">
            {`${t('laps')}${info.vueltas}`}
          </IconButton>
        ) : <div />}

        <span style={{ fontWeight: 'bold', fontSize: '16px', color: `${hasSalida ? 'green' : 'red'}` }}>•</span>
      </ListItemButton>
      <Collapse isOpened={isOpened}>
        <div className="text" style={{ padding: '1rem', width: '100%' }}><TableExist deviceId={item.id} handleLoadInfo={handleLoadInfo} /></div>
      </Collapse>
    </div>
  );
};

export default memo(DeviceRowTransporte);
