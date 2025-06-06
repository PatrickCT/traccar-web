import { LinkOffOutlined } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useState } from 'react';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import { useAdministrator, useDeviceReadonly } from '../common/util/permissions';
import { confirmDialog } from '../common/util/utils';
import { useEffectAsync } from '../reactHelper';
import CollectionActions from './components/CollectionActions';
import LoadingComponent from './components/LoadingComponent';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';

const UserDevicesPage = ({ id }) => {
  const t = useTranslation();
  const admin = useAdministrator();

  const deviceReadonly = useDeviceReadonly();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [deviceId, setDeviceId] = useState(null);

  const actionUnlink = {
    key: 'unlinkDevice',
    title: t('deviceTitle'),
    icon: <LinkOffOutlined fontSize="small" />,
    handler: (deviceId) => confirmDialog(() => setDeviceId(deviceId)),
  };

  useEffectAsync(async () => {
    if (deviceId) {
      setLoading(true);
      await fetch('/api/permissions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: id, deviceId }) });
      setDeviceId(null);
      setTimestamp(new Date());
    }
  }, [deviceId]);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/devices/user/${id}`);
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }

      const responseGroups = await fetch(`/api/groups?userId=${id}`);
      if (responseGroups.ok) {
        setGroups(await responseGroups.json());
      } else {
        throw Error(await responseGroups.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const simTypes = [{ id: 0, name: 'Tipo no asignado' }, { id: 1, name: 'Plan Telcel' }, { id: 2, name: 'Recarga Telcel' }, { id: 3, name: 'Oxio' }];

  const columns = [
    { field: 'name', headerName: `${t('sharedName')}`, width: 200 },
    { field: 'uniqueId', headerName: `${t('deviceIdentifier')}`, width: 200 },
    {
      field: 'groupParent',
      headerName: `${t('groupParent')}`,
      width: 150,
      valueGetter: (_, params) => `${groups.find((g) => g.id === params?.groupId)?.name || t('groupNoGroup')}`,
    },
    { field: 'phone', headerName: `${t('sharedPhone')}`, width: 200 },
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
          customActions={[...(admin ? [actionUnlink] : [])]}
          readonly={deviceReadonly}
        />,
      ],
    },
  ];

  const filterColumns = admin ? [] : ['phone', 'model', 'simType'];

  return (
    <PageLayout breadcrumbs={['settingsTitle', 'deviceTitle']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <div style={{ height: '80%', width: '100%', maxWidth: '90vw' }}>
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
            pageSizeOptions={[15, 20, 50, 100]}
          />
        </LoadingComponent>
      </div>

    </PageLayout>
  );
};

export default UserDevicesPage;
