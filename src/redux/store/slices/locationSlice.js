import { createSlice } from '@reduxjs/toolkit';

const locationSlice = createSlice({
  name: "location",
  initialState: {
    latitude: null,
    longitude: null,
    latti: null,
    longi: null,
  },
  reducers: {
    setLocation(state, action) {
      const { latitude, longitude, latti, longi } = action.payload;

      const finalLat = latitude ?? latti ?? null;
      const finalLong = longitude ?? longi ?? null;

      state.latitude = finalLat;
      state.longitude = finalLong;
      state.latti = finalLat;
      state.longi = finalLong;
    },

    clearLocation(state) {
      state.latitude = null;
      state.longitude = null;
      state.latti = null;
      state.longi = null;
    },
  },
});

export const { setLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
