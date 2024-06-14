import React, { Suspense, lazy, useState } from 'react';
import {
  Route, Routes, useLocation, useNavigate,
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LinearProgress } from '@mui/material';
import Loading from './common/components/Loading';
import useQuery from './common/util/useQuery';
import { useEffectAsync } from './reactHelper';
import { devicesActions } from './store';
import App from './App';

const CombinedReportPage = lazy(() => import('./reports/CombinedReportPage'));
const RouteReportPage = lazy(() => import('./reports/NewRouteReportPage'));
const ServerPage = lazy(() => import('./settings/ServerPage'));
const UsersPage = lazy(() => import('./settings/UsersPage'));
const DevicePage = lazy(() => import('./settings/DevicePage'));
const UserPage = lazy(() => import('./settings/UserPage'));
const NotificationsPage = lazy(() => import('./settings/NotificationsPage'));
const NotificationPage = lazy(() => import('./settings/NotificationPage'));
const GroupsPage = lazy(() => import('./settings/GroupsPage'));
const GroupPage = lazy(() => import('./settings/GroupPage'));
const PositionPage = lazy(() => import('./other/PositionPage'));
const NetworkPage = lazy(() => import('./other/NetworkPage'));
const EventReportPage = lazy(() => import('./reports/EventReportPage'));
const ReplayPage = lazy(() => import('./other/ReplayPage'));
const TripReportPage = lazy(() => import('./reports/TripReportPage'));
const StopReportPage = lazy(() => import('./reports/StopReportPage'));
const SummaryReportPage = lazy(() => import('./reports/SummaryReportPage'));
const ChartReportPage = lazy(() => import('./reports/ChartReportPage'));
const DriversPage = lazy(() => import('./settings/DriversPage'));
const DriverPage = lazy(() => import('./settings/DriverPage'));
const CalendarsPage = lazy(() => import('./settings/CalendarsPage'));
const CalendarPage = lazy(() => import('./settings/CalendarPage'));
const ComputedAttributesPage = lazy(() => import('./settings/ComputedAttributesPage'));
const ComputedAttributePage = lazy(() => import('./settings/ComputedAttributePage'));
const MaintenancesPage = lazy(() => import('./settings/MaintenancesPage'));
const MaintenancePage = lazy(() => import('./settings/MaintenancePage'));
const CommandsPage = lazy(() => import('./settings/CommandsPage'));
const CommandPage = lazy(() => import('./settings/CommandPage'));
const StatisticsPage = lazy(() => import('./reports/StatisticsPage'));
const LoginPage = lazy(() => import('./login/LoginPage'));
const RegisterPage = lazy(() => import('./login/RegisterPage'));
const ResetPasswordPage = lazy(() => import('./login/ResetPasswordPage'));
const GeofencesPage = lazy(() => import('./other/GeofencesPage'));
const GeofencePage = lazy(() => import('./settings/GeofencePage'));
const EventPage = lazy(() => import('./other/EventPage'));
const PreferencesPage = lazy(() => import('./settings/PreferencesPage'));
const AccumulatorsPage = lazy(() => import('./settings/AccumulatorsPage'));
const CommandDevicePage = lazy(() => import('./settings/CommandDevicePage'));
const CommandGroupPage = lazy(() => import('./settings/CommandGroupPage'));
const ChangeServerPage = lazy(() => import('./other/ChangeServerPage'));
const DevicesPage = lazy(() => import('./settings/DevicesPage'));
const ScheduledPage = lazy(() => import('./reports/ScheduledPage'));
const DeviceConnectionsPage = lazy(() => import('./settings/DeviceConnectionsPage'));
const GroupConnectionsPage = lazy(() => import('./settings/GroupConnectionsPage'));
const UserConnectionsPage = lazy(() => import('./settings/UserConnectionsPage'));
const SchedulesPage = lazy(() => import('./settings/SchedulesPage'));
const SchedulePage = lazy(() => import('./settings/SchedulePage'));
const SectionsPage = lazy(() => import('./settings/SectionsPages'));
const SectionPage = lazy(() => import('./settings/SectionPage'));
const HoursPage = lazy(() => import('./settings/HoursPage'));
const HourPage = lazy(() => import('./settings/HourPage'));
const ScheduleConnectionsPage = lazy(() => import('./settings/ScheduleConnectionsPage'));
const DeviceConnectionGroupPage = lazy(() => import('./settings/DeviceConnectionGroupPage'));
const TicketReportPage = lazy(() => import('./reports/TicketReportPage'));
const HelpPage = lazy(() => import('./other/HelpPage'));
const ExitsPage = lazy(() => import('./settings/ExitsPage'));
const VueltaReportPage = lazy(() => import('./reports/VueltaReportPage'));
const HojaSalidaReportPage = lazy(() => import('./reports/HojaSalidas'));
const ExcusesPage = lazy(() => import('./settings/ExcusesPage'));
const ExcusePage = lazy(() => import('./settings/ExcusePage'));
const SalidasActivas = lazy(() => import('./reports/SalidasActivas'));
const MainPage = lazy(() => import('./main/MainPage'));

const Navigation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [redirectsHandled, setRedirectsHandled] = useState(false);

  const { pathname } = useLocation();
  const query = useQuery();

  useEffectAsync(async () => {
    if (query.get('token')) {
      const token = query.get('token');
      await fetch(`/api/session?token=${encodeURIComponent(token)}`);
      navigate(pathname);
    } else if (query.get('deviceId')) {
      const deviceId = query.get('deviceId');
      const response = await fetch(`/api/devices?uniqueId=${deviceId}`);
      if (response.ok) {
        const items = await response.json();
        if (items.length > 0) {
          dispatch(devicesActions.selectId(items[0].id));
        }
      } else {
        throw Error(await response.text());
      }
      navigate('/');
    } else if (query.get('eventId')) {
      const eventId = parseInt(query.get('eventId'), 10);
      navigate(`/event/${eventId}`);
    } else {
      setRedirectsHandled(true);
    }
  }, [query]);

  if (!redirectsHandled) {
    return (<LinearProgress />);
  }
  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={<Loading type="08" />}><LoginPage /></Suspense>} />
      <Route path="/register" element={<Suspense fallback={<Loading type="08" />}><RegisterPage /></Suspense>} />
      <Route path="/reset-password" element={<Suspense fallback={<Loading type="08" />}><ResetPasswordPage /></Suspense>} />
      <Route path="/change-server" element={<Suspense fallback={<Loading type="08" />}><ChangeServerPage /></Suspense>} />
      <Route path="/" element={<App />}>
        <Route index element={<Suspense fallback={<Loading type="08" />}><MainPage /></Suspense>} />

        <Route path="position/:id" element={<Suspense fallback={<Loading type="08" />}><PositionPage /></Suspense>} />
        <Route path="network/:positionId" element={<Suspense fallback={<Loading type="08" />}><NetworkPage /></Suspense>} />
        <Route path="event/:id" element={<Suspense fallback={<Loading type="08" />}><EventPage /></Suspense>} />
        <Route path="replay" element={<Suspense fallback={<Loading type="08" />}><ReplayPage /></Suspense>} />
        <Route path="geofences" element={<Suspense fallback={<Loading type="08" />}><GeofencesPage /></Suspense>} />
        <Route path="help" element={<Suspense fallback={<Loading type="08" />}><HelpPage /></Suspense>} />

        <Route path="settings">
          <Route path="accumulators/:deviceId" element={<Suspense fallback={<Loading type="08" />}><AccumulatorsPage /></Suspense>} />
          <Route path="calendars" element={<Suspense fallback={<Loading type="08" />}><CalendarsPage /></Suspense>} />
          <Route path="calendar/:id" element={<Suspense fallback={<Loading type="08" />}><CalendarPage /></Suspense>} />
          <Route path="calendar" element={<Suspense fallback={<Loading type="08" />}><CalendarPage /></Suspense>} />
          <Route path="commands" element={<Suspense fallback={<Loading type="08" />}><CommandsPage /></Suspense>} />
          <Route path="command/:id" element={<Suspense fallback={<Loading type="08" />}><CommandPage /></Suspense>} />
          <Route path="command" element={<Suspense fallback={<Loading type="08" />}><CommandPage /></Suspense>} />
          <Route path="attributes" element={<Suspense fallback={<Loading type="08" />}><ComputedAttributesPage /></Suspense>} />
          <Route path="attribute/:id" element={<Suspense fallback={<Loading type="08" />}><ComputedAttributePage /></Suspense>} />
          <Route path="attribute" element={<Suspense fallback={<Loading type="08" />}><ComputedAttributePage /></Suspense>} />
          <Route path="devices" element={<Suspense fallback={<Loading type="08" />}><DevicesPage /></Suspense>} />
          <Route path="device/:id/connections" element={<Suspense fallback={<Loading type="08" />}><DeviceConnectionsPage /></Suspense>} />
          <Route path="device/:id/groups" element={<Suspense fallback={<Loading type="08" />}><DeviceConnectionGroupPage /></Suspense>} />
          <Route path="device/:id/command" element={<Suspense fallback={<Loading type="08" />}><CommandDevicePage /></Suspense>} />
          <Route path="device/:id" element={<Suspense fallback={<Loading type="08" />}><DevicePage /></Suspense>} />
          <Route path="device" element={<Suspense fallback={<Loading type="08" />}><DevicePage /></Suspense>} />
          <Route path="drivers" element={<Suspense fallback={<Loading type="08" />}><DriversPage /></Suspense>} />
          <Route path="driver/:id" element={<Suspense fallback={<Loading type="08" />}><DriverPage /></Suspense>} />
          <Route path="driver" element={<Suspense fallback={<Loading type="08" />}><DriverPage /></Suspense>} />
          <Route path="geofence/:id" element={<Suspense fallback={<Loading type="08" />}><GeofencePage /></Suspense>} />
          <Route path="geofence" element={<Suspense fallback={<Loading type="08" />}><GeofencePage /></Suspense>} />
          <Route path="groups" element={<Suspense fallback={<Loading type="08" />}><GroupsPage /></Suspense>} />
          <Route path="group/:id/connections" element={<Suspense fallback={<Loading type="08" />}><GroupConnectionsPage /></Suspense>} />
          <Route path="group/:id/command" element={<Suspense fallback={<Loading type="08" />}><CommandGroupPage /></Suspense>} />
          <Route path="group/:id" element={<Suspense fallback={<Loading type="08" />}><GroupPage /></Suspense>} />
          <Route path="group" element={<Suspense fallback={<Loading type="08" />}><GroupPage /></Suspense>} />
          <Route path="maintenances" element={<Suspense fallback={<Loading type="08" />}><MaintenancesPage /></Suspense>} />
          <Route path="maintenance/:id" element={<Suspense fallback={<Loading type="08" />}><MaintenancePage /></Suspense>} />
          <Route path="maintenance" element={<Suspense fallback={<Loading type="08" />}><MaintenancePage /></Suspense>} />
          <Route path="notifications" element={<Suspense fallback={<Loading type="08" />}><NotificationsPage /></Suspense>} />
          <Route path="notification/:id" element={<Suspense fallback={<Loading type="08" />}><NotificationPage /></Suspense>} />
          <Route path="notification" element={<Suspense fallback={<Loading type="08" />}><NotificationPage /></Suspense>} />
          <Route path="preferences" element={<Suspense fallback={<Loading type="08" />}><PreferencesPage /></Suspense>} />
          <Route path="server" element={<Suspense fallback={<Loading type="08" />}><ServerPage /></Suspense>} />
          <Route path="users" element={<Suspense fallback={<Loading type="08" />}><UsersPage /></Suspense>} />
          <Route path="user/:id/connections" element={<Suspense fallback={<Loading type="08" />}><UserConnectionsPage /></Suspense>} />
          <Route path="user/:id" element={<Suspense fallback={<Loading type="08" />}><UserPage /></Suspense>} />
          <Route path="user" element={<Suspense fallback={<Loading type="08" />}><UserPage /></Suspense>} />
          <Route path="schedules" element={<Suspense fallback={<Loading type="08" />}><SchedulesPage /></Suspense>} />
          <Route path="schedule/:id" element={<Suspense fallback={<Loading type="08" />}><SchedulePage /></Suspense>} />
          <Route path="schedule/:id/connections" element={<Suspense fallback={<Loading type="08" />}><ScheduleConnectionsPage /></Suspense>} />
          <Route path="schedule" element={<Suspense fallback={<Loading type="08" />}><SchedulePage /></Suspense>} />
          <Route path="sections" element={<Suspense fallback={<Loading type="08" />}><SectionsPage /></Suspense>} />
          <Route path="section/:id" element={<Suspense fallback={<Loading type="08" />}><SectionPage /></Suspense>} />
          <Route path="section" element={<Suspense fallback={<Loading type="08" />}><SectionPage /></Suspense>} />
          <Route path="hours" element={<Suspense fallback={<Loading type="08" />}><HoursPage /></Suspense>} />
          <Route path="hour" element={<Suspense fallback={<Loading type="08" />}><HourPage /></Suspense>} />
          <Route path="hour/:horas" element={<Suspense fallback={<Loading type="08" />}><HourPage /></Suspense>} />
          <Route path="exits" element={<Suspense fallback={<Loading type="08" />}><ExitsPage /></Suspense>} />
          <Route path="excuses" element={<Suspense fallback={<Loading type="08" />}><ExcusesPage /></Suspense>} />
          <Route path="excuse/:id" element={<Suspense fallback={<Loading type="08" />}><ExcusePage /></Suspense>} />
          <Route path="excuse" element={<Suspense fallback={<Loading type="08" />}><ExcusePage /></Suspense>} />
        </Route>

        <Route path="reports">
          <Route path="combined" element={<Suspense fallback={<Loading type="08" />}><CombinedReportPage /></Suspense>} />
          <Route path="chart" element={<Suspense fallback={<Loading type="08" />}><ChartReportPage /></Suspense>} />
          <Route path="event" element={<Suspense fallback={<Loading type="08" />}><EventReportPage /></Suspense>} />
          <Route path="route" element={<Suspense fallback={<Loading type="08" />}><RouteReportPage /></Suspense>} />
          {/* <Route path="route" element={<ReplayPage />} /> */}
          <Route path="stop" element={<Suspense fallback={<Loading type="08" />}><StopReportPage /></Suspense>} />
          <Route path="summary" element={<Suspense fallback={<Loading type="08" />}><SummaryReportPage /></Suspense>} />
          <Route path="trip" element={<Suspense fallback={<Loading type="08" />}><TripReportPage /></Suspense>} />
          <Route path="scheduled" element={<Suspense fallback={<Loading type="08" />}><ScheduledPage /></Suspense>} />
          <Route path="statistics" element={<Suspense fallback={<Loading type="08" />}><StatisticsPage /></Suspense>} />
          <Route path="tickets" element={<Suspense fallback={<Loading type="08" />}><TicketReportPage /></Suspense>} />
          <Route path="salidas" element={<Suspense fallback={<Loading type="08" />}><VueltaReportPage /></Suspense>} />
          <Route path="hojasalidas" element={<Suspense fallback={<Loading type="08" />}><HojaSalidaReportPage /></Suspense>} />
          <Route path="salidas_activas" element={<Suspense fallback={<Loading type="08" />}><SalidasActivas /></Suspense>} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Navigation;
