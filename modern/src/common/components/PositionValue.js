import { Link } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  formatAlarm, formatAltitude, formatBoolean, formatCoordinate, formatCourse, formatDistance, formatNumber, formatNumericHours, formatPercentage, formatSpeed, formatTime,
} from '../util/formatter';
import { useAdministrator } from '../util/permissions';
import { useAttributePreference, usePreference } from '../util/preferences';
import { TreeWalker } from '../util/utils';
import AddressValue from './AddressValue';
import { useTranslation } from './LocalizationProvider';

const PositionValue = ({ position, property, attribute }) => {
  const t = useTranslation();
  const walker = new TreeWalker(position);
  const admin = useAdministrator();

  const device = useSelector((state) => state.devices.items[position.deviceId]);

  const key = property || attribute;
  const value = property ? walker.getValue(key) : walker.getValue(`attributes.${key}`, { temp: ['temp', 'temperature', 'bleTemp', 'bleTemp2'], odometer: ['odomater', 'totalDistance'] }); // position[property] : position.attributes[attribute];

  const distanceUnit = useAttributePreference('distanceUnit');
  const altitudeUnit = useAttributePreference('altitudeUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const coordinateFormat = usePreference('coordinateFormat');
  const hours12 = usePreference('twelveHourFormat');

  const formatValue = (value) => {
    switch (key) {
      case 'fixTime':
      case 'deviceTime':
      case 'serverTime':
        return formatTime(value, 'seconds', hours12);
      case 'latitude':
        return formatCoordinate('latitude', value, coordinateFormat);
      case 'longitude':
        return formatCoordinate('longitude', value, coordinateFormat);
      case 'speed':
        return formatSpeed(value, speedUnit, t);
      case 'course':
        return formatCourse(value);
      case 'altitude':
        return formatAltitude(value, altitudeUnit, t);
      case 'batteryLevel':
        return value != null ? formatPercentage(value, t) : '';
      case 'alarm':
        return formatAlarm(value, t);
      case 'odometer':
      case 'distance':
      case 'totalDistance':
        return value != null ? formatDistance(value, distanceUnit, t) : '';
      case 'hours':
        return value != null ? formatNumericHours(value, t) : '';
      case 'temp':
        return value != null ? `${value.toFixed(1)}°F | ${((value * 1.8) + 32).toFixed(1)}°C` : '';
      default:
        if (typeof value === 'number') {
          return formatNumber(value);
        } if (typeof value === 'boolean') {
          return formatBoolean(value, t);
        }
        return value || '';
    }
  };

  switch (key) {
    case 'image':
    case 'video':
    case 'audio':
      return (<Link href={`/api/media/${device.uniqueId}/${value}`} target="_blank">{value}</Link>);
    case 'totalDistance':
    case 'hours':
      return (
        <>
          {formatValue(value)}
          &nbsp;&nbsp;
          {admin && (<Link component={RouterLink} underline="none" to={`/settings/accumulators/${position.deviceId}`}>&#9881;</Link>)}
        </>
      );
    case 'address':
      return (<AddressValue latitude={position.latitude} longitude={position.longitude} originalAddress={value} />);
    case 'network':
      if (value) {
        return (<Link component={RouterLink} underline="none" to={`/network/${position.id}`}>{t('sharedInfoTitle')}</Link>);
      }
      return '';
    default:
      return formatValue(value);
  }
};

export default PositionValue;
