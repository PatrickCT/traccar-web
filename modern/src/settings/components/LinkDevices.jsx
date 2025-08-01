import {
  Checkbox,
  FormControlLabel,
  List, ListItem,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import LoadingComponent from './LoadingComponent';
import SearchHeader from './SearchHeader';

const LinkDevices = ({ link }) => {
  const devices = Object.keys(useSelector((state) => state.devices.items)).map(
    (k) => useSelector((state) => state.devices.items)[k],
  );
  const [checked, setChecked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  const handleToggle = async (value) => {
    if (checked.includes(value.id)) {
      setChecked(checked.filter((c) => c !== value.id));
      await fetch('./api/permissions', {
        method: 'DELETE', // or 'PUT'
        body: JSON.stringify({ linkId: link, deviceId: value.id }), // data can be `string` or {object}!
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      setChecked([...checked, value.id]);
      await fetch('./api/permissions', {
        method: 'POST', // or 'PUT'
        body: JSON.stringify({ linkId: link, deviceId: value.id }), // data can be `string` or {object}!
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  };

  useEffect(() => {
    fetch(`./api/links/${link}/devices`, {
      method: 'GET', // or 'PUT'
      // data can be `string` or {object}!
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setChecked(data.map((i) => i.id));
        setLoading(false);
      });
  }, [link]);

  return (
    <LoadingComponent
      isLoading={loading}
      style={{ height: '280px' }}
    >
      <SearchHeader
        keyword={keyword}
        setKeyword={setKeyword}
      />
      <List
        sx={{
          width: '100%',
          height: '500px', // Set a specific height for the list
          maxHeight: '100%',
          bgcolor: 'background.paper',
          overflowY: 'auto', // Enables vertical scrolling when the content overflows
        }}
      >
        {devices.filter((d) => d.name.toLowerCase().includes(keyword)).map((value) => (
          <ListItem key={value.id} disablePadding>
            <FormControlLabel control={<Checkbox onChange={() => handleToggle(value)} checked={checked.includes(value.id)} />} label={`${value.name}`} />
          </ListItem>
        ))}
      </List>
    </LoadingComponent>
  );
};

export default LinkDevices;
