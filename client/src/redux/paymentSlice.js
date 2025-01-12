import { createSlice } from "@reduxjs/toolkit";

const paymentsSlice = createSlice({
  name: "payments",
  initialState: {
    paymentStatus: "no payment",
  },
  reducers: {
    SetPaymentStatus: (state, action) => {
      state.paymentStatus = action.payload;
    },
  },
});

export const { SetPaymentStatus } = paymentsSlice.actions;
export default paymentsSlice.reducer;