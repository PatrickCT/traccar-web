/* eslint-disable no-unused-vars */
import { Autocomplete, Button, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useEffectAsync } from '../../reactHelper';
import LoadingSpinner from './LoadingSpinner';

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
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState();
  const [linked, setLinked] = useState();
  const [itemsLoading, setItemsLoading] = useState();

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
        setLinked(l);
      } else {
        throw Error(await response.text());
      }
    }
  }, [active]);

  useEffect(() => {
    const loadings = {};
    (items ?? []).forEach((item) => loadings[item.id] = false);
    setItemsLoading(loadings);
  }, [items]);

  const createBody = (linkId) => {
    const body = {};
    body[keyBase] = baseId;
    body[keyLink] = linkId;
    return body;
  };

  const onChange = async (value) => {
    const loadings = itemsLoading;
    loadings[value.id] = true;
    setItemsLoading(loadings);
    setActive(!active);

    if (value.checked) {
      await fetch('/api/permissions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createBody(keyGetter(value))),
      });
    } else {
      await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createBody(keyGetter(value))),
      });
    }

    loadings[value.id] = false;
    setItemsLoading(loadings);
    setActive(!active);
  };

  const deviceColumns = [
    {
      field: 'checked',
      headerName: '',
      width: 100,
      renderCell: (params) => (
        (itemsLoading[params.row.id]) ? <span>⌛</span> : (
          <input
            type="checkbox"
            checked={params.value}
            onChange={() => onChange(params.row)}
          />
        )
      ),
    },
    { field: 'id', headerName: 'ID', width: 30 },
    { field: 'name', headerName: 'Nombre', width: 100 },
    { field: 'uniqueId', headerName: 'Imei', width: 100 },
  ];

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
    { field: 'id', headerName: 'ID', width: 33 },
    { field: 'name', headerName: 'Nombre', width: 130 },
  ];

  useEffect(() => setActive(true));

  return (
    <>
      <div style={{ height: 400, width: '100%' }}>
        <Button variant="text" disabled style={{ color: 'black', flex: 1, fontSize: 14 }}>
          {label}
        </Button>
        <DataGrid
          rows={(items ?? []).map((item) => ({ ...item, checked: (linked ?? []).some((selectedItem) => selectedItem.id === item.id) }))}
          columns={endpointAll.toString().includes('devices') ? deviceColumns : genericColumns}
          hideFooter
        />
      </div>
      <br />
    </>
  );
};

export default LinkField;
