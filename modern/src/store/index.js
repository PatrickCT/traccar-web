import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { calendarsReducer as calendars } from './calendars';
import { devicesReducer as devices } from './devices';
import { driversReducer as drivers } from './drivers';
import { errorsReducer as errors } from './errors';
import { eventsReducer as events } from './events';
import { geofencesReducer as geofences } from './geofences';
import { groupsReducer as groups } from './groups';
import { maintenancesReducer as maintenances } from './maintenances';
import { modalsReducer as modals } from './modals';
import { reportsReducer as reports } from './reports';
import { schedulesReducer as schedules } from './schedules';
import { sessionReducer as session } from './session';
import { subroutesReducer as subroutes } from './subroutes';
import throttleMiddleware from './throttleMiddleware';

const reducer = combineReducers({
  errors,
  session,
  devices,
  events,
  geofences,
  groups,
  drivers,
  maintenances,
  calendars,
  reports,
  subroutes,
  modals,
  schedules,
});

export { calendarsActions } from './calendars';
export { devicesActions } from './devices';
export { driversActions } from './drivers';
export { errorsActions } from './errors';
export { eventsActions } from './events';
export { geofencesActions } from './geofences';
export { groupsActions } from './groups';
export { maintenancesActions } from './maintenances';
export { modalsActions } from './modals';
export { reportsActions } from './reports';
export { schedulesActions } from './schedules';
export { sessionActions } from './session';
export { subroutesActions } from './subroutes';
export default configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(throttleMiddleware),
});
