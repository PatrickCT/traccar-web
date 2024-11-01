import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import LinkIcon from '@mui/icons-material/Link';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import { useSelector } from 'react-redux';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import { usePreference } from '../common/util/preferences';
import { formatTime } from '../common/util/formatter';
import { useAdministrator, useDeviceReadonly } from '../common/util/permissions';
import LoadingComponent from './components/LoadingComponent';

const DevicesPage = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const admin = useAdministrator();

  const hours12 = usePreference('twelveHourFormat');

  const deviceReadonly = useDeviceReadonly();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const groups = useSelector((state) => state.groups.items);

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
    { field: 'phone', headerName: `${t('sharedPhone')}`, width: 200 },
    { field: 'model', headerName: `${t('deviceModel')}`, width: 150 },
    { field: 'contact', headerName: `${t('deviceContact')}`, width: 200 },
    {
      field: 'userExpirationTime',
      headerName: `${t('userExpirationTime')}`,
      width: 100,
      valueGetter: (_, params) => `${formatTime(params?.expirationTime, 'date', hours12)}`,
    },
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
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => [
        <CollectionActions
          itemId={id}
          editPath="/settings/device"
          endpoint="devices"
          setTimestamp={setTimestamp}
          customActions={[actionConnections, groupConnections]}
          readonly={deviceReadonly}
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
    </PageLayout>
  );
};

export default DevicesPage;
