import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableRow, TableCell, TableHead, TableBody,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from 'react-redux';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import { usePreference } from '../common/util/preferences';
import { formatTime } from '../common/util/formatter';
import { useAdministrator, useDeviceReadonly } from '../common/util/permissions';

const useStyles = makeStyles((theme) => ({
  columnAction: {
    width: '1%',
    paddingRight: theme.spacing(1),
  },
}));

const DevicesPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();
  const admin = useAdministrator();

  const hours12 = usePreference('twelveHourFormat');

  const deviceReadonly = useDeviceReadonly();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const groups = useSelector((state) => state.groups.items);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/devices');
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (deviceId) => navigate(`/settings/device/${deviceId}/connections`),
  };

  const groupConnections = {
    key: 'groups',
    title: t('settingsGroups'),
    icon: <LinearScaleIcon fontSize="small" />,
    handler: (deviceId) => navigate(`/settings/device/${deviceId}/groups`),
  };

  const simTypes = [{ id: 0, name: 'Tipo no asignado' }, { id: 1, name: 'Plan Telcel' }, { id: 2, name: 'Recarga Telcel' }, { id: 3, name: 'Oxio' }];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedDrivers']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedName')}</TableCell>
            <TableCell>{t('deviceIdentifier')}</TableCell>
            <TableCell>{t('groupParent')}</TableCell>
            <TableCell>{t('sharedPhone')}</TableCell>
            <TableCell>{t('deviceModel')}</TableCell>
            <TableCell>{t('deviceContact')}</TableCell>
            <TableCell>{t('userExpirationTime')}</TableCell>
            {
              admin && (
                <TableCell>Tipo sim</TableCell>
              )
            }
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? items.filter(filterByKeyword(searchKeyword)).sort((a, b) => {
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            return 0;
          }).map((item, index) => (
            <TableRow
              key={item.id}
              onMouseEnter={() => setHoveredRowIndex(index)}
              onMouseLeave={() => setHoveredRowIndex(null)}
              style={{
                backgroundColor: hoveredRowIndex === index ? '#1F6EDE22' : 'transparent', // Change background color on hover
                /* Add any other styles you want for the hover effect */
              }}
            >
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.uniqueId}</TableCell>
              <TableCell>{groups[item.groupId]?.name || t('groupNoGroup')}</TableCell>
              <TableCell>{item.phone}</TableCell>
              <TableCell>{item.model}</TableCell>
              <TableCell>{item.contact}</TableCell>
              <TableCell>{formatTime(item.expirationTime, 'date', hours12)}</TableCell>
              {
                admin && (
                  <TableCell>{simTypes.find((type) => type.id === item.simType)?.name}</TableCell>
                )
              }
              <TableCell className={classes.columnAction} padding="none">
                <CollectionActions
                  itemId={item.id}
                  editPath="/settings/device"
                  endpoint="devices"
                  setTimestamp={setTimestamp}
                  customActions={[actionConnections, groupConnections]}
                  readonly={deviceReadonly}
                />
              </TableCell>
            </TableRow>
          )) : (<TableShimmer columns={6} endAction />)}
        </TableBody>
      </Table>
      <CollectionFab editPath="/settings/device" />
    </PageLayout>
  );
};

export default DevicesPage;
