import React, { useState } from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, Button, TextField, Typography, FormGroup, FormControlLabel, Checkbox,
} from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useTranslation } from '../../common/components/LocalizationProvider';
import useReportStyles from '../common/useReportStyles';
import { devicesActions, reportsActions } from '../../store';
import SplitButton from '../../common/components/SplitButton';
import SelectField from '../../common/components/SelectField';
import { useRestriction } from '../../common/util/permissions';
import SearchSelect from './SearchableSelect';

const ReportFilter = ({
  children,
  handleSubmit,
  handleSchedule,
  showOnly,
  ignoreDevice,
  multiDevice,
  includeGroups,
  unified,
}) => {
  const classes = useReportStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction('readonly');

  const devices = useSelector((state) => state.devices.items);
  const groups = useSelector((state) => state.groups.items);

  const deviceId = useSelector((state) => state.devices.selectedId);
  const deviceIds = useSelector((state) => state.devices.selectedIds);
  const groupIds = useSelector((state) => state.reports.groupIds);
  const period = useSelector((state) => state.reports.period);
  const from = useSelector((state) => state.reports.from);
  const to = useSelector((state) => state.reports.to);
  const [unify, setUnify] = useState(false);
  const [button, setButton] = useState('json');

  const [description, setDescription] = useState();
  const [calendarId, setCalendarId] = useState();

  const scheduleDisabled = button === 'schedule' && (!description || !calendarId);
  const disabled = (!ignoreDevice && !deviceId && !deviceIds.length && !groupIds.length) || scheduleDisabled;

  const handleClick = (type) => {
    if (type === 'schedule') {
      handleSchedule(deviceIds, groupIds, {
        description,
        calendarId,
        attributes: {},
      });
    } else {
      let selectedFrom;
      let selectedTo;
      switch (period) {
        case 'today':
          selectedFrom = moment().startOf('day');
          selectedTo = moment().endOf('day');
          break;
        case 'yesterday':
          selectedFrom = moment().subtract(1, 'day').startOf('day');
          selectedTo = moment().subtract(1, 'day').endOf('day');
          break;
        case 'thisWeek':
          selectedFrom = moment().startOf('week');
          selectedTo = moment().endOf('week');
          break;
        case 'previousWeek':
          selectedFrom = moment().subtract(1, 'week').startOf('week');
          selectedTo = moment().subtract(1, 'week').endOf('week');
          break;
        case 'thisMonth':
          selectedFrom = moment().startOf('month');
          selectedTo = moment().endOf('month');
          break;
        case 'previousMonth':
          selectedFrom = moment().subtract(1, 'month').startOf('month');
          selectedTo = moment().subtract(1, 'month').endOf('month');
          break;
        default:
          selectedFrom = moment(from, moment.HTML5_FMT.DATETIME_LOCAL);
          selectedTo = moment(to, moment.HTML5_FMT.DATETIME_LOCAL);
          break;
      }

      handleSubmit({
        deviceId,
        deviceIds,
        groupIds,
        from: selectedFrom.toISOString(),
        to: selectedTo.toISOString(),
        calendarId,
        type,
        unify,
      });
    }
  };

  return (
    <div className={classes.filter}>
      {!ignoreDevice && (
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <SearchSelect
              options={Object.values(devices).sort((a, b) => a.name.localeCompare(b.name))}
              label={t(multiDevice ? 'deviceTitle' : 'reportDevice')}
              value={multiDevice ? deviceIds : deviceId || ''}
              onChange={(e) => dispatch(multiDevice ? devicesActions.selectIds(e.target.value) : devicesActions.selectId(e.target.value))}
              multiple={multiDevice}
            />
          </FormControl>
        </div>
      )}
      {includeGroups && (
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <InputLabel>{t('settingsGroups')}</InputLabel>
            <Select
              label={t('settingsGroups')}
              value={groupIds}
              onChange={(e) => dispatch(reportsActions.updateGroupIds(e.target.value))}
              multiple
            >
              {Object.values(groups).sort((a, b) => a.name.localeCompare(b.name)).map((group) => (
                <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      )}

      {button !== 'schedule' ? (
        <>
          <div className={classes.filterItem}>
            <FormControl id="cmb-report-from" fullWidth>
              <InputLabel>{t('reportPeriod')}</InputLabel>
              <Select label={t('reportPeriod')} value={period} onChange={(e) => dispatch(reportsActions.updatePeriod(e.target.value))}>
                <MenuItem value="today">{t('reportToday')}</MenuItem>
                <MenuItem value="yesterday">{t('reportYesterday')}</MenuItem>
                <MenuItem value="thisWeek">{t('reportThisWeek')}</MenuItem>
                <MenuItem value="previousWeek">{t('reportPreviousWeek')}</MenuItem>
                <MenuItem value="thisMonth">{t('reportThisMonth')}</MenuItem>
                <MenuItem value="previousMonth">{t('reportPreviousMonth')}</MenuItem>
                <MenuItem value="custom">{t('reportCustom')}</MenuItem>
              </Select>
            </FormControl>
          </div>
          {period === 'custom' && (
            <div className={classes.filterItem}>
              <TextField
                label={t('reportFrom')}
                type="datetime-local"
                value={from}
                onChange={(e) => dispatch(reportsActions.updateFrom(e.target.value))}
                fullWidth
              />
            </div>
          )}
          {period === 'custom' && (
            <div className={classes.filterItem}>
              <TextField
                label={t('reportTo')}
                type="datetime-local"
                value={to}
                onChange={(e) => dispatch(reportsActions.updateTo(e.target.value))}
                fullWidth
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div className={classes.filterItem}>
            <TextField
              value={description || ''}
              onChange={(event) => setDescription(event.target.value)}
              label={t('sharedDescription')}
              fullWidth
            />
          </div>
          <div className={classes.filterItem}>
            <SelectField
              value={calendarId || 0}
              onChange={(event) => setCalendarId(Number(event.target.value))}
              endpoint="/api/calendars"
              label={t('sharedCalendar')}
              fullWidth
            />
          </div>
        </>
      )}
      {children}
      {unified && (
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <FormGroup>
              <FormControlLabel
                control={
                  (
                    <Checkbox
                      checked={unify}
                      onChange={(event) => setUnify(event.target.checked)}
                    />
                  )
                }
                label="Unificar"
              />
            </FormGroup>
          </FormControl>
        </div>
      )}
      <div className={classes.filterItem}>
        {showOnly ? (
          <Button
            id="cmb-report-btn-search"
            fullWidth
            variant="outlined"
            color="secondary"
            disabled={disabled}
            onClick={() => handleClick('json')}
          >
            <Typography variant="button" noWrap>{t('reportShow')}</Typography>
          </Button>
        ) : (
          <SplitButton
            id="cmb-report-btn-search"
            fullWidth
            variant="outlined"
            color="secondary"
            disabled={disabled}
            onClick={handleClick}
            selected={button}
            setSelected={(value) => setButton(value)}
            options={readonly ? {
              json: t('reportShow'),
              export: t('reportExport'),
              mail: t('reportEmail'),
            } : {
              json: t('reportShow'),
              export: t('reportExport'),
              mail: t('reportEmail'),
              schedule: t('reportSchedule'),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ReportFilter;
