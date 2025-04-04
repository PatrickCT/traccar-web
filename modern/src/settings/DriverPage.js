import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import makeStyles from '@mui/styles/makeStyles';
import React, { useState } from 'react';
// import { PhoneInput } from 'react-international-phone';
// import 'react-international-phone/style.css';
import { useTranslation } from '../common/components/LocalizationProvider';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import EditItemView from './components/EditItemView';
import SettingsMenu from './components/SettingsMenu';

const useStyles = makeStyles((theme) => ({
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const DriverPage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const [item, setItem] = useState();

  const validate = () => item && item.name && item.uniqueId && item.phone && item.age && item.license;

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    const numbersOnly = /^\d*$/; // Regex to allow only numbers

    if (numbersOnly.test(value)) {
      setItem({ ...item, [name]: value });
    }
  };

  return (
    <EditItemView
      endpoint="drivers"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDriver']}
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
              <TextField
                value={item.uniqueId || ''}
                onChange={(event) => setItem({ ...item, uniqueId: event.target.value })}
                label={t('deviceAddress')}
              />
              <TextField
                value={item.phone || ''}
                onChange={handleInputChange}
                label={t('commandPhone')}
                name="phone"
                inputProps={{ maxLength: 10 }}
              />
              <TextField
                value={item.license || ''}
                onChange={(event) => setItem({ ...item, license: event.target.value })}
                label={t('license')}
              />
              <TextField
                value={item.age || ''}
                onChange={handleInputChange}
                label={t('age')}
                name="age"
                inputProps={{ maxLength: 3 }}
              />
            </AccordionDetails>
          </Accordion>
          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{}}
          />
        </>
      )}
    </EditItemView>
  );
};

export default DriverPage;
