import { createSlice } from '@reduxjs/toolkit';

const networkStateSlice = createSlice({
    name: 'NETWORK_STATE',
    initialState: { value: false },
    reducers: {
        setNetworkConnectionStatus: (state, action) => {
            state.value = action.payload
        }
    },
});

export const { setNetworkConnectionStatus } = networkStateSlice.actions;

export default networkStateSlice.reducer;