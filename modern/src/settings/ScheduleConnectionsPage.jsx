import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkField from '../common/components/LinkField';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import PageLayout from '../common/components/PageLayout';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const ScheduleConnectionsPage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const { id } = useParams();

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'scheduleDialog', 'sharedConnections']}
    >
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {t('sharedConnections')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <LinkField
              endpointAll="/api/tramos"
              endpointLinked={`/api/tramos?scheduleId=${id}`}
              baseId={id}
              keyBase="itinerarioId"
              keyLink="tramoId"
              label={t('settingsSections')}
            />

          </AccordionDetails>
        </Accordion>
      </Container>
    </PageLayout>
  );
};

export default ScheduleConnectionsPage;
