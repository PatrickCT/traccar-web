import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { useSelector } from 'react-redux';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  AppBar,
  Toolbar,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkField from '../common/components/LinkField';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import { formatNotificationTitle } from '../common/util/formatter';
import PageLayout from '../common/components/PageLayout';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(0),
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const UserConnectionsPage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const { id } = useParams();

  const [item, setItem] = useState({});

  // const user = useSelector((state) => state.session.user);

  useEffect(() => {
    fetch(`/api/users/${id}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      .then((response) => response.json())
      .then((data) => setItem(data));
  }, []);

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'settingsUser', 'sharedConnections', `Usuario: ${item?.name}`]}
    >
      <Container maxWidth="m" className={classes.container}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              {`Usuario: ${item?.name}`}
            </Typography>
          </Toolbar>
        </AppBar>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {t('sharedConnections')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <LinkField
              endpointAll="/api/devices?all=true"
              endpointLinked={`/api/devices?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="deviceId"
              label={t('deviceTitle')}
            />
            <LinkField
              endpointAll="/api/groups?all=true"
              endpointLinked={`/api/groups?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="groupId"
              label={t('settingsGroups')}
            />
            <LinkField
              endpointAll="/api/geofences?all=true"
              endpointLinked={`/api/geofences?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="geofenceId"
              label={t('sharedGeofences')}
            />
            <LinkField
              endpointAll="/api/notifications?all=true"
              endpointLinked={`/api/notifications?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="notificationId"
              titleGetter={(it) => formatNotificationTitle(t, it, true)}
              label={t('sharedNotifications')}
            />
            <LinkField
              endpointAll="/api/calendars?all=true"
              endpointLinked={`/api/calendars?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="calendarId"
              label={t('sharedCalendars')}
            />
            <LinkField
              endpointAll="/api/users?all=true"
              endpointLinked={`/api/users?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="managedUserId"
              label={t('settingsUsers')}
            />
            <LinkField
              endpointAll="/api/attributes/computed?all=true"
              endpointLinked={`/api/attributes/computed?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="attributeId"
              titleGetter={(it) => it.description}
              label={t('sharedComputedAttributes')}
            />
            <LinkField
              endpointAll="/api/drivers?all=true"
              endpointLinked={`/api/drivers?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="driverId"
              label={t('sharedDrivers')}
            />
            <LinkField
              endpointAll="/api/commands?all=true"
              endpointLinked={`/api/commands?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="commandId"
              titleGetter={(it) => it.description}
              label={t('sharedSavedCommands')}
            />
            <LinkField
              endpointAll="/api/maintenance?all=true"
              endpointLinked={`/api/maintenance?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="maintenanceId"
              label={t('sharedMaintenance')}
            />
            {/* {user.administrator && (
              <LinkField
                endpointAll="/api/extramodules?all=true"
                endpointLinked={`/api/extramodules?userId=${id}`}
                baseId={id}
                keyBase="userId"
                keyLink="extramoduleId"
                label={t('extraModulesTitle')}
              />
            )} */}
          </AccordionDetails>
        </Accordion>
      </Container>
    </PageLayout>
  );
};

export default UserConnectionsPage;
