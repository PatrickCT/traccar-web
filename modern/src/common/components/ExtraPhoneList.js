import React, { useState, useEffect, Fragment } from 'react';
import {
  List as Lista,
  ListItemButton,
  ListItemText,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { useTranslation } from './LocalizationProvider';

const ExtraPhoneList = (props) => {
  const { user } = props;
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const t = useTranslation();

  useEffect(() => {
    fetch(`/api/users/${user}/phones`)
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  const handleInputChange = (event) => {
    setNewItem(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch(`/api/users/${user}/phones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userid: user, phone: newItem }),
    })
      .then((response) => response.json())
      .then((data) => {
        setData([...data, data]);
        setNewItem('');
      });
  };

  const handleDelete = (item) => {
    fetch(`/api/users/${user}/phones`, {
      method: 'DELETE',
    }).then(() => {
      setData(data.filter((d) => d.id !== item.id));
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setNewItem(item.phone);
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    fetch(`/api/users/${user}/phones`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...editingItem, phone: newItem }),
    })
      .then((response) => response.json())
      .then((data) => {
        setData(
          data.map((d) => (d.id === data.id ? data : d)),
        );
        setEditingItem(null);
        setNewItem('');
      });
  };

  return (
    <div>
      <Lista>
        {data.map((item) => (
          <Fragment key={item.id}>
            {editingItem?.id === item.id ? (

              <Box component="form" sx={{ display: 'flex', gap: '10px' }} onSubmit={handleEditSubmit}>
                <TextField label="Edit Item" value={newItem} onChange={handleInputChange} />
                <Button variant="outlined" type="submit">
                  {t('sharedSave')}
                </Button>
                <Button variant="outlined" type="button" onClick={() => { setEditingItem(null); setNewItem(''); }}>
                  {t('sharedCancel')}
                </Button>
              </Box>
            ) : (
              <ListItemButton>
                <ListItemText primary={item.phone} />
                <ListItemButton onClick={() => handleDelete(item)}>
                  {t('sharedRemove')}
                </ListItemButton>
                <ListItemButton onClick={() => handleEdit(item)}>
                  {t('sharedEdit')}
                </ListItemButton>
              </ListItemButton>
            )}
          </Fragment>
        ))}
      </Lista>
      {!editingItem && (
        <Box component="form" sx={{ display: 'flex', gap: '10px' }} onSubmit={handleSubmit}>
          <TextField label="Edit Item" value={newItem} onChange={handleInputChange} />
          <Button variant="contained" type="submit">
            {t('sharedAdd')}
          </Button>

        </Box>
      )}
    </div>
  );
};

export default ExtraPhoneList;
