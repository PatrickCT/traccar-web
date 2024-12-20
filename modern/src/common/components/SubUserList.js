/* eslint-disable no-unused-vars */
import React, {
  Box, Button, List, ListItemButton, ListItemText, TextField,
} from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from './LocalizationProvider';

const SubUserList = ({ user }) => {
  const [data, setData] = useState([]);
  const [subUser, setSubUser] = useState({ user });
  const t = useTranslation();

  const handleSubmit = (event) => {
    event.preventDefault();
    const isNew = (!subUser.id);
    fetch('/api/subusers', {
      method: (!isNew ? 'PUT' : 'POST'),
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...subUser }),
    })
      .then((response) => response.json())
      .then((d) => {
        setData([...data.map((item) => (item.id !== d.id ? item : d)), ...(isNew ? [d] : [])]);
      });

    setSubUser({});
  };

  useEffect(() => {
    fetch(`/api/subusers/get/${user}`)
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  return (
    <div>
      <List>
        {data.map((item) => (
          <Fragment key={item.id}>
            <ListItemButton>
              <ListItemText primary={item.name} />
              {/* <ListItemButton onClick={() => { }}>
                {t('sharedRemove')}
              </ListItemButton> */}
              <ListItemButton onClick={() => { setSubUser(item); }}>
                {t('sharedEdit')}
              </ListItemButton>
            </ListItemButton>

          </Fragment>
        ))}
      </List>
      <Box component="form" sx={{ display: 'flex', gap: '10px' }} onSubmit={handleSubmit}>
        <TextField label="Usuario" value={subUser.name || ''} onChange={(event) => setSubUser((prev) => ({ ...prev, name: event.target.value }))} />
        <TextField label="Contraseña" value={subUser.pass || ''} onChange={(event) => setSubUser((prev) => ({ ...prev, pass: event.target.value }))} />
        <Button variant="contained" type="submit">
          {t(`${subUser.id ? 'sharedSave' : 'sharedAdd'}`)}
        </Button>
        {subUser.id && (
          <Button variant="contained" onClick={() => setSubUser({})}>
            {t('sharedCancel')}
          </Button>
        )}
      </Box>
    </div>
  );
};

export default SubUserList;
