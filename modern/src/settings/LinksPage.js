/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable import/no-extraneous-dependencies */
import React, { memo, useEffect, useState } from 'react';
import ClipboardJS from 'clipboard';
import { Wizard, useWizard } from 'react-use-wizard';
import {
  Table, TableRow, TableCell, TableHead, TableBody, Switch, TextField, Button, IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  CopyAllOutlined, DeleteOutlined, EditOutlined, Share,
} from '@mui/icons-material';
import moment from 'moment';
import makeStyles from '@mui/styles/makeStyles';
import { useEffectAsync } from '../reactHelper';
import PageLayout from '../common/components/PageLayout';
import CollectionFab from './components/CollectionFab';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import Modal from '../main/components/BasicModal';
import { useTranslation } from '../common/components/LocalizationProvider';
import './customDatePicker.css';
import { toast } from '../common/util/toasts';
import LinkDevices from './components/LinkDevices';
import { confirmDialog } from '../common/util/utils';
import CreateLink from './components/CreateLink';

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
  const [phones, setphones] = useState([]);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const steps = ['1.-Crear/Editar enlace', '2.-Asignar unidades', '3.-Compartir'];
  const [activeStep, setActiveStep] = useState(0);

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
      setReload(false);
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
      .then((data) => {
        setSelectedItem(data);
        setReload(true);
      }).catch((err) => toast.toast(err.message));
  };

  const updateLink = async (link) => {
    fetch(`/api/links/${link.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link),
    })
      .then((response) => response.json())
      .then(() => {
        setReload(true);
      });
  };

  const deleteLink = async (id) => {
    confirmDialog((async () => {
      await fetch(`/api/links/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      setReload(true);
    }), (() => {
      toast.toast('Enlace no borrado');
      setReload(true);
    }));
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

  const AssignUnits = () => {
    const { handleStep, nextStep } = useWizard();
    handleStep(() => { });

    return (
      <>
        <h3>Elija los dispositivos que desea compartir</h3>
        <LinkDevices link={selectedItem?.id ?? 10} />
        <Button
          style={{ position: 'fixed', bottom: '0px', right: '0px' }}
          onClick={() => {
            nextStep();
            setActiveStep(2);
          }}
        >
          Compartir
        </Button>
      </>
    );
  };

  const copyLink = (code = null) => {
    toast.toast('Enlace copiado');
    ClipboardJS.copy(`${window.location.protocol}//${window.location.host}/share-location.html?code=${selectedItem?.code || code || ''}`);
  };

  const ShareLink = () => {
    const { handleStep } = useWizard();
    handleStep(() => { });

    return (
      <>
        <h3>Seleccione una forma de compartir el enlace</h3>
        <List sx={{ width: '100%', height: '60%', bgcolor: 'background.paper', overflowY: 'auto' }}>
          {[{
            id: 0,
            label: 'Copiar link',
            onClik: (() => {
              copyLink();
            }),
          }].map((value) => {
            const labelId = `checkbox-list-label-${value}`;

            return (
              <ListItem
                key={value.id}
                disablePadding
              >
                <ListItemButton role={undefined} onClick={value.onClik} dense>
                  <ListItemIcon>
                    <Share />
                  </ListItemIcon>
                  <ListItemText id={labelId} primary={`${value.label}`} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </>
    );
  };

  return (
    <PageLayout breadcrumbs={['emptyString', 'emptyString']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Valido hasta</TableCell>
            <TableCell>Se comparte con</TableCell>
            <TableCell>Contraseña</TableCell>
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
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.pass}</TableCell>
              <TableCell>{item.enabled ? 'Si' : 'No'}</TableCell>
              <TableCell className={classes.columnAction} padding="none">
                <div className={classes.row}>
                  <IconButton
                    color="inherit"
                    edge="start"
                    sx={{ mr: 2 }}
                    onClick={async () => {
                      setSelectedItem({ ...item, isNew: false });
                      copyLink(item.code);
                    }}
                  >
                    <CopyAllOutlined />
                  </IconButton>
                  <IconButton
                    color="inherit"
                    edge="start"
                    sx={{ mr: 2 }}
                    onClick={() => {
                      setSelectedItem({ ...item, isNew: false });
                      setActiveStep(0);
                      setShowModal(true);
                    }}
                  >
                    <EditOutlined />
                  </IconButton>
                  <IconButton
                    color="inherit"
                    edge="start"
                    sx={{ mr: 2 }}
                    onClick={async () => {
                      setSelectedItem({ ...item, isNew: false });
                      await deleteLink(item.id);
                    }}
                  >
                    <DeleteOutlined />
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
      <CollectionFab disabled={subModalOpen} onClick={() => { setSelectedItem({ limitDate: null, pass: '', isNew: true }); setShowModal(true); setSubModalOpen(true); setActiveStep(0); }} />
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedItem({}); setSubModalOpen(false); }}
        zIndex={2000}
        style={{ height: '70vh' }}
      >
        <Stepper activeStep={activeStep}>
          {steps.map((label, _index) => {
            const stepProps = {};
            const labelProps = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <Wizard>
          <CreateLink
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onClick={(() => {
              if (!selectedItem.id) {
                saveLink();
              }
              if (selectedItem.id) {
                updateLink(selectedItem);
              }
              setActiveStep(1);
            })}
          />
          <AssignUnits />
          <ShareLink />
        </Wizard>
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
        zIndex={1001}
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
          style={{ position: 'fixed', bottom: '0px', right: '100px' }}
          onClick={() => {
            toast.toast('Enlace copiado');
            ClipboardJS.copy(`${window.location.protocol}//${window.location.host}/share-location.html?code=${selectedItem?.code || ''}`);
          }}
        >
          Copiar enlace
        </Button>
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

export default memo(LinksPage);
