import React, { useState, useEffect } from 'react';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import SelectField from '../common/components/SelectField';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';

const DeviceConnectionGroupPage = () => {
  const [group, setGroup] = useState(-1);
  const [devices, setDevices] = useState([]);
  const t = useTranslation();

  useEffect(() => {
    fetch('/api/devices', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      .then((response) => response.json())
      .then((responseData) => setDevices(responseData));
  }, []);

  const handleChange = (event) => {
    if (group) {
      const item = devices.find((device) => device.id === Number(event.target.value));
      if (event.target.checked) {
        fetch(`/api/devices/${event.target.value}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, groupId: group }) });
        fetch('/api/devices', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
          .then((response) => response.json())
          .then((responseData) => setDevices(responseData));
      } else {
        fetch(`/api/devices/${event.target.value}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, groupId: 0 }) });
        fetch('/api/devices', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
          .then((response) => response.json())
          .then((responseData) => setDevices(responseData));
      }
    }
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedDrivers']}>
      <h2>
        {t('settingsGroups')}
      </h2>
      <SelectField
        value={group || -1}
        onChange={(event) => setGroup(Number(event.target.value))}
        endpoint="/api/groups"
        label={t('groupParent')}
      />
      <FormGroup>
        {devices && devices.map((device) => (
          <FormControlLabel
            control={
              (
                <Checkbox
                  value={device.id}
                  checked={device.groupId === group}
                  onChange={handleChange}
                />
              )
            }
            label={device.name}
          />
        ))}
      </FormGroup>
    </PageLayout>

  );
};

export default DeviceConnectionGroupPage;
