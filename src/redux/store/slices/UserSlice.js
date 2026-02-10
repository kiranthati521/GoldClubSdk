// userSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    id: '',
    proprietorName:'',
    firmName: '',
    roleName: '',
    deviceToken: '',
    mobileNumber: '',
    profilePic: '',
    stateName: '',
    districtName: '',
    pincode: '',
    fcmToken: '',
    userMenuControl: {
    },
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            return action.payload;
        },
    },
});

export const { setUser } = userSlice.actions;

export const selectUser = (state) => state.user;

export default userSlice.reducer;
