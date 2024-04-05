import React, { useState } from 'react';
import {
  Table, TableRow, TableCell, TableHead, TableBody, Switch, TextField, Button, IconButton,
} from '@mui/material';
import { EditOutlined, LinkOutlined, Share } from '@mui/icons-material';
import dayjs from 'dayjs';
import moment from 'moment';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import makeStyles from '@mui/styles/makeStyles';
import { useEffectAsync } from '../reactHelper';
import PageLayout from '../common/components/PageLayout';
import CollectionFab from './components/CollectionFab';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import Modal from '../main/components/BasicModal';
import { useTranslation } from '../common/components/LocalizationProvider';
import './customDatePicker.css';

const useStyles = makeStyles((theme) => ({
  columnAction: {
    width: '1%',
    paddingRight: theme.spacing(1),
  },
  row: {
    display: 'flex',
  },
}));

const LinksPage = () => {
  const classes = useStyles();
  const t = useTranslation();
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [reload, setReload] = useState(false);
  const [strPhone, setStrPhone] = useState('');
  const [phones, setphones] = useState(['4433746664']);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/links');
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [showModal, reload]);

  const saveLink = async () => {
    const { isNew } = selectedItem;
    delete selectedItem.isNew;
    fetch(`/api/links/${isNew ? '' : selectedItem.id}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedItem),
    })
      .then((response) => response.json())
      .then(() => {
        setShowModal(false);
      });
  };

  const updateLink = async (link) => {
    fetch(`/api/links/${link.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link),
    })
      .then((response) => response.json())
      .then(() => {
        setReload(false);
      });
  };

  const shareLink = async () => {
    phones.forEach(async (phone) => {
      await fetch('./api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero: phone,
          msg: `${window.location.protocol}//${window.location.host}/share-location.html?code=${selectedItem.code}`,
        }),
      });

      if (selectedItem.pass !== '') {
        await fetch('./api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            numero: phone,
            msg: `La contraseña es ${selectedItem.pass}`,
          }),
        });
      }
    });
    setSelectedItem({});
  };

  // const actionConnections = {
  //   key: 'connections',
  //   title: t('sharedConnections'),
  //   icon: <LinkIcon fontSize="small" />,
  //   handler: (itinerarioId) => navigate(`/settings/schedule/${itinerarioId}/connections`),
  // };

  return (
    <PageLayout breadcrumbs={['emptyString', 'emptyString']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Valido hasta</TableCell>
            <TableCell>Codigo</TableCell>
            <TableCell>Habilitado</TableCell>
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
              <TableCell>{moment(item.limitDate).format('D/MM/YYYY')}</TableCell>
              <TableCell>{item.pass}</TableCell>
              <TableCell>{item.enabled ? 'Si' : 'No'}</TableCell>
              <TableCell className={classes.columnAction} padding="none">
                <div className={classes.row}>
                  <IconButton
                    color="inherit"
                    edge="start"
                    sx={{ mr: 2 }}
                    onClick={() => {
                      setSelectedItem({ ...item, isNew: false });
                      setShowModal(true);
                    }}
                  >
                    <EditOutlined />
                  </IconButton>
                  <IconButton
                    color="inherit"
                    edge="start"
                    sx={{ mr: 2 }}
                    onClick={() => {
                      setSelectedItem({ ...item });
                      setShowShare(true);
                    }}
                  >
                    <Share />
                  </IconButton>
                  <IconButton
                    color="inherit"
                    edge="start"
                    sx={{ mr: 2 }}
                    onClick={() => {
                      window.jsPanel.ziBase = 99999;
                      window.jsPanel.create({
                        theme: {
                          colorHeader: '#fff',
                          bgPanel: 'rgb(49,80,126)',
                        },
                        content: `<iframe src="./linkDevices.html?link=${item.id}" style="position:relative; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;">Your browser doesnt support iframes</iframe>`,
                        contentSize: {
                          width: window.innerWidth * 0.8,
                          height: window.innerHeight * 0.8,
                        },
                        headerTitle: 'Dispositivos asignados',

                        headerControls: {
                          minimize: 'remove',
                          smallify: 'remove',
                        },
                      });
                    }}
                  >
                    <LinkOutlined />
                  </IconButton>
                  <Switch
                    onChange={() => {
                      setReload(true);
                      updateLink({ ...item, enabled: !item.enabled });
                    }}
                    checked={item.enabled}
                  />
                </div>
              </TableCell>
            </TableRow>
          )) : (<TableShimmer columns={2} endAction />)}
        </TableBody>
      </Table>
      <CollectionFab onClick={() => { setSelectedItem({ limitDate: null, pass: '', isNew: true }); setShowModal(true); }} />
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedItem({}); }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            format="DD/MM/YYYY"
            value={dayjs(selectedItem.limitDate || '')}
            onChange={(newValue) => {
              setSelectedItem({ ...selectedItem, limitDate: moment.utc(newValue.toDate()) });
            }}
            className="customDatePickerWidth"
            label="Hasta cuando"
          />
        </LocalizationProvider>
        <div style={{ marginBottom: '20px' }} />
        <TextField
          fullWidth
          value={selectedItem.pass || ''}
          onChange={(event) => { setSelectedItem({ ...selectedItem, pass: event.target.value }); }}
          label={t('userPassword')}
        />
        <div style={{ marginBottom: '20px' }} />
        <Button
          disabled={selectedItem.limitDate == null}
          style={{ position: 'fixed', bottom: '0px', right: '0px' }}
          onClick={saveLink}
        >
          Guardar
        </Button>
      </Modal>

      <Modal
        isOpen={showDevices}
        onClose={() => { setShowDevices(false); }}
      >
        <iframe title="Dispositivos" src="./linkDevices" frameBorder="0" />
      </Modal>

      <Modal
        isOpen={showShare}
        onClose={() => { setShowShare(false); }}
      >
        <h3>Ingrese los numeros a los cuales desea compartirles el enlace separados por coma</h3>
        <TextField
          fullWidth
          value={strPhone}
          onChange={(event) => { setStrPhone(event.target.value); }}
          label={t('sharedPhone')}
        />

        {phones.forEach((phone) => (
          <TextField
            fullWidth
            value={phone}
            disabled
          />
        ))}

        <Button
          disabled={phones.length <= 0}
          style={{ position: 'fixed', bottom: '0px', right: '0px' }}
          onClick={() => {
            setphones(strPhone.split(','));
            setStrPhone('');
            shareLink();
            setShowShare(false);
          }}
        >
          Enviar
        </Button>
      </Modal>
    </PageLayout>
  );
};

export default LinksPage;
