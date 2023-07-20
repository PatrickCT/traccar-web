import { React, useState } from 'react';
// import { Popup } from 'maplibre-gl';
import { useDispatch, useSelector } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import {
  IconButton,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import Collapse from 'react-collapse';
import moment from 'moment';
import { devicesActions } from '../store';
import {
  formatStatus,
  getStatusColor,
} from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useAdministrator } from '../common/util/permissions';
import { useAttributePreference } from '../common/util/preferences';
import TableExist from './components/TableExits';

// import { map } from '../map/core/MapView';

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

const DeviceRowTransporte = ({ data, index, style }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();

  const item = data[index];

  const geofences = useSelector((state) => state.geofences.items);

  const [isOpened, setIsOpen] = useState(false);
  const [info, setInfo] = useState({});

  const devicePrimary = useAttributePreference('devicePrimary', 'name');
  const deviceSecondary = useAttributePreference('deviceSecondary', '');

  const formatProperty = (key) => {
    if (key === 'geofenceIds') {
      const geofenceIds = item[key] || [];
      return geofenceIds
        .filter((id) => geofences.hasOwnProperty(id))
        .map((id) => geofences[id].name)
        .join(', ');
    }
    return item[key];
  };

  const secondaryText = () => {
    let status = 'online';
    if (item.status === 'online') {
      status = formatStatus(item.status, t);
    } else {
      status = moment(item.lastUpdate).fromNow();
    }
    return (
      <>
        {deviceSecondary &&
          item[deviceSecondary] &&
          `${formatProperty(deviceSecondary)} • `}
        <span className={classes[getStatusColor(item.status)]}>{`${status}`}</span>
      </>
    );
  };

  const handleLoadInfo = (infoChild) => {
    setInfo(infoChild);
  };

  return (
    <div style={style}>
      <ListItemButton
        style={isOpened ? { backgroundColor: '#cccccc' } : { backgroundColor: '#ffffff' }}
        key={item.id}
        onClick={() => {
          dispatch(devicesActions.selectId(item.id));
          setIsOpen(!isOpened);
        }}
        disabled={!admin && item.disabled}
      >
        <ListItemText
          primary={formatProperty(devicePrimary)}
          primaryTypographyProps={{ noWrap: true }}
          secondary={secondaryText()}
          secondaryTypographyProps={{ noWrap: true }}
        />

        {Object.keys(info).length > 0 ? (
          <IconButton size="small">
            {`${t('laps')}${info.vueltas}`}
          </IconButton>
        ) : <div />}
      </ListItemButton>
      <Collapse isOpened={isOpened}>
        <div className="text" style={{ padding: '1rem' }}><TableExist deviceId={item.id} handleLoadInfo={handleLoadInfo} /></div>
      </Collapse>
    </div>
  );
};

export default DeviceRowTransporte;
