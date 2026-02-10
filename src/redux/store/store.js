// import { configureStore, createSlice } from '@reduxjs/toolkit';
// import UserSlice from './slices/UserSlice';
// import mobileNumberSlice from './slices/mobileNumberSlice';
// import NetworkSlice from './slices/NetworkSlice';
// import companyStylesSlice from './slices/CompanyStyleSlice';

// const store = configureStore({
//     reducer: {
//         mobileNumber: mobileNumberSlice,
//         user: UserSlice,
//         networkStatus: NetworkSlice,
//         COMPANY_STYLES: companyStylesSlice
//     }
// });

// export default store;

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserSlice from './slices/UserSlice';
import locationSlice from './slices/locationSlice';
import languageSlice from './slices/LanguageSlice'
import mobileNumberSlice from './slices/mobileNumberSlice';
import NetworkSlice from './slices/NetworkSlice';
import companyStylesSlice from './slices/CompanyStyleSlice';
import UpdatedReatilerInfoDataSlice from './slices/UpdatedReatilerInfoDataSlice';
import updateCountofflineSlice from './slices/updateCountofflineSlice';

// 🔹 Redux Persist Configurations
const userPersistConfig = {
  key: 'user',
  storage: AsyncStorage,  // Persist user data
};

const companyStylesPersistConfig = {
  key: 'companyStyles',
  storage: AsyncStorage,  // Persist company styles
};

const updatedRetailerPersistConfig = {
  key: 'updatedRetailerInfoData',
  storage: AsyncStorage,  // Persist company styles
};

const locationConfig = {
  key: "root",
  storage: AsyncStorage, // Using AsyncStorage for persistence
};

const languageConfig = {
  key: "languageSet",
  storage: AsyncStorage,
};

// 🔹 Persisted Reducers
const persistedUserReducer = persistReducer(userPersistConfig, UserSlice);
const persistedCompanyStylesReducer = persistReducer(companyStylesPersistConfig, companyStylesSlice);
const persistedUpdatedRetailerInfoReducer = persistReducer(updatedRetailerPersistConfig, UpdatedReatilerInfoDataSlice);

// 🔹 Combine Reducers
const rootReducer = combineReducers({
  user: persistedUserReducer, // Persisted user state
  mobileNumber: mobileNumberSlice,
  offlineCount: updateCountofflineSlice, 
  networkStatus: NetworkSlice,
  COMPANY_STYLES: persistedCompanyStylesReducer, // Persisted company styles
  updated_retailerinfo_data: persistedUpdatedRetailerInfoReducer,
  location: persistReducer(locationConfig, locationSlice),
  language: persistReducer(languageConfig, languageSlice),
})

// 🔹 Create Store
const store = configureStore({
  reducer: rootReducer,
});

export const persistor = persistStore(store);

export default store;
