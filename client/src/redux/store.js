import { configureStore,combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import videoReducer from "./videoSlice"
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

// Configure persist settings
const persistConfig = {
  key: 'root',
  storage,
};

// const rootReducer = combineReducers({ user: authReducer, video: videoReducer });


// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, authReducer);

// Configure the store with the persisted reducer
export const store = configureStore({
  reducer: {
    auth: persistedReducer,
  },
});

// Create the persistor
export const persistor = persistStore(store);
