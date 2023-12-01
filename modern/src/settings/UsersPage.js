import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';

import LoginIcon from '@mui/icons-material/Login';
import LinkIcon from '@mui/icons-material/Link';
import { useCatch, useEffectAsync } from '../reactHelper';
import { formatBoolean, formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import { useManager } from '../common/util/permissions';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import { usePreference } from '../common/util/preferences';
import LoadingComponent from './components/LoadingComponent';

const UsersPage = () => {
  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();

  const hours12 = usePreference('twelveHourFormat');

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCatch(async (userId) => {
    const response = await fetch(`/api/session/${userId}`);
    if (response.ok) {
      window.location.replace('/');
    } else {
      throw Error(await response.text());
    }
  });

  const actionLogin = {
    key: 'login',
    title: t('loginLogin'),
    icon: <LoginIcon fontSize="small" />,
    handler: handleLogin,
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (userId) => navigate(`/settings/user/${userId}/connections`),
  };

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const columns = [
    { field: 'name', headerName: `${t('sharedName')}`, width: 200 },
    { field: 'email', headerName: `${t('userEmail')}`, width: 300 },
    {
      field: 'admin',
      headerName: `${t('userAdmin')}`,
      valueGetter: (params) => params.row.administrator,
      renderCell: (params) => (
        <span>
          {formatBoolean(params.row.administrator, t)}
        </span>
      ),
      width: 200,
      sortable: true,

    },
    {
      field: 'main',
      headerName: `${t('sharedMain')}`,
      valueGetter: (params) => `${formatBoolean(params.row.main, t)}`,
      width: 200,
    },
    {
      field: 'disabled',
      headerName: `${t('sharedDisabled')}`,
      valueGetter: (params) => `${formatBoolean(params.row.disabled, t)}`,
      width: 200,
    },
    {
      field: 'expirationTime',
      headerName: `${t('userExpirationTime')}`,
      valueGetter: (params) => `${formatTime(params.row.expirationTime, 'date', hours12)}`,
      width: 200,
    },
    {
      field: 'total_devices',
      headerName: 'Unidades',
      valueGetter: (params) => `${params.row.attributes?.total_devices || 0}`,
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
          editPath="/settings/user"
          endpoint="users"
          setTimestamp={setTimestamp}
          customActions={manager ? [actionLogin, actionConnections] : [actionConnections]}
        />,
      ],
    },
  ];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsUsers']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <div style={{ height: '80%', width: '100%' }}>
        <LoadingComponent isLoading={loading}>
          <DataGrid
            rows={items.filter(filterByKeyword(searchKeyword))}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 12 },
              },
            }}
            pageSizeOptions={[15, 20, 50, 100]}
          />
        </LoadingComponent>
      </div>

      <CollectionFab editPath="/settings/user" />
    </PageLayout>
  );
};

export default UsersPage;
