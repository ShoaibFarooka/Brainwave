import { createSlice } from "@reduxjs/toolkit";

const subscriptionDataSlice = createSlice({
  name: "subscription",
  initialState: {
    subscriptionData: null,
  },
  reducers: {
    SetSubscriptionData: (state, action) => {
      state.subscriptionData = action.payload;
    },
  },
});

export const { SetSubscriptionData } = subscriptionDataSlice.actions;
export default subscriptionDataSlice.reducer;
