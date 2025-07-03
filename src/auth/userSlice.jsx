import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiRequest from "../utils/apiRequest";

export const fetchCredits = createAsyncThunk(
  "user/fetchCredits",
  async (_, { getState }) => {
    const state = getState();
    const token = state.auth.userToken;
    const Hash = state.auth.userInfo?.profile?.client?.[0]?.hash;

    if (token && Hash) {
      const response = await apiRequest(
        "get",
        "/user/fetch-credits",
        null,
        token,
        {
          "x-auth-token": Hash,
        }
      );
      return response.data;
    }
    return null;
  }
);

const initialState = {
  creditsInfo: null,
  status: "idle",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserCredits: (state) => {
        state.creditsInfo = null;
        state.status = "idle";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCredits.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCredits.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.creditsInfo = action.payload;
      })
      .addCase(fetchCredits.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { clearUserCredits } = userSlice.actions;

export default userSlice.reducer;