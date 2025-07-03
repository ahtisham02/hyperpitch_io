import { createSlice } from "@reduxjs/toolkit";

const getTokenFromStorage = () => {
  try {
    return localStorage.getItem("userToken");
  } catch (e) {
    console.error("Could not access localStorage", e);
    return null;
  }
};

const initialState = {
  loading: false,
  userInfo: {},
  userToken: getTokenFromStorage(),
  error: null,
  isAuthenticated: !!getTokenFromStorage(),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      const { token, data } = action.payload;
      state.loading = false;
      state.isAuthenticated = !!token;
      state.userInfo = data;
      state.userToken = token || null;
      if (token) {
        localStorage.setItem("userToken", token);
      } else {
        localStorage.removeItem("userToken");
      }
    },
    removeUserInfo: (state) => {
      state.userInfo = {};
      state.userToken = null;
      state.loading = false;
      state.isAuthenticated = false;
      localStorage.removeItem("userToken");
    },
    updateUserProfile: (state, action) => {
      if (state.userInfo) {
        state.userInfo.profile = action.payload;
      }
    },
  },
});

export const { setUserInfo, removeUserInfo, updateUserProfile } =
  authSlice.actions;

export default authSlice.reducer;