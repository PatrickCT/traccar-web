import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import moment from 'moment';
import React, { useState } from 'react';
import { DropzoneArea } from 'react-mui-dropzone';
import { useSelector } from 'react-redux';
import useCommonDeviceAttributes from '../common/attributes/useCommonDeviceAttributes';
import useDeviceAttributes from '../common/attributes/useDeviceAttributes';
import { useTranslation } from '../common/components/LocalizationProvider';
import SelectField from '../common/components/SelectField';
import deviceCategories from '../common/util/deviceCategories';
import { useAdministrator } from '../common/util/permissions';
import { generateArray } from '../common/util/utils';
import { useCatch } from '../reactHelper';
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
              {admin &&
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
                  {admin && (
                    <>
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
                        value={item.maker || ''}
                        onChange={(event) => setItem({ ...item, maker: event.target.value })}
                        label={t('deviceMaker')}
                      />
                      <SelectField
                        data={[{ id: 1, name: 'PT ' }, { id: 2, name: 'RT ' }, { id: 3, name: 'Ox' }]}
                        onChange={(event) => setItem({ ...item, simType: event.target.value })}
                        value={item.simType || null}
                      />
                      {
                        item.simType && item.simType === 2 && (
                          <TextField
                            value={item.simKey || ''}
                            onChange={(event) => setItem({ ...item, simKey: event.target.value })}
                            label={t('deviceKey')}
                          />
                        )
                      }
                    </>
                  )}

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
                    value={item.model || ''}
                    onChange={(event) => setItem({ ...item, model: event.target.value })}
                    label={t('deviceModel')}
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
              {/* TODO add company */}
              <SelectField
                value={item.insuranceCompanyId || 0}
                onChange={(event) => setItem({ ...item, insuranceCompanyId: Number(event.target.value) })}
                endpoint="/api/insurance/companies"
                label={t('insuranceCompany')}
              />
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
              attributes={{ speedLimit: null, rendimiento: null, ...(admin ? (item.attributes) : { ...(item.attributes?.speedLimit ? { speedLimit: item.attributes.speedLimit } : {}), ...(item.attributes?.rendimiento ? { rendimiento: item.attributes.rendimiento } : {}) }) }}
              setAttributes={(attributes) => setItem({ ...item, attributes })}
              definitions={{ ...commonDeviceAttributes, ...deviceAttributes }}
              canAdd={admin}
            />
          )}
        </>
      )}
    </EditItemView>
  );
};

export default DevicePage;
