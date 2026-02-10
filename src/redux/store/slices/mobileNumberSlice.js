
import { createSlice } from '@reduxjs/toolkit'
import { MOBILE_NUMBER } from '../../../assets/Utils/Utils'

const initialState = {
  value: '',
}

export const mobileNumber = createSlice({
  name: MOBILE_NUMBER,
  initialState,
  reducers: {
    updateMobileNumber: (state, action) => {
        state.value = action.payload
      }
  },
})

// Action creators are generated for each case reducer function

export const { updateMobileNumber } = mobileNumber.actions

export const getMobileNumber = (state) => state.mobileNumber.value

export default mobileNumber.reducer

