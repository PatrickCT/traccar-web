import { AirlineSeatReclineNormalSharp, DriveEtaSharp } from '@mui/icons-material';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import LinkIcon from '@mui/icons-material/Link';
import {
  Box, Card, CardContent, Divider, Drawer, List, Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
// import { formatTime } from '../common/util/formatter';
import { useAdministrator, useDeviceReadonly, useSupport } from '../common/util/permissions';
// import { usePreference } from '../common/util/preferences';

import { useEffectAsync } from '../reactHelper';
import CollectionActions from './components/CollectionActions';
import CollectionFab from './components/CollectionFab';
import LoadingComponent from './components/LoadingComponent';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import SettingsMenu from './components/SettingsMenu';

const DevicesPage = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const admin = useAdministrator();

  // const hours12 = usePreference('twelveHourFormat');

  const deviceReadonly = useDeviceReadonly();
  const support = useSupport();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const groups = useSelector((state) => state.groups.items);

  const [state, setState] = useState({
    right: false,
    client: null,
  });
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(false);

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/devices?all=true');
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  useEffectAsync(async () => {
    setDrivers([]);
    setDriversLoading(true);
    try {
      const response = await fetch(`/api/drivers?deviceId=${state.client || 0}`);
      if (response.ok) {
        setDrivers(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setDriversLoading(false);
    }
  }, [state.client]);

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
    handler: () => navigate('/settings/device/groups'),
  };

  const driverConnections = {
    key: 'drivers',
    title: t('settingsDrivers'),
    icon: <AirlineSeatReclineNormalSharp fontSize="small" />,
    handler: (deviceId) => setState({ ...state, client: deviceId, right: true }),
  };

  const simTypes = [{ id: 0, name: 'Tipo no asignado' }, { id: 1, name: 'Plan Telcel' }, { id: 2, name: 'Recarga Telcel' }, { id: 3, name: 'Oxio' }];

  const columns = [
    { field: 'name', headerName: `${t('sharedName')}`, width: 200 },
    { field: 'uniqueId', headerName: `${t('deviceIdentifier')}`, width: 200 },
    {
      field: 'groupParent',
      headerName: `${t('groupParent')}`,
      width: 150,
      valueGetter: (_, params) => `${groups[params?.groupId]?.name || t('groupNoGroup')}`,
    },
    { field: 'phone', headerName: `${t('sharedPhone')}`, width: 150 },
    { field: 'model', headerName: `${t('deviceModel')}`, width: 120 },
    { field: 'contact', headerName: `${t('deviceContact')}`, width: 100 },
    // {
    //   field: 'userExpirationTime',
    //   headerName: `${t('userExpirationTime')}`,
    //   width: 100,
    //   valueGetter: (_, params) => `${formatTime(params?.expirationTime, 'date', hours12)}`,
    // },
    {
      field: 'simType',
      headerName: 'Tipo sim',
      width: 200,
      valueGetter: (_, params) => `${simTypes.find((type) => type.id === (params.simType || 0))?.name}`,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Opciones',
      width: 160,
      cellClassName: 'actions',
      getActions: ({ id }) => [
        <CollectionActions
          itemId={id}
          editPath="/settings/device"
          endpoint="devices"
          setTimestamp={setTimestamp}
          customActions={[actionConnections, groupConnections, ...(admin ? [driverConnections] : [])]}
          readonly={deviceReadonly}
          remove={admin && !support}
        />,
      ],
    },
  ];

  const filterColumns = admin ? [] : ['phone', 'model', 'simType'];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceTitle']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <div style={{ height: '80%', width: '100%' }}>
        <LoadingComponent isLoading={loading}>
          <DataGrid
            autoHeight={false}
            rows={items.filter(filterByKeyword(searchKeyword))}
            columns={columns.filter((c) => !filterColumns.includes(c.field))}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 12 },
              },
            }}
            pageSizeOptions={[12, 20, 50, 100]}
          />
        </LoadingComponent>
      </div>
      <CollectionFab editPath="/settings/device" />
      <Drawer
        anchor="right"
        open={state.right}
        onClose={toggleDrawer('right', false)}
      >
        <Box width={400} p={2}>
          <Typography variant="h5" gutterBottom>
            Lista de Conductores
          </Typography>
          <LoadingComponent isLoading={driversLoading}>
            <List>
              {drivers.map((driver) => (
                <Card
                  key={driver.id}
                  variant="outlined"
                  sx={{ mb: 2, borderRadius: 3, boxShadow: 3 }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <DriveEtaSharp color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">{driver.name}</Typography>
                    </Box>

                    <Divider sx={{ mb: 1 }} />

                    <Typography variant="body2" color="text.secondary">
                      <strong>ID:</strong>
                      {driver.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Dirección:</strong>
                      {driver.uniqueId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Licencia:</strong>
                      {driver.license}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Vigencia:</strong>
                      {driver.licenseVigency}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Teléfono:</strong>
                      {driver.phone}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Edad:</strong>
                      {driver.age}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </List>
          </LoadingComponent>
        </Box>
      </Drawer>
    </PageLayout>
  );
};

export default DevicesPage;
