/* eslint-disable no-unused-vars */
import {
  Box,
  Button,
  LinearProgress,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useEffectAsync } from '../../reactHelper';
import { useTranslation } from './LocalizationProvider';
import { confirmDialog } from '../util/utils';

const LinkField = ({
  label,
  endpointAll,
  endpointLinked,
  baseId,
  keyBase,
  keyLink,
  keyGetter = (item) => item.id,
  titleGetter = (item) => item.name,
}) => {
  const [active, setActive] = useState(false);
  const [items, setItems] = useState([]);
  const [linked, setLinked] = useState([]);
  const [bulk, setBulk] = useState([]);

  const t = useTranslation();

  useEffectAsync(async () => {
    if (active) {
      const response = await fetch(endpointAll);
      if (response.ok) {
        const i = await response.json();
        setItems(i);
      } else {
        throw Error(await response.text());
      }
    }
  }, [active]);

  useEffectAsync(async () => {
    if (active) {
      const response = await fetch(endpointLinked);
      if (response.ok) {
        const l = await response.json();
        setLinked(l.map((i) => i.id));
      } else {
        throw Error(await response.text());
      }
    }
  }, [active]);

  const createBody = (linkId) => {
    const body = {};
    body[keyBase] = baseId;
    body[keyLink] = linkId;
    return body;
  };

  const onChange = async (value) => {
    setActive(false);
    // setItems((old) => old.map((item) => (item.id !== value.id ? item : { ...value, checked: !value.checked })));

    if (value.checked) {
      setLinked((old) => old.filter((i) => i !== value.id));
      await fetch('/api/permissions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createBody(keyGetter(value))),
      });
    } else {
      setLinked((old) => [...old, value.id]);
      await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createBody(keyGetter(value))),
      });
    }
  };

  const removeAll = async () => {
    await fetch('/api/permissions/bulk', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(linked.map((id) => createBody(id.toString()))),
    });
    window.location.reload();
  };

  const deviceColumns = [
    {
      field: 'checked',
      headerName: '',
      width: 100,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={params.value}
          onChange={() => onChange(params.row)}
        />
      ),
    },
    { field: 'id', headerName: 'ID', width: 30 },
    { field: 'name', headerName: 'Nombre', width: 200 },
    { field: 'uniqueId', headerName: 'Imei', width: 200 },
  ];

  const genericColumnsKeyField = (str) => ((options) => (options[Object.keys(options).find((key) => str.includes(key))] || 'name'))({ commands: 'description', notifications: 'type' });
  const genericColumns = [
    {
      field: 'checked',
      headerName: '',
      width: 100,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={params.value}
          onChange={() => onChange(params.row)}
        />
      ),
    },
    { field: 'id', headerName: 'ID', width: 50 },
    { field: genericColumnsKeyField(endpointAll), headerName: 'Nombre', width: 230 },
  ];

  useEffect(() => setActive(true), []);

  return (
    <>
      <div style={{ height: 400, width: '100%' }}>
        <div style={{ width: '100%', display: 'flex' }}>
          <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 14, display: 'inline-block' }}>
            {label}
          </Button>
          <div style={{ flex: 10, display: 'inline-block', paddingTop: '18px' }} />
          {
            linked.length > 0 && (
              <Button
                variant="text"
                style={{ color: 'black', flex: 1, fontSize: 14, display: 'inline-block' }}
                onClick={() => {
                  confirmDialog((async () => removeAll()), (() => { }));
                }}
              >
                {t('sharedRemove')}
                &nbsp;
                {t('sharedAll')}
              </Button>
            )
          }
          {/* <FormGroup style={{ flex: 9, display: 'inline-block' }}>
            <FormControlLabel control={<Switch checked={bulk} onChange={(evt) => setBulk(evt.target.checked)} />} label="Masivo" />
          </FormGroup>
          {bulk && (
            <IconButton style={{ flex: 1, display: 'inline-block' }}>
              <SaveOutlined />
            </IconButton>
          )} */}
        </div>
        <DataGrid
          style={{ flex: 12 }}
          rows={(items ?? []).map((item) => ({ ...item, checked: (linked).includes(item.id) }))}
          columns={endpointAll.toString().includes('devices') ? deviceColumns : genericColumns}
          hideFooter
        />
      </div>
      <br />
    </>
  );
};

export default LinkField;
