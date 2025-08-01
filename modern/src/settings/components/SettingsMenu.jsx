import { ScheduleOutlined, SegmentOutlined } from '@mui/icons-material';
import BuildIcon from '@mui/icons-material/Build';
import CreateIcon from '@mui/icons-material/Create';
import FolderIcon from '@mui/icons-material/Folder';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import PublishIcon from '@mui/icons-material/Publish';
import SettingsIcon from '@mui/icons-material/Settings';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import StorageIcon from '@mui/icons-material/Storage';
import TodayIcon from '@mui/icons-material/Today';
import TrafficIcon from '@mui/icons-material/Traffic';
import {
  Divider, List, ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../common/components/LocalizationProvider';
import {
  useAdministrator, useCommonUser, useManager, useRestriction,
} from '../../common/util/permissions';
import useFeatures from '../../common/util/useFeatures';

const MenuItem = ({
  title, link, icon, selected,
}) => (
  <ListItemButton key={link} component={Link} to={link} selected={selected}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={title} />
  </ListItemButton>
);

const SettingsMenu = () => {
  const t = useTranslation();
  const location = useLocation();

  const readonly = useRestriction('readonly');
  const admin = useAdministrator();
  const manager = useManager();
  const userId = useSelector((state) => state.session.user.id);
  const user = useSelector((state) => state.session.user);
  const features = useFeatures();
  const commonUser = useCommonUser();

  return (
    <>
      <List>
        {
          !user.attributes.hasOwnProperty('Demo') && commonUser && (
            <MenuItem
              title={t('sharedPreferences')}
              link="/settings/preferences"
              icon={<SettingsIcon />}
              selected={location.pathname === '/settings/preferences'}
            />
          )
        }
        {!readonly && (
          <>
            {commonUser && (
              <>
                <MenuItem
                  title={t('sharedNotifications')}
                  link="/settings/notifications"
                  icon={<NotificationsIcon />}
                  selected={location.pathname.startsWith('/settings/notification')}
                />

                {!user.attributes.hasOwnProperty('Demo') && (
                  <MenuItem
                    title={t('settingsUser')}
                    link={`/settings/user/${userId}`}
                    icon={<PersonIcon />}
                    selected={location.pathname === `/settings/user/${userId}`}
                  />
                )}
                <MenuItem
                  title={t('deviceTitle')}
                  link="/settings/devices"
                  icon={<SmartphoneIcon />}
                  selected={location.pathname.startsWith('/settings/device')}
                />
                <MenuItem
                  title={t('sharedGeofences')}
                  link="/geofences"
                  icon={<CreateIcon />}
                  selected={location.pathname.startsWith('/settings/geofence')}
                />
                {!features.disableGroups && (
                  <MenuItem
                    title={t('settingsGroups')}
                    link="/settings/groups"
                    icon={<FolderIcon />}
                    selected={location.pathname.startsWith('/settings/group')}
                  />
                )}
                <MenuItem
                  title={t('sharedDrivers')}
                  link="/settings/drivers"
                  icon={<PersonIcon />}
                  selected={location.pathname.startsWith('/settings/driver')}
                />
                {!features.disableCalendars && (
                  <MenuItem
                    title={t('sharedCalendars')}
                    link="/settings/calendars"
                    icon={<TodayIcon />}
                    selected={location.pathname.startsWith('/settings/calendar')}
                  />
                )}
                {/* {!features.disableComputedAttributes && !user.attributes.hasOwnProperty('Demo') && (
              <MenuItem
                title={t('sharedComputedAttributes')}
                link="/settings/attributes"
                icon={<StorageIcon />}
                selected={location.pathname.startsWith('/settings/attribute')}
              />
            )} */}
                {!features.disableMaintenance && !user.attributes.hasOwnProperty('Demo') && (
                  <MenuItem
                    title={t('sharedMaintenance')}
                    link="/settings/maintenances"
                    icon={<BuildIcon />}
                    selected={location.pathname.startsWith('/settings/maintenance')}
                  />
                )}
                {!user.attributes.hasOwnProperty('Demo') && user.administrator && (
                  <MenuItem
                    title={t('sharedSavedCommands')}
                    link="/settings/commands"
                    icon={<PublishIcon />}
                    selected={location.pathname.startsWith('/settings/command')}
                  />
                )}
              </>
            )}

            {/* transporte */}
            {user.attributes.hasOwnProperty('Transporte') &&
              user.attributes.Transporte &&
              (
                <MenuItem
                  title={t('settingsHours')}
                  link="/settings/hours"
                  icon={<SegmentOutlined />}
                  selected={location.pathname.startsWith('/settings/section')}
                />
              )}
            {user.attributes.hasOwnProperty('Transporte') &&
              user.attributes.Transporte &&
              (
                <MenuItem
                  title={t('settingsSchedules')}
                  link="/settings/schedules"
                  icon={<ScheduleOutlined />}
                  selected={location.pathname.startsWith('/settings/schedule')}
                />
              )}

            {user.attributes.hasOwnProperty('vp') &&
              user.attributes.vp &&
              (
                <MenuItem
                  title={t('settingsExcuses')}
                  link="/settings/excuses"
                  icon={<TrafficIcon />}
                  selected={location.pathname.startsWith('/settings/excuse')}
                />
              )}
          </>
        )}
      </List>
      {manager && (
        <>
          <Divider />
          <List>
            {admin && (
              <MenuItem
                title={t('settingsServer')}
                link="/settings/server"
                icon={<StorageIcon />}
                selected={location.pathname === '/settings/server'}
              />
            )}
            {commonUser && (
              <MenuItem
                title={t('settingsUsers')}
                link="/settings/users"
                icon={<PeopleIcon />}
                selected={location.pathname.startsWith('/settings/user') && location.pathname !== `/settings/user/${userId}`}
              />
            )}
          </List>
        </>
      )}
    </>
  );
};

export default SettingsMenu;
