import React, { useState, useEffect, Fragment } from 'react';
import {
  List as Lista,
  ListItemButton,
  ListItemText,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { useTranslation } from '../../common/components/LocalizationProvider';

const SubrutasList = (props) => {
  const { group } = props;
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const t = useTranslation();

  useEffect(() => {
    fetch('/api/subroutes')
      .then((response) => response.json())
      .then((data) => setData(data.filter((i) => i.groupId === group)));
  }, []);

  const handleInputChange = (event) => {
    setNewItem(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch('/api/subroutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newItem, groupId: group }),
    })
      .then((response) => response.json())
      .then(() => {
        fetch('/api/subroutes')
          .then((response) => response.json())
          .then((data) => setData(data.filter((i) => i.groupId === group)));
        setNewItem('');
      });
  };

  const handleDelete = (item) => {
    fetch(`/api/subroutes/${item.id}`, {
      method: 'DELETE',
    }).then(() => {
      setData(data.filter((d) => d.id !== item.id));
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setNewItem(item.name);
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    fetch(`/api/subroutes/${editingItem.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...editingItem, name: newItem }),
    })
      .then((response) => response.json())
      .then(() => {
        fetch('/api/subroutes')
          .then((response) => response.json())
          .then((data) => setData(data.filter((i) => i.groupId === group)));
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
                <Button variant="contained" type="submit">
                  {t('sharedSave')}
                </Button>
                <Button variant="contained" type="button" onClick={() => { setEditingItem(null); setNewItem(''); }}>
                  {t('sharedCancel')}
                </Button>
              </Box>
            ) : (
              <ListItemButton>
                <ListItemText primary={item.name} />
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
          <TextField label={t('sharedEdit')} value={newItem} onChange={handleInputChange} />
          <Button variant="contained" type="submit">
            {t('sharedAdd')}
          </Button>
        </Box>
      )}
    </div>
  );
};

export default SubrutasList;
