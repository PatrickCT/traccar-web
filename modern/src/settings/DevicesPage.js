import React, { useState } from 'react';
import { FixedSizeList } from 'react-window';
import { useNavigate } from 'react-router-dom';
import { AutoSizer } from 'react-virtualized';
import {
  Table, TableBody, TableRow, TableCell, TableHead,
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
import { isMobile } from '../common/util/utils';

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
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceTitle']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      {isMobile() ? (
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
      ) : (
        <>
          {/* Headers outside the virtualized list */}
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '200px' }}>{t('sharedName')}</TableCell>
              <TableCell style={{ width: '200px' }}>{t('deviceIdentifier')}</TableCell>
              <TableCell style={{ width: '200px' }}>{t('groupParent')}</TableCell>
              <TableCell style={{ width: '200px' }}>{t('sharedPhone')}</TableCell>
              <TableCell style={{ width: '200px' }}>{t('deviceModel')}</TableCell>
              <TableCell style={{ width: '200px' }}>{t('deviceContact')}</TableCell>
              <TableCell style={{ width: '200px' }}>{t('userExpirationTime')}</TableCell>
              {admin && <TableCell style={{ width: '200px' }}>Tipo sim</TableCell>}
              <TableCell className={classes.columnAction} style={{ width: '200px' }} />
            </TableRow>
          </TableHead>
          {
            !loading ? (
              <AutoSizer>
                {({ height, width }) => (
                  <FixedSizeList
                    height={height - 200} // Subtract the header row height from the total height
                    width={width}
                    itemCount={!loading ? items.filter(filterByKeyword(searchKeyword)).length : 1}
                    itemSize={50} // Adjust the item height as needed
                  >
                    {({ index, style }) => (
                      <TableRow
                        key={index}
                        onMouseEnter={() => setHoveredRowIndex(index)}
                        onMouseLeave={() => setHoveredRowIndex(null)}
                        style={{
                          ...style,
                          backgroundColor: hoveredRowIndex === index ? '#1F6EDE22' : 'transparent',
                        }}
                      >
                        <TableCell style={{ width: width / 9, overflow: 'hidden', textOverflow: 'ellipsis' }}>{items[index].name}</TableCell>
                        <TableCell style={{ width: width / 9, overflow: 'hidden', textOverflow: 'ellipsis' }}>{items[index].uniqueId}</TableCell>
                        <TableCell style={{ width: width / 9, overflow: 'hidden', textOverflow: 'ellipsis' }}>{groups[items[index].groupId]?.name || t('groupNoGroup')}</TableCell>
                        <TableCell style={{ width: width / 9, overflow: 'hidden', textOverflow: 'ellipsis' }}>{items[index].phone}</TableCell>
                        <TableCell style={{ width: width / 9, overflow: 'hidden', textOverflow: 'ellipsis' }}>{items[index].model || 'Sin modelo'}</TableCell>
                        <TableCell style={{ width: width / 9, overflow: 'hidden', textOverflow: 'ellipsis' }}>{items[index].contact || 'Sin contacto'}</TableCell>
                        <TableCell style={{ width: width / 9, overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatTime(items[index].expirationTime, 'date', hours12) || 'Sin caducidad'}</TableCell>
                        {
                          admin && (
                            <TableCell style={{ width: width / 10 }}>{simTypes.find((type) => type.id === items[index].simType)?.name}</TableCell>
                          )
                        }
                        <TableCell style={{ width: width / 9 }} className={classes.columnAction} padding="none">
                          <CollectionActions
                            itemId={items[index].id}
                            editPath="/settings/device"
                            endpoint="devices"
                            setTimestamp={setTimestamp}
                            customActions={[actionConnections, groupConnections]}
                            readonly={deviceReadonly}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </FixedSizeList>
                )}
              </AutoSizer>
            ) : (<TableShimmer columns={6} endAction />)
          }
        </>
      )}
      <CollectionFab editPath="/settings/device" />
    </PageLayout>
  );
};

export default DevicesPage;
