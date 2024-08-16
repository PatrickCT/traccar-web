/* eslint-disable arrow-parens */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-confusing-arrow */
/* eslint-disable react/no-array-index-key */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/button-has-type */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  IconButton,
} from '@mui/material';
import itemsjs from 'itemsjs';
import { SaveAltOutlined } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import SelectField from '../common/components/SelectField';
import Navbar from '../common/components/NavBar';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';

const DeviceConnectionGroupPage = () => {
  const [listOne, setListOne] = useState([]);
  const [listTwo, setListTwo] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const [group, setGroup] = useState(-1);
  const [devices, setDevices] = useState([]);
  const [filter, setFilter] = useState('');
  const groups = useSelector((state) => state.groups.items);
  const t = useTranslation();

  useEffect(() => {
    fetch('/api/devices?all=true', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      .then((response) => response.json())
      .then((responseData) => {
        setDevices(responseData);
        setListOne(responseData);
      });
  }, []);

  const handleSelect = (item) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(item)) {
        return prevSelected.filter((i) => i !== item);
      }
      return [...prevSelected, item];
    });
  };

  const handleSelectAll = () => {
    setSelectedItems((prevSelected) => (prevSelected.length === listOne.length ? [] : listOne));
  };

  const moveSelectedItems = () => {
    const newListOne = listOne.filter((item) => !selectedItems.includes(item));
    setListOne(newListOne);
    setListTwo([...listTwo, ...selectedItems]);
    setSelectedItems([]);
  };

  const onDragEnd = (result) => {
    const { destination, source } = result;
    const item = listOne[source.index];

    const newListOne = listOne.filter((i) => i !== item);
    setListOne(newListOne);
    setListTwo([...listTwo, item]);
    setTimeout(() => setSelectedItems([]), 1000);
  };

  const handleChangeGroup = async () => {
    Notiflix.Block.standard('body', 'Por favor espere...', { zindex: 9999 });
    await Promise.all(listTwo.map((item) => fetch(`/api/devices/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, groupId: (group > 0 ? group : null) }),
    })));
    Notiflix.Notify.success('Listo, la pagina se recargara', { width: '100vw', opacity: '1', fontSize: '30px', success: { textColor: 'white', background: '#1a237e' } });
    window.location.reload();
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedDrivers']}>
      <Navbar
        setOpenDrawer={null}
        title="Cambio de grupos"
        titleColor="white"
      >
        <IconButton
          color="inherit"
          edge="start"
          sx={{ mr: 2 }}
          onClick={() => {
            Notiflix.Confirm.show(
              'Confirmación',
              `Estas apunto de cambiar ${listTwo.length} unidades al grupo "${groups[group]?.name || t('groupNoGroup')}", seguro que deseas continuar`,
              'Si',
              'No',
              function okCb() {
                async function changeItems() {
                  await handleChangeGroup();
                }
                changeItems();
              },
              function cancelCb() {
                window.location.reload();
              },
              {
                okButtonBackground: '#1a237e',
              },
            );
          }}
        >
          <SaveAltOutlined style={{ color: 'white' }} />
        </IconButton>
      </Navbar>
      <Box sx={{ padding: 4 }}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6">Grupo actual</Typography>
              <SelectField
                fullWidth
                value={group || -1}
                onChange={(event) => setGroup(Number(event.target.value))}
                endpoint="/api/groups?all=true"
                label={t('groupParent')}
              />
              <SearchHeader keyword={filter} setKeyword={setFilter} />
              <Button
                variant="contained"
                onClick={handleSelectAll}
                disabled={filter !== ''}
                sx={{ marginBottom: 2, marginTop: 1 }}
              >
                {selectedItems.length === listOne.length
                  ? 'Desmarcar todo'
                  : 'Marcar todo'}
              </Button>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="listOne">
                  {(provided) => (
                    <List
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      sx={{ maxHeight: '60vh', overflow: 'auto' }}
                    >
                      {listOne.filter(filterByKeyword(filter)).map((item, index) => (
                        <Draggable key={item.id} draggableId={`di-${item.id}`} index={index}>
                          {(provided) => (
                            <ListItem
                              key={`li-${item.id}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              button
                              onClick={() => handleSelect(item)}
                            >
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  checked={selectedItems.includes(item)}
                                  tabIndex={-1}
                                />
                              </ListItemIcon>
                              <ListItemText primary={`${item.name} - ${item.groupId || 'NaN'}:${groups[item.groupId]?.name || t('groupNoGroup')}`} />
                            </ListItem>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>
              <Button
                variant="contained"
                color="primary"
                onClick={moveSelectedItems}
                fullWidth
                sx={{ marginTop: 2 }}
              >
                Mover seleccionados
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6">
                Grupo nuevo
                (
                {`${group}:${groups[group]?.name || t('groupNoGroup')}`}
                )
              </Typography>
              <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                {listTwo.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`${item.name} - ${groups[group]?.name || t('groupNoGroup')}`} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
};

export default DeviceConnectionGroupPage;
