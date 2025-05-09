import { createSlice } from '@reduxjs/toolkit';

const { reducer, actions } = createSlice({
  name: 'modals',
  initialState: {
    items: {
      showModalManualExits: false,
    },
  },
  reducers: {
    update(state, action) {
      Object.keys(action.payload).forEach((k) => {
        state.items[k] = action.payload[k];
      });
    },
  },
});

export { actions as modalsActions, reducer as modalsReducer };
