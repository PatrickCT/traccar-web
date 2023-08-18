/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, FormControl, FormLabel, MenuItem, InputLabel, Select,
} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import makeStyles from '@mui/styles/makeStyles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import { useCatch } from '../reactHelper';
import { groupsActions } from '../store';

const useStyles = makeStyles((theme) => ({
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const EditToolbar = (props) => {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = 1;
    setRows((oldRows) => [...oldRows, { id, name: '', age: '', isNew: true }]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Agregar tramo
      </Button>
    </GridToolbarContainer>
  );
};

const SchedulePage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const daysValues = {
    lunes: 1,
    martes: 2,
    miercoles: 4,
    jueves: 8,
    viernes: 16,
    sabado: 32,
    domingo: 64,
  };

  // const newDateStart = new Date();
  const [item, setItem] = useState();

  const binaryString = (item?.days ?? 0).toString(2).padStart(7, '0'); // Convert to binary and pad with leading zeros

  const [days, setDays] = useState({
    lunes: false,
    martes: false,
    miercoles: false,
    jueves: false,
    viernes: false,
    sabado: false,
    domingo: false,
  });

  const {
    lunes,
    martes,
    miercoles,
    jueves,
    viernes,
    sabado,
    domingo,
  } = days;

  const [subrutas, setSubrutas] = useState([]);
  const [subruta, setSubruta] = useState(0);
  const [geofences, setGeofences] = useState([]);
  const [geofence, setGeofence] = useState(0);
  const [hours, setHours] = useState([]);
  const [hour, setHour] = useState(0);

  /// Alta de tramos

  const [rows, setRows] = React.useState([]);
  const [rowModesModel, setRowModesModel] = React.useState({});

  const updateTramo = (item) => {
    fetch(`/api/tramos/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) }).then((response) => response.json()).then((data) => console.log(data));
  };

  const handleRowEditStop = (params, event) => {
    console.log('handleRowEditStop');
    console.log(params);
    console.log(event);
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    console.log('save edit');
    console.log(id);
    console.log({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    console.log('processRowUpdate');
    console.log(newRow);
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    updateTramo(newRow);
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    console.log('handleRowModesModelChange');
    console.log(newRowModesModel);
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    { field: 'name', headerName: 'Nombre', width: 180, editable: true },
    { field: 'minTime', headerName: 'Tiempo de llegada', width: 180, editable: true },
    { field: 'delay', headerName: 'Tiempo de holgura', width: 180, editable: true },
    { field: 'punishment', headerName: 'Castigo', width: 180, editable: true },
    {
      field: 'geofenceId',
      headerName: 'Geocerca',
      width: 220,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['a', 'b', 'c'],
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Opciones',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  /// fin alta de tramos

  const handleChange = (event) => {
    const newDays = {
      ...days,
      [event.target.name]: event.target.checked,
    };
    setDays(newDays);
  };

  useEffect(() => {
    const initialDaysState = {
      lunes: binaryString.charAt(6) === '1',
      martes: binaryString.charAt(5) === '1',
      miercoles: binaryString.charAt(4) === '1',
      jueves: binaryString.charAt(3) === '1',
      viernes: binaryString.charAt(2) === '1',
      sabado: binaryString.charAt(1) === '1',
      domingo: binaryString.charAt(0) === '1',
    };
    setDays(initialDaysState);
    // setStart(dayjs(newDateStart));
    fetch('/api/subroutes')
      .then((response) => response.json())
      .then((data) => setSubrutas(data));
    setSubruta(item?.subrouteId);
    fetch('/api/geofences')
      .then((response) => response.json())
      .then((data) => setGeofences(data));
    setGeofence(item?.geofenceId ?? 0);

    fetch('/api/horasalidas').then((response) => response.json()).then((data) => setHours(data.filter((item, index, self) => self.findIndex((t) => t.name === item.name) === index)));

    if (item?.id) {
      fetch('/api/tramos?scheduleId=9').then((response) => response.json()).then((data) => { setRows(data); });
    }
  }, [item?.id]);

  useEffect(() => {
    const newDays = Object.entries(days)
      .filter((item) => item[1] === true)
      .reduce((sum, [day]) => sum + daysValues[day], 0);
    setItem({
      ...item,
      days: newDays,
    });
  }, [days]);

  const updateSubruta = (evt) => {
    setSubruta(evt.target.value);
    setItem({
      ...item,
      subrouteId: evt.target.value,
    });
  };

  const updateGeocerca = (evt) => {
    setGeofence(evt.target.value);
    setItem({
      ...item,
      geofenceId: evt.target.value,
    });
  };

  const onItemSaved = useCatch(async () => {
    const response = await fetch('/api/itinerarios');
    if (response.ok) {
      dispatch(groupsActions.update(await response.json()));
    } else {
      throw Error(await response.text());
    }
  });

  const validate = () => item && item.name && item.days && item.subrouteId;

  // const linkTramo = (link = true) => {
  //   fetch('http://localhost:3090/api/permissions', { method: link ? 'POST' : 'DELETE', body: JSON.stringify({ itinerarioId: item.id, tramoId: 5 }) });
  // };

  return (
    <EditItemView
      endpoint="itinerarios"
      item={item}
      setItem={setItem}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'scheduleDialog']}
    >
      {item && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.name || ''}
                onChange={(event) => setItem({ ...item, name: event.target.value })}
                label={t('sharedName')}
              />
              <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
                <FormLabel component="legend">{t('days')}</FormLabel>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox checked={lunes} onChange={handleChange} name="lunes" />
                    }
                    label="Lunes"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={martes} onChange={handleChange} name="martes" />
                    }
                    label="Martes"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={miercoles} onChange={handleChange} name="miercoles" />
                    }
                    label="Miercoles"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={jueves} onChange={handleChange} name="jueves" />
                    }
                    label="Jueves"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={viernes} onChange={handleChange} name="viernes" />
                    }
                    label="Viernes"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={sabado} onChange={handleChange} name="sabado" />
                    }
                    label="Sabado"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={domingo} onChange={handleChange} name="domingo" />
                    }
                    label="Domingo"
                  />
                </FormGroup>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="subroute">{t('subroutes')}</InputLabel>
                <Select
                  labelId="subrouteid-label"
                  id="subrouteid"
                  value={subruta ?? 0}
                  label={t('subroutes')}
                  onChange={updateSubruta}
                >
                  {subrutas && (
                    subrutas.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)
                  )}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="geofence">Geocerca</InputLabel>
                <Select
                  labelId="geofence"
                  id="geofenceid"
                  value={geofence ?? 0}
                  label="Geocerca"
                  onChange={updateGeocerca}
                >
                  {geofences && (
                    geofences.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="horas">Tabla de salidas</InputLabel>
                <Select
                  labelId="horas"
                  id="geofenceid"
                  value={hour ?? 0}
                  label="Tabla de salidas"
                  onChange={(event) => setHour(event.target.value)}
                >
                  <MenuItem value={0}>--Sin horario--</MenuItem>
                  {hours && (
                    hours.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)
                  )}
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>
          {
            item.id && (
              <>
                <p>Tramos</p>
                <Box
                  sx={{
                    height: 500,
                    width: '100%',
                    '& .actions': {
                      color: 'text.secondary',
                    },
                    '& .textPrimary': {
                      color: 'text.primary',
                    },
                  }}
                >
                  <DataGrid
                    rows={rows}
                    columns={columns}
                    editMode="row"
                    rowModesModel={rowModesModel}
                    onRowModesModelChange={handleRowModesModelChange}
                    onRowEditStop={handleRowEditStop}
                    processRowUpdate={processRowUpdate}
                    slots={{
                      toolbar: EditToolbar,
                    }}
                    slotProps={{
                      toolbar: { setRows, setRowModesModel },
                    }}

                  />
                </Box>
              </>
            )
          }
        </>
      )}
    </EditItemView>

  );
};

export default SchedulePage;
