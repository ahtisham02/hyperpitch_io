import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "../auth/authSlice";
import userReducer from '../auth/userSlice';

const authPersistConfig = {
  key: "auth",
  storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const rootReducer = {
  auth: persistedAuthReducer,
  user: userReducer,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export const persistor = persistStore(store);