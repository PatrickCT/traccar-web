import React, { useState } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DropzoneArea } from 'react-mui-dropzone';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SelectField from '../common/components/SelectField';
import deviceCategories from '../common/util/deviceCategories';
import { useTranslation } from '../common/components/LocalizationProvider';
import useDeviceAttributes from '../common/attributes/useDeviceAttributes';
import { useAdministrator } from '../common/util/permissions';
import SettingsMenu from './components/SettingsMenu';
import useCommonDeviceAttributes from '../common/attributes/useCommonDeviceAttributes';
import { useCatch } from '../reactHelper';
import { generateArray } from '../common/util/utils';

const useStyles = makeStyles((theme) => ({
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const DevicePage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const admin = useAdministrator();
  const user = useSelector((state) => state.session.user);

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const deviceAttributes = useDeviceAttributes(t);

  const [item, setItem] = useState();

  const handleFiles = useCatch(async (files) => {
    if (files.length > 0) {
      const response = await fetch(`/api/devices/${item.id}/image`, {
        method: 'POST',
        body: files[0],
      });
      if (response.ok) {
        setItem({ ...item, attributes: { ...item.attributes, deviceImage: await response.text() } });
      } else {
        throw Error(await response.text());
      }
    }
  });

  const validate = () => item && item.name && item.uniqueId;
  return (
    <EditItemView
      endpoint="devices"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDevice']}
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
              {!user.deviceReadonly &&
                (
                  <TextField
                    value={item.uniqueId || ''}
                    onChange={(event) => setItem({ ...item, uniqueId: event.target.value })}
                    label={t('deviceIdentifier')}
                    helperText={t('deviceIdentifierHelp')}
                  />
                )}
            </AccordionDetails>
          </Accordion>
          {!user.deviceReadonly &&
            (
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
                  <TextField
                    value={item.phone || ''}
                    onChange={(event) => setItem({ ...item, phone: event.target.value })}
                    label={t('sharedPhone')}
                  />
                  <TextField
                    value={item.contact || ''}
                    onChange={(event) => setItem({ ...item, contact: event.target.value })}
                    label={t('deviceContact')}
                  />
                  <SelectField
                    value={item.category || 'default'}
                    emptyValue={null}
                    onChange={(event) => setItem({ ...item, category: event.target.value })}
                    data={deviceCategories.map((category) => ({
                      id: category,
                      name: t(`category${category.replace(/^\w/, (c) => c.toUpperCase())}`),
                    }))}
                    label={t('deviceCategory')}
                  />
                  <TextField
                    label={t('userExpirationTime')}
                    type="date"
                    value={(item.expirationTime && moment(item.expirationTime).locale('en').format(moment.HTML5_FMT.DATE)) || '2099-01-01'}
                    onChange={(e) => setItem({ ...item, expirationTime: moment(e.target.value, moment.HTML5_FMT.DATE).locale('en').format() })}
                    disabled={!admin}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={item.disabled} onChange={(event) => setItem({ ...item, disabled: event.target.checked })} />}
                    label={t('sharedDisabled')}
                    disabled={!admin}
                  />

                  <TextField
                    value={item.carPlate || ''}
                    onChange={(event) => setItem({ ...item, carPlate: event.target.value })}
                    label={t('devicePlate')}
                  />
                  <TextField
                    value={item.serie || ''}
                    onChange={(event) => setItem({ ...item, serie: event.target.value })}
                    label={t('deviceSerie')}
                  />
                  <SelectField
                    data={generateArray(new Date().getFullYear() - 1990, 1991)}
                    keyGetter={(item) => item}
                    titleGetter={(item) => item}
                    onChange={(event) => setItem({ ...item, year: event.target.value })}
                    emptyTitle={t('deviceYear')}
                    emptyValue={t('deviceYear')}
                    value={item.year || '1991'}
                  />
                  <TextField
                    value={item.maker || ''}
                    onChange={(event) => setItem({ ...item, maker: event.target.value })}
                    label={t('deviceMaker')}
                  />
                  <TextField
                    value={item.model || ''}
                    onChange={(event) => setItem({ ...item, model: event.target.value })}
                    label={t('deviceModel')}
                  />

                  <SelectField
                    data={[{ id: 1, name: 'PT ' }, { id: 2, name: 'RT ' }, { id: 3, name: 'Ox' }]}
                    onChange={(event) => setItem({ ...item, simType: event.target.value })}
                    value={item.simType || null}
                  />
                </AccordionDetails>
              </Accordion>
            )}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('deviceInsurance')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.policy || ''}
                onChange={(event) => setItem({ ...item, policy: event.target.value })}
                label={t('devicePolicy')}
              />
              <TextField
                value={moment(item.insuranceExpiration).locale('en').format(moment.HTML5_FMT.DATE)}
                onChange={(event) => setItem({ ...item, insuranceExpiration: event.target.value })}
                label={t('userExpirationTime')}
                type="date"
              />
            </AccordionDetails>
          </Accordion>

          {!user.deviceReadonly && item.id && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  {t('attributeDeviceImage')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <DropzoneArea
                  dropzoneText={t('sharedDropzoneText')}
                  acceptedFiles={['image/*']}
                  filesLimit={1}
                  onChange={handleFiles}
                  showAlerts={false}
                />
              </AccordionDetails>
            </Accordion>
          )}
          {!user.deviceReadonly && (
            <EditAttributesAccordion
              attributes={item.attributes}
              setAttributes={(attributes) => setItem({ ...item, attributes })}
              definitions={{ ...commonDeviceAttributes, ...deviceAttributes }}
            />
          )}
        </>
      )}
    </EditItemView>
  );
};

export default DevicePage;
