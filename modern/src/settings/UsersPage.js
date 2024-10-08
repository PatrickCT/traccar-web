/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Drawer } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LinkIcon from '@mui/icons-material/Link';
import { GarageOutlined } from '@mui/icons-material';
import Fuse from 'fuse.js';
import { encode } from 'base-64';
import { useDispatch } from 'react-redux';
import { useCatch, useEffectAsync } from '../reactHelper';
import { formatBoolean, formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import { useManager, useSupport } from '../common/util/permissions';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import { usePreference } from '../common/util/preferences';
import LoadingComponent from './components/LoadingComponent';
import { sessionActions } from '../store';
import UserDevicesPage from './UserDevicesPage';

const UsersPage = () => {
  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();
  const support = useSupport();
  const dispatch = useDispatch();

  const hours12 = usePreference('twelveHourFormat');

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    right: false,
    client: null,
  });

  const handleLogin = useCatch(async (userId) => {
    const response = await fetch(`/api/session/${userId}`);
    if (response.ok) {
      const user = await response.json();
      localStorage.setItem('dXNlcg==', encode(JSON.stringify(user)));
      dispatch(sessionActions.updateUser(user));
      window.location.replace('/');
    } else {
      throw Error(await response.text());
    }
  });

  const isMatch = (obj, searchValue) => {
    if (!searchValue || searchValue === '') return true;
    if (!obj) return false;
    const fuse = new Fuse([obj], {
      includeScore: true,
      shouldSort: true,
      isCaseSensitive: false,
      includeMatches: true,
      ignoreLocation: true,
      keys: [
        // {name: 'name', getFn: (item) => item.name}
        'name', 'email',
      ],
    });
    const result = fuse.search(searchValue);

    return (result.length > 0 && result[0].score <= 0.11);
  };

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

  const actionDevices = {
    key: 'devices',
    title: t('deviceTitle'),
    icon: <GarageOutlined fontSize="small" />,
    handler: (userId) => setState({ ...state, client: userId, right: true }),
  };

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const users = await response.json();
        setItems(users);
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
      valueGetter: (_, params) => params.administrator,
      renderCell: (params) => (
        <span>
          {formatBoolean(params.administrator, t)}
        </span>
      ),
      width: 200,
    },
    {
      field: 'main',
      headerName: `${t('sharedMain')}`,
      valueGetter: (_, params) => `${formatBoolean(params.main, t)}`,
      width: 200,
    },
    {
      field: 'disabled',
      headerName: `${t('sharedDisabled')}`,
      valueGetter: (_, params) => `${formatBoolean(params.disabled, t)}`,
      width: 200,
    },
    {
      field: 'total_devices',
      headerName: 'Unidades',
      valueGetter: (_, params) => `${params.attributes?.total_devices || 0}`,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Opciones',
      width: 200,
      cellClassName: 'actions',
      getActions: ({ id }) => [
        <CollectionActions
          itemId={id}
          editPath="/settings/user"
          endpoint="users"
          setTimestamp={setTimestamp}
          customActions={(manager && !support) ? [actionLogin, actionConnections, actionDevices] : [actionConnections]}
        />,
      ],
    },
  ];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsUsers']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Box sx={{ height: '80%', width: '100%' }}>
        <LoadingComponent isLoading={loading}>
          <DataGrid
            rows={items.filter((item) => (searchKeyword === '' ? true : isMatch(item, searchKeyword)))}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 12 },
              },
            }}
            pageSizeOptions={[12, 20, 50, 100]}
          />
        </LoadingComponent>
      </Box>
      <CollectionFab editPath="/settings/user" />
      <Drawer
        anchor="right"
        open={state.right}
        onClose={toggleDrawer('right', false)}
      >
        <UserDevicesPage id={state.client} />
      </Drawer>
    </PageLayout>
  );
};

export default UsersPage;
