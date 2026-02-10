import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: {},
};

export const companyStylesSlice = createSlice({
  name: "COMPANY_STYLES",
  initialState,
  reducers: {
    updateCompanyStyles: (state, action) => {
      console.log("Updating company styles with:", action.payload);
        state.value = action.payload
      }
  },
})

// Action creators are generated for each case reducer function

export const { updateCompanyStyles } = companyStylesSlice.actions

export const getCompanyStyles = (state) => state.COMPANY_STYLES

export default companyStylesSlice.reducer

