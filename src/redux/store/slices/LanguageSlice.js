import { createSlice } from "@reduxjs/toolkit";

const languageSlice = createSlice({
    name: "language",
    initialState: {
        languageCode: null,
        languageName: null,
        languageId: null,
    },
    reducers: {
        setLanguage: (state, action) => {
            state.languageCode = action.payload.languageCode;
            state.languageName = action.payload.languageName;
            state.languageId = action.payload.languageId;
        },
    },
});

// Export actions
export const { setLanguage } = languageSlice.actions;

export const getLangaugeDetails = (state) => state.language;


// Export reducer
export default languageSlice.reducer;