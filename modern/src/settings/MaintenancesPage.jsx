/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import {
  Table,
  TableBody,
  TableCell, TableHead,
  TableRow,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import TableShimmer from '../common/components/TableShimmer';
import { formatDistance, formatSpeed } from '../common/util/formatter';
import { useAttributePreference } from '../common/util/preferences';
import { useEffectAsync } from '../reactHelper';
import CollectionActions from './components/CollectionActions';
import CollectionFab from './components/CollectionFab';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import SettingsMenu from './components/SettingsMenu';

const useStyles = makeStyles((theme) => ({
  columnAction: {
    width: '1%',
    paddingRight: theme.spacing(1),
  },
}));

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

const MaintenacesPage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const speedUnit = useAttributePreference('speedUnit');
  const distanceUnit = useAttributePreference('distanceUnit');

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/maintenance');
      if (response.ok) {
        const listItems = await response.json();
        const fakeitems = [];
        for (const item of listItems) {
          let device = await fetch(`/api/maintenance/${item.id}`);
          device = await device.json();
          fakeitems.push(({ ...item, Device: cleanTraccarModel(device.device) }));
        }
        setItems(fakeitems);
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const convertAttribute = (key, value) => {
    const attribute = positionAttributes[key];
    if (attribute && attribute.dataType) {
      switch (attribute.dataType) {
        case 'speed':
          return formatSpeed(value, speedUnit, t);
        case 'distance':
          return formatDistance(value, distanceUnit, t);
        default:
          return value;
      }
    }

    return value;
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedMaintenance']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedName')}</TableCell>
            <TableCell>{t('sharedType')}</TableCell>
            <TableCell>{t('maintenanceStart')}</TableCell>
            <TableCell>{t('maintenancePeriod')}</TableCell>
            <TableCell>{t('sharedDevice')}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? items.filter(filterByKeyword(searchKeyword)).map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{positionAttributes[item.type]?.name || ''}</TableCell>
              <TableCell>{convertAttribute(item.type, item.start)}</TableCell>
              <TableCell>{convertAttribute(item.type, item.period)}</TableCell>
              <TableCell>{item.Device?.name || ''}</TableCell>
              <TableCell className={classes.columnAction} padding="none">
                <CollectionActions itemId={item.id} editPath="/settings/maintenance" endpoint="maintenance" setTimestamp={setTimestamp} />
              </TableCell>
            </TableRow>
          )) : (<TableShimmer columns={5} endAction />)}
        </TableBody>
      </Table>
      <CollectionFab editPath="/settings/maintenance" />
    </PageLayout>
  );
};

export default MaintenacesPage;
