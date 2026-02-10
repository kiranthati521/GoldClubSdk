import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  count: 0, // should be a number ideally
};

const updateCountofflineSlice = createSlice({
  name: 'updateCountoffline',
  initialState,
  reducers: {
    setUpdateOfflineCount(state, action) {
      state.count = action.payload;
    },
  },
});

export const { setUpdateOfflineCount } = updateCountofflineSlice.actions;
export default updateCountofflineSlice.reducer;
