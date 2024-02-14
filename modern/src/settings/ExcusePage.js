/* eslint-disable import/no-extraneous-dependencies */
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Snackbar,
} from '@mui/material';
import moment from 'moment';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import makeStyles from '@mui/styles/makeStyles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import SettingsMenu from './components/SettingsMenu';
import { useTranslation } from '../common/components/LocalizationProvider';
import SelectField from '../common/components/SelectField';

const useStyles = makeStyles((theme) => ({
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const ExcusePage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const [notifications, setNotifications] = useState([]);

  // const newDateStart = new Date();
  const [item, setItem] = useState();

  const validate = () => item;

  return (
    <EditItemView
      endpoint="excuses"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'excuseDialog']}
    >
      {item && (

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {t('sharedRequired')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <TextField
              value={item.description || ''}
              onChange={(event) => setItem({ ...item, description: event.target.value })}
              label={t('sharedDescription')}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['TimePicker', 'TimePicker']}>
                <DemoItem>
                  <TimePicker
                    label={t('reportStartTime')}
                    value={dayjs(item.applyFrom || new Date())}
                    onChange={(newValue) => {
                      setItem({ ...item, applyFrom: moment.utc(newValue.toDate()) });
                    }}
                  />
                </DemoItem>
                <DemoItem>
                  <TimePicker
                    label={t('reportEndTime')}
                    value={dayjs(item.applyTo || new Date())}
                    onChange={(newValue) => {
                      setItem({ ...item, applyTo: moment.utc(newValue.toDate()) });
                    }}
                  />
                </DemoItem>
              </DemoContainer>
            </LocalizationProvider>
            <SelectField
              value={item.route || 0}
              onChange={(event) => setItem({ ...item, route: Number(event.target.value) })}
              endpoint="/api/groups"
              label={t('groupParent')}
            />
          </AccordionDetails>
        </Accordion>

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

export default ExcusePage;
