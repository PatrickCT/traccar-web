/* eslint-disable no-unused-vars */
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import { distanceFromMeters, distanceToMeters, distanceUnitString } from '../common/util/converter';
import { useAttributePreference } from '../common/util/preferences';
import { useCatch } from '../reactHelper';
import SettingsMenu from './components/SettingsMenu';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
  },
  buttons: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-evenly',
    '& > *': {
      flexBasis: '33%',
    },
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const AccumulatorsPage = ({ device = null, showMenu = true, showNavigation = true }) => {
  const navigate = useNavigate();
  const classes = useStyles();
  const t = useTranslation();

  const distanceUnit = useAttributePreference('distanceUnit');
  const { deviceId } = useParams();

  const position = useSelector((state) => state.session.positions[deviceId || device]);
  const [item, setItem] = useState();

  useEffect(() => {
    if (!showNavigation) {
      document.getElementById('bottomMenu').style.display = 'none';
    }
  }, []);

  useEffect(() => {
    if (position) {
      setItem({
        deviceId: parseInt(deviceId || device, 10),
        hours: position.attributes.hours || 0,
        totalDistance: position.attributes.totalDistance || 0,
      });
    }
  }, [deviceId, device, position]);

  const handleSave = useCatch(async () => {
    const response = await fetch(`/api/devices/${deviceId || device}/accumulators`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    if (response.ok) {
      navigate(-1);
    } else {
      throw Error(await response.text());
    }
  });

  return (
    <PageLayout menu={showMenu ? <SettingsMenu /> : null} breadcrumbs={['sharedDeviceAccumulators']}>
      {item && (
        <Container maxWidth="xs" className={classes.container}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                type="number"
                value={item.hours / 3600000}
                onChange={(event) => setItem({ ...item, hours: Number(event.target.value) * 3600000 })}
                label={t('positionHours')}
              />
              <TextField
                type="number"
                value={distanceFromMeters(item.totalDistance, distanceUnit)}
                onChange={(event) => setItem({ ...item, totalDistance: distanceToMeters(Number(event.target.value), distanceUnit) })}
                label={`${t('deviceTotalDistance')} (${distanceUnitString(distanceUnit, t)})`}
              />
            </AccordionDetails>
          </Accordion>
          <div className={classes.buttons}>
            <Button
              type="button"
              color="primary"
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              {t('sharedCancel')}
            </Button>
            <Button
              type="button"
              color="primary"
              variant="contained"
              onClick={handleSave}
            >
              {t('sharedSave')}
            </Button>
          </div>
        </Container>
      )}
    </PageLayout>
  );
};

export default AccumulatorsPage;
