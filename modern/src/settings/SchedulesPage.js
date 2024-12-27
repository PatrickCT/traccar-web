import React, { useState } from 'react';
import {
  Table, TableRow, TableCell, TableHead, TableBody,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LinkIcon from '@mui/icons-material/Link';
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
import SearchSelect from '../reports/components/SearchableSelect';

const useStyles = makeStyles((theme) => ({
  columnAction: {
    width: '1%',
    paddingRight: theme.spacing(1),
  },
}));

const SchedulesPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [horas, setHoras] = useState([]);
  const geofences = useSelector((state) => state.geofences.items);
  const subroutes = useSelector((state) => state.subroutes.items);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/itinerarios');
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }

      const response2 = await fetch('/api/horasalidas');
      if (response2.ok) {
        const d = ((data) => data.filter((i) => !!i).filter((item, index, self) => self.findIndex((t) => t?.group_uuid === item?.group_uuid) === index))(await response2.json());
        setHoras(d);
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffectAsync(async () => {
    await load();
  }, [timestamp]);

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (itinerarioId) => navigate(`/settings/schedule/${itinerarioId}/connections`),
  };

  const update = (item, hour) => {
    setLoading(true);
    fetch(`/api/itinerarios/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...item, horasId: hour }),
    }).then(() => {
      load();
    });
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsSchedules']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedName')}</TableCell>
            <TableCell>{t('sharedSubroute')}</TableCell>
            <TableCell>{t('sharedGeofence')}</TableCell>
            <TableCell>{t('sharedGeofence')}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? items.filter(filterByKeyword(searchKeyword)).sort((a, b) => {
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            return 0;
          }).map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{subroutes[item.subrouteId].name}</TableCell>
              <TableCell>{geofences[item.geofenceId]?.name || ''}</TableCell>
              <TableCell>
                <SearchSelect
                  fullWidth
                  labelId="horas"
                  id="horasid"
                  value={item?.horasId || ''}
                  label="Tabla de salidas"
                  onChange={(evt) => {
                    update(item, evt.target.value);
                  }}
                  data={horas}
                />
              </TableCell>
              <TableCell className={classes.columnAction} padding="none">
                <CollectionActions
                  itemId={item.id}
                  editPath="/settings/schedule"
                  endpoint="itinerarios"
                  setTimestamp={setTimestamp}
                  customActions={[actionConnections]}
                />
              </TableCell>
            </TableRow>
          )) : (<TableShimmer columns={2} endAction />)}
        </TableBody>
      </Table>
      <CollectionFab editPath="/settings/schedule" />
    </PageLayout>
  );
};

export default SchedulesPage;
