import React from 'react';
import {
  Divider, List, ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material';
import { useSelector } from 'react-redux';
// import StarIcon from '@mui/icons-material/Star';
import TimelineIcon from '@mui/icons-material/Timeline';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import {
  AirplaneTicketOutlined, ScreenLockLandscapeOutlined, TimeToLeaveOutlined, TripOriginOutlined,
} from '@mui/icons-material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import RouteIcon from '@mui/icons-material/Route';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useAdministrator, useRestriction } from '../../common/util/permissions';

const MenuItem = ({
  title, link, icon, selected,
}) => (
  <ListItemButton key={link} component={Link} to={link} selected={selected}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={title} />
  </ListItemButton>
);

const ReportsMenu = () => {
  const t = useTranslation();
  const location = useLocation();

  const admin = useAdministrator();
  const readonly = useRestriction('readonly');
  const user = useSelector((state) => state.session.user);

  return (
    <>
      <List id="lst-reports">
        {/* <MenuItem
          title={t('reportCombined')}
          link="/reports/combined"
          icon={<StarIcon />}
          selected={location.pathname === '/reports/combined'}
        /> */}
        <MenuItem
          title={t('reportRoute')}
          link="/reports/route"
          icon={<TimelineIcon />}
          selected={location.pathname === '/reports/route'}
        />
        <MenuItem
          title={t('reportEvents')}
          link="/reports/event"
          icon={<NotificationsActiveIcon />}
          selected={location.pathname === '/reports/event'}
        />
        <MenuItem
          title={t('reportTrips')}
          link="/reports/trip"
          icon={<PlayCircleFilledIcon />}
          selected={location.pathname === '/reports/trip'}
        />
        <MenuItem
          title={t('reportStops')}
          link="/reports/stop"
          icon={<PauseCircleFilledIcon />}
          selected={location.pathname === '/reports/stop'}
        />
        <MenuItem
          title={t('reportSummary')}
          link="/reports/summary"
          icon={<FormatListBulletedIcon />}
          selected={location.pathname === '/reports/summary'}
        />
        <MenuItem
          title={t('reportChart')}
          link="/reports/chart"
          icon={<TrendingUpIcon />}
          selected={location.pathname === '/reports/chart'}
        />
        <MenuItem
          title={t('reportReplay')}
          link="/replay"
          icon={<RouteIcon />}
        />
        {user.attributes.hasOwnProperty('Transporte') &&
          user.attributes.Transporte &&
          (
            <>
              <MenuItem
                title={t('reportTicket')}
                link="/reports/tickets"
                icon={<AirplaneTicketOutlined />}
              />
              <MenuItem
                title={t('reportSalidas')}
                link="/reports/salidas"
                icon={<TripOriginOutlined />}
              />
            </>
          )}
        {user.attributes.hasOwnProperty('Transporte') &&
          user.attributes.Transporte && user.attributes.hasOwnProperty('vp') &&
          user.attributes.vp &&
          (

            <MenuItem
              title={t('reportHojaSalidas')}
              link="/reports/hojasalidas"
              icon={<TimeToLeaveOutlined />}
            />

          )}

        {user.attributes.hasOwnProperty('Transporte') &&
          user.attributes.Transporte &&
          (

            <MenuItem
              title="Vista salidas activas"
              link="/reports/salidas_activas"
              icon={<ScreenLockLandscapeOutlined />}
            />
          )}

      </List>
      {(admin || !readonly) && (
        <>
          <Divider />
          <List>
            <MenuItem
              title={t('reportScheduled')}
              link="/reports/scheduled"
              icon={<EventRepeatIcon />}
            />
            {admin && (
              <MenuItem
                title={t('statisticsTitle')}
                link="/reports/statistics"
                icon={<BarChartIcon />}
                selected={location.pathname === '/reports/statistics'}
              />
            )}
          </List>
        </>
      )}
    </>
  );
};

export default ReportsMenu;
