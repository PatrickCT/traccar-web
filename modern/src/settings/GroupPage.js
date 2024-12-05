import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTheme } from '@mui/styles';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography,
  useMediaQuery,
  Dialog,
  TextField,
  Button,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SelectField from '../common/components/SelectField';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import useCommonDeviceAttributes from '../common/attributes/useCommonDeviceAttributes';
import useGroupAttributes from '../common/attributes/useGroupAttributes';
import { useCatch } from '../reactHelper';
import { groupsActions } from '../store';
import SubrutasList from './components/SubrutasList';
import { useAdministrator } from '../common/util/permissions';
import SearchSelect from '../reports/components/SearchableSelect';

const useStyles = makeStyles((theme) => ({
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const GroupPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();
  const admin = useAdministrator();

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const groupAttributes = useGroupAttributes(t);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [item, setItem] = useState();
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState({});

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onItemSaved = useCatch(async () => {
    const response = await fetch('/api/groups');
    if (response.ok) {
      dispatch(groupsActions.update(await response.json()));
    } else {
      throw Error(await response.text());
    }
  });

  const validate = () => item && item.name;

  return (
    <EditItemView
      endpoint="groups"
      item={item}
      setItem={setItem}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'groupDialog']}
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
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedExtra')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <SelectField
                value={item.groupId || 0}
                onChange={(event) => setItem({ ...item, groupId: Number(event.target.value) })}
                endpoint="/api/groups"
                label={t('groupParent')}
              />
            </AccordionDetails>
          </Accordion>
          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{ ...commonDeviceAttributes, ...groupAttributes }}
          />
        </>
      )}
      {item && item.id && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {t('subroutes')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <SubrutasList group={item.id} />
          </AccordionDetails>

        </Accordion>
      )}

      {admin && (['localhost', 't-urban.com.mx'].some((h) => h.includes(document.location.hostname))) && (
        <>
          <Button variant="outlined" onClick={handleClickOpen}>
            Vincular a T-Urban
          </Button>
          <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={handleClose}
            PaperProps={{
              component: 'form',
              onSubmit: (event) => {
                event.preventDefault();
                fetch(`https://crmgpstracker.mx:9999/api/rutas/sync/${link.id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(link),
                });
                handleClose();
              },
            }}
          >
            <DialogTitle>Asignar a ruta t-urban</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Seleccione la ruta correspondiente en T-Urban
              </DialogContentText>
              <br />
              <SearchSelect
                fullWidth
                label="Ruta T-Urban"
                endpoint="https://crmgpstracker.mx:9999/api/rutas"
                debounceDelay={500}
                value={link.id || null}
                onChange={(evt) => setLink({ id: evt.target.value, groupId: item.id })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button type="submit">Vincular</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </EditItemView>
  );
};

export default GroupPage;
