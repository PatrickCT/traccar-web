/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, FormControl, FormLabel, MenuItem, InputLabel, Select, Snackbar,
} from '@mui/material';
import moment from 'moment';
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
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import makeStyles from '@mui/styles/makeStyles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import { useCatch } from '../reactHelper';
import { groupsActions } from '../store';
import SearchSelect from '../reports/components/SearchableSelect';

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
  const user = useSelector((state) => state.session.user);

  const [notifications, setNotifications] = useState([]);

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

  const [horas, setHoras] = useState(item?.attributes?.hours || {
    1: { desde: [], hasta: [] },
    2: { desde: [], hasta: [] },
    4: { desde: [], hasta: [] },
    8: { desde: [], hasta: [] },
    16: { desde: [], hasta: [] },
    32: { desde: [], hasta: [] },
    64: { desde: [], hasta: [] },
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
  const [hourRel, setHourRel] = useState(0);
  const [reload, setReload] = useState(false);

  /// Alta de tramos

  const [rows, setRows] = React.useState([]);
  const [rowModesModel, setRowModesModel] = React.useState({});

  const linkTramo = (tramo, link = true) => {
    fetch('/api/permissions', { method: link ? 'POST' : 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itinerarioId: item.id, tramoId: tramo }) });
  };

  const saveTramo = (tramo) => {
    const { isNew } = tramo;
    tramo.geofenceId = (geofences.find((geofence) => geofence.id === tramo.geofenceId))?.id || (item?.geofenceId || null);
    tramo.minTime = Number(tramo.minTime);
    tramo.delay = Number(tramo.delay);
    tramo.punishment = Number(tramo.punishment);
    if (tramo.isNew) {
      delete tramo.id; // Remove the 'id' key
    }
    delete tramo.age; // Remove the '
    delete tramo.isNew;

    fetch(`/api/tramos/${isNew ? '' : tramo.id}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tramo),
    })
      .then((response) => response.json())
      .then((data) => {
        if (isNew) {
          linkTramo(data.id, true);
          setReload(true);
        }
      });
  };

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    setRows(rows.filter((row) => row.id !== id));
    fetch(`/api/tramos/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    linkTramo(id, false);
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
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    saveTramo(newRow);

    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    { field: 'name', headerName: 'Nombre', width: 180, editable: true },
    { field: 'minTime', headerName: 'Tiempo de llegada', width: 180, editable: true },
    // { field: 'delay', headerName: 'Tiempo de holgura', width: 180, editable: true },
    { field: 'punishment', headerName: 'Castigo', width: 180, editable: true },
    {
      field: 'geofenceId',
      headerName: 'Geocerca',
      width: 220,
      editable: true,
      type: 'singleSelect',
      valueOptions: geofences.map((geofence) => ({ value: geofence.id, label: geofence?.name })),
      value: (params) => {
        const geofence = geofences.find((g) => g.id === params.value);
        return geofence ? (geofence?.name || 'Sin nombre') : ''; // Return the name of the geofence based on the provided value
      },
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

    fetch('/api/horasalidas').then((response) => response.json()).then((data) => setHours(data.filter((item, index, self) => self.findIndex((t) => t?.name === item?.name) === index)));

    if (item?.id) {
      fetch(`/api/tramos?scheduleId=${item?.id}`).then((response) => response.json()).then((data) => { setRows(data); });
    }

    setHoras(item?.attributes?.hours || {
      1: { desde: [], hasta: [] },
      2: { desde: [], hasta: [] },
      4: { desde: [], hasta: [] },
      8: { desde: [], hasta: [] },
      16: { desde: [], hasta: [] },
      32: { desde: [], hasta: [] },
      64: { desde: [], hasta: [] },
    });
    setReload(false);
  }, [item?.id, reload]);

  useEffect(() => {
    try {
      const newDays = Object.entries(days)
        .filter((item) => item[1] === true)
        .reduce((sum, [day]) => sum + daysValues[day], 0);
      setItem({
        ...item,
        days: newDays,
      });
    } catch (e) {
      setNotifications([{ id: 0, show: true, message: 'Error', snackBarDurationLongMs: 2000 }]);
    }
  }, [days]);

  useEffect(() => {
    setItem({ ...{ ...item, attributes: { ...item?.attributes, hours: horas } } });
  }, [horas]);

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

  const updateHora = (evt) => {
    setHour(evt.target.value);
    setItem({
      ...item,
      horasId: evt.target.value,
    });
  };

  const updateHoraRel = (evt) => {
    setHourRel(evt.target.value);
    setItem({
      ...item,
      horasIdRel: evt.target.value,
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

  const validate = () => item && item?.name && item.days && item.subrouteId;

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
                value={item?.name || ''}
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
                  {lunes && (

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={['TimePicker', 'TimePicker']}>
                        <DemoItem>
                          <TimePicker
                            label={t('reportStartTime')}
                            value={dayjs(new Date(new Date().setHours((horas[1].desde[0] - Math.floor((new Date().getTimezoneOffset()) / 60)) || 0, horas[1].desde[1] || 0)))}
                            onChange={(newValue) => {
                              setHoras({ ...{ ...horas, 1: { ...horas[1], desde: [moment.utc(newValue.toDate()).get('hours'), moment.utc(newValue.toDate()).get('minutes')] } } });
                            }}
                          />
                        </DemoItem>
                        <DemoItem>
                          <TimePicker
                            label={t('reportEndTime')}
                            value={dayjs(new Date(new Date().setHours((horas[1].hasta[0] - Math.floor((new Date().getTimezoneOffset()) / 60)) || 0, horas[1].hasta[1] || 0)))}
                            onChange={(newValue) => {
                              setHoras({ ...{ ...horas, 1: { ...horas[1], hasta: [moment.utc(newValue.toDate()).get('hours'), moment.utc(newValue.toDate()).get('minutes')] } } });
                            }}
                          />
                        </DemoItem>
                      </DemoContainer>
                    </LocalizationProvider>
                  )}
                  <FormControlLabel
                    control={
                      <Checkbox checked={martes} onChange={handleChange} name="martes" />
                    }
                    label="Martes"
                  />
                  {martes && (

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={['TimePicker', 'TimePicker']}>
                        <DemoItem>
                          <TimePicker
                            label={t('reportStartTime')}
                            value={dayjs(new Date(new Date().setHours((horas[2].desde[0] - Math.floor((new Date().getTimezoneOffset()) / 60)) || 0, horas[2].desde[1] || 0)))}
                            onChange={(newValue) => {
                              setHoras({ ...{ ...horas, 2: { ...horas[2], desde: [moment.utc(newValue.toDate()).get('hours'), moment.utc(newValue.toDate()).get('minutes')] } } });
                            }}
                          />
                        </DemoItem>
                        <DemoItem>
                          <TimePicker
                            label={t('reportEndTime')}
                            value={dayjs(new Date(new Date().setHours((horas[2].hasta[0] - Math.floor((new Date().getTimezoneOffset()) / 60)) || 0, horas[2].hasta[1] || 0)))}
                            onChange={(newValue) => {
                              setHoras({ ...{ ...horas, 2: { ...horas[2], hasta: [moment.utc(newValue.toDate()).get('hours'), moment.utc(newValue.toDate()).get('minutes')] } } });
                            }}
                          />
                        </DemoItem>
                      </DemoContainer>
                    </LocalizationProvider>
                  )}
                  <FormControlLabel
                    control={
                      <Checkbox checked={miercoles} onChange={handleChange} name="miercoles" />
                    }
                    label="Miercoles"
                  />
                  {miercoles && (

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={['TimePicker', 'TimePicker']}>
                        <DemoItem>
                          <TimePicker
                            label={t('reportStartTime')}
                            value={dayjs(new Date(new Date().setHours((horas[4].desde[0] - Math.floor((new Date().getTimezoneOffset()) / 60)) || 0, horas[4].desde[1] || 0)))}
                            onChange={(newValue) => {
                              setHoras({ ...{ ...horas, 4: { ...horas[4], desde: [moment.utc(newValue.toDate()).get('hours'), moment.utc(newValue.toDate()).get('minutes')] } } });
                            }}
                          />
                        </DemoItem>
                        <DemoItem>
                          <TimePicker
                            label={t('reportEndTime')}
                            value={dayjs(new Date(new Date().setHours((horas[4].hasta[0] - Math.floor((new Date().getTimezoneOffset()) / 60)) || 0, horas[4].hasta[1] || 0)))}
                            onChange={(newValue) => {
                              setHoras({ ...{ ...horas, 4: { ...horas[4], hasta: [moment.utc(newValue.toDate()).get('hours'), moment.utc(newValue.toDate()).get('minutes')] } } });
                            }}
                          />
                        </DemoItem>
                      </DemoContainer>
                    </LocalizationProvider>
                  )}
                  <FormControlLabel
                    control={
                      <Checkbox checked={jueves} onChange={handleChange} name="jueves" />
                    }
                    label="Jueves"
                  />
                  {jueves && (

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={['TimePicker', 'TimePicker']}>
                        <DemoItem>
                          <TimePicker
                            label={t('reportStartTime')}
                            value={dayjs(new Date(new Date().setHours((horas[8].desde[0] - Math.floor((new Date().getTimezoneOffset()) / 60)) || 0, horas[8].desde[1] || 0)))}
                            onChange={(newValue) => {
                              setHoras({ ...{ ...horas, 8: { ...horas[8], desde: [moment.utc(newValue.toDate()).get('hours'), moment.utc(newValue.toDate()).get('minutes')] } } });
                            }}
                          />
                        </DemoItem>
                        <DemoItem>
                          <TimePicker
                            label={t('reportEndTime')}
                            value={dayjs(new Date(new Date().setHours((horas[8].hasta[0] - Math.floor((new Date().getTimezoneOffset()) / 60)) || 0, horas[8].hasta[1] || 0)))}
                            onChange={(newValue) => {
                              setHoras({ ...{ ...horas, 8: { ...horas[8], hasta: [moment.utc(newValue.toDate()).get('hours'), moment.utc(newValue.toDate()).get('minutes')] } } });
                            }}
                          />
                        </DemoItem>
                      </DemoContainer>
                    </LocalizationProvider>
                  )}
                  <FormControlLabel
                    control={
                      <Checkbox checked={viernes} onChange={handleChange} name="viernes" />
                    }
                    label="Viernes"
                  />
                  {viernes && (

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={['TimePicker', 'TimePicker']}>
                        <DemoItem>
                          <TimePicker
                            label={t('reportStartTime')}
                            value={dayjs(new Date(new Date().setHours((horas[16].desde[0] - Math.floor((new Date().getTimezoneOffset()) / 60)) || 0, horas[16].desde[1] || 0)))}
                            onChange={(newValue) => {
                              setHoras({ ...{ ...horas, 16: { ...horas[16], desde: [moment.utc(newValue.toDate()).get('hours'), moment.utc(newValue.toDate()).get('minutes')] } } });
                            }}
                          />
                        </DemoItem>
                        <DemoItem>
                          <TimePicker
                            label={t('reportEndTime')}
                            value={dayjs(new Date(new Date().setHours((horas[16].hasta[0] - Math.floor((new Date().getTimezoneOffset()) / 60)) || 0, horas[16].hasta[1] || 0)))}
                            onChange={(newValue) => {
                              setHoras({ ...{ ...horas, 16: { ...horas[16], hasta: [moment.utc(newValue.toDate()).get('hours'), moment.utc(newValue.toDate()).get('minutes')] } } });
                            }}
                          />
                        </DemoItem>
                      </DemoContainer>
                    </LocalizationProvider>
                  )}
                  <FormControlLabel
                    control={
                      <Checkbox checked={sabado} onChange={handleChange} name="sabado" />
                    }
                    label="Sabado"
                  />
                  {sabado && (

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={['TimePicker', 'TimePicker']}>
                        <DemoItem>
                          <TimePicker
                            label={t('reportStartTime')}
                            value={dayjs(new Date(new Date().setHours((horas[32].desde[0] - Math.floor((new Date().getTimezoneOffset()) / 60)) || 0, horas[32].desde[1] || 0)))}
                            onChange={(newValue) => {
                              setHoras({ ...{ ...horas, 32: { ...horas[32], desde: [moment.utc(newValue.toDate()).get('hours'), moment.utc(newValue.toDate()).get('minutes')] } } });
                            }}
                          />
                        </DemoItem>
                        <DemoItem>
                          <TimePicker
                            label={t('reportEndTime')}
                            value={dayjs(new Date(new Date().setHours((horas[32].hasta[0] - Math.floor((new Date().getTimezoneOffset()) / 60)) || 0, horas[32].hasta[1] || 0)))}
                            onChange={(newValue) => {
                              setHoras({ ...{ ...horas, 32: { ...horas[32], hasta: [moment.utc(newValue.toDate()).get('hours'), moment.utc(newValue.toDate()).get('minutes')] } } });
                            }}
                          />
                        </DemoItem>
                      </DemoContainer>
                    </LocalizationProvider>
                  )}
                  <FormControlLabel
                    control={
                      <Checkbox checked={domingo} onChange={handleChange} name="domingo" />
                    }
                    label="Domingo"
                  />
                  {domingo && (

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={['TimePicker', 'TimePicker']}>
                        <DemoItem>
                          <TimePicker
                            label={t('reportStartTime')}
                            value={dayjs(new Date(new Date().setHours((horas[64].desde[0] - Math.floor((new Date().getTimezoneOffset()) / 60)) || 0, horas[64].desde[1] || 0)))}
                            onChange={(newValue) => {
                              setHoras({ ...{ ...horas, 64: { ...horas[64], desde: [moment.utc(newValue.toDate()).get('hours'), moment.utc(newValue.toDate()).get('minutes')] } } });
                            }}
                          />
                        </DemoItem>
                        <DemoItem>
                          <TimePicker
                            label={t('reportEndTime')}
                            value={dayjs(new Date(new Date().setHours((horas[64].hasta[0] - Math.floor((new Date().getTimezoneOffset()) / 60)) || 0, horas[64].hasta[1] || 0)))}
                            onChange={(newValue) => {
                              setHoras({ ...{ ...horas, 64: { ...horas[64], hasta: [moment.utc(newValue.toDate()).get('hours'), moment.utc(newValue.toDate()).get('minutes')] } } });
                            }}
                          />
                        </DemoItem>
                      </DemoContainer>
                    </LocalizationProvider>
                  )}
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
                    subrutas.map((s) => <MenuItem key={s.id} value={s.id}>{s?.name}</MenuItem>)
                  )}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="geofence">Geocerca de salida</InputLabel>
                <Select
                  labelId="geofence"
                  id="geofenceid"
                  value={item.geofenceId || geofence}
                  label="Geocerca de salida"
                  onChange={updateGeocerca}
                >
                  <MenuItem key={null} value={null}>Manual</MenuItem>
                  {geofences && (
                    geofences.map((s) => <MenuItem key={s.id} value={s.id}>{s?.name}</MenuItem>)
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <SearchSelect
                  labelId="horas"
                  id="horasid"
                  value={item.horasId || hour || ''}
                  label="Tabla de salidas"
                  onChange={updateHora}
                  options={[{ id: 0, name: 'Sin horario' }, ...hours]}
                />

              </FormControl>

              {
                (user.administrator || (user.attributes.hasOwnProperty('vp') &&
                  user.attributes.vp)) && (
                  <FormControl fullWidth>
                    <SearchSelect
                      labelId="horasRel"
                      id="horasidRel"
                      value={item.horasIdRel || hourRel}
                      label="Tabla de salidas relacionada"
                      onChange={updateHoraRel}
                      options={[{ id: 0, name: 'Sin horario' }, ...hours]}
                    />
                  </FormControl>
                )
              }
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

      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={notification.show}
          message={notification.message}
          autoHideDuration={notification.snackBarDurationLongMs}
          onClose={() => setNotifications(notifications.filter((e) => e.id !== notification.id))}
        />
      ))}
    </EditItemView>
  );
};

export default SchedulePage;
